import api from './api';

export interface CartItem {
  id?: string;
  product: string;
  name: string;
  price: number;
  size?: string;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await api.get('/cart');
    return response.data.data;
  },

  addItem: async (productId: string, size: string | undefined, quantity = 1): Promise<Cart> => {
    const response = await api.post('/cart/items', { productId, size, quantity });
    return response.data.data;
  },

  updateItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data.data;
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data.data;
  },

  clearCart: async (): Promise<Cart> => {
    const response = await api.delete('/cart');
    return response.data.data;
  },
};
