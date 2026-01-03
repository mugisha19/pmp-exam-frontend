import api from "./api";

export const getNotes = async (search = null) => {
  const params = search ? { search } : {};
  const response = await api.get("/notes", { params });
  return response.data;
};

export const getNote = async (noteId) => {
  const response = await api.get(`/notes/${noteId}`);
  return response.data;
};

export const createNote = async (data) => {
  const response = await api.post("/notes", data);
  return response.data;
};

export const updateNote = async (noteId, data) => {
  const response = await api.put(`/notes/${noteId}`, data);
  return response.data;
};

export const deleteNote = async (noteId) => {
  await api.delete(`/notes/${noteId}`);
};
