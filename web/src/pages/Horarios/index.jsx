import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment-timezone";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  Button,
  Modal,
  Form,
  SelectPicker,
  CheckboxGroup,
  Checkbox,
  Loader,
  Message,
  useToaster,
} from "rsuite";
import { useState } from "react";

import {
  allHorarios,
  createHorario,
  updateHorario,
  openHorarioModal,
  closeHorarioModal,
  setCalendarView,
} from "../../store/modules/horario/actions";
import { allColaboradores } from "../../store/modules/colaboradores/actions";

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

// Dias da semana para o CheckboxGroup
const DIAS_OPTIONS = [
  { label: "Domingo",       value: 0 },
  { label: "Segunda-feira", value: 1 },
  { label: "Terça-feira",   value: 2 },
  { label: "Quarta-feira",  value: 3 },
  { label: "Quinta-feira",  value: 4 },
  { label: "Sexta-feira",   value: 5 },
  { label: "Sábado",        value: 6 },
];

// Formata Date → "HH:mm"
function toHHmm(date) {
  return moment(date).format("HH:mm");
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Horario() {
  const dispatch  = useDispatch();
  const toaster   = useToaster();

  const { listaHorarios, loading, error, components } = useSelector(
    (state) => state.horario
  );

const listaColaboradores = useSelector(
  (state) => state.colaborador.lista
);
  // ── Estado local do formulário do modal ──────────────────────────────────
  const [form, setForm] = useState({
    colaboradorId: "",
    diasSemana: [],
    horaInicio: "",
    horaFim: "",
  });

  // ── Converte ISO → Date para o calendário ────────────────────────────────
const eventos = useMemo(() => {
  if (!listaHorarios || !listaColaboradores) return [];

  return listaHorarios.map((e) => {
    const colaborador = listaColaboradores.find(
      (c) => c._id === e.colaboradorId
    );

    return {
      ...e,
      start: new Date(e.start),
      end: new Date(e.end),

      // 👇 aqui é o segredo
      title: `${colaborador?.nome || "Sem colaborador"} `,
    };
  });
}, [listaHorarios, listaColaboradores]);

  // ── Colaboradores para o SelectPicker ────────────────────────────────────
  const colaboradoresOptions = useMemo(
    () =>
      (listaColaboradores || []).map((c) => ({
        label: c.nome,
        value: c._id,
      })),
    [listaColaboradores]
  );

  // ── Load inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(allColaboradores());
    dispatch(allHorarios());
  }, [dispatch]);

  // ── Exibe erro via toast ──────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      toaster.push(
        <Message type="error" showIcon closable duration={4000}>
          {error}
        </Message>
      );
    }
  }, [error, toaster]);

  // ── Sincroniza o modal com os dados do Redux ao abrir ────────────────────
  useEffect(() => {
    if (components.modalOpen) {
      setForm({
        colaboradorId: components.modalSlot.colaboradorId || "",
        diasSemana:    components.modalSlot.diasSemana    || [],
        horaInicio:    components.modalSlot.horaInicio    || "",
        horaFim:       components.modalSlot.horaFim       || "",
      });
    }
  }, [components.modalOpen, components.modalSlot]);

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS DO CALENDÁRIO
  // ─────────────────────────────────────────────────────────────────────────

  const handleViewChange = (view) => {
    dispatch(setCalendarView(view));
  };

  /**
   * Clicou em um SLOT vazio → abre modal para CRIAR.
   * O BigCalendar entrega start/end como objetos Date.
   * Extraímos o dia da semana e as horas no formato HH:mm.
   */
  const handleSelectSlot = ({ start, end }) => {
    const diaSemana = start.getDay(); // 0=dom … 6=sáb

    dispatch(
      openHorarioModal({
        diasSemana: [diaSemana],
        horaInicio: toHHmm(start),
        horaFim:    toHHmm(end),
      })
    );
  };

  /**
   * Clicou em um EVENTO existente → abre modal para EDITAR.
   * O evento já carrega horarioId, colaboradorId, diaSemana, etc.
   */
  const handleSelectEvent = (event) => {
    dispatch(
      openHorarioModal({
        horarioId:    event.horarioId,
        colaboradorId: event.colaboradorId,
        diasSemana:   [event.diaSemana],
        horaInicio:   event.horaInicio,
        horaFim:      event.horaFim,
      })
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUBMIT DO FORMULÁRIO
  // ─────────────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    const { colaboradorId, diasSemana, horaInicio, horaFim } = form;
    const { horarioId } = components.modalSlot;

    const isEdicao = Boolean(horarioId);

    const payload = {
      colaboradorId,
      diasSemana,
      horaInicio,
      horaFim,
    };

    if (isEdicao) {
      dispatch(updateHorario(horarioId, payload));
    } else {
      dispatch(createHorario(payload));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const isEdicao   = Boolean(components.modalSlot?.horarioId);
  const formValido =
    form.colaboradorId &&
    form.diasSemana.length > 0 &&
    form.horaInicio &&
    form.horaFim;

  return (
    <div className="container p-4 overflow-auto">
      <div className="container-cliente">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Horários de Trabalho</h1>

          <Button
            className="btn"
            onClick={() => dispatch(openHorarioModal())}
          >
            Novo Horário
          </Button>
        </div>

        {/* ── Calendário ──────────────────────────────────────────────── */}
        {loading && <Loader center content="Carregando horários..." />}

        <Calendar
          localizer={localizer}
          toolbar={false}
          formats={{
            dateFormat: "DD",
            dayFormat: (date, culture, loc) =>
              loc.format(date, "dddd", culture),
          }}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          selectable
          min={new Date(1970, 1, 1, 8, 0, 0)}
          max={new Date(1970, 1, 1, 18, 0, 0)}
          step={60}
          timeslots={1}
          popup
          view={components.view || "week"}
          onView={handleViewChange}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          style={{ height: 600 }}
        />

        {/* ── Modal de criação / edição ────────────────────────────────── */}
        <Modal
          open={components.modalOpen}
          onClose={() => dispatch(closeHorarioModal())}
          size="sm"
        >
          <Modal.Header className="modalHeader">
            <Modal.Title>
              {isEdicao ? "Editar Horário" : "Novo Horário de Trabalho"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form fluid>

              {/* Colaborador */}
              <Form.Group>
                <Form.Label>Colaborador</Form.Label>
                <SelectPicker
                  block
                  data={colaboradoresOptions}
                  value={form.colaboradorId}
                  onChange={(val) =>
                    setForm((f) => ({ ...f, colaboradorId: val || "" }))
                  }
                  placeholder="Selecione o colaborador"
                />
              </Form.Group>

              {/* Dias da semana */}
              <Form.Group>
                <Form.Label>Dias da semana</Form.Label>
                <CheckboxGroup
                  inline
                  value={form.diasSemana}
                  onChange={(vals) =>
                    setForm((f) => ({ ...f, diasSemana: vals }))
                  }
                >
                  {DIAS_OPTIONS.map((d) => (
                    <Checkbox key={d.value} value={d.value}>
                      {d.label}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </Form.Group>

              {/* Hora início */}
              <Form.Group>
                <Form.Label>Hora de início</Form.Label>
                <input
                  type="time"
                  className="rs-input"
                  value={form.horaInicio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, horaInicio: e.target.value }))
                  }
                />
              </Form.Group>

              {/* Hora fim */}
              <Form.Group>
                <Form.Label>Hora de término</Form.Label>
                <input
                  type="time"
                  className="rs-input"
                  value={form.horaFim}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, horaFim: e.target.value }))
                  }
                />
              </Form.Group>

            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button
              onClick={() => dispatch(closeHorarioModal())}
              appearance="subtle"
            >
              Cancelar
            </Button>

            <Button
              className="btn"
              loading={loading}
              disabled={!formValido || loading}
              onClick={handleSubmit}
            >
              {isEdicao ? "Salvar alterações" : "Criar horário"}
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
    </div>
  );
}
