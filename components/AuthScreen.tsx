import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/AuthContext';

export default function AuthScreen() {
  const { isConfigured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === 'signUp';

  const handleSubmit = async () => {
    setMessage('');

    if (!email.trim() || password.length < 6) {
      setMessage('Enter an email and a password with at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const errorMessage = isSignUp
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (errorMessage) {
      setMessage(errorMessage);
      return;
    }

    if (isSignUp) {
      setMessage('Account created. Check your email if Supabase asks you to confirm it.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.panel}>
          <Text style={styles.logo}>Tailgate</Text>
          <Text style={styles.title}>{isSignUp ? 'Create your account' : 'Welcome back'}</Text>
          <Text style={styles.subtitle}>
            Sign in to keep your picks, follows, and leaderboard history tied to you.
          </Text>

          {!isConfigured && (
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env first.
              </Text>
            </View>
          )}

          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#7f86a3"
            style={styles.input}
            value={email}
          />
          <TextInput
            autoCapitalize="none"
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#7f86a3"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Pressable
            disabled={!isConfigured || isSubmitting}
            onPress={handleSubmit}
            style={[styles.button, (!isConfigured || isSubmitting) && styles.buttonDisabled]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>{isSignUp ? 'Create Account' : 'Log In'}</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              setMode(isSignUp ? 'signIn' : 'signUp');
              setMessage('');
            }}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? Log in' : 'New to Tailgate? Create an account'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  panel: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  logo: {
    color: '#6c63ff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  warning: {
    backgroundColor: '#2a2230',
    borderColor: '#e67e22',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
  },
  warningText: { color: '#ffd9a3', fontSize: 12, lineHeight: 18 },
  input: {
    backgroundColor: '#1a1a2e',
    borderColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 1,
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  message: {
    color: '#d8d8ff',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    color: '#aeb4ff',
    fontSize: 14,
    fontWeight: '600',
  },
});
