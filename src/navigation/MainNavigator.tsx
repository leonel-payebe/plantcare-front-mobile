import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Animated,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, ICONS } from '../constants';
import { MainTabParamList } from '../types';
import HomeScreen from '../screens/home/HomeScreen';
import PlantStackNavigator from './PlantStackNavigator';
import AddPlantScreen from '../screens/plants/AddPlantScreen';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

// -----------------------------------------------
// Composant TabItem animé
// -----------------------------------------------
interface TabItemProps {
    icon: string;
    label: string;
    isFocused: boolean;
    onPress: () => void;
}

function TabItem({ icon, label, isFocused, onPress }: TabItemProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const translateYAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isFocused) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1.1,
                    damping: 10,
                    stiffness: 200,
                    useNativeDriver: true, // ← tous sur true
                }),
                Animated.spring(translateYAnim, {
                    toValue: -2,
                    damping: 10,
                    stiffness: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    damping: 10,
                    stiffness: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(translateYAnim, {
                    toValue: 0,
                    damping: 10,
                    stiffness: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isFocused]);

    const iconColor = isFocused ? COLORS.primary : '#B0B8C1';
    const labelColor = isFocused ? COLORS.primary : '#B0B8C1';

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
        >
            {/* Indicateur top — style conditionnel sans animation */}
            {isFocused && <View style={styles.activeIndicator} />}

            {/* Icône + fond conditionnel sans animation */}
            <Animated.View
                style={[
                    styles.tabIconContainer,
                    isFocused && styles.tabIconContainerActive, // ← style conditionnel au lieu d'animation
                    {
                        transform: [
                            { scale: scaleAnim },
                            { translateY: translateYAnim }
                        ]
                    },
                ]}
            >
                <MaterialCommunityIcons
                    name={icon as any}
                    size={22}
                    color={iconColor}
                />
            </Animated.View>

            {/* Label */}
            <Text style={[styles.tabLabel, { color: labelColor }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

// -----------------------------------------------
// Tab Bar personnalisée
// -----------------------------------------------
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const iconMap: Record<keyof MainTabParamList, { active: string; inactive: string }> = {
        Home: { active: ICONS.homeActive, inactive: ICONS.home },
        Plants: { active: ICONS.plantsActive, inactive: ICONS.plants },
        AddPlant: { active: ICONS.addPlantActive, inactive: ICONS.addPlant },
        Profile: { active: ICONS.profileActive, inactive: ICONS.profile },
    };

    const labelMap: Record<keyof MainTabParamList, string> = {
        Home: 'Accueil',
        Plants: 'Plantes',
        AddPlant: 'Ajouter',
        Profile: 'Profil',
    };

    return (
        <View style={styles.tabBarWrapper}>

            {/* Ombre externe */}
            <View style={styles.tabBarShadow} />

            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const icon = isFocused
                        ? iconMap[route.name as keyof MainTabParamList].active
                        : iconMap[route.name as keyof MainTabParamList].inactive;
                    const label = labelMap[route.name as keyof MainTabParamList];

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TabItem
                            key={route.key}
                            icon={icon}
                            label={label}
                            isFocused={isFocused}
                            onPress={onPress}
                        />
                    );
                })}
            </View>
        </View>
    );
}

// -----------------------------------------------
// Navigator
// -----------------------------------------------
export default function MainNavigator() {
    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Plants" component={PlantStackNavigator} />
            <Tab.Screen name="AddPlant" component={AddPlantScreen} />
            <Tab.Screen name="Profile" component={ProfileStackNavigator} />
        </Tab.Navigator>
    );
}

// -----------------------------------------------
// Styles
// -----------------------------------------------
const styles = StyleSheet.create({
    tabBarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 1,      // ← plus de padding horizontal
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,  // ← réduit
        paddingTop: SPACING.xs,
        backgroundColor: 'transparent',
    },

    // Ombre externe supplémentaire
    tabBarShadow: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 20 : SPACING.sm,
        left: SPACING.xl,
        right: SPACING.xl,
        height: 60,
        borderRadius: 28,
        backgroundColor: COLORS.white,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 0,
    },

    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 2,
        paddingHorizontal: SPACING.xs,      // ← réduit
        paddingVertical: SPACING.xs,        // ← réduit
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
        elevation: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },

    // Tab item
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        paddingVertical: SPACING.xs,
        position: 'relative',
    },
    tabIconContainer: {
        width: 44,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    activeIndicator: {
        position: 'absolute',
        top: 0,
        width: 24,
        height: 3,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
    },

    addButtonHalo: {
        position: 'absolute',
        top: 2,
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: 'rgba(45,106,79,0.1)',
    },
    tabIconContainerActive: {
        backgroundColor: 'rgba(45,106,79,0.12)',
    },
});