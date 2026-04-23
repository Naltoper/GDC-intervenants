import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { useRouter, Stack } from 'expo-router'; // Ajout de Stack pour cacher le header
import { Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Simulation de connexion : si les champs ne sont pas vides
    // if (email.trim() !== '' && password.trim() !== '') {
    //   console.log("Connexion réussie (mode test)");
      
      // On utilise replace pour que l'utilisateur ne puisse pas 
      // revenir au login avec le bouton "Retour" du téléphone
      router.replace('/(tabs)/dashboard'); 
    // } else {
    //   alert("Veuillez remplir les champs (mode test actif)");
    // }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.safeArea}
    >
      {/* Cette ligne permet d'enlever la barre bleue du haut */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Bouton Retour */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
          <ArrowLeft color="#023e8a" size={28} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Espace Intervenants</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>
            Veuillez vous identifier pour accéder à la gestion des signalements.
          </Text>
        </View>

        <View style={styles.form}>
          {/* Champ Email */}
          <View style={styles.inputWrapper}>
            <Mail color="#48a4f4" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email professionnel"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Champ Mot de passe */}
          <View style={styles.inputWrapper}>
            <Lock color="#48a4f4" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Bouton de Connexion */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <LinearGradient
              colors={["#48a4f4", "#10ac56"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>SE CONNECTER</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.securityBadge}>
            <ShieldCheck size={16} color="#0077b6" />
            <Text style={styles.footerNote}> Connexion sécurisée SSL</Text>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  header: { alignItems: 'center', marginBottom: 50 },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#023e8a', 
    textAlign: 'center' 
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: '#10ac56',
    borderRadius: 2,
    marginVertical: 15,
  },
  subtitle: { 
    fontSize: 16, 
    color: '#64748b', 
    textAlign: 'center', 
    paddingHorizontal: 20,
    lineHeight: 22
  },
  form: { width: '100%', gap: 15 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    // Petit effet d'ombre pour le relief
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#1e293b', fontSize: 16 },
  loginButton: { 
    height: 60, 
    marginTop: 10, 
    borderRadius: 15, 
    overflow: 'hidden', 
    elevation: 4,
    shadowColor: '#10ac56',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1.2 },
  footer: { marginTop: 40, alignItems: 'center' },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  footerNote: { fontSize: 13, color: '#0077b6', fontWeight: '600' }
});