import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { imageSize } from "image-size";
import { getCloudinaryConfig } from "@/lib/env";

export interface StoredImage {
  url: string;
  publicId: string | null;
  width: number;
  height: number;
  provider: StorageProvider;
}

export type StorageProvider = "cloudinary" | "local";

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

export function activeStorageProvider(): StorageProvider {
  return getCloudinaryConfig() ? "cloudinary" : "local";
}

function readDimensions(buffer: Buffer): { width: number; height: number } {
  try {
    const size = imageSize(buffer);
    if (size.width && size.height) {
      return { width: size.width, height: size.height };
    }
  } catch {
    return { width: 1200, height: 800 };
  }
  return { width: 1200, height: 800 };
}

function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
): Promise<UploadApiResponse> {
  const config = getCloudinaryConfig();
  if (!config) throw new Error("Cloudinary is not configured.");

  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", overwrite: false },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export async function storeImage(
  buffer: Buffer,
  mimetype: string,
): Promise<StoredImage> {
  const { width, height } = readDimensions(buffer);
  const config = getCloudinaryConfig();

  if (config) {
    const result = await uploadToCloudinary(buffer, config.folder);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width ?? width,
      height: result.height ?? height,
      provider: "cloudinary",
    };
  }

  const extension = EXTENSION_BY_MIME[mimetype] ?? ".jpg";
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return {
    url: `/uploads/${filename}`,
    publicId: null,
    width,
    height,
    provider: "local",
  };
}

export async function deleteImage(
  publicId: string | null,
  url: string,
): Promise<void> {
  const config = getCloudinaryConfig();

  if (publicId && config) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
    await cloudinary.uploader.destroy(publicId).catch(() => undefined);
    return;
  }

  if (url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    await unlink(filePath).catch(() => undefined);
  }
}
