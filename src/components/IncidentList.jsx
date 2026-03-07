function remainingTime(inc) {
  const diff = inc.slaDeadline - new Date().getTime();
  if (diff <= 0) return "❌ SLA Breached";
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  return `${hrs}h ${mins}m left`;
}

export default function IncidentList({ incidents, selectedId, onSelect }) {
  return (
    <>
      <h3>Incidents</h3>
      {incidents.map((inc) => (
        <div
          key={inc.id}
          className={`incident-card ${selectedId === inc.id ? "selected" : ""}`}
          onClick={() => onSelect(inc.id)}
        >
          <b>{inc.title}</b>
          <div className="small">{inc.status} | Esc: {inc.escalationLevel}</div>
          <div className="small">{remainingTime(inc)}</div>
        </div>
      ))}
    </>
  );
}