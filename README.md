# Trip-Agent (Trip Agent)

> **Trip Agent** is an AI-powered travel planning and journey optimization platform built on a core travel principle: **Budget is an output variable, not an upfront constraint.**
>
> Instead of forcing travelers to guess an arbitrary budget or generating unstructured, hallucinated text paragraphs, Trip Agent accepts natural language travel intent, calculates realistic trip costs across 4 distinct tiers (**Cheapest**, **Best Value**, **Comfortable**, and **Premium**), produces structured computational itineraries, and dynamically replans journeys upon constraint changes.

---

## ⚡ 5-Minute Core Demo Flow (Hackathon Walkthrough)

Follow this exact script to demonstrate the entire product end-to-end in under 5 minutes:

### Step 1: Start at the Landing Page (`/`)
- Open `http://localhost:5173/` in your browser.
- Point out the product thesis: *"Budget is an Output Variable, Not a Constraint"*.
- Observe the 4-tier visual cards (**Cheapest**, **Best Value**, **Comfortable**, **Premium**) illustrating realistic price discovery.
- Click the prominent amber **"Run 5-Min Core Demo"** button (or click *"Plan a journey"*).

### Step 2: Natural Language Travel Intent (`/plan`)
- On the planning screen, view the **"Describe your journey naturally"** assistant box.
- The prompt is pre-loaded (or enter manually):
  > *"I want a 4-day relaxed beach trip from Bhubaneswar. I want good food and some activities."*
  > *(Leave the Optional Budget field completely blank!)*
- Click **"Extract Intent"** (or click the first example prompt card).
- **Observe Intent Extraction**:
  - **Origin**: Bhubaneswar
  - **Destination**: Goa (automatically matched from "beach trip")
  - **Duration**: 4 days (validated manual numeric input)
  - **Travelers**: 2 travelers (validated manual numeric input)
  - **Travel Style**: Relaxed Pace
  - **Interests**: Beaches, Food, Adventure, Relaxed
  - **Budget**: None (Budget Discovery automatically triggered)
- Click **"Discover Realistic Trip Tiers"**.

### Step 3: Budget Discovery Engine (`/discovery`)
- Trip Agent displays 4 realistic, calculated tiers derived from actual inventory:
  1. **Cheapest** (~₹18,000 total / ₹9,000 per person): Sleeper rail, social hostel dorms, beach shacks, scooter mobility.
  2. **Best Value** (~₹36,500 total / ₹18,250 per person): IndiGo flights, 3-star boutique stay with pool, sunset cruise, popular cafes. *(Recommended badge highlighted)*.
  3. **Comfortable** (~₹69,400 total / ₹34,700 per person): Prime flights, 4-star beachfront resort, dedicated private AC sedan + chauffeur, scuba trial.
  4. **Premium** (~₹138,500 total / ₹69,250 per person): Business flights, 5-star private pool villa, private sailing yacht charter, chef dining.
- Point out the **Spend Allocation Visualizer** (Lodging, Flights, Dining, Excursions, Local Transit).
- Click **"Choose Best Value"** (or click the green card button).

### Step 4: Structured Itinerary Generation (`/journey`)
- Review the generated structured itinerary:
  - **Trip Summary**: Active tier tag, 4 Days, 2 Travelers, Total Cost ₹36,500.
  - **Route Visualizer**: Waypoint map showing Day 1 through Day 4 stops and distances.
  - **Primary Accommodation**: BloomSuites Boutique & Spa (Calangute).
  - **Roundtrip Transit**: IndiGo fast connector flights.
  - **Day-by-Day Schedule**: Chronological timeline of curated activities (Mandovi Catamaran Cruise, Scuba Diving Discovery, Assagao Heritage Walk).

### Step 5: Dynamic Replanning with Protected Activities
- Locate the **AI Orchestrated Replanner** bar right below the journey header.
- Enter (or click the first suggested chip):
  > *"Make it cheaper but don't remove the main activities."*
