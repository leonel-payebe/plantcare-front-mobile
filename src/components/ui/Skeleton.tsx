import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../constants';

// -----------------------------------------------
// Composant de base animé
// -----------------------------------------------
interface SkeletonBoxProps {
    width?: number | `${number}%`;  // ← type précis au lieu de string
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function SkeletonBox({
    width = '100%',
    height = 20,
    borderRadius = 8,
    style,
}: SkeletonBoxProps) {
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeletonBase,
                {
                    width,
                    height,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
}

// -----------------------------------------------
// Skeleton PlantCard
// -----------------------------------------------
export function PlantCardSkeleton() {
    return (
        <View style={styles.plantCard}>
            <SkeletonBox width={60} height={60} borderRadius={16} />
            <View style={styles.plantCardContent}>
                <SkeletonBox width="60%" height={16} borderRadius={6} />
                <SkeletonBox width="40%" height={12} borderRadius={6} style={styles.mt8} />
                <SkeletonBox width="30%" height={20} borderRadius={20} style={styles.mt8} />
            </View>
        </View>
    );
}

// -----------------------------------------------
// Skeleton HomeScreen
// -----------------------------------------------
export function HomeScreenSkeleton() {
    return (
        <View style={styles.homeSkeleton}>

            {/* Header */}
            <View style={styles.homeHeader}>
                <View>
                    <SkeletonBox width={80} height={14} borderRadius={6} />
                    <SkeletonBox width={140} height={24} borderRadius={6} style={styles.mt8} />
                </View>
                <SkeletonBox width={40} height={40} borderRadius={12} />
            </View>

            {/* Stats */}
            <SkeletonBox width="40%" height={18} borderRadius={6} style={styles.mb12} />
            <View style={styles.statsGrid}>
                {[1, 2, 3, 4].map(i => (
                    <View key={i} style={styles.statCard}>
                        <SkeletonBox width={32} height={32} borderRadius={16} />
                        <SkeletonBox width="60%" height={24} borderRadius={6} style={styles.mt8} />
                        <SkeletonBox width="80%" height={12} borderRadius={6} style={styles.mt8} />
                    </View>
                ))}
            </View>

            {/* Urgent plants */}
            <SkeletonBox width="50%" height={18} borderRadius={6} style={styles.mb12} />
            {[1, 2].map(i => (
                <PlantCardSkeleton key={i} />
            ))}

        </View>
    );
}

// -----------------------------------------------
// Skeleton PlantList
// -----------------------------------------------
export function PlantListSkeleton() {
    return (
        <View style={styles.listSkeleton}>
            {[1, 2, 3, 4, 5].map(i => (
                <PlantCardSkeleton key={i} />
            ))}
        </View>
    );
}

// -----------------------------------------------
// Skeleton PlantDetail
// -----------------------------------------------
export function PlantDetailSkeleton() {
    return (
        <View style={styles.detailSkeleton}>

            {/* Hero */}
            <View style={styles.detailHero}>
                <SkeletonBox
                    width={120}
                    height={120}
                    borderRadius={60}
                    style={styles.mb12}
                />
                <SkeletonBox width={160} height={24} borderRadius={6} />
                <SkeletonBox
                    width={100}
                    height={14}
                    borderRadius={6}
                    style={styles.mt8}
                />
            </View>

            {/* Content */}
            <View style={styles.detailContent}>
                <SkeletonBox width="100%" height={48} borderRadius={10} />
                <View style={styles.detailCard}>
                    {[1, 2, 3].map(i => (
                        <View key={i}>
                            <View style={styles.infoRow}>
                                <SkeletonBox width={36} height={36} borderRadius={10} />
                                <View style={styles.infoContent}>
                                    <SkeletonBox width="40%" height={12} borderRadius={6} />
                                    <SkeletonBox
                                        width="70%"
                                        height={16}
                                        borderRadius={6}
                                        style={styles.mt8}
                                    />
                                </View>
                            </View>
                            {i < 3 && <View style={styles.divider} />}
                        </View>
                    ))}
                </View>
            </View>

        </View>
    );
}

// -----------------------------------------------
// Styles
// -----------------------------------------------
const styles = StyleSheet.create({
    skeletonBase: {
        backgroundColor: COLORS.border,
    },
    mt8: { marginTop: 8 },
    mb12: { marginBottom: 12 },

    // Plant card skeleton
    plantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        gap: SPACING.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    plantCardContent: {
        flex: 1,
        gap: 4,
    },

    // Home skeleton
    homeSkeleton: {
        padding: SPACING.lg,
    },
    homeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        marginTop: SPACING.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.md,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },

    // List skeleton
    listSkeleton: {
        padding: SPACING.lg,
    },

    // Detail skeleton
    detailSkeleton: {
        flex: 1,
    },
    detailHero: {
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        paddingTop: SPACING.xl + 16,
        paddingBottom: SPACING.xl + 16,
    },
    detailContent: {
        padding: SPACING.lg,
        gap: SPACING.md,
    },
    detailCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        gap: SPACING.md,
    },
    infoContent: {
        flex: 1,
        gap: 4,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.background,
    },
});