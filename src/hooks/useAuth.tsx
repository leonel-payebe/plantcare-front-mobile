import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { JwtResponse, UserMeDTO } from '../types';
import { authService } from '../services';
import { ApiError } from '../utils';

// -----------------------------------------------
// Types du contexte
// -----------------------------------------------
interface AuthContextType {
    user: UserMeDTO | null;
    token: string | null;
    isAuthenticated: boolean;
    isEmailVerified: boolean;
    isLoading: boolean;
    login: (jwtResponse: JwtResponse) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: UserMeDTO) => Promise<void>;
}

// -----------------------------------------------
// Création du contexte
// -----------------------------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// -----------------------------------------------
// Provider
// -----------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserMeDTO | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // true le temps de lire AsyncStorage

    // Restaure la session au démarrage de l'app
    useEffect(() => {
        restoreSession();
    }, []);

    const restoreSession = async () => {
        try {
            const [storedToken, storedUser, storedRefreshToken] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
                AsyncStorage.getItem(STORAGE_KEYS.USER),
                AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
            ]);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Tente de rafraîchir le token au démarrage
                if (storedRefreshToken) {
                    try {
                        const response = await authService.refresh(storedRefreshToken);
                        if (response.data) {
                            await saveSession(response.data);
                        }
                    } catch {
                        // Token expiré — on garde la session existante
                        // Elle sera invalidée au prochain appel API
                    }
                }
            }
        } catch (error) {
            console.error('Erreur lors de la restauration de session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Centralise la sauvegarde de session
    const saveSession = async (jwtResponse: JwtResponse) => {
        // Sauvegarde d'abord le token pour pouvoir appeler /me
        const storageOperations = [
            AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, jwtResponse.token),
        ];

        if (jwtResponse.refreshToken) {
            storageOperations.push(
                AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, jwtResponse.refreshToken)
            );
        }

        await Promise.all(storageOperations);
        setToken(jwtResponse.token);

        // Récupère les vraies infos utilisateur depuis le backend
        try {
            const meResponse = await authService.me();
            const userData = meResponse.data;
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
            setUser(userData);
        } catch {
            // Fallback si /me échoue
            const userData: UserMeDTO = {
                id: jwtResponse.userId,
                name: jwtResponse.name,
                email: jwtResponse.email,
                emailVerified: false,
                createdAt: new Date().toISOString(),
            };
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
            setUser(userData);
        }
    };

    // Sauvegarde le token et l'utilisateur après login
    const login = async (jwtResponse: JwtResponse) => {
        try {
            await saveSession(jwtResponse);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de session:', error);
            throw error;
        }
    };

    // Supprime la session lors du logout
    const logout = async () => {
        try {
            // Appel API logout si on a un refresh token
            const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
                try {
                    await authService.logout(refreshToken);
                } catch {
                    // On continue même si l'appel échoue
                }
            }

            await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
                AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
                AsyncStorage.removeItem(STORAGE_KEYS.USER),
            ]);

            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            throw error;
        }
    };

    // Met à jour les infos utilisateur localement
    const updateUser = async (updatedUser: UserMeDTO) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('Erreur mise à jour utilisateur:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                isEmailVerified: user?.emailVerified ?? false,
                isLoading,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// -----------------------------------------------
// Hook personnalisé
// -----------------------------------------------
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
}