import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNearbyPharmacies } from '../../redux/slices/pharmacySlice';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

const MapScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { nearbyPharmacies } = useSelector((state) => state.pharmacy);
  const dispatch = useDispatch();
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Fallback to a default location (e.g., Bangalore)
        setUserLocation({ latitude: 12.9716, longitude: 77.5946 });
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
      
      // Fetch nearby pharmacies
      dispatch(fetchNearbyPharmacies({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        maxDistance: 10
      }));
      
      setLoading(false);
    })();
  }, [dispatch]);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .custom-popup .leaflet-popup-content-wrapper {
            background: #fff;
            color: #333;
            border-radius: 12px;
            padding: 5px;
          }
          .custom-popup .leaflet-popup-tip {
            background: #fff;
          }
          .pharmacy-name {
            font-weight: bold;
            font-family: sans-serif;
            margin-bottom: 5px;
            font-size: 14px;
          }
          .view-btn {
            background: #2D31A6;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            width: 100%;
            font-size: 12px;
            margin-top: 5px;
          }
          .status-dot {
            height: 10px;
            width: 10px;
            background-color: #10B981;
            border-radius: 50%;
            display: inline-block;
            margin-right: 5px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([${userLocation?.latitude || 12.9716}, ${userLocation?.longitude || 77.5946}], 15);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // User marker
          L.circleMarker([${userLocation?.latitude || 12.9716}, ${userLocation?.longitude || 77.5946}], {
            radius: 8,
            fillColor: "#4285F4",
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(map).bindPopup("You are here");

          const pharmacies = ${JSON.stringify(nearbyPharmacies)};
          
          pharmacies.forEach(p => {
            if (p.location && p.location.coordinates) {
              const [lng, lat] = p.location.coordinates;
              const marker = L.marker([lat, lng]).addTo(map);
              
              const popupContent = \`
                <div class="custom-popup">
                  <div class="pharmacy-name"><span class="status-dot"></span>\${p.pharmacyName}</div>
                  <div style="font-size: 12px; color: #666;">\${p.address}</div>
                  <button class="view-btn" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type: 'VIEW_PHARMACY', id: '\${p._id}'}))">
                    View Details
                  </button>
                </div>
              \`;
              
              marker.bindPopup(popupContent);
            }
          });

          // Function to center map
          window.centerMap = (lat, lng) => {
            map.setView([lat, lng], 15);
          };
        </script>
      </body>
    </html>
  `;

  const onMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'VIEW_PHARMACY') {
      navigation.navigate('PharmacyDetails', { pharmacyId: data.id });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.map}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      
      <TouchableOpacity 
        style={[styles.myLocationBtn, { backgroundColor: colors.background }]}
        onPress={() => {
          if (userLocation) {
            webViewRef.current.injectJavaScript(`window.centerMap(${userLocation.latitude}, ${userLocation.longitude})`);
          }
        }}
      >
        <Ionicons name="locate" size={24} color={colors.accent} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Nearby Pharmacies</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    textAlign: 'center',
  },
  myLocationBtn: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  }
});

export default MapScreen;
