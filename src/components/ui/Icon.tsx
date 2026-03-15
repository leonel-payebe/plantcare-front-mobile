import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../../constants';

interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

export default function Icon({ name, size = 24, color = COLORS.text, style }: IconProps) {
    return (
        <MaterialCommunityIcons
            name={name as any}
            size={size}
            color={color}
            style={style}
        />
    );
}