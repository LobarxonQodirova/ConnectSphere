import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import postApi from "../../api/postApi";

export const fetchFeed = createAsyncThunk(
  "feed/fetchFeed",
  async (page = 1, { rejectWithValue }) => {
    try {
      const { data } = await postApi.getFeed(page);
      return { results: data.results, page, hasMore: !!data.next };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Failed to load feed.");
    }
  }
);

export const createPost = createAsyncThunk(
  "feed/createPost",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await postApi.createPost(formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to create post.");
    }
  }
);

export const toggleLike = createAsyncThunk(
  "feed/toggleLike",
  async ({ postId, isLiked, reaction }, { rejectWithValue }) => {
    try {
      if (isLiked) {
        await postApi.unlikePost(postId);
        return { postId, liked: false };
      }
      await postApi.likePost(postId, reaction || "like");
      return { postId, liked: true, reaction: reaction || "like" };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Action failed.");
    }
  }
);

const initialState = {
  items: [],
  page: 1,
  hasMore: true,
  loading: false,
  creating: false,
  error: null,
};

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    resetFeed(state) {
      state.items = [];
      state.page = 1;
      state.hasMore = true;
    },
    removePost(state, action) {
      state.items = state.items.filter((item) => item.post?.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        const newItems = action.payload.results;
        if (action.payload.page === 1) {
          state.items = newItems;
        } else {
          const existingIds = new Set(state.items.map((i) => i.id));
          const unique = newItems.filter((i) => !existingIds.has(i.id));
          state.items = [...state.items, ...unique];
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPost.pending, (state) => {
        state.creating = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.creating = false;
        state.items.unshift({
          id: action.payload.id,
          content_type: "post",
          post: action.payload,
          score: 1,
          is_seen: false,
        });
      })
      .addCase(createPost.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, liked } = action.payload;
        const item = state.items.find((i) => i.post?.id === postId);
        if (item && item.post) {
          item.post.is_liked = liked;
          item.post.like_count += liked ? 1 : -1;
        }
      });
  },
});

export const { resetFeed, removePost } = feedSlice.actions;
export default feedSlice.reducer;
