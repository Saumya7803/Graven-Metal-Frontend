import axios from 'axios';

type WrappedResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const isWrappedResponse = <T>(payload: unknown): payload is WrappedResponse<T> => {
  if (!payload || typeof payload !== 'object') return false;
  return 'success' in payload && 'data' in payload;
};

export const unwrapResponse = <T>(payload: T | WrappedResponse<T>): T => {
  if (isWrappedResponse<T>(payload)) return payload.data;
  return payload as T;
};

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;

    if (error.code === 'ERR_NETWORK' || !error.response) {
      const apiBase = typeof error.config?.baseURL === 'string' ? error.config.baseURL : 'API server';
      if (import.meta.env.DEV) {
        return `Cannot reach ${apiBase}. Start backend with "npm run dev:server" or run both with "npm run dev:full".`;
      }
      return 'Unable to connect to the server. Please try again in a moment.';
    }
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
};
