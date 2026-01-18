# Backend Architecture for Travel Planning iOS App

## Project Overview

**Platform:** Native iOS App (Swift/SwiftUI)
**Backend Stack:** Express.js, PostgreSQL + Drizzle ORM, Supabase, Vercel AI SDK, LangChain.js
**Deployment:** Vercel
**Target Scale:** < 1K users (MVP/early-stage)
**Budget:** Minimal cost (free tier focused)
**Team:** Full-stack versatile

### Core Requirements
1. **Deterministic Operations**: User auth, trip CRUD, itinerary management
2. **AI Agent**: Chat interface with trip research and management tools
3. **Real-time**: Chat message streaming/updates for iOS app

---

## Architecture Stack (Your Selections)

### 1. Backend Framework: Express.js
- **Why**: Large community, mature ecosystem, extensive middleware
- **Benefits**: Well-documented, battle-tested, TypeScript support
- **iOS Considerations**:
  - Enable CORS for iOS requests
  - Proper HTTP status codes (URLSession depends on them)
  - JSON request/response (Swift Codable compatibility)
  - RESTful API conventions

### 2. Database: PostgreSQL + Drizzle ORM (Supabase Hosting)
- **PostgreSQL**: Robust relational database, handles complex trip data
- **Drizzle ORM**: Type-safe, lightweight, excellent TypeScript support
- **Supabase Hosting**: 500MB free tier, includes auth and realtime

**Schema Design**:
- `users`: id, email, name, avatar_url
- `trips`: id, user_id, title, destination, start_date, end_date
- `itinerary_items`: id, trip_id, day, time, activity, location
- `conversations`: id, trip_id, user_id, created_at
- `messages`: id, conversation_id, text, sender_type, timestamp

**iOS Benefits**:
- Supabase provides official Swift SDK
- Can use direct database access or backend API
- Realtime subscriptions for live updates

### 3. Authentication: Supabase Auth
- **Why**: Included with Supabase database
- **Features**: Email/password, OAuth (Google, Apple Sign In), magic links
- **iOS SDK**: Native Swift support with automatic token refresh
- **Token-based auth**: JWT tokens work seamlessly with iOS URLSession
- **Security**: Built-in session management, Apple Sign In integration

### 4. AI/LLM: Vercel AI SDK + Anthropic Claude API
- **Anthropic Claude**: $15 free credit, excellent for travel planning
- **Vercel AI SDK**: Streaming support, tool calling, provider-agnostic
- **Benefits**:
  - Strong reasoning for personalized recommendations
  - 200K token context for complex itineraries
  - Tool use for trip management

**iOS Integration**:
- SSE (Server-Sent Events) for streaming responses
- iOS URLSession supports streaming natively
- Can also use regular POST requests for simpler implementation

### 5. AI Agent Framework: LangChain.js
- **Why**: Full agent framework with research capabilities
- **Features**: Multi-step reasoning, tool calling, memory management
- **Tools for Travel Planning**:
  - `createTrip`: Create trip plans
  - `addItineraryItem`: Add activities to itinerary
  - `searchDestinations`: Web research for destinations
  - `getWeatherForecast`: Weather data integration
  - `findAccommodations`: Search hotels/accommodations

### 6. Deployment: Vercel
- **Free Tier**: 100GB bandwidth, serverless functions
- **Benefits**: Zero-config deployment, automatic HTTPS, environment variables
- **iOS Requirements**: HTTPS required for App Store (Vercel provides automatically)
- **Serverless**: Scales to zero when not in use (cost-effective)

---

## Key Backend Changes for iOS (vs Web App)

### 1. Real-time Communication
**Options for iOS**:

**Option A: Server-Sent Events (SSE)** - Recommended for AI streaming
- One-way streaming (server → iOS)
- iOS URLSession has native support
- Perfect for AI response streaming
- Simpler than WebSockets

**Option B: Supabase Realtime**
- Two-way communication
- Database change subscriptions
- Great for collaborative trip planning
- iOS Swift SDK included

**Option C: Push Notifications**
- Apple Push Notification Service (APNS)
- Background updates when app is closed
- Firebase Cloud Messaging (free tier) or native APNS

### 2. API Design for iOS
- **RESTful Endpoints**: iOS developers expect REST conventions
- **Pagination**: Support for large lists (trips, messages)
- **Consistent Response Format**:
  - Success/error structure
  - Proper HTTP status codes
  - JSON format (Swift Codable compatible)

### 3. Authentication Flow
- Token-based auth (JWT from Supabase)
- iOS Keychain storage for tokens
- Automatic token refresh handling
- Apple Sign In support (recommended for App Store)

