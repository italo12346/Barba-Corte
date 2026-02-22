import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { Button } from "rsuite";

import {
  updateHorario,
  allHorarios,
} from "../../store/modules/horario/actions";

const localizer = momentLocalizer(moment);

export default function Horario() {
  const dispatch = useDispatch();

  const {
    horarios,
    components,
    form,
  } = useSelector((state) => state.horario);

  // ===========================
  // LOAD INICIAL
  // ===========================
  useEffect(() => {
    dispatch(allHorarios());
  }, [dispatch]);

  // ===========================
  // MUDAR VIEW (week, month...)
  // ===========================
  const handleViewChange = (view) => {
    dispatch(
      updateHorario({
        components: { ...components, view },
      })
    );
  };

  // ===========================
  // SELECIONAR SLOT (criar horário)
  // ===========================
  const handleSelectSlot = ({ start, end }) => {
    dispatch(
      updateHorario({
        horario: {
          start,
          end,
        },
        components: { ...components, drawer: true },
        behavior: "create",
      })
    );
  };

  // ===========================
  // SELECIONAR EVENTO (editar)
  // ===========================
  const handleSelectEvent = (event) => {
    dispatch(
      updateHorario({
        horario: event.resource,
        components: { ...components, drawer: true },
        behavior: "update",
      })
    );
  };

  return (
    <div className="container">
      <div style={{ marginBottom: 15, display: "flex", justifyContent: "space-between" }}>
        <h4>Horários de Trabalho</h4>

        <Button
          appearance="primary"
          onClick={() =>
            dispatch(
              updateHorario({
                behavior: "create",
                components: { ...components, drawer: true },
              })
            )
          }
        >
          Novo Horário
        </Button>
      </div>

      <div style={{ height: "80vh" }}>
        <Calendar
          localizer={localizer}
          events={horarios}
          startAccessor="start"
          endAccessor="end"
           selectable
            min={new Date(1970, 1, 1, 8, 0, 0)}
            max={new Date(1970, 1, 1, 18, 0, 0)}
            step={60}
            timeslots={1}
            popup
          view={components.view}
          onView={handleViewChange}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          loading={form.filtering}
           style={{ height: 600, width: "83%" }}
        />
      </div>
    </div>
  );
}
