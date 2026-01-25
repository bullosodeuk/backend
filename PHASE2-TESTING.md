# Phase 2: AI Integration - Testing Guide

## Setup

1. **Add OpenAI API Key to `.env`:**
```bash
OPENAI_API_KEY=sk-your-actual-openai-key-here
GPT_MODEL=gpt-4o
```

2. **Start the development server:**
```bash
npm run dev
```

The server should start on `http://localhost:3000`

---

## Testing the Chat Endpoints

### 1. Create a Conversation

```bash
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "tripId": null
  }'
```

**Expected Response:**
```json
{
  "conversation": {
    "id": "conv_1234567890",
    "user_id": "test-user-123",
    "trip_id": null,
    "created_at": "2026-01-21T...",
    "updated_at": "2026-01-21T..."
  }
}
```

---

### 2. Send a Message with Streaming (SSE)

```bash
curl -N -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "userId": "test-user-123",
    "message": "Plan a 3-day trip to Tokyo",
    "conversationId": "conv_1234567890"
  }'
```

**Expected Response (SSE Stream):**
```
event: start
data: {"conversationId":"conv_1234567890"}

event: token
data: {"content":"I"}

event: token
data: {"content":"'d"}

event: token
data: {"content":" be"}

... (more tokens)

event: done
data: {"messageId":"msg_1234567890","conversationId":"conv_1234567890"}
```

**Without conversationId (creates new conversation):**
```bash
curl -N -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "userId": "test-user-123",
    "message": "Hello! Can you help me plan a trip?"
  }'
```

---

### 3. List Conversations

```bash
curl "http://localhost:3000/api/chat/conversations?userId=test-user-123"
```

**Expected Response:**
```json
{
  "conversations": [],
  "hasMore": false,
  "total": 0
}
```

*Note: Currently returns empty array until database integration is complete.*

---

### 4. Get Conversation Details

```bash
curl "http://localhost:3000/api/chat/conversations/conv_1234567890?userId=test-user-123"
```

**Expected Response:**
```json
{
  "conversation": {
    "id": "conv_1234567890",
    "user_id": "test-user-123",
    "trip_id": null,
    "created_at": "2026-01-21T...",
    "updated_at": "2026-01-21T..."
  },
  "messages": []
}
```

*Note: Messages array is empty until database integration is complete.*

---

## Testing in Browser (JavaScript)

You can also test the SSE streaming in a browser console:

```javascript
const eventSource = new EventSource('http://localhost:3000/api/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'test-user-123',
    message: 'Hello!',
  })
});

eventSource.addEventListener('start', (e) => {
  console.log('Started:', JSON.parse(e.data));
});

eventSource.addEventListener('token', (e) => {
  const data = JSON.parse(e.data);
  console.log('Token:', data.content);
});

eventSource.addEventListener('done', (e) => {
  console.log('Done:', JSON.parse(e.data));
  eventSource.close();
});

eventSource.addEventListener('error', (e) => {
  console.error('Error:', e);
  eventSource.close();
});
```

---

## Testing Rate Limiting

Try sending more than 50 requests in 15 minutes:

```bash
for i in {1..60}; do
  curl -X POST http://localhost:3000/api/chat/message \
    -H "Content-Type: application/json" \
    -d '{"userId":"test","message":"test"}' &
done
```

After 50 requests, you should get:
```json
{
  "message": "Too many chat requests, please try again later"
}
```

---

## Error Cases to Test

### Missing userId:
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

**Expected:**
```json
{
  "error": "Missing required fields",
  "details": "message and userId are required"
}
```

### Missing message:
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-123"}'
```

**Expected:**
```json
{
  "error": "Missing required fields",
  "details": "message and userId are required"
}
```

### Missing OpenAI API Key:
Remove `OPENAI_API_KEY` from `.env` and restart server.

**Expected:**
```json
{
  "error": "AI service not configured"
}
```

---

## iOS Testing (Swift URLSession)

Here's example Swift code for testing from iOS:

```swift
import Foundation

func testChatStreaming() {
    let url = URL(string: "http://localhost:3000/api/chat/message")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("text/event-stream", forHTTPHeaderField: "Accept")

    let body: [String: Any] = [
        "userId": "test-user-123",
        "message": "Plan a trip to Paris"
    ]
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)

    let task = URLSession.shared.dataTask(with: request) { data, response, error in
        guard let data = data, error == nil else {
            print("Error: \\(error?.localizedDescription ?? "Unknown")")
            return
        }

        // Parse SSE stream
        let text = String(data: data, encoding: .utf8) ?? ""
        let events = text.components(separatedBy: "\\n\\n")

        for event in events {
            if event.isEmpty { continue }

            let lines = event.components(separatedBy: "\\n")
            var eventType = ""
            var eventData = ""

            for line in lines {
                if line.hasPrefix("event: ") {
                    eventType = String(line.dropFirst(7))
                } else if line.hasPrefix("data: ") {
                    eventData = String(line.dropFirst(6))
                }
            }

            print("Event: \\(eventType), Data: \\(eventData)")
        }
    }

    task.resume()
}
```

---

## Next Steps

Once Phase 1 database integration is complete:

1. Uncomment the database queries in `api/routes/chat.ts`
2. Import the database client and schema:
   ```typescript
   import { db } from '../../lib/db/client';
   import { conversations, messages } from '../../lib/db/schema';
   import { eq, desc } from 'drizzle-orm';
   ```
3. Messages will persist across requests
4. Conversation history will be maintained
5. List/get endpoints will return actual data

---

## Known Limitations (Current MVP)

- ✅ Streaming works with OpenAI GPT
- ✅ Rate limiting active (50 req/15min)
- ✅ Error handling for missing params
- ❌ No database persistence (messages not saved)
- ❌ No conversation history (each message is standalone)
- ❌ No authentication (userId trusted from client)
- ❌ No tool calling (basic chat only)

These will be addressed in subsequent phases or when Phase 1 database is integrated.
