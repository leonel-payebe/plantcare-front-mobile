import React from 'react';
import { StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TAB_BAR_HEIGHT } from '../../constants';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    backgroundColor?: string;
    statusBarStyle?: 'light-content' | 'dark-content';
    withTabBar?: boolean; // ← nouveau prop
}

export default function ScreenWrapper({
    children,
    style,
    backgroundColor = COLORS.background,
    statusBarStyle = 'dark-content',
    withTabBar = true, // ← true par défaut car la plupart des écrans ont la tab bar
}: ScreenWrapperProps) {
    return (
        <SafeAreaView
            style={[
                styles.root,
                { backgroundColor },
                withTabBar && { paddingBottom: TAB_BAR_HEIGHT },
                style,
            ]}
            edges={['top', 'left', 'right']}
        >
            <StatusBar
                barStyle={statusBarStyle}
                backgroundColor={backgroundColor}
            />
            {children}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
});