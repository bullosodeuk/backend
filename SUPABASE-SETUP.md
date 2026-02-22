# Supabase Integration Setup Guide

This guide will help you complete the Supabase database integration for the Travlr backend.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** (gear icon in sidebar)
3. Go to **Database** section:
   - Copy the **Connection String** under "Connection string" section
   - Choose the "URI" format
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - This is your `DATABASE_URL`

4. Go to **API** section:
   - Copy **Project URL** - this is your `SUPABASE_URL`
   - Copy **anon/public key** - this is your `SUPABASE_ANON_KEY`

## Step 2: Update Environment Variables

Update your `.env` file with the credentials from Step 1:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

**Important**: Replace the placeholder values:
- `[YOUR-PASSWORD]` - Your database password
- `[PROJECT-REF]` - Your Supabase project reference ID
- `[YOUR-ANON-KEY]` - Your anon/public API key

## Step 3: Run Database Migration

The migration has already been generated. Now you need to push it to your Supabase database:

```bash
npm run db:migrate
```

This will create the following tables in your Supabase database:
- `conversations` - Stores user conversations
- `messages` - Stores messages within conversations

## Step 4: Verify Database Schema

1. Go to your Supabase dashboard
2. Click on **Table Editor** in the sidebar
3. You should see two new tables:
   - `conversations`
   - `messages`

## Step 5: Test the Integration

Start the development server:

```bash
npm run dev
```

### Test Conversation Creation

```bash
curl -X POST http://localhost:8080/api/chat/conversations \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-123"}'
```

Expected response:
```json
{
  "conversation": {
    "id": "uuid-here",
    "userId": "test-user-123",
    "tripId": null,
    "title": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Test Sending a Message

Use the existing test script:

```bash
node test-chat.js
```

This will:
1. Create a new conversation automatically if no conversationId is provided
2. Send a message
3. Store both user and assistant messages in the database
4. Stream the AI response back
5. Generate a title for the conversation based on the first message

### Test Listing Conversations

```bash
curl "http://localhost:8080/api/chat/conversations?userId=test-user-123"
```

### Test Getting a Specific Conversation

```bash
curl "http://localhost:8080/api/chat/conversations/[CONVERSATION-ID]?userId=test-user-123"
```

## Database Schema Details

### conversations table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| user_id | TEXT | User identifier (indexed) |
| trip_id | UUID | Optional trip association |
| title | TEXT | Auto-generated from first message |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp (indexed) |

### messages table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| conversation_id | UUID | Foreign key to conversations (cascade delete) |
| role | TEXT | Message role: 'user', 'assistant', or 'system' |
| content | TEXT | Message content |
| created_at | TIMESTAMPTZ | Creation timestamp (indexed with conversation_id) |

## Features Implemented

1. **Conversation Management**
   - Create new conversations
   - List user conversations with pagination
   - Get conversation details with messages
   - Automatic timestamp updates
   - Auto-generate titles from first message

2. **Message Management**
   - Store user messages before streaming
   - Store assistant responses after streaming
   - Load conversation history (last 20 messages)
   - Chronological message ordering

3. **Security**
   - User ownership verification
   - Access control (403 errors for unauthorized access)
   - Cascade deletes (messages deleted when conversation deleted)

4. **Performance**
   - Database indexes on frequently queried fields
   - Pagination support for conversation lists
   - Efficient message history loading

## API Endpoints

### POST /api/chat/message
Send a message and get streaming AI response.

**Request:**
```json
{
  "userId": "user-123",
  "message": "Plan a trip to Paris",
  "conversationId": "optional-conversation-id"
}
```

If `conversationId` is not provided, a new conversation is created automatically.

### GET /api/chat/conversations
List user conversations with pagination.

**Query Parameters:**
- `userId` (required) - User identifier
- `limit` (optional, default: 20) - Number of conversations to return
- `offset` (optional, default: 0) - Pagination offset

### POST /api/chat/conversations
Create a new conversation.

**Request:**
```json
{
  "userId": "user-123",
  "tripId": "optional-trip-id"
}
```

### GET /api/chat/conversations/:id
Get conversation details with all messages.

**Query Parameters:**
- `userId` (required) - User identifier for ownership verification

## Troubleshooting

### Migration Fails

If `npm run db:migrate` fails:

1. Check your `DATABASE_URL` is correct in `.env`
2. Ensure your database password doesn't contain special characters that need URL encoding
3. Verify you can connect to Supabase from your network (check firewall/VPN)

### Connection Errors

If you get connection errors:

1. Verify your Supabase project is not paused (free tier projects pause after inactivity)
2. Check if your IP is allowed (Supabase shouldn't block by default)
3. Ensure `DATABASE_URL` uses the correct format

### Type Errors

If you get TypeScript errors after changes:

```bash
npm run build
```

This will check for type errors in the codebase.

## Next Steps

- Implement proper user authentication (replace userId with auth tokens)
- Add message search functionality
- Implement conversation deletion endpoint
- Add message editing/deletion
- Implement conversation archiving
- Add analytics and usage tracking

## Database Management Tools

### Drizzle Studio

View and manage your database with a GUI:

```bash
npm run db:studio
```

This opens a web interface at `https://local.drizzle.studio` where you can:
- Browse tables and data
- Run queries
- Edit records
- View relationships

### Supabase Dashboard

You can also manage your database directly from the Supabase dashboard:
- Table Editor - View/edit data
- SQL Editor - Run custom queries
- Database - View schema, functions, triggers

## Support

For issues or questions:
- Check the Supabase documentation: https://supabase.com/docs
- Check the Drizzle ORM documentation: https://orm.drizzle.team
- Review the API error logs in the console
