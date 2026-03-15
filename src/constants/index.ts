// ============================================
// Constantes globales de l'application
// ============================================

export const COLORS = {
    primary: '#2D6A4F',       // Vert foncé
    secondary: '#52B788',     // Vert clair
    accent: '#B7E4C7',        // Vert très clair
    background: '#F8F9FA',    // Fond gris clair
    white: '#FFFFFF',
    text: '#212529',
    textLight: '#6C757D',
    error: '#DC3545',
    warning: '#FFC107',
    border: '#DEE2E6',
};

export const FONTS = {
    small: 12,
    medium: 14,
    regular: 16,
    large: 18,
    xlarge: 24,
    xxlarge: 32,
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const STORAGE_KEYS = {
    PLANTS: '@plantcare:plants',
    WATERING_RECORDS: '@plantcare:watering_records',
    AUTH_TOKEN: '@plantcare:auth_token',
    REFRESH_TOKEN: '@plantcare:refresh_token',
    USER: '@plantcare:user',
    NOTIFICATIONS: '@plantcare:notifications',

};

export const API = {
    BASE_URL: 'http://192.168.89.106:8080/api',
    TIMEOUT: 10000,
};

// Icônes MaterialCommunityIcons utilisées dans l'app
export const ICONS = {
    // Auth
    email: 'email-outline',
    password: 'lock-outline',
    eye: 'eye-outline',
    eyeOff: 'eye-off-outline',
    login: 'login',
    logout: 'logout',
    register: 'account-plus-outline',

    // Navigation
    home: 'home-outline',
    homeActive: 'home',
    plants: 'leaf',
    plantsActive: 'leaf',
    addPlant: 'plus-circle-outline',
    addPlantActive: 'plus-circle',
    profile: 'account-outline',
    profileActive: 'account',

    // Plantes
    plant: 'flower-outline',
    plantActive: 'flower',
    sprout: 'sprout-outline',
    species: 'shape-outline',
    purchaseDate: 'calendar-outline',
    image: 'image-outline',
    camera: 'camera-outline',

    // Arrosage
    water: 'water-outline',
    wateringCan: 'watering-can-outline',
    wateringCanActive: 'watering-can',
    history: 'history',
    schedule: 'calendar-clock-outline',
    amount: 'cup-water',
    frequency: 'repeat',

    // Statuts
    overdue: 'alert-circle-outline',
    dueSoon: 'clock-alert-outline',
    ok: 'check-circle-outline',
    warning: 'alert-outline',

    // Actions
    add: 'plus',
    edit: 'pencil-outline',
    delete: 'trash-can-outline',
    save: 'content-save-outline',
    cancel: 'close-circle-outline',
    back: 'arrow-left',
    close: 'close',
    search: 'magnify',
    filter: 'filter-outline',
    settings: 'cog-outline',
    notification: 'bell-outline',
    notificationActive: 'bell',
    info: 'information-outline',
    success: 'check-circle-outline',
    error: 'alert-circle-outline',
} as const;

export type IconName = typeof ICONS[keyof typeof ICONS];

export { TAB_BAR_HEIGHT } from './layout';