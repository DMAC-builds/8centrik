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

## Survey → AI Insights Feature (In Progress)

### Current Status: Database Layer Complete ✅

**Completed:**
- ✅ Database schema created (survey_questions, survey_sessions, survey_responses, ai_reports)
- ✅ RLS policies with auth.uid()
- ✅ Connected to production Supabase (sfirayzjkugowzeyuyns)
- ✅ Migration script: `database/migrations/001_survey_ai_insights.sql`
- ✅ Seed script: `scripts/seed-survey-questions.js`
- ✅ Feature branch: `feature/survey-ai-insights`

**POC Approach:**
- Using 1-5 scale (existing UI)
- Will map to 1-3 for AI processing
- Migration to 1-3 scale deferred to post-POC

### Implementation Roadmap (Remaining Work: ~16 hours)

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