### 4. File Upload (Images)
- Multipart form data support
- Supabase Storage integration
- iOS UIImage → JPEG data compression
- Progress tracking for large files

### 5. Offline Support
- Idempotent API operations
- Bulk sync endpoints
- Unique request IDs to prevent duplicates
- iOS Core Data for local persistence

### 6. Error Handling
- Consistent error response format
- Custom error codes for iOS handling
- Detailed error messages for debugging
- Proper HTTP status codes (401, 404, 500, etc.)

---

## API Structure

### Authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - End session
- `GET /api/auth/session` - Get current user

### Trips
- `GET /api/trips` - List all user trips (paginated)
- `POST /api/trips` - Create new trip
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Itinerary
- `GET /api/trips/:tripId/itinerary` - Get all items
- `POST /api/trips/:tripId/itinerary` - Add item
- `PUT /api/trips/:tripId/itinerary/:itemId` - Update item
- `DELETE /api/trips/:tripId/itinerary/:itemId` - Delete item

### Chat & AI
- `POST /api/chat/message` - Send message (returns stream or full response)
- `GET /api/conversations` - List user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation with messages

### Research
- `POST /api/research/destination` - AI research endpoint
- `POST /api/research/recommendations` - Get personalized recommendations

### Media
- `POST /api/trips/:id/images` - Upload trip image
- `DELETE /api/images/:id` - Delete image

### Sync (for offline support)
- `POST /api/sync` - Bulk sync offline changes

---

## iOS-Specific Recommendations

### iOS SDK/Libraries to Use
1. **Supabase Swift SDK** - Authentication and database
2. **Alamofire** (optional) - Advanced networking (or use native URLSession)
3. **SwiftUI** - Modern UI framework
4. **Core Data** - Local persistence for offline mode
5. **Combine** - Reactive programming for real-time updates

### iOS Features to Implement
1. **Apple Sign In** - Recommended for App Store, users expect it
2. **Widgets** - Trip summary on home screen or lock screen
3. **Share Sheet** - Share trip itineraries
4. **Dark Mode** - System appearance support
5. **Haptic Feedback** - Better UX for actions
6. **Background Refresh** - Sync data in background

### App Store Requirements
- HTTPS endpoints (Vercel provides)
- Privacy Policy (required for App Store)
- Data deletion mechanism (GDPR compliance)
- App Transport Security (ATS) configuration
- TestFlight beta testing before release

---

## Cost Breakdown

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Vercel | 100GB bandwidth, serverless | Enough for < 1K users |
| Supabase | 500MB DB, 50K MAU, 1GB storage | Database + Auth + Storage |
| Anthropic Claude | $15 credit | ~$0.50-2/day for active use |
| Firebase (Push) | Unlimited notifications | Free for < 1K users |
| Apple Developer | N/A | $99/year (required for App Store) |

**Total Backend Cost:** $0-5/month
**iOS Development:** $99/year (Apple Developer Program)

---

## Implementation Phases

### Phase 1: Backend Foundation (Week 1-2)
**Backend**:
- Set up Express.js with TypeScript
- Configure Supabase (PostgreSQL + Auth)
- Implement Drizzle ORM and schema
- Create authentication middleware
- Build basic CRUD endpoints (trips, itinerary)
- Deploy to Vercel

**iOS** (parallel development):
- Create Xcode project (SwiftUI)
- Set up Supabase Swift SDK
- Build authentication flow (sign in, sign up, Apple Sign In)
- Create basic UI (tab bar, navigation)
- Define data models matching backend schema

### Phase 2: AI Integration (Week 3-4)
**Backend**:
- Integrate Anthropic Claude API
- Set up LangChain.js with agent tools
- Implement chat endpoint with streaming support
- Create AI tools (createTrip, addItineraryItem, searchDestinations)
- Add conversation storage

**iOS**:
- Build chat interface (message list, input field)
- Implement SSE client for streaming
- Integrate backend chat endpoint
- Add typing indicators and loading states
- Test AI streaming responses

### Phase 3: Trip Management (Week 5-6)
**Backend**:
- Complete trip CRUD operations
- Add itinerary management endpoints
- Implement image upload (Supabase Storage)
- Add search and filter endpoints
- Create sync endpoint for offline support

**iOS**:
- Build trip list and detail views
- Create itinerary management UI (add, edit, delete items)
- Implement photo upload functionality
- Add Core Data for offline storage
- Build sync logic for offline changes

### Phase 4: Polish & Launch (Week 7-8)
**Backend**:
- Add web search integration for AI research
- Implement rate limiting (prevent abuse)
- Add logging and monitoring (Sentry free tier)
- Write API tests
- Create API documentation

