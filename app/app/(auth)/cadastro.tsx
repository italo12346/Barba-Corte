import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import MaskInput, { Masks } from "react-native-mask-input";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearError, registerCliente } from "../../store/slices/authSlice";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type TipoDoc = "CPF" | "CNPJ";
type TipoSexo = "M" | "F" | "O";

// ── Componente ────────────────────────────────────────────────────────────────

export default function CadastroScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [etapa, setEtapa] = useState<1 | 2>(1);

  // Etapa 1
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [telefoneRaw, setTelefoneRaw] = useState("");

  // Etapa 2
  const [tipoDoc, setTipoDoc] = useState<TipoDoc>("CPF");
  const [numDoc, setNumDoc] = useState("");
  const [numDocRaw, setNumDocRaw] = useState("");
  const [sexo, setSexo] = useState<TipoSexo | "">("");
  const [nascimento, setNascimento] = useState("");

  const limparErro = () => {
    if (error) dispatch(clearError());
  };

  // ── Validação etapa 1 ──────────────────────────────────────────────────────

  const avancar = () => {
    if (!nome || !email || !senha) return;
    setEtapa(2);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleCadastro = async () => {
    if (!numDocRaw) return;

    const result = await dispatch(
      registerCliente({
        nome,
        email,
        senha,
        telefone: telefoneRaw || undefined,
        dataNascimento: nascimento || undefined,
        sexo: (sexo as TipoSexo) || undefined,
        documento: {
          tipo: tipoDoc,
          numero: numDocRaw,
        },
      }),
    );

    if (registerCliente.fulfilled.match(result)) {
      router.replace("/(tabs)");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "android" ? 0 : 20}
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
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>

          {/* Título */}
          <Text style={styles.titulo}>Criar conta</Text>
          <Text style={styles.subtitulo}>
            {etapa === 1 ? "Dados de acesso" : "Dados pessoais"}
          </Text>

          {/* Indicador de etapa */}
          <View style={styles.etapas}>
            <View style={[styles.etapaDot, etapa >= 1 && styles.etapaAtiva]} />
            <View style={styles.etapaLinha} />
            <View style={[styles.etapaDot, etapa >= 2 && styles.etapaAtiva]} />
          </View>

          {/* ── ETAPA 1 ── */}
          {etapa === 1 && (
            <>
              <View style={styles.campo}>
                <Text style={styles.label}>Nome completo</Text>
                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={(v) => {
                    limparErro();
                    setNome(v);
                  }}
                  autoCapitalize="words"
                  placeholderTextColor="#aaa"
                />
              </View>

              <View style={styles.campo}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(v) => {
                    limparErro();
                    setEmail(v);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#aaa"
                />
              </View>

              <View style={styles.campo}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={[styles.input, { paddingRight: 44 }]}
                    value={senha}
                    onChangeText={(v) => {
                      limparErro();
                      setSenha(v);
                    }}
                    secureTextEntry={!mostrarSenha}
                    placeholderTextColor="#aaa"
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setMostrarSenha((v) => !v)}
                  >
                    <Ionicons
                      name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.campo}>
                <Text style={styles.label}>Telefone (opcional)</Text>
                <MaskInput
                  style={styles.input}
                  value={telefone}
                  onChangeText={(masked, raw) => {
                    setTelefone(masked);
                    setTelefoneRaw(raw);
                  }}
                  mask={Masks.BRL_PHONE}
                  keyboardType="phone-pad"
                  placeholderTextColor="#aaa"
                />
              </View>

              {error && <Text style={styles.erro}>{error}</Text>}

              <TouchableOpacity
                style={[
                  styles.btnEntrar,
                  (!nome || !email || !senha) && styles.btnDesabilitado,
                ]}
                onPress={avancar}
                disabled={!nome || !email || !senha}
                activeOpacity={0.85}
              >
                <Text style={styles.btnTexto}>Continuar</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── ETAPA 2 ── */}
          {etapa === 2 && (
            <>
              {/* Tipo documento */}
              <View style={styles.campo}>
                <Text style={styles.label}>Tipo de documento</Text>
                <View style={styles.toggleRow}>
                  {(["CPF", "CNPJ"] as TipoDoc[]).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.toggleBtn,
                        tipoDoc === t && styles.toggleAtivo,
                      ]}
                      onPress={() => {
                        setTipoDoc(t);
                        setNumDoc("");
                        setNumDocRaw("");
                      }}
                    >
                      <Text
                        style={[
                          styles.toggleTxt,
                          tipoDoc === t && styles.toggleTxtAtivo,
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.campo}>
                <Text style={styles.label}>{tipoDoc}</Text>
                <MaskInput
                  style={styles.input}
                  value={numDoc}
                  onChangeText={(masked, raw) => {
                    limparErro();
                    setNumDoc(masked);
                    setNumDocRaw(raw);
                  }}
                  mask={tipoDoc === "CPF" ? Masks.BRL_CPF : Masks.BRL_CNPJ}
                  keyboardType="numeric"
                  placeholderTextColor="#aaa"
                />
              </View>

              {/* Sexo */}
              <View style={styles.campo}>
                <Text style={styles.label}>Sexo (opcional)</Text>
                <View style={styles.toggleRow}>
                  {(
                    [
                      ["M", "Masculino"],
                      ["F", "Feminino"],
                      ["O", "Outro"],
                    ] as [TipoSexo, string][]
                  ).map(([val, label]) => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.toggleBtn,
                        styles.toggleBtnFlex,
                        sexo === val && styles.toggleAtivo,
                      ]}
                      onPress={() => setSexo(sexo === val ? "" : val)}
                    >
                      <Text
                        style={[
                          styles.toggleTxt,
                          sexo === val && styles.toggleTxtAtivo,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Data de nascimento */}
              <View style={styles.campo}>
                <Text style={styles.label}>Data de nascimento (opcional)</Text>
                <MaskInput
                  style={styles.input}
                  value={nascimento}
                  onChangeText={(masked) => setNascimento(masked)}
                  mask={[
                    /\d/,
                    /\d/,
                    "/",
                    /\d/,
                    /\d/,
                    "/",
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                  ]}
                  keyboardType="numeric"
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#aaa"
                />
              </View>

              {error && <Text style={styles.erro}>{error}</Text>}

              <TouchableOpacity
                style={[styles.btnEntrar, loading && styles.btnDesabilitado]}
                onPress={handleCadastro}
                disabled={loading || !numDocRaw}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnTexto}>Cadastrar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnVoltar}
                onPress={() => setEtapa(1)}
              >
                <Ionicons name="arrow-back-outline" size={16} color="#6b21a8" />
                <Text style={styles.btnVoltarTxt}>Voltar</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Rodapé */}
          <View style={styles.rodape}>
            <Text style={styles.rodapeTexto}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => router.navigate("/(auth)/login")}>
              <Text style={styles.linkLogin}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0a2e",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#e8e6f0",
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  logoWrap: {
    width: 90,
    height: 90,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#111",
    marginBottom: 16,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 13,
    color: "#6b3fa0",
    marginBottom: 16,
  },
  etapas: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  etapaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#c4b8d8",
  },
  etapaAtiva: {
    backgroundColor: "#6b21a8",
  },
  etapaLinha: {
    width: 40,
    height: 2,
    backgroundColor: "#c4b8d8",
    marginHorizontal: 6,
  },
  campo: {
    width: "100%",
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#2a2a3a",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    height: 46,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1a1a2e",
  },
  inputWrap: {
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 13,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  toggleBtnFlex: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  toggleAtivo: {
    borderColor: "#6b21a8",
    backgroundColor: "#f0ebfa",
  },
  toggleTxt: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  toggleTxtAtivo: {
    color: "#6b21a8",
  },
  erro: {
    color: "#c0392b",
    fontSize: 13,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  btnEntrar: {
    width: "100%",
    height: 48,
    backgroundColor: "#6b21a8",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnDesabilitado: {
    opacity: 0.5,
  },
  btnTexto: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  btnVoltar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  btnVoltarTxt: {
    fontSize: 13,
    color: "#6b21a8",
    fontWeight: "500",
  },
  rodape: {
    flexDirection: "row",
    marginTop: 16,
  },
  rodapeTexto: {
    fontSize: 13,
    color: "#555",
  },
  linkLogin: {
    fontSize: 13,
    color: "#6b21a8",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
