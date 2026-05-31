import { axiosClient } from './axiosClient';

export type OperationTeam = 'lqt' | 'sales' | 'procurement';

export type OperationRow = {
  id: string;
  source: 'quote' | 'operation';
  account: string;
  owner: string;
  detail: string;
  status: string;
  quoteStatus?: string;
  next: string;
  value: string;
  assignedTeam?: string;
  assignedTo?: string;
  leadTemperature?: string;
  requirement?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type OperationMember = {
  id: string;
  name: string;
  email: string;
  role: OperationTeam;
};

export type OperationsDashboard = {
  team: OperationTeam;
  rows: OperationRow[];
  counts: Record<string, unknown>;
  modules: Record<string, number>;
};

export const operationsApi = {
  async getDashboard(team: OperationTeam) {
    const res = await axiosClient.get<OperationsDashboard>(`/operations/${team}/dashboard`);
    return res.data;
  },

  async getMembers(team: OperationTeam) {
    const res = await axiosClient.get<{ data: OperationMember[] }>(`/operations/${team}/members`);
    return res.data.data;
  },

  async updateQuote(team: 'lqt' | 'sales', id: string, payload: Record<string, unknown>) {
    const res = await axiosClient.patch(`/operations/${team}/quotes/${id}`, payload);
    return res.data;
  },

  async createRecord(team: 'sales' | 'procurement', payload: Record<string, unknown>) {
    const res = await axiosClient.post(`/operations/${team}/records`, payload);
    return res.data;
  },

  async updateRecord(team: 'sales' | 'procurement', id: string, payload: Record<string, unknown>) {
    const res = await axiosClient.patch(`/operations/${team}/records/${id}`, payload);
    return res.data;
  },
};
