import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import { NotificationMessage } from '../types';
import { haptics } from '../utils';

// -----------------------------------------------
// Type local
// -----------------------------------------------
export type LocalNotification = NotificationMessage & {
    id: string;
    read: boolean;
    date: string;
};

// -----------------------------------------------
// Contexte
// -----------------------------------------------
interface NotificationStoreContextType {
    notifications: LocalNotification[];
    unreadCount: number;
    addNotification: (message: NotificationMessage) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

const NotificationStoreContext = createContext<NotificationStoreContextType | undefined>(undefined);

// -----------------------------------------------
// Provider
// -----------------------------------------------
export function NotificationStoreProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<LocalNotification[]>([]);

    const addNotification = useCallback((message: NotificationMessage) => {
        const newNotif: LocalNotification = {
            ...message,
            id: `${Date.now()}-${Math.random()}`,
            read: false,
            date: new Date().toISOString(),
        };
        setNotifications(prev => [newNotif, ...prev]);
        haptics.light();
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    return (
        <NotificationStoreContext.Provider value={{
            notifications,
            unreadCount: notifications.filter(n => !n.read).length,
            addNotification,
            markAsRead,
            markAllAsRead,
        }}>
            {children}
        </NotificationStoreContext.Provider>
    );
}

// -----------------------------------------------
// Hook
// -----------------------------------------------
export function useNotificationStore(): NotificationStoreContextType {
    const context = useContext(NotificationStoreContext);
    if (!context) {
        throw new Error('useNotificationStore doit être dans NotificationStoreProvider');
    }
    return context;
}