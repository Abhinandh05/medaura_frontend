import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';

const ManagePharmaciesScreen = ({ navigation }) => {
  const [pharmacies] = useState([
    { id: '1', name: 'City Central Pharmacy', status: 'approved', joined: '2026-01-15' },
    { id: '2', name: 'MediQuick Store', status: 'pending', joined: '2026-03-01' },
    { id: '3', name: 'HealthFirst Pharma', status: 'approved', joined: '2025-12-10' },
  ]);
  const [search, setSearch] = useState('');

  const filteredPharmacies = pharmacies.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Pharmacies</Text>
        </View>

        <View style={styles.searchContainer}>
          <SearchBar 
            placeholder="Search pharmacies..." 
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filteredPharmacies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.pharmacyCard}>
              <View style={styles.pharmaInfo}>
                <Text style={styles.pharmaName}>{item.name}</Text>
                <Text style={styles.pharmaJoinDate}>Joined: {item.joined}</Text>
                <View style={[styles.statusBadge, item.status === 'approved' ? styles.statusApproved : styles.statusPending]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn}>
                   <Ionicons name="create-outline" size={20} color={colors.textLight} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn}>
                   <Ionicons name="trash-outline" size={20} color={colors.red} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              title="No Pharmacies"
              message="No pharmacy listings found."
              iconName="business-outline"
            />
          }
        />
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
  },
  searchContainer: {
    padding: spacing.m,
  },
  listContent: {
    padding: spacing.m,
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
  pharmaJoinDate: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: spacing.s,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: spacing.s,
  },
  statusApproved: {
    backgroundColor: '#DEF7EC',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
  },
  editBtn: {
    padding: spacing.s,
  },
  deleteBtn: {
    padding: spacing.s,
    marginLeft: spacing.s,
  },
});

export default ManagePharmaciesScreen;
