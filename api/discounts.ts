import api from './api';

export interface Discount {
  id: string;
  code: string;
  type: 'Percentage' | 'Fixed Amount';
  value: number;
  limit_type: 'uses' | 'time';
  usage: { used: number; limit: number };
  expiry: string;
  status: 'Active' | 'Expired';
  created_at: string;
}

export const discountsApi = {
  list: async (): Promise<Discount[]> => {
    const response = await api.get('/discounts');
    return response.data.data;
  },

  create: async (payload: {
    code: string;
    type: 'Percentage' | 'Fixed Amount';
    value: number;
    limit_type: 'uses' | 'time';
    usage: { limit?: number };
    expiry: string;
    status?: 'Active' | 'Expired';
  }): Promise<Discount> => {
    const response = await api.post('/discounts', payload);
    return response.data.data;
  },

  update: async (id: string, payload: Partial<{
    type: 'Percentage' | 'Fixed Amount';
    value: number;
    limit_type: 'uses' | 'time';
    usage: { limit?: number; used?: number };
    expiry: string;
    status: 'Active' | 'Expired';
  }>): Promise<Discount> => {
    const response = await api.put(`/discounts/${id}`, payload);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/discounts/${id}`);
  },
};
