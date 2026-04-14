import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Image, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import authTypes from '../../store/modules/login/Types';

// Tipagem básica para o RootState (Ajuste conforme sua store)
interface RootState {
  auth: {
    loading: boolean;
    error: string | null;
  };
}

const Login: React.FC<any> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [showSenha, setShowSenha] = useState<boolean>(false);

  const handleLogin = () => {
    if (!email || !senha) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    dispatch({ 
      type: authTypes.LOGIN_REQUEST, 
      payload: { email, senha } 
    });
  };

  return (
    <LinearGradient
      colors={['#2D0B5A', '#1A0633']}
      style={styles.background}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.card}>
              
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/logo.png')} // 🔥 Ajuste o caminho da logo
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.title}>Bem-vindo</Text>
              <Text style={styles.subtitle}>Faça login para continuar</Text>

              {/* Input Email */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="exemplo@email.com"
                  placeholderTextColor="#AAA"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Input Senha */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: 'transparent' }]}
                    placeholder="••••••••"
                    placeholderTextColor="#AAA"
                    secureTextEntry={!showSenha}
                    value={senha}
                    onChangeText={setSenha}
                  />
                  <TouchableOpacity onPress={() => setShowSenha(!showSenha)} style={styles.eyeIcon}>
                    <Icon name={showSenha ? "eye-off" : "eye"} size={20} color="#9B51E0" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Banner de Erro */}
              {error && (
                <View style={styles.errorBanner}>
                  <View style={styles.errorBorder} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Botão Entrar */}
              <TouchableOpacity 
                style={styles.loginBtn} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginBtnText}>Entrar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.registerText}>
                  Não tem conta? <Text style={styles.registerTextBold}>Cadastrar</Text>
                </Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#E8E8F0',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#9B51E0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  logo: { width: '100%', height: '100%' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A0633', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#6C63FF', marginBottom: 30 },
  inputWrapper: { width: '100%', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, alignSelf: 'flex-start' },
  input: { width: '100%', height: 45, backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 15, fontSize: 16, color: '#333' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8 },
  eyeIcon: { paddingHorizontal: 15 },
  errorBanner: { width: '100%', height: 45, backgroundColor: '#F8D7DA', borderRadius: 5, flexDirection: 'row', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  errorBorder: { width: 5, height: '100%', backgroundColor: '#DC3545' },
  errorText: { flex: 1, textAlign: 'center', color: '#721C24', fontSize: 13 },
  loginBtn: { width: '100%', height: 50, backgroundColor: '#5E17EB', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  registerLink: { marginTop: 10 },
  registerText: { color: '#1A0633', fontSize: 14 },
  registerTextBold: { color: '#6C63FF', fontWeight: 'bold' },
});

export default Login;
