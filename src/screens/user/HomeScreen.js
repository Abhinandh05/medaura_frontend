import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeContext';
import { addToCart, removeFromCart } from '../../redux/slices/cartSlice';
import { fetchNearbyPharmacies } from '../../redux/slices/pharmacySlice';
import { fetchAllMedicines, fetchCategories } from '../../redux/slices/medicineSlice';
import * as Location from 'expo-location';

const { width: SCREEN_W } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const cartItems = useSelector(s => s.cart.items);
  const { nearbyPharmacies } = useSelector(s => s.pharmacy);
  const { allMedicines, categories } = useSelector(s => s.medicine);

  const [activeCat, setActiveCat] = useState('All');
  const [locationName, setLocationName] = useState('Locating...');
  
  // Initialize data from API and fetch location
  useEffect(() => {
    dispatch(fetchCategories());
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission to access location was denied', 'Using default location (Bangalore).');
          setLocationName('Bangalore');
          dispatch(fetchNearbyPharmacies({ lat: 12.9716, lng: 77.5946, maxDistance: 10 }));
          return;
        }

        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = location.coords;

        let processGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (processGeocode.length > 0) {
          const address = processGeocode[0];
          setLocationName(address.city || address.region || address.country || 'Location Found');
        } else {
          setLocationName('Location Found');
        }

        dispatch(fetchNearbyPharmacies({ lat: latitude, lng: longitude, maxDistance: 10 }));
      } catch (error) {
        console.error('Error fetching location:', error);
        setLocationName('Bangalore');
        dispatch(fetchNearbyPharmacies({ lat: 12.9716, lng: 77.5946, maxDistance: 10 }));
      }
    })();
    // Fetch all available medicines for home screen
    dispatch(fetchAllMedicines());
  }, [dispatch]);

  // Handle derived lists
  const pharmacies = nearbyPharmacies || [];
  const medicines = allMedicines || [];

  // Animations
  const fadeAnims = useRef([...Array(8)].map(() => new Animated.Value(0))).current;
  const slideAnims = useRef([...Array(8)].map(() => new Animated.Value(12))).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnims.forEach((anim, i) => {
      Animated.timing(anim, { toValue: 1, duration: 400, delay: i * 50, useNativeDriver: true }).start();
    });
    slideAnims.forEach((anim, i) => {
      Animated.timing(anim, { toValue: 0, duration: 400, delay: i * 50, useNativeDriver: true }).start();
    });
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = (i) => ({
    opacity: fadeAnims[Math.min(i, 7)],
    transform: [{ translateY: slideAnims[Math.min(i, 7)] }],
  });

  const filteredMeds = activeCat === 'All' 
    ? medicines 
    : medicines.filter(med => med.category === activeCat);

  const cartIds = cartItems.map(c => c.id || c._id);

  const toggleCart = (med) => {
    const uniqueId = med._id || med.id;
    if (cartIds.includes(uniqueId)) {
      dispatch(removeFromCart(uniqueId));
    } else {
      dispatch(addToCart({
        ...med,
        id: uniqueId,
        pharmacyId: med.pharmacyId,
        pharmacyName: med.pharmacyName,
      }));
    }
  };

  const userName = user?.name?.split(' ')[0] || 'User';

  // ── Styles ──
  const s = makeStyles(colors, isDark);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

        {/* ── HEADER ── */}
        <Animated.View style={[s.header, animStyle(0)]}>
          <View style={s.headerLeft}>
            <View style={s.locationRow}>
              <Text style={s.locationIcon}>📍</Text>
              <Text style={[s.locationText, { color: colors.textSecondary }]} numberOfLines={1}>{locationName}</Text>
              <Text style={{ color: colors.accent, fontSize: 10, marginLeft: 4 }}>▾</Text>
            </View>
            <Text style={[s.greeting, { color: colors.textPrimary }]}>Good morning,</Text>
            <Text style={s.greetingName}>
              <Text style={{ color: colors.accent }}>{userName}</Text>
              <Text> 👋</Text>
            </Text>
          </View>
          <View style={s.headerRight}>
            <TouchableOpacity
              style={[s.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 18 }}>{isDark ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.avatarBtn]}
              onPress={() => navigation.navigate('Cart')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 18 }}>🛒</Text>
              {cartItems.length > 0 && (
                <View style={s.cartBadge}>
                  <Text style={s.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── SEARCH BAR ── */}
        <Animated.View style={[s.searchWrap, animStyle(1)]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Search')}
            style={[s.searchBar, { backgroundColor: colors.surfaceInput, borderColor: colors.border }]}
          >
            <Text style={{ fontSize: 16, marginRight: 10 }}>🔍</Text>
            <Text style={[s.searchPlaceholder, { color: colors.textMuted }]}>Search medicines, pharmacies...</Text>
            <View style={[s.searchFab, { backgroundColor: colors.accentPaleBg, borderColor: colors.accentSoftBorder }]}>
              <Text style={{ fontSize: 14 }}>⚙️</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ── STATS ROW ── */}
        <Animated.View style={[s.statsRow, animStyle(2)]}>
          {[
            { icon: '🏥', val: pharmacies.length.toString(), label: 'Pharmacies' },
            { icon: '💊', val: medicines.length.toString(), label: 'Medicines' },
            { icon: '🛵', val: '15m', label: 'Avg Delivery' },
          ].map((st, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ fontSize: 22 }}>{st.icon}</Text>
              <Text style={[s.statVal, { color: colors.accent }]}>{st.val}</Text>
              <Text style={[s.statLabel, { color: colors.textMuted }]}>{st.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[s.heroWrap, animStyle(3)]}>
          <LinearGradient
            colors={['#1A9E73', '#2EBD8F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={s.heroDecor} />
            <View style={s.heroContent}>
              <Text style={s.heroTag}>QUICK CARE ANYWHERE</Text>
              <Text style={s.heroTitle}>Medicine delivered{'\n'}to your door</Text>
              <View style={s.heroBtns}>
                <TouchableOpacity style={s.heroBtnPrimary} activeOpacity={0.8}>
                  <Text style={s.heroBtnPrimaryText}>Find Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.heroBtnSecondary} activeOpacity={0.8}>
                  <Text style={s.heroBtnSecondaryText}>Upload Rx</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Animated.Text style={[s.heroEmoji, { transform: [{ translateY: floatAnim }] }]}>💊</Animated.Text>
          </LinearGradient>
        </Animated.View>

        {/* ── NEARBY PHARMACIES ── */}
        <Animated.View style={animStyle(4)}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Nearby Pharmacies</Text>
            <TouchableOpacity onPress={() => navigation.navigate('NearbyPharmacies')}>
              <Text style={[s.seeAll, { color: colors.accent }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 10, gap: 12 }}>
              {pharmacies.length === 0 ? (
                 <Text style={{ color: colors.textMuted }}>Loading pharmacies...</Text>
              ) : (
                pharmacies.map(ph => (
                  <TouchableOpacity
                    key={ph._id}
                    style={[s.pharmaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('PharmacyDetails', { pharmacy: ph })}
                  >
                    <View style={s.pharmaCardTop}>
                      <View style={[s.pharmaIcon, {
                        backgroundColor: colors.accentPaleBg,
                        borderColor: colors.accentSoftBorder,
                      }]}>
                        <Text style={{ fontSize: 20 }}>🏥</Text>
                      </View>
                      <View style={[s.statusDot, { backgroundColor: colors.accent }]} />
                    </View>
                    <Text style={[s.pharmaName, { color: colors.textPrimary }]} numberOfLines={1}>{ph.pharmacyName}</Text>
                    <View style={s.pharmaInfoRow}>
                      <Text style={[s.pharmaInfoText, { color: colors.textSecondary }]} numberOfLines={1}>📍 {ph.address.split(',')[0]}</Text>
                      <Text style={[s.pharmaInfoText, { color: colors.textSecondary }]}>⭐ 4.5</Text>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: colors.accentPaleBg }]}>
                      <Text style={[s.statusBadgeText, { color: colors.accent }]}>
                        Open Now
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
        </Animated.View>

        {/* ── MEDICINES ── */}
        <Animated.View style={animStyle(5)}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Medicines</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MedicineSearch')}>
              <Text style={[s.seeAll, { color: colors.accent }]}>View all</Text>
            </TouchableOpacity>
          </View>
          {/* Category Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll} contentContainerStyle={{ paddingHorizontal: 24 }}>
            {categories.map(cat => {
              const active = cat === activeCat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCat(cat)}
                  style={[
                    s.chip,
                    active
                      ? s.chipActive
                      : { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[s.chipText, active ? s.chipTextActive : { color: colors.textSecondary }]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {/* Medicine List */}
          <View style={[s.groupedList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {filteredMeds.length === 0 ? (
                 <Text style={{ color: colors.textMuted, paddingHorizontal: 24 }}>Loading medicines...</Text>
              ) : (
                filteredMeds.map((med, i) => {
                  // Map medicine `_id` properly if present, otherwise ignore fallback for API items
                  const uniqueId = med._id || i.toString();
                  const isCart = cartIds.includes(uniqueId);
                  // The backend search route returns `medicineName`, `price`, `availabilityStatus`, and `pharmacyName` directly
                  return (
                    <TouchableOpacity
                      key={uniqueId}
                      style={[s.medRow, i < filteredMeds.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('PharmacyDetails', { pharmacyId: med.pharmacyId?._id || med.pharmacyId })}
                    >
                      <View style={[s.medIconWrap, { backgroundColor: colors.surfaceInput, borderColor: colors.border }]}>
                        <Text style={{ fontSize: 22 }}>💊</Text>
                      </View>
                      <View style={s.medInfo}>
                        <Text style={[s.medName, { color: colors.textPrimary }]}>{med.medicineName || med.name}</Text>
                        <Text style={[s.medCat, { color: colors.textSecondary }]} numberOfLines={1}>{med.pharmacyName}</Text>
                        <View style={s.medPriceRow}>
                          <Text style={[s.medPrice, { color: colors.textPrimary }]}>₹{med.price?.toFixed(2) || '0.00'}</Text>
                          {med.availabilityStatus === 'Available' ? (
                             <View style={[s.medStock, { backgroundColor: colors.accentPaleBg }]}>
                               <Text style={[s.medStockTxt, { color: colors.accent }]}>In Stock</Text>
                             </View>
                          ) : (
                             <View style={[s.medStock, { backgroundColor: colors.dangerPale }]}>
                               <Text style={[s.medStockTxt, { color: colors.danger }]}>Out of Stock</Text>
                             </View>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[
                          s.addBtn,
                          isCart ? { backgroundColor: colors.accentPaleBg, borderColor: colors.accent }
                                 : { backgroundColor: colors.surfaceInput, borderColor: colors.border }
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          med.availabilityStatus === 'Available' && toggleCart(med);
                        }}
                        disabled={med.availabilityStatus !== 'Available'}
                      >
                        <Text style={[s.addBtnTxt, { color: isCart ? colors.accent : colors.textPrimary }]}>
                          {isCart ? '−' : '+'}
                        </Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })
              )}
          </View>
        </Animated.View>

        {/* ── QUICK ACTIONS ── */}
        <Animated.View style={animStyle(6)}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
          </View>
          <View style={s.quickGrid}>
            {[
              { icon: '📋', title: 'Upload Prescription', sub: 'Get medicines delivered' },
              { icon: '🔔', title: 'Reminders', sub: 'Never miss a dose' },
              { icon: '🚑', title: 'Emergency', sub: 'Nearest 24/7 pharmacy' },
              { icon: '📦', title: 'My Orders', sub: 'Track your deliveries' },
            ].map((qa, i) => (
              <TouchableOpacity
                key={i}
                style={[s.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.7}
                onPress={() => {
                  if (qa.title === 'My Orders') navigation.navigate('UserTabs', { screen: 'Orders' });
                }}
              >
                <Text style={{ fontSize: 24 }}>{qa.icon}</Text>
                <Text style={[s.quickTitle, { color: colors.textPrimary }]}>{qa.title}</Text>
                <Text style={[s.quickSub, { color: colors.textSecondary }]}>{qa.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── PROMO STRIP ── */}
        <Animated.View style={[s.promoWrap, animStyle(7)]}>
          <View style={[s.promo, { backgroundColor: colors.accentPaleBg, borderColor: colors.accentSoftBorder }]}>
            <Text style={{ fontSize: 28 }}>🎁</Text>
            <View style={s.promoText}>
              <Text style={[s.promoTitle, { color: colors.accent }]}>Free delivery on first order!</Text>
              <Text style={[s.promoSub, { color: colors.textSecondary }]}>Use code MEDAURA10 at checkout</Text>
            </View>
            <TouchableOpacity style={s.promoBtn} activeOpacity={0.7}>
              <Text style={s.promoBtnText}>Claim</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

// ── StyleSheet ──
const makeStyles = (c, isDark) => StyleSheet.create({
  safe: { flex: 1 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  headerLeft: { flex: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  locationIcon: { fontSize: 12, marginRight: 4 },
  locationText: { fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium' },
  greeting: { fontSize: 24, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -0.8 },
  greetingName: { fontSize: 24, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -0.8 },
  headerRight: { alignItems: 'flex-end', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  avatarBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#E5484D', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  cartBadgeText: { color: '#FFF', fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold' },

  // Search
  searchWrap: { paddingHorizontal: 24, marginBottom: 24 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 48 },
  searchPlaceholder: { flex: 1, fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium' },
  searchFab: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 10, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 14, alignItems: 'center' },
  statVal: { fontSize: 17, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -0.5, marginTop: 4 },
  statLabel: { fontSize: 10, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 2 },

  // Hero
  heroWrap: { paddingHorizontal: 24, marginBottom: 24 },
  hero: { borderRadius: 22, overflow: 'hidden', padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative', backgroundGradient: true },
  heroContent: { flex: 1, zIndex: 2 },
  heroTag: { fontSize: 11, letterSpacing: 1.5, color: 'rgba(255,255,255,0.7)', fontFamily: 'PlusJakartaSans_600SemiBold', marginBottom: 8, textTransform: 'uppercase' },
  heroTitle: { fontSize: 18, fontFamily: 'PlusJakartaSans_800ExtraBold', color: '#FFF', letterSpacing: -0.3, lineHeight: 24, marginBottom: 16 },
  heroBtns: { flexDirection: 'row', gap: 10 },
  heroBtnPrimary: { backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  heroBtnPrimaryText: { color: '#1A9E73', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 },
  heroBtnSecondary: { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  heroBtnSecondaryText: { color: '#FFF', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 },
  heroEmoji: { fontSize: 60, zIndex: 2 },
  heroDecor: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)', zIndex: 1 },

  // Sections
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -0.2 },
  seeAll: { fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold' },

  // Grouped List
  groupedList: { marginHorizontal: 24, borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 24 },

  // Pharmacy Row
  pharmaRow: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  pharmaInfo: { flex: 1 },
  pharmaTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  pharmaName: { fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold', flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 10, fontFamily: 'PlusJakartaSans_700Bold' },
  pharmaBottomRow: { flexDirection: 'row', alignItems: 'center' },
  pharmaSub: { fontSize: 11, fontFamily: 'PlusJakartaSans_500Medium' },

  // Chips
  chipScroll: { marginBottom: 12 },
  chip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1 },
  chipActive: { backgroundColor: '#2EBD8F', borderColor: '#2EBD8F', shadowColor: '#2EBD8F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  chipText: { fontSize: 12, fontFamily: 'PlusJakartaSans_600SemiBold' },
  chipTextActive: { color: '#FFF' },

  // Medicine Row
  medRow: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16 },
  medInfo: { flex: 1 },
  medNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 6 },
  medName: { fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold' },
  hotBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  hotText: { fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold' },
  medSubRow: { flexDirection: 'row', alignItems: 'center' },
  medSub: { fontSize: 11, fontFamily: 'PlusJakartaSans_500Medium' },
  catBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  catBadgeText: { fontSize: 10, fontFamily: 'PlusJakartaSans_700Bold' },
  medRight: { alignItems: 'flex-end', gap: 6 },
  medPrice: { fontSize: 14, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  addBtn: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  addBtnActive: { backgroundColor: '#2EBD8F', shadowColor: '#2EBD8F', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  addBtnAdded: { backgroundColor: '#2EBD8F' },
  addBtnDisabled: { backgroundColor: isDark ? '#242424' : '#F0F0F0' },
  addBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold' },
  emptyMed: { alignItems: 'center', paddingVertical: 32 },
  emptyMedText: { fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium' },

  // Quick Actions
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 10, marginBottom: 24 },
  quickCard: { width: (SCREEN_W - 58) / 2, borderRadius: 16, borderWidth: 1, padding: 16, paddingVertical: 14 },
  quickTitle: { fontSize: 12, fontFamily: 'PlusJakartaSans_700Bold', marginTop: 10 },
  quickSub: { fontSize: 11, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 2 },

  // Promo
  promoWrap: { paddingHorizontal: 24 },
  promo: { borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  promoText: { flex: 1 },
  promoTitle: { fontSize: 12, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  promoSub: { fontSize: 11, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 2 },
  promoBtn: { backgroundColor: '#2EBD8F', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  promoBtnText: { color: '#FFF', fontSize: 12, fontFamily: 'PlusJakartaSans_700Bold' },
});
