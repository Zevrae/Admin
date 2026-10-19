import api from './api';

export const paymentsApi = {
  verify: async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const response = await api.post('/payments/verify', payload);
    return response.data;
  },
};
