import { useState } from 'react';
import { Cart, CheckoutDetails } from '../types';

export interface CheckoutFormProps {
  cart: Cart;
  onSubmit: (details: CheckoutDetails) => Promise<void>;
  onCancel: () => void;
}

const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateCardNumber = (cardNumber: string): boolean =>
  /^\d{16}$/.test(cardNumber.replace(/\s/g, ''));

const validateCardExpiry = (expiry: string): boolean =>
  /^\d{2}\/\d{2}$/.test(expiry);

const validateCVV = (cvv: string): boolean =>
  /^\d{3,4}$/.test(cvv);

const validatePostalCode = (postalCode: string): boolean => {
  // Canadian postal code format: A1A 1A1 (with or without space)
  const cleaned = postalCode.replace(/\s/g, '').toUpperCase();
  return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cleaned);
};

export default function CheckoutForm({ cart, onSubmit, onCancel }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutDetails>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleEmailBlur = () => {
    if (formData.email && !validateEmail(formData.email)) {
      setFieldErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address (e.g., user@example.com)',
      }));
    }
  };

  const handleCardNumberBlur = () => {
    if (formData.cardNumber && !validateCardNumber(formData.cardNumber)) {
      setFieldErrors(prev => ({ ...prev, cardNumber: 'Card number must be 16 digits' }));
    }
  };

  const handleCardExpiryBlur = () => {
    if (formData.cardExpiry && !validateCardExpiry(formData.cardExpiry)) {
      setFieldErrors(prev => ({ ...prev, cardExpiry: 'Expiry must be in MM/YY format (e.g., 12/25)' }));
    }
  };

  const handleCVVBlur = () => {
    if (formData.cardCvv && !validateCVV(formData.cardCvv)) {
      setFieldErrors(prev => ({ ...prev, cardCvv: 'CVV must be 3 or 4 digits' }));
    }
  };

  const handlePostalCodeBlur = () => {
    if (formData.zipCode && !validatePostalCode(formData.zipCode)) {
      setFieldErrors(prev => ({
        ...prev,
        zipCode: 'Postal code must be in Canadian format (e.g., A1A 1A1)',
      }));
    }
  };

  const isFormValid = (): boolean => {
    const allFieldsFilled =
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.zipCode.trim() !== '' &&
      formData.country.trim() !== '' &&
      formData.cardNumber.trim() !== '' &&
      formData.cardExpiry.trim() !== '' &&
      formData.cardCvv.trim() !== '';

    const noFieldErrors = Object.keys(fieldErrors).length === 0;

    const validFormats =
      validateEmail(formData.email) &&
      validateCardNumber(formData.cardNumber) &&
      validateCardExpiry(formData.cardExpiry) &&
      validateCVV(formData.cardCvv) &&
      validatePostalCode(formData.zipCode);

    return allFieldsFilled && noFieldErrors && validFormats;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      if (err instanceof Error) {
        setErrors(err.message.split(', '));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="checkout-form"
      onSubmit={handleSubmit}
      data-testid="checkout-form"
    >
      <h2>Checkout</h2>

      {errors.length > 0 && (
        <div className="error-display">
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-section">
        <h2>Personal Information</h2>
        <div className="form-row">
          <div className="form-group" data-testid="field-firstName">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group" data-testid="field-lastName">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group" data-testid="field-email">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleEmailBlur}
            className={fieldErrors.email ? 'error' : ''}
            required
          />
          {fieldErrors.email && (
            <div className="error-message" data-testid="error-email">{fieldErrors.email}</div>
          )}
        </div>
      </div>

      <div className="form-section">
        <h2>Shipping Address</h2>
        <div className="form-group" data-testid="field-address">
          <label htmlFor="address">Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group" data-testid="field-city">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group" data-testid="field-zipCode">
            <label htmlFor="zipCode">Postal Code *</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              onBlur={handlePostalCodeBlur}
              className={fieldErrors.zipCode ? 'error' : ''}
              placeholder="A1A 1A1"
              maxLength={7}
              required
            />
            {fieldErrors.zipCode && (
              <div className="error-message" data-testid="error-zipCode">{fieldErrors.zipCode}</div>
            )}
          </div>
        </div>
        <div className="form-group" data-testid="field-country">
          <label htmlFor="country">Country *</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-section">
        <h2>Payment Information</h2>
        <div className="form-group" data-testid="field-cardNumber">
          <label htmlFor="cardNumber">Card Number *</label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            onBlur={handleCardNumberBlur}
            className={fieldErrors.cardNumber ? 'error' : ''}
            placeholder="1234567890123456"
            maxLength={16}
            required
          />
          {fieldErrors.cardNumber && (
            <div className="error-message" data-testid="error-cardNumber">{fieldErrors.cardNumber}</div>
          )}
        </div>
        <div className="form-row">
          <div className="form-group" data-testid="field-cardExpiry">
            <label htmlFor="cardExpiry">Expiry (MM/YY) *</label>
            <input
              type="text"
              id="cardExpiry"
              name="cardExpiry"
              value={formData.cardExpiry}
              onChange={handleChange}
              onBlur={handleCardExpiryBlur}
              className={fieldErrors.cardExpiry ? 'error' : ''}
              placeholder="12/25"
              maxLength={5}
              required
            />
            {fieldErrors.cardExpiry && (
              <div className="error-message" data-testid="error-cardExpiry">{fieldErrors.cardExpiry}</div>
            )}
          </div>
          <div className="form-group" data-testid="field-cardCvv">
            <label htmlFor="cardCvv">CVV *</label>
            <input
              type="text"
              id="cardCvv"
              name="cardCvv"
              value={formData.cardCvv}
              onChange={handleChange}
              onBlur={handleCVVBlur}
              className={fieldErrors.cardCvv ? 'error' : ''}
              placeholder="123"
              maxLength={4}
              required
            />
            {fieldErrors.cardCvv && (
              <div className="error-message" data-testid="error-cardCvv">{fieldErrors.cardCvv}</div>
            )}
          </div>
        </div>
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <span>Order Total:</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>
        {!isFormValid() && !submitting && (
          <div className="form-hint">
            Please fill all required fields correctly to proceed
          </div>
        )}
        <div className="checkout-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Back to Cart
          </button>
          <button
            type="submit"
            className="btn btn-success checkout-submit"
            disabled={submitting || !isFormValid()}
          >
            {submitting ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </form>
  );
}
