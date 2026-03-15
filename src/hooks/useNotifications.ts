import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { PlantResponseDTO, PlantNotification } from '../types';

// -----------------------------------------------
// Hook useNotifications
// -----------------------------------------------
export function useNotifications() {

    // -----------------------------------------------
    // Demande la permission d'envoyer des notifications
    // -----------------------------------------------
    const requestPermissions = async (): Promise<boolean> => {
        if (!Device.isDevice) {
            console.warn('Les notifications ne fonctionnent que sur un vrai appareil.');
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('Permission notifications refusée.');
            return false;
        }

        // Configuration spécifique Android
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('plant-reminders', {
                name: 'Rappels d\'arrosage',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#2D6A4F',
            });
        }

        return true;
    };

    // -----------------------------------------------
    // Planifie une notification pour une plante
    // -----------------------------------------------
    const schedulePlantNotification = async (
        plant: PlantResponseDTO
    ): Promise<string | null> => {
        if (!plant.nextWateringDate) return null;

        try {
            const nextWateringDate = new Date(plant.nextWateringDate);
            const now = new Date();

            // Ne planifie pas si la date est déjà passée
            if (nextWateringDate <= now) return null;

            // Planifie la notification la veille à 9h00
            const notificationDate = new Date(nextWateringDate);
            notificationDate.setDate(notificationDate.getDate() - 1);
            notificationDate.setHours(9, 0, 0, 0);

            // Si la date de notification est aussi passée, notifie dans 1h
            const triggerDate = notificationDate > now
                ? notificationDate
                : new Date(now.getTime() + 3600000);

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: `Arrosage de ${plant.name}`,
                    body: `N'oubliez pas d'arroser ${plant.name} demain ! (${plant.waterAmountLiters}L)`,
                    data: { plantId: plant.id },
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: triggerDate,
                },
            });

            // Sauvegarde l'ID de notification
            await savePlantNotification({
                plantId: plant.id,
                notificationId,
                scheduledDate: triggerDate.toISOString(),
            });

            return notificationId;
        } catch (error) {
            console.error('Erreur planification notification:', error);
            return null;
        }
    };

    // -----------------------------------------------
    // Annule la notification d'une plante
    // -----------------------------------------------
    const cancelPlantNotification = async (plantId: number): Promise<void> => {
        try {
            const notifications = await getPlantNotifications();
            const plantNotif = notifications.find(n => n.plantId === plantId);

            if (plantNotif) {
                await Notifications.cancelScheduledNotificationAsync(
                    plantNotif.notificationId
                );
                // Supprime de AsyncStorage
                const updated = notifications.filter(n => n.plantId !== plantId);
                await AsyncStorage.setItem(
                    STORAGE_KEYS.NOTIFICATIONS,
                    JSON.stringify(updated)
                );
            }
        } catch (error) {
            console.error('Erreur annulation notification:', error);
        }
    };

    // -----------------------------------------------
    // Annule toutes les notifications planifiées
    // -----------------------------------------------
    const cancelAllNotifications = async (): Promise<void> => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
        } catch (error) {
            console.error('Erreur annulation notifications:', error);
        }
    };

    // -----------------------------------------------
    // Planifie les notifications pour toutes les plantes
    // -----------------------------------------------
    const scheduleAllPlantNotifications = async (
        plants: PlantResponseDTO[]
    ): Promise<void> => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        for (const plant of plants) {
            // Annule l'ancienne notification avant d'en créer une nouvelle
            await cancelPlantNotification(plant.id);
            await schedulePlantNotification(plant);
        }
    };

    // -----------------------------------------------
    // Envoie une notification immédiate (test)
    // -----------------------------------------------
    const sendTestNotification = async (): Promise<void> => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'PlantCare — Test',
                body: 'Les notifications fonctionnent correctement !',
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 2,
                repeats:false
            },
        });
    };

    // -----------------------------------------------
    // Helpers AsyncStorage
    // -----------------------------------------------
    const getPlantNotifications = async (): Promise<PlantNotification[]> => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    };

    const savePlantNotification = async (
        notification: PlantNotification
    ): Promise<void> => {
        try {
            const notifications = await getPlantNotifications();
            const updated = [
                ...notifications.filter(n => n.plantId !== notification.plantId),
                notification,
            ];
            await AsyncStorage.setItem(
                STORAGE_KEYS.NOTIFICATIONS,
                JSON.stringify(updated)
            );
        } catch (error) {
            console.error('Erreur sauvegarde notification:', error);
        }
    };

    return {
        requestPermissions,
        schedulePlantNotification,
        cancelPlantNotification,
        cancelAllNotifications,
        scheduleAllPlantNotifications,
        sendTestNotification,
    };
}