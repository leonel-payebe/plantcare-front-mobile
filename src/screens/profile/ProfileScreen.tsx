import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    StatusBar,
} from 'react-native';
import { COLORS, FONTS, SPACING, ICONS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { haptics } from '../../utils';
import { authService } from '../../services';
import { ApiError } from '../../utils';
import { showToast, Icon, ScreenWrapper, ChangePasswordModal } from '../../components/ui';
import { ChangePasswordRequest } from '../../types';
import { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type ProfileNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

// -----------------------------------------------
// Composant MenuItem
// -----------------------------------------------
interface MenuItemProps {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    variant?: 'default' | 'danger';
    rightElement?: React.ReactNode;
}

function MenuItem({
    icon,
    label,
    value,
    onPress,
    variant = 'default',
    rightElement,
}: MenuItemProps) {
    const isDanger = variant === 'danger';

    return (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.6}
        >
            <View style={[styles.menuIconContainer, isDanger && styles.menuIconDanger]}>
                <Icon
                    name={icon}
                    size={19}
                    color={isDanger ? COLORS.error : COLORS.primary}
                />
            </View>
            <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemLabel, isDanger && styles.menuItemLabelDanger]}>
                    {label}
                </Text>
                {value && <Text style={styles.menuItemValue}>{value}</Text>}
            </View>
            {rightElement ?? (
                onPress && !isDanger && (
                    <Icon name="chevron-right" size={18} color={COLORS.border} />
                )
            )}
        </TouchableOpacity>
    );
}

// -----------------------------------------------
// Composant SectionCard
// -----------------------------------------------
interface SectionCardProps {
    title?: string;
    children: React.ReactNode;
}

function SectionCard({ title, children }: SectionCardProps) {
    return (
        <View style={styles.sectionCard}>
            {title && <Text style={styles.sectionCardTitle}>{title}</Text>}
            <View style={styles.sectionCardBody}>{children}</View>
        </View>
    );
}

