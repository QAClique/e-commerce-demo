# CLAUDE.md — Project Context for Agentic Sessions

## What This Project Is

A **demo-only** e-commerce web application built for test automation practice. It is never deployed to production. Understanding this is critical: several deliberate simplifications exist that would be security or scalability issues in a real app but are intentional and acceptable here.

## Architecture

npm workspace monorepo. Two active sub-packages:

| Package | Dir | Port | Purpose |
|---|---|---|---|
| `ecommerce-backend` | `backend/` | 3001 | Express + TypeScript REST API |
| `ecommerce-frontend` | `frontend/` | 3000 | React + TypeScript + Vite SPA |

Two other packages (`api-test/`, `frontend-test/`) contain test automation and are **out of scope** for webapp edits.

Root `node_modules/` is shared across packages via npm workspaces. Local `tsc` is at `node_modules/.bin/tsc` from the **workspace root**, not inside `backend/` or `frontend/`.

## Running & Building

```bash
# Install all dependencies (run once from root)
npm install

# Dev (both servers in parallel)
npm run dev

# Type-check backend
node_modules/.bin/tsc --noEmit --project backend/tsconfig.json

# Type-check frontend
node_modules/.bin/tsc --noEmit --project frontend/tsconfig.json

# Full build (backend tsc + frontend tsc + vite)
npm run build
```

## Backend File Map

```
backend/src/
  server.ts          — Express app, all route definitions
  productService.ts  — Product CRUD + in-memory store + SVG image generation
  cartService.ts     — Cart CRUD + in-memory store
  checkoutService.ts — Order validation + creation + in-memory store
  types.ts           — Shared TypeScript interfaces
```

**Storage**: Everything is in-memory (JS Maps/arrays). All data is lost on restart. No database, no ORM. This is intentional.

**No authentication**. All endpoints are public. This is intentional for a demo.

## Frontend File Map

```
frontend/src/
  App.tsx                      — Main app shell, state, navigation (View FSM)
  App.css                      — All styles (single CSS file, no modules)
  api.ts                       — fetch() wrappers for all backend calls
  types.ts                     — TypeScript interfaces (mirrors backend types)
  main.tsx                     — React entry point
  components/
    ProductList.tsx             — Product grid
    CartItem.tsx                — Single cart row (quantity controls)
    CartView.tsx                — Full cart page
    CheckoutForm.tsx            — Multi-field checkout form with validation
    OrderSuccess.tsx            — Post-order confirmation screen
```

**No router**: Navigation is a `View` state enum (`'products' | 'cart' | 'checkout' | 'order-success'`) in `App.tsx`. This is intentional — no React Router.

**No global state**: Plain `useState`/`useEffect`. Cart ID is persisted in `sessionStorage`.

## Key Types (both frontend and backend)

```typescript
Product      — id, name, description, price, imageUrl, stock
Cart         — id, items: CartItem[], total (computed by backend)
CartItem     — productId, quantity, product? (populated by backend)
CheckoutDetails — personal info + shipping + raw card fields (frontend input only)
SafeCheckoutDetails — personal info + shipping + maskedCardNumber (stored/returned)
Order        — id, cartId, checkoutDetails: SafeCheckoutDetails, totalAmount, createdAt
```

`CheckoutDetails` (with raw card data) is used **only** for frontend form state and the checkout POST request body. It is never stored. `SafeCheckoutDetails` is what gets persisted and returned by the API.

## Coding Conventions

- **Style**: Airbnb (TypeScript). Applied throughout.
- **TypeScript**: Strict mode on both sides. No `any`. Use `unknown` for external input, proper narrowing.
- **Backend validation**: Type-guard helpers `isValidPrice` / `isValidStock` in `server.ts`. Stock validation via `exceedsStock()` helper in `cartService.ts`. SVG text is HTML-escaped via `escapeSvgText()` exported from `productService.ts`.
- **Frontend async pattern**: Cart-mutating operations use `withCart(action, fallbackMsg)` in `App.tsx`. The `handleCheckout` function intentionally re-throws (lets `CheckoutForm` handle its own error display).
- **useEffect cart refresh**: Uses `cartIdRef` (a `useRef`) to avoid an infinite loop — do NOT replace with `cart` as a dependency in that effect.
- **CSS**: Single `App.css`. No CSS modules, no Tailwind. Class names are kebab-case and descriptive.
- **`data-testid`**: Attributes are intentional and used by the test automation suite. Do not remove them.

## Intentional Simplifications (Do Not "Fix")

- **In-memory storage** — no database by design.
- **No authentication** — all routes are public by design.
- **Test utility endpoints** (`POST /api/products/reset`, `DELETE /api/products`) — left unguarded intentionally; this app never goes to production.
- **No payment gateway** — fake card numbers only; the demo never processes real payments.
- **No React Router** — simple `View` state enum is sufficient for the demo scope.
- **Canadian postal code validation** in `CheckoutForm.tsx` — intentional; the demo targets Canadian addresses.
- **Session storage for cart ID** — acceptable for a demo; not a security concern at this scope.

## Security Changes Already Applied

The following were hardened during a prior review session:

- **XSS in SVG generation**: `escapeSvgText()` in `productService.ts` escapes `&`, `<`, `>`, `"` before injecting user input into SVG templates. Both `productService.ts` and the inline SVG in `server.ts` use this.
- **CORS**: Restricted to `process.env.CORS_ORIGIN || 'http://localhost:3000'` (was wildcard).
- **Request body size**: `express.json({ limit: '10kb' })` (was unlimited).
- **Card data stripping**: Raw card number and CVV are never stored. `checkoutService.ts` builds a `SafeCheckoutDetails` with only `maskedCardNumber` (`**** **** **** XXXX`) before writing to the order store.

## Markdown

All `README.md` files in the project (root, `backend/`, `frontend/`) comply with markdownlint rules. When editing them, maintain compliance — key rules in play: MD022 (blank line after headings), MD034 (no bare URLs; use `<url>` syntax).
