import ajax from "./fetchService";

const API_BASE = "/api";

const apiService = {
  // ----- Authentication -----
  register: async (username, password) => {
    const reqBody = { username, password };
    return await ajax(`${API_BASE}/auth/register`, "POST", reqBody);
  },
  login: async (username, password) => {
    const reqBody = { username, password };
    return await ajax(`${API_BASE}/auth/login`, "POST", reqBody);
  },
  logout: async () => {
    return await ajax(`${API_BASE}/auth/logout`, "GET");
  },
  validateAuth: async () => {
    return await ajax(`${API_BASE}/auth/validate`, "GET");
  },

  // ----- Story -----
  getStories: async () => {
    return await ajax(`${API_BASE}/stories`, "GET");
  },
  getStoryDetails: async (storyId) => {
    return await ajax(`${API_BASE}/stories/${storyId}`, "GET");
  },
  createStory: async (storyDto) => {
    return await ajax(`${API_BASE}/stories`, "POST", storyDto);
  },
  updateStory: async (storyId, storyDto) => {
    return await ajax(`${API_BASE}/stories/${storyId}`, "PUT", storyDto);
  },
  deleteStory: async (storyId) => {
    return await ajax(`${API_BASE}/stories/${storyId}`, "DELETE");
  },
  //get all plot events
  //add new plot event

  // ----- PlotEvent -----
  getPlotEvent: async (eventId) => {
    return await ajax(`${API_BASE}/plotEvents/${eventId}`, "GET");
  },
  updatePlotEvent: async (eventId, plotEventDto) => {
    return await ajax(`${API_BASE}/plotEvents/${eventId}`, "PUT", plotEventDto);
  },
  deletePlotEvent: async (eventId) => {
    return await ajax(`${API_BASE}/plotEvents/${eventId}`, "DELETE");
  },
  addTagToPlotEvent: async (eventId, tagId) => {
    return await ajax(`${API_BASE}/plotEvents/${eventId}/tag${tagId}`, "POST");
  },
  removeTagFromPlotEvent: async (eventId, tagId) => {
    return await ajax(
      `${API_BASE}/plotEvents/${eventId}/tag/${tagId}`,
      "DELETE"
    );
  },
  getPlotEvents: async (storyId) => {
    return await ajax(`${API_BASE}/stories/${storyId}/plotevents`, "GET");
  },
  addPlotEvent: async (storyId, plotEventDto) => {
    return await ajax(
      `${API_BASE}/stories/${storyId}/plotevents`,
      "POST",
      plotEventDto
    );
  },

  // ----- Tag -----
  getTags: async (storyId) => {
    return await ajax(`${API_BASE}/stories/${storyId}/tags`, "GET");
  },
  getTag: async (storyId, tagId) => {
    return await ajax(`${API_BASE}/stories/${storyId}/tags/${tagId}`, "GET");
  },
  createTag: async (storyId, tagDto) => {
    return await ajax(`${API_BASE}/stories/${storyId}/tags`, "POST", tagDto);
  },
  updateTag: async (storyId, tagId, tagDto) => {
    return await ajax(
      `${API_BASE}/stories/${storyId}/tags/${tagId}`,
      "PUT",
      tagDto
    );
  },
  deleteTag: async (storyId, tagId) => {
    return await ajax(`${API_BASE}/stories/${storyId}/tags/${tagId}`, "DELETE");
  },

  // ----- TagType -----
  getTagTypes: async (storyId) => {
    return await ajax(`${API_BASE}/stories/${storyId}/tagtypes`, "GET");
  },
  getTagType: async (storyId, tagTypeId) => {
    return await ajax(
      `${API_BASE}/stories/${storyId}/tagtypes/${tagTypeId}`,
      "GET"
    );
  },
  createTagType: async (storyId, tagTypeDto) => {
    return await ajax(
      `${API_BASE}/stories/${storyId}/tagtypes`,
      "POST",
      tagTypeDto
    );
  },
  updateTagType: async (storyId, tagTypeId, tagTypeDto) => {
    return await ajax(
      `${API_BASE}/stories/${storyId}/tagtypes/${tagTypeId}`,
      "PUT",
      tagTypeDto
    );
  },
  deleteTagType: async (storyId, tagTypeId) => {
    return await ajax(
      `${API_BASE}/stories/${storyId}/tagtypes/${tagTypeId}`,
      "DELETE"
    );
  },
};

export default apiService;
