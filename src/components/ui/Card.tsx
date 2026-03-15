import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ children, style, padding = 'md' }: CardProps) {
  return (
    <View style={[styles.card, paddingStyles[padding], style]}>
      {children}
    </View>
  );
}

const paddingStyles: Record<string, ViewStyle> = {
  none: { padding: 0 },
  sm: { padding: SPACING.sm },
  md: { padding: SPACING.md },
  lg: { padding: SPACING.lg },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: SPACING.md,
  },
});