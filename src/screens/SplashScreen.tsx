import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants';
import { Icon } from '../components/ui';

export default function CustomSplashScreen() {
    const iconScale = useSharedValue(0);
    const iconOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const subtitleOpacity = useSharedValue(0);

    useEffect(() => {
        // Séquence d'animation
        iconScale.value = withSpring(1, { damping: 10, stiffness: 100 });
        iconOpacity.value = withTiming(1, { duration: 600 });
        textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
        subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    }, []);

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScale.value }],
        opacity: iconOpacity.value,
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
    }));

    const subtitleStyle = useAnimatedStyle(() => ({
        opacity: subtitleOpacity.value,
    }));

    return (
        <View style={styles.container}>

            {/* Cercles décoratifs */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />

            {/* Icône animée */}
            <Animated.View style={[styles.iconContainer, iconStyle]}>
                <Icon name="flower" size={80} color={COLORS.white} />
            </Animated.View>

            {/* Titre animé */}
            <Animated.Text style={[styles.title, textStyle]}>
                PlantCare
            </Animated.Text>

            {/* Sous-titre animé */}
            <Animated.Text style={[styles.subtitle, subtitleStyle]}>
                Prenez soin de vos plantes
            </Animated.Text>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(255,255,255,0.05)',
        top: -80,
        right: -80,
    },
    circle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.05)',
        bottom: -40,
        left: -40,
    },
    circle3: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.08)',
        bottom: 100,
        right: -30,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 8,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: FONTS.regular,
        color: 'rgba(255,255,255,0.75)',
        letterSpacing: 0.5,
    },
});