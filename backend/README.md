# E-Commerce Backend

Backend API for the e-commerce MVP application.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

The server will start on http://localhost:3001

## Build

```bash
npm run build
npm start
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product
  - Body: `{ "name": "string", "description": "string", "price": number, "stock": number, "imageUrl": "string" (optional) }`
- `PUT /api/products/:id` - Update a product
  - Body: `{ "name": "string" (optional), "description": "string" (optional), "price": number (optional), "stock": number (optional), "imageUrl": "string" (optional) }`
- `DELETE /api/products/:id` - Delete a product

### Test Utilities
- `POST /api/products/reset` - Reset products to initial seed data
- `DELETE /api/products` - Clear all products

### Cart
- `POST /api/cart` - Create a new cart
- `GET /api/cart/:cartId` - Get cart details
- `POST /api/cart/:cartId/items` - Add item to cart
  - Body: `{ "productId": "string", "quantity": number }`
- `DELETE /api/cart/:cartId/items/:productId` - Remove item from cart
- `PUT /api/cart/:cartId/items/:productId` - Update item quantity
  - Body: `{ "quantity": number }`

### Checkout
- `POST /api/checkout` - Process checkout
  - Body: `{ "cartId": "string", "checkoutDetails": {...} }`
- `GET /api/orders/:orderId` - Get order details

### Health
- `GET /health` - Health check endpoint
