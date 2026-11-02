import api from './api';

export const requestOtp = (email) => api.post('/auth/request-otp', { email });
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });
