import { apiClient } from '../utils/api';
import {
    LoginRequest,
    RegisterRequest,
    JwtResponse,
    UserMeDTO,
    RefreshRequest,
    LogoutRequest,
    ChangePasswordRequest,
    APIResponse,
} from '../types';

// -----------------------------------------------
// Service Auth — tous les appels à /api/auth
// -----------------------------------------------
export const authService = {

    // POST /api/auth/login
    login: async (data: LoginRequest): Promise<APIResponse<JwtResponse>> => {
        return apiClient.post<JwtResponse>('/auth/login', data, false);
    },

    // POST /api/auth/register
    register: async (data: RegisterRequest): Promise<APIResponse<JwtResponse>> => {
        return apiClient.post<JwtResponse>('/auth/register', data, false);
    },

    // POST /api/auth/verify-email/request
    requestEmailVerification: async (): Promise<APIResponse<void>> => {
        return apiClient.post<void>('/auth/verify-email/request');
    },

    // GET /api/auth/verify-email?token=xxx
    verifyEmail: async (token: string): Promise<APIResponse<void>> => {
        return apiClient.get<void>(`/auth/verify-email?token=${token}`);
    },

    // POST /api/auth/refresh
    refresh: async (refreshToken: string): Promise<APIResponse<JwtResponse>> => {
        const body: RefreshRequest = { refreshToken };
        return apiClient.post<JwtResponse>('/auth/refresh', body, false);
    },

    // POST /api/auth/logout
    logout: async (refreshToken: string): Promise<APIResponse<void>> => {
        const body: LogoutRequest = { refreshToken };
        return apiClient.post<void>('/auth/logout', body, false);
    },

    // GET /api/auth/me
    me: async (): Promise<APIResponse<UserMeDTO>> => {
        return apiClient.get<UserMeDTO>('/auth/me');
    },

    // POST /api/auth/change-password
    changePassword: async (data: ChangePasswordRequest): Promise<APIResponse<void>> => {
        return apiClient.post<void>('/auth/change-password', data);
    },

    // POST /api/auth/logout-all
    logoutAll: async (): Promise<APIResponse<void>> => {
        return apiClient.post<void>('/auth/logout-all');
    },
};