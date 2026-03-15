import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, ICONS } from '../../constants';
import { PlantResponseDTO, PlantStackParamList } from '../../types';
import { Card, Badge, Icon, Button, showToast, ScreenWrapper, FadeInView, HomeScreenSkeleton } from '../../components/ui';
import { haptics } from '../../utils';
import { plantService } from '../../services';
import { ApiError } from '../../utils';
import { PlantDetailSkeleton } from '../../components/ui';

// -----------------------------------------------
// Types de navigation
// -----------------------------------------------
type PlantDetailRouteProp = RouteProp<PlantStackParamList, 'PlantDetail'>;

type PlantDetailNavigationProp = {
    navigate: (screen: string, params?: object) => void;
    goBack: () => void;
};

interface Props {
    navigation: PlantDetailNavigationProp;
    route: PlantDetailRouteProp;
}

// -----------------------------------------------
// Helpers
// -----------------------------------------------
function getWateringBadge(days: number | null): {
    label: string;
    variant: 'danger' | 'warning' | 'success' | 'neutral';
} {
    if (days === null) return { label: 'Non planifié', variant: 'neutral' };
    if (days < 0) return { label: `En retard de ${Math.abs(days)}j`, variant: 'danger' };
    if (days === 0) return { label: "Aujourd'hui !", variant: 'warning' };
    if (days <= 2) return { label: `Dans ${days} jour(s)`, variant: 'warning' };
    return { label: `Dans ${days} jours`, variant: 'success' };
}

// -----------------------------------------------
// Composant InfoRow
// -----------------------------------------------
interface InfoRowProps {
    icon: string;
    label: string;
    value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
                <Icon name={icon} size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
}

