import mongoose, { Schema, type Model } from "mongoose";

export interface PhotoDocument {
  title: string;
  category: string;
  url: string;
  publicId: string | null;
  width: number;
  height: number;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema = new Schema<PhotoDocument>(
  {
    title: { type: String, default: "", trim: true, maxlength: 140 },
    category: { type: String, default: "", trim: true, maxlength: 60 },
    url: { type: String, required: true },
    publicId: { type: String, default: null },
    width: { type: Number, default: 0, min: 0 },
    height: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

PhotoSchema.index({ createdAt: -1 });
PhotoSchema.index({ category: 1, createdAt: -1 });

export const Photo: Model<PhotoDocument> =
  (mongoose.models.Photo as Model<PhotoDocument>) ??
  mongoose.model<PhotoDocument>("Photo", PhotoSchema);
