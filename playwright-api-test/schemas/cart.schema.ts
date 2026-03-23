import Joi from 'joi';

const productSchema = Joi.object({
  id:          Joi.string().uuid().required(),
  name:        Joi.string().required(),
  description: Joi.string().required(),
  price:       Joi.number().min(0).required(),
  imageUrl:    Joi.string().required(),
  stock:       Joi.number().integer().min(0).required(),
});

const cartItemSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  quantity:  Joi.number().integer().min(0).required(),
  product:   productSchema.required(),
});

export const cartSchema = Joi.object({
  id:    Joi.string().uuid().required(),
  items: Joi.array().items(cartItemSchema).required(),
  total: Joi.number().min(0).required(),
});

export const emptyCartSchema = Joi.object({
  id:    Joi.string().uuid().required(),
  items: Joi.array().length(0).required(),
  total: Joi.number().valid(0).required(),
});
