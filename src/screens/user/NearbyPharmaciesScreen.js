import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import PharmacyCard from '../../components/PharmacyCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { fetchNearbyPharmacies } from '../../redux/slices/pharmacySlice';

// Haversine distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const NearbyPharmaciesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { nearbyPharmacies, isLoading } = useSelector((state) => state.pharmacy);
  const [userCoords, setUserCoords] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  const fetchLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Permission denied. Showing default results.');
        setUserCoords({ lat: 12.9716, lng: 77.5946 });
        dispatch(fetchNearbyPharmacies({ lat: 12.9716, lng: 77.5946, maxDistance: 10 }));
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      setUserCoords({ lat: latitude, lng: longitude });
      dispatch(fetchNearbyPharmacies({ lat: latitude, lng: longitude, maxDistance: 10 }));
    } catch (error) {
      console.error('Location error:', error);
      setUserCoords({ lat: 12.9716, lng: 77.5946 });
      dispatch(fetchNearbyPharmacies({ lat: 12.9716, lng: 77.5946, maxDistance: 10 }));
    } finally {
      setLocationLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handlePharmacyPress = (id) => {
    navigation.navigate('PharmacyDetails', { pharmacyId: id });
  };

  // Compute distance for each pharmacy and sort by distance
  const pharmaciesWithDistance = nearbyPharmacies
    .map((pharmacy) => {
      let distance = null;
      if (
        userCoords &&
        pharmacy.location &&
        pharmacy.location.coordinates &&
        pharmacy.location.coordinates.length === 2
      ) {
        const [lng, lat] = pharmacy.location.coordinates;
        distance = calculateDistance(userCoords.lat, userCoords.lng, lat, lng);
      }
      return { ...pharmacy, distance };
    })
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

  const handleRefresh = () => {
    if (userCoords) {
      dispatch(fetchNearbyPharmacies({ lat: userCoords.lat, lng: userCoords.lng, maxDistance: 10 }));
    } else {
      fetchLocation();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nearby Pharmacies</Text>
          {nearbyPharmacies.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{nearbyPharmacies.length}</Text>
            </View>
          )}
        </View>

        {isLoading || locationLoading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={pharmaciesWithDistance}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
              />
            }
            renderItem={({ item }) => (
              <PharmacyCard
                name={item.pharmacyName}
                location={item.address}
                distance={
                  item.distance !== null
                    ? `${item.distance.toFixed(1)} km`
                    : null
                }
                phone={item.phone}
                onPress={() => handlePharmacyPress(item._id)}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                title="No Pharmacies Nearby"
                message="We couldn't find any pharmacies in your area. Try increasing the search radius."
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
    flex: 1,
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  listContent: {
    padding: spacing.m,
    flexGrow: 1,
  },
});

export default NearbyPharmaciesScreen;
