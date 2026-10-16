import mongoose, { Schema, type Model } from "mongoose";

export interface SocialLinks {
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
  other: string;
}

export interface SettingDocument {
  key: string;
  websiteName: string;
  telephone: string;
  email: string;
  whatsapp: string;
  location: string;
  socials: SocialLinks;
  createdAt: Date;
  updatedAt: Date;
}

const SocialsSchema = new Schema<SocialLinks>(
  {
    instagram: { type: String, default: "", trim: true, maxlength: 300 },
    facebook: { type: String, default: "", trim: true, maxlength: 300 },
    tiktok: { type: String, default: "", trim: true, maxlength: 300 },
    youtube: { type: String, default: "", trim: true, maxlength: 300 },
    linkedin: { type: String, default: "", trim: true, maxlength: 300 },
    other: { type: String, default: "", trim: true, maxlength: 300 },
  },
  { _id: false },
);

const SettingSchema = new Schema<SettingDocument>(
  {
    key: { type: String, required: true, unique: true, default: "site" },
    websiteName: { type: String, default: "HUG Photos", trim: true, maxlength: 80 },
    telephone: { type: String, default: "", trim: true, maxlength: 40 },
    email: { type: String, default: "", trim: true, maxlength: 160 },
    whatsapp: { type: String, default: "", trim: true, maxlength: 40 },
    location: { type: String, default: "", trim: true, maxlength: 200 },
    socials: { type: SocialsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const SETTING_KEY = "site";

export const Setting: Model<SettingDocument> =
  (mongoose.models.Setting as Model<SettingDocument>) ??
  mongoose.model<SettingDocument>("Setting", SettingSchema);
