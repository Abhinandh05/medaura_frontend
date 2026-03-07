import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';

const ManageMedicinesScreen = ({ navigation }) => {
  // Local state for demo, in real app would come from Redux and API
  const [medicines, setMedicines] = useState([
    { id: '1', name: 'Paracetamol', price: '5.00', quantity: '100', isAvailable: true },
    { id: '2', name: 'Amoxicillin', price: '12.50', quantity: '50', isAvailable: true },
    { id: '3', name: 'Ibuprofen', price: '8.00', quantity: '0', isAvailable: false },
    { id: '4', name: 'Cetirizine', price: '4.20', quantity: '200', isAvailable: true },
  ]);
  const [search, setSearch] = useState('');

  const toggleAvailability = (id) => {
    setMedicines(prev => prev.map(med => 
      med.id === id ? { ...med, isAvailable: !med.isAvailable } : med
    ));
  };

  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(search.toLowerCase())
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

        <FlatList
          data={filteredMedicines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.medicineCard}>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>{item.name}</Text>
                <Text style={styles.medicineDetails}>Price: ${item.price} | Stock: {item.quantity}</Text>
              </View>
              <View style={styles.actions}>
                <Switch
                  value={item.isAvailable}
                  onValueChange={() => toggleAvailability(item.id)}
                  trackColor={{ false: '#CBD5E0', true: colors.accent }}
                  thumbColor={item.isAvailable ? colors.primary : '#F7FAFC'}
                />
                <TouchableOpacity style={styles.editBtn}>
                  <Ionicons name="create-outline" size={20} color={colors.textLight} />
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
  listContent: {
    padding: spacing.m,
  },
  medicineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  medicineDetails: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: {
    marginLeft: spacing.m,
    padding: spacing.s,
  },
});

export default ManageMedicinesScreen;
