import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';

const ManageUsersScreen = ({ navigation }) => {
  const [users] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
    { id: '2', name: 'City Pharma', email: 'city@pharma.com', role: 'pharmacy_owner' },
    { id: '3', name: 'Admin Jane', email: 'jane@medaura.com', role: 'admin' },
    { id: '4', name: 'Robert Smith', email: 'robert@test.com', role: 'user' },
  ]);
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return { bg: '#E0E7FF', text: '#4F46E5' };
      case 'pharmacy_owner': return { bg: '#E6F4F1', text: colors.primary };
      default: return { bg: '#F3F4F6', text: colors.textLight };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Users</Text>
        </View>

        <View style={styles.searchContainer}>
          <SearchBar 
            placeholder="Search users by name or email..." 
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const badge = getRoleBadgeColor(item.role);
            return (
              <View style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.roleText, { color: badge.text }]}>
                      {item.role.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="settings-outline" size={20} color={colors.textLight} />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              title="No Users Found"
              message="No users match your current search criteria."
              iconName="people-outline"
            />
          }
        />
      </View>
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
  searchContainer: {
    padding: spacing.m,
  },
  listContent: {
    padding: spacing.m,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: spacing.s,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: spacing.s,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionBtn: {
    padding: spacing.s,
  },
});

export default ManageUsersScreen;
