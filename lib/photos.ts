import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Photo, type PhotoDocument } from "@/models/Photo";
import type { Paginated, PhotoDTO } from "@/lib/types";

type PhotoLean = PhotoDocument & { _id: Types.ObjectId };

export function serializePhoto(doc: PhotoLean): PhotoDTO {
  return {
    id: String(doc._id),
    title: doc.title ?? "",
    category: doc.category ?? "",
    url: doc.url,
    width: doc.width || 1200,
    height: doc.height || 800,
    featured: Boolean(doc.featured),
    published: Boolean(doc.published),
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt),
  };
}

export interface ListOptions {
  page?: number;
  pageSize?: number;
  category?: string;
}

function normalizePaging({ page = 1, pageSize = 24 }: ListOptions) {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.min(60, Math.max(1, Math.floor(pageSize)));
  return { safePage, safeSize, skip: (safePage - 1) * safeSize };
}

async function paginate(
  filter: Record<string, unknown>,
  options: ListOptions,
): Promise<Paginated<PhotoDTO>> {
  await connectDB();
  const { safePage, safeSize, skip } = normalizePaging(options);

  const [docs, total] = await Promise.all([
    Photo.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(safeSize)
      .lean<PhotoLean[]>()
      .exec(),
    Photo.countDocuments(filter).exec(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / safeSize));

  return {
    items: docs.map(serializePhoto),
    page: safePage,
    pageSize: safeSize,
    total,
    totalPages,
    hasMore: safePage < totalPages,
  };
}

export function listPublishedPhotos(
  options: ListOptions = {},
): Promise<Paginated<PhotoDTO>> {
  const filter: Record<string, unknown> = { published: true };
  if (options.category) filter.category = options.category;
  return paginate(filter, options);
}

export function listAllPhotos(
  options: ListOptions = {},
): Promise<Paginated<PhotoDTO>> {
  return paginate({}, options);
}

export async function listFeaturedPhotos(limit = 6): Promise<PhotoDTO[]> {
  await connectDB();
  const docs = await Photo.find({ published: true, featured: true })
    .sort({ createdAt: -1, _id: -1 })
    .limit(Math.max(1, Math.min(24, limit)))
    .lean<PhotoLean[]>()
    .exec();
  return docs.map(serializePhoto);
}

export async function listRecentPhotos(limit = 8): Promise<PhotoDTO[]> {
  await connectDB();
  const docs = await Photo.find({ published: true })
    .sort({ createdAt: -1, _id: -1 })
    .limit(Math.max(1, Math.min(24, limit)))
    .lean<PhotoLean[]>()
    .exec();
  return docs.map(serializePhoto);
}

export async function countPhotos(): Promise<{
  total: number;
  published: number;
  featured: number;
}> {
  await connectDB();
  const [total, published, featured] = await Promise.all([
    Photo.estimatedDocumentCount(),
    Photo.countDocuments({ published: true }).exec(),
    Photo.countDocuments({ featured: true }).exec(),
  ]);
  return { total, published, featured };
}

export interface CreatePhotoInput {
  title?: string;
  category?: string;
  featured?: boolean;
  url: string;
  publicId?: string | null;
  width?: number;
  height?: number;
}

export async function createPhoto(input: CreatePhotoInput): Promise<PhotoDTO> {
  await connectDB();
  const doc = await Photo.create({
    title: input.title ?? "",
    category: input.category ?? "",
    featured: Boolean(input.featured),
    published: true,
    url: input.url,
    publicId: input.publicId ?? null,
    width: input.width ?? 1200,
    height: input.height ?? 800,
  });
  return serializePhoto(doc.toObject() as PhotoLean);
}

export interface UpdatePhotoInput {
  title?: string;
  category?: string;
  featured?: boolean;
  published?: boolean;
}

export async function updatePhoto(
  id: string,
  input: UpdatePhotoInput,
): Promise<PhotoDTO | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();

  if (input.featured === true) {
    await Photo.updateMany({ _id: { $ne: id } }, { $set: { featured: false } });
  }

  const doc = await Photo.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true, runValidators: true },
  )
    .lean<PhotoLean | null>()
    .exec();

  return doc ? serializePhoto(doc) : null;
}

export async function getPhotoById(id: string): Promise<PhotoLean | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  return Photo.findById(id).lean<PhotoLean | null>().exec();
}

export async function deletePhotoById(
  id: string,
): Promise<PhotoLean | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  return Photo.findByIdAndDelete(id).lean<PhotoLean | null>().exec();
}
