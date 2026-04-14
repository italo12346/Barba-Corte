import moment from "moment-timezone";
import "moment/locale/pt-br";
import { useEffect, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useDispatch, useSelector } from "react-redux";
import { Button, Loader } from "rsuite";

import { allColaboradores } from "../../store/modules/colaboradores/actions";
import { allHorarios, setCalendarView } from "../../store/modules/horario/actions";

import HorarioFormModal from "../../components/horarioModal";
import HorarioViewModal from "../../components/horarioViewModal";

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

function toHHmm(date) {
  return moment(date).format("HH:mm");
}

export default function Horario() {
  const dispatch = useDispatch();
  const { listaHorarios, loading, components } = useSelector((s) => s.horario);
  const listaColaboradores = useSelector((s) => s.colaborador.lista);

  // ── Estado dos modais ────────────────────────────────────────────────────
  const [viewModalOpen, setViewModalOpen]     = useState(false);
  const [formModalOpen, setFormModalOpen]     = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [slotSelecionado, setSlotSelecionado]       = useState(null);

  // ── Load inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(allColaboradores());
    dispatch(allHorarios());
  }, [dispatch]);

  // ── Eventos do calendário ────────────────────────────────────────────────
  const eventos = useMemo(() => {
    if (!listaHorarios || !listaColaboradores) return [];

    return listaHorarios.map((e) => {
      // Busca o colaborador na lista. 
      // Verificamos tanto se o colaboradorId é um ID direto ou um objeto com _id
      const colaboradorId = e.colaboradorId?._id || e.colaboradorId;
      const colaborador = listaColaboradores.find((c) => c._id === colaboradorId);
      
      return {
        ...e,
        start: new Date(e.start),
        end:   new Date(e.end),
        title: colaborador?.nome || "Sem colaborador",
        colaboradorNome: colaborador?.nome || "Sem colaborador", // Adicionado para o ViewModal
      };
    });
  }, [listaHorarios, listaColaboradores]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  /** Clique num slot vazio → abre FormModal para criar */
  const handleSelectSlot = ({ start, end }) => {
    setHorarioSelecionado(null);
    setSlotSelecionado({
      diasSemana: [start.getDay()],
      horaInicio: toHHmm(start),
      horaFim:    toHHmm(end),
    });
    setFormModalOpen(true);
  };

  /** Clique num evento → abre ViewModal */
  const handleSelectEvent = (event) => {
    setHorarioSelecionado(event);
    setViewModalOpen(true);
  };

  /** Botão "Editar" no ViewModal → fecha view, abre form em modo edição */
  const handleEditar = (horario) => {
    setHorarioSelecionado(horario);
    setSlotSelecionado(null);
    setFormModalOpen(true);
  };

  const handleFecharForm = () => {
    setFormModalOpen(false);
    setHorarioSelecionado(null);
    setSlotSelecionado(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="container p-4 overflow-auto">
      <div className="container-cliente">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Horários de Trabalho</h1>
          <Button className="btn" onClick={() => { setHorarioSelecionado(null); setSlotSelecionado(null); setFormModalOpen(true); }}>
            Novo Horário
          </Button>
        </div>

        {loading && <Loader center content="Carregando horários..." />}

        <Calendar
          localizer={localizer}
          toolbar={false}
          formats={{
            dateFormat: "DD",
            dayFormat: (date, culture, loc) => loc.format(date, "dddd", culture),
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
          onView={(view) => dispatch(setCalendarView(view))}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          style={{ height: 600 }}
        />

      </div>

      {/* Modal de visualização */}
      <HorarioViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        horario={horarioSelecionado}
        onEditar={handleEditar}
      />

      {/* Modal de criação / edição */}
      <HorarioFormModal
        open={formModalOpen}
        onClose={handleFecharForm}
        horario={horarioSelecionado}
        slotInicial={slotSelecionado}
      />
    </div>
  );
}
