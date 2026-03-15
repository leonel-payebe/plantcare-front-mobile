import { useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API } from '../constants';
import { NotificationMessage } from '../types';
import { showToast } from '../components/ui';
import { useAuth } from './useAuth';
import { TextEncoder, TextDecoder } from 'text-encoding';
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// -----------------------------------------------
// Hook useWebSocket — STOMP manuel sur React Native
// -----------------------------------------------
export function useWebSocket(
    onNotification?: (message: NotificationMessage) => void
) {
    const { user, isAuthenticated } = useAuth();
    const wsRef = useRef<WebSocket | null>(null);
    const isConnecting = useRef(false);
    const subscriptionId = useRef(`sub-${Date.now()}`);

    // Fonction helper pour envoyer en binaire
    const sendFrame = (ws: WebSocket, frame: string) => {
        const encoder = new TextEncoder();
        ws.send(encoder.encode(frame));
    };

    const handleNotification = useCallback((notification: NotificationMessage) => {
        switch (notification.type) {
            case 'danger':
                showToast.error(notification.title, notification.body);
                break;
            case 'warning':
                showToast.warning(notification.title, notification.body);
                break;
            default:
                showToast.info(notification.title, notification.body);
        }
        onNotification?.(notification);
    }, [onNotification]);

    // -----------------------------------------------
    // Construit un frame STOMP
    // -----------------------------------------------
    const buildStompFrame = (
        command: string,
        headers: Record<string, string> = {},
        body = ''
    ): string => {
        let frame = command + '\n';
        Object.entries(headers).forEach(([key, value]) => {
            frame += `${key}:${value}\n`;
        });
        frame += '\n' + body + '\0'; // une seule ligne vide entre headers et body
        return frame;
    };

    // -----------------------------------------------
    // Parse un frame STOMP reçu
    // -----------------------------------------------
    const parseStompFrame = (data: string): {
        command: string;
        headers: Record<string, string>;
        body: string;
    } => {
        const lines = data.split('\n');
        const command = lines[0].trim();
        const headers: Record<string, string> = {};
        let bodyStart = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') {
                bodyStart = i + 1;
                break;
            }
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                headers[line.substring(0, colonIndex)] = line.substring(colonIndex + 1);
            }
        }

        const body = lines.slice(bodyStart).join('\n').replace(/\0$/, '');
        return { command, headers, body };
    };

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            try {
                if (wsRef.current.readyState === WebSocket.OPEN) {
                    const encoder = new TextEncoder();
                    wsRef.current.send(encoder.encode(buildStompFrame('DISCONNECT')));
                }
                wsRef.current.close();
            } catch { }
            wsRef.current = null;
        }
        isConnecting.current = false;
        console.log('WebSocket déconnecté');
    }, []);

    const connect = useCallback(async () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        if (isConnecting.current) {
            return;
        }

        if (!isAuthenticated || !user) return;

        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) return;

        isConnecting.current = true;

        const wsUrl = API.BASE_URL
            .replace('http://', 'ws://')
            .replace('https://', 'wss://')
            .replace('/api', '/ws-native');

        console.log('Connexion WebSocket:', wsUrl);

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {

            const host = API.BASE_URL.split('//')[1].split(':')[0];

            const connectFrame = buildStompFrame('CONNECT', {
                'accept-version': '1.0,1.1,1.2',
                'host': host,
                'heart-beat': '0,0',
                'Authorization': `Bearer ${token}`,
            });

            sendFrame(ws, connectFrame);
        };

        ws.onmessage = (event) => {

            const data = event.data;
            if (data === '\n' || data === '\r\n') {
                return;
            }

            const frame = parseStompFrame(data);

            switch (frame.command) {
                case 'CONNECTED':
                    console.log('✅ STOMP connecté !');
                    isConnecting.current = false;

                    const subscribeFrame = buildStompFrame('SUBSCRIBE', {
                        id: subscriptionId.current,
                        destination: `/topic/notifications/${user.id}`,
                        ack: 'auto',
                    });
                    sendFrame(ws, subscribeFrame);
                    console.log(`=== Abonné à /topic/notifications/${user.id}`);
                    break;

                case 'MESSAGE':
                    try {
                        const notification: NotificationMessage = JSON.parse(frame.body);
                        handleNotification(notification);
                    } catch (error) {
                        console.error('Erreur parsing notification:', error);
                    }
                    break;

                case 'ERROR':
                    console.error('=== Erreur STOMP:', frame.headers, frame.body);
                    isConnecting.current = false;
                    break;

                default:
            }
        };

        ws.onerror = (error) => {
            console.error('Erreur WebSocket:', error);
            isConnecting.current = false;
        };

        ws.onclose = (event) => {
            isConnecting.current = false;
            wsRef.current = null;

            // Reconnexion automatique après 5s si toujours authentifié
            if (isAuthenticated && user) {
                setTimeout(() => connect(), 5000);
            }
        };

    }, [isAuthenticated, user?.id, handleNotification]);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            connect();
        } else {
            disconnect();
        }

        // Ne déconnecte PAS au cleanup — garde la connexion active
        return () => {
            // Déconnecte seulement si on se déconnecte de l'app
            if (!isAuthenticated) {
                disconnect();
            }
        };
    }, [isAuthenticated, user?.id]);

    return { connect, disconnect };
}