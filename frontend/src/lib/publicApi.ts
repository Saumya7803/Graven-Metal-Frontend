import { axiosClient } from './axiosClient';
import { unwrapResponse } from './apiUtils';
import type { AuthUser } from './auth';

export type ApiProduct = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
  unit?: string;
  unitType?: string;
  weightPerUnit?: number;
  weightUnit?: string;
  moq?: number;
  unitPrice?: number;
  stockQty?: number;
  inStock?: boolean;
  image?: { url?: string; publicId?: string };
  category?: { _id: string; name: string; slug: string } | string;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
  image?: { url?: string; publicId?: string };
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
};

export type ApiBlog = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail?: { url?: string; publicId?: string };
  coverImage?: string;
  published?: boolean;
  seo?: { metaTitle?: string; metaDescription?: string; metaKeywords?: string };
  createdAt?: string;
};

export type ContactPayload = {
  fullName: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
};

export type QuotePayload = {
  fullName: string;
  email: string;
  phone: string;
  quantity: string;
  metal: string;
  requirement: string;
  file?: File | null;
};

export type WebsiteLeadPayload = {
  fullName: string;
  companyName: string;
  designation?: string;
  phone: string;
  email: string;
  whatsappNumber?: string;
  industryType: string;
  companyLocation: string;
  city?: string;
  state?: string;
  country?: string;
  gstNumber?: string;
  product: string;
  quantity: number;
  unit: string;
  deliveryLocation: string;
  requirement: string;
  purchaseTimeline: string;
  preferredContactMethod?: string;
  file?: File | null;
};

export type AuthPayload = { email: string; password: string };
export type RegisterPayload = AuthPayload & { name: string; phone?: string; company?: string };
export type AuthResponse = { token: string; user: AuthUser };
export type ApiQuote = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  metal: string;
  quantity: string;
  requirement?: string;
  status: 'new' | 'in_review' | 'quoted' | 'closed';
  adminNotes?: string;
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const publicApi = {
  async getProducts() {
    const res = await axiosClient.get<ApiProduct[]>('/products');
    return res.data;
  },

  async getProductById(id: string) {
    const res = await axiosClient.get<ApiProduct>(`/products/${id}`);
    return res.data;
  },

  async getCategories() {
    const res = await axiosClient.get<ApiCategory[]>('/categories');
    return res.data;
  },

  async getBlogs(params?: { published?: 'true' | 'false' | 'all'; limit?: number }) {
    const res = await axiosClient.get<ApiBlog[]>('/blogs', { params });
    return res.data;
  },

  async submitContact(payload: ContactPayload) {
    const res = await axiosClient.post('/contacts', payload);
    return unwrapResponse(res.data);
  },

  async submitQuote(payload: QuotePayload) {
    const formData = new FormData();
    formData.append('fullName', payload.fullName);
    formData.append('email', payload.email);
    formData.append('phone', payload.phone);
    formData.append('quantity', payload.quantity);
    formData.append('metal', payload.metal);
    formData.append('requirement', payload.requirement);
    if (payload.file) formData.append('file', payload.file);

    const res = await axiosClient.post('/quotes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapResponse(res.data);
  },

  async submitWebsiteLead(payload: WebsiteLeadPayload) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (key === 'file' && value instanceof File) {
        formData.append(key, value);
        return;
      }
      if (key !== 'file') formData.append(key, String(value));
    });

    const res = await axiosClient.post('/leads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapResponse<{ leadId: string; status: string; source: string; priority: string; priorityScore: number }>(res.data);
  },

  async getMyQuotes() {
    const res = await axiosClient.get<{ success: boolean; message: string; data: ApiQuote[] }>('/quotes/mine');
    return res.data.data;
  },

  async loginCustomer(payload: AuthPayload) {
    const res = await axiosClient.post<AuthResponse>('/auth/login/customer', payload);
    return res.data;
  },

  async registerCustomer(payload: RegisterPayload) {
    const res = await axiosClient.post<AuthResponse>('/auth/register/customer', payload);
    return res.data;
  },

  async loginAdmin(payload: AuthPayload) {
    const res = await axiosClient.post<AuthResponse>('/auth/login/admin', payload);
    return res.data;
  },

  async loginSuperAdmin(payload: AuthPayload) {
    const res = await axiosClient.post<AuthResponse>('/auth/login/super-admin', payload);
    return res.data;
  },

  async getMe() {
    const res = await axiosClient.get<{ user: AuthUser }>('/auth/me');
    return res.data.user;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    const res = await axiosClient.post('/auth/change-password', payload);
    return res.data;
  },
};
