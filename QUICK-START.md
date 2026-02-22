# Quick Start Guide - Supabase Integration

## Prerequisites Complete ✅
- Drizzle ORM configured
- Database schema defined
- Query functions implemented
- Migration generated
- API routes integrated

## What You Need To Do

### 1. Get Supabase Credentials (5 minutes)

Go to your Supabase project dashboard:

**For DATABASE_URL:**
1. Project Settings → Database
2. Copy "Connection string" (URI format)
3. Replace `[YOUR-PASSWORD]` with your actual password

**For SUPABASE_URL and SUPABASE_ANON_KEY:**
1. Project Settings → API
2. Copy "Project URL"
3. Copy "anon public" key

### 2. Update .env File (1 minute)

Replace these placeholder values in `.env`:

```env
# Replace these three lines:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Example with actual values:
```env
DATABASE_URL=postgresql://postgres:mySecretPass123@db.xyzabcdefghij.supabase.co:5432/postgres
SUPABASE_URL=https://xyzabcdefghij.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Run Migration (1 minute)

```bash
npm run db:migrate
```

Expected output:
```
✓ Pushing schema to database
✓ Done!
```

### 4. Verify in Supabase Dashboard (1 minute)

1. Go to Supabase → Table Editor
2. You should see:
   - `conversations` table
   - `messages` table

### 5. Test Locally (2 minutes)

Start the server:
```bash
npm run dev
```

Test with the existing test script:
```bash
node test-chat.js
```

Or test manually:
```bash
# Create a conversation
curl -X POST http://localhost:8080/api/chat/conversations \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-123"}'

# List conversations
curl "http://localhost:8080/api/chat/conversations?userId=test-user-123"
```

### 6. Deploy to Vercel (5 minutes)

1. Add environment variables in Vercel dashboard:
   - Settings → Environment Variables
   - Add: DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY

2. Deploy:
```bash
git add .
git commit -m "Add Supabase database integration"
git push
```

## Troubleshooting

**"Failed to connect to database"**
- Check DATABASE_URL is correct
- Ensure password doesn't have special characters (or URL encode them)
- Verify Supabase project is not paused

**"Tables not found"**
- Run `npm run db:migrate` again
- Check Supabase dashboard for tables

**"Migration failed"**
- Verify DATABASE_URL format is correct
- Check if tables already exist (drop them if needed)
- Ensure network access to Supabase

## What's Working Now

✅ All 4 chat API endpoints integrated with database
✅ Conversation creation and management
✅ Message storage and retrieval
✅ Conversation history loading
✅ Auto-title generation
✅ User ownership verification
✅ Pagination support
✅ SSE streaming with database persistence

## Need Help?

See detailed guides:
- **SUPABASE-SETUP.md** - Complete setup instructions
- **IMPLEMENTATION-SUMMARY.md** - Technical implementation details

## API Endpoints Ready

1. **POST /api/chat/message** - Send message, get AI response
2. **GET /api/chat/conversations** - List user conversations
3. **POST /api/chat/conversations** - Create conversation
4. **GET /api/chat/conversations/:id** - Get conversation details

All endpoints now persist data to Supabase PostgreSQL database!
