import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import friendApi from "../../api/friendApi";

export const fetchFriends = createAsyncThunk(
  "friends/fetchFriends",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await friendApi.getFriends();
      return data.results || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Failed to load friends.");
    }
  }
);

export const fetchRequests = createAsyncThunk(
  "friends/fetchRequests",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await friendApi.getReceivedRequests();
      return data.results || data;
    } catch (err) {
      return rejectWithValue("Failed to load requests.");
    }
  }
);

export const fetchSuggestions = createAsyncThunk(
  "friends/fetchSuggestions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await friendApi.getSuggestions();
      return data;
    } catch (err) {
      return rejectWithValue("Failed to load suggestions.");
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  "friends/acceptRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      await friendApi.acceptRequest(requestId);
      return requestId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Failed to accept.");
    }
  }
);

export const rejectFriendRequest = createAsyncThunk(
  "friends/rejectRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      await friendApi.rejectRequest(requestId);
      return requestId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Failed to reject.");
    }
  }
);

const initialState = {
  list: [],
  requests: [],
  suggestions: [],
  loading: false,
  error: null,
};

const friendSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    clearFriendError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => { state.loading = true; })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter((r) => r.id !== action.payload);
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter((r) => r.id !== action.payload);
      });
  },
});

export const { clearFriendError } = friendSlice.actions;
export default friendSlice.reducer;
