import api from "./api";

export const getAdminDashboard = () => api.get("/admin/dashboard");
export const renewElection = (payload) =>
  api.post("/admin/elections/renew", payload);
export const archiveElection = (id) =>
  api.post(`/admin/elections/${id}/archive`, {
    confirmation: "ARCHIVE_ELECTION",
  });
