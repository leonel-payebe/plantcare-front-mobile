import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, FONTS, SPACING, ICONS } from '../../constants';
import { ChangePasswordRequest } from '../../types';
import Icon from './Icon';
import Input from './Input';
import Button from './Button';


// -----------------------------------------------
// Types
// -----------------------------------------------
interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: ChangePasswordRequest) => Promise<void>;
    isLoading?: boolean;
}

// -----------------------------------------------
// Composant ChangePasswordModal
// -----------------------------------------------
export default function ChangePasswordModal({
    visible,
    onClose,
    onSubmit,
    isLoading = false,
}: ChangePasswordModalProps) {
    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<ChangePasswordRequest>({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        },
    });

    const newPassword = watch('newPassword');

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFormSubmit = async (data: ChangePasswordRequest) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            {/* Backdrop */}
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={handleClose}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.sheet}>

                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.headerIcon}>
                                <Icon name={ICONS.password} size={20} color={COLORS.primary} />
                            </View>
                            <Text style={styles.title}>Changer le mot de passe</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                        >
                            <Icon name={ICONS.close} size={20} color={COLORS.textLight} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >

                        {/* Mot de passe actuel */}
                        <Controller
                            control={control}
                            name="currentPassword"
                            rules={{ required: 'Le mot de passe actuel est obligatoire' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Mot de passe actuel"
                                    placeholder="••••••••"
                                    iconLeft={ICONS.password}
                                    isPassword
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    error={errors.currentPassword?.message}
                                    required
                                />
                            )}
                        />

                        {/* Nouveau mot de passe */}
                        <Controller
                            control={control}
                            name="newPassword"
                            rules={{
                                required: 'Le nouveau mot de passe est obligatoire',
                                minLength: {
                                    value: 6,
                                    message: 'Le mot de passe doit contenir au moins 6 caractères',
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Nouveau mot de passe"
                                    placeholder="••••••••"
                                    iconLeft={ICONS.password}
                                    isPassword
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    error={errors.newPassword?.message}
                                    hint="Minimum 6 caractères"
                                    required
                                />
                            )}
                        />

                        {/* Confirmation */}
                        <Controller
                            control={control}
                            name="confirmNewPassword"
                            rules={{
                                required: 'La confirmation est obligatoire',
                                validate: value =>
                                    value === newPassword || 'Les mots de passe ne correspondent pas',
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Confirmer le nouveau mot de passe"
                                    placeholder="••••••••"
                                    iconLeft={ICONS.password}
                                    isPassword
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    error={errors.confirmNewPassword?.message}
                                    required
                                />
                            )}
                        />

                        {/* Boutons */}
                        <Button
                            label="Modifier le mot de passe"
                            onPress={handleSubmit(handleFormSubmit)}
                            isLoading={isLoading}
                            iconLeft={ICONS.save}
                            style={styles.submitButton}
                        />
                        <Button
                            label="Annuler"
                            onPress={handleClose}
                            variant="outline"
                            iconLeft={ICONS.cancel}
                            disabled={isLoading}
                        />

                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// -----------------------------------------------
// Styles
// -----------------------------------------------
const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.border,
        alignSelf: 'center',
        marginTop: SPACING.sm,
        marginBottom: SPACING.xs,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    headerIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: FONTS.large,
        fontWeight: '700',
        color: COLORS.text,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: SPACING.lg,
        gap: SPACING.xs,
    },
    submitButton: {
        marginTop: SPACING.sm,
        marginBottom: SPACING.sm,
    },
});