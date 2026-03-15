import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { LoadingSpinner } from '../components/ui';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const { isAuthenticated, isEmailVerified, isLoading, user } = useAuth();

    if (isLoading) {
        return <LoadingSpinner fullScreen message="Chargement..." />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated && !isEmailVerified ? (
                    // Connecté mais email non vérifié → reste sur Auth
                    // AuthNavigator gérera la navigation vers VerifyEmail
                    <Stack.Screen
                        name="Auth"
                        component={AuthNavigator}
                    />
                ) : isAuthenticated && isEmailVerified ? (
                    <Stack.Screen name="Main" component={MainNavigator} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}