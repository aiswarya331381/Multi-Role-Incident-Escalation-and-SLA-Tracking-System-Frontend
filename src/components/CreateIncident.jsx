import { useState } from "react";

export default function CreateIncident({ onCreate }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [severity, setSeverity] = useState("Low");

  function submit() {
    if (!title.trim() || title.length < 8) return alert("Title min 8 chars");
    if (!desc.trim() || desc.length < 20) return alert("Desc min 20 chars");

    onCreate({ title, desc, severity });
    setTitle("");
    setDesc("");
    setSeverity("Low");
  }

  return (
    <>
      <h3>Create Incident</h3>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
      <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
        <option>Critical</option>
      </select>
      <button className="btn" onClick={submit}>Create</button>
    </>
  );
}