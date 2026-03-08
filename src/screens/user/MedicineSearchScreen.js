import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import api from '../../services/api';

const MedicineSearchScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchMedicines = async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/medicines/search?name=${query}`);
      setResults(response.data.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchMedicines(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.navigate('PharmacyDetails', { pharmacyId: item.pharmacy._id })}
    >
      <View style={styles.resultInfo}>
        <Text style={[styles.medicineName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.pharmacyName, { color: colors.textMuted }]}>{item.pharmacy.pharmacyName}</Text>
        <Text style={[styles.price, { color: colors.accent }]}>₹{item.price}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for medicines..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            searchQuery ? (
              <View style={styles.center}>
                <Ionicons name="search-outline" size={64} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No medicines found for &quot;{searchQuery}&quot;</Text>
              </View>
            ) : (
              <View style={styles.center}>
                <Ionicons name="medical-outline" size={64} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Start searching for medicines</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  list: {
    padding: 20,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  resultInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  pharmacyName: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginTop: 5,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_500Medium',
  }
});

export default MedicineSearchScreen;
