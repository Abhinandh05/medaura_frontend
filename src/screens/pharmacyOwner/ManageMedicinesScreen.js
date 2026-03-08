import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography, fonts } from '../../theme/typography';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import { fetchPharmacyMedicines, deleteMedicine, updateMedicine } from '../../redux/slices/medicineSlice';
import { fetchMyPharmacy } from '../../redux/slices/pharmacySlice';

const ManageMedicinesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { myPharmacy } = useSelector((state) => state.pharmacy);
  const { pharmacyMedicines, isLoading } = useSelector((state) => state.medicine);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadMedicines = useCallback(async () => {
    let pharmacy = myPharmacy;
    if (!pharmacy) {
      const res = await dispatch(fetchMyPharmacy()).unwrap();
      pharmacy = res.data;
    }
    if (pharmacy?._id) {
      dispatch(fetchPharmacyMedicines(pharmacy._id));
    }
  }, [dispatch, myPharmacy]);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  // Reload when returning from AddMedicine screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (myPharmacy?._id) {
        dispatch(fetchPharmacyMedicines(myPharmacy._id));
      }
    });
    return unsubscribe;
  }, [navigation, dispatch, myPharmacy]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMedicines();
    setRefreshing(false);
  }, [loadMedicines]);

  const handleDelete = (med) => {
    Alert.alert(
      'Delete Medicine',
      `Are you sure you want to remove "${med.medicineName}" from inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteMedicine(med._id)),
        },
      ]
    );
  };

  const toggleAvailability = (med) => {
    const newQty = med.stockQuantity === 0 ? 1 : 0;
    dispatch(
      updateMedicine({
        id: med._id,
        data: { stockQuantity: newQty },
      })
    );
  };

  const filteredMedicines = pharmacyMedicines.filter((med) =>
    med.medicineName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Medicines</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddMedicine')}>
            <Ionicons name="add" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search your inventory..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredMedicines}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
            renderItem={({ item }) => (
              <View style={styles.medicineCard}>
                <View style={styles.medicineInfo}>
                  <Text style={styles.medicineName}>{item.medicineName}</Text>
                  <Text style={styles.medicineDetails}>
                    \u20B9{item.price} | Stock: {item.stockQuantity}
                    {item.category ? ` | ${item.category}` : ''}
                  </Text>
                  <View
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor:
                          item.availabilityStatus === 'Available'
                            ? '#F0FDF4'
                            : '#FEF2F2',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            item.availabilityStatus === 'Available'
                              ? '#16A34A'
                              : '#DC2626',
                        },
                      ]}
                    >
                      {item.availabilityStatus}
                    </Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => toggleAvailability(item)}
                  >
                    <Ionicons
                      name={item.stockQuantity > 0 ? 'eye' : 'eye-off'}
                      size={20}
                      color={item.stockQuantity > 0 ? colors.primary : colors.textLight}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDelete(item)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.red} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <EmptyState
                title="No Medicines Found"
                message="Your inventory is empty or no results match your search."
                iconName="medical-outline"
              />
            }
          />
        )}
      </View>
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
    justifyContent: 'space-between',
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
    flex: 1,
  },
  searchContainer: {
    padding: spacing.m,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.m,
    flexGrow: 1,
  },
  medicineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    ...typography.body,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  medicineDetails: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2,
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  statusText: {
    ...typography.label,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    marginLeft: spacing.s,
    padding: spacing.s,
  },
});

export default ManageMedicinesScreen;
