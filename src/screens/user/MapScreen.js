import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeContext';


const MapScreen = () => {
  const { colors, isDark } = useTheme();
  const { nearbyPharmacies } = useSelector(s => s.pharmacy);
  const s = makeStyles(colors, isDark);

  const pharmacies = nearbyPharmacies || [];

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {/* Map Area */}
      <View style={s.mapArea}>
        {/* Teal-tinted gradient background */}
        <View style={[s.mapBg, { backgroundColor: isDark ? '#0D1F1A' : '#E5F5F0' }]} />
        {/* Grid lines */}
        {[...Array(8)].map((_, i) => (
          <View key={`h${i}`} style={[s.gridLineH, { top: `${(i + 1) * 11}%`, backgroundColor: isDark ? 'rgba(46,189,143,0.08)' : 'rgba(46,189,143,0.12)' }]} />
        ))}
        {[...Array(6)].map((_, i) => (
          <View key={`v${i}`} style={[s.gridLineV, { left: `${(i + 1) * 14}%`, backgroundColor: isDark ? 'rgba(46,189,143,0.08)' : 'rgba(46,189,143,0.12)' }]} />
        ))}

        {/* User Location Dot */}
        <View style={s.userDot}>
          <View style={s.userDotInner} />
          <View style={s.userDotPulse} />
        </View>

        {/* Pharmacy Pins (Mocked rendering on static map grid) */}
        {pharmacies.map((ph, i) => {
          // Fallback static positions for visual demonstration if geo isn't mapped
          const fallbackPositions = [
            { top: '25%', left: '30%' }, { top: '35%', left: '60%' }, 
            { top: '50%', left: '45%' }, { top: '40%', left: '20%' }, 
            { top: '55%', left: '70%' }
          ];
          const pos = fallbackPositions[i % fallbackPositions.length];
          return (
            <View key={ph._id} style={[s.pin, { top: pos.top, left: pos.left }]}>
              <View style={s.pinHead}>
                <Text style={{ fontSize: 12 }}>🏥</Text>
              </View>
              <View style={s.pinTail} />
            </View>
          );
        })}

        {/* Filter FAB */}
        <TouchableOpacity style={s.filterFab} activeOpacity={0.8}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <View style={[s.bottomSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[s.dragHandle, { backgroundColor: colors.textMuted }]} />
        <Text style={[s.sheetTitle, { color: colors.textPrimary }]}>Nearby Pharmacies</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
          {pharmacies.length === 0 ? (
             <Text style={{ color: colors.textMuted }}>No pharmacies found nearby</Text>
          ) : (
            pharmacies.map(ph => (
              <TouchableOpacity
                key={ph._id}
                style={[s.pharmaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.7}
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
      </View>
    </View>
  );
};

export default MapScreen;

const makeStyles = (c, isDark) => StyleSheet.create({
  container: { flex: 1 },
  mapArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  mapBg: { ...StyleSheet.absoluteFillObject },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1 },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1 },

  userDot: { position: 'absolute', top: '45%', left: '48%', alignItems: 'center', justifyContent: 'center' },
  userDotInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#2EBD8F', borderWidth: 3, borderColor: '#FFF', zIndex: 2 },
  userDotPulse: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(46,189,143,0.2)' },

  pin: { position: 'absolute', alignItems: 'center' },
  pinHead: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#2EBD8F', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF', zIndex: 2 },
  pinTail: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#2EBD8F', marginTop: -2, zIndex: 1 },

  filterFab: { position: 'absolute', bottom: 20, right: 20, width: 50, height: 50, borderRadius: 25, backgroundColor: '#2EBD8F', justifyContent: 'center', alignItems: 'center', shadowColor: '#2EBD8F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },

  bottomSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, paddingTop: 12, paddingBottom: 24 },
  dragHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16, opacity: 0.3 },
  sheetTitle: { fontSize: 15, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -0.2, paddingHorizontal: 24, marginBottom: 14 },

  pharmaCard: { width: 160, borderRadius: 16, borderWidth: 1, padding: 14 },
  pharmaCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  pharmaIcon: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  pharmaName: { fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold', marginBottom: 6 },
  pharmaInfoRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  pharmaInfoText: { fontSize: 11, fontFamily: 'PlusJakartaSans_500Medium' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  statusBadgeText: { fontSize: 10, fontFamily: 'PlusJakartaSans_700Bold' },
});
