import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

const HelpSupportScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const sections = [
    { title: 'FAQs', items: ['How to place an order?', 'Prescription guidelines', 'Return policy'] },
    { title: 'Contact Us', items: ['Chat with Support', 'Email Us', 'Call Center'] },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {sections.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={[styles.secTitle, { color: colors.textSecondary }]}>{section.title}</Text>
            <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.row, idx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                >
                  <Text style={[styles.rowText, { color: colors.textPrimary }]}>{item}</Text>
                  <Text style={{ color: colors.textMuted }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={[styles.supportBox, { backgroundColor: colors.accentPaleBg, borderColor: colors.accentSoftBorder }]}>
          <Text style={{ fontSize: 32, marginBottom: 12 }}>🎧</Text>
          <Text style={[styles.supportTitle, { color: colors.accent }]}>Live Support</Text>
          <Text style={[styles.supportSub, { color: colors.textSecondary }]}>Our team is available 24/7 to assist you with any health-related queries.</Text>
          <TouchableOpacity style={[styles.supportBtn, { backgroundColor: colors.accent }]}>
            <Text style={styles.supportBtnText}>Start Chat</Text>
          </TouchableOpacity>
        </View>
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
  content: { padding: 24 },
  section: { marginBottom: 24 },
  secTitle: { fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  list: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  rowText: { fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold' },
  supportBox: { marginTop: 12, padding: 24, borderRadius: 24, borderWidth: 1, alignItems: 'center', borderStyle: 'dotted' },
  supportTitle: { fontSize: 18, fontFamily: 'PlusJakartaSans_800ExtraBold', marginBottom: 6 },
  supportSub: { fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  supportBtn: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  supportBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold' },
});

export default HelpSupportScreen;
