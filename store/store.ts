import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import customizationReducer from './slices/customizationSlice';
import collectionsReducer from './slices/collectionsSlice';
import categoriesReducer from './slices/categoriesSlice';
import discountsReducer from './slices/discountsSlice';
import analysisReducer from './slices/analysisSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    customization: customizationReducer,
    collections: collectionsReducer,
    categories: categoriesReducer,
    discounts: discountsReducer,
    analysis: analysisReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
