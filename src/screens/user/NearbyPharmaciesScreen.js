import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import PharmacyCard from '../../components/PharmacyCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { fetchNearbyPharmacies } from '../../redux/slices/pharmacySlice';

const NearbyPharmaciesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { nearbyPharmacies, isLoading, error } = useSelector((state) => state.pharmacy);

  useEffect(() => {
    // In a real app, logic would go here to fetch based on GPS coordinates.
    dispatch(fetchNearbyPharmacies({ lat: 0, lng: 0, maxDistance: 10 }));
  }, [dispatch]);

  const handlePharmacyPress = (id) => {
    navigation.navigate('PharmacyDetails', { pharmacyId: id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nearby Pharmacies</Text>
        </View>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={nearbyPharmacies}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <PharmacyCard
                name={item.name}
                location={item.address}
                distance={`${item.distance} km`}
                phone={item.phone}
                onPress={() => handlePharmacyPress(item.id)}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                title="No Pharmacies Nearby"
                message="We couldn't find any pharmacies in your immediate area."
                iconName="location-outline"
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
  },
  listContent: {
    padding: spacing.m,
    flexGrow: 1,
  },
});

export default NearbyPharmaciesScreen;
