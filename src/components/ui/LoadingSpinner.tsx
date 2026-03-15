import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants';

interface LoadingSpinnerProps {
    message?: string;
    fullScreen?: boolean;
}

export default function LoadingSpinner({
    message,
    fullScreen = false,
}: LoadingSpinnerProps) {
    return (
        <View style={[styles.container, fullScreen && styles.fullScreen]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.lg,
        gap: SPACING.sm,
    },
    fullScreen: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    message: {
        fontSize: FONTS.regular,
        color: COLORS.textLight,
    },
});