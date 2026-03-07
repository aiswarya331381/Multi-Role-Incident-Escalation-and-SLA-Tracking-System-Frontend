import { useEffect, useMemo, useState } from "react";
import "./App.css";

const ROLES = ["Reporter", "Resolver", "Admin"];

const SEVERITY_HOURS = {
  Low: 48,
  Medium: 24,
  High: 8,
  Critical: 4,
};

const TRANSITIONS = {
  Open: ["Assigned", "Escalated"],
  Assigned: ["In Progress", "Escalated"],
  "In Progress": ["Resolved", "Escalated"],
  Resolved: ["Closed"],
  Closed: [],
  Escalated: [],
};

const isBlank = (s) => !s || !s.trim();

export default function App() {
  const [role, setRole] = useState("Reporter");
  const [incidents, setIncidents] = useState([]);
  const [audit, setAudit] = useState({});
  const [form, setForm] = useState({ title: "", description: "", severity: "Low" });
  const [formErrors, setFormErrors] = useState({});
  const [actionErrors, setActionErrors] = useState({}); // per-incident errors

  // ---------- SLA AUTO CHECK (every 5s for demo) ----------
  useEffect(() => {
    const timer = setInterval(() => {
      setIncidents((prev) =>
        prev.map((inc) => {
          if (
            inc.status !== "Resolved" &&
            inc.status !== "Closed" &&
            new Date() > new Date(inc.slaDeadline) &&
            inc.escalationLevel < 2
          ) {
            const newLevel = inc.escalationLevel + 1;
            const updated = {
              ...inc,
              status: "Escalated",
              escalationLevel: newLevel,
              assignedTo: newLevel === 2 ? "Admin" : inc.assignedTo,
              updatedAt: new Date().toISOString(),
            };
            addAudit(inc.id, inc.status, "Escalated", "System (SLA)");
            return updated;
          }
          return inc;
        })
      );
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // ---------- AUDIT ----------
  function addAudit(id, prev, next, by, reason = "") {
    setAudit((old) => {
      const logs = old[id] || [];
      return {
        ...old,
        [id]: [
          ...logs,
          { prev, next, by, reason, time: new Date().toLocaleString() },
        ],
      };
    });
  }

  // ---------- VALIDATIONS (PPT) ----------
  function validateForm() {
    const e = {};
    if (isBlank(form.title)) e.title = "Title is required.";
    else if (form.title.trim().length < 8) e.title = "Title must be at least 8 characters.";
    if (isBlank(form.description)) e.description = "Description is required.";
    else if (form.description.trim().length < 20)
      e.description = "Description must be at least 20 characters.";
    if (!["Low", "Medium", "High", "Critical"].includes(form.severity))
      e.severity = "Severity must be Low / Medium / High / Critical.";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  // ---------- CREATE ----------
  function createIncident() {
    if (!validateForm()) return;

    const now = new Date();
    const sla = new Date(now.getTime() + SEVERITY_HOURS[form.severity] * 60 * 60 * 1000);

    const newIncident = {
      id: Date.now(),
      title: form.title.trim(),
      description: form.description.trim(),
      severity: form.severity,
      reportedBy: "Reporter",
      assignedTo: "",
      status: "Open",
      escalationLevel: 0, // Integer only: 0,1,2 (system controlled)
      slaDeadline: sla.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      resolutionNotes: "",
    };

    setIncidents((prev) => [...prev, newIncident]);
    addAudit(newIncident.id, "None", "Open", "Reporter");
    setForm({ title: "", description: "", severity: "Low" });
    setFormErrors({});
  }

  // ---------- HELPERS ----------
  function canTransition(inc, next) {
    return TRANSITIONS[inc.status]?.includes(next);
  }

  function setActionError(id, msg) {
    setActionErrors((prev) => ({ ...prev, [id]: msg }));
  }

  function clearActionError(id) {
    setActionErrors((prev) => ({ ...prev, [id]: "" }));
  }

  // ---------- ACTIONS ----------
  function assignIncident(inc) {
    // Admin only, assign to Resolver only (demo)
    if (role !== "Admin") return;
    clearActionError(inc.id);

    setIncidents((prev) =>
      prev.map((i) =>
        i.id === inc.id
          ? {
              ...i,
              assignedTo: "Resolver",
              status: "Assigned",
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );
    addAudit(inc.id, inc.status, "Assigned", "Admin");
  }

  function updateNotes(id, val) {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, resolutionNotes: val } : i))
    );
  }

  function updateStatus(inc, next) {
    clearActionError(inc.id);

    // Status transition must follow matrix
    if (!canTransition(inc, next)) {
      setActionError(inc.id, "Illegal status transition.");
      return;
    }

    // Resolution Notes mandatory when Resolved/Closed
    if ((next === "Resolved" || next === "Closed") && isBlank(inc.resolutionNotes)) {
      setActionError(inc.id, "Resolution Notes are required.");
      return;
    }

    setIncidents((prev) =>
      prev.map((i) =>
        i.id === inc.id
          ? { ...i, status: next, updatedAt: new Date().toISOString() }
          : i
      )
    );
    addAudit(inc.id, inc.status, next, role);
  }

  function manualEscalate(inc) {
    clearActionError(inc.id);

    // Only Admin, max level 2, integer only
    if (role !== "Admin") return;
    if (inc.escalationLevel >= 2) {
      setActionError(inc.id, "Max escalation level (2) reached.");
      return;
    }

    const newLevel = inc.escalationLevel + 1; // integer 0/1/2
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === inc.id
          ? {
              ...i,
              escalationLevel: newLevel,
              status: "Escalated",
              assignedTo: newLevel === 2 ? "Admin" : i.assignedTo,
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );
    addAudit(inc.id, inc.status, "Escalated", "Admin", "Manual escalation");
  }

  // ---------- TIME LEFT ----------
  function timeLeft(deadline) {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return "SLA BREACHED";
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m left`;
  }

  // ---------- UI PERMISSIONS ----------
  const can = useMemo(
    () => ({
      assign: (inc) => role === "Admin" && inc.status === "Open",
      start: (inc) => role === "Resolver" && inc.status === "Assigned",
      resolve: (inc) => role === "Resolver" && inc.status === "In Progress",
      close: (inc) => role === "Admin" && inc.status === "Resolved",
      escalate: (inc) => role === "Admin",
    }),
    [role]
  );

  return (
    <div className="app">
      <header>
        <h1>🚨 Incident Escalation & SLA Tracker</h1>
        <div className="role">
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      </header>

      {role === "Reporter" && (
        <div className="card">
          <h2>Create Incident</h2>
          <div className="field">
            <input
              placeholder="Title (min 8 chars)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {formErrors.title && <span className="err">{formErrors.title}</span>}
          </div>
          <div className="field">
            <textarea
              placeholder="Description (min 20 chars)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {formErrors.description && <span className="err">{formErrors.description}</span>}
          </div>
          <div className="field">
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
            {formErrors.severity && <span className="err">{formErrors.severity}</span>}
          </div>
          <button onClick={createIncident}>Create Incident</button>
        </div>
      )}

      <h2>Incidents</h2>

      {incidents.map((inc) => (
        <div key={inc.id} className="incident">
          <div className="top">
            <h3>{inc.title}</h3>
            <span className={`badge lvl${inc.escalationLevel}`}>Level {inc.escalationLevel}</span>
          </div>

          <p><b>Status:</b> {inc.status}</p>
          <p><b>Severity:</b> {inc.severity}</p>
          <p><b>Assigned To:</b> {inc.assignedTo || "Not Assigned"}</p>
          <p>
            <b>SLA:</b> {new Date(inc.slaDeadline).toLocaleString()}{" "}
            <span className="sla">({timeLeft(inc.slaDeadline)})</span>
          </p>

          <div className="field">
            <textarea
              placeholder="Resolution Notes (required for resolve/close)"
              value={inc.resolutionNotes}
              onChange={(e) => updateNotes(inc.id, e.target.value)}
            />
          </div>

          {actionErrors[inc.id] && <div className="err">{actionErrors[inc.id]}</div>}

          <div className="actions">
            <button disabled={!can.assign(inc)} onClick={() => assignIncident(inc)}>
              Assign
            </button>
            <button disabled={!can.start(inc)} onClick={() => updateStatus(inc, "In Progress")}>
              Start
            </button>
            <button disabled={!can.resolve(inc)} onClick={() => updateStatus(inc, "Resolved")}>
              Resolve
            </button>
            <button disabled={!can.close(inc)} onClick={() => updateStatus(inc, "Closed")}>
              Close
            </button>
            <button className="danger" disabled={!can.escalate(inc)} onClick={() => manualEscalate(inc)}>
              Escalate
            </button>
          </div>

          <details>
            <summary>Audit Log</summary>
            <ul>
              {(audit[inc.id] || []).map((log, i) => (
                <li key={i}>
                  {log.time} | {log.prev} → {log.next} | By: {log.by}
                  {log.reason && ` | ${log.reason}`}
                </li>
              ))}
            </ul>
          </details>
        </div>
      ))}
    </div>
  );
}


