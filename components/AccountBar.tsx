import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/AuthContext';

export default function AccountBar() {
  const router = useRouter();
  const { user, signOut, isAdmin } = useAuth();
  const [message, setMessage] = useState('');

  const handleSignOut = async () => {
    const errorMessage = await signOut();
    setMessage(errorMessage ?? '');
  };

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        <Text style={styles.label}>{isAdmin ? 'Administrator' : 'Signed in'}</Text>
        <Text numberOfLines={1} style={styles.email}>{user.email}</Text>
      </View>
      {isAdmin && (
        <Pressable onPress={() => router.push('/admin')} style={[styles.button, styles.adminButton]}>
          <Text style={styles.buttonText}>Admin</Text>
        </Pressable>
      )}
      <Pressable onPress={handleSignOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 16,
    padding: 12,
  },
  identity: { flex: 1 },
  label: {
    color: '#a0a0a0',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  email: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  adminButton: {
    backgroundColor: '#6c63ff',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  message: {
    color: '#e74c3c',
    fontSize: 11,
    marginLeft: 8,
  },
});
