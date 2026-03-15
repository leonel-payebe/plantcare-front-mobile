import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    FadeIn,
    FadeInDown,
    FadeInUp,
    SlideInRight,
    ZoomIn,
} from 'react-native-reanimated';

// -----------------------------------------------
// FadeInView — apparition progressive
// -----------------------------------------------
interface FadeInViewProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    style?: ViewStyle;
}

export function FadeInView({
    children,
    delay = 0,
    duration = 400,
    style,
}: FadeInViewProps) {
    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(duration).springify()}
            style={style}
        >
            {children}
        </Animated.View>
    );
}

// -----------------------------------------------
// SlideInView — glissement depuis la droite
// -----------------------------------------------
interface SlideInViewProps {
    children: React.ReactNode;
    delay?: number;
    style?: ViewStyle;
}

export function SlideInView({ children, delay = 0, style }: SlideInViewProps) {
    return (
        <Animated.View
            entering={SlideInRight.delay(delay).springify()}
            style={style}
        >
            {children}
        </Animated.View>
    );
}

// -----------------------------------------------
// ZoomInView — apparition avec zoom
// -----------------------------------------------
interface ZoomInViewProps {
    children: React.ReactNode;
    delay?: number;
    style?: ViewStyle;
}

export function ZoomInView({ children, delay = 0, style }: ZoomInViewProps) {
    return (
        <Animated.View
            entering={ZoomIn.delay(delay).springify()}
            style={style}
        >
            {children}
        </Animated.View>
    );
}

// -----------------------------------------------
// StaggeredList — liste avec entrées décalées
// -----------------------------------------------
interface StaggeredListProps {
    children: React.ReactNode[];
    staggerDelay?: number;
}

export function StaggeredList({ children, staggerDelay = 80 }: StaggeredListProps) {
    return (
        <>
            {children.map((child, index) => (
                <FadeInView key={index} delay={index * staggerDelay}>
                    {child}
                </FadeInView>
            ))}
        </>
    );
}

// -----------------------------------------------
// PressableScale — bouton avec effet de scale
// -----------------------------------------------
interface PressableScaleProps {
    children: React.ReactNode;
    onPress: () => void;
    style?: ViewStyle;
}

export function PressableScale({ children, onPress, style }: PressableScaleProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[animatedStyle, style]}>
            <Animated.View
                onTouchStart={() => { scale.value = withSpring(0.95); }}
                onTouchEnd={() => { scale.value = withSpring(1); }}
                onTouchCancel={() => { scale.value = withSpring(1); }}
            >
                {children}
            </Animated.View>
        </Animated.View>
    );
}