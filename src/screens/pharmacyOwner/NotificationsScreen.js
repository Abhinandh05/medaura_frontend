import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { markAsRead, markAllAsRead, clearNotifications } from '../../redux/slices/notificationSlice';

const NotificationsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER': return 'cart-outline';
      case 'STOCK': return 'warning-outline';
      default: return 'notifications-outline';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationCard, 
        { 
          backgroundColor: item.isRead ? colors.card : colors.accent + '20',
          borderColor: colors.border 
        }
      ]}
      onPress={() => dispatch(markAsRead(item.id))}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
        <Ionicons name={getIcon(item.type)} size={24} color="#fff" />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.message, { color: colors.textMuted }]}>{item.message}</Text>
        <Text style={[styles.time, { color: colors.textMuted }]}>
          {new Date(item.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity onPress={() => dispatch(markAllAsRead())}>
          <Text style={[styles.clearText, { color: colors.accent }]}>Read All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No notifications yet</Text>
          </View>
        }
      />
      
      {notifications.length > 0 && (
        <TouchableOpacity 
          style={styles.clearAllBtn}
          onPress={() => dispatch(clearNotifications())}
        >
          <Text style={{ color: '#ff4444', fontFamily: 'PlusJakartaSans_600SemiBold' }}>Clear All</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  clearText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  list: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  message: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    marginTop: 5,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  clearAllBtn: {
    alignItems: 'center',
    padding: 20,
  }
});

export default NotificationsScreen;
