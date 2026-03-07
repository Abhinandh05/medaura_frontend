import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { addAddress, deleteAddress } from '../../redux/slices/authSlice';
import { useTheme } from '../../theme/ThemeContext';

const SavedAddressesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const addresses = user?.addresses || [];

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAddr, setNewAddr] = useState('');

  const handleAdd = async () => {
    if (!newTitle || !newAddr) return;
    await dispatch(addAddress({ title: newTitle, address: newAddr }));
    setModalVisible(false);
    setNewTitle('');
    setNewAddr('');
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => dispatch(deleteAddress(id)), style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Saved Addresses</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {addresses.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textMuted }}>No saved addresses yet.</Text>
        ) : (
          addresses.map(item => (
            <View key={item._id} style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.accentPaleBg }]}>
                <Text style={{ fontSize: 20 }}>{item.icon || '🏠'}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.address, { color: colors.textSecondary }]}>{item.address}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item._id)}>
                <Text style={{ color: colors.danger, fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity 
          style={[styles.addBtn, { backgroundColor: colors.accent }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnText}>Add New Address</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>New Address</Text>
            <TextInput
              placeholder="Title (e.g. Home)"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              placeholder="Full Address"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, height: 80 }]}
              multiline
              value={newAddr}
              onChangeText={setNewAddr}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancel}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAdd} style={[styles.save, { backgroundColor: colors.accent }]}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  info: { flex: 1 },
  title: { fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold' },
  address: { fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 4, lineHeight: 18 },
  addBtn: { marginTop: 20, padding: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  addBtnText: { color: '#FFF', fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold' },
  
  // Modal Styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 24, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 30 },
  modalTitle: { fontSize: 20, fontFamily: 'PlusJakartaSans_800ExtraBold', marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 12, padding: 15, marginBottom: 15, fontSize: 14, fontFamily: 'PlusJakartaSans_500Medium' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 10, paddingBottom: 20 },
  cancel: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#F3F4F6' },
  save: { flex: 2, padding: 16, borderRadius: 12, alignItems: 'center' },
});

export default SavedAddressesScreen;
