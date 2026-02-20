# Implementation Plan: Authentication Forms

## Context

The `/login` and `/signup` pages currently display only placeholder headings. This feature adds functional authentication forms to both pages with email and password fields, password visibility toggle, and form submission handling. The forms will log credentials to the console (no backend integration yet) and include navigation links between the two pages.

This is an early-stage implementation focused on UI and basic form handling. Per the spec clarifications, there will be no client-side validation error messages shown to users - validation feedback goes to console only. The focus is on creating a clean, functional form interface consistent with the app's dark theme design.

## Architecture Decision

**Implement forms directly in page components** - no separate reusable form components.

**Rationale:**
- Only 2 forms with identical structure (login/signup differ only in labels)
- Spec is minimal: console logging only, no validation UI
- No existing form component library in the codebase
- YAGNI principle: don't create abstractions until we have 3+ use cases
- Simpler to test and maintain for this scope

Each page will be a client component managing its own state with React hooks.

## Files to Modify

### 1. `app/(public)/login/page.tsx`
**Current state:** Placeholder with heading only (also has a bug - function is named `SignupPage`)

**Changes:**
- Add `"use client"` directive
- Import `useState` from React, `Link` from next/link, icons from lucide-react (`Mail`, `Lock`, `Eye`, `EyeOff`)
- Fix function name to `LoginPage`
- Add form state: `email`, `password`, `showPassword`
- Implement form with:
  - Email input field with Mail icon
  - Password input field with Lock icon + Eye/EyeOff toggle button
  - Submit button labeled "Log In"
  - Link to signup: "Don't have an account? Sign up"
- Form submission handler: `preventDefault()` and `console.log({ email, password })`
- Style with Tailwind utilities + existing `.btn`, `.form-title` classes
- Use CSS variables from globals.css for colors

### 2. `app/(public)/signup/page.tsx`
**Current state:** Placeholder with heading only

**Changes:**
- Nearly identical to login page structure
- Different labels:
  - Heading: "Sign up for an Account" (keep existing text)
  - Submit button: "Sign Up"
  - Link: "Already have an account? Log in" → `/login`

## Files to Create

### 3. `tests/pages/login.test.tsx`
**New test file** for login page integration tests

**Test cases:**
- Form renders with all required fields (email, password, submit button)
- Password input has `type="password"` initially
- Password toggle button exists
- Clicking toggle switches input type between "password" and "text"
- Toggle icon switches between Eye and EyeOff
- Form submission prevents default and logs credentials to console
- Link to signup page exists with correct href
- Submit button has "Log In" label

### 4. `tests/pages/signup.test.tsx`
**New test file** for signup page integration tests

**Test cases:**
- Same as login tests but with signup-specific assertions:
  - Submit button says "Sign Up"
  - Link points to "/login"
  - Link text is "Already have an account? Log in"

## Implementation Details

### Form State Management
Each page uses local `useState`:
```typescript
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [showPassword, setShowPassword] = useState(false)
```

### Form Structure Pattern
```typescript
<form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
  {/* Email field container with icon */}
  <div className="relative mb-4">
    <Mail icon positioned absolutely />
    <input type="email" with padding for icon />
  </div>

  {/* Password field container with lock icon + toggle */}
  <div className="relative mb-4">
    <Lock icon positioned absolutely />
    <input type={showPassword ? "text" : "password"} />
    <button type="button" onClick={togglePassword} with Eye/EyeOff icon />
  </div>

  {/* Submit button */}
  <button type="submit" className="btn w-full">
    Log In / Sign Up
  </button>

  {/* Link to other page */}
  <p className="text-center mt-4">
    <Link href="/signup or /login">navigation text</Link>
  </p>
</form>
```

### Event Handlers
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  console.log({ email, password })
}

