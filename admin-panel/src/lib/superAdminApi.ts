import { axiosClient } from './axiosClient';

export const superAdminApi = {
  async getAdmins() {
    const res = await axiosClient.get('/super-admin/admins');
    return res.data;
  },
  async createAdmin(payload: any) {
    const res = await axiosClient.post('/super-admin/admins', payload);
    return res.data;
  },
  async deleteAdmin(id: string) {
    const res = await axiosClient.delete(`/super-admin/admins/${id}`);
    return res.data;
  },
  async assignPermissions(id: string, permissions: string[], role?: string) {
    const res = await axiosClient.patch(`/super-admin/admins/${id}/permissions`, { permissions, role });
    return res.data;
  },

  async getUsers() {
    const res = await axiosClient.get('/super-admin/users');
    return res.data;
  },
  async deleteUser(id: string) {
    const res = await axiosClient.delete(`/super-admin/users/${id}`);
    return res.data;
  },
  async updateUser(id: string, payload: any) {
    const res = await axiosClient.patch(`/super-admin/users/${id}`, payload);
    return res.data;
  },

  async getSettings() {
    const res = await axiosClient.get('/super-admin/settings');
    return res.data;
  },
  async updateSettings(payload: any) {
    const res = await axiosClient.patch('/super-admin/settings', payload);
    return res.data;
  },

  async getSEO() {
    const res = await axiosClient.get('/super-admin/seo');
    return res.data;
  },
  async updateSEO(payload: any) {
    const res = await axiosClient.patch('/super-admin/seo', payload);
    return res.data;
  },

  async getAnalytics() {
    const res = await axiosClient.get('/super-admin/analytics');
    return res.data;
  },
  async backupDatabase() {
    const res = await axiosClient.post('/super-admin/backup');
    return res.data;
  },
};
