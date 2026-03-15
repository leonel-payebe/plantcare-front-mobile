import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants';

// -----------------------------------------------
// Types
// -----------------------------------------------
type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
    label: string;
    variant?: BadgeVariant;
    style?: ViewStyle;
}

// -----------------------------------------------
// Composant
// -----------------------------------------------
export default function Badge({ label, variant = 'neutral', style }: BadgeProps) {
    return (
        <View style={[styles.base, badgeStyles[variant].container, style]}>
            <Text style={[styles.label, badgeStyles[variant].text]}>{label}</Text>
        </View>
    );
}

// -----------------------------------------------
// Styles par variant
// -----------------------------------------------
const badgeStyles: Record<BadgeVariant, { container: ViewStyle; text: any }> = {
    success: {
        container: { backgroundColor: '#D8F3DC' },
        text: { color: COLORS.primary },
    },
    warning: {
        container: { backgroundColor: '#FFF3CD' },
        text: { color: '#856404' },
    },
    danger: {
        container: { backgroundColor: '#FDECEA' },
        text: { color: COLORS.error },
    },
    info: {
        container: { backgroundColor: '#D0EFFF' },
        text: { color: '#0369A1' },
    },
    neutral: {
        container: { backgroundColor: COLORS.border },
        text: { color: COLORS.textLight },
    },
};

const styles = StyleSheet.create({
    base: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    label: {
        fontSize: FONTS.small,
        fontWeight: '600',
    },
});