# V0-App Health Application - Warp Project Context

## Project Overview
This is a Next.js health application that integrates with the Kroger API for grocery ordering and meal planning. The app helps users create health-focused meal plans and automatically generates grocery lists that can be added to their Kroger cart.

## Architecture & Container Setup

### Container Structure (3 Running Containers)
- **v0-dev-container** (Port 3000) - Production health app
- **kroger-mcp-server-final** (Port 3001) - Kroger API integration service  
- **v0-app-staging** (Port 3002) - Staging environment

### Docker Configuration
- Main app and MCP server defined in `docker-compose.yml`
- Staging runs independently to preserve separate configuration
- All containers use bridge networking via `v0-network`
- Volume mounts preserve development files and node_modules

## Technology Stack

### Main App (Port 3000)
- **Framework**: Next.js 15.2.4 with React 19
- **UI Library**: Radix UI components with Tailwind CSS
- **State**: React Hook Form with Zod validation
- **Database**: Supabase integration
- **Styling**: Tailwind CSS with shadcn/ui components

### MCP Server (Port 3001) 
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with CORS
- **API Integration**: Kroger API via OAuth2
- **Database**: Supabase for user tokens and cart sessions

## Key Features & Functionality

### Health App Features
1. **Onboarding Flow** - Captures user preferences and health goals
2. **AI Meal Planning** - Generates personalized weekly meal plans
3. **Grocery List Generation** - Converts meal plans to shopping lists
4. **Kroger Integration** - Direct cart population from meal plans

### Kroger MCP Server Endpoints
- `GET /health` - Server health check
- `GET /api/products/search` - Product search with mock data
- `POST /api/meal-plan/ai-generate` - AI meal plan generation
- `POST /api/meal-plan/grocery-list` - Convert meal plans to grocery lists
- `GET /auth/kroger` - OAuth initiation
- `GET /auth/callback` - OAuth callback handling
- `GET /api/stores` - User's nearby Kroger stores
- `POST /api/orders` - Add items to Kroger cart

## Environment Configuration

### Required Environment Variables
**Main App (.env.local)**
- Supabase connection details
- NODE_ENV=development
- NEXT_TELEMETRY_DISABLED=1

**MCP Server (./mcp-kroger-server/.env)**
- `KROGER_CLIENT_ID` - Kroger API client ID
- `KROGER_CLIENT_SECRET` - Kroger API client secret
- `KROGER_REDIRECT_URI` - OAuth callback URL
- `PORT` - Server port (default: 3001)

## Data Flow & Integration

### Meal Plan to Grocery Flow
1. User completes onboarding in main app
2. AI generates meal plan based on preferences
3. Meal plan converted to grocery list via MCP server
4. Products matched against Kroger API/mock data
5. Items added to user's Kroger cart via OAuth

### Kroger OAuth Integration Flow
1. User initiates Kroger connection
2. OAuth redirect to Kroger authorization
3. Callback exchanges code for access token
4. Token stored for subsequent API calls
5. User can browse stores and add items to cart

### User Authentication & Account Setup Flow
1. **User Registration/Login**: Email/password authentication via Supabase Auth
2. **Profile Creation**: User completes onboarding flow with health preferences
3. **Database Records**: User profile stored in `user_profiles` table
4. **Activity Logging**: User activities tracked in `user_activities` table with RLS policies
5. **Session Management**: Auth context manages user state and profile data

### Database Schema Architecture
**Core Tables:**
- `user_profiles` - User demographic and health data
- `user_activities` - Activity logging with RLS policies
- `meal_plans` - AI-generated meal plans
- `health_assessments` - User health evaluation data
- `user_kroger_tokens` - OAuth tokens for Kroger integration
- `grocery_cart_sessions` - Kroger cart management

**Security Features:**
- Row Level Security (RLS) enabled on all user tables
- Policies ensure users can only access their own data
- Activity logging requires proper authentication timing
- Service role access for administrative operations

## Development Commands

