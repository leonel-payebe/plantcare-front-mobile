import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { AuthProvider } from './src/hooks/useAuth';
import { useWebSocket } from './src/hooks/useWebSocket';
import { NotificationStoreProvider, useNotificationStore } from './src/hooks/useNotificationStore';
import RootNavigator from './src/navigation/RootNavigator';
import { Toast } from './src/components/ui';
import CustomSplashScreen from './src/screens/SplashScreen';
import { useNotifications } from './src/hooks/useNotifications';

SplashScreen.preventAutoHideAsync().then(() => {
  SplashScreen.hideAsync();
});

// -----------------------------------------------
// Composant interne — connecté au store
// -----------------------------------------------
function AppContent() {
  const { addNotification } = useNotificationStore();
  const { requestPermissions } = useNotifications();

  useEffect(() => {
    requestPermissions();
  }, []);

  useWebSocket((message) => {
    addNotification(message);
  });

  return <RootNavigator />;
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    prepare();
  }, []);

  const prepare = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Erreur initialisation:', error);
    } finally {
      setAppIsReady(true);
    }
  };

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
      setTimeout(() => setShowSplash(false), 2500);
    }
  }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          {showSplash ? (
            <CustomSplashScreen />
          ) : (
            <AuthProvider>
              <NotificationStoreProvider>
                <AppContent />
                <Toast />
              </NotificationStoreProvider>
            </AuthProvider>
          )}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}