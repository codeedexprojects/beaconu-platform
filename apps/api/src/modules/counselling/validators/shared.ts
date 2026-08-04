import { z } from "zod";

const LANGUAGE_NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

export const knownLanguagesSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .transform((value) =>
    value
      .split(",")
      .map((lang) => lang.trim().replace(/\s+/g, " "))
      .filter((lang) => lang.length > 0)
      .join(", "),
  )
  .refine(
    (value) =>
      value.split(",").every((lang) => LANGUAGE_NAME_REGEX.test(lang.trim())),
    {
      message:
        'Each language must contain only letters and single spaces, separated by commas (e.g. "English, Hindi")',
    },
  );
