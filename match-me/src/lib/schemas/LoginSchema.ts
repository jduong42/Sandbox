import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, {
    message: "Password must be at least 12 characters long.",
  }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
