import { connectDB } from "@/lib/db";
import { Setting, SETTING_KEY, type SettingDocument } from "@/models/Setting";
import type { SiteSettingsDTO, SocialLinksDTO } from "@/lib/types";

export const DEFAULT_SOCIALS: SocialLinksDTO = {
  instagram: "",
  facebook: "",
  tiktok: "",
  youtube: "",
  linkedin: "",
  other: "",
};

export const DEFAULT_SETTINGS: SiteSettingsDTO = {
  websiteName: "HUG Photos",
  telephone: "",
  email: "",
  whatsapp: "",
  location: "",
  socials: DEFAULT_SOCIALS,
};

function serialize(doc: SettingDocument): SiteSettingsDTO {
  return {
    websiteName: doc.websiteName?.trim() || DEFAULT_SETTINGS.websiteName,
    telephone: doc.telephone ?? "",
    email: doc.email ?? "",
    whatsapp: doc.whatsapp ?? "",
    location: doc.location ?? "",
    socials: {
      instagram: doc.socials?.instagram ?? "",
      facebook: doc.socials?.facebook ?? "",
      tiktok: doc.socials?.tiktok ?? "",
      youtube: doc.socials?.youtube ?? "",
      linkedin: doc.socials?.linkedin ?? "",
      other: doc.socials?.other ?? "",
    },
  };
}

export async function getSettings(): Promise<SiteSettingsDTO> {
  await connectDB();

  const doc = await Setting.findOne({ key: SETTING_KEY })
    .lean<SettingDocument>()
    .exec();

  if (doc) return serialize(doc);

  const created = await Setting.create({
    key: SETTING_KEY,
    ...DEFAULT_SETTINGS,
  });
  return serialize(created.toObject() as SettingDocument);
}

export type UpdateSettingsInput = Partial<Omit<SiteSettingsDTO, "socials">> & {
  socials?: Partial<SocialLinksDTO>;
};

export async function updateSettings(
  input: UpdateSettingsInput,
): Promise<SiteSettingsDTO> {
  await connectDB();

  const update: Record<string, unknown> = {};
  for (const field of ["websiteName", "telephone", "email", "whatsapp", "location"] as const) {
    const value = input[field];
    if (value !== undefined) update[field] = value;
  }
  if (input.socials) {
    for (const [key, value] of Object.entries(input.socials)) {
      if (value !== undefined) update[`socials.${key}`] = value;
    }
  }

  const doc = await Setting.findOneAndUpdate(
    { key: SETTING_KEY },
    {
      $set: update,
      $setOnInsert: { key: SETTING_KEY },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  )
    .lean<SettingDocument>()
    .exec();

  if (!doc) throw new Error("Unable to persist site settings.");
  return serialize(doc);
}

export async function getSettingsSafe(): Promise<SiteSettingsDTO> {
  try {
    return await getSettings();
  } catch (error) {
    console.error("[settings] Falling back to default settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export function toTelephoneHref(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : "";
}

export function toWhatsAppDigits(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  return digits ? digits : null;
}

export function toWhatsAppHref(
  value: string,
  message?: string,
): string | null {
  const digits = toWhatsAppDigits(value);
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