### Main App
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm start` - Start production server

### MCP Server
- `npm run dev` - Start development with tsx
- `npm run build` - Compile TypeScript
- `npm start` - Start production server
- `npm run watch` - Development with auto-reload

### Docker Operations
- `docker-compose up` - Start main containers
- `docker-compose build` - Rebuild containers
- `docker ps -a` - Check container status
- `docker start [container-name]` - Restart specific container

## Common Issues & Solutions

### Container Startup Issues
- Check Docker Desktop is running
- Verify environment files exist and have correct permissions
- Restart Docker Desktop if filesystem goes read-only
- Use `docker start [name]` instead of rebuild to preserve data

### Kroger API Integration
- OAuth flow requires valid redirect URI
- Mock data available for development/testing
- Real API integration ready when credentials configured
- Token refresh handling implemented

### Port Conflicts
- Production: 3000, MCP: 3001, Staging: 3002
- Check with `lsof -i :PORT` if port conflicts occur
- Staging runs independently of docker-compose

### User Activities RLS Policy Issues (RESOLVED)
**Problem**: "new row violates row-level security policy for table 'user_activities'" error during user account setup
**Root Cause**: Activity logging attempted during signup before user profile/context is fully established
**Final Solution**: Disabled RLS on user_activities table in Supabase (temporary) and merged authentication + Kroger integration
- RLS disabled on `user_activities` table to unblock development
- Successfully merged working authentication flow from staging with Kroger integration from production
- Both containers now have complete functionality without losing working code
**Architecture Merge Completed**:
- Staging (3002) now has both working login flow AND complete Kroger integration
- Production (3000) preserved with all existing functionality intact
- Auth components: `login-form.tsx`, `protected-route.tsx`, `AuthContext.tsx` (no activity logging)
- Kroger components: `kroger-integration.tsx`, updated `profile.tsx`, updated `meal-planner.tsx`
- Staging ready for production deployment when needed

## File Structure Highlights
```
/Users/marketwakeadmin/v0-app/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   │   ├── login-form.tsx
│   │   │   └── protected-route.tsx
│   │   ├── onboarding/    # Onboarding flow components
│   │   └── [other-components]
│   └── page.tsx           # Main app entry
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context (with RLS fix)
├── lib/                   # Utility libraries
│   ├── supabase.ts       # Supabase client configuration
│   └── database.ts       # Database helper functions
├── mcp-kroger-server/     # Kroger API integration
│   ├── src/index.ts       # MCP server main file
│   └── .env               # MCP environment config
├── database/              # Database schemas
│   └── kroger-schema.sql  # Kroger-specific tables
├── scripts/               # Database and utility scripts
├── docker-compose.yml     # Container orchestration
└── package.json          # Main app dependencies
```

## 🚀 Feature Development & Deployment Workflow (Optimized)

### Our Proven Process
This workflow has been validated through successful deployments:

#### Phase 1: Feature Development (Local)
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Develop & Test Locally**
   - Work in Docker containers (`localhost:3000` for frontend, `localhost:3001` for MCP)
   - Make changes, test immediately with hot reload
   - Iterate until feature works as expected

3. **User Validation**
   - "Test the feature at localhost:3000"
   - User confirms it works before proceeding

#### Phase 2: Deployment (When User Confirms)
4. **Stage App Files Only**
   ```bash
   # Add only project files, exclude personal files
   git add .gitignore WARP.md app/ lib/ mcp-kroger-server/ components.json database/ docs/
   ```

5. **Commit with Descriptive Message**
   ```bash
   git commit -m "feat: Feature description
   
   - Bullet points of changes
   - What was added/fixed
   - Any important notes"
   ```

6. **Push & Merge to Main**
   ```bash
   git push origin feature/feature-name  # Backup feature branch
   git checkout main
   git merge feature/feature-name
   git push origin main                  # Triggers Vercel deployment
   ```

7. **Verify Deployment**
   - Vercel auto-deploys in 2-3 minutes
   - Render (backend) auto-deploys from `/mcp-kroger-server`
   - Check production URLs to confirm

### File Management Rules

#### ✅ Always Commit (Project Files)
- `app/` - Frontend components and pages
- `lib/` - Utility functions and configs
- `mcp-kroger-server/` - Backend API server
- `database/` - SQL migrations and schemas
- `docs/` - Documentation and user stories
- `scripts/` - Utility scripts
- `WARP.md` - Project context
- `.gitignore` - Git exclusions
- `components.json`, `package.json`, etc.

#### ❌ Never Commit (Personal Files)
- `.env`, `.env.local` - Secrets and API keys
- `*.numbers`, `*.xhtml`, `*.heic` - Personal documents
- `*.mp3`, `*.ics`, `*.jpg` - Media files
- Wedding photos, expense spreadsheets, etc.
- **Location**: Personal files stored in `~/Documents/8centrik-personal-files/`

### .gitignore Maintenance
The `.gitignore` file is configured to automatically exclude:
- Environment files (`.env*`)
- Personal file extensions (`.numbers`, `.heic`, `.mp3`, etc.)
- Build artifacts (`node_modules`, `.next`, `dist`)
- IDE files (`.vscode`, `.idea`)

### Branch Strategy (Simple & Effective)
```
main          ─────●─────●─────●──────  (production - auto-deploys to Vercel/Render)
                    │     │     │