- Click **"Re-plan"** (or open the **"Optimize Trip"** modal).
- **Inspect the Before / After Comparison**:
  - **Previous Total**: ~~₹36,500~~
  - **New Total**: **₹29,000**
  - **Savings**: **Saved ₹7,500** (green badge)
  - **Changed Items**:
    - Accommodation: BloomSuites Boutique & Spa $\to$ Funky Monkey Hostel, Anjuna (-₹6,300)
    - Local Transit: Dedicated cabs $\to$ Scooter / public transit (-₹1,200)
  - **Preserved Items**: All 3 core activities (*Sunset Catamaran Cruise*, *Scuba Diving Trial*, *Assagao Heritage Walk*) are 100% preserved!
  - **Designer Explanation**: Explains that cost savings were achieved strictly by economizing stay and transit while shielding all booked excursions.

### Step 6: Component-Level Customization (Accommodation Swap)
- On the Primary Accommodation card, click **"Change Hotel"**.
- The **Customize Your Plan** modal opens, listing alternative properties with live price deltas:
  - *Casa De Goa Boutique Resort & Spa* (+₹1,800)
  - *Caravela Beach Resort* (+₹11,700)
  - *Zostel Plus Morjim* (-₹2,800)
- Click **"Choose"** on any alternative.
- Watch the journey total, nightly rates, and per-person cost recalculate instantly.

### Step 7: Booking Handover & Monetization (`/book`)
- Click **"Book Journey"** in the sticky bottom bar or header.
- View verified partner options across 5 verticals: **Flights & Trains**, **Hotels & Resorts**, **Activities**, **Guided Tours**, and **Curated Experiences**.
- **Inspect "View option"**:
  - Click **"View option"** on any card.
  - The modal reveals the **"Why this option was selected for your journey"** travel designer callout and the **Transparent Relevance Match Breakdown** (Preference Fit, Price Alignment, Location Proximity, Guest Rating, Convenience).
  - Show the **Important Trust Principle**: Options are ranked strictly by user compatibility—commissions *never* manipulate ranking order.
- **Inspect "Book"**:
  - Click **"Book"**.
  - The **Partner Handover Modal** visualizes the 5-stage loop:
    $$\text{Traveler} \longrightarrow \text{Trip Agent} \longrightarrow \text{Partner} \longrightarrow \text{Booking} \longrightarrow \text{Commission}$$
  - Displays affiliate tracking reference (`TA-REF-XXXXXX`), CPA commission terms (rate depends on partner agreement), and completes a simulated reservation confirmation.

### Step 8: B2B "For Travel Businesses" Section
- Scroll to the bottom of `/book` to view the **For Travel Businesses & Operators** section.
- Explain the 4 value pillars:
  1. **Qualified Travelers**: Travelers with confirmed dates, party size, and calculated budget tiers (no cold bounce traffic).
  2. **Native AI Itinerary Integration**: Contextual placement inside day schedules (zero banner blindness).
  3. **Zero Upfront Fees**: Performance-based CPA model.
  4. **Future Partner Ingestion API**: Real-time PMS/GDS rate sync.
- Click **"Partner with Trip Agent"** to open the partner inquiry form.

---

## 🏗️ System Architecture

