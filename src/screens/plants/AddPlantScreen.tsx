import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SPACING, ICONS } from '../../constants';
import { PlantCreateDTO, MainTabParamList } from '../../types';
import { Button, Input, Card, Icon, showToast, ScreenWrapper } from '../../components/ui';
import { haptics } from '../../utils';
import { plantService } from '../../services';
import { ApiError } from '../../utils';

// -----------------------------------------------
// Types de navigation
// -----------------------------------------------
type AddPlantScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'AddPlant'>;

interface Props {
    navigation: AddPlantScreenNavigationProp;
}

// -----------------------------------------------
// Composant AddPlantScreen
// -----------------------------------------------
export default function AddPlantScreen({ navigation }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PlantCreateDTO>({
        defaultValues: {
            name: '',
            species: '',
            purchaseDate: '',
            waterAmountLiters: undefined,
            wateringFrequencyDays: undefined,
        },
    });

    // -----------------------------------------------
    // Sélection d'image
    // -----------------------------------------------
    const handlePickImage = async () => {
        // Demande la permission d'accès à la galerie
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission refusée. Veuillez autoriser l\'accès à la galerie.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleTakePhoto = async () => {
        // Demande la permission d'accès à la caméra
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission refusée. Veuillez autoriser l\'accès à la caméra.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    // -----------------------------------------------
    // Soumission
    // -----------------------------------------------
    const onSubmit = async (data: PlantCreateDTO) => {
        setSubmitError(null);
        setIsLoading(true);
        haptics.medium();
        try {
            // Prépare le payload avec l'image si présente
            const payload: PlantCreateDTO = {
                ...data,
                image: imageUri
                    ? { uri: imageUri, name: 'plant.jpg', type: 'image/jpeg' }
                    : undefined,
            };

            await plantService.createPlant(payload);
            haptics.success();
            showToast.success(
                'Plante ajoutée !',
                `${data.name} a été ajoutée avec succès.`
            );
            reset();
            setImageUri(null);
            navigation.navigate('Plants');
        } catch (error) {
            haptics.error();
            if (error instanceof ApiError) {
                if (error.status === 400) {
                    const fieldErrors = error.data?.data;
                    if (fieldErrors?.name) {
                        setSubmitError(fieldErrors.name);
                    } else {
                        setSubmitError(error.message ?? 'Veuillez vérifier les informations saisies.');
                    }
                } else {
                    setSubmitError('Une erreur est survenue. Veuillez réessayer.');
                }
            } else {
                setSubmitError('Impossible de créer la plante. Vérifiez votre connexion.');
            }
            showToast.error('Erreur', 'Impossible de créer la plante.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                style={styles.root}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Ajouter une plante</Text>
                </View>

                <ScrollView
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >

                    {/* Section Image */}
                    <Card>
                        <Text style={styles.sectionTitle}>Photo de la plante</Text>
                        <View style={styles.imageSection}>

                            {/* Aperçu image */}
                            <View style={styles.imagePreviewContainer}>
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Icon name={ICONS.image} size={40} color={COLORS.textLight} />
                                        <Text style={styles.imagePlaceholderText}>Aucune photo</Text>
                                    </View>
                                )}
                            </View>

                            {/* Boutons image */}
                            <View style={styles.imageButtons}>
                                <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
                                    <Icon name={ICONS.image} size={20} color={COLORS.primary} />
                                    <Text style={styles.imageButtonText}>Galerie</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
                                    <Icon name={ICONS.camera} size={20} color={COLORS.primary} />
                                    <Text style={styles.imageButtonText}>Caméra</Text>
                                </TouchableOpacity>
                                {imageUri && (
                                    <TouchableOpacity
                                        style={[styles.imageButton, styles.imageButtonDanger]}
                                        onPress={() => setImageUri(null)}
                                    >
                                        <Icon name={ICONS.delete} size={20} color={COLORS.error} />
                                        <Text style={[styles.imageButtonText, { color: COLORS.error }]}>
                                            Supprimer
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                        </View>
                    </Card>

                    {/* Section Informations */}
                    <Card>
                        <Text style={styles.sectionTitle}>Informations générales</Text>

                        {/* Nom */}
                        <Controller
                            control={control}
                            name="name"
                            rules={{ required: 'Le nom est obligatoire' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Nom de la plante"
                                    placeholder="Ex: Mon Cactus"
                                    iconLeft={ICONS.plant}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    error={errors.name?.message}
                                    required
                                />
                            )}
                        />

                        {/* Espèce */}
                        <Controller
                            control={control}
                            name="species"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Espèce"
                                    placeholder="Ex: Cactus Saguaro"
                                    iconLeft={ICONS.species}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value ?? ''}
                                    hint="Optionnel"
                                />
                            )}
                        />

                        {/* Date d'achat */}
                        <Controller
                            control={control}
                            name="purchaseDate"
                            rules={{
                                pattern: {
                                    value: /^\d{4}-\d{2}-\d{2}$/,
                                    message: 'Format attendu : YYYY-MM-DD',
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Date d'achat"
                                    placeholder="YYYY-MM-DD (ex: 2024-01-15)"
                                    iconLeft={ICONS.purchaseDate}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value ?? ''}
                                    error={errors.purchaseDate?.message}
                                    hint="Optionnel — format YYYY-MM-DD"
                                />
                            )}
                        />
                    </Card>

                    {/* Section Arrosage */}
                    <Card>
                        <Text style={styles.sectionTitle}>Besoins en eau</Text>

                        {/* Quantité */}
                        <Controller
                            control={control}
                            name="waterAmountLiters"
                            rules={{
                                min: { value: 0.1, message: 'La quantité minimum est 0.1L' },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Quantité d'eau (litres)"
                                    placeholder="Ex: 0.5"
                                    iconLeft={ICONS.amount}
                                    keyboardType="decimal-pad"
                                    onChangeText={text => onChange(text ? parseFloat(text) : undefined)}
                                    onBlur={onBlur}
                                    value={value?.toString() ?? ''}
                                    error={errors.waterAmountLiters?.message}
                                    hint="Optionnel — ex: 0.5 pour 500ml"
                                />
                            )}
                        />

                        {/* Fréquence */}
                        <Controller
                            control={control}
                            name="wateringFrequencyDays"
                            rules={{
                                min: { value: 1, message: 'La fréquence minimum est 1 jour' },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Fréquence d'arrosage (jours)"
                                    placeholder="Ex: 3"
                                    iconLeft={ICONS.frequency}
                                    keyboardType="number-pad"
                                    onChangeText={text => onChange(text ? parseInt(text) : undefined)}
                                    onBlur={onBlur}
                                    value={value?.toString() ?? ''}
                                    error={errors.wateringFrequencyDays?.message}
                                    hint="Optionnel — ex: 3 pour tous les 3 jours"
                                />
                            )}
                        />
                    </Card>

                    {/* Erreur globale */}
                    {submitError && (
                        <View style={styles.errorBanner}>
                            <Icon name={ICONS.error} size={16} color={COLORS.error} />
                            <Text style={styles.errorBannerText}>{submitError}</Text>
                        </View>
                    )}

                    {/* Boutons */}
                    <Button
                        label="Ajouter la plante"
                        onPress={handleSubmit(onSubmit)}
                        isLoading={isLoading}
                        iconLeft={ICONS.addPlant}
                    />
                    <Button
                        label="Annuler"
                        onPress={() => navigation.navigate('Plants')}
                        variant="outline"
                        iconLeft={ICONS.cancel}
                        style={styles.cancelButton}
                    />

                </ScrollView>
            </KeyboardAvoidingView>
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

    container: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONTS.large,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },

    // Image
    imageSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    imagePreviewContainer: {
        width: 100,
        height: 100,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    imagePlaceholderText: {
        fontSize: FONTS.small,
        color: COLORS.textLight,
    },
    imageButtons: {
        flex: 1,
        gap: SPACING.sm,
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        padding: SPACING.sm,
        backgroundColor: COLORS.background,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    imageButtonDanger: {
        borderColor: COLORS.error,
        backgroundColor: '#FDECEA',
    },
    imageButtonText: {
        fontSize: FONTS.medium,
        color: COLORS.primary,
        fontWeight: '600',
    },

    // Erreur
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDECEA',
        borderRadius: 8,
        padding: SPACING.sm,
        marginBottom: SPACING.md,
        gap: SPACING.xs,
    },
    errorBannerText: {
        color: COLORS.error,
        fontSize: FONTS.medium,
        flex: 1,
    },
    cancelButton: {
        marginTop: SPACING.sm,
    },
});