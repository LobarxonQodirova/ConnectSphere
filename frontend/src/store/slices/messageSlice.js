import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import messageApi from "../../api/messageApi";

export const fetchThreads = createAsyncThunk(
  "messages/fetchThreads",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await messageApi.getThreads();
      return data.results || data;
    } catch (err) {
      return rejectWithValue("Failed to load conversations.");
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ threadId, page = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await messageApi.getMessages(threadId, page);
      return {
        threadId,
        messages: data.results || data,
        hasMore: !!data.next,
        page,
      };
    } catch (err) {
      return rejectWithValue("Failed to load messages.");
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ threadId, content }, { rejectWithValue }) => {
    try {
      const { data } = await messageApi.sendMessage(threadId, content);
      return { threadId, message: data };
    } catch (err) {
      return rejectWithValue("Failed to send message.");
    }
  }
);

const initialState = {
  threads: [],
  activeThreadId: null,
  messagesByThread: {},
  loading: false,
  sendingMessage: false,
  error: null,
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setActiveThread(state, action) {
      state.activeThreadId = action.payload;
    },
    addIncomingMessage(state, action) {
      const { threadId, message } = action.payload;
      if (!state.messagesByThread[threadId]) {
        state.messagesByThread[threadId] = { messages: [], hasMore: false };
      }
      state.messagesByThread[threadId].messages.push(message);

      // Update thread preview
      const thread = state.threads.find((t) => t.id === threadId);
      if (thread) {
        thread.last_message = message;
        thread.last_message_at = message.created_at;
      }
    },
    clearMessageError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThreads.pending, (state) => { state.loading = true; })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.loading = false;
        state.threads = action.payload;
      })
      .addCase(fetchThreads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { threadId, messages, hasMore, page } = action.payload;
        if (page === 1) {
          state.messagesByThread[threadId] = {
            messages: messages.reverse(),
            hasMore,
          };
        } else {
          const existing = state.messagesByThread[threadId]?.messages || [];
          state.messagesByThread[threadId] = {
            messages: [...messages.reverse(), ...existing],
            hasMore,
          };
        }
      })
      .addCase(sendMessage.pending, (state) => { state.sendingMessage = true; })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        const { threadId, message } = action.payload;
        if (!state.messagesByThread[threadId]) {
          state.messagesByThread[threadId] = { messages: [], hasMore: false };
        }
        state.messagesByThread[threadId].messages.push(message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveThread, addIncomingMessage, clearMessageError } = messageSlice.actions;
export default messageSlice.reducer;
