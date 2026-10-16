import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Message, type MessageDocument } from "@/models/Message";
import type { MessageDTO } from "@/lib/types";

type MessageLean = MessageDocument & { _id: Types.ObjectId };

function serializeMessage(doc: MessageLean): MessageDTO {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    phone: doc.phone ?? "",
    service: doc.service ?? "",
    preferredDate: doc.preferredDate ?? "",
    message: doc.message,
    read: Boolean(doc.read),
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt),
  };
}

export interface CreateMessageInput {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  preferredDate?: string;
  message: string;
}

export async function createMessage(
  input: CreateMessageInput,
): Promise<MessageDTO> {
  await connectDB();
  const doc = await Message.create({
    name: input.name,
    email: input.email,
    phone: input.phone ?? "",
    service: input.service ?? "",
    preferredDate: input.preferredDate ?? "",
    message: input.message,
  });
  return serializeMessage(doc.toObject() as MessageLean);
}

export async function listMessages(limit = 100): Promise<{
  items: MessageDTO[];
  unread: number;
}> {
  await connectDB();
  const [docs, unread] = await Promise.all([
    Message.find()
      .sort({ createdAt: -1 })
      .limit(Math.max(1, Math.min(500, limit)))
      .lean<MessageLean[]>()
      .exec(),
    Message.countDocuments({ read: false }).exec(),
  ]);
  return { items: docs.map(serializeMessage), unread };
}

export async function setMessageRead(
  id: string,
  read: boolean,
): Promise<MessageDTO | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  const doc = await Message.findByIdAndUpdate(
    id,
    { $set: { read } },
    { new: true },
  )
    .lean<MessageLean | null>()
    .exec();
  return doc ? serializeMessage(doc) : null;
}

export async function deleteMessageById(id: string): Promise<boolean> {
  if (!Types.ObjectId.isValid(id)) return false;
  await connectDB();
  const result = await Message.findByIdAndDelete(id).exec();
  return Boolean(result);
}
