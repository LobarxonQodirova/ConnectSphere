import api from "./axiosConfig";

const messageApi = {
  getThreads() {
    return api.get("/messages/threads/");
  },

  createThread(participantIds, title = "") {
    return api.post("/messages/threads/create/", {
      participant_ids: participantIds,
      title,
    });
  },

  getMessages(threadId, page = 1) {
    return api.get(`/messages/threads/${threadId}/messages/`, {
      params: { page },
    });
  },

  sendMessage(threadId, content, messageType = "text") {
    return api.post(`/messages/threads/${threadId}/send/`, {
      content,
      message_type: messageType,
    });
  },

  markThreadRead(threadId) {
    return api.post(`/messages/threads/${threadId}/read/`);
  },
};

export default messageApi;
