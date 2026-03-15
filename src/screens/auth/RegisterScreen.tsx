import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, FONTS, SPACING, ICONS } from '../../constants';
import { AuthStackParamList, RegisterRequest } from '../../types';
import { Button, Input, Card, Icon, ScreenWrapper } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services';
import { ApiError } from '../../utils';
import { haptics } from '../../utils';
import { showToast } from '../../components/ui';

// -----------------------------------------------
// Types de navigation
// -----------------------------------------------
type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
    navigation: RegisterScreenNavigationProp;
}

// -----------------------------------------------
// Composant RegisterScreen
// -----------------------------------------------
export default function RegisterScreen({ navigation }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const { login } = useAuth();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterRequest>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    // Surveille le mot de passe pour la validation de confirmation
    const password = watch('password');

    // Soumission du formulaire
    const onSubmit = async (data: RegisterRequest) => {
        setAuthError(null);
        setIsLoading(true);
        haptics.medium();
        try {
            // Appel API réel — on ne connecte PAS l'utilisateur
            await authService.register(data);
            haptics.success();

            // Redirige vers VerifyEmail sans connecter
            navigation.navigate('VerifyEmail', { email: data.email });
        } catch (error) {
            haptics.error();
            if (error instanceof ApiError) {
                if (error.status === 400) {
                    const fieldErrors = error.data?.data;
                    if (fieldErrors?.email) {
                        setAuthError(fieldErrors.email);
                    } else if (fieldErrors?.password) {
                        setAuthError(fieldErrors.password);
                    } else {
                        setAuthError(error.message ?? 'Veuillez vérifier les informations saisies.');
                    }
                } else if (error.status === 409) {
                    setAuthError('Cet email est déjà utilisé.');
                } else {
                    setAuthError('Une erreur est survenue. Réessayez.');
                }
            } else {
                setAuthError('Impossible de créer le compte. Vérifiez votre connexion.');
            }
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
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >

                    {/* Header */}
                    <View style={styles.header}>
                        <Icon name={ICONS.plant} size={64} color={COLORS.primary} />
                        <Text style={styles.title}>Créer un compte</Text>
                        <Text style={styles.subtitle}>Rejoignez PlantCare</Text>
                    </View>

                    {/* Formulaire */}
                    <Card>

                        {/* Erreur globale */}
                        {authError && (
                            <View style={styles.errorBanner}>
                                <Icon name={ICONS.error} size={16} color={COLORS.error} />
                                <Text style={styles.errorBannerText}>{authError}</Text>
                            </View>
                        )}

                        {/* Nom */}
                        <Controller
                            control={control}
                            name="name"
                            rules={{
                                required: 'Le nom est obligatoire',
                                minLength: {
                                    value: 2,
                                    message: 'Le nom doit contenir au moins 2 caractères',
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Nom complet"
                                    placeholder="Jean Dupont"
                                    autoCapitalize="words"
                                    iconLeft={ICONS.profile}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    error={errors.name?.message}
                                    required
                                />
                            )}
                        />

                        {/* Email */}
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: "L'email est obligatoire",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "L'email n'est pas valide",
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Email"
                                    placeholder="votre@email.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    iconLeft={ICONS.email}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    error={errors.email?.message}
                                    required
                                />
                            )}
                        />

                        {/* Mot de passe */}
                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: 'Le mot de passe est obligatoire',
                                minLength: {
                                    value: 6,
                                    message: 'Le mot de passe doit contenir au moins 6 caractères',
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Mot de passe"
                                    placeholder="••••••••"
                                    iconLeft={ICONS.password}
                                    isPassword
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    error={errors.password?.message}
                                    hint="Minimum 6 caractères"
                                    required
                                />
                            )}
                        />

                        {/* Confirmation mot de passe */}
                        <Controller
                            control={control}
                            name="confirmPassword"
                            rules={{
                                required: 'La confirmation est obligatoire',
                                validate: value =>
                                    value === password || 'Les mots de passe ne correspondent pas',
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Confirmer le mot de passe"
                                    placeholder="••••••••"
                                    iconLeft={ICONS.password}
                                    isPassword
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    error={errors.confirmPassword?.message}
                                    required
                                />
                            )}
                        />

                        {/* Bouton Register */}
                        <Button
                            label="Créer mon compte"
                            onPress={handleSubmit(onSubmit)}
                            isLoading={isLoading}
                            iconLeft={ICONS.register}
                            style={styles.registerButton}
                        />

                        {/* Lien Login */}
                        <View style={styles.loginRow}>
                            <Text style={styles.loginText}>Déjà un compte ? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.loginLink}>Se connecter</Text>
                            </TouchableOpacity>
                        </View>

                    </Card>
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
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONTS.xxlarge,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: SPACING.sm,
    },
    subtitle: {
        fontSize: FONTS.regular,
        color: COLORS.textLight,
        marginTop: SPACING.xs,
    },
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
    registerButton: {
        marginTop: SPACING.sm,
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.md,
    },
    loginText: {
        color: COLORS.textLight,
        fontSize: FONTS.medium,
    },
    loginLink: {
        color: COLORS.primary,
        fontSize: FONTS.medium,
        fontWeight: '700',
    },
});