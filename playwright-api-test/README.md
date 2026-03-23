# playwright-api-test

## Getting Started

API tests for the E-Commerce demo backend, ported from the [Karate](https://github.com/karatelabs/karate) suite in `api-test/` to [Playwright](https://playwright.dev/) with TypeScript. Schema validation uses [Joi](https://joi.dev/).

Only the backend is required to run the tests. No browser installation is needed since these are pure HTTP/API tests.

### Prerequisites

- [Node.js](https://nodejs.org/en) (latest LTS or newer)
- The demo backend running on `localhost:3001` (or both backend and frontend via `npm run dev` from the repo root)

### Install

From the `playwright-api-test/` folder:

```bash
npm install
```

> **Note:** `npx playwright install` is **not** required. These tests use Playwright's `APIRequestContext` only -- no browsers are launched.

## Executing the Tests

Start the backend first (from the repo root):

```bash
npm run dev:backend
```

Then, from the `playwright-api-test/` folder:

```bash
npx playwright test
```

### Running Specific Test Files

```bash
npx playwright test add-to-cart
npx playwright test remove-from-cart
npx playwright test update-product-in-cart
npx playwright test process-checkout
```

### Filtering by Tag

Tests are tagged `@positive` or `@negative`:

```bash
npx playwright test --grep @positive
npx playwright test --grep @negative
```

### Configuration

The base URL defaults to `http://localhost:3000/api/` (through the Vite dev-server proxy). To hit the backend directly, override with the `BASE_URL` environment variable:

```bash
BASE_URL=http://localhost:3001/api/ npx playwright test
```

## Test Reports

Playwright generates an HTML report in `playwright-report/`. To open it:

```bash
npx playwright show-report
```

## Test Structure

| File | Endpoint | Scenarios |
|---|---|---|
| `add-to-cart.spec.ts` | `POST /cart/:cartId/items` | 13 (1 positive, 12 negative) |
| `remove-from-cart.spec.ts` | `DELETE /cart/:cartId/items/:productId` | 7 (1 positive, 6 negative) |
| `update-product-in-cart.spec.ts` | `PUT /cart/:cartId/items/:productId` | 4 (1 positive, 3 negative) |
| `process-checkout.spec.ts` | `POST /checkout` | 12 (1 positive, 11 negative) |

### Key Files

```text
playwright-api-test/
├── fixtures/
│   └── api.fixtures.ts         # Playwright fixtures (product, cart, cartWithProduct)
├── schemas/
│   ├── cart.schema.ts           # Joi schemas for cart responses
│   ├── order.schema.ts          # Joi schema for order/checkout responses
│   └── error.schema.ts          # Joi schemas for error responses
├── utils/
│   ├── random.ts                # Random data generators (ported from api-test/utils/utils.js)
│   └── schema-validator.ts      # Joi + Playwright expect() helper
├── tests/                       # Test spec files
├── playwright.config.ts         # Playwright configuration
└── .eslintrc.json               # Airbnb TypeScript ESLint configuration
```

## Linter

ESLint is configured with the Airbnb TypeScript base ruleset. Run it from the `playwright-api-test/` folder:

```bash
npx eslint . --ext .ts
```