// -----------------------------------------------
// Composant PlantDetailScreen
// -----------------------------------------------
export default function PlantDetailScreen({ navigation, route }: Props) {
    const { plantId } = route.params;
    const [plant, setPlant] = useState<PlantResponseDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isWatering, setIsWatering] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadPlant();
        }, [plantId])
    );

    const loadPlant = async () => {
        setIsLoading(true);
        try {
            const response = await plantService.getPlantById(plantId);
            setPlant(response.data);
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                showToast.error('Erreur', 'Plante introuvable.');
            } else {
                showToast.error('Erreur', 'Impossible de charger la plante.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Arrosage de la plante
    const handleWater = () => {
        haptics.medium();
        Alert.alert(
            'Arroser la plante',
            `Confirmer l'arrosage de ${plant?.name} ?\n(${plant?.waterAmountLiters}L)`,
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Confirmer', onPress: confirmWater },
            ]
        );
    };

    const confirmWater = async () => {
        setIsWatering(true);
        try {
            await plantService.waterPlant(plantId);
            haptics.success();
            showToast.success(
                `${plant?.name} arrosé(e) !`,
                'Arrosage enregistré avec succès'
            );
            loadPlant(); // Recharge pour mettre à jour nextWateringDate
        } catch (error) {
            haptics.error();
            if (error instanceof ApiError && error.status === 400) {
                showToast.error('Erreur', 'Quantité ou fréquence non définie pour cette plante.');
            } else {
                showToast.error('Erreur', "L'arrosage n'a pas pu être enregistré.");
            }
        } finally {
            setIsWatering(false);
        }
    };

    // Suppression de la plante
    const handleDelete = () => {
        haptics.warning();
        Alert.alert(
            'Supprimer la plante',
            `Êtes-vous sûr de vouloir supprimer ${plant?.name} ? Cette action est irréversible.`,
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: confirmDelete },
            ]
        );
    };

    const confirmDelete = async () => {
        try {
            await plantService.deletePlant(plantId);
            haptics.success();
            showToast.success('Plante supprimée', `${plant?.name} a été supprimée.`);
            navigation.goBack();
        } catch (error) {
            haptics.error();
            showToast.error('Erreur', 'La suppression a échoué.');
        }
    };

    if (isLoading) {
        return (
            <ScreenWrapper withTabBar={false}>
                <PlantDetailSkeleton />
            </ScreenWrapper>
        );
    }

    if (!plant) {
        return (
            <View style={styles.root}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name={ICONS.back} size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.notFound}>
                    <Icon name={ICONS.plant} size={64} color={COLORS.border} />
                    <Text style={styles.notFoundText}>Plante introuvable</Text>
                </View>
            </View>
        );
    }

    const badge = getWateringBadge(plant.daysUntilNextWatering);

    return (
        <ScreenWrapper>
            <View style={styles.root}>
                <ScrollView showsVerticalScrollIndicator={false}>

                    {/* ── Hero ── */}
                    <View style={styles.hero}>

                        {/* Boutons header */}
                        <View style={styles.heroActions}>
                            <TouchableOpacity
                                style={styles.heroButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Icon name={ICONS.back} size={22} color={COLORS.white} />
                            </TouchableOpacity>
                            <View style={styles.heroRightButtons}>
                                <TouchableOpacity
                                    style={styles.heroButton}
                                    onPress={() => navigation.navigate('EditPlant', { plantId: plant.id })}
                                >
                                    <Icon name={ICONS.edit} size={22} color={COLORS.white} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.heroButton, styles.heroButtonDanger]}
                                    onPress={handleDelete}
                                >
                                    <Icon name={ICONS.delete} size={22} color={COLORS.error} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Image ou placeholder */}
                        {plant.imageUrl ? (
                            <Image source={{ uri: plant.imageUrl }} style={styles.heroImage} />
                        ) : (
                            <View style={styles.heroImagePlaceholder}>
                                <Icon name={ICONS.plantActive} size={80} color={COLORS.white} />
                            </View>
                        )}

                        {/* Nom + espèce */}
                        <Text style={styles.heroName}>{plant.name}</Text>
                        {plant.species && (
                            <Text style={styles.heroSpecies}>{plant.species}</Text>
                        )}

                        {/* Badge arrosage */}
                        <View style={styles.heroBadgeRow}>
                            <Badge label={badge.label} variant={badge.variant} />
                        </View>

                    </View>

                    {/* ── Contenu ── */}
                    <View style={styles.content}>

                        {/* Bouton Arroser */}
                        <FadeInView delay={0}>
                            <Button
                                label={isWatering ? 'Arrosage en cours...' : 'Arroser maintenant'}
                                onPress={handleWater}
                                isLoading={isWatering}
                                iconLeft={ICONS.wateringCanActive}
                                style={styles.waterButton}
                            />
                        </FadeInView>

                        {/* Informations */}
                        <FadeInView delay={100}>

                            <Card>
                                <Text style={styles.sectionTitle}>Informations</Text>
                                <InfoRow
                                    icon={ICONS.purchaseDate}
                                    label="Date d'achat"
                                    value={plant.purchaseDate
                                        ? new Date(plant.purchaseDate).toLocaleDateString('fr-FR', {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                        })
                                        : 'Non renseignée'
                                    }
                                />
                                <View style={styles.divider} />
                                <InfoRow
                                    icon={ICONS.schedule}
                                    label="Membre depuis"
                                    value={new Date(plant.createdAt).toLocaleDateString('fr-FR', {
                                        year: 'numeric', month: 'long', day: 'numeric',
                                    })}
                                />
                                <View style={styles.divider} />
                                <InfoRow
                                    icon={ICONS.history}
                                    label="Nombre d'arrosages"
                                    value={`${plant.wateringHistoryCount} arrosage(s)`}
                                />
                            </Card>
                        </FadeInView>

                        {/* Besoins en eau */}
                        <FadeInView delay={200}>
                            <Card>
                                <Text style={styles.sectionTitle}>Besoins en eau</Text>
                                <InfoRow
                                    icon={ICONS.amount}
                                    label="Quantité par arrosage"
                                    value={plant.waterAmountLiters
                                        ? `${plant.waterAmountLiters} L`
                                        : 'Non définie'
                                    }
                                />
                                <View style={styles.divider} />
                                <InfoRow
                                    icon={ICONS.frequency}
                                    label="Fréquence"
                                    value={plant.wateringFrequencyDays
                                        ? `Tous les ${plant.wateringFrequencyDays} jours`
                                        : 'Non définie'
                                    }
                                />
                                <View style={styles.divider} />
                                <InfoRow
                                    icon={ICONS.schedule}
                                    label="Prochain arrosage"
                                    value={plant.nextWateringDate
                                        ? new Date(plant.nextWateringDate).toLocaleDateString('fr-FR', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                        })
                                        : 'Non planifié'
                                    }
                                />
                            </Card>
                        </FadeInView>

                        {/* Historique */}
                        <FadeInView delay={300}>

                            <Button
                                label="Voir l'historique d'arrosage"
                                onPress={() => navigation.navigate('WateringHistory', { plantId: plant.id })}
                                variant="outline"
                                iconLeft={ICONS.history}
                            />
                        </FadeInView>

                    </View>
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

    // Hero
    hero: {
        backgroundColor: COLORS.primary,
        paddingBottom: SPACING.xl,
        alignItems: 'center',
        overflow: 'hidden',
    },
    heroActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.md,
    },
    heroRightButtons: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    heroButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroButtonDanger: {
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    heroImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
        marginBottom: SPACING.md,
    },
    heroImagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    heroName: {
        fontSize: FONTS.xlarge,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    heroSpecies: {
        fontSize: FONTS.medium,
        color: 'rgba(255,255,255,0.75)',
        fontStyle: 'italic',
        marginBottom: SPACING.sm,
    },
    heroBadgeRow: {
        marginTop: SPACING.xs,
    },

    // Contenu
    content: {
        padding: SPACING.lg,
        gap: SPACING.md,
        paddingBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONTS.medium,
        fontWeight: '700',
        color: COLORS.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: SPACING.sm,
    },

    // Info rows
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
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
    divider: {
        height: 1,
        backgroundColor: COLORS.background,
        marginLeft: 36 + SPACING.md,
    },

    // Water button
    waterButton: {
        backgroundColor: COLORS.secondary,
    },

    // Not found
    notFound: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.md,
    },
    notFoundText: {
        fontSize: FONTS.large,
        color: COLORS.textLight,
    },

    // Back button
    backButton: {
        margin: SPACING.lg,
        marginTop: SPACING.xl,
    },
});