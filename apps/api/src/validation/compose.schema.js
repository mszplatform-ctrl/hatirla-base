const { z } = require('zod');

/**
 * Compose Package Input Schema
 * Validates POST /api/ai/compose body
 */
const composeSchema = z.object({
  language: z
    .string()
    .min(2)
    .max(5)
    .optional()
    .default('tr'),

  selections: z
    .array(
      z.object({
        type: z.string().min(1),
        price: z.number().nonnegative().optional(),
        minPrice: z.number().nonnegative().optional(),
        payload: z
          .object({
            price: z.number().nonnegative().optional(),
            minPrice: z.number().nonnegative().optional(),
          })
          .optional(),
      })
    )
    .min(1, 'At least one selection is required'),
});

module.exports = {
  composeSchema,
};
