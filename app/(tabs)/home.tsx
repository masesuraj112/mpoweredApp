import { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';

export default function HomeScreen() {
  return (
    <View>
      <Text>Home</Text>
      <AuthDebug />
    </View>
  );
}

// TEMPORARY — delete this whole function once AuthContext is confirmed working
function AuthDebug() {
  const { user, session, loading } = useAuth();

  useEffect(() => {
    console.log('[AuthDebug]', {
      loading,
      userId: user?.id,
      hasSession: !!session,
    });
  }, [user, session, loading]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log('[AuthDebug] sign out error:', error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>loading: {String(loading)}</Text>
      <Text style={styles.text}>hasSession: {String(!!session)}</Text>
      <Text style={styles.text}>userId: {user?.id ?? 'none'}</Text>
      <Button title="Test Sign Out" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    margin: 16,
  },
  text: {
    fontFamily: 'monospace',
    marginBottom: 4,
    color: '#000',
  },
});