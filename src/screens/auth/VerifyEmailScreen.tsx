import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, ICONS } from '../../constants';
import { AuthStackParamList } from '../../types';
import { Button, Card, Icon, ScreenWrapper, showToast } from '../../components/ui';
import { haptics } from '../../utils';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services';

// -----------------------------------------------
// Types de navigation
// -----------------------------------------------
type VerifyEmailNavigationProp = StackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type VerifyEmailRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

interface Props {
    navigation: VerifyEmailNavigationProp;
    route: VerifyEmailRouteProp;
}

// -----------------------------------------------
// Composant VerifyEmailScreen
// -----------------------------------------------
export default function VerifyEmailScreen({ navigation, route }: Props) {
    const { email } = route.params;
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const { updateUser } = useAuth();
    const [isChecking, setIsChecking] = useState(false);

    const handleCheckVerification = async () => {
        haptics.medium();
        setIsChecking(true);
        try {
            // Récupère les dernières infos utilisateur
            const response = await authService.me();
            if (response.data.emailVerified) {
                await updateUser(response.data);
                haptics.success();
                showToast.success(
                    'Email vérifié !',
                    'Bienvenue sur PlantCare !'
                );
                // RootNavigator redirigera automatiquement vers Main
            } else {
                haptics.warning();
                showToast.warning(
                    'Email non vérifié',
                    'Vérifiez votre boîte mail et cliquez sur le lien.'
                );
            }
        } catch {
            haptics.error();
            showToast.error('Erreur', 'Impossible de vérifier le statut.');
        } finally {
            setIsChecking(false);
        }
    };

    // Renvoie l'email de vérification
    const handleResend = async () => {
        if (resendCooldown > 0) return;
        haptics.medium();
        setIsResending(true);
        try {
            await authService.requestEmailVerification();
            showToast.success(
                'Email renvoyé !',
                `Un nouvel email a été envoyé à ${email}`
            );
            // Cooldown de 60 secondes
            setResendCooldown(60);
            const interval = setInterval(() => {
                setResendCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            showToast.error('Erreur', "Impossible d'envoyer l'email.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <ScreenWrapper withTabBar={false}>
            <View style={styles.container}>

                {/* Illustration */}
                <View style={styles.illustration}>
                    <View style={styles.illustrationOuter}>
                        <View style={styles.illustrationInner}>
                            <Icon name="email-check-outline" size={56} color={COLORS.primary} />
                        </View>
                    </View>
                    {/* Cercles décoratifs */}
                    <View style={styles.decorDot1} />
                    <View style={styles.decorDot2} />
                    <View style={styles.decorDot3} />
                </View>

                {/* Texte */}
                <Text style={styles.title}>Vérifiez votre email</Text>
                <Text style={styles.subtitle}>
                    Un email de vérification a été envoyé à
                </Text>
                <Text style={styles.email}>{email}</Text>
                <Text style={styles.description}>
                    Cliquez sur le lien dans l'email pour activer votre compte.
                    Vérifiez aussi vos spams.
                </Text>

                {/* Card actions */}
                <Card style={styles.card}>

                    {/* Étapes */}
                    <View style={styles.steps}>
                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <Text style={styles.stepText}>Ouvrez votre boîte mail</Text>
                        </View>
                        <View style={styles.stepDivider} />
                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <Text style={styles.stepText}>Trouvez l'email de PlantCare</Text>
                        </View>
                        <View style={styles.stepDivider} />
                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <Text style={styles.stepText}>Cliquez sur le lien de vérification</Text>
                        </View>
                    </View>

                    <Button
                        label="J'ai vérifié mon email"
                        onPress={handleCheckVerification}
                        isLoading={isChecking}
                        iconLeft="check-circle-outline"
                        style={styles.checkButton}
                    />

                    {/* Bouton renvoyer */}
                    <Button
                        label={
                            resendCooldown > 0
                                ? `Renvoyer dans ${resendCooldown}s`
                                : "Renvoyer l'email"
                        }
                        onPress={handleResend}
                        isLoading={isResending}
                        disabled={resendCooldown > 0}
                        variant="outline"
                        iconLeft="email-sync-outline"
                        style={styles.resendButton}
                    />

                </Card>

                {/* Lien retour login */}
                <TouchableOpacity
                    style={styles.backToLogin}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Icon name={ICONS.back} size={16} color={COLORS.textLight} />
                    <Text style={styles.backToLoginText}>Retour à la connexion</Text>
                </TouchableOpacity>

            </View>
        </ScreenWrapper>
    );
}

// -----------------------------------------------
// Styles
// -----------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Illustration
    illustration: {
        position: 'relative',
        marginBottom: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustrationOuter: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    illustrationInner: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#B7E4C7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    decorDot1: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.secondary,
        top: 8,
        right: 8,
    },
    decorDot2: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        bottom: 12,
        left: 12,
    },
    decorDot3: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.accent,
        top: 20,
        left: 0,
    },

    // Texte
    title: {
        fontSize: FONTS.xxlarge,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: FONTS.regular,
        color: COLORS.textLight,
        textAlign: 'center',
    },
    email: {
        fontSize: FONTS.regular,
        fontWeight: '700',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: FONTS.medium,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.md,
    },

    // Card
    card: {
        width: '100%',
        marginBottom: SPACING.lg,
    },

    // Steps
    steps: {
        marginBottom: SPACING.lg,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        fontSize: FONTS.small,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    stepText: {
        fontSize: FONTS.regular,
        color: COLORS.text,
        fontWeight: '500',
    },
    stepDivider: {
        width: 2,
        height: 16,
        backgroundColor: COLORS.border,
        marginLeft: 13,
    },
    resendButton: {
        marginTop: SPACING.xs,
    },

    // Retour login
    backToLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        padding: SPACING.sm,
    },
    backToLoginText: {
        fontSize: FONTS.medium,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    checkButton: {
        marginTop: SPACING.sm,
    },
});