```
Trip-Agent/
├── backend/                              # Express & Mongoose API Server (Port 5000)
│   ├── src/
│   │   ├── config/                       # DB connection & environment configuration
│   │   ├── controllers/                  # Route handlers (AI, trips, bookings, options, health)
│   │   ├── data/                         # Realistic seed catalog (8 Indian destinations, transit, hotels, activities)
│   │   ├── middleware/                   # Error handling & validation
│   │   ├── models/                       # Mongoose domain models (Trip, User, Destination, etc.)
│   │   ├── routes/                       # Express REST router definitions
│   │   ├── services/                     # Core Business Logic:
│   │   │   ├── ai.service.js             # Intent extraction & conversational replanning
│   │   │   ├── llmService.js             # Dual-engine LLM abstraction (Gemini + Mock fallback)
│   │   │   ├── budgetEstimator.service.js# Deterministic 4-tier cost discovery engine
│   │   │   ├── optimization.service.js   # Multi-criteria journey optimization & constraint solver
│   │   │   ├── booking.service.js        # BaseBookingProvider abstraction & affiliate handover
│   │   │   └── tripOptimizer.service.js  # Targeted component modification service
│   │   └── server.js                     # Server entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/                             # React 18 + Vite SPA (Port 5173)
│   ├── src/
│   │   ├── components/
│   │   │   ├── booking/                  # BookingModal (handover), OptionDetailsModal ("Why this option?")
│   │   │   ├── common/                   # Header, Footer, StatusBadge
│   │   │   ├── discovery/                # BudgetBreakdownChart (spend allocation visualizer)
│   │   │   └── journey/                  # RouteVisualizer, ItemChangeModal, OptimizationModal, NaturalLanguageReplanBar
│   │   ├── context/                      # TripContext (central state for intent, tiers, active itinerary)
│   │   ├── data/                         # Benchmark fallback itineraries, bookables, destinations
│   │   ├── pages/                        # Route pages:
│   │   │   ├── HomePage.jsx              # Landing page with 4-tier preview & Quick Demo CTA
│   │   │   ├── PlanPage.jsx              # Conversational planner with manual numeric inputs
│   │   │   ├── BudgetDiscoveryPage.jsx   # 4-tier cost discovery & budget constraint solver
│   │   │   ├── JourneyPage.jsx           # Detailed itinerary, map, timeline, and replanner
│   │   │   ├── BookingPage.jsx           # 5-vertical booking catalog & B2B partner section
│   │   │   ├── SavedTripsPage.jsx        # Persisted trips management (resume/delete)
│   │   │   ├── PreferencesPage.jsx       # Traveler defaults (home airport, travel style)
│   │   │   └── HowItWorksPage.jsx        # TravelTech architectural documentation
│   │   ├── services/                     # Axios/Fetch API wrappers (aiService, tripService, bookingService, etc.)
│   │   └── App.jsx                       # React Router configuration
│   ├── .env.example
│   └── package.json
│
└── package.json                          # Root workspace orchestration scripts
```

---

## 📡 REST API Reference

### System
- `GET /api/health` — Service uptime, database connectivity, and active AI provider status.

### Travel Catalog
- `GET /api/destinations` — Query destinations by tag, state, or search keyword.
- `GET /api/destinations/:id` — Destination metadata, coordinates, and populated catalog options.
- `GET /api/transport` — Query transport options filtered by `origin`, `destination`, `mode`, and `maxPrice`.
- `GET /api/accommodations` — Query accommodations filtered by `destination`, `category`, and `maxPrice`.
- `GET /api/activities` — Query activities filtered by `destination`, `category`, and `maxPrice`.

### Trip Planning & Replanning
- `POST /api/trips` — Create and persist a structured Trip document (validates positive integer duration & travelers).
- `GET /api/trips/:id` — Retrieve a single Trip document by MongoDB ID.
- `PUT /api/trips/:id` — Update or replan an existing Trip document.
- `DELETE /api/trips/:id` — Delete a Trip document.

### Budget Discovery Engine
- `POST /api/trips/estimate` — Ad-hoc 4-tier budget discovery taking `{ origin, destination, duration, travelers, optionalBudget, travelStyle, interests }`.
- `POST /api/trips/:id/budget-estimate` — Calculate and persist the 4-tier estimate into a saved Trip.
- `POST /api/trips/:id/select-tier` — Lock in traveler's selected tier (`cheapest`, `bestValue`, `comfortable`, `premium`).

### Journey Optimization Engine
- `POST /api/trips/optimize` — Ad-hoc multi-criteria optimization for in-flight client previews.
- `POST /api/trips/:id/optimize` — Optimize and persist updates to a saved MongoDB Trip document.

### AI Orchestration
- `POST /api/ai/intent` — Natural language intent extraction into structured `TravelIntent` schema.
- `POST /api/ai/chat` — Context-aware conversational replanning producing targeted actions (`OPTIMIZE_CHEAPER`, `OPTIMIZE_COMFORT`, `REPLACE_HOTEL`, etc.).

