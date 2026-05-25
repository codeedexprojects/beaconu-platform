import { z } from "zod";

export const enableInstitutionGroupSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
});

export const joinGroupSchema = z.object({
  group_code: z.string().min(1).max(30),
});

export type EnableInstitutionGroupInput = z.infer<
  typeof enableInstitutionGroupSchema
>;
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;
