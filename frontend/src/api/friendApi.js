import api from "./axiosConfig";

const friendApi = {
  getFriends(page = 1) {
    return api.get("/friends/", { params: { page } });
  },

  sendFriendRequest(receiverId, message = "") {
    return api.post("/friends/request/", { receiver_id: receiverId, message });
  },

  getReceivedRequests() {
    return api.get("/friends/requests/received/");
  },

  getSentRequests() {
    return api.get("/friends/requests/sent/");
  },

  acceptRequest(requestId) {
    return api.post(`/friends/request/${requestId}/accept/`);
  },

  rejectRequest(requestId) {
    return api.post(`/friends/request/${requestId}/reject/`);
  },

  unfriend(userId) {
    return api.delete(`/friends/unfriend/${userId}/`);
  },

  blockUser(userId) {
    return api.post("/friends/block/", { blocked_id: userId });
  },

  unblockUser(userId) {
    return api.delete(`/friends/unblock/${userId}/`);
  },

  getSuggestions() {
    return api.get("/friends/suggestions/");
  },
};

export default friendApi;