### Booking & Monetization
- `GET /api/bookings/options/:tripId` — Returns structured bookable options across 5 verticals with trust-first relevance ranking and "Why this option?" explanations.
- `POST /api/bookings/handover` — Issues affiliate tracking token (`TA-REF-XXXXXX`) and initializes the 5-stage partner handover.
- `GET /api/bookings/partner-program` — Returns value propositions and integration specs for travel businesses.

---

## 🗄️ Database Models (MongoDB / Mongoose)

1. **`Trip`**: Central graph document containing `origin`, `destination`, `duration`, `travelers`, `interests`, `travelStyle`, `selectedBudgetTier`, 4-tier `budgetEstimate`, day-by-day `itinerary` array with embedded `JourneyItem` subdocuments, and lifecycle `status` (`Draft`, `Planned`, `Booked`).
2. **`Destination`**: Metadata, geo-coordinates, seasonal cost benchmarks (budget, moderate, luxury), best seasons, and image galleries for 8 Indian destinations.
3. **`TransportOption`**: Multi-modal inventory (`Flight`, `Train`, `Bus`, `Cab`), carrier, departure/arrival schedules, duration, comfort levels, and pricing.
4. **`AccommodationOption`**: Properties across categories (`Hostel`, `Boutique Hotel`, `Beach Resort`, `Mountain Resort`, `Heritage Hotel`, `Luxury Villa`), star ratings, amenities, and location proximity.
5. **`ActivityOption`**: Experiences across categories (`Sightseeing`, `Adventure`, `Food & Nightlife`, `Nature`, `Cultural`, `Wellness`, `Cruise`), duration, price, rating, and inclusions.
6. **`JourneyItem`**: Typed schedule node (`dayNumber`, `type`, `title`, `description`, `location`, `time`, `cost`, `bookingAvailable`).
7. **`User`**: Traveler profiles, authentication provider, and role (`traveler`, `partner`, `admin`).
8. **`SavedPreference`**: User defaults (home airport, travel style, default tier, dietary preferences).

---

## 🤖 AI Integration & Dual-Engine Architecture

Trip Agent adheres to an essential architectural principle:
> **The LLM is an interpreter, intent extractor, and conversational designer — NEVER a direct inventor of prices, distances, or booking inventory.**

- **Primary Engine**: Google Gemini (`gemini-2.5-flash` via `@google/genai`) activated automatically when `GEMINI_API_KEY` is present.
- **Deterministic Mock Engine**: Seamless, zero-configuration fallback providing regex-based entity extraction and heuristic replanning. Ensures the application **never fails or shows broken screens** during offline hackathon judging or when API keys are unavailable.

---

## 💳 Booking & Monetization Architecture

- **Traveler Planning is Free**: Zero paywalls for discovery, tier comparison, and dynamic replanning.
- **Affiliate CPA Model**: Revenue is generated via partner commissions on eligible completed bookings with verified partners (rates depend on individual partner agreements).
- **Important Trust Principle**:
  - **Relevance First**: Options are ranked strictly by user preference compatibility, price fit, location, rating, and convenience.
  - **Zero Pay-to-Rank**: Commission rates NEVER manipulate recommendation order. Sponsored placements are explicitly badged with transparent disclosures.
- **5-Stage Handover Loop**:
  $$\text{Traveler} \longrightarrow \text{Trip Agent} \longrightarrow \text{Partner} \longrightarrow \text{Booking} \longrightarrow \text{Commission}$$

---

## 🔮 Future Real Travel API Integrations

