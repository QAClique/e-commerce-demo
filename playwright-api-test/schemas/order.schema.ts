import Joi from 'joi';

const safeCheckoutDetailsSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  zipCode: Joi.string().required(),
  country: Joi.string().required(),
  maskedCardNumber: Joi.string().pattern(/^\*{4} \*{4} \*{4} \d{4}$/).required(),
});

export const orderSchema = Joi.object({
  id: Joi.string().uuid().required(),
  cartId: Joi.string().uuid().required(),
  checkoutDetails: safeCheckoutDetailsSchema.required(),
  totalAmount: Joi.number().min(0).required(),
  createdAt: Joi.string().isoDate().required(),
});
