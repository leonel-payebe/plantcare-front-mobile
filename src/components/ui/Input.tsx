import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING } from '../../constants';

// -----------------------------------------------
// Types
// -----------------------------------------------
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  iconLeft?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconRight?: keyof typeof MaterialCommunityIcons.glyphMap;
  onIconRightPress?: () => void;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  required?: boolean;
}

// -----------------------------------------------
// Composant
// -----------------------------------------------
export default function Input({
  label,
  error,
  hint,
  iconLeft,
  iconRight,
  onIconRightPress,
  isPassword = false,
  containerStyle,
  required = false,
  ...textInputProps
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Gestion de l'icône droite pour le mot de passe
  const resolvedIconRight = isPassword
    ? (showPassword ? 'eye-off' : 'eye')
    : iconRight;

  const handleIconRightPress = isPassword
    ? () => setShowPassword(!showPassword)
    : onIconRightPress;

  return (
    <View style={[styles.container, containerStyle]}>

      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input Row */}
      <View style={[
        styles.inputRow,
        isFocused && styles.inputRowFocused,
        error && styles.inputRowError,
      ]}>
        {iconLeft && (
          <MaterialCommunityIcons
            name={iconLeft}
            size={18}
            color={isFocused ? COLORS.primary : COLORS.textLight}
            style={styles.iconLeft}
          />
        )}

        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />

        {resolvedIconRight && (
          <TouchableOpacity onPress={handleIconRightPress} style={styles.iconRight}>
            <MaterialCommunityIcons
              name={resolvedIconRight as keyof typeof MaterialCommunityIcons.glyphMap}
              size={18}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Erreur */}
      {error && (
        <View style={styles.errorRow}>
          <MaterialCommunityIcons name="alert-circle" size={12} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Hint */}
      {hint && !error && (
        <Text style={styles.hintText}>{hint}</Text>
      )}

    </View>
  );
}

// -----------------------------------------------
// Styles
// -----------------------------------------------
const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },
  inputRowFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  inputRowError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONTS.regular,
    color: COLORS.text,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: 4,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.small,
    flex: 1,
  },
  hintText: {
    color: COLORS.textLight,
    fontSize: FONTS.small,
    marginTop: SPACING.xs,
  },
});