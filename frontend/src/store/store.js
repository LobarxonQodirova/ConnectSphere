import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import feedReducer from "./slices/feedSlice";
import friendReducer from "./slices/friendSlice";
import messageReducer from "./slices/messageSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
    friends: friendReducer,
    messages: messageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["messages/setWebSocket"],
        ignoredPaths: ["messages.socket"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});
