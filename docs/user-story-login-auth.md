# User Story: Login/Signup with User Persistence (POC)

## Epic
Authentication & User Onboarding Flow

## User Story
**As a** returning user  
**I want** to log in to my account  
**So that** I can access my saved data without going through the setup flow again

**As a** new user  
**I want** to sign up for an account  
**So that** I can use the health app and save my progress

---

## Acceptance Criteria

### AC1: Login Page is First Screen
- [ ] When user opens `http://localhost:3000`, they see login page (not onboarding)
- [ ] Login page shows: Email field, Password field, "Log In" button, "Sign Up" link
- [ ] Design matches app's green/blue gradient theme

### AC2: New User Signup Flow
- [ ] User clicks "Sign Up" link → navigates to signup page
- [ ] Signup form shows: Email, Password, Confirm Password fields
- [ ] User submits → account created in Supabase Auth
- [ ] After signup → redirect to onboarding flow (step 1: Profile Creation)
- [ ] User completes onboarding → flag stored in `user_profiles.onboarding_completed_at`

### AC3: Returning User Login Flow
- [ ] User enters email/password → clicks "Log In"
- [ ] Credentials validated via Supabase Auth
- [ ] If onboarding complete → redirect to main app (Home/Dashboard)
- [ ] If onboarding NOT complete → redirect to onboarding flow (resume where left off)

### AC4: Session Persistence
- [ ] User remains logged in after page refresh (Supabase session)
- [ ] Protected routes check auth status before rendering
- [ ] Logout button available in main app
- [ ] After logout → redirect to login page

### AC5: Error Handling
- [ ] Invalid credentials → show error message
- [ ] Weak password → show validation error
- [ ] Email already exists → show error on signup
- [ ] Network error → show retry option

---

## Technical Implementation (POC Approach)

### Database Schema (Already Exists)
```sql
-- Supabase Auth handles: auth.users table
-- Custom profile table:
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  onboarding_completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Components to Create

#### 1. Login Page (`app/login/page.tsx`)
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      setError(signInError.message)
      return
    }

    // Check if onboarding is complete
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding_completed_at')
      .eq('id', data.user.id)
      .single()

    if (profile?.onboarding_completed_at) {
      router.push('/home') // Main app
    } else {
      router.push('/') // Onboarding flow
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to 8centrik</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" className="w-full">Log In</Button>
          </form>
          <p className="text-center mt-4 text-sm">
            Don't have an account? <Link href="/signup" className="text-blue-600">Sign Up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### 2. Signup Page (`app/signup/page.tsx`)
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // Create user profile
    if (data.user) {
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        email: data.user.email,
        onboarding_completed_at: null
      })
    }

    // Redirect to onboarding
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input 
              type="password" 
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" className="w-full">Sign Up</Button>
          </form>
          <p className="text-center mt-4 text-sm">
            Already have an account? <Link href="/login" className="text-blue-600">Log In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### 3. Update Root Page (`app/page.tsx`)
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { OnboardingFlow } from './components/onboarding-flow'
import { Loader2 } from 'lucide-react'

export default function RootPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Check onboarding status
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed_at')
        .eq('id', session.user.id)
        .single()

      if (profile?.onboarding_completed_at) {
        router.push('/home')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  const handleOnboardingComplete = async (data: any) => {
    // Mark onboarding as complete
    await supabase
      .from('user_profiles')
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq('id', user.id)

    router.push('/home')
  }

  return <OnboardingFlow onComplete={handleOnboardingComplete} />
}
```

#### 4. Home Page (`app/home/page.tsx`)
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MainApp } from '@/components/main-app'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setUserData(profile)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  }

  return <MainApp userData={userData} onLogout={handleLogout} />
}
```

---

## Files to Modify

### New Files
- `app/login/page.tsx` - Login page
- `app/signup/page.tsx` - Signup page
- `app/home/page.tsx` - Main app (post-onboarding)

### Modified Files
- `app/page.tsx` - Check auth before showing onboarding
- `app/components/onboarding-flow.tsx` - Accept user ID prop
- `lib/supabase.ts` - Already configured

---

## Database Setup

### 1. Ensure user_profiles table exists
```sql
-- Run in Supabase SQL Editor
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

-- Policy: Service role can insert profiles (for signup)
CREATE POLICY "Service role can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);
```

### 2. Enable email confirmation (Optional for POC)
```
Supabase Dashboard → Authentication → Settings
- Disable "Enable email confirmations" for faster POC testing
- Can enable later for production
```

---

## Testing Checklist

### Happy Path - New User
1. [ ] Open `http://localhost:3000` → redirects to `/login`
2. [ ] Click "Sign Up" → opens `/signup`
3. [ ] Enter email, password, confirm password → click "Sign Up"
4. [ ] User created in Supabase Auth
5. [ ] Profile created in `user_profiles` table
6. [ ] Redirected to onboarding flow
7. [ ] Complete onboarding → `onboarding_completed_at` is set
8. [ ] Redirected to `/home` (main app)

### Happy Path - Returning User
1. [ ] Open `http://localhost:3000` → redirects to `/login`
2. [ ] Enter valid credentials → click "Log In"
3. [ ] App checks `user_profiles.onboarding_completed_at`
4. [ ] Since complete → redirect to `/home` (main app)
5. [ ] User sees dashboard, not onboarding

### Edge Cases
1. [ ] Invalid email format → show validation error
2. [ ] Wrong password → show error message
3. [ ] Email already registered → show error on signup
4. [ ] Passwords don't match → show error
5. [ ] Network error → show retry option
6. [ ] User refreshes page → session persists
7. [ ] Logout → redirect to login, session cleared

---

## Success Metrics (POC)
- ✅ User can sign up and data is stored in Supabase
- ✅ User can log in with credentials
- ✅ New users go through onboarding once
- ✅ Returning users skip onboarding and go to home
- ✅ Session persists across page refreshes
- ✅ Logout works and redirects properly

---

## Out of Scope (Post-POC)
- Password reset flow
- Email verification
- Social login (Google, Apple)
- Multi-factor authentication
- Remember me checkbox
- Profile photo upload
- User settings page

---

## Estimated Time: 3-4 hours
- Login page: 45 mins
- Signup page: 45 mins
- Auth routing logic: 1 hour
- Home page setup: 45 mins
- Testing & fixes: 45 mins

---

## Dependencies
- Supabase Auth already configured ✅
- `user_profiles` table exists ✅
- Supabase client in `lib/supabase.ts` ✅
- UI components (Card, Button, Input) exist ✅

---

## Notes
- **POC Approach**: Skip email verification for speed (users can log in immediately)
- **Security**: RLS policies ensure users can only access their own data
- **UX**: Simple, clean login/signup flow matching app design
- **Future**: Can add password reset, social login, etc. after POC validation
