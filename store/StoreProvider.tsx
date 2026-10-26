'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { hydrateFromStorage } from './slices/productsSlice';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    store.dispatch(hydrateFromStorage());
    setMounted(true);
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
