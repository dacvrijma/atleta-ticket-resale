# Spec for Authentication Forms

branch: claude/feature/authentication-forms

## Summary

Create functional authentication forms for the `/login` and `/signup` pages. Each form includes email and password input fields with password visibility toggle, form validation, and submit functionality. Forms will log credentials to the console for now (no backend integration). Users should be able to easily navigate between login and signup pages.

## Functional Requirements

- **Email input field**
  - Standard text input with `type="email"`
  - Labeled "Email" or "Email Address"
  - Should accept valid email format

- **Password input field**
  - Password input with `type="password"` (hidden by default)
  - Labeled "Password"
  - Toggle button/icon to show/hide password text
  - When toggled, switches between `type="password"` and `type="text"`

- **Password visibility toggle**
  - Icon button positioned within or adjacent to password field
  - Use eye icon (e.g., from Lucide React: `Eye` for show, `EyeOff` for hide)
  - Clicking toggles password visibility
  - Accessible label for screen readers

- **Submit button**
  - On `/login` page: labeled "Log In" or "Sign In"
  - On `/signup` page: labeled "Sign Up" or "Create Account"
  - Triggers form submission
  - Prevents default form behavior

- **Form submission**
  - On submit, prevent page reload
  - Log email and password to console in format: `{ email: '...', password: '...' }`
  - No actual authentication or API calls at this stage

- **Navigation between forms**
  - Each page should include a link to the other page
  - Example on login page: "Don't have an account? Sign up"
  - Example on signup page: "Already have an account? Log in"
  - Links should use Next.js `<Link>` component for client-side navigation

## Possible Edge Cases

- Empty form submission (no email or password entered)
- Invalid email format (e.g., missing @ symbol)
- Very long email or password strings
- Password field toggled multiple times rapidly
- Pressing Enter key to submit form vs clicking submit button
- Browser autofill interfering with password visibility toggle

## Acceptance Criteria

- [ ] Login page (`/login`) displays a form with email, password, and submit button
- [ ] Signup page (`/signup`) displays a form with email, password, and submit button
- [ ] Password fields have a toggle icon that shows/hides password text
- [ ] Clicking the password toggle switches between hidden and visible password
- [ ] Submit button on login page says "Log In" (or similar)
- [ ] Submit button on signup page says "Sign Up" (or similar)
- [ ] Submitting login form logs credentials to console
- [ ] Submitting signup form logs credentials to console
- [ ] Forms do not reload the page on submit
- [ ] Each page has a link to navigate to the other page
- [ ] Links between pages work correctly using Next.js routing
- [ ] Forms are visually consistent with existing app styling
- [ ] Forms are keyboard accessible (can tab through fields and submit with Enter)

## Open Questions

- Should we add a "Confirm Password" field on the signup page? No.
- Should we implement any client-side validation (e.g., minimum password length)? No.
- Should we show validation error messages, or just console log for now? Yes..
- What should happen after successful form submission (e.g., clear form, show message)? Console log for now.

## Testing Guidelines

Create test files in the `./tests` folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Form renders with all required fields (email, password, submit button)
- Password toggle icon is present
- Clicking password toggle changes input type from password to text
- Form submission prevents default page reload
- Form submission logs correct data to console
- Navigation link to the other page is present and has correct href
- Submit button has correct label based on page (login vs signup)
