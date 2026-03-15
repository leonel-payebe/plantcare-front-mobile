import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ToastMessage, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { COLORS, FONTS, SPACING } from '../../constants';
import Icon from './Icon';

// -----------------------------------------------
// Configuration des types de toasts
// -----------------------------------------------
export const toastConfig: ToastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={styles.successToast}
            contentContainerStyle={styles.toastContent}
            text1Style={styles.toastText1}
            text2Style={styles.toastText2}
            renderLeadingIcon={() => (
                <View style={styles.toastIconContainer}>
                    <Icon name="check-circle" size={22} color={COLORS.primary} />
                </View>
            )}
        />
    ),
    error: (props) => (
        <ErrorToast
            {...props}
            style={styles.errorToast}
            contentContainerStyle={styles.toastContent}
            text1Style={styles.toastText1}
            text2Style={styles.toastText2}
            renderLeadingIcon={() => (
                <View style={styles.toastIconContainer}>
                    <Icon name="alert-circle" size={22} color={COLORS.error} />
                </View>
            )}
        />
    ),
    warning: (props) => (
        <BaseToast
            {...props}
            style={styles.warningToast}
            contentContainerStyle={styles.toastContent}
            text1Style={styles.toastText1}
            text2Style={styles.toastText2}
            renderLeadingIcon={() => (
                <View style={styles.toastIconContainer}>
                    <Icon name="alert" size={22} color="#856404" />
                </View>
            )}
        />
    ),
    info: (props) => (
        <BaseToast
            {...props}
            style={styles.infoToast}
            contentContainerStyle={styles.toastContent}
            text1Style={styles.toastText1}
            text2Style={styles.toastText2}
            renderLeadingIcon={() => (
                <View style={styles.toastIconContainer}>
                    <Icon name="information" size={22} color="#0369A1" />
                </View>
            )}
        />
    ),
};

// -----------------------------------------------
// Helper pour afficher les toasts facilement
// -----------------------------------------------
export const showToast = {
    success: (title: string, message?: string) => {
        ToastMessage.show({
            type: 'success',
            text1: title,
            text2: message,
            position: 'bottom',
            visibilityTime: 3000,
        });
    },
    error: (title: string, message?: string) => {
        ToastMessage.show({
            type: 'error',
            text1: title,
            text2: message,
            position: 'bottom',
            visibilityTime: 4000,
        });
    },
    warning: (title: string, message?: string) => {
        ToastMessage.show({
            type: 'warning',
            text1: title,
            text2: message,
            position: 'bottom',
            visibilityTime: 3000,
        });
    },
    info: (title: string, message?: string) => {
        ToastMessage.show({
            type: 'info',
            text1: title,
            text2: message,
            position: 'bottom',
            visibilityTime: 3000,
        });
    },
};

// -----------------------------------------------
// Composant à placer à la racine de l'app
// -----------------------------------------------
export default function Toast() {
    return <ToastMessage config={toastConfig} />;
}

// -----------------------------------------------
// Styles
// -----------------------------------------------
const styles = StyleSheet.create({
    successToast: {
        borderLeftColor: COLORS.primary,
        borderLeftWidth: 5,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        height: 'auto',
        minHeight: 60,
        paddingVertical: SPACING.sm,
    },
    errorToast: {
        borderLeftColor: COLORS.error,
        borderLeftWidth: 5,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        height: 'auto',
        minHeight: 60,
        paddingVertical: SPACING.sm,
    },
    warningToast: {
        borderLeftColor: COLORS.warning,
        borderLeftWidth: 5,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        height: 'auto',
        minHeight: 60,
        paddingVertical: SPACING.sm,
    },
    infoToast: {
        borderLeftColor: '#0369A1',
        borderLeftWidth: 5,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        height: 'auto',
        minHeight: 60,
        paddingVertical: SPACING.sm,
    },
    toastContent: {
        paddingHorizontal: SPACING.sm,
    },
    toastText1: {
        fontSize: FONTS.regular,
        fontWeight: '700',
        color: COLORS.text,
    },
    toastText2: {
        fontSize: FONTS.small,
        color: COLORS.textLight,
    },
    toastIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: SPACING.md,
    },
});