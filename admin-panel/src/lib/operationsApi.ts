import { axiosClient } from './axiosClient';

export type OperationTeam = 'lqt' | 'sales' | 'procurement';

export type OperationRow = {
  id: string;
  source: 'quote' | 'lead' | 'operation';
  sourceLabel?: string;
  leadId?: string;
  account: string;
  companyName?: string;
  owner: string;
  detail: string;
  status: string;
  leadStatus?: string;
  quoteStatus?: string;
  next: string;
  value: string;
  assignedTeam?: string;
  assignedTo?: string;
  leadTemperature?: string;
  product?: string;
  quantity?: string;
  priority?: string;
  priorityScore?: number;
  buyerType?: string;
  whatsappNumber?: string;
  lastFollowUp?: string;
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

export type WebsiteLeadStats = {
  totalInquiries: number;
  totalWebsiteLeads: number;
  newWebsiteLeads: number;
  qualifiedLeads: number;
  salesAssigned: number;
  quotationsSent: number;
  ordersWon: number;
  convertedLeads: number;
  conversionRate: number;
  leadSourcePerformance: Record<string, number>;
};

export type OperationsDashboard = {
  team: OperationTeam;
  rows: OperationRow[];
  counts: Record<string, unknown>;
  modules: Record<string, number>;
  websiteLeadStats?: WebsiteLeadStats;
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

  async updateLead(id: string, payload: Record<string, unknown>) {
    const res = await axiosClient.patch(`/leads/${id}`, payload);
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
