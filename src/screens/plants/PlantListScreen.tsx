import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, ICONS } from '../../constants';
import { PlantResponseDTO } from '../../types';
import { Card, Badge, Icon, EmptyState, ScreenWrapper, PlantListSkeleton, showToast } from '../../components/ui';
import { haptics } from '../../utils';
import { plantService } from '../../services';
import { ApiError } from '../../utils';

// -----------------------------------------------
// Types de navigation
// -----------------------------------------------
type PlantListNavigationProp = {
    navigate: (screen: string, params?: object) => void;
    goBack: () => void;
};

interface Props {
    navigation: PlantListNavigationProp;
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
    if (days === 0) return { label: "Aujourd'hui", variant: 'warning' };
    if (days <= 2) return { label: `Dans ${days}j`, variant: 'warning' };
    return { label: `Dans ${days}j`, variant: 'success' };
}

// -----------------------------------------------
// Composant PlantCard
// -----------------------------------------------
interface PlantCardProps {
    plant: PlantResponseDTO;
    onPress: (plant: PlantResponseDTO) => void;
    onWater: (plantId: number) => void;
}

function PlantCard({ plant, onPress, onWater }: PlantCardProps) {
    const badge = getWateringBadge(plant.daysUntilNextWatering);

    return (
        <TouchableOpacity onPress={() => onPress(plant)} activeOpacity={0.85}>
            <Card style={styles.plantCard}>
                <View style={styles.plantCardContent}>

                    {/* Icône plante */}
                    <View style={styles.plantImageContainer}>
                        <Icon name={ICONS.plantActive} size={36} color={COLORS.primary} />
                    </View>

                    {/* Infos */}
                    <View style={styles.plantInfo}>
                        <Text style={styles.plantName}>{plant.name}</Text>
                        {plant.species && (
                            <Text style={styles.plantSpecies}>{plant.species}</Text>
                        )}
                        <View style={styles.plantMeta}>
                            <Badge label={badge.label} variant={badge.variant} />
                            {plant.waterAmountLiters && (
                                <View style={styles.waterInfo}>
                                    <Icon name={ICONS.water} size={12} color={COLORS.textLight} />
                                    <Text style={styles.waterText}>
                                        {plant.waterAmountLiters}L / {plant.wateringFrequencyDays}j
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.plantActions}>
                        <TouchableOpacity
                            style={styles.waterButton}
                            onPress={() => onWater(plant.id)}
                        >
                            <Icon name={ICONS.wateringCan} size={20} color={COLORS.secondary} />
                        </TouchableOpacity>
                        <Icon name="arrow-right" size={18} color={COLORS.textLight} />
                    </View>

                </View>
            </Card>
        </TouchableOpacity>
    );
}

// -----------------------------------------------
// Composant PlantListScreen
// -----------------------------------------------
export default function PlantListScreen({ navigation }: Props) {
    const [plants, setPlants] = useState<PlantResponseDTO[]>([]);
    const [filteredPlants, setFilteredPlants] = useState<PlantResponseDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadPlants();
        }, [])
    );

    const loadPlants = async () => {
        setIsLoading(true);
        try {
            const response = await plantService.getMyPlants();
            setPlants(response.data);
            setFilteredPlants(response.data);
        } catch (error) {
            if (error instanceof ApiError) {
                showToast.error('Erreur', 'Impossible de charger les plantes.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredPlants(plants);
        } else {
            const filtered = plants.filter(plant =>
                plant.name.toLowerCase().includes(query.toLowerCase()) ||
                plant.species?.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredPlants(filtered);
        }
    };

    const handlePlantPress = (plant: PlantResponseDTO) => {
        haptics.selection();
        navigation.navigate('PlantDetail', { plantId: plant.id });
    };

    const handleWaterPlant = async (plantId: number) => {
        haptics.medium();
        try {
            await plantService.waterPlant(plantId);
            haptics.success();
            showToast.success('Arrosage enregistré !');
            loadPlants(); // Recharge la liste
        } catch {
            haptics.error();
            showToast.error('Erreur', "L'arrosage n'a pas pu être enregistré.");
        }
    };

    if (isLoading) {
        return (
            <ScreenWrapper>
                <PlantListSkeleton />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <View style={styles.root}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Mes Plantes</Text>
                    <Text style={styles.subtitle}>{plants.length} plante(s)</Text>
                </View>

                {/* Barre de recherche */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Icon name={ICONS.search} size={18} color={COLORS.textLight} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher une plante..."
                            placeholderTextColor={COLORS.textLight}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')}>
                                <Icon name={ICONS.close} size={18} color={COLORS.textLight} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Liste */}
                <FlatList
                    data={filteredPlants}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <PlantCard
                            plant={item}
                            onPress={handlePlantPress}
                            onWater={handleWaterPlant}
                        />
                    )}
                    ListEmptyComponent={
                        <EmptyState
                            icon={ICONS.plant}
                            title={searchQuery ? 'Aucun résultat' : 'Aucune plante'}
                            description={
                                searchQuery
                                    ? `Aucune plante ne correspond à "${searchQuery}"`
                                    : 'Ajoutez votre première plante pour commencer.'
                            }
                            actionLabel={searchQuery ? undefined : 'Ajouter une plante'}
                            onAction={searchQuery ? undefined : () => navigation.navigate('AddPlant')}
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
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
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
    searchContainer: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 10,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        fontSize: FONTS.regular,
        color: COLORS.text,
        padding: 0,
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl,
        flexGrow: 1,
    },
    plantCard: {
        marginBottom: SPACING.sm,
    },
    plantCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    plantImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plantInfo: {
        flex: 1,
    },
    plantName: {
        fontSize: FONTS.regular,
        fontWeight: '700',
        color: COLORS.text,
    },
    plantSpecies: {
        fontSize: FONTS.small,
        color: COLORS.textLight,
        marginBottom: SPACING.xs,
        fontStyle: 'italic',
    },
    plantMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        flexWrap: 'wrap',
    },
    waterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    waterText: {
        fontSize: FONTS.small,
        color: COLORS.textLight,
    },
    plantActions: {
        alignItems: 'center',
        gap: SPACING.sm,
    },
    waterButton: {
        padding: SPACING.sm,
        backgroundColor: '#D8F3DC',
        borderRadius: 10,
    },
});