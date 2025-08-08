import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/authSlice";
import bookingReducer from "../store/bookingSlice";
import parkingReducer from "../store/parkingSlice";
import userReducer from "../store/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    parking: parkingReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// For TypeScript projects, you can export these types:
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
