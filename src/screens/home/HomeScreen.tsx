import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { COLORS, FONTS, SPACING, ICONS } from '../../constants';
import { PlantResponseDTO, PlantStatsDTO, MainTabParamList } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import {
    Icon,
    ScreenWrapper,
    FadeInView,
    HomeScreenSkeleton,
    showToast,
} from '../../components/ui';
import { haptics } from '../../utils';
import BottomSheet from '@gorhom/bottom-sheet';
import { NotificationSheet } from '../../components/ui';
import { plantService } from '../../services';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useNotificationStore } from '../../hooks/useNotificationStore';

// -----------------------------------------------
// Types de navigation
// -----------------------------------------------
type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

// -----------------------------------------------
// Composant StatCard
// -----------------------------------------------
interface StatCardProps {
    icon: string;
    value: number;
    label: string;
    color: string;
    backgroundColor: string;
}

function StatCard({ icon, value, label, color, backgroundColor }: StatCardProps) {
    return (
        <View style={[styles.statCard, { backgroundColor }]}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Icon name={icon} size={20} color={color} />
            </View>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

// -----------------------------------------------
// Composant UrgentPlantCard
// -----------------------------------------------
interface UrgentPlantCardProps {
    plant: PlantResponseDTO;
    onWater: (plantId: number) => void;
    onPress: (plantId: number) => void;
}

function UrgentPlantCard({ plant, onWater, onPress }: UrgentPlantCardProps) {
    const isOverdue = (plant.daysUntilNextWatering ?? 0) < 0;
    const daysText = isOverdue
        ? `En retard de ${Math.abs(plant.daysUntilNextWatering ?? 0)}j`
        : `Dans ${plant.daysUntilNextWatering}j`;

    return (
        <TouchableOpacity
            onPress={() => onPress(plant.id)}
            activeOpacity={0.85}
        >
            <View style={[styles.urgentCard, isOverdue && styles.urgentCardOverdue]}>

                {/* Barre colorée gauche */}
                <View style={[
                    styles.urgentCardBar,
                    { backgroundColor: isOverdue ? COLORS.error : COLORS.warning }
                ]} />

                {/* Icône plante */}
                <View style={[
                    styles.urgentPlantIcon,
                    { backgroundColor: isOverdue ? '#FDECEA' : '#FFF8E7' }
                ]}>
                    <Icon
                        name={ICONS.plantActive}
                        size={28}
                        color={isOverdue ? COLORS.error : '#D97706'}
                    />
                </View>

                {/* Infos */}
                <View style={styles.urgentCardInfo}>
                    <Text style={styles.urgentCardName}>{plant.name}</Text>
                    {plant.species && (
                        <Text style={styles.urgentCardSpecies}>{plant.species}</Text>
                    )}
                    <View style={styles.urgentCardMeta}>
                        <Icon
                            name={ICONS.schedule}
                            size={12}
                            color={isOverdue ? COLORS.error : '#D97706'}
                        />
                        <Text style={[
                            styles.urgentCardDays,
                            { color: isOverdue ? COLORS.error : '#D97706' }
                        ]}>
                            {daysText}
                        </Text>
                    </View>
                </View>

                {/* Bouton arroser */}
                <TouchableOpacity
                    style={[
                        styles.urgentWaterButton,
                        { backgroundColor: isOverdue ? '#FDECEA' : '#D8F3DC' }
                    ]}
                    onPress={() => onWater(plant.id)}
                >
                    <Icon
                        name={ICONS.wateringCanActive}
                        size={20}
                        color={isOverdue ? COLORS.error : COLORS.secondary}
                    />
                </TouchableOpacity>

            </View>
        </TouchableOpacity>
    );
}

// -----------------------------------------------
// Composant HomeScreen
// -----------------------------------------------
export default function HomeScreen({ navigation }: Props) {
    const { user } = useAuth();
    const [stats, setStats] = useState<PlantStatsDTO | null>(null);
    const [urgentPlants, setUrgentPlants] = useState<PlantResponseDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const notificationSheetRef = useRef<BottomSheet>(null);
    const { unreadCount } = useNotificationStore();

    useWebSocket((notification) => {
        loadData();
    });


    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async (isRefresh = false) => {
        if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);
        try {
            // Appels API réels en parallèle
            const [statsResponse, overdueResponse] = await Promise.all([
                plantService.getStats(),
                plantService.getOverduePlants(),
            ]);
            setStats(statsResponse.data);
            setUrgentPlants(overdueResponse.data);
        } catch (error) {
            showToast.error('Erreur', 'Impossible de charger les données.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleWaterPlant = async (plantId: number) => {
        haptics.medium();
        try {
            await plantService.waterPlant(plantId);
            haptics.success();
            showToast.success('Arrosage enregistré !');
            // Recharge les données
            loadData();
        } catch {
            haptics.error();
            showToast.error('Erreur', "L'arrosage n'a pas pu être enregistré.");
        }
    };

    const handlePlantPress = (plantId: number) => {
        haptics.selection();
        navigation.navigate('Plants', {
            screen: 'PlantDetail',
            params: { plantId },
        } as any);
    };

    // Heure du jour pour le greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    };

    if (isLoading) {
        return (
            <ScreenWrapper>
                <HomeScreenSkeleton />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper backgroundColor={COLORS.background}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => loadData(true)}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >

                {/* ── Hero Header ── */}
                <FadeInView delay={0}>
                    <View style={styles.heroHeader}>

                        {/* Cercles décoratifs */}
                        <View style={styles.heroCircle1} />
                        <View style={styles.heroCircle2} />

                        {/* Greeting */}
                        <View style={styles.heroTop}>
                            <View>
                                <Text style={styles.heroGreeting}>{getGreeting()},</Text>
                                <Text style={styles.heroName}>
                                    {user?.name?.split(' ')[0] ?? 'Jardinier'} 👋
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.notifButton}
                                onPress={() => {
                                    haptics.light();
                                    notificationSheetRef.current?.expand();
                                }}
                            >
                                <Icon name={ICONS.notification} size={22} color={COLORS.white} />
                                {unreadCount > 0 && (
                                    <View style={styles.notifBadge}>
                                        <Text style={styles.notifBadgeText}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Résumé rapide */}
                        <View style={styles.heroSummary}>
                            <Icon name={ICONS.plant} size={16} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.heroSummaryText}>
                                {stats?.totalPlants ?? 0} plantes •{' '}
                                {stats?.overdue ?? 0} en retard •{' '}
                                {stats?.dueSoon ?? 0} bientôt
                            </Text>
                        </View>

                    </View>
                </FadeInView>

                <View style={styles.content}>

                    {/* ── Stats Grid ── */}
                    <FadeInView delay={100}>
                        <View style={styles.statsGrid}>
                            <StatCard
                                icon={ICONS.plant}
                                value={stats?.totalPlants ?? 0}
                                label="Total"
                                color={COLORS.primary}
                                backgroundColor="#D8F3DC"
                            />
                            <StatCard
                                icon={ICONS.overdue}
                                value={stats?.overdue ?? 0}
                                label="En retard"
                                color={COLORS.error}
                                backgroundColor="#FDECEA"
                            />
                            <StatCard
                                icon={ICONS.schedule}
                                value={stats?.dueSoon ?? 0}
                                label="Bientôt"
                                color="#D97706"
                                backgroundColor="#FFF8E7"
                            />
                            <StatCard
                                icon={ICONS.ok}
                                value={stats?.withSchedule ?? 0}
                                label="Planifiées"
                                color="#0369A1"
                                backgroundColor="#E0F2FE"
                            />
                        </View>
                    </FadeInView>

                    {/* ── Arrosages urgents ── */}
                    <FadeInView delay={200}>
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleRow}>
                                    <View style={styles.sectionDot} />
                                    <Text style={styles.sectionTitle}>Arrosages urgents</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Plants')}
                                    style={styles.seeAllButton}
                                >
                                    <Text style={styles.seeAllText}>Voir tout</Text>
                                    <Icon name="chevron-right" size={16} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>

                            {urgentPlants.length === 0 ? (
                                <View style={styles.emptyUrgent}>
                                    <Icon name={ICONS.ok} size={40} color={COLORS.secondary} />
                                    <Text style={styles.emptyUrgentTitle}>Tout est à jour !</Text>
                                    <Text style={styles.emptyUrgentText}>
                                        Aucun arrosage urgent pour le moment.
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.urgentList}>
                                    {urgentPlants.map((plant, index) => (
                                        <FadeInView key={plant.id} delay={300 + index * 80}>
                                            <UrgentPlantCard
                                                plant={plant}
                                                onWater={handleWaterPlant}
                                                onPress={handlePlantPress}
                                            />
                                        </FadeInView>
                                    ))}
                                </View>
                            )}
                        </View>
                    </FadeInView>

                    {/* ── Actions rapides ── */}
                    <FadeInView delay={400}>
                        <View style={styles.section}>
                            <View style={styles.sectionTitleRow}>
                                <View style={styles.sectionDot} />
                                <Text style={styles.sectionTitle}>Actions rapides</Text>
                            </View>
                            <View style={styles.quickActions}>
                                <TouchableOpacity
                                    style={styles.quickActionCard}
                                    onPress={() => {
                                        haptics.light();
                                        navigation.navigate('AddPlant');
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.quickActionIcon, { backgroundColor: '#D8F3DC' }]}>
                                        <Icon name={ICONS.addPlant} size={24} color={COLORS.primary} />
                                    </View>
                                    <Text style={styles.quickActionLabel}>Ajouter</Text>
                                    <Text style={styles.quickActionSub}>une plante</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickActionCard}
                                    onPress={() => {
                                        haptics.light();
                                        navigation.navigate('Plants');
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.quickActionIcon, { backgroundColor: '#E0F2FE' }]}>
                                        <Icon name={ICONS.plants} size={24} color="#0369A1" />
                                    </View>
                                    <Text style={styles.quickActionLabel}>Mes plantes</Text>
                                    <Text style={styles.quickActionSub}>voir la liste</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickActionCard}
                                    onPress={() => {
                                        haptics.light();
                                        navigation.navigate('Profile');
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.quickActionIcon, { backgroundColor: '#FFF8E7' }]}>
                                        <Icon name={ICONS.profile} size={24} color="#D97706" />
                                    </View>
                                    <Text style={styles.quickActionLabel}>Profil</Text>
                                    <Text style={styles.quickActionSub}>paramètres</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </FadeInView>

                </View>
            </ScrollView>
            <NotificationSheet bottomSheetRef={notificationSheetRef} />
        </ScreenWrapper>
    );
}