**iOS**:
- Add push notifications support
- Implement widgets (trip summaries)
- Add ShareSheet for sharing trips
- Implement dark mode
- Polish animations and transitions
- Submit to TestFlight for beta testing
- Prepare App Store submission

---

## Project Structure

```
backend/
├── api/
│   ├── index.ts              # Express app entry
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── trips.ts
│   │   ├── chat.ts
│   │   └── itinerary.ts
│   └── middleware/
│       ├── auth.ts
│       └── error.ts
├── lib/
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema
│   │   └── client.ts
│   ├── ai/
│   │   ├── agent.ts          # LangChain agent
│   │   └── tools.ts          # AI tools
│   └── supabase.ts
├── drizzle/                  # DB migrations
├── vercel.json
├── drizzle.config.ts
├── package.json
└── tsconfig.json

ios-app/
├── TravelPlanner/
│   ├── App/
│   │   └── TravelPlannerApp.swift
│   ├── Models/
│   │   ├── Trip.swift
│   │   ├── Itinerary.swift
│   │   └── Message.swift
│   ├── Views/
│   │   ├── Auth/
│   │   ├── Trips/
│   │   ├── Chat/
│   │   └── Itinerary/
│   ├── Services/
│   │   ├── APIClient.swift
│   │   ├── AuthManager.swift
│   │   └── SupabaseClient.swift
│   └── Storage/
│       └── CoreDataManager.swift
└── TravelPlanner.xcodeproj
```

---

## Key Recommendations

### ✅ Do's
1. **Use Supabase Auth** - Saves weeks of work, excellent iOS SDK
2. **Implement SSE for streaming** - Native iOS support, great for AI responses
3. **Follow RESTful conventions** - iOS developers expect this
4. **Use proper HTTP status codes** - URLSession relies on them
5. **Test on real iOS devices** - Simulators don't catch all issues
6. **Implement offline support** - Users expect apps to work without internet
7. **Add Apple Sign In** - App Store review favors it, users trust it

### ❌ Don'ts
1. **Don't skip HTTPS** - Required for App Store, iOS won't allow HTTP
2. **Don't build custom auth from scratch** - Use Supabase
3. **Don't ignore pagination** - Large trip lists will cause issues
4. **Don't forget error handling** - Network requests fail often on mobile
5. **Don't skip TestFlight** - Beta testing catches critical bugs
6. **Don't hardcode API URLs** - Use environment-specific configs

---

## Alternative: Minimal MVP Approach

If you want to ship the absolute fastest MVP:

1. **Backend**: Express.js API on Vercel (no AI yet)
2. **Database**: Supabase (includes auth + realtime)
3. **iOS**: SwiftUI + Supabase SDK (direct database access)
4. **AI**: Add later as v2 feature

This gets you a functional trip planning app in 2-3 weeks without AI complexity.

---

## Next Steps

1. **Set up Supabase project** - Create database and get credentials
2. **Create Express.js backend** - Initialize TypeScript project
3. **Set up Drizzle ORM** - Define schema and run migrations
4. **Deploy to Vercel** - Test basic endpoints
5. **Create Xcode project** - Initialize iOS app
6. **Integrate Supabase Swift SDK** - Test authentication
7. **Build first feature** - User auth + trip list
8. **Add AI integration** - Implement chat with Claude

---

## Additional iOS Considerations

### Performance
- Use lazy loading for trip lists
- Implement image caching (SDWebImage or Kingfisher)
- Optimize JSON decoding with proper Codable implementation
- Use background tasks for sync operations

### UX Best Practices
- Pull-to-refresh for trip lists
- Swipe actions (edit, delete trips)
- Search functionality with debouncing
- Loading skeletons for better perceived performance
- Empty states with helpful messaging

### Security
- Store tokens in Keychain (never UserDefaults)
- Use certificate pinning for production
- Implement biometric authentication (Face ID/Touch ID)
- Clear sensitive data on logout

### Testing
- Unit tests for data models and network layer
- UI tests for critical flows (auth, create trip)
- TestFlight beta with target users
- Crash reporting (Sentry, Firebase Crashlytics)

---

## Summary

The backend architecture remains largely the same whether you're building a web app or iOS app - it's a REST API either way. The main iOS-specific changes are:

1. **Authentication**: Supabase provides excellent iOS SDK support
2. **Streaming**: Use SSE for AI responses (iOS URLSession supports this)
3. **Offline Support**: Design APIs to support sync and idempotent operations
4. **Push Notifications**: Add APNS integration for background updates
5. **Image Upload**: Support multipart form data
6. **Error Handling**: Consistent format for iOS error parsing

Your chosen stack (Express.js, Supabase, Vercel AI SDK, LangChain.js, Vercel) works perfectly for iOS apps. The main work is building the iOS client to consume your backend API.
