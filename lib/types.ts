export interface PhotoDTO {
  id: string;
  title: string;
  category: string;
  url: string;
  width: number;
  height: number;
  featured: boolean;
  published: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface MessageDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SocialLinksDTO {
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
  other: string;
}

export interface SiteSettingsDTO {
  websiteName: string;
  telephone: string;
  email: string;
  whatsapp: string;
  location: string;
  socials: SocialLinksDTO;
}

export interface ApiError {
  error: string;
}
