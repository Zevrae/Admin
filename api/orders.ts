import api from './api';

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  size?: string;
  quantity: number;
  category?: string;
  image?: string;
  design_images?: string[];
}

export interface ExchangeRequest {
  reason: string;
  item_indexes?: number[];
  status: 'requested' | 'approved' | 'rejected' | 'completed';
  requested_at: string;
}

export interface Order {
  id: string;
  user: string | { id: string; name: string; email: string; phone?: string };
  items: OrderItem[];
  shipping_address: ShippingAddress;
  subtotal: number;
  shipping_fee: number;
  handling_fee: number;
  discount_code: string | null;
  discount_amount: number;
  total: number;
  payment_method: 'online' | 'cod';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  order_status: 'payment_pending' | 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  expected_delivery_date?: string | null;
  delivered_at?: string | null;
  updated_at?: string;
  exchange_request?: ExchangeRequest | null;
}

export const ordersApi = {
  list: async (params?: { page?: number; limit?: number; order_status?: string; payment_status?: string; payment_method?: string }) => {
    const response = await api.get('/orders', { params });
    return response.data as { success: boolean; data: Order[]; pagination: { page: number; limit: number; total: number; pages: number } };
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  updateStatus: async (id: string, updates: { order_status?: string; payment_status?: string; expected_delivery_date?: string | null }): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/status`, updates);
    return response.data.data;
  },
};