// -----------------------------------------------
// Composant ProfileScreen
// -----------------------------------------------
export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const navigation = useNavigation<ProfileNavigationProp>();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    const handleLogout = () => {
        haptics.warning();
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Déconnecter', style: 'destructive', onPress: confirmLogout },
            ]
        );
    };

    const confirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout(); // logout() appelle déjà authService.logout() via useAuth
            haptics.success();
            // Navigation automatique via RootNavigator
        } catch {
            haptics.error();
            showToast.error('Erreur', 'Une erreur est survenue lors de la déconnexion.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleChangePassword = () => {
        haptics.light();
        setShowChangePasswordModal(true);
    };

    const handleChangePasswordSubmit = async (data: ChangePasswordRequest) => {
        setIsChangingPassword(true);
        try {
            haptics.medium();
            await authService.changePassword(data);
            haptics.success();
            setShowChangePasswordModal(false);
            showToast.success(
                'Mot de passe modifié',
                'Votre mot de passe a été mis à jour.'
            );
        } catch (error) {
            haptics.error();
            if (error instanceof ApiError) {
                if (error.status === 400) {
                    showToast.error('Erreur', 'Mot de passe actuel incorrect.');
                } else {
                    showToast.error('Erreur', 'Une erreur est survenue.');
                }
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Initiales de l'utilisateur pour l'avatar
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <ScreenWrapper>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >

                    {/* ── Header avec dégradé ── */}
                    <View style={styles.heroSection}>

                        {/* Cercles décoratifs */}
                        <View style={styles.decorCircle1} />
                        <View style={styles.decorCircle2} />

                        {/* Avatar avec initiales */}
                        <View style={styles.avatarWrapper}>
                            <View style={styles.avatarRing}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarInitials}>{initials}</Text>
                                </View>
                            </View>

                            {/* Badge statut */}
                            <View style={[
                                styles.statusBadge,
                                user?.emailVerified ? styles.statusBadgeVerified : styles.statusBadgeUnverified,
                            ]}>
                                <Icon
                                    name={user?.emailVerified ? 'check' : 'clock-outline'}
                                    size={10}
                                    color={COLORS.white}
                                />
                            </View>
                        </View>

                        {/* Nom + Email */}
                        <Text style={styles.heroName}>{user?.name ?? '—'}</Text>
                        <Text style={styles.heroEmail}>{user?.email ?? '—'}</Text>

                        {/* Chips infos */}
                        <View style={styles.heroChips}>
                            <View style={styles.heroChip}>
                                <Icon name={ICONS.plant} size={13} color={COLORS.white} />
                                <Text style={styles.heroChipText}>Jardinier</Text>
                            </View>
                            <View style={styles.heroDot} />
                            <View style={styles.heroChip}>
                                <Icon name={ICONS.purchaseDate} size={13} color={COLORS.white} />
                                <Text style={styles.heroChipText}>
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                                            month: 'short',
                                            year: 'numeric',
                                        })
                                        : '—'}
                                </Text>
                            </View>
                        </View>

                    </View>

                    {/* ── Contenu ── */}
                    <View style={styles.content}>

                        {/* Mon compte */}
                        <SectionCard title="Mon compte">
                            <MenuItem
                                icon={ICONS.profile}
                                label="Nom complet"
                                value={user?.name}
                            />
                            <View style={styles.divider} />
                            <MenuItem
                                icon={ICONS.email}
                                label="Adresse email"
                                value={user?.email}
                                rightElement={
                                    <View style={[
                                        styles.verifiedPill,
                                        user?.emailVerified ? styles.verifiedPillGreen : styles.verifiedPillOrange,
                                    ]}>
                                        <Text style={[
                                            styles.verifiedPillText,
                                            { color: user?.emailVerified ? COLORS.primary : '#B45309' },
                                        ]}>
                                            {user?.emailVerified ? 'Vérifié' : 'Non vérifié'}
                                        </Text>
                                    </View>
                                }
                            />
                        </SectionCard>

                        {/* Paramètres */}
                        <SectionCard title="Paramètres">
                            <MenuItem
                                icon={ICONS.password}
                                label="Changer le mot de passe"
                                onPress={handleChangePassword}
                            />
                            <View style={styles.divider} />

                            <View style={styles.divider} />
                            <MenuItem
                                icon={ICONS.info}
                                label="À propos"
                                onPress={() => {
                                    haptics.light();
                                    navigation.navigate('About');
                                }}
                            />
                        </SectionCard>

                        {/* Déconnexion */}
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                            activeOpacity={0.8}
                            disabled={isLoggingOut}
                        >
                            <Icon name={ICONS.logout} size={20} color={COLORS.error} />
                            <Text style={styles.logoutText}>
                                {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
                            </Text>
                        </TouchableOpacity>

                        {/* Version */}
                        <Text style={styles.version}>PlantCare v1.0.0</Text>

                    </View>
                </ScrollView>
                {/* Modal changement mot de passe */}
                <ChangePasswordModal
                    visible={showChangePasswordModal}
                    onClose={() => setShowChangePasswordModal(false)}
                    onSubmit={handleChangePasswordSubmit}
                    isLoading={isChangingPassword}
                />
            </ScreenWrapper>
        </View>
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
    scrollContent: {
        paddingBottom: SPACING.xl,
    },

    // ── Hero ──
    heroSection: {
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        paddingTop: SPACING.xl + 16,
        paddingBottom: SPACING.xl + 16,
        overflow: 'hidden',
    },
    decorCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.05)',
        top: -60,
        right: -40,
    },
    decorCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.05)',
        bottom: -30,
        left: -30,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: SPACING.md,
    },
    avatarRing: {
        padding: 3,
        borderRadius: 52,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: FONTS.xxlarge,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    statusBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    statusBadgeVerified: {
        backgroundColor: COLORS.secondary,
    },
    statusBadgeUnverified: {
        backgroundColor: COLORS.warning,
    },
    heroName: {
        fontSize: FONTS.xlarge,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    heroEmail: {
        fontSize: FONTS.medium,
        color: 'rgba(255,255,255,0.75)',
        marginBottom: SPACING.md,
    },
    heroChips: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    heroChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    heroChipText: {
        fontSize: FONTS.small,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
    },
    heroDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },

    // ── Contenu ──
    content: {
        padding: SPACING.lg,
        gap: SPACING.md,
    },

    // Section card
    sectionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionCardTitle: {
        fontSize: FONTS.small,
        fontWeight: '700',
        color: COLORS.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    sectionCardBody: {},

    // Menu item
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        gap: SPACING.md,
    },
    menuIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuIconDanger: {
        backgroundColor: '#FEE2E2',
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemLabel: {
        fontSize: FONTS.regular,
        color: COLORS.text,
        fontWeight: '500',
    },
    menuItemLabelDanger: {
        color: COLORS.error,
        fontWeight: '600',
    },
    menuItemValue: {
        fontSize: FONTS.small,
        color: COLORS.textLight,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.background,
        marginLeft: SPACING.md + 38 + SPACING.md,
    },

    // Verified pill
    verifiedPill: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: 20,
    },
    verifiedPillGreen: {
        backgroundColor: '#D8F3DC',
    },
    verifiedPillOrange: {
        backgroundColor: '#FEF3C7',
    },
    verifiedPillText: {
        fontSize: FONTS.small,
        fontWeight: '600',
    },

    // Notif toggle (décoratif pour l'instant)
    notifToggle: {
        width: 42,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        paddingHorizontal: 3,
        alignItems: 'flex-end',
    },
    notifToggleThumb: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: COLORS.white,
    },

    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: '#FEE2E2',
        borderRadius: 14,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: {
        color: COLORS.error,
        fontSize: FONTS.regular,
        fontWeight: '700',
    },

    // Version
    version: {
        textAlign: 'center',
        fontSize: FONTS.small,
        color: COLORS.textLight,
        marginTop: SPACING.sm,
    },
});