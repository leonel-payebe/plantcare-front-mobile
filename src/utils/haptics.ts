import * as Haptics from 'expo-haptics';

// -----------------------------------------------
// Utilitaires haptics centralisés
// -----------------------------------------------
export const haptics = {

    // Légère vibration — tap, sélection
    light: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },

    // Vibration moyenne — bouton principal
    medium: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },

    // Vibration forte — action importante
    heavy: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    },

    // Succès — arrosage réussi, ajout plante
    success: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },

    // Erreur — échec d'une action
    error: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },

    // Avertissement
    warning: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    },

    // Sélection — navigation, tap sur un élément
    selection: () => {
        Haptics.selectionAsync();
    },
};