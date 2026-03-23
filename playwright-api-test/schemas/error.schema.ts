import Joi from 'joi';

export const errorSchema = Joi.object({
  error: Joi.string().required(),
});

export const errorsArraySchema = Joi.object({
  errors: Joi.array().items(Joi.string()).min(1).required(),
});
