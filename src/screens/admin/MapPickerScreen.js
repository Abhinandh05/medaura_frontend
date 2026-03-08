import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const LEAFLET_HTML = (lat, lng) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; overflow: hidden; }
    #map { height: 100%; width: 100%; }
    .search-box {
      position: absolute; top: 10px; left: 10px; right: 10px; z-index: 1000;
      display: flex; gap: 6px;
    }
    .search-box input {
      flex: 1; padding: 10px 14px; border: 2px solid #1A9E73; border-radius: 10px;
      font-size: 14px; background: white; outline: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .search-box button {
      padding: 10px 14px; background: #1A9E73; color: white; border: none;
      border-radius: 10px; font-weight: bold; font-size: 13px; cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .info-bar {
      position: absolute; bottom: 0; left: 0; right: 0; z-index: 1000;
      background: white; padding: 14px 16px; border-top: 1px solid #E5E7EB;
      display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    }
    .info-bar .coords { font-size: 13px; color: #374151; }
    .info-bar .coords small { color: #9CA3AF; display: block; font-size: 11px; margin-top: 2px; }
    .confirm-btn {
      padding: 10px 20px; background: #1A9E73; color: white; border: none;
      border-radius: 10px; font-weight: bold; font-size: 14px; cursor: pointer;
    }
    .confirm-btn:disabled { background: #9CA3AF; }
  </style>
</head>
<body>
  <div class="search-box">
    <input id="searchInput" type="text" placeholder="Search place..." />
    <button onclick="searchPlace()">Go</button>
  </div>
  <div id="map"></div>
  <div class="info-bar">
    <div class="coords" id="coordsDisplay">
      <small>Tap on map to pick location</small>
    </div>
    <button class="confirm-btn" id="confirmBtn" disabled onclick="confirmLocation()">Confirm</button>
  </div>

  <script>
    var map = L.map('map').setView([${lat}, ${lng}], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    var marker = null;
    var selectedLat = null;
    var selectedLng = null;

    map.on('click', function(e) {
      selectedLat = e.latlng.lat;
      selectedLng = e.latlng.lng;
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng, { draggable: true }).addTo(map);
        marker.on('dragend', function(ev) {
          var pos = ev.target.getLatLng();
          selectedLat = pos.lat;
          selectedLng = pos.lng;
          updateDisplay();
        });
      }
      updateDisplay();
    });

    function updateDisplay() {
      document.getElementById('coordsDisplay').innerHTML =
        selectedLat.toFixed(6) + ', ' + selectedLng.toFixed(6) +
        '<small>Drag pin to adjust</small>';
      document.getElementById('confirmBtn').disabled = false;
    }

    function confirmLocation() {
      if (selectedLat !== null && selectedLng !== null) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'LOCATION_SELECTED',
          latitude: selectedLat,
          longitude: selectedLng
        }));
      }
    }

    function searchPlace() {
      var query = document.getElementById('searchInput').value.trim();
      if (!query) return;
      fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query) + '&limit=1')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.length > 0) {
            var lat = parseFloat(data[0].lat);
            var lon = parseFloat(data[0].lon);
            map.setView([lat, lon], 16);
            selectedLat = lat;
            selectedLng = lon;
            if (marker) {
              marker.setLatLng([lat, lon]);
            } else {
              marker = L.marker([lat, lon], { draggable: true }).addTo(map);
              marker.on('dragend', function(ev) {
                var pos = ev.target.getLatLng();
                selectedLat = pos.lat;
                selectedLng = pos.lng;
                updateDisplay();
              });
            }
            updateDisplay();
          } else {
            alert('Place not found. Try a different search.');
          }
        })
        .catch(function() {
          alert('Search failed. Check your internet connection.');
        });
    }

    document.getElementById('searchInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') searchPlace();
    });
  </script>
</body>
</html>
`;

const MapPickerScreen = ({ navigation, route }) => {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [initialCoords, setInitialCoords] = useState(null);

  // Get starting location: passed coords or device GPS or default (Bangalore)
  useEffect(() => {
    const getInitial = async () => {
      // If coords were passed from the form, use those
      if (route.params?.latitude && route.params?.longitude) {
        setInitialCoords({
          lat: parseFloat(route.params.latitude),
          lng: parseFloat(route.params.longitude),
        });
        return;
      }

      // Otherwise try GPS
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setInitialCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          return;
        }
      } catch (e) {
        console.log('GPS fallback:', e);
      }

      // Default: Bangalore
      setInitialCoords({ lat: 12.9716, lng: 77.5946 });
    };

    getInitial();
  }, [route.params]);

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'LOCATION_SELECTED') {
        // Reverse geocode to get address name
        let locationName = null;
        try {
          const results = await Location.reverseGeocodeAsync({
            latitude: data.latitude,
            longitude: data.longitude,
          });
          if (results.length > 0) {
            const r = results[0];
            const parts = [r.name, r.street, r.city, r.region].filter(Boolean);
            locationName = parts.join(', ');
          }
        } catch (e) {
          // ignore geocode failures
        }

        // Pass back to AddPharmacyScreen
        navigation.navigate('AddPharmacy', {
          pickedLatitude: data.latitude.toFixed(6),
          pickedLongitude: data.longitude.toFixed(6),
          pickedLocationName: locationName,
        });
      }
    } catch (e) {
      // ignore
    }
  };

  if (!initialCoords) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pick Location on Map</Text>
      </View>

      <View style={{ flex: 1 }}>
        {loading && (
          <View style={styles.webviewLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ html: LEAFLET_HTML(initialCoords.lat, initialCoords.lng) }}
          style={{ flex: 1, opacity: loading ? 0 : 1 }}
          onLoadEnd={() => setLoading(false)}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          geolocationEnabled
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    marginRight: spacing.m,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.m,
  },
  loadingText: {
    ...typography.body,
    color: colors.textLight,
  },
  webviewLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    zIndex: 10,
    gap: spacing.m,
  },
});

export default MapPickerScreen;
