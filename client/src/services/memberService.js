import api from './api';

export const getMembers = () => api.get('/members');
export const getMe = () => api.get('/members/me');
export const participate = () => api.post('/members/participate');
