import express, { Request, Response } from 'express';
import cors from 'cors';
import { Product } from './types';
import { productService, escapeSvgText } from './productService';
import { cartService } from './cartService';
import { checkoutService } from './checkoutService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '10kb' }));

const isValidPrice = (value: unknown): value is number =>
  typeof value === 'number' && value >= 0;

const isValidStock = (value: unknown): value is number =>
  typeof value === 'number' && value >= 0;

// Products endpoints
app.get('/api/products', (req: Request, res: Response) => {
  res.json(productService.getAllProducts());
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = productService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.post('/api/products', (req: Request, res: Response) => {
  const { name, description, price, imageUrl, stock } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Product name is required' });
  }
  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Product description is required' });
  }
  if (!isValidPrice(price)) {
    return res.status(400).json({ error: 'Valid price is required' });
  }
  if (!isValidStock(stock)) {
    return res.status(400).json({ error: 'Valid stock quantity is required' });
  }

  // Generate inline SVG image if no imageUrl provided
  const defaultImage = imageUrl || (() => {
    const safeName = escapeSvgText(name.trim());
    const svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="#95A5A6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">${safeName}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  })();

  const productData = {
    name: name.trim(),
    description: description.trim(),
    price,
    imageUrl: defaultImage,
    stock
  };

  const newProduct = productService.createProduct(productData);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { name, description, price, imageUrl, stock } = req.body;
  const updates: Partial<Omit<Product, 'id'>> = {};

  // Only update provided fields
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Invalid product name' });
    }
    updates.name = name.trim();
  }
  if (description !== undefined) {
    if (typeof description !== 'string') {
      return res.status(400).json({ error: 'Invalid product description' });
    }
    updates.description = description.trim();
  }
  if (price !== undefined) {
    if (!isValidPrice(price)) {
      return res.status(400).json({ error: 'Invalid price' });
    }
    updates.price = price;
  }
  if (imageUrl !== undefined) {
    updates.imageUrl = imageUrl;
  }
  if (stock !== undefined) {
    if (!isValidStock(stock)) {
      return res.status(400).json({ error: 'Invalid stock quantity' });
    }
    updates.stock = stock;
  }

  const updatedProduct = productService.updateProduct(req.params.id, updates);
  if (!updatedProduct) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(updatedProduct);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const deleted = productService.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.status(204).send();
});

// Test utility endpoints
app.post('/api/products/reset', (req: Request, res: Response) => {
  productService.resetProducts();
  res.json({ message: 'Products reset to initial state' });
});

app.delete('/api/products', (req: Request, res: Response) => {
  productService.clearProducts();
  res.json({ message: 'All products cleared' });
});

// Cart endpoints
app.post('/api/cart', (req: Request, res: Response) => {
  const cart = cartService.createCart();
  res.status(201).json(cart);
});

app.get('/api/cart/:cartId', (req: Request, res: Response) => {
  const cartWithProducts = cartService.getCartWithProducts(req.params.cartId);
  if (!cartWithProducts) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  res.json(cartWithProducts);
});

app.post('/api/cart/:cartId/items', (req: Request, res: Response) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid product ID or quantity' });
  }

  const cart = cartService.addItemToCart(req.params.cartId, productId, quantity);
  if (!cart) {
    return res.status(400).json({ error: 'Unable to add item to cart. Check product availability and stock.' });
  }

  const cartWithProducts = cartService.getCartWithProducts(req.params.cartId);
  res.json(cartWithProducts);
});

app.delete('/api/cart/:cartId/items/:productId', (req: Request, res: Response) => {
  const cart = cartService.removeItemFromCart(req.params.cartId, req.params.productId);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const cartWithProducts = cartService.getCartWithProducts(req.params.cartId);
  res.json(cartWithProducts);
});

app.put('/api/cart/:cartId/items/:productId', (req: Request, res: Response) => {
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  const cart = cartService.updateItemQuantity(req.params.cartId, req.params.productId, quantity);
  if (!cart) {
    return res.status(400).json({ error: 'Unable to add item to cart. Check product availability and stock.' });
  }

  const cartWithProducts = cartService.getCartWithProducts(req.params.cartId);
  res.json(cartWithProducts);
});

// Checkout endpoint
app.post('/api/checkout', (req: Request, res: Response) => {
  const { cartId, checkoutDetails } = req.body;

  if (!cartId || !checkoutDetails) {
    return res.status(400).json({ error: 'Cart ID and checkout details are required' });
  }

  const result = checkoutService.processCheckout(cartId, checkoutDetails);

  if (!result.success) {
    return res.status(400).json({ errors: result.errors });
  }

  res.status(201).json(result.order);
});

app.get('/api/orders/:orderId', (req: Request, res: Response) => {
  const order = checkoutService.getOrder(req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