// -----------------------------------------------
// Styles
// -----------------------------------------------
const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: SPACING.xl,
    },

    // Hero Header
    heroHeader: {
        backgroundColor: COLORS.primary,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.xl + 8,
        paddingHorizontal: SPACING.lg,
        overflow: 'hidden',
    },
    heroCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.06)',
        top: -60,
        right: -40,
    },
    heroCircle2: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.06)',
        bottom: -40,
        left: -20,
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    heroGreeting: {
        fontSize: FONTS.regular,
        color: 'rgba(255,255,255,0.75)',
    },
    heroName: {
        fontSize: FONTS.xlarge,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: 2,
    },
    notifButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.error,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    notifBadgeText: {
        fontSize: 9,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    heroSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    heroSummaryText: {
        fontSize: FONTS.small,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },

    // Content
    content: {
        padding: SPACING.lg,
        marginTop: -SPACING.md,
    },

    // Stats
    statsGrid: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: SPACING.sm,
        alignItems: 'center',
        gap: 4,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    statValue: {
        fontSize: FONTS.large,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 10,
        color: COLORS.textLight,
        fontWeight: '500',
        textAlign: 'center',
    },

    // Sections
    section: {
        marginBottom: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    sectionDot: {
        width: 4,
        height: 18,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
    },
    sectionTitle: {
        fontSize: FONTS.large,
        fontWeight: '700',
        color: COLORS.text,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    seeAllText: {
        fontSize: FONTS.medium,
        color: COLORS.primary,
        fontWeight: '600',
    },

    // Urgent cards
    urgentList: {
        gap: SPACING.sm,
    },
    urgentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        gap: SPACING.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    urgentCardOverdue: {
        backgroundColor: '#FFFBFB',
    },
    urgentCardBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    urgentPlantIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    urgentCardInfo: {
        flex: 1,
    },
    urgentCardName: {
        fontSize: FONTS.regular,
        fontWeight: '700',
        color: COLORS.text,
    },
    urgentCardSpecies: {
        fontSize: FONTS.small,
        color: COLORS.textLight,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    urgentCardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    urgentCardDays: {
        fontSize: FONTS.small,
        fontWeight: '600',
    },
    urgentWaterButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Empty urgent
    emptyUrgent: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        gap: SPACING.sm,
        backgroundColor: COLORS.white,
        borderRadius: 16,
    },
    emptyUrgentTitle: {
        fontSize: FONTS.large,
        fontWeight: '700',
        color: COLORS.text,
    },
    emptyUrgentText: {
        fontSize: FONTS.medium,
        color: COLORS.textLight,
        textAlign: 'center',
    },

    // Quick actions
    quickActions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        alignItems: 'center',
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    quickActionLabel: {
        fontSize: FONTS.small,
        fontWeight: '700',
        color: COLORS.text,
    },
    quickActionSub: {
        fontSize: 10,
        color: COLORS.textLight,
    },
});