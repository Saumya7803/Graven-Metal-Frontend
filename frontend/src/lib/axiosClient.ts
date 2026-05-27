import axios from 'axios';

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

export const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});
