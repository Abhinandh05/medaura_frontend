import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeContext';
import { searchMedicines } from '../../redux/slices/medicineSlice';

const RECENT = [
  'Paracetamol 500mg',
  'Amoxicillin',
  'Blood pressure monitor',
  'Insulin syringes',
];

const TRENDING = [
  { name: 'Dolo 650', badge: '🔥' },
  { name: 'Azithromycin 500mg', badge: '🔥' },
  { name: 'Vitamin D3', badge: '🔥' },
  { name: 'Cetirizine 10mg', badge: '🔥' },
  { name: 'Metformin 500mg', badge: '🔥' },
];


const SearchScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState(RECENT);
  const { searchResults, isLoading } = useSelector(s => s.medicine);

  // Debounce API calls for live search
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        dispatch(searchMedicines(query.trim()));
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [query, dispatch]);

  const results = query.trim() ? searchResults : [];

  const removeRecent = (item) => {
    setRecents(recents.filter(r => r !== item));
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      {/* Search Input */}
      <View style={s.searchWrap}>
        <View style={[s.searchBar, { backgroundColor: colors.surfaceInput, borderColor: colors.border }]}>
          <Text style={{ fontSize: 16, marginRight: 10 }}>🔍</Text>
          <TextInput
            style={[s.input, { color: colors.textPrimary }]}
            placeholder="Search medicines, pharmacies..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); Keyboard.dismiss(); }}>
              <Text style={{ fontSize: 16, color: colors.textMuted }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {query.trim() ? (
          /* Live Results */
          <View style={[s.groupedList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {isLoading ? (
              <View style={s.empty}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>⏳</Text>
                <Text style={[s.emptyText, { color: colors.textMuted }]}>Searching...</Text>
              </View>
            ) : results.length === 0 ? (
              <View style={s.empty}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                <Text style={[s.emptyText, { color: colors.textMuted }]}>No results found</Text>
              </View>
            ) : (
              results.map((item, i) => (
                <TouchableOpacity
                  key={item._id || i}
                  style={[s.row, i < results.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('PharmacyDetails', { pharmacyId: item.pharmacyId })}
                >
                  <View style={[s.iconBox, { backgroundColor: colors.accentPaleBg, borderColor: colors.accentSoftBorder }]}>
                    <Text style={{ fontSize: 18 }}>💊</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.rowText, { color: colors.textPrimary }]}>{item.medicineName || item.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'PlusJakartaSans_500Medium' }}>{item.pharmacyName} · ₹{item.price?.toFixed(2) || '0.00'}</Text>
                  </View>
                  {item.availabilityStatus === 'Available' ? (
                     <Text style={{ color: colors.accent, fontSize: 11, fontFamily: 'PlusJakartaSans_700Bold' }}>In Stock</Text>
                  ) : (
                     <Text style={{ color: colors.danger, fontSize: 11, fontFamily: 'PlusJakartaSans_700Bold' }}>Out of Stock</Text>
                  )}
                  <Text style={{ color: colors.textMuted, fontSize: 16, marginLeft: 8 }}>›</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <>
            {/* Recent Searches */}
            {recents.length > 0 && (
              <>
                <View style={s.sectionHeader}>
                  <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Recent Searches</Text>
                </View>
                <View style={[s.groupedList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {recents.map((item, i) => (
                    <View
                      key={i}
                      style={[s.row, i < recents.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                    >
                      <View style={[s.iconBox, { backgroundColor: colors.surfaceInput, borderColor: colors.border }]}>
                        <Text style={{ fontSize: 16 }}>🕐</Text>
                      </View>
                      <TouchableOpacity style={{ flex: 1 }} onPress={() => setQuery(item)}>
                        <Text style={[s.rowText, { color: colors.textPrimary }]}>{item}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeRecent(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 14 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Trending */}
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Trending</Text>
            </View>
            <View style={[s.groupedList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {TRENDING.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.row, i < TRENDING.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                  onPress={() => setQuery(item.name)}
                  activeOpacity={0.7}
                >
                  <View style={[s.iconBox, { backgroundColor: colors.amberPale, borderColor: colors.amber + '40' }]}>
                    <Text style={{ fontSize: 16 }}>{item.badge}</Text>
                  </View>
                  <Text style={[s.rowText, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 16 }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;

const makeStyles = (c) => StyleSheet.create({
  safe: { flex: 1 },
  searchWrap: { paddingHorizontal: 24, paddingVertical: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 48 },
  input: { flex: 1, fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium', padding: 0 },
  sectionHeader: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  sectionTitle: { fontSize: 15, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -0.2 },
  groupedList: { marginHorizontal: 24, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowText: { flex: 1, fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium' },
});
