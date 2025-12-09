import { Product } from './types';
import { v4 as uuidv4 } from 'uuid';

// Initial seed products
// Helper function to generate simple product image
const generateProductImage = (text: string, bgColor: string = '#4A90E2'): string => {
  const svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="300" fill="${bgColor}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 99.99,
    imageUrl: generateProductImage('🎧 Headphones', '#4A90E2'),
    stock: 50
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with fitness tracking',
    price: 249.99,
    imageUrl: generateProductImage('⌚ Smart Watch', '#E94B3C'),
    stock: 30
  },
  {
    id: '3',
    name: 'Laptop Backpack',
    description: 'Durable backpack with padded laptop compartment',
    price: 59.99,
    imageUrl: generateProductImage('🎒 Backpack', '#6C5CE7'),
    stock: 100
  },
  {
    id: '4',
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with multiple ports',
    price: 39.99,
    imageUrl: generateProductImage('🔌 USB Hub', '#00B894'),
    stock: 75
  },
  {
    id: '5',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with tactile switches',
    price: 129.99,
    imageUrl: generateProductImage('⌨️ Keyboard', '#FDCB6E'),
    stock: 45
  },
  {
    id: '6',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking',
    price: 49.99,
    imageUrl: generateProductImage('🖱️ Mouse', '#A29BFE'),
    stock: 80
  }
];

// In-memory storage for products
let products: Product[] = [...initialProducts];

export const productService = {
  getAllProducts(): Product[] {
    return products;
  },

  getProductById(id: string): Product | undefined {
    return products.find(p => p.id === id);
  },

  createProduct(productData: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      id: uuidv4(),
      ...productData
    };
    products.push(newProduct);
    return newProduct;
  },

  updateProduct(id: string, productData: Partial<Omit<Product, 'id'>>): Product | null {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...productData
    };
    return products[index];
  },

  deleteProduct(id: string): boolean {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;

    products.splice(index, 1);
    return true;
  },

  // Utility method for testing: reset products to initial state
  resetProducts(): void {
    products = [...initialProducts];
  },

  // Utility method for testing: clear all products
  clearProducts(): void {
    products = [];
  }
};
