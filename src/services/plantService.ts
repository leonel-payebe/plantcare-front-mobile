import { apiClient } from '../utils/api';
import {
    PlantResponseDTO,
    PlantCreateDTO,
    PlantUpdateDTO,
    PlantStatsDTO,
    WateringHistoryDTO,
    WaterNowDTO,
    APIResponse,
    SpringPage,
} from '../types';

// -----------------------------------------------
// Service Plant — tous les appels à /api/plants
// -----------------------------------------------
export const plantService = {

    // GET /api/plants
    getMyPlants: async (): Promise<APIResponse<PlantResponseDTO[]>> => {
        return apiClient.get<PlantResponseDTO[]>('/plants');
    },

    // GET /api/plants/:id
    getPlantById: async (id: number): Promise<APIResponse<PlantResponseDTO>> => {
        return apiClient.get<PlantResponseDTO>(`/plants/${id}`);
    },

    // POST /api/plants (multipart)
    createPlant: async (data: PlantCreateDTO): Promise<APIResponse<PlantResponseDTO>> => {
        const formData = new FormData();

        // Le backend attend un champ "data" avec le JSON
        const { image, ...plantData } = data;
        formData.append('data', JSON.stringify(plantData));

        // Image optionnelle
        if (image) {
            formData.append('image', {
                uri: image.uri,
                name: image.name,
                type: image.type,
            } as any);
        }

        return apiClient.postFormData<PlantResponseDTO>('/plants', formData);
    },

    // PUT /api/plants/:id (multipart)
    updatePlant: async (id: number, data: PlantUpdateDTO): Promise<APIResponse<PlantResponseDTO>> => {
        const formData = new FormData();

        const { image, ...plantData } = data;
        formData.append('data', JSON.stringify(plantData));

        if (image) {
            formData.append('image', {
                uri: image.uri,
                name: image.name,
                type: image.type,
            } as any);
        }

        return apiClient.putFormData<PlantResponseDTO>(`/plants/${id}`, formData);
    },

    // DELETE /api/plants/:id
    deletePlant: async (id: number): Promise<APIResponse<void>> => {
        return apiClient.delete<void>(`/plants/${id}`);
    },

    // POST /api/plants/:id/water
    waterPlant: async (id: number, dto: WaterNowDTO = {}): Promise<APIResponse<PlantResponseDTO>> => {
        return apiClient.post<PlantResponseDTO>(`/plants/${id}/water`, dto);
    },

    // GET /api/plants/:id/history?page=&size=
    getWateringHistory: async (
        id: number,
        page = 0,
        size = 10
    ): Promise<APIResponse<SpringPage<WateringHistoryDTO>>> => {
        return apiClient.get<SpringPage<WateringHistoryDTO>>(
            `/plants/${id}/history?page=${page}&size=${size}`
        );
    },

    // GET /api/plants/overdue
    getOverduePlants: async (): Promise<APIResponse<PlantResponseDTO[]>> => {
        return apiClient.get<PlantResponseDTO[]>('/plants/overdue');
    },

    // GET /api/plants/stats
    getStats: async (withinDays = 2): Promise<APIResponse<PlantStatsDTO>> => {
        return apiClient.get<PlantStatsDTO>(`/plants/stats?withinDays=${withinDays}`);
    },
};