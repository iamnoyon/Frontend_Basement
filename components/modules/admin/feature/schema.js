import { z } from "zod";

export const featureSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    is_union_based: z.boolean(),
    union_id: z.union([z.number(), z.string()]).nullable().optional(),
    candidates: z
      .array(
        z.object({
          name: z.string().min(1, "Candidate name is required"),
          image: z.string().min(1, "Candidate image is required"),
        })
      )
      .min(1, "At least one candidate is required"),
  })
  .superRefine((data, ctx) => {
    if (data.is_union_based && !data.union_id) {
      ctx.addIssue({
        code: "custom",
        path: ["union_id"],
        message: "Union is required",
      });
    }
  });
