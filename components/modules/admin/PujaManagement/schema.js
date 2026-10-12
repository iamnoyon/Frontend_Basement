import { z } from "zod";

const requiredId = (message) =>
  z.union([z.number(), z.string()]).nullable().refine((v) => v !== null && v !== "", message);

export const pujaSchema = z.object({
  feature_id: requiredId("Feature is required"),
  union_id: requiredId("Union is required"),
  // The paurashava has no wards, so a ward is only required when the union has some (checked in the form).
  ward_code: z.string().nullable().optional(),
  villages: z
    .array(
      z.object({
        village_name: z.string().min(1, "Village name is required"),
        mondir_name: z.string().min(1, "Mondir name is required"),
        phone: z.string().regex(/^01\d{9}$/, "Enter a valid 11 digit phone number"),
      })
    )
    .min(1, "At least one village is required"),
});
