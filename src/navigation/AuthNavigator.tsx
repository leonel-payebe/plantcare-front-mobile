import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
    const { isAuthenticated, isEmailVerified, user } = useAuth();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated && !isEmailVerified ? (
                // Connecté mais non vérifié → VerifyEmail directement
                <Stack.Screen
                    name="VerifyEmail"
                    component={VerifyEmailScreen}
                    initialParams={{ email: user?.email ?? '' }}
                />
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}