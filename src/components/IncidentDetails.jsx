import AuditLog from "./AuditLog";

function now() {
  return new Date().getTime();
}

function addAudit(inc, from, to, by, reason = "") {
  return {
    ...inc,
    status: to,
    updatedAt: now(),
    audit: [
      ...inc.audit,
      { from, to, by, time: new Date().toLocaleString(), reason },
    ],
  };
}

export default function IncidentDetails({ incident, role, updateIncident }) {
  function assign() {
    updateIncident(incident.id, (old) =>
      addAudit({ ...old, assignedTo: "Resolver" }, old.status, "Assigned", "Admin")
    );
  }

  function start() {
    updateIncident(incident.id, (old) =>
      addAudit(old, old.status, "In Progress", "Resolver")
    );
  }

  function resolve() {
    const notes = prompt("Resolution notes:");
    if (!notes) return;
    updateIncident(incident.id, (old) =>
      addAudit({ ...old, resolutionNotes: notes }, old.status, "Resolved", "Resolver")
    );
  }

  function close() {
    const notes = prompt("Closing notes:");
    if (!notes) return;
    updateIncident(incident.id, (old) =>
      addAudit({ ...old, resolutionNotes: notes }, old.status, "Closed", "Admin")
    );
  }

  return (
    <>
      <h3>Incident Details</h3>
      <p><b>Title:</b> {incident.title}</p>
      <p><b>Status:</b> {incident.status}</p>
      <p><b>Assigned To:</b> {incident.assignedTo || "None"}</p>
      <p><b>Escalation Level:</b> {incident.escalationLevel}</p>

      <div className="actions">
        {role === "Admin" && incident.status === "Open" && <button className="btn" onClick={assign}>Assign</button>}
        {role === "Resolver" && incident.status === "Assigned" && <button className="btn" onClick={start}>Start</button>}
        {role === "Resolver" && incident.status === "In Progress" && <button className="btn" onClick={resolve}>Resolve</button>}
        {role === "Admin" && incident.status === "Resolved" && <button className="btn" onClick={close}>Close</button>}
      </div>

      <AuditLog logs={incident.audit} />
    </>
  );
}