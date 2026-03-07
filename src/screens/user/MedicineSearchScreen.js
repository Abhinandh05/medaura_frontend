import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import SearchBar from '../../components/SearchBar';
import MedicineCard from '../../components/MedicineCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { searchMedicines, clearSearchResults } from '../../redux/slices/medicineSlice';

const MedicineSearchScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const initialQuery = route.params?.query || '';
  const [query, setQuery] = useState(initialQuery);
  const { searchResults, isLoading, error } = useSelector((state) => state.medicine);

  useEffect(() => {
    if (initialQuery) {
      dispatch(searchMedicines(initialQuery));
    }
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch, initialQuery]);

  const handleSearch = () => {
    Keyboard.dismiss();
    if (query.trim()) {
      dispatch(searchMedicines(query));
    }
  };

  const handleMedicinePress = (item) => {
    navigation.navigate('PharmacyDetails', { pharmacyId: item.pharmacyId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.searchWrapper}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              placeholder="Search medicine name..."
              autoFocus={!initialQuery}
            />
          </View>
        </View>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <MedicineCard
                medicineName={item.name}
                pharmacyName={item.pharmacyName}
                distance={item.distance ? `${item.distance} km` : 'Near you'}
                availabilityStatus={item.isAvailable ? 'Available' : 'Out of Stock'}
                onPressContact={() => console.log('Contact pharmacy')}
              />
            )}
            ListEmptyComponent={
              query ? (
                <EmptyState
                  title="No Medicines Found"
                  message={`We couldn't find any results for "${query}". Try searching for something else.`}
                  iconName="search-outline"
                />
              ) : (
                <EmptyState
                  title="Search Medicines"
                  message="Enter a medicine name to find pharmacies nearby."
                  iconName="medical-outline"
                />
              )
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
  searchWrapper: {
    flex: 1,
  },
  listContent: {
    padding: spacing.m,
    flexGrow: 1,
  },
});

export default MedicineSearchScreen;
