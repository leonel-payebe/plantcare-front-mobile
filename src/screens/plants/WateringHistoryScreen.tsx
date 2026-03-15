import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { useFocusEffect, RouteProp } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, ICONS } from '../../constants';
import { WateringHistoryDTO, PlantStackParamList } from '../../types';
import { Card, Icon, LoadingSpinner, EmptyState, ScreenWrapper } from '../../components/ui';
import { plantService } from '../../services';
import { ApiError } from '../../utils';
import { showToast } from '../../components/ui';
import { SpringPage } from '../../types';

// -----------------------------------------------
// Types de navigation
// -----------------------------------------------
type WateringHistoryRouteProp = RouteProp<PlantStackParamList, 'WateringHistory'>;

type WateringHistoryNavigationProp = {
    goBack: () => void;
};

interface Props {
    navigation: WateringHistoryNavigationProp;
    route: WateringHistoryRouteProp;
}

// -----------------------------------------------
// Helpers
// -----------------------------------------------
function formatDate(isoString: string): { date: string; time: string; relative: string } {
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

    let relative = '';
    if (diffDays === 0) relative = "Aujourd'hui";
    else if (diffDays === 1) relative = 'Hier';
    else if (diffDays < 7) relative = `Il y a ${diffDays} jours`;
    else if (diffDays < 30) relative = `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
    else relative = `Il y a ${Math.floor(diffDays / 30)} mois`;

    return {
        date: date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        time: date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        }),
        relative,
    };
}

// -----------------------------------------------
// Composant WateringHistoryCard
// -----------------------------------------------
interface WateringHistoryCardProps {
    record: WateringHistoryDTO;
    isFirst: boolean;
    isLast: boolean;
}

function WateringHistoryCard({ record, isFirst, isLast }: WateringHistoryCardProps) {
    const { date, time, relative } = formatDate(record.wateredAt);

    return (

        <View style={styles.timelineItem}>

            {/* Ligne verticale */}
            <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, isFirst && styles.timelineDotFirst]} />
                {!isLast && <View style={styles.timelineLine} />}
            </View>

            {/* Card */}
            <Card style={styles.historyCard}>
                <View style={styles.historyCardContent}>

                    {/* Icône */}
                    <View style={styles.historyIconContainer}>
                        <Icon name={ICONS.wateringCanActive} size={22} color={COLORS.secondary} />
                    </View>

                    {/* Infos */}
                    <View style={styles.historyInfo}>
                        <View style={styles.historyHeader}>
                            <Text style={styles.historyRelative}>{relative}</Text>
                            <View style={styles.historyAmountBadge}>
                                <Icon name={ICONS.amount} size={12} color={COLORS.primary} />
                                <Text style={styles.historyAmount}>{record.amountGivenLiters} L</Text>
                            </View>
                        </View>
                        <Text style={styles.historyDate}>{date}</Text>
                        <Text style={styles.historyTime}>{time}</Text>
                    </View>

                </View>
            </Card>

        </View>
    );
}

// -----------------------------------------------
// Composant WateringHistoryScreen
// -----------------------------------------------
export default function WateringHistoryScreen({ navigation, route }: Props) {
    const { plantId } = route.params;
    const [history, setHistory] = useState<WateringHistoryDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Stats calculées
    const totalWaterings = history.length;
    const totalLiters = history.reduce((sum, r) => sum + r.amountGivenLiters, 0);
    const avgLiters = totalWaterings > 0
        ? (totalLiters / totalWaterings).toFixed(2)
        : '0';

    useFocusEffect(
        useCallback(() => {
            loadHistory(true);
        }, [plantId])
    );

    const loadHistory = async (reset = false) => {
        if (reset) {
            setIsLoading(true);
            setPage(0);
            setHasMore(true);
        }
        try {
            const currentPage = reset ? 0 : page;
            const response = await plantService.getWateringHistory(plantId, currentPage, 10);
            const pageData: SpringPage<WateringHistoryDTO> = response.data;

            if (reset) {
                setHistory(pageData.content);
            } else {
                setHistory(prev => [...prev, ...pageData.content]);
            }

            setHasMore(!pageData.last);
            setPage(currentPage + 1);
        } catch (error) {
            if (error instanceof ApiError) {
                showToast.error('Erreur', "Impossible de charger l'historique.");
            }
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const loadMore = async () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        await loadHistory(false);
    };

    if (isLoading) {
        return (
            <ScreenWrapper withTabBar={false}>
                <LoadingSpinner fullScreen message="Chargement de l'historique..." />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <View style={styles.root}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name={ICONS.back} size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>Historique</Text>
                        <Text style={styles.subtitle}>Arrosages enregistrés</Text>
                    </View>
                </View>

                {/* Stats globales */}
                {totalWaterings > 0 && (
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{totalWaterings}</Text>
                            <Text style={styles.statLabel}>Arrosages</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{totalLiters.toFixed(1)} L</Text>
                            <Text style={styles.statLabel}>Total eau</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{avgLiters} L</Text>
                            <Text style={styles.statLabel}>Moyenne</Text>
                        </View>
                    </View>
                )}

                {/* Liste timeline */}
                <FlatList
                    data={history}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={
                        isLoadingMore ? (
                            <LoadingSpinner message="Chargement..." />
                        ) : null
                    }
                    renderItem={({ item, index }) => (
                        <WateringHistoryCard
                            record={item}
                            isFirst={index === 0}
                            isLast={index === history.length - 1}
                        />
                    )}
                    ListEmptyComponent={
                        <EmptyState
                            icon={ICONS.wateringCan}
                            title="Aucun arrosage enregistré"
                            description="Les arrosages de cette plante apparaîtront ici."
                        />
                    }
                />

            </View>
        </ScreenWrapper>
    );
}

// -----------------------------------------------
// Styles
// -----------------------------------------------
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: FONTS.xlarge,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: FONTS.medium,
        color: COLORS.textLight,
        marginTop: 2,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: FONTS.large,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: FONTS.small,
        color: COLORS.textLight,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.xs,
    },

    // Timeline
    listContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl,
        flexGrow: 1,
    },
    timelineItem: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xs,
    },
    timelineLeft: {
        alignItems: 'center',
        width: 20,
        paddingTop: SPACING.md,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.secondary,
        borderWidth: 2,
        borderColor: COLORS.white,
        zIndex: 1,
    },
    timelineDotFirst: {
        backgroundColor: COLORS.primary,
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: COLORS.border,
        marginTop: 2,
    },

    // History card
    historyCard: {
        flex: 1,
        marginBottom: SPACING.md,
    },
    historyCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    historyIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#D8F3DC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyInfo: {
        flex: 1,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    historyRelative: {
        fontSize: FONTS.regular,
        fontWeight: '700',
        color: COLORS.text,
    },
    historyAmountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: COLORS.accent,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: 20,
    },
    historyAmount: {
        fontSize: FONTS.small,
        color: COLORS.primary,
        fontWeight: '600',
    },
    historyDate: {
        fontSize: FONTS.small,
        color: COLORS.textLight,
    },
    historyTime: {
        fontSize: FONTS.small,
        color: COLORS.textLight,
        marginTop: 1,
    },
});