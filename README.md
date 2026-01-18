# Travlr Backend API

Backend API for Travlr - A Travel Planning iOS App built with Express.js, PostgreSQL, Supabase, and AI capabilities.

## Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth
- **AI**: Anthropic Claude API + LangChain.js (Phase 2)
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
- `PORT`: Server port (default: 3001)
- `CORS_ORIGIN`: Allowed CORS origins
- `SUPABASE_URL`: Your Supabase project URL (to be added)
- `SUPABASE_ANON_KEY`: Your Supabase anon key (to be added)
- `DATABASE_URL`: PostgreSQL connection string (to be added)

### Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

### Available Endpoints

- `GET /health` - Health check endpoint
- `GET /api` - API information and available endpoints

## Current Implementation Status

### Phase 1: Backend Foundation (In Progress)

- [x] Express.js with TypeScript setup
- [x] Project structure created
- [x] Basic server with CORS and error handling
- [x] Vercel deployment configuration
- [ ] Supabase configuration
- [ ] Drizzle ORM setup and schema
- [ ] Authentication middleware
- [ ] CRUD endpoints (trips, itinerary)

### Phase 2: AI Integration (Planned)

- [ ] Anthropic Claude API integration
- [ ] LangChain.js agent setup
- [ ] Chat endpoint with streaming
- [ ] AI tools (createTrip, addItineraryItem, etc.)

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

## API Documentation

(To be added as endpoints are implemented)

## Deployment

Deploy to Vercel:
```bash
vercel
```

Make sure to set environment variables in Vercel dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `DATABASE_URL`
- `ANTHROPIC_API_KEY` (Phase 2)

## License

ISC
