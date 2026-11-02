import api from './api';

export const getElectionStatus = () => api.get('/election/status');
export const getElectionResults = (id) => api.get(id ? `/election/results/${id}` : '/election/results');
export const getElectionHistory = () => api.get('/election/history');
