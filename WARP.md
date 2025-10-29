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

This context should help maintain continuity across Warp sessions and provide comprehensive project understanding for AI assistance.
