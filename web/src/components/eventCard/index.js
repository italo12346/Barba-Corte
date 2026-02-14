const EventCard = ({ event }) => {
  const getBorderColor = () => {
    switch (event.status) {
      case "confirmado":
        return "#10b981";
      case "cancelado":
        return "#ef4444";
      default:
        return "#f59e0b";
    }
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "8px",
        background: "linear-gradient(135deg, #1f2937, #111827)",
        color: "#fff",
        borderLeft: `5px solid ${getBorderColor()}`,
        display: "flex",
        padding: "2px 6px 0px 15px",
  
        overflow: "hidden"
      }}
    >
      <strong style={{ fontSize: 9 }}>
        {event.title}
      </strong>

      <span style={{ fontSize: 8, opacity: 0.85 }}>
        👤 {event.cliente}
      </span>

      <span style={{ fontSize: 8, opacity: 0.7 }}>
        ✂ {event.colaborador}
      </span>
    </div>
  );
};
export default EventCard;
