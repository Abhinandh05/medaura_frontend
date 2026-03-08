import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import Input from '../../components/Input';
import PrimaryButton from '../../components/PrimaryButton';
import { addMedicine } from '../../redux/slices/medicineSlice';
import { fetchMyPharmacy } from '../../redux/slices/pharmacySlice';

const AddMedicineScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { myPharmacy } = useSelector((state) => state.pharmacy);
  const { isLoading, error } = useSelector((state) => state.medicine);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (!myPharmacy) {
      dispatch(fetchMyPharmacy());
    }
  }, [dispatch, myPharmacy]);

  const handleAdd = async () => {
    if (!name.trim() || !price.trim() || !quantity.trim()) {
      Alert.alert('Missing Fields', 'Please fill in medicine name, price, and quantity.');
      return;
    }

    if (!myPharmacy?._id) {
      Alert.alert('Error', 'Pharmacy not found. Please set up your pharmacy profile first.');
      return;
    }

    const medicineData = {
      medicineName: name.trim(),
      category: category.trim() || 'General',
      price: parseFloat(price),
      stockQuantity: parseInt(quantity, 10),
      pharmacyId: myPharmacy._id,
    };

    try {
      const result = await dispatch(addMedicine(medicineData)).unwrap();
      if (result.success) {
        Alert.alert('Success', `${name} has been added to your inventory.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err || 'Failed to add medicine. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Medicine</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Input
              label="Medicine Name"
              placeholder="e.g. Paracetamol"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="Category"
              placeholder="e.g. Fever, Painkiller"
              value={category}
              onChangeText={setCategory}
            />
            <View style={styles.row}>
              <View style={styles.col}>
                <Input
                  label="Price (\u20B9)"
                  placeholder="0.00"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.col}>
                <Input
                  label="Quantity"
                  placeholder="0"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <PrimaryButton
              title="Add to Inventory"
              onPress={handleAdd}
              loading={isLoading}
              style={styles.btn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.m,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.m,
  },
  form: {
    marginTop: spacing.m,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    width: '48%',
  },
  btn: {
    marginTop: spacing.xl,
  },
});

export default AddMedicineScreen;
