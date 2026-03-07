import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const SystemAnalyticsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartTitle}>Daily Medicine Searches</Text>
          <View style={styles.visualPlaceholder}>
             {/* This would be a real chart component in a production app */}
             <Ionicons name="stats-chart" size={100} color={colors.accent} />
             <Text style={styles.placeholderText}>Search Volume visualization over last 30 days</Text>
          </View>
        </View>

        <View style={styles.reportGrid}>
          <View style={styles.reportItem}>
             <Text style={styles.reportValue}>8,240</Text>
             <Text style={styles.reportLabel}>Total Searches</Text>
          </View>
          <View style={styles.reportItem}>
             <Text style={styles.reportValue}>94%</Text>
             <Text style={styles.reportLabel}>Success Rate</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Searched Medicines</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableName}>1. Paracetamol</Text>
            <Text style={styles.tableValue}>1,250</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableName}>2. Amoxicillin</Text>
            <Text style={styles.tableValue}>840</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableName}>3. Aspirin</Text>
            <Text style={styles.tableValue}>720</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Growth</Text>
          <View style={styles.visualPlaceholderSmall}>
             <Ionicons name="trending-up" size={40} color={colors.primary} />
             <Text style={styles.placeholderTextSmall}>+15% user growth this month</Text>
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
    marginLeft: spacing.m,
  },
});

export default SystemAnalyticsScreen;
