'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { hydrateFromStorage as hydrateProductsFromStorage } from './slices/productsSlice';
import { hydrateCustomizationFromStorage } from './slices/customizationSlice';
import { hydrateCollectionsFromStorage } from './slices/collectionsSlice';
import { hydrateCategoriesFromStorage } from './slices/categoriesSlice';
import { hydrateDiscountsFromStorage } from './slices/discountsSlice';
import { hydrateAnalysisFromStorage } from './slices/analysisSlice';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(hydrateProductsFromStorage());
    store.dispatch(hydrateCustomizationFromStorage());
    store.dispatch(hydrateCollectionsFromStorage());
    store.dispatch(hydrateCategoriesFromStorage());
    store.dispatch(hydrateDiscountsFromStorage());
    store.dispatch(hydrateAnalysisFromStorage());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
