import { useEffect, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import "moment/locale/pt-br";

import types from "../../store/modules/agendamento/types";
import EventCard from "../../components/eventCard";
import AgendamentoViewModal from "../../components/AgendamentoViewModal";
import AgendamentoFormModal from "../../components/AgendamentoModal";

const localizer = momentLocalizer(moment);

const Agendamento = () => {
  const dispatch = useDispatch();
  const agendamentos = useSelector((state) => state.agendamento.agendamentos);

  // ── Estado dos modais ────────────────────────────────────────────────────
  const [viewModalOpen, setViewModalOpen]   = useState(false);
  const [formModalOpen, setFormModalOpen]   = useState(false);

  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [slotSelecionado, setSlotSelecionado]               = useState(null);

  // ── Carga inicial ────────────────────────────────────────────────────────
  useEffect(() => {
    const start = moment().startOf("week").toISOString();
    const end   = moment().endOf("week").toISOString();
    dispatch({ type: types.FILTER_AGENDAMENTOS, payload: { start, end } });
  }, [dispatch]);

  // ── Mapeamento de eventos ────────────────────────────────────────────────
  const eventos = useMemo(() =>
    (agendamentos || []).map((a) => ({
      title:    a.servicoId?.titulo || "Agendamento",
      start:    moment.utc(a.dataAgendamento).local().toDate(),
      end:      moment.utc(a.dataAgendamento).local().add(30, "minutes").toDate(),
      resource: a,
    })),
    [agendamentos]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  /** Clique num evento existente → abre modal de visualização */
  const handleSelectEvent = (event) => {
    setAgendamentoSelecionado(event.resource);
    setViewModalOpen(true);
  };

  /** Clique num slot vazio → abre modal de criação com data pré-preenchida */
  const handleSelectSlot = ({ start }) => {
    setAgendamentoSelecionado(null);
    setSlotSelecionado(start);
    setFormModalOpen(true);
  };

  /** Botão "Editar" dentro do ViewModal → fecha view, abre form em modo edição */
  const handleEditar = (agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setSlotSelecionado(null);
    setFormModalOpen(true);
  };

  const handleFecharForm = () => {
    setFormModalOpen(false);
    setAgendamentoSelecionado(null);
    setSlotSelecionado(null);
  };

  // ── Range change ─────────────────────────────────────────────────────────
  const formatRange = (periodo) => {
    if (Array.isArray(periodo)) {
      return {
        start: moment(periodo[0]).format("YYYY-MM-DD"),
        end:   moment(periodo[periodo.length - 1]).format("YYYY-MM-DD"),
      };
    }
    return {
      start: moment(periodo.start).format("YYYY-MM-DD"),
      end:   moment(periodo.end).format("YYYY-MM-DD"),
    };
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="container p-4 overflow-auto">
      <div className="row">
        <div className=" col-12">

          {/* Cabeçalho */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="mb-0">Agendamentos</h1>
          </div>

          {/* Calendário */}
          <Calendar
            localizer={localizer}
            events={eventos}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}   
            selectable                        
            onRangeChange={(periodo) => {
              const { start, end } = formatRange(periodo);
              dispatch({ type: types.FILTER_AGENDAMENTOS, payload: { start, end } });
            }}
            defaultView="week"
            min={new Date(1970, 1, 1, 8, 0, 0)}
            max={new Date(1970, 1, 1, 18, 0, 0)}
            step={60}
            timeslots={1}
            popup
            style={{ height: "70vh", width: "83%" }}
            components={{ event: EventCard }}
          />
        </div>
      </div>

      {/* Modal de visualização */}
      <AgendamentoViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        agendamento={agendamentoSelecionado}
        onEditar={handleEditar}
      />

      {/* Modal de criação / edição */}
      <AgendamentoFormModal
        open={formModalOpen}
        onClose={handleFecharForm}
        agendamento={agendamentoSelecionado}  
        slotInicial={slotSelecionado}
      />
    </div>
  );
};

export default Agendamento;
