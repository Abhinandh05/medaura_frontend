import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const SearchBar = ({ placeholder, value, onChangeText, onSubmitEditing }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={colors.textLight} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder || "Search medicines..."}
        placeholderTextColor={colors.textLight}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
      />
      {value ? (
        <Ionicons 
          name="close-circle" 
          size={20} 
          color={colors.textLight} 
          style={styles.clearIcon} 
          onPress={() => onChangeText('')}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.s,
    height: 50,
  },
  icon: {
    marginRight: spacing.s,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  clearIcon: {
    padding: spacing.xs,
  },
});

export default SearchBar;
