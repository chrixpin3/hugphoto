import mongoose, { Schema, type Model } from "mongoose";

export interface MessageDocument {
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<MessageDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, maxlength: 160 },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    service: { type: String, default: "", trim: true, maxlength: 80 },
    preferredDate: { type: String, default: "", trim: true, maxlength: 40 },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    read: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

MessageSchema.index({ createdAt: -1 });

export const Message: Model<MessageDocument> =
  (mongoose.models.Message as Model<MessageDocument>) ??
  mongoose.model<MessageDocument>("Message", MessageSchema);
