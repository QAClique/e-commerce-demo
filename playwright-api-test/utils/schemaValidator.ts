import Joi from 'joi';
import { expect } from '@playwright/test';

export function expectSchema(data: unknown, schema: Joi.Schema): void {
  const { error } = schema.validate(data, { abortEarly: false });
  expect(
    error,
    error
      ? `Schema validation failed: ${error.details.map((d) => d.message).join(', ')}`
      : '',
  ).toBeUndefined();
}
