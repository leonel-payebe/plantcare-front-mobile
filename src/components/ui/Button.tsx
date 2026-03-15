import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING } from '../../constants';

// -----------------------------------------------
// Types
// -----------------------------------------------
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    disabled?: boolean;
    iconLeft?: keyof typeof MaterialCommunityIcons.glyphMap;
    iconRight?: keyof typeof MaterialCommunityIcons.glyphMap;
    fullWidth?: boolean;
    style?: ViewStyle;
}

// -----------------------------------------------
// Composant
// -----------------------------------------------
export default function Button({
    label,
    onPress,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    iconLeft,
    iconRight,
    fullWidth = true,
    style,
}: ButtonProps) {
    const isDisabled = disabled || isLoading;

    return (
        <TouchableOpacity
            style={[
                styles.base,
                styles[variant],
                styles[`size_${size}`],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
            ) : (
                <>
                    {iconLeft && (
                        <MaterialCommunityIcons
                            name={iconLeft}
                            size={iconSizes[size]}
                            color={iconColors[variant]}
                            style={styles.iconLeft}
                        />
                    )}
                    <Text style={[styles.label, labelStyles[variant], labelSizes[size]]}>
                        {label}
                    </Text>
                    {iconRight && (
                        <MaterialCommunityIcons
                            name={iconRight}
                            size={iconSizes[size]}
                            color={iconColors[variant]}
                            style={styles.iconRight}
                        />
                    )}
                </>
            )}
        </TouchableOpacity>
    );
}

// -----------------------------------------------
// Helpers
// -----------------------------------------------
const iconSizes: Record<ButtonSize, number> = {
    sm: 14,
    md: 18,
    lg: 20,
};

const iconColors: Record<ButtonVariant, string> = {
    primary: COLORS.white,
    secondary: COLORS.white,
    outline: COLORS.primary,
    danger: COLORS.white,
};

const labelStyles: Record<ButtonVariant, TextStyle> = {
    primary: { color: COLORS.white },
    secondary: { color: COLORS.white },
    outline: { color: COLORS.primary },
    danger: { color: COLORS.white },
};

const labelSizes: Record<ButtonSize, TextStyle> = {
    sm: { fontSize: FONTS.small },
    md: { fontSize: FONTS.regular },
    lg: { fontSize: FONTS.large },
};

// -----------------------------------------------
// Styles
// -----------------------------------------------
const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    fullWidth: {
        width: '100%',
    },

    // Variants
    primary: {
        backgroundColor: COLORS.primary,
    },
    secondary: {
        backgroundColor: COLORS.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    danger: {
        backgroundColor: COLORS.error,
    },

    // Sizes
    size_sm: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm },
    size_md: { paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.md },
    size_lg: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },

    // States
    disabled: { opacity: 0.5 },

    // Icons
    iconLeft: { marginRight: SPACING.xs },
    iconRight: { marginLeft: SPACING.xs },

    label: { fontWeight: '700' },
});