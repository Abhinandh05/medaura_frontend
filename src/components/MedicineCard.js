import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const MedicineCard = ({ medicineName, pharmacyName, distance, availabilityStatus, onPressContact }) => {
  const isAvailable = availabilityStatus === 'Available';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.medicineName}>{medicineName}</Text>
        <View style={[styles.badge, isAvailable ? styles.badgeAvailable : styles.badgeUnavailable]}>
          <Text style={styles.badgeText}>{availabilityStatus}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons name="business-outline" size={16} color={colors.textLight} />
        <Text style={styles.pharmacyName}>{pharmacyName}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color={colors.textLight} />
        <Text style={styles.distanceText}>{distance} away</Text>
      </View>

      <TouchableOpacity style={styles.contactButton} onPress={onPressContact}>
        <Ionicons name="call-outline" size={16} color={colors.primary} />
        <Text style={styles.contactButtonText}>Contact Pharmacy</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  medicineName: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: spacing.xl,
  },
  badgeAvailable: {
    backgroundColor: '#E6F4F1',
  },
  badgeUnavailable: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  pharmacyName: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  distanceText: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.s,
    paddingVertical: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contactButtonText: {
    ...typography.bodySmall,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
});

export default MedicineCard;
