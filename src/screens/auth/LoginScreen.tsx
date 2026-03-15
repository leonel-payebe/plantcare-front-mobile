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
import { AuthStackParamList, LoginRequest } from '../../types';
import { Button, Input, Card, Icon, ScreenWrapper } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services';
import { ApiError } from '../../utils';
import { haptics } from '../../utils';
import { showToast } from '../../components/ui';

// -----------------------------------------------
// Types de navigation
// -----------------------------------------------
type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

// -----------------------------------------------
// Composant LoginScreen
// -----------------------------------------------
export default function LoginScreen({ navigation }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const { login } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>({
        defaultValues: { email: '', password: '' },
    });

    // Soumission du formulaire
    const onSubmit = async (data: LoginRequest) => {
        setAuthError(null);
        setIsLoading(true);
        haptics.medium();
        try {
            // Appel API réel
            const response = await authService.login(data);
            await login(response.data);
            haptics.success();
            // Navigation automatique via RootNavigator
        } catch (error) {
            haptics.error();
            if (error instanceof ApiError) {
                if (error.status === 401) {
                    setAuthError('Email ou mot de passe incorrect.');
                } else if (error.status === 400) {
                    setAuthError('Veuillez vérifier les informations saisies.');
                } else {
                    setAuthError('Une erreur est survenue. Réessayez.');
                }
            } else {
                setAuthError('Impossible de se connecter. Vérifiez votre connexion.');
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
                        <Icon name={ICONS.plant} size={72} color={COLORS.primary} />
                        <Text style={styles.title}>PlantCare</Text>
                        <Text style={styles.subtitle}>Prenez soin de vos plantes</Text>
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
                            rules={{ required: 'Le mot de passe est obligatoire' }}
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
                                    required
                                />
                            )}
                        />

                        {/* Bouton Login */}
                        <Button
                            label="Se connecter"
                            onPress={handleSubmit(onSubmit)}
                            isLoading={isLoading}
                            iconLeft={ICONS.login}
                            style={styles.loginButton}
                        />

                        {/* Lien Register */}
                        <View style={styles.registerRow}>
                            <Text style={styles.registerText}>Pas encore de compte ? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerLink}>S'inscrire</Text>
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
    loginButton: {
        marginTop: SPACING.sm,
    },
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.md,
    },
    registerText: {
        color: COLORS.textLight,
        fontSize: FONTS.medium,
    },
    registerLink: {
        color: COLORS.primary,
        fontSize: FONTS.medium,
        fontWeight: '700',
    },
});