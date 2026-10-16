import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface AdminDocument {
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminRecord = AdminDocument & { _id: Types.ObjectId };

const AdminSchema = new Schema<AdminDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 60,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Admin: Model<AdminDocument> =
  (mongoose.models.Admin as Model<AdminDocument>) ??
  mongoose.model<AdminDocument>("Admin", AdminSchema);
