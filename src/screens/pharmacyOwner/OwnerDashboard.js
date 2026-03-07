import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { signOut } from '../../redux/slices/authSlice';
import { fetchPharmacyStats as fetchStats } from '../../redux/slices/pharmacySlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OwnerDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats } = useSelector((state) => state.pharmacy);

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  const dashboardStats = [
    { label: 'Total Medicines', value: stats.totalMedicines.toString(), icon: 'medical', color: '#E6F4F1' },
    { label: 'Low Stock', value: stats.lowStock.toString(), icon: 'alert-circle', color: '#FEE2E2' },
    { label: 'Daily Views', value: stats.dailyViews.toString(), icon: 'eye', color: '#FEF3C7' },
  ];

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    dispatch(signOut());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Manager Dashboard</Text>
            <Text style={styles.pharmacyName}>{user?.pharmacyName || 'Your Pharmacy'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.red} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          {dashboardStats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: stat.color }]}>
              {stat.icon === 'medical' ? (
                <Image 
                  source={require('../../../assets/images/icon.png')} 
                  style={styles.logoStatIcon} 
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name={stat.icon} size={24} color={colors.text} style={styles.statIcon} />
              )}
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('ManageMedicines')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="list" size={28} color="#4F46E5" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Manage Medicines</Text>
                <Text style={styles.actionSubtitle}>Update stock and availability</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('PharmacyOrders')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="receipt" size={28} color="#D97706" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Manage Orders</Text>
                <Text style={styles.actionSubtitle}>View and update order status</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('AddMedicine')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#DEF7EC' }]}>
                <Ionicons name="add-circle" size={28} color={colors.primary} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Add New Medicine</Text>
                <Text style={styles.actionSubtitle}>List a new product</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('PharmacyProfile')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="business" size={28} color={colors.text} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Pharmacy Profile</Text>
                <Text style={styles.actionSubtitle}>Update logo, info, and contact</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {stats.activity.length === 0 ? (
            <View style={styles.activityCard}>
               <Ionicons name="information-circle-outline" size={20} color={colors.textLight} />
               <Text style={styles.activityText}>No recent activity.</Text>
            </View>
          ) : (
            stats.activity.map((item, idx) => (
              <View key={idx} style={styles.activityCard}>
                <Ionicons name="information-circle-outline" size={20} color={colors.textLight} />
                <Text style={styles.activityText}>{item.text}</Text>
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
  pharmacyName: {
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
  logoStatIcon: {
    width: 24,
    height: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
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
  actionsContainer: {
    backgroundColor: colors.white,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  actionSubtitle: {
    ...typography.caption,
    color: colors.textLight,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    padding: spacing.m,
    borderRadius: spacing.s,
    marginBottom: spacing.s,
  },
  activityText: {
    ...typography.bodySmall,
    color: colors.text,
    marginLeft: spacing.s,
    flex: 1,
  },
});

export default OwnerDashboard;
