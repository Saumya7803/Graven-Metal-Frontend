import { axiosClient } from './axiosClient';
import type { ApiBlog, ApiCategory, ApiProduct } from './publicApi';

type Wrapped<T> = { success: boolean; message: string; data: T };

export type ApiQuote = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  metal: string;
  quantity: string;
  requirement?: string;
  adminNotes?: string;
  fileUrl?: string;
  createdAt?: string;
  status: 'new' | 'in_review' | 'quoted' | 'closed';
};

export type ApiContact = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  subject?: string;
  message?: string;
  adminNotes?: string;
  createdAt?: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
};

type ProductPayload = {
  name: string;
  slug: string;
  description?: string;
  category: string;
  price: number;
  currency?: string;
  unit?: string;
  stockQty?: number;
  file?: File | null;
};

type CategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  file?: File | null;
};
type BlogPayload = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  published?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  file?: File | null;
};

export type SiteSettingsPayload = {
  siteName?: string;
  supportEmail?: string;
  footerText?: string;
  logoUrl?: string;
  maintenanceMode?: boolean;
  contactDetails?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  socialLinks?: Record<string, string>;
  officeAddresses?: Array<{
    label: string;
    address: string;
    email?: string;
    phone?: string;
  }>;
  paymentMethods?: Array<{
    name: string;
    enabled: boolean;
  }>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
  };
};

function appendDefined(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return;
  formData.append(key, String(value));
}

export const adminApi = {
  async getProducts() {
    const res = await axiosClient.get<ApiProduct[]>('/products');
    return res.data;
  },
  async createProduct(payload: ProductPayload) {
    const fd = new FormData();
    appendDefined(fd, 'name', payload.name);
    appendDefined(fd, 'slug', payload.slug);
    appendDefined(fd, 'description', payload.description || '');
    appendDefined(fd, 'category', payload.category);
    appendDefined(fd, 'price', payload.price);
    appendDefined(fd, 'currency', payload.currency || 'USD');
    appendDefined(fd, 'unit', payload.unit || 'kg');
    appendDefined(fd, 'stockQty', payload.stockQty ?? 0);
    if (payload.file) fd.append('image', payload.file);
    const res = await axiosClient.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },
  async updateProduct(id: string, payload: Partial<ProductPayload>) {
    const fd = new FormData();
    appendDefined(fd, 'name', payload.name);
    appendDefined(fd, 'slug', payload.slug);
    appendDefined(fd, 'description', payload.description);
    appendDefined(fd, 'category', payload.category);
    appendDefined(fd, 'price', payload.price);
    appendDefined(fd, 'currency', payload.currency);
    appendDefined(fd, 'unit', payload.unit);
    appendDefined(fd, 'stockQty', payload.stockQty);
    if (payload.file) fd.append('image', payload.file);
    const res = await axiosClient.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },
  async deleteProduct(id: string) {
    const res = await axiosClient.delete(`/products/${id}`);
    return res.data;
  },

  async getCategories() {
    const res = await axiosClient.get<ApiCategory[]>('/categories');
    return res.data;
  },
  async createCategory(payload: CategoryPayload) {
    const fd = new FormData();
    appendDefined(fd, 'name', payload.name);
    appendDefined(fd, 'slug', payload.slug);
    appendDefined(fd, 'description', payload.description || '');
    appendDefined(fd, 'sortOrder', payload.sortOrder);
    appendDefined(fd, 'metaTitle', payload.metaTitle);
    appendDefined(fd, 'metaDescription', payload.metaDescription);
    if (payload.file) fd.append('image', payload.file);
    const res = await axiosClient.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },
  async updateCategory(id: string, payload: Partial<CategoryPayload>) {
    const fd = new FormData();
    appendDefined(fd, 'name', payload.name);
    appendDefined(fd, 'slug', payload.slug);
    appendDefined(fd, 'description', payload.description);
    appendDefined(fd, 'sortOrder', payload.sortOrder);
    appendDefined(fd, 'metaTitle', payload.metaTitle);
    appendDefined(fd, 'metaDescription', payload.metaDescription);
    if (payload.file) fd.append('image', payload.file);
    const res = await axiosClient.put(`/categories/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },
  async deleteCategory(id: string) {
    const res = await axiosClient.delete(`/categories/${id}`);
    return res.data;
  },

  async getBlogs() {
    const res = await axiosClient.get<ApiBlog[]>('/blogs?published=all');
    return res.data;
  },
  async createBlog(payload: BlogPayload) {
    const fd = new FormData();
    fd.append('title', payload.title);
    fd.append('slug', payload.slug);
    fd.append('excerpt', payload.excerpt);
    fd.append('content', payload.content);
    appendDefined(fd, 'published', payload.published ?? true);
    appendDefined(fd, 'metaTitle', payload.metaTitle);
    appendDefined(fd, 'metaDescription', payload.metaDescription);
    appendDefined(fd, 'metaKeywords', payload.metaKeywords);
    if (payload.coverImage) fd.append('coverImage', payload.coverImage);
    if (payload.file) fd.append('thumbnail', payload.file);
    const res = await axiosClient.post('/blogs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },
  async updateBlog(id: string, payload: Partial<BlogPayload>) {
    const fd = new FormData();
    appendDefined(fd, 'title', payload.title);
    appendDefined(fd, 'slug', payload.slug);
    appendDefined(fd, 'excerpt', payload.excerpt);
    appendDefined(fd, 'content', payload.content);
    appendDefined(fd, 'published', payload.published);
    appendDefined(fd, 'metaTitle', payload.metaTitle);
    appendDefined(fd, 'metaDescription', payload.metaDescription);
    appendDefined(fd, 'metaKeywords', payload.metaKeywords);
    appendDefined(fd, 'coverImage', payload.coverImage);
    if (payload.file) fd.append('thumbnail', payload.file);
    const res = await axiosClient.put(`/blogs/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },
  async deleteBlog(id: string) {
    const res = await axiosClient.delete(`/blogs/${id}`);
    return res.data;
  },

  async getQuotes() {
    const res = await axiosClient.get<Wrapped<ApiQuote[]>>('/quotes');
    return res.data.data;
  },
  async updateQuoteStatus(id: string, status: string) {
    const res = await axiosClient.patch<Wrapped<ApiQuote>>(`/quotes/${id}/status`, { status });
    return res.data.data;
  },
  async updateQuote(id: string, payload: Partial<ApiQuote>) {
    const res = await axiosClient.put<Wrapped<ApiQuote>>(`/quotes/${id}`, payload);
    return res.data.data;
  },

  async getContacts() {
    const res = await axiosClient.get<Wrapped<{ items: ApiContact[] }>>('/contacts');
    return res.data.data.items;
  },
  async updateContactStatus(id: string, status: ApiContact['status'], adminNotes?: string) {
    const res = await axiosClient.put<Wrapped<ApiContact>>(`/contacts/${id}`, { status, adminNotes });
    return res.data.data;
  },
  async deleteContact(id: string) {
    const res = await axiosClient.delete(`/contacts/${id}`);
    return res.data;
  },

  async getSettings() {
    const res = await axiosClient.get('/settings');
    return res.data;
  },
  async updateSettings(payload: SiteSettingsPayload) {
    const res = await axiosClient.patch('/settings', payload);
    return res.data;
  },
  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    const res = await axiosClient.post('/auth/change-password', payload);
    return res.data;
  },
};
