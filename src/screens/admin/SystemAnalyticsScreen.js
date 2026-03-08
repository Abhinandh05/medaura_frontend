import React, { useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchAnalytics } from '../../redux/slices/adminSlice';

const SystemAnalyticsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { analytics, isLoading } = useSelector((state) => state.admin);

  const loadAnalytics = useCallback(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(num);
  };

  const growthPercent = analytics?.userGrowth?.growthPercent || 0;
  const isPositiveGrowth = growthPercent >= 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Analytics</Text>
      </View>

      {isLoading && !analytics ? (
        <LoadingSpinner />
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadAnalytics} colors={[colors.primary]} />
          }
        >
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartTitle}>Order Summary (Last 30 days)</Text>
            <View style={styles.visualPlaceholder}>
              <Ionicons name="stats-chart" size={80} color={colors.primary} />
              <Text style={styles.placeholderText}>
                {analytics?.recentOrders || 0} orders placed in the last 30 days
              </Text>
            </View>
          </View>

          <View style={styles.reportGrid}>
            <View style={styles.reportItem}>
              <Text style={styles.reportValue}>{formatNumber(analytics?.recentOrders)}</Text>
              <Text style={styles.reportLabel}>Recent Orders</Text>
            </View>
            <View style={styles.reportItem}>
              <Text style={styles.reportValue}>
                {analytics?.totalRevenue ? `₹${formatNumber(analytics.totalRevenue)}` : '₹0'}
              </Text>
              <Text style={styles.reportLabel}>Revenue (30d)</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Medicines (by availability)</Text>
            {analytics?.topMedicines && analytics.topMedicines.length > 0 ? (
              analytics.topMedicines.map((med) => (
                <View key={med.name} style={styles.tableRow}>
                  <Text style={styles.tableName}>{med.rank}. {med.name}</Text>
                  <Text style={styles.tableValue}>
                    {med.pharmacyCount} {med.pharmacyCount === 1 ? 'pharmacy' : 'pharmacies'}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No medicine data available yet.</Text>
            )}
          </View>

          {analytics?.ordersByStatus && Object.keys(analytics.ordersByStatus).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Orders by Status</Text>
              {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                <View key={status} style={styles.tableRow}>
                  <Text style={styles.tableName}>{status}</Text>
                  <Text style={styles.tableValue}>{count}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Growth</Text>
            <View style={[
              styles.visualPlaceholderSmall, 
              { backgroundColor: isPositiveGrowth ? '#DEF7EC' : '#FEE2E2' }
            ]}>
              <Ionicons 
                name={isPositiveGrowth ? 'trending-up' : 'trending-down'} 
                size={40} 
                color={isPositiveGrowth ? colors.primary : '#EF4444'} 
              />
              <View style={styles.growthTextContainer}>
                <Text style={[
                  styles.placeholderTextSmall, 
                  { color: isPositiveGrowth ? colors.primary : '#EF4444' }
                ]}>
                  {isPositiveGrowth ? '+' : ''}{growthPercent}% user growth this month
                </Text>
                <Text style={styles.growthDetail}>
                  {analytics?.userGrowth?.recentUsers || 0} new users (vs {analytics?.userGrowth?.previousUsers || 0} previous month)
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.m,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.m,
  },
  chartPlaceholder: {
    backgroundColor: colors.cardBg,
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartTitle: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  visualPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: spacing.s,
  },
  placeholderText: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  reportGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
  },
  reportItem: {
    width: '48%',
    backgroundColor: colors.primary,
    padding: spacing.m,
    borderRadius: spacing.m,
    alignItems: 'center',
  },
  reportValue: {
    ...typography.h2,
    color: colors.white,
  },
  reportLabel: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.8,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.m,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableName: {
    ...typography.body,
    color: colors.text,
  },
  tableValue: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.primary,
  },
  visualPlaceholderSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: '#DEF7EC',
    borderRadius: spacing.m,
  },
  placeholderTextSmall: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: 'bold',
  },
  noDataText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: spacing.l,
  },
  growthTextContainer: {
    flex: 1,
    marginLeft: spacing.m,
  },
  growthDetail: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2,
  },
});

export default SystemAnalyticsScreen;
