import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

const LanguageScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [selected, setSelected] = useState('English');

  const languages = [
    { id: '1', name: 'English', native: 'English', flag: '🇺🇸' },
    { id: '2', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { id: '3', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { id: '4', name: 'French', native: 'Français', flag: '🇫🇷' },
    { id: '5', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {languages.map((lang, i) => (
            <TouchableOpacity
              key={lang.id}
              style={[styles.row, i < languages.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              onPress={() => setSelected(lang.name)}
            >
              <Text style={{ fontSize: 24, marginRight: 16 }}>{lang.flag}</Text>
              <View style={styles.labelCol}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{lang.name}</Text>
                <Text style={[styles.native, { color: colors.textSecondary }]}>{lang.native}</Text>
              </View>
              {selected === lang.name && (
                <View style={[styles.check, { backgroundColor: colors.accent }]}>
                  <Text style={{ color: '#FFF', fontSize: 10 }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
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
  list: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  labelCol: { flex: 1 },
  name: { fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold' },
  native: { fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 2 },
  check: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});

export default LanguageScreen;
