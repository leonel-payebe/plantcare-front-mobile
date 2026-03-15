import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, ICONS, SPACING } from '../../constants';
import Button from './Button';

// -----------------------------------------------
// Types
// -----------------------------------------------
interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

// -----------------------------------------------
// Composant
// -----------------------------------------------
export default function EmptyState({
    icon = ICONS.sprout,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <MaterialCommunityIcons name={icon as any} size={72} color={COLORS.accent} />
            <Text style={styles.title}>{title}</Text>
            {description && (
                <Text style={styles.description}>{description}</Text>
            )}
            {actionLabel && onAction && (
                <Button
                    label={actionLabel}
                    onPress={onAction}
                    variant="primary"
                    fullWidth={false}
                    style={styles.button}
                />
            )}
        </View>
    );
}

// -----------------------------------------------
// Styles
// -----------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
        gap: SPACING.md,
    },
    title: {
        fontSize: FONTS.large,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
    },
    description: {
        fontSize: FONTS.regular,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 22,
    },
    button: {
        marginTop: SPACING.sm,
        paddingHorizontal: SPACING.xl,
    },
});