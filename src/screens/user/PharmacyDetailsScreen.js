import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Linking,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchPharmacyDetails, clearSelectedPharmacy } from '../../redux/slices/pharmacySlice';
import { addToCart, removeFromCart } from '../../redux/slices/cartSlice';

const PharmacyDetailsScreen = ({ route, navigation }) => {
  const { pharmacyId } = route.params;
  const dispatch = useDispatch();
  const { selectedPharmacy, isLoading } = useSelector((state) => state.pharmacy);
  const cartItems = useSelector(s => s.cart.items);
  const cartIds = cartItems.map(c => c.id || c._id);

  useEffect(() => {
    dispatch(fetchPharmacyDetails(pharmacyId));
    return () => {
      dispatch(clearSelectedPharmacy());
    };
  }, [dispatch, pharmacyId]);

  const handleCall = () => {
    if (selectedPharmacy?.phone) {
      Linking.openURL(`tel:${selectedPharmacy.phone}`);
    }
  };

  const handleGetDirections = () => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${selectedPharmacy?.location?.coordinates[1]},${selectedPharmacy?.location?.coordinates[0]}`;
    const label = selectedPharmacy?.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url);
  };
  
  const toggleCart = (med) => {
    const uniqueId = med._id || med.id;
    if (cartIds.includes(uniqueId)) {
      dispatch(removeFromCart(uniqueId));
    } else {
      dispatch(addToCart({
        ...med,
        id: uniqueId,
        pharmacyId: selectedPharmacy?._id,
        pharmacyName: selectedPharmacy?.name,
      }));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pharmacy Details</Text>
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.logoCircle}>
            <Ionicons name="medical" size={40} color={colors.primary} />
          </View>
          <Text style={styles.name}>{selectedPharmacy?.name}</Text>
          <Text style={styles.address}>{selectedPharmacy?.address}</Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Open Now</Text>
            </View>
            <Text style={styles.distanceText}>{selectedPharmacy?.distance || '0.5 km'} away</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
            <View style={[styles.actionIcon, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="call" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.actionLabel}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleGetDirections}>
            <View style={[styles.actionIcon, { backgroundColor: '#E6F4F1' }]}>
              <Ionicons name="navigate" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Directions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="share-social" size={24} color={colors.text} />
            </View>
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Medicines</Text>
          {selectedPharmacy?.medicines && selectedPharmacy.medicines.length > 0 ? (
            selectedPharmacy.medicines.map((med, index) => (
              <View key={index} style={styles.medicineItem}>
                <View style={styles.medicineInfo}>
                  <Text style={styles.medicineName}>{med.name}</Text>
                  <Text style={styles.medicineCategory}>{med.category || 'General'}</Text>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>₹{med.price || '0.00'}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.addBtn,
                    cartIds.includes(med._id || med.id) ? styles.addBtnActive : styles.addBtnInactive
                  ]}
                  onPress={() => toggleCart(med)}
                >
                  <Ionicons 
                    name={cartIds.includes(med._id || med.id) ? "remove" : "add"} 
                    size={20} 
                    color={cartIds.includes(med._id || med.id) ? colors.white : colors.primary} 
                  />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No medicine data available for this pharmacy.</Text>
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
    alignItems: 'center',
    padding: spacing.m,
  },
  backButton: {
    marginRight: spacing.m,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  mainInfo: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.cardBg,
    marginHorizontal: spacing.m,
    borderRadius: spacing.l,
    marginBottom: spacing.l,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  name: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  address: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: spacing.s,
    marginRight: spacing.s,
  },
  statusText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  distanceText: {
    ...typography.caption,
    color: colors.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.l,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  section: {
    padding: spacing.m,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.m,
  },
  medicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  medicineName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  medicineCategory: {
    ...typography.caption,
    color: colors.textLight,
  },
  priceTag: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: spacing.s,
  },
  priceText: {
    ...typography.bodySmall,
    fontWeight: 'bold',
    color: colors.primary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  addBtnInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
  },
  addBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  }
});

export default PharmacyDetailsScreen;
