import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AboutScreen from '../screens/profile/AboutScreen';

export type ProfileStackParamList = {
    ProfileMain: undefined;
    About: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
    );
}