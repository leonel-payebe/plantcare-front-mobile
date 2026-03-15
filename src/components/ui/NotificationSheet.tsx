import React, { useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { COLORS, FONTS, SPACING, ICONS } from '../../constants';
import Icon from './Icon';
import Badge from './Badge';
import { useNotificationStore, LocalNotification } from '../../hooks/useNotificationStore';
import { haptics } from '../../utils';

// -----------------------------------------------
// Helpers
// -----------------------------------------------
function formatRelativeDate(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
}

function getNotifStyle(type: string): {
    iconName: string;
    iconColor: string;
    backgroundColor: string;
    badgeVariant: 'danger' | 'warning' | 'info' | 'success' | 'neutral';
} {
    switch (type) {
        case 'danger':
            return {
                iconName: ICONS.overdue,
                iconColor: COLORS.error,
                backgroundColor: '#FDECEA',
                badgeVariant: 'danger',
            };
        case 'warning':
            return {
                iconName: ICONS.dueSoon,
                iconColor: '#D97706',
                backgroundColor: '#FFF8E7',
                badgeVariant: 'warning',
            };
        default:
            return {
                iconName: ICONS.info,
                iconColor: '#0369A1',
                backgroundColor: '#E0F2FE',
                badgeVariant: 'info',
            };
    }
}

// -----------------------------------------------
// Composant NotificationItem
// -----------------------------------------------
interface NotificationItemProps {
    notification: LocalNotification;
    onPress: (id: string) => void;
}

function NotificationItem({ notification, onPress }: NotificationItemProps) {
    const notifStyle = getNotifStyle(notification.type);

    return (
        <TouchableOpacity
            style={[styles.notifItem, !notification.read && styles.notifItemUnread]}
            onPress={() => onPress(notification.id)}
            activeOpacity={0.7}
        >
            {/* Icône */}
            <View style={[styles.notifIcon, { backgroundColor: notifStyle.backgroundColor }]}>
                <Icon name={notifStyle.iconName} size={20} color={notifStyle.iconColor} />
            </View>

            {/* Contenu */}
            <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                    <Text style={[styles.notifTitle, !notification.read && styles.notifTitleUnread]}>
                        {notification.title}
                    </Text>
                    <Text style={styles.notifDate}>
                        {formatRelativeDate(notification.date)}
                    </Text>
                </View>
                <Text style={styles.notifBody} numberOfLines={2}>
                    {notification.body}
                </Text>
                <Badge
                    label={notification.plantName}
                    variant="neutral"
                    style={styles.notifBadge}
                />
            </View>

            {/* Point non lu */}
            {!notification.read && <View style={styles.unreadDot} />}

        </TouchableOpacity>
    );
}

// -----------------------------------------------
// Composant NotificationSheet
// -----------------------------------------------
interface NotificationSheetProps {
    bottomSheetRef: React.RefObject<BottomSheet>;
}

export default function NotificationSheet({ bottomSheetRef }: NotificationSheetProps) {
    const snapPoints = useMemo(() => ['50%', '85%'], []);
    // Après
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

    const handleNotifPress = (id: string) => {
        haptics.selection();
        markAsRead(id);
    };

    const handleMarkAllRead = () => {
        haptics.light();
        markAllAsRead();
    };

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={styles.handleIndicator}
            backgroundStyle={styles.sheetBackground}
        >
            <BottomSheetView style={styles.sheetContent}>

                {/* Header */}
                <View style={styles.sheetHeader}>
                    <View style={styles.sheetTitleRow}>
                        <Text style={styles.sheetTitle}>Notifications</Text>
                        {unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                    {unreadCount > 0 && (
                        <TouchableOpacity onPress={handleMarkAllRead}>
                            <Text style={styles.markAllRead}>Tout marquer comme lu</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Liste */}
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <NotificationItem
                            notification={item}
                            onPress={handleNotifPress}
                        />
                    )}
                    ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name={ICONS.notification} size={48} color={COLORS.border} />
                            <Text style={styles.emptyText}>Aucune notification</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />

            </BottomSheetView>
        </BottomSheet>
    );
}

// -----------------------------------------------
// Styles
// -----------------------------------------------
const styles = StyleSheet.create({
    // Sheet
    sheetBackground: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handleIndicator: {
        backgroundColor: COLORS.border,
        width: 40,
        height: 4,
    },
    sheetContent: {
        flex: 1,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    sheetTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    sheetTitle: {
        fontSize: FONTS.xlarge,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    unreadBadge: {
        backgroundColor: COLORS.error,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadBadgeText: {
        fontSize: FONTS.small,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    markAllRead: {
        fontSize: FONTS.small,
        color: COLORS.primary,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
    },

    // List
    listContent: {
        paddingBottom: SPACING.xl,
    },

    // Notification item
    notifItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        gap: SPACING.md,
        position: 'relative',
    },
    notifItemUnread: {
        backgroundColor: '#F8FBF9',
    },
    notifIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifContent: {
        flex: 1,
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: FONTS.medium,
        fontWeight: '500',
        color: COLORS.textLight,
        flex: 1,
    },
    notifTitleUnread: {
        fontWeight: '700',
        color: COLORS.text,
    },
    notifDate: {
        fontSize: FONTS.small,
        color: COLORS.textLight,
        marginLeft: SPACING.sm,
    },
    notifBody: {
        fontSize: FONTS.small,
        color: COLORS.textLight,
        lineHeight: 18,
        marginBottom: SPACING.xs,
    },
    notifBadge: {
        marginTop: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginTop: 4,
    },
    itemSeparator: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.lg,
    },

    // Empty
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xl,
        gap: SPACING.md,
    },
    emptyText: {
        fontSize: FONTS.regular,
        color: COLORS.textLight,
    },
});