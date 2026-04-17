import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaskInput from "react-native-mask-input";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logout } from "../../../store/slices/authSlice";
import api from "../../../services/api";
import { fetchHistoricoCliente } from "../../../store/slices/appointmentSlice";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  sexo: "M" | "F" | "O" | "";
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  confirmado: { label: "Confirmado", color: "#16a34a", bg: "#dcfce7" },
  concluido: { label: "Concluído", color: "#6b21a8", bg: "#f3e8ff" },
  cancelado: { label: "Cancelado", color: "#dc2626", bg: "#fee2e2" },
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function Perfil() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cliente = useAppSelector((state) => state.auth.cliente);
  const { historico, loadingHistorico } = useAppSelector((s) => s.appointment);

  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [fotoLocal, setFotoLocal] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    nome: cliente?.nome ?? "",
    email: cliente?.email ?? "",
    telefone: cliente?.telefone ?? "",
    dataNascimento: cliente?.dataNascimento
      ? new Date(cliente.dataNascimento).toLocaleDateString("pt-BR")
      : "",
    sexo: (cliente?.sexo as FormData["sexo"]) ?? "",
  });

  useEffect(() => {
    if (cliente?._id) {
      dispatch(fetchHistoricoCliente(cliente._id));
    }
  }, [cliente?._id, dispatch]);

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome ?? "",
        email: cliente.email ?? "",
        telefone: cliente.telefone ?? "",
        dataNascimento: cliente.dataNascimento
          ? new Date(cliente.dataNascimento).toLocaleDateString("pt-BR")
          : "",
        sexo: (cliente.sexo as FormData["sexo"]) ?? "",
      });
    }
  }, [cliente]);

  // ── Foto ────────────────────────────────────────────────────────────────────

  const handleTrocarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à sua galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setFotoLocal(asset.uri);
    setUploadingFoto(true);

    try {
      const formData = new global.FormData();
      formData.append("clienteId", cliente!._id);
      formData.append("foto", {
        uri: asset.uri,
        name: "foto.jpg",
        type: "image/jpeg",
      } as any);

      await api.post("/cliente/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Sucesso", "Foto atualizada com sucesso!");
    } catch (err) {
      console.error("Erro ao fazer upload da foto:", err);
      Alert.alert("Erro", "Não foi possível atualizar a foto.");
      setFotoLocal(null);
    } finally {
      setUploadingFoto(false);
    }
  };

  // ── Salvar dados ─────────────────────────────────────────────────────────────

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      Alert.alert("Atenção", "O nome não pode ser vazio.");
      return;
    }

    setSalvando(true);
    try {
      const formData = new global.FormData();
      formData.append("clienteId", cliente!._id);
      formData.append(
        "cliente",
        JSON.stringify({
          nome: form.nome,
          telefone: form.telefone,
          sexo: form.sexo || undefined,
        })
      );

      await api.post("/cliente/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Sucesso", "Dados atualizados com sucesso!");
      setEditando(false);
    } catch (err) {
      console.error("Erro ao salvar dados:", err);
      Alert.alert("Erro", "Não foi possível salvar os dados.");
    } finally {
      setSalvando(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          router.replace("/(auth)/login" as any);
        },
      },
    ]);
  };

  // ── Sexo selector ────────────────────────────────────────────────────────────

  const sexoOptions: { label: string; value: FormData["sexo"] }[] = [
    { label: "Masculino", value: "M" },
    { label: "Feminino", value: "F" },
    { label: "Outro", value: "O" },
  ];

  const fotoUri = fotoLocal ?? cliente?.foto ?? null;
  const primeiroNome = cliente?.nome?.split(" ")[0] ?? "";

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0a2e" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* ── Hero ────────────────────────────────────────────────────── */}
          <View style={styles.hero}>
            <View style={styles.heroBg} />

            {/* Avatar */}
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={handleTrocarFoto}
              activeOpacity={0.85}
            >
              {uploadingFoto ? (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator color="#FFF" size="large" />
                </View>
              ) : fotoUri ? (
                <Image source={{ uri: fotoUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {primeiroNome.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.cameraBtn}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>

            <Text style={styles.heroNome}>{cliente?.nome ?? ""}</Text>
            <Text style={styles.heroEmail}>{cliente?.email ?? ""}</Text>
          </View>

          {/* ── Dados Pessoais ────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Dados Pessoais</Text>
              <TouchableOpacity
                style={[styles.editBtn, editando && styles.editBtnAtivo]}
                onPress={() => (editando ? handleSalvar() : setEditando(true))}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons
                      name={editando ? "checkmark" : "pencil"}
                      size={14}
                      color="#FFF"
                    />
                    <Text style={styles.editBtnText}>
                      {editando ? "Salvar" : "Editar"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {editando && (
              <TouchableOpacity
                style={styles.cancelarBtn}
                onPress={() => setEditando(false)}
              >
                <Text style={styles.cancelarText}>Cancelar edição</Text>
              </TouchableOpacity>
            )}

            {/* Nome */}
            <Campo
              label="Nome completo"
              icon="person-outline"
              value={form.nome}
              editando={editando}
              onChangeText={(v) => setForm((f) => ({ ...f, nome: v }))}
            />

            {/* Email — não editável */}
            <Campo
              label="E-mail"
              icon="mail-outline"
              value={form.email}
              editando={false}
            />

            {/* Telefone */}
            <View style={styles.campoWrapper}>
              <View style={styles.campoLabelRow}>
                <Ionicons name="call-outline" size={16} color="#6b21a8" />
                <Text style={styles.campoLabel}>Telefone</Text>
              </View>
              {editando ? (
                <MaskInput
                  style={styles.campoInput}
                  value={form.telefone}
                  onChangeText={(masked) =>
                    setForm((f) => ({ ...f, telefone: masked }))
                  }
                  mask={[
                    "(",
                    /\d/,
                    /\d/,
                    ")",
                    " ",
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                    "-",
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                  ]}
                  keyboardType="phone-pad"
                  placeholderTextColor="#CCC"
                  placeholder="(85) 99999-9999"
                />
              ) : (
                <Text style={styles.campoValor}>{form.telefone || "—"}</Text>
              )}
            </View>

            {/* Data de nascimento */}
            <Campo
              label="Data de nascimento"
              icon="calendar-outline"
              value={form.dataNascimento}
              editando={editando}
              keyboardType="numeric"
              onChangeText={(v) =>
                setForm((f) => ({ ...f, dataNascimento: v }))
              }
            />

            {/* Sexo */}
            <View style={styles.campoWrapper}>
              <View style={styles.campoLabelRow}>
                <Ionicons name="people-outline" size={16} color="#6b21a8" />
                <Text style={styles.campoLabel}>Sexo</Text>
              </View>
              {editando ? (
                <View style={styles.sexoRow}>
                  {sexoOptions.map((op) => (
                    <TouchableOpacity
                      key={op.value}
                      style={[
                        styles.sexoBtn,
                        form.sexo === op.value && styles.sexoBtnAtivo,
                      ]}
                      onPress={() => setForm((f) => ({ ...f, sexo: op.value }))}
                    >
                      <Text
                        style={[
                          styles.sexoBtnText,
                          form.sexo === op.value && styles.sexoBtnTextAtivo,
                        ]}
                      >
                        {op.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.campoValor}>
                  {form.sexo === "M"
                    ? "Masculino"
                    : form.sexo === "F"
                    ? "Feminino"
                    : form.sexo === "O"
                    ? "Outro"
                    : "—"}
                </Text>
              )}
            </View>
          </View>

          {/* ── Histórico de Agendamentos ─────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Meus Agendamentos</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{historico.length}</Text>
              </View>
            </View>

            {/* Loading state */}
            {loadingHistorico ? (
              <ActivityIndicator
                color="#6b21a8"
                style={{ marginVertical: 20 }}
              />
            ) : historico.length === 0 ? (
              <Text
                style={{
                  color: "#9E9E9E",
                  textAlign: "center",
                  paddingVertical: 20,
                }}
              >
                Nenhum agendamento encontrado
              </Text>
            ) : (
              historico.map((ag, index) => {
                const cfg =
                  STATUS_CONFIG[ag.status] ?? STATUS_CONFIG["confirmado"];
                return (
                  <View key={ag._id ?? index} style={styles.agCard}>
                    <View style={styles.agLeft}>
                      <View style={styles.agIconBox}>
                        <MaterialIcons
                          name="content-cut"
                          size={18}
                          color="#6b21a8"
                        />
                      </View>
                    </View>
                    <View style={styles.agInfo}>
                      <Text style={styles.agSalao}>{ag.servico}</Text>
                      <Text style={styles.agServico}>{ag.colaborador}</Text>
                      <View style={styles.agDateRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={12}
                          color="#999"
                        />
                        <Text style={styles.agDate}>
                          {new Date(ag.data).toLocaleDateString("pt-BR")} — R${" "}
                          {ag.valor?.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[styles.agStatus, { backgroundColor: cfg.bg }]}
                    >
                      <Text style={[styles.agStatusText, { color: cfg.color }]}>
                        {cfg.label}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* ── Logout ───────────────────────────────────────────────── */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Campo reutilizável ───────────────────────────────────────────────────────

interface CampoProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
  editando: boolean;
  keyboardType?: "default" | "phone-pad" | "numeric" | "email-address";
  onChangeText?: (v: string) => void;
}

function Campo({
  label,
  icon,
  value,
  editando,
  keyboardType = "default",
  onChangeText,
}: CampoProps) {
  return (
    <View style={styles.campoWrapper}>
      <View style={styles.campoLabelRow}>
        <Ionicons name={icon} size={16} color="#6b21a8" />
        <Text style={styles.campoLabel}>{label}</Text>
      </View>
      {editando && onChangeText ? (
        <TextInput
          style={styles.campoInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor="#CCC"
          autoCapitalize="words"
        />
      ) : (
        <Text style={styles.campoValor}>{value || "—"}</Text>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#1a0a2e" },
  scroll: { flex: 1, backgroundColor: "#F4F5FB" },

  // Hero
  hero: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 36,
    backgroundColor: "#1a0a2e",
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1a0a2e",
  },
  avatarWrapper: { position: "relative", marginBottom: 14 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#6b21a8",
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#6b21a8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#9333ea",
  },
  avatarLoading: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#3b1060",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { color: "#FFF", fontSize: 42, fontWeight: "800" },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#6b21a8",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1a0a2e",
  },
  heroNome: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.3,
  },
  heroEmail: { fontSize: 13, color: "#c4b8d8", marginTop: 4 },

  // Card
  card: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#1a0a2e" },

  // Edit button
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#6b21a8",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editBtnAtivo: { backgroundColor: "#16a34a" },
  editBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  cancelarBtn: { marginBottom: 16 },
  cancelarText: {
    color: "#9E9E9E",
    fontSize: 13,
    textDecorationLine: "underline",
  },

  // Badge
  badge: {
    backgroundColor: "#f3e8ff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: "#6b21a8", fontWeight: "800", fontSize: 13 },

  // Campo
  campoWrapper: { marginBottom: 18 },
  campoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  campoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b21a8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  campoValor: {
    fontSize: 15,
    color: "#1a0a2e",
    fontWeight: "600",
    paddingLeft: 2,
  },
  campoInput: {
    fontSize: 15,
    color: "#1a0a2e",
    fontWeight: "600",
    borderBottomWidth: 2,
    borderBottomColor: "#6b21a8",
    paddingVertical: 6,
    paddingHorizontal: 2,
  },

  // Sexo
  sexoRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  sexoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F4F5FB",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sexoBtnAtivo: { backgroundColor: "#6b21a8", borderColor: "#6b21a8" },
  sexoBtnText: { fontSize: 13, fontWeight: "700", color: "#9E9E9E" },
  sexoBtnTextAtivo: { color: "#FFF" },

  // Agendamentos
  agCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  agLeft: {},
  agIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#f3e8ff",
    justifyContent: "center",
    alignItems: "center",
  },
  agInfo: { flex: 1 },
  agSalao: { fontSize: 14, fontWeight: "800", color: "#1a0a2e" },
  agServico: { fontSize: 13, color: "#666", marginTop: 2 },
  agDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  agDate: { fontSize: 11, color: "#999" },
  agStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  agStatusText: { fontSize: 11, fontWeight: "800" },

  mockAviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    justifyContent: "center",
  },
  mockAvisoText: { fontSize: 12, color: "#9E9E9E", fontStyle: "italic" },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#fca5a5",
    elevation: 2,
    shadowColor: "#dc2626",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  logoutText: { fontSize: 15, fontWeight: "800", color: "#dc2626" },
});
