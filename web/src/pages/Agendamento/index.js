import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useDispatch, useSelector } from "react-redux";
import types from "../../store/modules/agendamento/types";
import EventCard from "../../components/eventCard";
import AgendamentoModal from "../../components/AgendamentoModal";

const localizer = momentLocalizer(moment);

const Agendamento = () => {
  const dispatch = useDispatch();

  const agendamentos = useSelector((state) => state.agendamento.agendamentos);

  const [modalOpen, setModalOpen] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);

  // 🔹 Carrega semana inicial
  useEffect(() => {
    const start = moment().startOf("week").toISOString();
    const end = moment().endOf("week").toISOString();

    dispatch({
      type: types.FILTER_AGENDAMENTOS,
      payload: { start, end },
    });
  }, [dispatch]);

  // 🔹 Mapeia eventos para o calendário
  const eventos = useMemo(() => {
    return (agendamentos || []).map((a) => ({
      title: a.servicoId?.titulo || "Agendamento",

      start: moment.utc(a.dataAgendamento).local().toDate(),
      end: moment.utc(a.dataAgendamento).local().add(30, "minutes").toDate(),

      resource: a, // 👈 GUARDA O OBJETO COMPLETO
    }));
  }, [agendamentos]);

  // 🔹 Clique no evento
  const handleSelectEvent = (event) => {
    setAgendamentoSelecionado(event.resource); // 👈 pega original
    setModalOpen(true);
  };

  const formatRange = (periodo) => {
    if (Array.isArray(periodo)) {
      return {
        start: moment(periodo[0]).format("YYYY-MM-DD"),
        end: moment(periodo[periodo.length - 1]).format("YYYY-MM-DD"),
      };
    }

    return {
      start: moment(periodo.start).format("YYYY-MM-DD"),
      end: moment(periodo.end).format("YYYY-MM-DD"),
    };
  };

  return (
    <div className="container p-4 overflow-auto">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Agendamentos</h1>

          <Calendar
            localizer={localizer}
            events={eventos}
            onSelectEvent={handleSelectEvent}
            onRangeChange={(periodo) => {
              const { start, end } = formatRange(periodo);

              dispatch({
                type: types.FILTER_AGENDAMENTOS,
                payload: { start, end },
              });
            }}
            defaultView="week"
            selectable
            min={new Date(1970, 1, 1, 8, 0, 0)}
            max={new Date(1970, 1, 1, 18, 0, 0)}
            step={60}
            timeslots={1}
            popup
            style={{ height: "70vh", width: "83%" }}
            components={{
              event: EventCard,
            }}
          />
        </div>
      </div>

      {/* 🔥 MODAL */}
      <AgendamentoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        agendamento={agendamentoSelecionado}
      />
    </div>
  );
};

export default Agendamento;