const togglePasswordVisibility = () => {
  setShowPassword(prev => !prev)
}
```

### Styling Approach

**Use Tailwind utilities + CSS variables:**
- Form container: `max-w-md mx-auto mt-8` (centered, max width)
- Input fields: Dark background (`bg-[var(--color-light)]`), light border (`border-[var(--color-lighter)]`)
- Focus state: Primary color border (`focus:border-[var(--color-primary)]`)
- Submit button: Existing `.btn` class (primary background, hover secondary)
- Icons: `var(--color-body)` for muted appearance
- Layout: Relative container for inputs, absolute positioning for icons
- Left padding on inputs to accommodate icons (e.g., `pl-12`)

**Input Field Example:**
```typescript
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--color-light)]
             border border-[var(--color-lighter)] text-white
             focus:outline-none focus:border-[var(--color-primary)]
             transition-colors"
  placeholder="Enter your email"
  required
/>
```

### Password Toggle Implementation

**Toggle button positioning:**
- Absolute positioned in top-right of password input
- Type `button` to prevent form submission
- Shows Eye icon when password is hidden
- Shows EyeOff icon when password is visible

**Example:**
```typescript
<button
  type="button"
  onClick={togglePasswordVisibility}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-body)]
             hover:text-[var(--color-primary)] transition-colors"
  aria-label={showPassword ? "Hide password" : "Show password"}
>
  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
</button>
```

### Accessible Labels

Use semantic HTML with labels:
```typescript
<label htmlFor="email" className="block text-sm font-medium mb-2">
  Email
</label>
<input id="email" type="email" ... />
```

## Testing Strategy

### Testing Setup
- Create `/tests/pages/` directory (new)
- Use Vitest + React Testing Library (already configured)
- Mock `console.log` with `vi.spyOn(console, "log")`

### Test Pattern Example
```typescript
import { render, screen, fireEvent } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"
import LoginPage from "@/app/(public)/login/page"

describe("LoginPage", () => {
  let consoleLogSpy: any

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
  })

  it("logs credentials on form submission", () => {
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", { name: /log in/i })

    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    expect(consoleLogSpy).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123"
    })
  })

  it("toggles password visibility", () => {
    render(<LoginPage />)

    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByLabelText(/show password/i)

    expect(passwordInput).toHaveAttribute("type", "password")

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute("type", "text")

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute("type", "password")
  })
})
```

### Key Test Assertions
- Form elements present with correct labels
- Password toggle changes input type
- Form submission calls console.log with correct data
- preventDefault prevents page reload
- Navigation links have correct hrefs
- Icons switch between Eye and EyeOff

## Implementation Sequence

1. **Login page** - Implement full form with state, handlers, styling
2. **Login tests** - Write comprehensive tests, ensure all pass
3. **Signup page** - Copy login structure, update labels and links
4. **Signup tests** - Copy login tests, update assertions for signup

## Verification Steps

### Manual Testing
1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Verify form displays with email field, password field, submit button
4. Type in email and password fields - verify values update
5. Click password toggle - verify password becomes visible/hidden
6. Click submit - verify credentials logged to browser console
7. Click "Sign up" link - verify navigates to signup page
8. Repeat tests 3-7 on signup page
9. Verify keyboard navigation works (Tab through fields, Enter to submit)

### Automated Testing
1. Run tests: `npm test`
2. Verify all tests pass:
   - `tests/pages/login.test.tsx` - all tests green
   - `tests/pages/signup.test.tsx` - all tests green
3. Run tests in watch mode during development: `npm test`

### Console Output Verification
Expected console output on form submission:
```javascript
{ email: "test@example.com", password: "password123" }
```

## Critical Files Reference

- **app/globals.css** - CSS variables and utility classes (`.btn`, `.form-title`, colors)
- **app/(public)/login/page.tsx** - Login form implementation
- **app/(public)/signup/page.tsx** - Signup form implementation
- **tests/pages/login.test.tsx** - Login form tests
- **tests/pages/signup.test.tsx** - Signup form tests
