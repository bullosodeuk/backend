# Travlr Backend API

Backend API for Travlr - A Travel Planning iOS App built with Express.js, PostgreSQL, Supabase, and AI capabilities.

## Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4o with Vercel AI SDK (Phase 2)
- **Deployment**: Vercel

## Project Structure

```
backend/
├── api/
│   ├── index.ts              # Express app entry point
│   ├── routes/               # API routes
│   └── middleware/           # Custom middleware
├── lib/
│   ├── db/                   # Database schema and client
│   ├── ai/                   # AI agent and tools
│   └── supabase.ts          # Supabase configuration
├── drizzle/                  # Database migrations
├── .env                      # Environment variables (not committed)
├── .env.example              # Environment variables template
├── package.json
├── tsconfig.json
└── vercel.json              # Vercel deployment config
```

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn
- Supabase account (for database and auth)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `PORT`: Server port (default: 8080)
- `CORS_ORIGIN`: Allowed CORS origins
- `SUPABASE_URL`: Your Supabase project URL (Phase 1)
- `SUPABASE_ANON_KEY`: Your Supabase anon key (Phase 1)
- `DATABASE_URL`: PostgreSQL connection string (Phase 1)
- `OPENAI_API_KEY`: Your OpenAI API key (Phase 2 - **REQUIRED for chat**)
- `GPT_MODEL`: OpenAI model to use (default: gpt-4o)

### Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:8080` (or the port specified in `.env`).

### Available Endpoints

#### Core
- `GET /health` - Health check endpoint
- `GET /api` - API information and available endpoints

#### Chat (Phase 2) ✅
- `POST /api/chat/message` - Send message with SSE streaming
- `GET /api/chat/conversations` - List user conversations
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations/:id` - Get conversation details

#### Auth (Phase 1 - Planned)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - End session
- `GET /api/auth/session` - Get current user

#### Trips (Phase 1 - Planned)
- `GET /api/trips` - List all trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

#### Itinerary (Phase 1 - Planned)
- `GET /api/trips/:tripId/itinerary` - List items
- `POST /api/trips/:tripId/itinerary` - Add item
- `PUT /api/trips/:tripId/itinerary/:itemId` - Update item
- `DELETE /api/trips/:tripId/itinerary/:itemId` - Delete item

## Current Implementation Status

### Phase 1: Backend Foundation (In Progress)

- [x] Express.js with TypeScript setup
- [x] Project structure created
- [x] Basic server with CORS and error handling
- [x] Vercel deployment configuration
- [x] Supabase configuration
- [x] Drizzle ORM setup and schema
- [ ] Authentication middleware
- [ ] CRUD endpoints (trips, itinerary)

### Phase 2: AI Integration ✅ (Complete - Awaiting Phase 1 Database)

- [x] OpenAI GPT-4o integration
- [x] Vercel AI SDK for streaming
- [x] Chat endpoint with SSE streaming
- [x] Rate limiting (50 requests per 15 minutes)
- [x] 4 chat endpoints implemented
- [ ] Database integration (waiting on Phase 1)
- [ ] AI tools (createTrip, addItineraryItem, etc.) - Future enhancement

### Phase 3: Trip Management (Planned)

- [ ] Complete trip CRUD operations
- [ ] Image upload (Supabase Storage)
- [ ] Search and filter endpoints
- [ ] Offline sync support

### Phase 4: Polish & Launch (Planned)

- [ ] Web search integration
- [ ] Rate limiting
- [ ] Monitoring and logging
- [ ] API tests
- [ ] Documentation

## Next Steps

**Note:** Phase 2 (AI Integration) is complete! The code is ready and waiting for Phase 1 database integration.

### Phase 1 Tasks

1. **Set up Supabase**:
   - Create a Supabase project
   - Get database credentials
   - Configure authentication

2. **Configure Drizzle ORM**:
   - Create database schema (users, trips, itinerary_items, etc.)
   - Set up migrations
   - Create database client

3. **Build Authentication**:
   - Create auth middleware
   - Implement login/register endpoints
   - Add session management

4. **Create API Routes**:
   - Trips CRUD endpoints
   - Itinerary management
   - User profile

### Phase 2 Integration (After Phase 1)

Once Phase 1 database is complete:

1. **Integrate Database with Chat Routes**:
   - Uncomment database queries in `api/routes/chat.ts`
   - Import database client and schema
   - Test message persistence

2. **Add OpenAI API Key**:
   - Get API key from https://platform.openai.com/api-keys
   - Add to `.env` as `OPENAI_API_KEY`
   - Ensure you have billing/credits set up

3. **Test Chat Functionality**:
   - Run the curl commands in Testing section above
   - Verify SSE streaming works
   - Test from iOS app if available

4. **Optional: Add Tool Calling** (Future):
   - Define trip management tools
   - Integrate with Vercel AI SDK
   - Enable AI to create/modify trips

## Testing

### Quick Test Commands

**Test health endpoint:**
```bash
curl http://localhost:8080/health
```

### Phase 2: Chat Endpoints (Requires OpenAI API Key)

**1. Send a chat message with streaming:**
```bash
curl -N -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"userId":"test-user","message":"Say hello"}'
```

**2. Test with a longer response:**
```bash
curl -N -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"userId":"test-user","message":"Write a 3-day Tokyo itinerary"}'
```

**3. Create a new conversation:**
```bash
curl -X POST http://localhost:8080/api/chat/conversations \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123"}'
```

**4. List conversations:**
```bash
curl "http://localhost:8080/api/chat/conversations?userId=test-user-123"
```

**5. Get conversation details:**
```bash
curl "http://localhost:8080/api/chat/conversations/conv_123?userId=test-user-123"
```

**Note:** The `-N` flag disables buffering so you can see streaming output in real-time.

### Comprehensive Testing Guide

For detailed testing instructions including error cases, iOS integration, and rate limiting tests, see:
- **[PHASE2-TESTING.md](PHASE2-TESTING.md)** - Complete testing guide with examples

## API Documentation

(To be added as endpoints are implemented)

## Deployment

Deploy to Vercel:
```bash
vercel
```

Make sure to set environment variables in Vercel dashboard:
- `SUPABASE_URL` (Phase 1)
- `SUPABASE_ANON_KEY` (Phase 1)
- `SUPABASE_SERVICE_KEY` (Phase 1)
- `DATABASE_URL` (Phase 1)
- `OPENAI_API_KEY` (Phase 2 - Required)
- `GPT_MODEL` (Phase 2 - Optional, defaults to gpt-4o)

## License

ISC
