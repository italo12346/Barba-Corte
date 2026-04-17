import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import customParseFormat from "dayjs/plugin/customParseFormat";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  criarAgendamento,
  fetchColaboradoresSalao,
  fetchDiasDisponiveis,
  gerarPix,
  resetFluxo,
  type Colaborador,
  type DiaAgenda,
  type SlotHorario,
} from "../store/slices/appointmentSlice";

dayjs.extend(customParseFormat);
dayjs.locale("pt-br");

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.88;

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Servico {
  _id: string;
  titulo: string;
  preco: number;
  duracao: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  salaoId: string;
  servico: Servico;
}

type Etapa = "dia" | "horario" | "colaborador" | "confirmar" | "pix";

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AgendamentoModal({
  visible,
  onClose,
  salaoId,
  servico,
}: Props) {
  const dispatch = useAppDispatch();
  const cliente = useAppSelector((state) => state.auth.cliente);

  const {
    colaboradores,
    agenda,
    pix,
    loadingColaboradores,
    loadingAgenda,
    salvando,
    loadingPix,
    erro,
  } = useAppSelector((state) => state.appointment);

  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const [etapa, setEtapa] = useState<Etapa>("dia");
  const [colaboradorSelecionado, setColaboradorSelecionado] =
    useState<Colaborador | null>(null);
  const [diaSelecionado, setDiaSelecionado] = useState<DiaAgenda | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(
    null,
  );

  // ── Abre/fecha ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (visible) {
      dispatch(resetFluxo());
      setEtapa("dia");
      setColaboradorSelecionado(null);
      setDiaSelecionado(null);
      setHorarioSelecionado(null);

      dispatch(fetchColaboradoresSalao(salaoId));
      dispatch(
        fetchDiasDisponiveis({
          salaoId,
          servicoId: servico._id,
          data: dayjs().format("YYYY-MM-DD"),
        }),
      );

      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, dispatch, salaoId, servico._id, translateY]);

  // Quando o PIX chegar, avança a etapa
  useEffect(() => {
    if (pix) setEtapa("pix");
  }, [pix]);

  // Erros vindos do slice
  useEffect(() => {
    if (erro) Alert.alert("Erro", erro);
  }, [erro]);

  const fechar = () => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 280,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  // ── PanResponder ──────────────────────────────────────────────────────────

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, g) => g.dy > 0,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) fechar();
        else
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
      },
    }),
  ).current;

  // ── Ações ─────────────────────────────────────────────────────────────────

  // NOVO FLUXO: dia → horario → colaborador → confirmar → pix

  const selecionarDia = (dia: DiaAgenda) => {
    setDiaSelecionado(dia);
    setHorarioSelecionado(null);
    setColaboradorSelecionado(null);
    setEtapa("horario");
  };

  const selecionarHorario = (hora: string) => {
    setHorarioSelecionado(hora);
    setColaboradorSelecionado(null);
    setEtapa("colaborador");
  };

  const selecionarColaborador = (c: Colaborador) => {
    setColaboradorSelecionado(c);
    setEtapa("confirmar");
  };

  const confirmarAgendamento = async () => {
    if (!diaSelecionado || !horarioSelecionado || !cliente) return;

    const dataHora = dayjs(
      `${diaSelecionado.data} ${horarioSelecionado}`,
      "YYYY-MM-DD HH:mm",
    ).toISOString();

    const result = await dispatch(
      criarAgendamento({
        salaoId,
        servicoId: servico._id,
        clienteId: cliente._id,
        colaboradorId: colaboradorSelecionado?._id,
        dataAgendamento: dataHora,
      }),
    );

    if (criarAgendamento.fulfilled.match(result)) {
      dispatch(gerarPix(result.payload));
    }
  };

  // ── Derivados ─────────────────────────────────────────────────────────────

  // Todos os horários do dia selecionado (sem filtrar por colaborador ainda)
  const horariosDisponiveis = diaSelecionado
    ? Array.from(
        new Map(
          diaSelecionado.disponibilidade
            .flatMap((d) => d.horarios)
            .map((h) => [h.hora, h]),
        ).values(),
      ).sort((a, b) => a.hora.localeCompare(b.hora))
    : [];

  // Colaboradores que fazem o serviço E estão disponíveis no horário selecionado
  const colaboradoresFiltrados = colaboradores.filter((c: Colaborador) => {
    // Verifica se faz o serviço
    const fazServico =
      !c.especialidades ||
      c.especialidades.length === 0 ||
      c.especialidades.some((e: any) => {
        const eId = typeof e === "string" ? e : e?._id ?? e?.id;
        return (
          String(eId) === String(servico._id) ||
          String(eId) === String((servico as any).id)
        );
      });

    if (!fazServico) return false;

    // Verifica se está disponível no dia e horário selecionados
    if (!diaSelecionado || !horarioSelecionado) return false;

    return diaSelecionado.disponibilidade.some(
      (d) =>
        String(d.colaboradorId) === String(c._id) &&
        d.horarios.some(
          (h: SlotHorario) =>
            h.hora === horarioSelecionado && h.status === "livre",
        ),
    );
  });

  // ── Progresso ─────────────────────────────────────────────────────────────

  const etapas: Etapa[] = ["dia", "horario", "colaborador", "confirmar"];
  const etapaIndex = etapas.indexOf(etapa as any);

  const titulos: Record<Etapa, string> = {
    dia: "Escolha o dia",
    horario: "Escolha o horário",
    colaborador: "Escolha o profissional",
    confirmar: "Confirmar agendamento",
    pix: "Pagamento PIX",
  };

  const voltar = () => {
    const map: Partial<Record<Etapa, Etapa>> = {
      horario: "dia",
      colaborador: "horario",
      confirmar: "colaborador",
    };
    const anterior = map[etapa];
    if (anterior) setEtapa(anterior);
    else fechar();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={fechar}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={fechar}
        />

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Handle */}
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            {etapa !== "dia" && etapa !== "pix" ? (
              <TouchableOpacity onPress={voltar} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={22} color="#6b21a8" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{titulos[etapa]}</Text>
              {etapa !== "pix" && (
                <Text style={styles.headerServico} numberOfLines={1}>
                  {servico.titulo}
                </Text>
              )}
            </View>

            <TouchableOpacity onPress={fechar} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Barra de progresso */}
          {etapa !== "pix" && (
            <View style={styles.progressBar}>
              {etapas.map((e, i) => (
                <View
                  key={e}
                  style={[
                    styles.progressSegment,
                    {
                      backgroundColor: i <= etapaIndex ? "#6b21a8" : "#E0E0E0",
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Conteúdo */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* ── ETAPA 1: Dia ── */}
            {etapa === "dia" && (
              <View>
                {loadingAgenda ? (
                  <ActivityIndicator
                    color="#6b21a8"
                    style={{ marginTop: 40 }}
                  />
                ) : agenda.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="event-busy" size={48} color="#CCC" />
                    <Text style={styles.emptyText}>
                      Sem disponibilidade nos próximos 7 dias
                    </Text>
                  </View>
                ) : (
                  <View style={styles.diasGrid}>
                    {agenda.map((dia: DiaAgenda) => {
                      const mDia = dayjs(dia.data);
                      const selecionado = diaSelecionado?.data === dia.data;
                      const livres = dia.disponibilidade
                        .flatMap((d) =>
                          d.horarios.filter(
                            (h: SlotHorario) => h.status === "livre",
                          ),
                        ).length;

                      return (
                        <TouchableOpacity
                          key={dia.data}
                          style={[
                            styles.diaCard,
                            selecionado && styles.diaCardSelecionado,
                          ]}
                          onPress={() => selecionarDia(dia)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.diaSemana,
                              selecionado && styles.diaTextSelecionado,
                            ]}
                          >
                            {mDia.format("ddd").toUpperCase()}
                          </Text>
                          <Text
                            style={[
                              styles.diaDia,
                              selecionado && styles.diaTextSelecionado,
                            ]}
                          >
                            {mDia.format("DD")}
                          </Text>
                          <Text
                            style={[
                              styles.diaMes,
                              selecionado && styles.diaTextSelecionado,
                            ]}
                          >
                            {mDia.format("MMM")}
                          </Text>
                          <View
                            style={[
                              styles.diaSlots,
                              selecionado && styles.diaSlotsSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.diaSlotsText,
                                selecionado && styles.diaTextSelecionado,
                              ]}
                            >
                              {livres} horários
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* ── ETAPA 2: Horário ── */}
            {etapa === "horario" && (
              <View>
                <Text style={styles.horarioSubtitle}>
                  {diaSelecionado &&
                    dayjs(diaSelecionado.data).format("dddd, DD [de] MMMM")}
                </Text>
                {horariosDisponiveis.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="access-time" size={48} color="#CCC" />
                    <Text style={styles.emptyText}>
                      Nenhum horário disponível neste dia
                    </Text>
                  </View>
                ) : (
                  <View style={styles.horariosGrid}>
                    {horariosDisponiveis.map((slot: SlotHorario) => {
                      const livre = slot.status === "livre";
                      const selecionado = horarioSelecionado === slot.hora;
                      return (
                        <TouchableOpacity
                          key={slot.hora}
                          disabled={!livre}
                          style={[
                            styles.slotBtn,
                            !livre && styles.slotReservado,
                            selecionado && styles.slotSelecionado,
                          ]}
                          onPress={() => selecionarHorario(slot.hora)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.slotText,
                              !livre && styles.slotTextReservado,
                              selecionado && styles.slotTextSelecionado,
                            ]}
                          >
                            {slot.hora}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* ── ETAPA 3: Colaborador ── */}
            {etapa === "colaborador" && (
              <View>
                {loadingColaboradores ? (
                  <ActivityIndicator
                    color="#6b21a8"
                    style={{ marginTop: 40 }}
                  />
                ) : colaboradoresFiltrados.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="person-off" size={48} color="#CCC" />
                    <Text style={styles.emptyText}>
                      Nenhum profissional disponível para este horário
                    </Text>
                  </View>
                ) : (
                  colaboradoresFiltrados.map((c: Colaborador) => (
                    <TouchableOpacity
                      key={c._id}
                      style={styles.colaboradorCard}
                      onPress={() => selecionarColaborador(c)}
                      activeOpacity={0.8}
                    >
                      {c.foto ? (
                        <Image
                          source={{ uri: c.foto }}
                          style={styles.colaboradorFoto}
                        />
                      ) : (
                        <View style={styles.colaboradorAvatarFallback}>
                          <Text style={styles.colaboradorAvatarInitial}>
                            {c.nome.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.colaboradorInfo}>
                        <Text style={styles.colaboradorNome}>{c.nome}</Text>
                        <Text style={styles.colaboradorSub}>
                          Disponível às {horarioSelecionado}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* ── ETAPA 4: Confirmar ── */}
            {etapa === "confirmar" && (
              <View>
                <View style={styles.resumoCard}>
                  <Text style={styles.resumoTitulo}>Resumo do agendamento</Text>

                  <ResumoLinha
                    icone="content-cut"
                    label="Serviço"
                    valor={servico.titulo}
                  />
                  <ResumoLinha
                    icone="person"
                    label="Profissional"
                    valor={
                      colaboradorSelecionado?.nome ?? "Qualquer disponível"
                    }
                  />
                  <ResumoLinha
                    icone="calendar-today"
                    label="Data"
                    valor={
                      diaSelecionado
                        ? dayjs(diaSelecionado.data).format("DD/MM/YYYY")
                        : ""
                    }
                  />
                  <ResumoLinha
                    icone="access-time"
                    label="Horário"
                    valor={horarioSelecionado ?? ""}
                  />
                  <ResumoLinha
                    icone="timer"
                    label="Duração"
                    valor={`${servico.duracao} min`}
                  />

                  <View style={styles.resumoDivider} />

                  <View style={styles.resumoTotal}>
                    <Text style={styles.resumoTotalLabel}>Total</Text>
                    <Text style={styles.resumoTotalValor}>
                      R$ {servico.preco.toFixed(2).replace(".", ",")}
                    </Text>
                  </View>
                </View>

                <View style={styles.pixInfo}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color="#6b21a8"
                  />
                  <Text style={styles.pixInfoText}>
                    O pagamento será feito via PIX. O QR Code expira em 30
                    minutos.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.btnConfirmar,
                    (salvando || loadingPix) && { opacity: 0.7 },
                  ]}
                  onPress={confirmarAgendamento}
                  disabled={salvando || loadingPix}
                  activeOpacity={0.85}
                >
                  {salvando || loadingPix ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="qr-code-outline" size={20} color="#FFF" />
                      <Text style={styles.btnConfirmarText}>Gerar PIX</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ── ETAPA 5: PIX ── */}
            {etapa === "pix" && pix && (
              <View style={styles.pixContainer}>
                <View style={styles.pixSuccessIcon}>
                  <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
                </View>
                <Text style={styles.pixTitle}>Agendamento criado!</Text>
                <Text style={styles.pixSubtitle}>
                  Escaneie o QR Code abaixo para pagar
                </Text>

                <View style={styles.qrWrapper}>
                  <Image
                    source={{ uri: `data:image/png;base64,${pix.qrBase64}` }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.pixExpiracao}>
                  <Ionicons name="time-outline" size={14} color="#dc2626" />
                  <Text style={styles.pixExpiracaoText}>
                    Expira às {dayjs(pix.expiracao).format("HH:mm")}
                  </Text>
                </View>

                <View style={styles.pixCopiaCola}>
                  <Text style={styles.pixCopiaColaLabel}>Pix Copia e Cola</Text>
                  <Text
                    style={styles.pixCopiaColaValor}
                    numberOfLines={2}
                    selectable
                  >
                    {pix.qrCode}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.btnFecharPix}
                  onPress={fechar}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnFecharPixText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Linha de resumo ──────────────────────────────────────────────────────────

function ResumoLinha({
  icone,
  label,
  valor,
}: {
  icone: string;
  label: string;
  valor: string;
}) {
  return (
    <View style={styles.resumoLinha}>
      <MaterialIcons name={icone as any} size={18} color="#6b21a8" />
      <Text style={styles.resumoLabel}>{label}</Text>
      <Text style={styles.resumoValor}>{valor}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handleArea: { alignItems: "center", paddingVertical: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E0E0E0" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800", color: "#1a0a2e" },
  headerServico: {
    fontSize: 12,
    color: "#6b21a8",
    fontWeight: "600",
    marginTop: 2,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: "#F4F5FB",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  progressBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 6,
    marginBottom: 20,
  },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },

  content: { flex: 1, paddingHorizontal: 20 },
  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#999", marginTop: 12, fontSize: 14, textAlign: "center" },

  colaboradorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FD",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  colaboradorFoto: { width: 50, height: 50, borderRadius: 25 },
  colaboradorAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6b21a8",
    justifyContent: "center",
    alignItems: "center",
  },
  colaboradorAvatarInitial: { color: "#FFF", fontWeight: "800", fontSize: 20 },
  colaboradorInfo: { flex: 1, marginLeft: 14 },
  colaboradorNome: { fontSize: 15, fontWeight: "800", color: "#1a0a2e" },
  colaboradorSub: { fontSize: 12, color: "#999", marginTop: 2 },

  diasGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  diaCard: {
    width: "30%",
    backgroundColor: "#F8F9FD",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  diaCardSelecionado: { backgroundColor: "#6b21a8", borderColor: "#6b21a8" },
  diaSemana: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    letterSpacing: 1,
  },
  diaDia: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a0a2e",
    marginVertical: 2,
  },
  diaMes: { fontSize: 12, color: "#666", fontWeight: "600" },
  diaTextSelecionado: { color: "#FFF" },
  diaSlots: {
    marginTop: 8,
    backgroundColor: "#E8E0F8",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  diaSlotsSelected: { backgroundColor: "rgba(255,255,255,0.25)" },
  diaSlotsText: { fontSize: 10, fontWeight: "700", color: "#6b21a8" },

  horarioSubtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    marginBottom: 20,
    textTransform: "capitalize",
  },
  horariosGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slotBtn: {
    width: "22%",
    backgroundColor: "#F8F9FD",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  slotReservado: { backgroundColor: "#F0F0F0", opacity: 0.5 },
  slotSelecionado: { backgroundColor: "#6b21a8", borderColor: "#6b21a8" },
  slotText: { fontSize: 13, fontWeight: "700", color: "#1a0a2e" },
  slotTextReservado: { color: "#CCC", textDecorationLine: "line-through" },
  slotTextSelecionado: { color: "#FFF" },

  resumoCard: {
    backgroundColor: "#F8F9FD",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  resumoTitulo: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1a0a2e",
    marginBottom: 16,
  },
  resumoLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  resumoLabel: { flex: 1, fontSize: 13, color: "#666", fontWeight: "600" },
  resumoValor: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1a0a2e",
    textAlign: "right",
    maxWidth: "55%",
  },
  resumoDivider: { height: 1, backgroundColor: "#E0E0E0", marginVertical: 14 },
  resumoTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resumoTotalLabel: { fontSize: 15, fontWeight: "800", color: "#1a0a2e" },
  resumoTotalValor: { fontSize: 20, fontWeight: "800", color: "#6b21a8" },

  pixInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F3E8FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  pixInfoText: {
    flex: 1,
    fontSize: 12,
    color: "#6b21a8",
    fontWeight: "600",
    lineHeight: 18,
  },

  btnConfirmar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#6b21a8",
    borderRadius: 18,
    paddingVertical: 18,
  },
  btnConfirmarText: { color: "#FFF", fontWeight: "800", fontSize: 16 },

  pixContainer: { alignItems: "center", paddingTop: 10 },
  pixSuccessIcon: { marginBottom: 12 },
  pixTitle: { fontSize: 22, fontWeight: "800", color: "#1a0a2e" },
  pixSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
    marginBottom: 24,
    textAlign: "center",
  },
  qrWrapper: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  qrImage: { width: 220, height: 220 },
  pixExpiracao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pixExpiracaoText: { fontSize: 12, fontWeight: "700", color: "#dc2626" },
  pixCopiaCola: {
    width: "100%",
    backgroundColor: "#F8F9FD",
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  pixCopiaColaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pixCopiaColaValor: {
    fontSize: 11,
    color: "#1a0a2e",
    fontWeight: "600",
    lineHeight: 18,
  },
  btnFecharPix: {
    marginTop: 24,
    backgroundColor: "#F3E8FF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  btnFecharPixText: { color: "#6b21a8", fontWeight: "800", fontSize: 15 },
});