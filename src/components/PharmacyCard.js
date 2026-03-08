import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const PharmacyCard = ({ name, location, phone, distance, isOnline = true, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/images/icon.png')} 
            style={styles.logoImage} 
            resizeMode="contain"
          />
          {isOnline && <View style={styles.statusDot} />}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color={colors.textLight} />
            <Text style={styles.subText} numberOfLines={1}>{location}</Text>
          </View>
        </View>
        {distance && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{distance}</Text>
          </View>
        )}
      </View>
      
      {phone && (
        <View style={styles.phoneRow}>
          <Ionicons name="call-outline" size={14} color={colors.textLight} />
          <Text style={styles.phoneText}>{phone}</Text>
        </View>
      )}
    </TouchableOpacity>
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
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E6F4F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
    overflow: 'hidden',
  },
  logoImage: {
    width: '70%',
    height: '70%',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981', // Emerald green
    borderWidth: 2,
    borderColor: colors.white,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subText: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: 4,
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  distanceText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.primary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.m,
    paddingTop: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  phoneText: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
});

export default PharmacyCard;
