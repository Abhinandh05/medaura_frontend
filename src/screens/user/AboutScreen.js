import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

const AboutScreen = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>About Medaura</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoSection}>
          <Image source={require('../../../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.appName, { color: colors.textPrimary }]}>Medaura</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0 (Stable)</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Our Mission</Text>
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            Medaura is dedicated to making healthcare accessible and transparent. We bridge the gap between patients and pharmacies, ensuring you get the right medicine at the right time.
          </Text>
        </View>

        <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[ 'Terms of Service', 'Privacy Policy', 'Open Source Licenses', 'Check for Updates' ].map((item, i, arr) => (
            <TouchableOpacity
              key={i}
              style={[styles.row, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <Text style={[styles.rowText, { color: colors.textPrimary }]}>{item}</Text>
              <Text style={{ color: colors.textMuted }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>© 2026 Medaura Technologies Inc.{'\n'}All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold' },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 24, alignItems: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 80, height: 80, marginBottom: 16 },
  appName: { fontSize: 24, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  version: { fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 4 },
  card: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 24, width: '100%' },
  cardTitle: { fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold', marginBottom: 8 },
  cardText: { fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium', lineHeight: 20 },
  list: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', width: '100%', marginBottom: 30 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  rowText: { fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold' },
  footer: { textAlign: 'center', fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium', lineHeight: 20 },
});

export default AboutScreen;
