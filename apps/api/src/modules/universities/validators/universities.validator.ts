import { z } from "zod";
import {
  createUniversitySchema,
  updateUniversitySchema,
  listUniversitiesQuerySchema,
} from "@beaconu/validation";

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const universitySchemas = {
  create: createUniversitySchema,
  update: updateUniversitySchema,
  idParam: idParamSchema,
  listQuery: listUniversitiesQuerySchema,
};

export type {
  CreateUniversityInput,
  UpdateUniversityInput,
  ListUniversitiesQuery,
} from "@beaconu/validation";
