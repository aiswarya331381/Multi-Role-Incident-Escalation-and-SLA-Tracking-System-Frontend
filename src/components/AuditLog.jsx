export default function AuditLog({ logs }) {
  return (
    <>
      <h4>Audit Log</h4>
      <div className="audit-log">
        {logs.map((a, i) => (
          <div key={i}>
            [{a.time}] {a.from} → {a.to} by {a.by} {a.reason && `(${a.reason})`}
          </div>
        ))}
      </div>
    </>
  );
}