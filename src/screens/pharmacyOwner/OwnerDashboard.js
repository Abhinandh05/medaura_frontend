import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography, fonts } from '../../theme/typography';
import { signOut } from '../../redux/slices/authSlice';
import { fetchPharmacyStats as fetchStats } from '../../redux/slices/pharmacySlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - spacing.m * 2 - CARD_GAP) / 2;

const STATUS_COLORS = {
  Placed: { bg: '#EFF6FF', text: '#2563EB' },
  Confirmed: { bg: '#F0FDF4', text: '#16A34A' },
  Packed: { bg: '#FFFBEB', text: '#D97706' },
  'On Way': { bg: '#FFF7ED', text: '#EA580C' },
  Delivered: { bg: '#F0FDF4', text: '#16A34A' },
  Cancelled: { bg: '#FEF2F2', text: '#DC2626' },
};

const OwnerDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, statsLoading } = useSelector((state) => state.pharmacy);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchStats());
    setRefreshing(false);
  }, [dispatch]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    dispatch(signOut());
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `\u20B9${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `\u20B9${(amount / 1000).toFixed(1)}K`;
    return `\u20B9${amount.toFixed(0)}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (statsLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const quickActions = [
    {
      icon: 'list',
      label: 'Manage\nMedicines',
      color: '#4F46E5',
      bg: '#EEF2FF',
      onPress: () => navigation.navigate('ManageMedicines'),
    },
    {
      icon: 'receipt',
      label: 'Manage\nOrders',
      color: '#D97706',
      bg: '#FFFBEB',
      onPress: () => navigation.navigate('PharmacyOrders'),
      badge: stats.pendingOrders > 0 ? stats.pendingOrders : null,
    },
    {
      icon: 'add-circle',
      label: 'Add\nMedicine',
      color: '#059669',
      bg: '#ECFDF5',
      onPress: () => navigation.navigate('AddMedicine'),
    },
    {
      icon: 'business',
      label: 'Pharmacy\nProfile',
      color: '#6B7280',
      bg: '#F3F4F6',
      onPress: () => navigation.navigate('PharmacyProfile'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()} \uD83D\uDC4B</Text>
            <Text style={styles.pharmacyName}>
              {user?.pharmacyName || 'Your Pharmacy'}
            </Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={colors.red} />
          </TouchableOpacity>
        </View>

        {/* Revenue Hero Card */}
        <View style={styles.sectionPadding}>
          <LinearGradient
            colors={['#059669', '#10B981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.revenueCard}
          >
            <View style={styles.revenueRow}>
              <View style={styles.revenueBlock}>
                <Text style={styles.revenueLabel}>Today's Revenue</Text>
                <Text style={styles.revenueValue}>
                  {formatCurrency(stats.todayRevenue)}
                </Text>
                <Text style={styles.revenueSubtext}>
                  {stats.todayOrders} order{stats.todayOrders !== 1 ? 's' : ''} today
                </Text>
              </View>
              <View style={styles.revenueDivider} />
              <View style={styles.revenueBlock}>
                <Text style={styles.revenueLabel}>Total Revenue</Text>
                <Text style={styles.revenueValue}>
                  {formatCurrency(stats.totalRevenue)}
                </Text>
                <Text style={styles.revenueSubtext}>
                  {stats.completedOrders} delivered
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid (2x2) */}
        <View style={styles.sectionPadding}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
              <View style={[styles.statIconWrap, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="cart" size={20} color="#2563EB" />
              </View>
              <Text style={styles.statValue}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#FFFBEB' }]}>
              <View style={[styles.statIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="time" size={20} color="#D97706" />
              </View>
              <Text style={styles.statValue}>{stats.pendingOrders}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
              <View style={[styles.statIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="medkit" size={20} color="#16A34A" />
              </View>
              <Text style={styles.statValue}>{stats.totalMedicines}</Text>
              <Text style={styles.statLabel}>Medicines</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#FEF2F2' }]}>
              <View style={[styles.statIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
              </View>
              <Text style={styles.statValue}>
                {stats.lowStock + stats.outOfStock}
              </Text>
              <Text style={styles.statLabel}>Low / Out</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionPadding}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            {quickActions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickActionItem}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.bg }]}>
                  <Ionicons name={action.icon} size={26} color={action.color} />
                  {action.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{action.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.sectionPadding}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PharmacyOrders')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {stats.recentOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyText}>No orders yet</Text>
              <Text style={styles.emptySubtext}>
                Orders will appear here once customers start ordering
              </Text>
            </View>
          ) : (
            stats.recentOrders.map((order) => {
              const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.Placed;
              return (
                <TouchableOpacity
                  key={order._id}
                  style={styles.orderCard}
                  onPress={() => navigation.navigate('PharmacyOrders')}
                  activeOpacity={0.7}
                >
                  <View style={styles.orderTop}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderCustomer}>
                        {order.customerName}
                      </Text>
                      <Text style={styles.orderMeta}>
                        {order.itemCount} item{order.itemCount !== 1 ? 's' : ''} •{' '}
                        {getTimeAgo(order.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.orderRight}>
                      <Text style={styles.orderAmount}>
                        \u20B9{order.totalAmount.toFixed(0)}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusColor.bg },
                        ]}
                      >
                        <Text
                          style={[styles.statusText, { color: statusColor.text }]}
                        >
                          {order.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Activity Feed */}
        <View style={[styles.sectionPadding, { marginBottom: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {stats.activity.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="pulse-outline"
                size={36}
                color={colors.textMuted}
              />
              <Text style={styles.emptyText}>No recent activity</Text>
            </View>
          ) : (
            stats.activity.map((item, idx) => (
              <View key={idx} style={styles.activityRow}>
                <View
                  style={[
                    styles.activityDot,
                    {
                      backgroundColor:
                        item.type === 'order' ? '#2563EB' : colors.primary,
                    },
                  ]}
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{item.text}</Text>
                  <Text style={styles.activityTime}>
                    {getTimeAgo(item.time)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginTop: spacing.s,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginBottom: 2,
  },
  pharmacyName: {
    ...typography.h1,
    color: colors.text,
  },
  dateText: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },

  /* Sections */
  sectionPadding: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.s,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  seeAllText: {
    ...typography.caption,
    color: colors.primary,
  },

  /* Revenue Card */
  revenueCard: {
    borderRadius: 20,
    padding: spacing.l,
    elevation: 4,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  revenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  revenueBlock: {
    flex: 1,
    alignItems: 'center',
  },
  revenueDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  revenueLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 26,
    fontFamily: fonts.extraBold,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  revenueSubtext: {
    ...typography.captionSmall,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },
  statCard: {
    width: CARD_WIDTH,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: colors.text,
    letterSpacing: -0.3,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2,
  },

  /* Quick Actions */
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
    width: (width - spacing.m * 2 - 36) / 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  quickActionLabel: {
    ...typography.captionSmall,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 14,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...typography.label,
    color: '#FFFFFF',
  },

  /* Order Cards */
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
    marginRight: spacing.s,
  },
  orderCustomer: {
    ...typography.body,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  orderMeta: {
    ...typography.captionSmall,
    color: colors.textLight,
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    ...typography.label,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Activity */
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: spacing.s,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  activityTime: {
    ...typography.captionSmall,
    color: colors.textLight,
    marginTop: 1,
  },

  /* Empty States */
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.l,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyText: {
    ...typography.body,
    fontFamily: fonts.bold,
    color: colors.textLight,
    marginTop: spacing.s,
  },
  emptySubtext: {
    ...typography.captionSmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default OwnerDashboard;
