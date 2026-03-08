import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchAllPharmacies, deletePharmacyAdmin } from '../../redux/slices/adminSlice';

const ManagePharmaciesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { pharmacies, isLoading } = useSelector((state) => state.admin);
  const [search, setSearch] = useState('');

  const loadPharmacies = useCallback(() => {
    dispatch(fetchAllPharmacies());
  }, [dispatch]);

  useEffect(() => {
    loadPharmacies();
  }, [loadPharmacies]);

  const filteredPharmacies = pharmacies.filter(p => 
    (p.pharmacyName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.address || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDeletePharmacy = (pharmacy) => {
    Alert.alert(
      'Delete Pharmacy',
      `Are you sure you want to delete "${pharmacy.pharmacyName}"? This will also remove all its medicines.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deletePharmacyAdmin(pharmacy._id)),
        },
      ]
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Pharmacies</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{pharmacies.length}</Text>
          </View>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddPharmacy')}
          >
            <Ionicons name="add" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <SearchBar 
            placeholder="Search pharmacies..." 
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {isLoading && pharmacies.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={filteredPharmacies}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={loadPharmacies} colors={[colors.primary]} />
            }
            renderItem={({ item }) => (
              <View style={styles.pharmacyCard}>
                <View style={styles.pharmaInfo}>
                  <Text style={styles.pharmaName}>{item.pharmacyName}</Text>
                  <Text style={styles.pharmaDetail}>{item.address}</Text>
                  {item.phone && <Text style={styles.pharmaDetail}>Phone: {item.phone}</Text>}
                  <Text style={styles.pharmaJoinDate}>Joined: {formatDate(item.createdAt)}</Text>
                  {item.ownerId && (
                    <View style={styles.ownerBadge}>
                      <Ionicons name="person-outline" size={12} color={colors.primary} />
                      <Text style={styles.ownerText}>
                        {item.ownerId.name || 'Unknown Owner'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => handleDeletePharmacy(item)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.red} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <EmptyState
                title="No Pharmacies"
                message={search ? 'No pharmacies match your search.' : 'No pharmacy listings found.'}
                iconName="business-outline"
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
  headerBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  headerBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: spacing.m,
  },
  listContent: {
    padding: spacing.m,
    flexGrow: 1,
  },
  pharmacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pharmaInfo: {
    flex: 1,
  },
  pharmaName: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  pharmaDetail: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2,
  },
  pharmaJoinDate: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6F4F1',
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: spacing.s,
    gap: 4,
  },
  ownerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
  },
  addBtn: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.s,
  },
  deleteBtn: {
    padding: spacing.s,
    marginLeft: spacing.s,
  },
});

export default ManagePharmaciesScreen;
