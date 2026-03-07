import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme/ThemeContext';
import { signOut } from '../../redux/slices/authSlice';
import { fetchUserOrders } from '../../redux/slices/orderSlice';
import * as Location from 'expo-location';

const SETTINGS = [
  { icon: '👤', label: 'Account Details', screen: 'EditProfile' },
  { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
  { icon: '💳', label: 'Payment Methods', screen: 'PaymentMethods' },
  { icon: '📍', label: 'Saved Addresses', screen: 'SavedAddresses' },
  { icon: '🌐', label: 'Language', screen: 'Language' },
  { icon: '❓', label: 'Help & Support', screen: 'HelpSupport' },
  { icon: 'ℹ️', label: 'About Medaura', screen: 'About' },
];

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { userOrders } = useSelector(s => s.orders);
  const s = makeStyles(colors, isDark);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    dispatch(signOut());
  };

  // Toggle switch animation
  const [switchAnim] = React.useState(new Animated.Value(isDark ? 1 : 0));
  const [locationName, setLocationName] = React.useState('Locating...');

  React.useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationName('Bangalore, India');
          return;
        }
        let location = await Location.getLastKnownPositionAsync({}) || await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (location) {
          let processGeocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
          if (processGeocode.length > 0) {
            const address = processGeocode[0];
            const city = address.city || address.region || 'Unknown City';
            const country = address.country || 'Unknown Country';
            setLocationName(`${city}, ${country}`);
          } else {
            setLocationName('Location Found');
          }
        }
      } catch (_error) {
        setLocationName('Bangalore, India');
      }
    })();
    dispatch(fetchUserOrders());
  }, [dispatch]);

  React.useEffect(() => {
    Animated.timing(switchAnim, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]);

  const thumbTranslate = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });
  const trackColor = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D1D5DB', '#2EBD8F'],
  });

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={s.header}>
          <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Profile</Text>
        </View>

        {/* Avatar + Name */}
        <View style={s.profileTop}>
          <View style={s.avatarRing}>
            <View style={[s.avatar, { backgroundColor: colors.surface }]}>
              <Text style={{ fontSize: 32 }}>🧑</Text>
            </View>
          </View>
          <Text style={[s.userName, { color: colors.textPrimary }]}>{user?.name || 'User Name'}</Text>
          <Text style={[s.userLocation, { color: colors.textSecondary }]}>📍 {locationName}</Text>
        </View>

        {/* Stats Row */}
        <View style={[s.statsRow, { borderColor: colors.border }]}>
          {[
            { val: userOrders?.length || '0', label: 'Orders' },
            { val: '-', label: 'Saved (Soon)' },
            { val: '-', label: 'Reviews (Soon)' },
          ].map((stat, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={[s.statDivider, { backgroundColor: colors.border }]} />}
              <View style={s.statItem}>
                <Text style={[s.statVal, { color: colors.accent }]}>{stat.val}</Text>
                <Text style={[s.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Dark Mode Toggle */}
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Appearance</Text>
        </View>
        <View style={[s.darkModeRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[s.iconBox, { backgroundColor: colors.accentPaleBg, borderColor: colors.accentSoftBorder }]}>
            <Text style={{ fontSize: 18 }}>{isDark ? '🌙' : '☀️'}</Text>
          </View>
          <Text style={[s.darkModeLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
          <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8} style={s.switchOuter}>
            <Animated.View style={[s.switchTrack, { backgroundColor: trackColor }]}>
              <Animated.View style={[s.switchThumb, { transform: [{ translateX: thumbTranslate }] }]} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Settings</Text>
        </View>
        <View style={[s.groupedList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {SETTINGS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[s.settingsRow, i < SETTINGS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => item.screen && navigation.navigate(item.screen)}
            >
              <View style={[s.iconBox, { backgroundColor: colors.surfaceInput, borderColor: colors.border }]}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <Text style={[s.settingsLabel, { color: colors.textPrimary }]}>{item.label}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[s.logoutBtn, { backgroundColor: colors.dangerPale, borderColor: colors.danger + '40' }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={[s.logoutText, { color: colors.danger }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const makeStyles = (c, isDark) => StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -0.8 },

  profileTop: { alignItems: 'center', paddingVertical: 8, marginBottom: 8 },
  avatarRing: { width: 78, height: 78, borderRadius: 39, padding: 3, marginBottom: 14, borderWidth: 3, borderColor: '#2EBD8F' },
  avatar: { flex: 1, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 18, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  userLocation: { fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 4 },

  statsRow: { flexDirection: 'row', marginHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: '#EBEBEB', paddingVertical: 16, marginBottom: 24, backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF' },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: '60%', alignSelf: 'center' },
  statVal: { fontSize: 18, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  statLabel: { fontSize: 11, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 2 },

  sectionHeader: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 10 },
  sectionTitle: { fontSize: 15, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -0.2 },

  darkModeRow: { marginHorizontal: 24, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 24 },
  iconBox: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  darkModeLabel: { flex: 1, fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold' },

  switchOuter: {},
  switchTrack: { width: 48, height: 26, borderRadius: 13, justifyContent: 'center', padding: 2 },
  switchThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },

  groupedList: { marginHorizontal: 24, borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 24 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, gap: 0 },
  settingsLabel: { flex: 1, fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', marginLeft: 0 },

  logoutBtn: { marginHorizontal: 24, borderRadius: 14, borderWidth: 1, paddingVertical: 16, alignItems: 'center' },
  logoutText: { fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold' },
});
