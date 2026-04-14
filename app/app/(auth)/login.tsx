import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearError, loginCliente, loginGoogle } from '../../store/slices/authSlice';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!;

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email,        setEmail]        = useState('');
  const [senha,        setSenha]        = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // ── Google Auth ──────────────────────────────────────────────────────────────
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:     WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;
      if (!token) return;
      dispatch(loginGoogle(token)).then((result) => {
        if (loginGoogle.fulfilled.match(result)) {
          router.replace('/(tabs)');
        }
      });
    }
  }, [response, dispatch]);

  // ── Login email/senha ────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !senha) return;
    const result = await dispatch(loginCliente({ email, senha }));
    if (loginCliente.fulfilled.match(result)) {
      router.replace('/(tabs)');
    }
  };

  const handleChangeEmail = (value: string) => {
    if (error) dispatch(clearError());
    setEmail(value);
  };

  const handleChangeSenha = (value: string) => {
    if (error) dispatch(clearError());
    setSenha(value);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'android' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.card}>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.titulo}>Bem-vindo</Text>
          <Text style={styles.subtitulo}>Faça login para continuar</Text>

          {/* Email */}
          <View style={styles.campo}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={handleChangeEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Senha */}
          <View style={styles.campo}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { paddingRight: 44 }]}
                value={senha}
                onChangeText={handleChangeSenha}
                secureTextEntry={!mostrarSenha}
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setMostrarSenha((v) => !v)}
              >
                <Ionicons
                  name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>

          {error && <Text style={styles.erro}>{error}</Text>}

          {/* Botão entrar */}
          <TouchableOpacity
            style={[styles.btnEntrar, loading && styles.btnDesabilitado]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnTexto}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Divisor */}
          <View style={styles.divisorWrap}>
            <View style={styles.divisorLinha} />
            <Text style={styles.divisorTexto}>ou</Text>
            <View style={styles.divisorLinha} />
          </View>

          {/* Botão Google */}
          <TouchableOpacity
            style={[styles.btnGoogle, (!request || loading) && styles.btnDesabilitado]}
            onPress={() => promptAsync()}
            disabled={!request || loading}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: 'https://www.google.com/favicon.ico' }}
              style={styles.googleIcon}
            />
            <Text style={styles.btnGoogleTexto}>Continuar com Google</Text>
          </TouchableOpacity>

          {/* Cadastro */}
          <View style={styles.rodape}>
            <Text style={styles.rodapeTexto}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/cadastro')}>
              <Text style={styles.linkCadastro}>Cadastrar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0a2e',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#e8e6f0',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#111',
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: '#6b3fa0',
    marginBottom: 28,
  },
  campo: {
    width: '100%',
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2a2a3a',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 46,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1a1a2e',
  },
  inputWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 13,
  },
  erro: {
    color: '#c0392b',
    fontSize: 13,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  btnEntrar: {
    width: '100%',
    height: 48,
    backgroundColor: '#6b21a8',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDesabilitado: {
    opacity: 0.7,
  },
  btnTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  divisorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
    gap: 8,
  },
  divisorLinha: {
    flex: 1,
    height: 1,
    backgroundColor: '#c4b8d8',
  },
  divisorTexto: {
    fontSize: 12,
    color: '#888',
  },
  btnGoogle: {
    width: '100%',
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  btnGoogleTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  rodape: {
    flexDirection: 'row',
    marginTop: 20,
  },
  rodapeTexto: {
    fontSize: 13,
    color: '#555',
  },
  linkCadastro: {
    fontSize: 13,
    color: '#6b21a8',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
