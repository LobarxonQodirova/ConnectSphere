import api from "./axiosConfig";

const postApi = {
  getFeed(page = 1) {
    return api.get("/feed/", { params: { page } });
  },

  getPost(postId) {
    return api.get(`/posts/${postId}/`);
  },

  createPost(formData) {
    return api.post("/posts/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updatePost(postId, data) {
    return api.patch(`/posts/${postId}/`, data);
  },

  deletePost(postId) {
    return api.delete(`/posts/${postId}/`);
  },

  likePost(postId, reaction = "like") {
    return api.post(`/posts/${postId}/like/`, { reaction });
  },

  unlikePost(postId) {
    return api.post(`/posts/${postId}/unlike/`);
  },

  sharePost(postId, comment = "", visibility = "friends") {
    return api.post(`/posts/${postId}/share/`, { comment, visibility });
  },

  getComments(postId, page = 1) {
    return api.get(`/posts/${postId}/comments/`, { params: { page } });
  },

  addComment(postId, content, parentId = null) {
    return api.post(`/posts/${postId}/comments/`, { content, parent: parentId });
  },

  deleteComment(commentId) {
    return api.delete(`/posts/comments/${commentId}/`);
  },
};

export default postApi;
