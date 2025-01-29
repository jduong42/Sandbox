import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(12, {
    message: "Password must be at least 12 characters long.",
  }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
