import ajax from "./fetchService";

const API_BASE = "/api";

const apiService = {
  // ----- Authentication -----
  register: (username, password) =>
    ajax(`${API_BASE}/auth/register`, "POST", { username, password }),
  login: (username, password) =>
    ajax(`${API_BASE}/auth/login`, "POST", { username, password }),
  logout: () => ajax(`${API_BASE}/auth/logout`, "GET"),
  validateAuth: () => ajax(`${API_BASE}/auth/validate`, "GET"),

  // ----- Story -----
  getStories: () => ajax(`${API_BASE}/stories`, "GET"),
  getStoryDetails: (storyId) => ajax(`${API_BASE}/stories/${storyId}`, "GET"),
  createStory: (storyDto) => ajax(`${API_BASE}/stories`, "POST", storyDto),
  updateStory: (storyId, storyDto) =>
    ajax(`${API_BASE}/stories/${storyId}`, "PUT", storyDto),
  deleteStory: (storyId) => ajax(`${API_BASE}/stories/${storyId}`, "DELETE"),

  // ----- PlotEvent -----
  getPlotEvent: (eventId) => ajax(`${API_BASE}/plotEvents/${eventId}`, "GET"),
  updatePlotEvent: (eventId, plotEventDto) =>
    ajax(`${API_BASE}/plotEvents/${eventId}`, "PUT", plotEventDto),
  deletePlotEvent: (eventId) =>
    ajax(`${API_BASE}/plotEvents/${eventId}`, "DELETE"),
  addTagToPlotEvent: (eventId, tagId) =>
    ajax(`${API_BASE}/plotEvents/${eventId}/tag/${tagId}`, "POST"),
  removeTagFromPlotEvent: (eventId, tagId) =>
    ajax(`${API_BASE}/plotEvents/${eventId}/tag/${tagId}`, "DELETE"),
  getPlotEvents: (storyId, sortBy) =>
    ajax(`${API_BASE}/stories/${storyId}/plotevents?sortBy=${storyId}`, "GET"),
  addPlotEvent: (storyId, plotEventDto) =>
    ajax(`${API_BASE}/stories/${storyId}/plotevents`, "POST", plotEventDto),

  // ----- Tag -----
  getTags: (storyId) => ajax(`${API_BASE}/stories/${storyId}/tags`, "GET"),
  getTag: (storyId, tagId) =>
    ajax(`${API_BASE}/stories/${storyId}/tags/${tagId}`, "GET"),
  createTag: (storyId, tagDto) =>
    ajax(`${API_BASE}/stories/${storyId}/tags`, "POST", tagDto),
  updateTag: (storyId, tagId, tagDto) =>
    ajax(`${API_BASE}/stories/${storyId}/tags/${tagId}`, "PUT", tagDto),
  deleteTag: (storyId, tagId) =>
    ajax(`${API_BASE}/stories/${storyId}/tags/${tagId}`, "DELETE"),

  // ----- TagType -----
  getTagTypes: (storyId) =>
    ajax(`${API_BASE}/stories/${storyId}/tagtypes`, "GET"),
  getTagType: (storyId, tagTypeId) =>
    ajax(`${API_BASE}/stories/${storyId}/tagtypes/${tagTypeId}`, "GET"),
  createTagType: (storyId, tagTypeDto) =>
    ajax(`${API_BASE}/stories/${storyId}/tagtypes`, "POST", tagTypeDto),
  updateTagType: (storyId, tagTypeId, tagTypeDto) =>
    ajax(
      `${API_BASE}/stories/${storyId}/tagtypes/${tagTypeId}`,
      "PUT",
      tagTypeDto
    ),
  deleteTagType: (storyId, tagTypeId) =>
    ajax(`${API_BASE}/stories/${storyId}/tagtypes/${tagTypeId}`, "DELETE"),
};

export default apiService;
