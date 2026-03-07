const ROLES = ["Reporter", "Resolver", "Admin"];

export default function RoleSwitcher({ role, setRole }) {
  return (
    <div className="role-box">
      <div className="role-card">
        <b>Role:</b>{" "}
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
    </div>
  );
}