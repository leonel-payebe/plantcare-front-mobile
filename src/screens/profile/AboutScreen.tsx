import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { COLORS, FONTS, SPACING, ICONS } from '../../constants';
import { Icon, ScreenWrapper } from '../../components/ui';
import { haptics } from '../../utils';

// -----------------------------------------------
// Types de navigation
// -----------------------------------------------
type AboutNavigationProp = {
    goBack: () => void;
};

interface Props {
    navigation: AboutNavigationProp;
}

// -----------------------------------------------
// Composant InfoItem
// -----------------------------------------------
interface InfoItemProps {
    icon: string;
    label: string;
    value: string;
    onPress?: () => void;
}

function InfoItem({ icon, label, value, onPress }: InfoItemProps) {
    return (
        <TouchableOpacity
            style={styles.infoItem}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.infoIconContainer}>
                <Icon name={icon} size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={[styles.infoValue, onPress && styles.infoValueLink]}>
                    {value}
                </Text>
            </View>
            {onPress && (
                <Icon name="chevron-right" size={16} color={COLORS.textLight} />
            )}
        </TouchableOpacity>
    );
}

// -----------------------------------------------
// Composant SectionCard
// -----------------------------------------------
interface SectionCardProps {
    title: string;
    children: React.ReactNode;
}

function SectionCard({ title, children }: SectionCardProps) {
    return (
        <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionBody}>{children}</View>
        </View>
    );
}

// -----------------------------------------------
// Composant AboutScreen
// -----------------------------------------------
export default function AboutScreen({ navigation }: Props) {
    return (
        <ScreenWrapper withTabBar={false}>
            <View style={styles.root}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name={ICONS.back} size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>À propos</Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.container}
                >

                    {/* Logo + Nom */}
                    <View style={styles.heroSection}>
                        <View style={styles.logoContainer}>
                            <Icon name={ICONS.plantActive} size={56} color={COLORS.white} />
                        </View>
                        <Text style={styles.appName}>PlantCare</Text>
                        <Text style={styles.appTagline}>Prenez soin de vos plantes</Text>
                        <View style={styles.versionBadge}>
                            <Text style={styles.versionText}>Version 1.0.0</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.descriptionCard}>
                        <Text style={styles.description}>
                            PlantCare est une application mobile dédiée à la gestion de vos
                            plantes d'intérieur. Suivez les besoins en eau de chacune de vos
                            plantes et recevez des rappels pour ne jamais oublier un arrosage.
                        </Text>
                    </View>

                    {/* Informations */}
                    <SectionCard title="Informations">
                        <InfoItem
                            icon="information-outline"
                            label="Version"
                            value="1.0.0"
                        />
                        <View style={styles.divider} />
                        <InfoItem
                            icon="code-tags"
                            label="Technologie"
                            value="React Native + Spring Boot"
                        />
                        <View style={styles.divider} />
                        <InfoItem
                            icon="database-outline"
                            label="Backend"
                            value="Spring Boot 3 + MySQL"
                        />
                        <View style={styles.divider} />
                        <InfoItem
                            icon="cellphone"
                            label="Plateforme"
                            value="Android & iOS"
                        />
                    </SectionCard>

                    {/* Fonctionnalités */}
                    <SectionCard title="Fonctionnalités">
                        {[
                            { icon: ICONS.plant, text: 'Gestion des plantes d\'intérieur' },
                            { icon: ICONS.wateringCan, text: 'Suivi des arrosages' },
                            { icon: ICONS.notification, text: 'Notifications temps réel' },
                            { icon: ICONS.history, text: 'Historique des arrosages' },
                            { icon: ICONS.schedule, text: 'Planification automatique' },
                            { icon: ICONS.image, text: 'Photos des plantes' },
                        ].map((item, index, arr) => (
                            <View key={index}>
                                <View style={styles.featureItem}>
                                    <View style={styles.featureIconContainer}>
                                        <Icon name={item.icon} size={16} color={COLORS.primary} />
                                    </View>
                                    <Text style={styles.featureText}>{item.text}</Text>
                                </View>
                                {index < arr.length - 1 && <View style={styles.divider} />}
                            </View>
                        ))}
                    </SectionCard>

                    {/* Développeur */}
                    <SectionCard title="Développeur FullStack">
                        <InfoItem
                            icon="account-outline"
                            label="Développé par"
                            value="Djonbé Payebé Leonel"
                        />
                        <View style={styles.divider} />
                        <InfoItem
                            icon="email-outline"
                            label="Contact"
                            value="leonelpayebe@gmail.com"
                            onPress={() => {
                                haptics.light();
                                Linking.openURL('mailto:leonelpayebe@gmail.com');
                            }}
                        />
                    </SectionCard>

                    {/* Mentions légales */}
                    <SectionCard title="Légal">
                        <InfoItem
                            icon="shield-check-outline"
                            label="Politique de confidentialité"
                            value="Voir la politique"
                            onPress={() => haptics.light()}
                        />
                        <View style={styles.divider} />
                        <InfoItem
                            icon="file-document-outline"
                            label="Conditions d'utilisation"
                            value="Voir les conditions"
                            onPress={() => haptics.light()}
                        />
                    </SectionCard>

                    {/* Copyright */}
                    <Text style={styles.copyright}>
                        © 2026 PlantCare. Tous droits réservés.
                    </Text>

                </ScrollView>
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
    headerTitle: {
        fontSize: FONTS.xlarge,
        fontWeight: 'bold',
        color: COLORS.text,
    },

    container: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl,
        gap: SPACING.md,
    },

    // Hero
    heroSection: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        gap: SPACING.sm,
    },
    logoContainer: {
        width: 96,
        height: 96,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    appName: {
        fontSize: FONTS.xxlarge,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    appTagline: {
        fontSize: FONTS.regular,
        color: COLORS.textLight,
    },
    versionBadge: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 20,
        marginTop: SPACING.xs,
    },
    versionText: {
        fontSize: FONTS.small,
        color: COLORS.primary,
        fontWeight: '600',
    },

    // Description
    descriptionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.lg,
    },
    description: {
        fontSize: FONTS.regular,
        color: COLORS.textLight,
        lineHeight: 24,
        textAlign: 'center',
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
    sectionTitle: {
        fontSize: FONTS.small,
        fontWeight: '700',
        color: COLORS.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    sectionBody: {},

    // Info item
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        gap: SPACING.md,
    },
    infoIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: FONTS.small,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: FONTS.regular,
        color: COLORS.text,
        fontWeight: '500',
    },
    infoValueLink: {
        color: COLORS.primary,
    },

    // Feature item
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        gap: SPACING.md,
    },
    featureIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureText: {
        fontSize: FONTS.regular,
        color: COLORS.text,
        fontWeight: '500',
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: COLORS.background,
        marginHorizontal: SPACING.md,
    },

    // Copyright
    copyright: {
        textAlign: 'center',
        fontSize: FONTS.small,
        color: COLORS.textLight,
        marginTop: SPACING.sm,
    },
});