The `BaseBookingProvider` abstraction in `booking.service.js` is designed to plug directly into live travel inventory networks:
1. **Airlines & Rail**: Amadeus for Developers Flight Offers Search API, Sabre GDS, Skyscanner Affiliate API, and IRCTC partner API.
2. **Accommodations**: Booking.com Affiliate API, Expedia Partner Solutions (EPS Rapid), and Cloudbeds PMS Channel Manager.
3. **Tours & Activities**: Viator Partner API, GetYourGuide Supplier API, and Klook Open Platform.
4. **Local Transit**: Uber / Ola B2B ride voucher APIs and local scooter rental fleet telematics.

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `5000` | Port for Express API server |
| `NODE_ENV` | Optional | `development` | Set to `production` in deployment |
| `MONGODB_URI` | Required | `mongodb://localhost:27017/trip-agent` | MongoDB connection URI (e.g. MongoDB Atlas connection string) |
| `FRONTEND_URL` | Required in Prod | `http://localhost:5173` | Allowed frontend origin for CORS (e.g., `https://trip-agent.vercel.app` or comma-separated list) |
| `CORS_ORIGIN` | Optional | Same as `FRONTEND_URL` | Backward-compatible alias for `FRONTEND_URL` |
| `LLM_PROVIDER` | Optional | `mock` | AI engine (`mock` for deterministic NLP rule engine, or `gemini` for live Gemini API) |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key (required only if `LLM_PROVIDER=gemini`) |

### Frontend Configuration (`frontend/.env`)

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Required in Prod | `/api` | Base URL for backend API (e.g. `https://your-trip-agent-backend.onrender.com/api`) |

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Files
- Backend: copy `backend/.env.example` to `backend/.env`
- Frontend: copy `frontend/.env.example` to `frontend/.env`

### 3. Seed Database (Optional)
```bash
cd backend && npm run seed
```

### 4. Start Servers
```bash
# Terminal 1: Backend API server (Port 5000)
npm run dev:backend
# (or: cd backend && npm run dev)

# Terminal 2: Frontend client (Port 5173)
npm run dev:frontend
# (or: cd frontend && npm run dev)
```

Open `http://localhost:5173` in your browser.

---

## ☁️ Production Deployment Architecture

```
┌─────────────────────────────────┐
│         Vercel (Frontend)       │
│   React 18 + Vite + Tailwind    │
│   https://trip-agent.vercel.app │
└────────────────┬────────────────┘
                 │
                 │ HTTPS (VITE_API_URL)
                 ▼
┌─────────────────────────────────┐
│         Render (Backend)        │
│   Node.js + Express API         │
│   https://api-trip-agent...     │
└────────────────┬────────────────┘
                 │
                 │ MONGODB_URI (TLS)
                 ▼
┌─────────────────────────────────┐
│     MongoDB Atlas (Database)    │
│   Managed Cloud Document Store  │
└─────────────────────────────────┘
```

### 1. Database Deployment (MongoDB Atlas)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with password and allow network access (`0.0.0.0/0` for cloud deployment).
3. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/trip-agent?retryWrites=true&w=majority
   ```

### 2. Backend Deployment (Render)
1. Create a **New Web Service** pointing to the repository.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000` (or leave default assigned by Render)
   - `MONGODB_URI` = `<your MongoDB Atlas URI>`
   - `FRONTEND_URL` = `https://<your-vercel-app>.vercel.app`
   - `LLM_PROVIDER` = `mock` (or `gemini` with `GEMINI_API_KEY`)

### 3. Frontend Deployment (Vercel)
1. Import repository into [Vercel](https://vercel.com).
2. Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_URL` = `https://<your-render-backend-url>.onrender.com/api`

---

## ⚠️ Hackathon Simulation & Demo Notice

- **Simulated Booking & Payment Ecosystem**: Real financial credit card charges, flight ticketing, and hotel reservations are simulated. The checkout wizard generates unique demo references (`TA-TRIP-XXXXXX`, `TA-FLT-XXXXXX`, `TA-HOT-XXXXXX`, `TA-REF-XXXXXX`, and `PAY-XXXXXX`) for end-to-end evaluation. No real money is processed or charged.
- **Data Persistence**: All trips, custom modifications, AI replanning history, booking sessions, and confirmed day-by-day itineraries are persisted in MongoDB (with local storage fallback) and viewable in **My Trips**.

