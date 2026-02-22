# Database Architecture

## System Overview

```
┌─────────────┐
│   iOS App   │
└──────┬──────┘
       │ HTTP/SSE
       ▼
┌─────────────────────────────────────────┐
│         Express.js API Server           │
│  ┌───────────────────────────────────┐  │
│  │     Chat Routes (/api/chat)       │  │
│  │  - POST /message                  │  │
│  │  - GET /conversations             │  │
│  │  - POST /conversations            │  │
│  │  - GET /conversations/:id         │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │      Query Functions Layer        │  │
│  │  - conversations.ts               │  │
│  │  - messages.ts                    │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │       Drizzle ORM Client          │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼───────────────────────┘
                   │ PostgreSQL Protocol
                   ▼
        ┌──────────────────────┐
        │  Supabase PostgreSQL │
        │  ┌────────────────┐  │
        │  │ conversations  │  │
        │  │ messages       │  │
        │  └────────────────┘  │
        └──────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────┐
│         conversations               │
├─────────────────────────────────────┤
│ id            UUID PK                │
│ user_id       TEXT          ◄─┐     │
│ trip_id       UUID           │ │     │
│ title         TEXT           │ │     │
│ created_at    TIMESTAMPTZ    │ │     │
│ updated_at    TIMESTAMPTZ    │ │     │
├─────────────────────────────────────┤
│ Indexes:                            │
│  - user_id                          │
│  - updated_at                       │
└──────────────┬──────────────────────┘
               │ 1:N
               │ ON DELETE CASCADE
               ▼
┌─────────────────────────────────────┐
│            messages                 │
├─────────────────────────────────────┤
│ id              UUID PK              │
│ conversation_id UUID FK              │
│ role            TEXT (enum)          │
│ content         TEXT                 │
│ created_at      TIMESTAMPTZ          │
├─────────────────────────────────────┤
│ Indexes:                            │
│  - (conversation_id, created_at)    │
└─────────────────────────────────────┘
```

## Data Flow: Send Message

```
1. Client Request
   POST /api/chat/message
   { userId, message, conversationId? }

2. API Layer (chat.ts)
   ├─▶ Validate userId, message
   ├─▶ Create conversation if needed
   │   └─▶ createConversation(userId)
   │       └─▶ INSERT INTO conversations
   │
   ├─▶ Store user message
   │   └─▶ createMessage(convId, 'user', message)
   │       └─▶ INSERT INTO messages
   │
   ├─▶ Load conversation history
   │   └─▶ getConversationHistory(convId, 20)
   │       └─▶ SELECT * FROM messages
   │           WHERE conversation_id = ?
   │           ORDER BY created_at DESC
   │           LIMIT 20
   │
   ├─▶ Stream AI response (OpenAI)
   │   └─▶ SSE: start, token, token, ...
   │
   ├─▶ Store assistant message
   │   └─▶ createMessage(convId, 'assistant', response)
   │       └─▶ INSERT INTO messages
   │
   ├─▶ Update conversation timestamp
   │   └─▶ updateConversationTimestamp(convId)
   │       └─▶ UPDATE conversations
   │           SET updated_at = NOW()
   │
   ├─▶ Generate title (if first message)
   │   └─▶ getMessageCount(convId)
   │       └─▶ SELECT COUNT(*) FROM messages
   │   └─▶ updateConversationTitle(convId, title)
   │       └─▶ UPDATE conversations
   │           SET title = ?
   │
   └─▶ SSE: done { messageId, conversationId }
```

## Data Flow: List Conversations

```
1. Client Request
   GET /api/chat/conversations?userId=X&limit=20&offset=0

2. API Layer (chat.ts)
   └─▶ getConversationsByUserId(userId, limit, offset)
       └─▶ SELECT * FROM conversations
           WHERE user_id = ?
           ORDER BY updated_at DESC
           LIMIT ? + 1
           OFFSET ?

3. Response
   {
     conversations: [...],
     hasMore: boolean
   }
```

## Data Flow: Get Conversation

```
1. Client Request
   GET /api/chat/conversations/:id?userId=X

2. API Layer (chat.ts)
   ├─▶ getConversationById(id, userId)
   │   └─▶ SELECT * FROM conversations
   │       WHERE id = ?
   │   └─▶ Verify userId matches
   │       (throws 'Access denied' if mismatch)
   │
   └─▶ getMessagesByConversationId(id)
       └─▶ SELECT * FROM messages
           WHERE conversation_id = ?
           ORDER BY created_at ASC

3. Response
   {
     conversation: {...},
     messages: [...]
   }
```

## Query Functions Layer

### conversations.ts
```typescript
┌─ createConversation(userId, tripId?)
│  └─▶ INSERT → returns Conversation
│
├─ getConversationsByUserId(userId, limit, offset)
│  └─▶ SELECT → returns { conversations, hasMore }
│
├─ getConversationById(id, userId)
│  └─▶ SELECT → returns Conversation | null
│  └─▶ Throws if access denied
│
├─ updateConversationTimestamp(id)
│  └─▶ UPDATE updated_at
│
└─ updateConversationTitle(id, title)
   └─▶ UPDATE title
```

