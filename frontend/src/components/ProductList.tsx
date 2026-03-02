import { Product } from '../types';

export interface ProductListProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
}

export default function ProductList({ products, onAddToCart }: ProductListProps) {
  return (
    <div className="products-grid">
      {products.map(product => (
        <div key={product.id} className="product-card" data-testid={`product-${product.id}`}>
          <img src={product.imageUrl} alt={product.name} className="product-image" />
          <h3 className="product-name" data-testid={`product-name-${product.id}`}>{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <div className="product-footer">
            <div>
              <div className="product-price" data-testid={`product-price-${product.id}`}>${product.price.toFixed(2)}</div>
              <div className="product-stock" data-testid={`product-stock-${product.id}`}>Stock: {product.stock}</div>
            </div>
            <button
              className="btn btn-primary"
              data-testid={`add-to-cart-${product.id}`}
              onClick={() => onAddToCart(product.id)}
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
