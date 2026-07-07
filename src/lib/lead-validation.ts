import { z } from "zod";

const indianMobilePattern = /^[6-9]\d{9}$/;

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(80, "Name is too long")
    .regex(/^[a-zA-Z\s.'-]+$/, "Name can only include letters and spaces"),
  mobile: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .transform((value) => {
      if (value.length === 12 && value.startsWith("91")) {
        return value.slice(2);
      }

      return value;
    })
    .refine((value) => indianMobilePattern.test(value), {
      message: "Enter a valid 10-digit mobile number",
    }),
});

export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;
