import { BlogPost, PostStatus, PaywallStatus, MOCK_SITES, AIConfig, StorageSettings } from '../types';

const STORAGE_KEY = 'omniblog_posts_v1';
const AI_CONFIG_KEY = 'omniblog_ai_config_v1';
const STORAGE_SETTINGS_KEY = 'omniblog_storage_settings_v1';

export const getPosts = (): BlogPost[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return initializeDefaults();
  }
  return JSON.parse(data);
};

export const savePosts = (posts: BlogPost[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const createPost = (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): BlogPost => {
  const posts = getPosts();
  const newPost: BlogPost = {
    ...post,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  posts.push(newPost);
  savePosts(posts);
  return newPost;
};

export const updatePost = (id: string, updates: Partial<BlogPost>): BlogPost[] => {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...updates, updatedAt: new Date().toISOString() };
    savePosts(posts);
  }
  return posts;
};

export const deletePost = (id: string): BlogPost[] => {
  const posts = getPosts();
  const filtered = posts.filter(p => p.id !== id);
  savePosts(filtered);
  return filtered;
};

export const getAIConfig = (): AIConfig => {
  const data = localStorage.getItem(AI_CONFIG_KEY);
  return data ? JSON.parse(data) : { tone: '', style: '', sourceMaterial: '' };
};

export const saveAIConfig = (config: AIConfig) => {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
};

export const getStorageSettings = (): StorageSettings => {
  const data = localStorage.getItem(STORAGE_SETTINGS_KEY);
  return data ? JSON.parse(data) : { cloudinaryCloudName: '', cloudinaryUploadPreset: '' };
};

export const saveStorageSettings = (settings: StorageSettings) => {
  localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
};

function initializeDefaults(): BlogPost[] {
  const defaults: BlogPost[] = [
    {
      id: '1',
      siteId: MOCK_SITES[0].id,
      title: 'The Future of React',
      author: 'Jane Doe',
      summary: '• React 19 features\n• Server Components\n• Performance gains',
      content: '<p>React continues to evolve...</p>',
      status: PostStatus.PUBLISHED,
      paywall: PaywallStatus.FREE,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      publishDate: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      siteId: MOCK_SITES[0].id,
      title: 'Understanding TypeScript Generics',
      author: 'John Smith',
      summary: '• Basic syntax\n• Advanced constraints\n• Real world examples',
      content: '<p>Generics are powerful...</p>',
      status: PostStatus.SCHEDULED,
      paywall: PaywallStatus.SUBSCRIPTION,
      createdAt: new Date().toISOString(),
      publishDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      siteId: MOCK_SITES[1].id,
      title: 'My Trip to Tokyo',
      author: 'Jane Doe',
      summary: '• Food\n• Shinjuku\n• Temples',
      content: '<p>Tokyo was amazing...</p>',
      status: PostStatus.DRAFT,
      paywall: PaywallStatus.FREE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
  savePosts(defaults);
  return defaults;
}