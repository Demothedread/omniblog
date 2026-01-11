export enum PostStatus {
  DRAFT = 'Draft',
  SCHEDULED = 'Scheduled',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived'
}

export enum PaywallStatus {
  FREE = 'Free',
  SUBSCRIPTION = 'Subscription',
  PREVIEW = 'First 100 Words'
}

export interface Site {
  id: string;
  name: string;
  url: string;
}

export interface BlogPost {
  id: string;
  siteId: string;
  title: string;
  author: string;
  summary: string; // Bullet point summary
  coverImage?: string; // Base64 or URL
  content: string; // HTML content
  status: PostStatus;
  paywall: PaywallStatus;
  createdAt: string; // ISO Date
  publishDate?: string; // ISO Date for scheduling
  updatedAt: string;
}

export interface AIConfig {
  tone: string;
  style: string;
  sourceMaterial: string;
}

export interface StorageSettings {
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
}

export const MOCK_SITES: Site[] = [
  { id: 'site-1', name: 'Tech Chronicles', url: 'https://tech.example.com' },
  { id: 'site-2', name: 'Personal Journal', url: 'https://journal.example.com' },
  { id: 'site-3', name: 'Foodie Adventures', url: 'https://food.example.com' },
];