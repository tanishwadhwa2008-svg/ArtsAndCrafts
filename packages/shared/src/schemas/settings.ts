import { z } from 'zod';

/**
 * Storefront contact settings — the seller-managed contact details shown on the
 * public Contact page. Each detail (mobile number, email, location) can be
 * independently toggled on/off and edited. Shared between API request
 * validation and the seller-web form.
 */

export const contactFieldSchema = z.object({
  enabled: z.boolean(),
  value: z.string().trim().max(200),
});

export const contactSettingsSchema = z
  .object({
    phone: contactFieldSchema,
    email: contactFieldSchema,
    location: contactFieldSchema,
  })
  .superRefine((data, ctx) => {
    (['phone', 'email', 'location'] as const).forEach((key) => {
      if (data[key].enabled && data[key].value.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key, 'value'],
          message: 'Enter a value or turn this detail off.',
        });
      }
    });
    if (
      data.email.enabled &&
      data.email.value.trim().length > 0 &&
      !z.string().email().safeParse(data.email.value.trim()).success
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email', 'value'],
        message: 'Enter a valid email address.',
      });
    }
  });

export const updateStorefrontSettingsSchema = z.object({
  contact: contactSettingsSchema.optional(),
});

export type ContactField = z.infer<typeof contactFieldSchema>;
export type ContactSettings = z.infer<typeof contactSettingsSchema>;
export type UpdateStorefrontSettingsInput = z.infer<typeof updateStorefrontSettingsSchema>;