feature/*     ──────┴─────┴─────┴──────  (development - test locally first)
```

- **main**: Always production-ready, deploys automatically
- **feature/***: Development branches, merge only after local testing
- **No staging branch needed**: Test locally, deploy to main when ready

### Deployment Targets

#### Frontend (Vercel)
- **Repo**: https://github.com/DMAC-builds/8centrik
- **Branch**: `main`
- **Deploy**: Automatic on push to main
- **URL**: [Your Vercel URL]

#### Backend (Render)
- **Repo**: https://github.com/DMAC-builds/8centrik
- **Path**: `/mcp-kroger-server`
- **Branch**: `main`
- **Deploy**: Automatic on push to main
- **URL**: [Your Render URL]

### Quick Reference Commands

```bash
# Start development
docker-compose up

# Test at localhost:3000
# When user confirms feature works...

# Deploy to production
git add app/ lib/ mcp-kroger-server/ database/ docs/ WARP.md
git commit -m "feat: Description of changes"
git push origin feature/feature-name
git checkout main && git merge feature/feature-name
git push origin main

# Verify in 2-3 minutes at Vercel/Render URLs
```

### Key Principles
1. **Test First**: Always validate locally before deploying
2. **User Approval**: User confirms "it works" before deployment
3. **Clean Commits**: Only commit project files, never personal files
4. **Fast Feedback**: Feature → Test → Deploy → Verify in < 5 minutes
5. **No Surprises**: User explicitly says "deploy to main" before push

---

## Warp Agent Instructions
When helping with this project:

1. **Preserve Containers**: Never delete or rebuild containers without explicit permission
2. **Check Status First**: Always run `docker ps -a` to see current container states
3. **Use Existing Structure**: Work within the established 3-container architecture
4. **Environment Awareness**: Check for .env files and their configurations
5. **Port Mapping**: Respect the 3000/3001/3002 port assignments
6. **Data Safety**: Use `docker start` rather than recreating containers
7. **Integration Focus**: Understand the health app → MCP server → Kroger API flow
8. **Development Flow**: Main development happens in the containers, not on host
9. **Deployment Flow**: Follow the proven workflow above - test locally, user approves, then deploy

## Testing & Verification
- Health check: `curl http://localhost:3001/health`
- App access: `http://localhost:3000` (production)
- Container logs: `docker logs [container-name]`
- Network connectivity: All containers on `v0-network` bridge

## Git & Version Control

### Repository Information
- **GitHub**: https://github.com/DMAC-builds/8centrik
- **SSH**: git@github.com:DMAC-builds/8centrik.git
- **Main Branch**: `main` (production-ready code)

### Branching Strategy (Simple Flow - Solo Development)
```
main          ─────●─────●─────●──────  (production releases)
                    │     │     │
develop      ───────┴──●──┴──●──┴──────  (active development)
                       │     │
feature/*    ──────────┴─────┴─────────  (new features)
```

**Branch Structure:**
- `main` - Production-ready code, deployed to containers 3000/3001
- `develop` - Integration branch for active development
- `feature/*` - Feature branches (e.g., `feature/meal-planning-v2`)
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Emergency production fixes

### Git Workflow

**Daily Development:**
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/new-feature-name

# Make changes, test in containers
# Containers use volume mounts, so changes are instant

# Commit work
git add .
git commit -m "feat: descriptive message"

# Push to GitHub
git push -u origin feature/new-feature-name

# Merge to develop when ready
git checkout develop
git merge feature/new-feature-name
git push origin develop

# Deploy to production (merge to main)
git checkout main
git merge develop
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags
```

**Container Integration:**
- Containers use **volume mounts** (`.:/app`) for live code updates
- Switching branches updates code in running containers instantly
- No rebuild needed for code changes
- Restart container if dependencies change: `docker restart v0-dev-container`

**Commit Message Convention:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

### Important Git Rules
1. **Never commit secrets** - All `.env` files are gitignored
2. **Always pull before push** - Avoid merge conflicts
3. **Test before merging to main** - Ensure containers work
4. **Use descriptive commit messages** - Future you will thank you
5. **Tag releases** - Use semantic versioning (v1.0.0, v1.1.0, etc.)

### SSH Authentication Configured
- SSH key generated and added to GitHub
- No password required for git operations
- Key location: `~/.ssh/id_ed25519`

### File Management
- Project files tracked by Git in: `app/`, `components/`, `lib/`, `mcp-kroger-server/`, etc.
- Personal files relocated to: `~/Documents/8centrik-personal-files/`
- `.gitignore` prevents accidental commits of personal files

## Future Enhancements

### Staging Environment (When Needed)
Create `docker-compose.staging.yml`:
```yaml
services:
  staging:
    build: .
    container_name: 8centrik-staging
    ports:
      - "3002:3000"
    volumes:
      - .:/app
    env_file:
      - .env.staging
    networks:
      - v0-network
```

Deploy staging from `develop` branch:
```bash
git checkout develop
docker-compose -f docker-compose.staging.yml up -d
```

### CI/CD Pipeline (GitHub Actions)
Directory structure ready: `.github/workflows/`

Future workflows:
- `ci.yml` - Run tests and linting on PR
- `deploy-staging.yml` - Auto-deploy develop branch to staging
- `deploy-production.yml` - Deploy main branch to production

## MVP Deployment Architecture (Vercel + Railway Strategy)

### Production Deployment Strategy
**Status**: Planned - Not yet implemented

### Architecture Overview
```
User → Vercel (Frontend + API) → Railway (MCP Server) → Supabase (Database)
                                     ↓
                              Kroger API (OAuth)
```

### Production Stack

**Frontend Hosting: Vercel (FREE tier)**
- Next.js application (React UI)
- API routes (serverless functions)
- Automatic deployments from GitHub
- Preview URLs for every PR
- Custom domain support
- Global CDN (fast worldwide)
- SSL certificates (automatic)

**Backend Hosting: Railway (FREE $5 credit/month)**
- MCP Kroger Server (Express.js)
- Kroger OAuth integration
- Meal plan generation
- Product search and cart management
- Persistent storage for tokens
- Auto-deploys from GitHub

**Database: Supabase (FREE tier)**
- PostgreSQL database
- Authentication system
- Row Level Security (RLS)
- File storage
- Already configured

**Total MVP Cost**: ~$0-1/month (domain only)

### Deployment Workflow

**Local Development (Current)**
```bash
# Docker with hot reload (ports 3000/3001)
docker-compose up
# Edit code → instant updates
git checkout -b feature/new-feature
git commit -m "feat: add feature"
git push origin feature/new-feature
```

**Automated Preview Deployments**
```
PR created → Vercel auto-deploys to:
https://8centrik-git-feature-name-dmac.vercel.app

Share URL for testing before merge
```

**Staging Deployment**
```bash
git checkout develop
git merge feature/new-feature
git push origin develop

→ Vercel deploys to:
https://8centrik-git-develop-dmac.vercel.app
```

**Production Deployment**
```bash
git checkout main
git merge develop
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin main --tags

→ Vercel deploys to:
https://8centrik.vercel.app (or custom domain)
```

### Environment Configuration

**Vercel Environment Variables** (Set in Vercel Dashboard)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_MCP_SERVER_URL=https://kroger-mcp.railway.app
NODE_ENV=production
```

**Railway Environment Variables** (Set in Railway Dashboard)
```env
KROGER_CLIENT_ID=xxx
KROGER_CLIENT_SECRET=xxx
KROGER_REDIRECT_URI=https://kroger-mcp.railway.app/auth/callback
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
PORT=3001
NODE_ENV=production
```

### Deployment Setup Steps (When Ready)

**1. Vercel Setup**
```bash
# Install Vercel CLI
npm i -g vercel

# Link repository
vercel link

# Deploy
vercel --prod
```

**2. Railway Setup**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link project
railway login
railway init

# Deploy MCP server
railway up
```

**3. Configure DNS** (Optional - for custom domain)
```
Add CNAME record:
8centrik.com → cname.vercel-dns.com
```

### Why This Architecture?

**For Non-Technical Founders:**
- ✅ **Zero server management** - Fully managed platforms
- ✅ **Git-based deployments** - Push = deploy
- ✅ **Free for MVP** - Scale costs with revenue
- ✅ **Automatic HTTPS** - Security built-in
- ✅ **Preview deployments** - Test before production
- ✅ **Warp-friendly** - AI can deploy via CLI

**Scaling Path:**
- **0-100 users**: Free tier (Vercel + Railway credit + Supabase)
- **100-1000 users**: ~$25/month (Vercel Pro + Railway + Supabase Pro)
- **1000+ users**: ~$100-200/month (Professional tiers)

### Alternative Considered: All-Docker

**Why NOT chosen for production:**
- ❌ Requires server management (DigitalOcean, AWS)
- ❌ Manual scaling configuration
- ❌ SSL certificate setup needed
- ❌ More complex for non-technical founders
- ❌ Higher monthly cost ($20+ minimum)
- ❌ No automatic preview deployments

**Docker still used for:**
- ✅ Local development (hot reload)
- ✅ Local staging tests (optional)
- ✅ Consistent dev environment

### File Structure (Planned)
```
v0-app/
├── docker-compose.yml              # Dev environment (keep)
├── docker-compose.staging.yml      # Local staging test (optional)
├── vercel.json                     # Vercel configuration (to create)
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Test on PR (to create)
│       └── preview.yml             # Preview comments (optional)
├── .env.local                      # Dev secrets (gitignored)
├── .env.example                    # Template for deployment
└── railway.toml                    # Railway config (auto-generated)
```

### Deployment Checklist (When Ready to Deploy)

**Pre-Deployment:**
- [ ] Create Vercel account
- [ ] Create Railway account  
- [ ] Review environment variables
- [ ] Test production build locally
- [ ] Prepare custom domain (optional)

**Initial Deployment:**
- [ ] Connect GitHub to Vercel
- [ ] Deploy MCP server to Railway
- [ ] Configure environment variables
- [ ] Test Vercel → Railway connection
- [ ] Verify Kroger OAuth flow
- [ ] Test end-to-end meal planning

**Post-Deployment:**
- [ ] Monitor Railway logs
- [ ] Check Vercel analytics
- [ ] Set up error monitoring (Sentry - optional)
- [ ] Document deployment process
- [ ] Create rollback procedure

## Survey → AI Insights Feature ✅ COMPLETED (POC)

### Status: Fully Working POC - End-to-End Flow Complete

**Completed:**
- ✅ Simplified questionnaire with hardcoded 8 questions
- ✅ Survey UI with 1-5 slider scale (React component)
- ✅ OpenAI integration in MCP server (port 3001)
- ✅ AI insights endpoint: `POST /api/insights/generate`
- ✅ Results display page (`app/components/onboarding/insights-results.tsx`)
- ✅ Scale mapping (1-5 → 1-3 for AI processing)
- ✅ Integrated into onboarding flow (step 3)
- ✅ OpenAI API key configured (project: 8centrik)
- ✅ Full flow tested: Survey → AI Analysis → Formatted Insights

**Implementation Details:**
- **Questionnaire**: `app/components/onboarding/onboarding-questionnaire.tsx`
  - 8 hardcoded questions matching database seed
  - Local state management (no auth required)
  - Returns answers to parent via `onComplete({ questionnaire: answers })`
- **AI Endpoint**: `mcp-kroger-server/src/index.ts` (line 147)
  - Model: `gpt-4o-mini`
  - Temperature: 0.3
  - Minimal system prompt (~50 tokens)
  - JSON response format
  - Maps 1-5 scale to 1-3 before sending to AI
- **Results Page**: `app/components/onboarding/insights-results.tsx`
  - Fetches from `/api/insights/generate`
  - Displays: summary, top concerns, recommendations, supplements, foods
  - Loading state with spinner
  - Error handling with retry

**POC Approach (Simplified for Speed):**
- Hardcoded questions in React component (no database fetch)
- No authentication required
- No session persistence
- Answers stored in local state only
- Direct OpenAI API call (Chat Completions API)
- Simple system prompt to minimize token usage
- JSON response format enforced

**Future Enhancements (Post-POC):**
- Load questions from `survey_questions` table
- Implement user authentication and session management
- Add RLS policies for data security
- Save responses to `survey_responses` table
- Create `ai_reports` table records
- Migrate UI to 1-3 scale (instead of 1-5)
- Add response persistence and resume capability

## Kroger Integration ✅ COMPLETED (POC with Mock Data)

### Status: Fully Working with Mock Data

**Completed:**
- ✅ OAuth flow integration (connect with Kroger account)
- ✅ Mock token storage for authenticated users
- ✅ Store selection endpoint (returns mock stores)
- ✅ Meal plan generation (returns mock weekly plan)
- ✅ Grocery list generation from meals
- ✅ Order placement endpoint (mock cart creation)
- ✅ Integration UI component with multi-step wizard
- ✅ Full end-to-end flow tested

**Implementation Details:**
- **OAuth Flow** (`mcp-kroger-server/src/index.ts` line 284-337):
  - Endpoint: `GET /auth/kroger?userId=xxx`
  - Generates Kroger OAuth URL with correct scopes
  - Scopes: `profile.compact cart.basic:write`
  - Redirect URI: `http://localhost:3001/auth/callback`
  - On callback: stores mock token, closes popup
  - No real Kroger API calls (POC approach)

- **Stores Endpoint** (line 339-374):
  - Endpoint: `GET /api/stores?userId=xxx`
  - Returns 2 mock Kroger stores in Austin, TX
  - Requires user to have token in `userTokens` map

- **Meal Plan Generation** (line 216-260):
  - Endpoint: `POST /api/meal-plan/ai-generate`
  - Returns mock 5-day meal plan (Monday-Friday)
  - Includes breakfast, lunch, snack, dinner for each day
  - Frontend converts to meals array format

- **Grocery List** (line 262-281):
  - Endpoint: `POST /api/meal-plan/grocery-list`
  - Returns 6 mock grocery items with prices
  - Items: salmon, beef, chicken, spinach, berries, avocados

- **Order Placement** (line 376-404):
  - Endpoint: `POST /api/orders`
  - Accepts: userId, items array, storeId
  - Calculates total price from items
  - Returns: sessionId, cart URL, estimated total
  - Mock success response (no real cart creation)

**UI Components:**
- **Kroger Integration Modal**: `app/components/kroger-integration.tsx`
  - 4-step wizard: Authorize → Verify → Setup Stores → Complete
  - Opens OAuth in popup window
  - Handles connection status
  - Shows disconnect option when connected

- **Meal Planner**: `app/components/meal-planner.tsx`
  - Generate meal plan button
  - Displays meals in card format
  - Order groceries button
  - Shows order progress and success modal
  - Opens Kroger cart URL on success

**Kroger API Configuration:**
- Client ID: `healthapp-bbc6mg8f`
- Redirect URI: `http://localhost:3001/auth/callback`
- Environment: Development
- Status: Mock data only (no real API integration)

**POC Trade-offs:**
- ✅ Full UX flow works end-to-end
- ✅ OAuth authentication tested with real Kroger login
- ✅ No database persistence (in-memory tokens)
- ✅ Mock product data instead of real Kroger catalog
- ✅ No real cart creation on Kroger side
- ✅ Preserves all UI/UX for future real integration

**Future Enhancements (Production):**
- Implement real Kroger API token exchange
- Store tokens in Supabase `user_kroger_tokens` table
- Fetch real products from Kroger API
- Implement actual cart creation via Kroger API
- Add product search and matching logic
- Handle token refresh flow
- Add error handling for API failures
- Implement cart session tracking in `grocery_cart_sessions` table

---

## 🎯 Next Story: Login/Signup with User Persistence (PRIORITY)

### Epic: Authentication & User Onboarding Flow

**User Story:**
- **As a** returning user, **I want** to log in to my account **so that** I can access my saved data without going through the setup flow again
- **As a** new user, **I want** to sign up for an account **so that** I can use the health app and save my progress

### Acceptance Criteria

**AC1: Login Page is First Screen**
- When user opens `http://localhost:3000`, they see login page (not onboarding)
- Login page shows: Email field, Password field, "Log In" button, "Sign Up" link
- Design matches app's green/blue gradient theme

**AC2: New User Signup Flow**
- User clicks "Sign Up" link → navigates to signup page
- Signup form shows: Email, Password, Confirm Password fields
- User submits → account created in Supabase Auth
- After signup → redirect to onboarding flow (step 1: Profile Creation)
- User completes onboarding → flag stored in `user_profiles.onboarding_completed_at`

**AC3: Returning User Login Flow**
- User enters email/password → clicks "Log In"
- Credentials validated via Supabase Auth
- If onboarding complete → redirect to main app (Home/Dashboard)
- If onboarding NOT complete → redirect to onboarding flow (resume where left off)

**AC4: Session Persistence**
- User remains logged in after page refresh (Supabase session)
- Protected routes check auth status before rendering
- Logout button available in main app
- After logout → redirect to login page

**AC5: Error Handling**
- Invalid credentials → show error message
- Weak password → show validation error
- Email already exists → show error on signup
- Network error → show retry option

### Files to Create
- `app/login/page.tsx` - Login page
- `app/signup/page.tsx` - Signup page
- `app/home/page.tsx` - Main app (post-onboarding)

### Files to Modify
- `app/page.tsx` - Check auth before showing onboarding
- `app/components/onboarding-flow.tsx` - Accept user ID, mark onboarding complete

### Database Setup
```sql
-- Ensure user_profiles table exists
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  onboarding_completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow insert for new signups
CREATE POLICY "Allow insert on signup" ON user_profiles
  FOR INSERT WITH CHECK (true);
```

### Estimated Time: 3-4 hours
- Login page: 45 mins
- Signup page: 45 mins
- Auth routing logic: 1 hour
- Home page setup: 45 mins
- Testing & fixes: 45 mins

### Success Metrics (POC)
- ✅ User can sign up and data is stored in Supabase
- ✅ User can log in with credentials
- ✅ New users go through onboarding once
- ✅ Returning users skip onboarding and go to home
- ✅ Session persists across page refreshes
- ✅ Logout works and redirects properly

### POC Approach
- Skip email verification for speed (users can log in immediately)
- No password reset flow (post-POC)
- No social login (post-POC)
- Simple RLS policies for security

**Full implementation details:** See `docs/user-story-login-auth.md`

---

## 📋 Story Sequence Roadmap (Post-Login Implementation)

### Phase 1: Foundation (Current)
1. ✅ **Survey → AI Insights** (COMPLETED)
2. ✅ **Kroger Integration** (COMPLETED)
3. 🎯 **Login/Signup with User Persistence** (NEXT - 3-4 hours)

### Phase 2: Data Persistence & User Experience (After Login)
4. **Save Survey Responses to Database** (4-5 hours)
   - Load questions from `survey_questions` table
   - Store responses in `survey_responses` table
   - Implement session resume capability
   - Add RLS policies for user data

5. **Store AI Insights in Database** (3-4 hours)
   - Save AI reports to `ai_reports` table
   - Create insights history page
   - Allow users to view past reports
   - Add "Regenerate" button for new insights

6. **User Profile Management** (3-4 hours)
   - Display user name in header
   - Settings page (name, email, password change)
   - Profile photo upload (optional)
   - Account deletion (with confirmation)

### Phase 3: Enhanced Features (MVP-Ready)
7. **Dashboard/Home Page Improvements** (4-5 hours)
   - Show recent AI insights summary
   - Quick access to meal plans
   - Progress tracking (surveys completed, meals planned)
   - Health score visualization

8. **Meal Plan History & Favorites** (4-5 hours)
   - Save generated meal plans to database
   - View past meal plans
   - Mark meals as favorites
   - Recipe details and instructions

9. **Kroger Integration - Real API** (8-10 hours)
   - Implement real token exchange
   - Store tokens in `user_kroger_tokens` table
   - Fetch real products from Kroger API
   - Handle token refresh flow
   - Error handling for API failures

### Phase 4: Polish & Production-Ready
10. **Error Handling & Loading States** (2-3 hours)
    - Consistent error messages across app
    - Loading skeletons for async operations
    - Retry logic for failed requests
    - Offline mode indicators

11. **Email Verification & Password Reset** (4-5 hours)
    - Enable Supabase email confirmation
    - "Forgot password" flow
    - Email templates customization
    - Resend verification email option

12. **Testing & Bug Fixes** (5-8 hours)
    - End-to-end testing of all flows
    - Mobile responsive fixes
    - Browser compatibility testing
    - Performance optimization

### Phase 5: Deployment (When Ready)
13. **Vercel + Railway Deployment** (3-4 hours)
    - Deploy frontend to Vercel
    - Deploy MCP server to Railway
    - Configure environment variables
    - Set up custom domain
    - SSL and security headers

---

## 📊 Story Estimation Summary

**Current POC Complete:**
- Survey → AI Insights: ✅ Working
- Kroger Integration: ✅ Working (mock data)

**Immediate Priority (MVP Foundation):**
- Login/Signup: 3-4 hours (NEXT)
- Survey DB Integration: 4-5 hours
- AI Insights DB: 3-4 hours
- User Profile: 3-4 hours

**Total to MVP-Ready:** ~40-50 hours
**Total to Production:** ~60-75 hours

---

### Implementation Roadmap (Database Integration - Deferred for Now)

#### **Story 2-3: Survey UI with Database Loading** (3 hours)
**Goal:** Update questionnaire component to load questions from database

**Files to modify:**
- `app/components/onboarding/onboarding-questionnaire.tsx`

**Tasks:**
1. Add Supabase client to fetch questions:
```typescript
const { data: questions } = await supabase
  .from('survey_questions')
  .select('*')
  .eq('is_active', true)
  .eq('version', 1)
  .order('code');
```

2. Create or resume session:
```typescript
const { data: session } = await supabase
  .from('survey_sessions')
  .select('*')
  .eq('user_id', user.id)
  .eq('status', 'in_progress')
  .order('started_at', { ascending: false })
  .limit(1)
  .single();

if (!session) {
  const { data: newSession } = await supabase
    .from('survey_sessions')
    .insert({ user_id: user.id, version: 1 })
    .select()
    .single();
}
```

3. Implement UPSERT for answer saves:
```typescript
const saveAnswer = async (questionId: string, value: number) => {
  await supabase
    .from('survey_responses')
    .upsert({
      session_id: sessionId,
      user_id: user.id,
      question_id: questionId,
      answer_value: value
    }, {
      onConflict: 'session_id,question_id'
    });
};
```

4. Add debounce (300ms) to prevent excessive writes
5. Show "Saving..." indicator during writes
6. On submit: set session status to 'submitted'

**Testing:**
- Log in as test user
- Answer questions → verify saves to database
- Refresh page → verify session resumes
- Submit → verify status changes

---

#### **Story 4-5: Processing Screen** (2 hours)
**Goal:** Show processing animation and poll for AI results

**Files to create:**
- `app/setup/processing/page.tsx`

**Tasks:**
1. Create processing page component:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ProcessingPage() {
  const [status, setStatus] = useState<'processing' | 'succeeded' | 'failed'>('processing')
  const router = useRouter()

  useEffect(() => {
    const pollResults = setInterval(async () => {
      const { data: report } = await supabase
        .from('ai_reports')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (report?.status === 'succeeded') {
        setStatus('succeeded')
        clearInterval(pollResults)
      } else if (report?.status === 'failed') {
        setStatus('failed')
        clearInterval(pollResults)
      }
    }, 1500) // Poll every 1.5s

    return () => clearInterval(pollResults)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>You've completed the survey!</h1>
      {status === 'processing' && (
        <>
          <div className="animate-spin">Processing your data...</div>
          <div className="w-full max-w-md aspect-video border-2 border-dashed">
            What to expect (coming soon)
          </div>
        </>
      )}
      {status === 'succeeded' && (
        <button onClick={() => router.push('/insights/latest')}>
          View my results
        </button>
      )}
      {status === 'failed' && (
        <div>
          <p>Something went wrong</p>
          <button onClick={() => triggerRegeneration()}>Try again</button>
        </div>
      )}
    </div>
  )
}
```

2. Add 16:9 placeholder for video (TODO P2)
3. Route from questionnaire submit to /setup/processing

**Testing:**
- Submit survey → redirects to processing
- Verify polling starts
- Mock AI report status changes

---

#### **Story 6-8: Backend OpenAI Integration** (6 hours)
**Goal:** Add OpenAI to MCP server, create endpoints

**Files to modify:**
- `mcp-kroger-server/package.json` - Add openai dependency
- `mcp-kroger-server/src/index.ts` - Add endpoints
- `mcp-kroger-server/.env` - Add OPENAI_API_KEY

**Tasks:**

1. Install OpenAI SDK:
```bash
cd mcp-kroger-server
npm install openai
```

2. Add environment variable:
```env
OPENAI_API_KEY=sk-...
MODEL_NAME=gpt-4o-mini
```

3. Create mapping function (1-5 → 1-3):
```typescript
// POC: Map 1-5 scale to 1-3 for AI
// TODO P2: Remove after UI migrates to 1-3
function mapToThreeScale(value: number): 1 | 2 | 3 {
  if (value <= 2) return 1; // Low
  if (value <= 4) return 2; // Moderate
  return 3; // High
}
```

4. Create endpoint: `POST /v1/insights/generate`
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

app.post('/v1/insights/generate', async (req, res) => {
  const userId = req.body.user_id // TODO: Get from auth token
  
  // Get latest submitted session
  const { data: session } = await supabase
    .from('survey_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()
  
  // Get answered questions (only 1-5, map to 1-3)
  const { data: responses } = await supabase
    .from('survey_responses')
    .select(`
      answer_value,
      survey_questions (question_text)
    `)
    .eq('session_id', session.id)
    .not('answer_value', 'is', null)
  
  const items = responses.map(r => ({
    q: r.survey_questions.question_text,
    a: mapToThreeScale(r.answer_value) // Map to 1-3
  }))
  
  // Create AI report record
  const { data: report } = await supabase
    .from('ai_reports')
    .insert({
      user_id: userId,
      session_id: session.id,
      status: 'processing',
      input_items_count: items.length
    })
    .select()
    .single()
  
  const started = Date.now()
  
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT // From original spec
        },
        {
          role: 'user',
          content: JSON.stringify({
            survey: { items }
          })
        }
      ]
    })
    
    const resultText = completion.choices[0]?.message?.content || '{}'
    const resultJson = JSON.parse(resultText)
    
    // Update report with success
    await supabase
      .from('ai_reports')
      .update({
        status: 'succeeded',
        model: completion.model,
        result_json: resultJson,
        result_text: renderHumanSummary(resultJson),
        latency_ms: Date.now() - started
      })
      .eq('id', report.id)
    
    res.json({ status: 'succeeded', report_id: report.id })
    
  } catch (error) {
    // Update report with failure
    await supabase
      .from('ai_reports')
      .update({
        status: 'failed',
        error_code: error.code || 'MODEL_ERROR',
        error_message: error.message,
        latency_ms: Date.now() - started
      })
      .eq('id', report.id)
    
    res.status(500).json({ error: error.message })
  }
})
```

5. Create endpoint: `GET /v1/insights/latest`
```typescript
app.get('/v1/insights/latest', async (req, res) => {
  const userId = req.query.user_id // TODO: Get from auth
  
  const { data: report } = await supabase
    .from('ai_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (!report) {
    return res.json({ status: 'none' })
  }
  
  res.json(report)
})
```

6. Add SYSTEM_PROMPT (use JSON schema from original spec)

**Testing:**
- Submit survey
- Call `/v1/insights/generate`
- Verify AI report created with status 'processing'
- Verify OpenAI called successfully
- Check result_json matches schema

---

#### **Story 9: Results Page** (4 hours)
**Goal:** Display AI insights in structured format

**Files to create:**
- `app/insights/latest/page.tsx`

**Tasks:**

1. Create results page:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function InsightsPage() {
  const [report, setReport] = useState<any>(null)
  
  useEffect(() => {
    async function loadReport() {
      const { data } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      setReport(data)
    }
    loadReport()
  }, [])
  
  if (!report) return <div>Loading...</div>
  
  const insights = report.result_json
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1>Your Health Insights</h1>
      
      {/* Summary */}
      <section>
        <h2>Summary</h2>
        <p>{insights.summary}</p>
      </section>
      
      {/* Root Causes */}
      <section>
        <h2>Potential Root Causes</h2>
        {insights.root_causes?.map((cause, i) => (
          <div key={i}>
            <h3>{cause.name}</h3>
            <p>{cause.description}</p>
            <span>Confidence: {(cause.confidence * 100).toFixed(0)}%</span>
          </div>
        ))}
      </section>
      
      {/* Education */}
      <section>
        <h2>Understanding Your Symptoms</h2>
        <ul>
          {insights.education?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>
      
      {/* 3-5 Week Outlook */}
      <section>
        <h2>What to Expect</h2>
        <p>{insights.outlook_3_5_weeks}</p>
      </section>
      
      {/* Supplements */}
      <section>
        <h2>Recommended Supplements</h2>
        {insights.supplements?.map((supp, i) => (
          <div key={i}>
            <h3>{supp.name}</h3>
            <p>Dose: {supp.dose}</p>
            <p>Timing: {supp.timing}</p>
            <p>Duration: {supp.duration}</p>
            {supp.cautions && <p className="text-yellow-600">⚠️ {supp.cautions}</p>}
          </div>
        ))}
      </section>
      
      {/* Foods */}
      <section>
        <h2>Nutrition Guidance</h2>
        <div>
          <h3>Emphasize:</h3>
          <ul>
            {insights.foods_emphasize?.map((food, i) => (
              <li key={i}>{food}</li>
            ))}
          </ul>
          <p>{insights.foods_emphasize_rationale}</p>
        </div>
        <div>
          <h3>Avoid:</h3>
          <ul>
            {insights.foods_avoid?.map((food, i) => (
              <li key={i}>{food}</li>
            ))}
          </ul>
          <p>{insights.foods_avoid_rationale}</p>
        </div>
      </section>
      
      {/* Cost & Time */}
      <section>
        <h2>Investment Required</h2>
        <p>Monthly Cost: ${insights.monthly_cost_usd}</p>
        <p>Daily Time: {insights.daily_time_minutes} minutes</p>
      </section>
      
      {/* Next Steps */}
      <section>
        <h2>Next Steps</h2>
        <ol>
          {insights.next_steps?.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>
      
      {/* Actions */}
      <div className="flex gap-4">
        <button onClick={() => window.print()}>Save as PDF</button>
        <button onClick={() => alert('Share feature TODO P2')}>Share with Coach</button>
      </div>
      
      {/* Disclaimer */}
      <section className="text-sm text-gray-600">
        <p>{insights.disclaimer}</p>
      </section>
    </div>
  )
}
```

2. Add proper styling with Tailwind
3. Handle missing/invalid JSON gracefully
4. Add loading states

**Testing:**
- View insights page after AI generation
- Verify all sections render
- Test with missing data fields
- Test print functionality

---

#### **Story 10: Error Handling & Polish** (1 hour)
**Goal:** Add error states and retry logic

**Tasks:**
1. Add error boundaries to React components
2. Implement retry button on processing screen
3. Add user-friendly error messages
4. Test with failed AI calls
5. Add basic logging (console.log for now)

---

### Testing Checklist

**End-to-End Flow:**
- [ ] User logs in
- [ ] Opens questionnaire
- [ ] Questions load from database
- [ ] Answers save on each change
- [ ] Submit button appears when >3 answered
- [ ] Redirects to processing screen
- [ ] Processing animation shows
- [ ] MCP server calls OpenAI
- [ ] Results appear on insights page
- [ ] All sections render correctly
- [ ] Print works

**Error Cases:**
- [ ] No internet during save
- [ ] OpenAI API error
- [ ] Invalid JSON from AI
- [ ] Retry button works

---

### POC Scope - Deferred Items

```typescript
// TODO P2: Video player (replace placeholder)
// TODO P2: Question versioning & migration UI
// TODO P2: SSE streaming for AI output
// TODO P2: Insights history endpoint
// TODO P2: Server-side PDF generation
// TODO P2: Full accessibility audit
// TODO P2: OpenTelemetry tracing
// TODO P2: Migrate to 1-3 scale UI
```

---

### Scale Migration Plan (Post-POC)

**When to migrate from 1-5 to 1-3:**
- After POC validated with stakeholders
- After user testing confirms scale preference
- After AI quality verified with mapped values

**Migration steps documented in:** `/docs/scale-migration-plan.md` (TODO)

---

This context should help maintain continuity across Warp sessions and provide comprehensive project understanding for AI assistance.
