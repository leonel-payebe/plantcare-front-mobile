import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlantStackParamList } from '../types';
import PlantListScreen from '../screens/plants/PlantListScreen';

import PlantDetailScreen from '../screens/plants/PlantDetailScreen';
import EditPlantScreen from '../screens/plants/EditPlantScreen';
import WateringHistoryScreen from '../screens/plants/WateringHistoryScreen';

const Stack = createNativeStackNavigator<PlantStackParamList>();

export default function PlantStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PlantList" component={PlantListScreen} />
            <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
            <Stack.Screen name="EditPlant" component={EditPlantScreen} />
            <Stack.Screen name="WateringHistory" component={WateringHistoryScreen} />
        </Stack.Navigator>
    );
}