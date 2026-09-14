# StockPulse - Clinic Stock Console

Welcome to a simple, functional power tool, designed by Keya Ochieng'.

StockPulse is a clinic stock console for searching, filtering, and correcting inventory from ward tablets, where every item is a shareable URL and every screen stays usable when the network is slow or a request fails.

Built on [DummyJSON](https://dummyjson.com/docs), treating its product catalogue as the clinic's stock catalogue.

- **Live app:** https://savannah-clinic-inventory.vercel.app
- **Repository:** https://github.com/keyaochieng/savannah-clinic-inventory

---

## Running locally

Built with Node 25 locally; CI and the deploy build run on Node 22 LTS. Any Node 18+ should work.

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# run the test suite
npm run test

# production build (type-check + bundle)
npm run build
```

Sign in with any DummyJSON user - for example username `emilys`, password `emilyspass`.

**Available scripts**

- `npm run dev` - start the Vite dev server
- `npm run build` - type-check and build for production
- `npm run test` - run the Vitest suite once
- `npm run lint` - run ESLint
- `npm run format` - format all files with Prettier
- `npm run format:check` - check formatting without writing (used in CI)

---

## Section 1 - Design

### 1. Components and screen layout

When coming up with the components for this application I noticed 2 distinct views:

**List View**
- The list itself as a table
- Search box with query button
- Category select
- Sort control
- Sign in button and current user display
- Sign out button
- Skeletal loading design (chosen over a loading dropdown)

**Item Detail View**
- Edit / correct stock form
- Item details (image, price, stock)

**Some components cut across all views:**
- Loading state
- Error state
- Empty state
- Navigation
- Header

When deciding how to divide the page, the main focus has to be the list, with simple clear visible controls for the other features such as sort, categorise and search. Since the users will be on many different devices I arranged the components in an intuitive manner using Human–Computer Interaction principles I learnt in my course.

### 2. Where state lives

**Server state** = product data fetched from DummyJSON, held in a client-side cache (React Query), refetched/invalidated on mutation. No cross-device sync exists or is required.

**URL state** lives in the URL itself. The URL is shareable, and opening a specific URL should take you to the exact view the sender was on. This enables easy sharing of specific items between employees in the clinic. Search, category, sort, and page all live here.

**UI state** lives on the local machine. UI states are non-functional and short-lived - when a link is shared, a selected field or an open dropdown does not need to be reproduced for the recipient.

### 3. Fetching, caching, and invalidation

Data is fetched from DummyJSON (a free placeholder REST API), so fetching happens on the user's device. All requests go through a single `apiFetch` wrapper that attaches the auth token and handles token refresh. React Query sits on top of that and provides keyed caching, background refetch, and invalidation, so repeated views are served from cache rather than refetched every time - which matters for the slow connection variable.

Each distinct list view (a given search / category / sort / page combination) is cached under its own query key, and the detail view is cached per product id. Because each key is cached separately, changing filters or reopening a recently-viewed item is instant. A short `staleTime` avoids refetch storms while still keeping data reasonably fresh. After a stock correction the detail query is updated optimistically (see decision 4); a real backend would also invalidate and refetch, but DummyJSON doesn't persist writes, so the optimistic value is kept as the session's truth instead.

### 4. Layout, spacing, colour, typography

The app is used on a variety of devices, most prominently tablets, so a simple, clean design works best - properly spaced, with colour used intentionally. On-screen navigation is also necessary because hardware button navigation on basic Android tablets can be frustrating.

**Design tokens:** Styling uses Tailwind CSS v4 with its CSS-first config. A small set of custom tokens (a clinical blue brand palette and a system font stack) is defined in an `@theme` block in `src/index.css`; everything else uses Tailwind's default spacing, type, and colour scales. There is no separate `tailwind.config.js` - the theme block is the configuration.

### 5. Accessibility

- **Perceivable:** alt text on the detail image, labels tied to every input, colour contrast.
- **Operable:** full keyboard navigation, visible focus rings, native `<select>` and `<button>` elements (no mouse-only interactions).
- **Understandable:** clear error messages, consistent layout, loading/empty/error states on every data screen.
- **Robust:** semantic HTML (`<nav>`, `<button>`, `<label>`, heading order) so screen readers parse it.

The whole app is readable and usable at 360px wide.

---

## Decision log

### 1. Bearer tokens over cookie auth
- **Decision:** Read accessToken/refreshToken from the login response body and send `Authorization: Bearer` on each request.
- **Rejected:** Letting the browser carry DummyJSON's auth cookies via `credentials: 'include'`.
- **Why:** I went with explicit Bearer tokens because the expiry/refresh logic is a graded behaviour, and I wanted that visible and controllable in app code rather than handed off to browser cookie handling. Cross-site cookies are also just flakier once you're on a deployed domain, so this felt like the safer bet either way.

### 2. Search and category filter are mutually exclusive
- **Decision:** When a search term is active it takes precedence; the category filter is cleared. Selecting a category clears the search.
- **Rejected:** Combining both, e.g. fetching a category then filtering by query client-side.
- **Why:** The API doesn't give me an endpoint that composes `q` + category, so combining them would mean filtering client-side over an incomplete paginated set - which just produces wrong or confusing results. Making them exclusive is simpler and more honest about what the API can actually do.

### 3. URL as the source of truth for list state
- **Decision:** search, category, sort, and page live in the URL query string, read via `useSearchParams`.
- **Rejected:** Holding them in React component state (`useState`).
- **Why:** The brief needs reload and copied-URL-on-another-machine to restore the exact view, and component state just doesn't survive either of those. The URL does, so that's where this had to live.

### 4. Optimistic update for stock correction
- **Decision:** On save, update the UI immediately, then reconcile with the server response; roll back on failure.
- **Rejected:** Waiting for the PUT to resolve before showing the new value.
- **Why:** On patchy wifi, a spinner-until-response feels broken. DummyJSON's PUT doesn't persist anyway, so I treat the optimistic value as the session's truth and just document that the mock discards it server-side.

### 5. Not modelling multi-clinic / clinicId
- **Decision:** Don't add a clinic dimension to state or routing.
- **Rejected:** Building clinicId scaffolding for the "rolling out to more clinics" hint.
- **Why:** The data source has no clinic concept to attach this to - I'd be building scaffolding for data that doesn't exist, which goes against the brief's "don't invent clinical content." Easier to just flag it as an assumption than build around something imaginary.

### Open questions / assumptions
- Whether "accessibility" meant technical accessibility or designing for people with physical, sensory, or cognitive disabilities - I addressed both (see Section 1.5).
- Started with a private repo but made it public to enable branch protection on a free account: CI runs the checks, but branch protection is what actually blocks a red merge.

---

## Deployment & CI/CD

**Hosting:** Deployed on Vercel.
**Public URL:** https://savannah-clinic-inventory.vercel.app
**Deploy branch:** `main`. Every merge into `main` triggers an automatic production deploy on Vercel.

A `vercel.json` rewrite serves `index.html` for all routes so client-side deep links (e.g. `/items/5`) resolve correctly instead of 404ing on the host.

**CI pipeline (GitHub Actions, `.github/workflows/ci.yml`):** On every pull request targeting `main`, the pipeline runs:

- `format:check` - Prettier formatting check
- `lint` - ESLint
- `test` - the Vitest suite
- commit-message check - commitlint (Conventional Commits) across the PR range

Any of these failing fails the PR. Branch protection (a repository ruleset) requires the CI check to pass and requires changes to go through a pull request, so a red check blocks the merge. CI runs the checks; branch protection is what actually enforces them.

Commit hygiene is also enforced locally with husky hooks: a `pre-commit` hook runs format + lint, and a `commit-msg` hook runs commitlint - so problems are caught before they ever reach CI.

---

## Mock API limitations

DummyJSON is a mock API, so a few things don't behave the way a real backend would. Worth documenting so it's clear these are known limitations, not bugs I missed.

- **PUT doesn't persist.** `PUT /products/{id}` returns a success response with the changes echoed back, but the server never actually stores them - refetch and you're back to the old value. Since stock correction depends on this endpoint, I used an optimistic update instead: the save feels real from the UI's perspective, even though the mock backend quietly discards it server-side. Because DummyJSON doesn't persist updates, if you update a stock value, it shows on the detail page (held optimistically) but the list still shows the server's original value. In a real backend the mutation would persist and both would agree; here the list reflects whatever the server returns.
- **Search and category don't compose.** `/products/search?q=` and `/products/category/{slug}` are two separate endpoints, so there's no built-in way to search within a category in one call. Rather than fake it client-side, I made search and category mutually exclusive - see decision 2 for the reasoning.
- **Search matches hidden fields.** DummyJSON's search checks title, description, brand, and tags, so results can turn up that don't obviously relate to the title shown on the card. I didn't try to work around this - just documented it so it's clear the behaviour is coming from the API, not a bug in my filtering.
- **`skip` can come back as a string.** Pagination values aren't guaranteed to be numbers when read back, so I coerce them to numbers on read to avoid silent type bugs.
- **Search box keeps its text on category switch.** When you switch category, the search input visually keeps whatever text was in it, even though the search itself clears. This was a deliberate choice - clearing the input on switch triggered a focus-management bug on mobile, so I left the text in place rather than fix a minor UX detail at the cost of a worse mobile bug.

---

## Notes on token refresh

Token lifetime is set to 1 minute (`expiresInMins: 1`) as required. Rather than surfacing expiry to the user, `apiFetch` intercepts the resulting 401, refreshes the token, and retries the original request once - so mid-session expiry is invisible. The refresh chain (401 → /auth/refresh → retried request) is observable in the network tab. DummyJSON rotates the refresh token, so both tokens are saved on each refresh, replacing the old pair.

**Known limitations:** refresh is per-request (concurrent 401s aren't deduped), and the in-memory auth context isn't updated when apiFetch rotates tokens mid-session (localStorage stays correct, so requests keep working).

---

## Section 4 - AI Reflection

**1. What did you use AI for, per section?**

In the design phase, to help me brainstorm and articulate my ideas - for example, when brainstorming my thoughts began to drift into distributed systems, but AI reminded me that we're using dummy data and a mock API. During the build, to write repetitive code and help with functions, especially syntax in `.ts` files. During deployment, to help me troubleshoot Vercel errors. During reflection, to make sure what I wrote was up to par - it did not give me any content, just helped me ensure everything made sense.

**2. Which tools did you use? Any spec-driven or agent workflow framework?**

The tool I used was Claude. I did not use an agentic or spec-driven framework. I first designed the project on paper, then created a mind map of how I thought I needed to tackle it. Then through a combination of Google, YouTube, and conversations with Claude, I slowly pieced together the things on my list. I refreshed on a lot of concepts and learnt a few along the way.

**3. One example where an AI suggestion improved your work - and what you prompted.**

I came across the problem of how to stop a slow old search from overwriting newer results. AI suggested debouncing the input and encoding the search term in the React Query key, so a stale older response is discarded instead of overwriting newer results.

**4. One example where AI output was wrong, incomplete, or subtly bad, and how you caught it.**

When generating the search input, the AI's keyed input approach got the focus wrong. When emulating on a tablet, after each keystroke you had to select the field again. I caught it by testing on the emulated device and fixed it by switching to a controlled input.

**5. Two decisions you made without AI, and why you trusted your own judgment.**

- I spotted in the brief that the plan is to roll the tool out to other clinics, so I first thought of storing a clinicId to build for the future. That ended up being one of my learning points - DummyJSON doesn't include clinic data, so I decided not to add it and flagged the assumption instead.
- Making the repository public. I started private, but on a free GitHub account branch-protection rulesets don't actually enforce - a red CI check would report but couldn't block a merge. Since a check that can't block isn't really a gate, and the brief allows a public repo, I switched to public so the protection genuinely enforces. I made that call myself after reading GitHub's own notice about the limitation, not from AI.

**6. One part of the codebase you'd struggle to defend, and why.**

The optimistic-update rollback logic for updating a stock value was a bit complicated. I followed guidance to build it but didn't fully understand every part. I plan to keep studying this - and the token refresh flow - until I can explain them confidently.