### messages.ts
```typescript
┌─ createMessage(conversationId, role, content)
│  └─▶ INSERT → returns Message
│
├─ getMessagesByConversationId(conversationId, limit?)
│  └─▶ SELECT → returns Message[]
│
├─ getConversationHistory(conversationId, limit)
│  └─▶ SELECT DESC → reverse → format for OpenAI
│  └─▶ returns { role, content }[]
│
└─ getMessageCount(conversationId)
   └─▶ SELECT COUNT → returns number
```

## Technology Stack

```
┌────────────────────────────────────────┐
│           Application Layer            │
│  - Express.js (REST + SSE)             │
│  - TypeScript                          │
│  - Vercel AI SDK (OpenAI streaming)    │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│            ORM Layer                   │
│  - Drizzle ORM                         │
│  - Type-safe queries                   │
│  - Migration management                │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│          Database Driver               │
│  - postgres (node-postgres)            │
│  - Connection pooling                  │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│         Database Layer                 │
│  - Supabase PostgreSQL                 │
│  - ACID transactions                   │
│  - Indexes for performance             │
└────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│          Client Request                 │
│  { userId: "user-123", ... }            │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Validation Layer                │
│  - Check userId exists                  │
│  - Validate required fields             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Authorization Layer                │
│  - Verify conversation ownership        │
│  - getConversationById checks userId    │
│  - Returns 403 if mismatch              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Database Layer                  │
│  - Row-level access control             │
│  - Cascade deletes                      │
│  - Foreign key constraints              │
└─────────────────────────────────────────┘
```

## Performance Optimizations

### Indexes
```sql
-- Fast conversation lookup by user
CREATE INDEX conversations_user_id_idx
ON conversations(user_id);

-- Fast sorting by last activity
CREATE INDEX conversations_updated_at_idx
ON conversations(updated_at);

-- Fast message retrieval for conversation
CREATE INDEX messages_conversation_created_idx
ON messages(conversation_id, created_at);
```

### Query Optimizations
```typescript
// Pagination: Fetch N+1 to check hasMore
// Avoids separate COUNT(*) query
const results = await db
  .select()
  .limit(limit + 1);

const hasMore = results.length > limit;
const data = hasMore ? results.slice(0, -1) : results;
```

### Message History Loading
```typescript
// Load only recent messages to save memory
// and reduce token usage for AI
const history = await getConversationHistory(convId, 20);
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│            Vercel Edge                  │
│  - Serverless functions                 │
│  - Auto-scaling                         │
│  - Global CDN                           │
└────────────────┬────────────────────────┘
                 │
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────┐
│         Express.js App                  │
│  - Single instance per request          │
│  - Stateless                            │
│  - Connection pooling                   │
└────────────────┬────────────────────────┘
                 │
                 │ PostgreSQL Protocol (SSL)
                 ▼
┌─────────────────────────────────────────┐
│      Supabase PostgreSQL                │
│  - Managed database                     │
│  - Connection pooling                   │
│  - Automatic backups                    │
│  - High availability                    │
└─────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────┐
│           API Request                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Validation    │
         │ Error?        │
         └───┬───────────┘
             │ Yes → 400 Bad Request
             │ No
             ▼
         ┌───────────────┐
         │ Database      │
         │ Query         │
         └───┬───────────┘
             │
   ┌─────────┼─────────┐
   │         │         │
   ▼         ▼         ▼
  Not      Access   Success
  Found    Denied
   │         │         │
  404       403       200
```

## Message Lifecycle

```
1. User types message in iOS app
   │
   ▼
2. POST /api/chat/message
   │
   ▼
3. Store user message in DB
   │ INSERT INTO messages (role='user')
   │
   ▼
4. Load conversation history
   │ SELECT messages (last 20)
   │
   ▼
5. Stream AI response
   │ OpenAI GPT-4o
   │ SSE: token by token
   │
   ▼
6. Store assistant message
   │ INSERT INTO messages (role='assistant')
   │
   ▼
7. Update conversation timestamp
   │ UPDATE conversations.updated_at
   │
   ▼
8. Generate title (if first message)
   │ UPDATE conversations.title
   │
   ▼
9. Complete SSE stream
   │ Send done event
   │
   ▼
10. Client displays message
```

## Database Relationships

```
users (future)
  │
  │ 1:N
  ▼
conversations ◄─── trips (future)
  │             1:N
  │ 1:N
  ▼
messages
```

## Current vs Future Architecture

### Current (MVP)
- userId as TEXT (no foreign key)
- No user table
- No authentication
- Simple authorization

### Future (Production)
```
┌─────────────────────────────────────────┐
│            users                        │
│  - id (UUID)                            │
│  - email                                │
│  - auth metadata                        │
└────────────────┬────────────────────────┘
                 │ 1:N
                 ▼
┌─────────────────────────────────────────┐
│         conversations                   │
│  - user_id (FK to users)                │
└────────────────┬────────────────────────┘
                 │ 1:N
                 ▼
┌─────────────────────────────────────────┐
│           messages                      │
│  + metadata (edited, reactions)         │
└─────────────────────────────────────────┘
```

## Monitoring Points

```
Application Metrics:
- Request count per endpoint
- Response time percentiles
- Error rates by type
- SSE streaming duration

Database Metrics:
- Query execution time
- Connection pool usage
- Index hit rate
- Table sizes

Business Metrics:
- Conversations created/day
- Messages sent/day
- Active users
- Average conversation length
```
