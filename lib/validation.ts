import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required.").max(60),
  password: z.string().min(1, "Password is required.").max(200),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters.")
    .max(200, "New password is too long."),
});

// Metadata for an image that was uploaded directly to Cloudinary from the
// browser (bypassing the serverless 4.5MB request-body limit).
export const photoCreateSchema = z.object({
  url: z
    .string()
    .trim()
    .max(600, "Image URL is too long.")
    .refine(
      (value) => /^https:\/\/res\.cloudinary\.com\/\S+$/i.test(value),
      { message: "Image URL must be a Cloudinary URL." },
    ),
  publicId: z.string().trim().max(300).nullish(),
  width: z.number().int().positive().max(100000).optional(),
  height: z.number().int().positive().max(100000).optional(),
  title: z.string().trim().max(140, "Title is too long.").optional(),
  category: z.string().trim().max(60, "Category is too long.").optional(),
  featured: z.boolean().optional(),
});

export const photoUpdateSchema = z
  .object({
    title: z.string().trim().max(140, "Title is too long.").optional(),
    category: z.string().trim().max(60, "Category is too long.").optional(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.category !== undefined ||
      value.featured !== undefined ||
      value.published !== undefined,
    { message: "Nothing to update." },
  );

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  service: z.string().trim().max(80).optional().or(z.literal("")),
  preferredDate: z.string().trim().max(40).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please include a few more details.")
    .max(4000),
});

const optionalUrl = (label: string) =>
  z
    .string()
    .trim()
    .max(300, `${label} is too long.`)
    .refine(
      (value) => value === "" || /^https?:\/\/\S+$/i.test(value),
      { message: `${label} must be a valid URL starting with http:// or https://.` },
    );

export const socialLinksSchema = z.object({
  instagram: optionalUrl("Instagram link"),
  facebook: optionalUrl("Facebook link"),
  tiktok: optionalUrl("TikTok link"),
  youtube: optionalUrl("YouTube link"),
  linkedin: optionalUrl("LinkedIn link"),
  other: optionalUrl("Link"),
});

export const settingsSchema = z.object({
  websiteName: z
    .string()
    .trim()
    .min(1, "Website name is required.")
    .max(80, "Website name is too long."),
  telephone: z.string().trim().max(40, "Telephone is too long."),
  email: z
    .string()
    .trim()
    .max(160, "Email is too long.")
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      { message: "Please enter a valid email address." },
    ),
  whatsapp: z.string().trim().max(40, "WhatsApp number is too long."),
  location: z.string().trim().max(200, "Location is too long."),
  socials: socialLinksSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type PhotoCreateInput = z.infer<typeof photoCreateSchema>;
export type PhotoUpdateInput = z.infer<typeof photoUpdateSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type SocialLinksInput = z.infer<typeof socialLinksSchema>;
