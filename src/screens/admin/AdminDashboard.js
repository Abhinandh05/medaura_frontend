import React, { useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { signOut } from '../../redux/slices/authSlice';
import { fetchAdminStats } from '../../redux/slices/adminSlice';

const AdminDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, isLoading } = useSelector((state) => state.admin);

  const loadStats = useCallback(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(num);
  };

  const systemStats = [
    { label: 'Total Users', value: formatNumber(stats.totalUsers), icon: 'people', color: '#E0E7FF' },
    { label: 'Pharmacies', value: formatNumber(stats.totalPharmacies), icon: 'business', color: '#E6F4F1' },
    { label: 'Orders', value: formatNumber(stats.totalOrders), icon: 'cart', color: '#FEF3C7' },
  ];

  const handleLogout = () => {
    dispatch(signOut());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadStats} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>System Administrator</Text>
            <Text style={styles.adminName}>{user?.name || 'Admin User'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.red} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          {systemStats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: stat.color }]}>
              <Ionicons name={stat.icon} size={24} color={colors.text} style={styles.statIcon} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.managementContainer}>
            <TouchableOpacity 
              style={styles.manageCard} 
              onPress={() => navigation.navigate('ManageUsers')}
            >
              <View style={[styles.manageIconContainer, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="person" size={24} color={colors.text} />
              </View>
              <View style={styles.manageTextContainer}>
                <Text style={styles.manageTitle}>Manage Users</Text>
                <Text style={styles.manageSubtitle}>View, ban, or edit user accounts</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.manageCard} 
              onPress={() => navigation.navigate('ManagePharmacies')}
            >
              <View style={[styles.manageIconContainer, { backgroundColor: '#E6F4F1' }]}>
                <Image 
                  source={require('../../../assets/images/icon.png')} 
                  style={styles.manageLogoIcon} 
                  resizeMode="contain"
                />
              </View>
              <View style={styles.manageTextContainer}>
                <Text style={styles.manageTitle}>Manage Pharmacies</Text>
                <Text style={styles.manageSubtitle}>Approve or remove pharmacy listings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.manageCard} 
              onPress={() => navigation.navigate('SystemAnalytics')}
            >
              <View style={[styles.manageIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="bar-chart" size={24} color="#D97706" />
              </View>
              <View style={styles.manageTextContainer}>
                <Text style={styles.manageTitle}>System Analytics</Text>
                <Text style={styles.manageSubtitle}>Search trends and usage reports</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Text style={styles.healthTitle}>API Server Status</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Online</Text>
              </View>
            </View>
            <Text style={styles.healthDetail}>Latency: 45ms | Uptime: 99.9%</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  welcomeText: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  adminName: {
    ...typography.h2,
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.l,
  },
  statCard: {
    width: '31%',
    padding: spacing.m,
    borderRadius: spacing.m,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textLight,
  },
  section: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.l,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.m,
  },
  managementContainer: {
    gap: spacing.s,
  },
  manageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manageIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
    overflow: 'hidden',
  },
  manageLogoIcon: {
    width: '60%',
    height: '60%',
  },
  manageTextContainer: {
    flex: 1,
  },
  manageTitle: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  manageSubtitle: {
    ...typography.caption,
    color: colors.textLight,
  },
  healthCard: {
    backgroundColor: colors.cardBg,
    padding: spacing.m,
    borderRadius: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  healthTitle: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEF7EC',
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: spacing.xl,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#31C48D',
    marginRight: 4,
  },
  statusText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: '#03543F',
  },
  healthDetail: {
    ...typography.caption,
    color: colors.textLight,
  },
});

export default AdminDashboard;
