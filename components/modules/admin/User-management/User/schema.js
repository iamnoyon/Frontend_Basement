import {z} from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters"),

  email: z
    .string()
    .email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone number is required"),
  role: z.string()
});


export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters"),

  email: z
    .string()
    .email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  role: z.string()
});
