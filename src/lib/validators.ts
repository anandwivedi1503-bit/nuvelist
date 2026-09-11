import { z } from "zod";
import { INDIAN_STATES } from "./india";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120).toLowerCase(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile"),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, "Need an uppercase letter")
    .regex(/[a-z]/, "Need a lowercase letter")
    .regex(/[0-9]/, "Need a number"),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1).max(72),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  line1: z.string().trim().min(4).max(120),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(60),
  state: z
    .string()
    .refine((s) => (INDIAN_STATES as readonly string[]).includes(s), "Select an Indian state"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/),
});

export const checkoutSchema = addressSchema.extend({
  email: z.string().email().toLowerCase(),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  couponCode: z.string().trim().max(32).optional().or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().toLowerCase(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional()
    .or(z.literal("")),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
});

export const cartActionSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(0).max(8).optional(),
  action: z.enum(["add", "update", "remove", "clear"]),
});
