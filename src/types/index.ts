// ============================================
// Types alignés avec le backend SpringBoot
// ============================================


// ----------------------------
// Auth
// ----------------------------

export interface UserMeDTO {
    id: number;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: string; // LocalDateTime → string ISO
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface JwtResponse {
    token: string;
    refreshToken: string;
    userId: number;
    name: string;
    email: string;
}

export interface RefreshRequest {
    refreshToken: string;
}

export interface LogoutRequest {
    refreshToken: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}


// ----------------------------
// Réponse API générique
// ----------------------------

export interface APIResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string; // LocalDateTime → string ISO
}


// ----------------------------
// Plantes
// ----------------------------

export interface PlantResponseDTO {
    id: number;
    name: string;
    species: string | null;
    purchaseDate: string | null;   // LocalDate → string "YYYY-MM-DD"
    imageUrl: string | null;
    waterAmountLiters: number | null;
    wateringFrequencyDays: number | null;
    createdAt: string;             // LocalDateTime → string ISO
    nextWateringDate: string | null;
    daysUntilNextWatering: number | null;
    wateringHistoryCount: number;
}

export interface PlantCreateDTO {
    name: string;
    species?: string;
    purchaseDate?: string;         // "YYYY-MM-DD"
    waterAmountLiters?: number;
    wateringFrequencyDays?: number;
    image?: {
        uri: string;
        name: string;
        type: string;
    };                             // MultipartFile → FormData sur mobile
}

export interface PlantUpdateDTO {
    name?: string;
    species?: string;
    purchaseDate?: string;         // "YYYY-MM-DD"
    waterAmountLiters?: number;
    wateringFrequencyDays?: number;
    image?: {
        uri: string;
        name: string;
        type: string;
    };
}

export interface PlantStatsDTO {
    totalPlants: number;
    withSchedule: number;
    withoutSchedule: number;
    overdue: number;
    dueSoon: number;
    withinDays: number;
}


// ----------------------------
// Arrosage
// ----------------------------

export interface WateringHistoryDTO {
    id: number;
    amountGivenLiters: number;
    wateredAt: string;             // LocalDateTime → string ISO
}

export interface WaterNowDTO {
    amountLiters?: number;         // optionnel, fallback sur plant.waterAmountLiters
}


// ----------------------------
// Notifications
// ----------------------------

export interface NotificationMessage {
    title: string;
    body: string;
    type: 'info' | 'warning' | 'danger';
    plantId: number;
    plantName: string;
    daysLeft: number;
}

// Notification planifiée
export interface PlantNotification {
    plantId: number;        // ← number, pas string (aligné avec le backend)
    notificationId: string;
    scheduledDate: string;
}


// ----------------------------
// Navigation (React Navigation)
// ----------------------------

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    VerifyEmail: { email: string };
};

export type MainTabParamList = {
    Home: undefined;
    Plants: undefined;
    AddPlant: undefined;
    Profile: undefined;
};

export type PlantStackParamList = {
    PlantList: undefined;
    PlantDetail: { plantId: number };
    AddPlant: undefined;
    EditPlant: { plantId: number };
    WateringHistory: { plantId: number };
};

export interface SpringPage<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;       // page courante
    size: number;
    first: boolean;
    last: boolean;
}