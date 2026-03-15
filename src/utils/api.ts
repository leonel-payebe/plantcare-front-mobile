import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API } from '../constants';
import { APIResponse } from '../types';

// -----------------------------------------------
// Client HTTP centralisé
// -----------------------------------------------
class ApiClient {

    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    // -----------------------------------------------
    // Construit les headers avec le token JWT
    // -----------------------------------------------
    private async getHeaders(withAuth = true): Promise<HeadersInit> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (withAuth) {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // -----------------------------------------------
    // Gestion centralisée des réponses
    // -----------------------------------------------
    private async handleResponse<T>(response: Response): Promise<APIResponse<T>> {
        const data = await response.json();

        if (!response.ok) {
            // Erreur HTTP — on lance une exception avec le message du backend
            throw new ApiError(
                data.message ?? 'Une erreur est survenue.',
                response.status,
                data
            );
        }

        return data as APIResponse<T>;
    }

    // -----------------------------------------------
    // Méthodes HTTP
    // -----------------------------------------------
    async get<T>(endpoint: string, withAuth = true): Promise<APIResponse<T>> {
        const headers = await this.getHeaders(withAuth);
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers,
        });
        return this.handleResponse<T>(response);
    }

    async post<T>(endpoint: string, body?: object, withAuth = true): Promise<APIResponse<T>> {
        const headers = await this.getHeaders(withAuth);
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        return this.handleResponse<T>(response);
    }

    async put<T>(endpoint: string, body?: object, withAuth = true): Promise<APIResponse<T>> {
        const headers = await this.getHeaders(withAuth);
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        return this.handleResponse<T>(response);
    }

    async delete<T>(endpoint: string, withAuth = true): Promise<APIResponse<T>> {
        const headers = await this.getHeaders(withAuth);
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers,
        });
        return this.handleResponse<T>(response);
    }

    async postFormData<T>(endpoint: string, formData: FormData, withAuth = true): Promise<APIResponse<T>> {
        const token = withAuth
            ? await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
            : null;

        const headers: HeadersInit = {
            'Accept': 'application/json',
            // Ne pas mettre Content-Type — le browser le gère pour FormData
        };

        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });
        return this.handleResponse<T>(response);
    }

    async putFormData<T>(endpoint: string, formData: FormData, withAuth = true): Promise<APIResponse<T>> {
        const token = withAuth
            ? await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
            : null;

        const headers: HeadersInit = {
            'Accept': 'application/json',
        };

        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers,
            body: formData,
        });
        return this.handleResponse<T>(response);
    }
}

// -----------------------------------------------
// Classe d'erreur API personnalisée
// -----------------------------------------------
export class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// -----------------------------------------------
// Instance unique du client API
// -----------------------------------------------
export const apiClient = new ApiClient(API.BASE_URL);