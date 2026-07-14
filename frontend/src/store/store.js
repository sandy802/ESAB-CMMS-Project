// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer  from './authSlice';
import themeReducer from './themeSlice';

const store = configureStore({
  reducer: {
    auth:  authReducer,
    theme: themeReducer,
    // add other slices here as the app grows: tickets, masterData, etc.
  },
});

export default store;