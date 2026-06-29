import { useState, useRef } from "react";

const API = "https://orchestra-zpdkdua3hq-uc.a.run.app";
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY as string;

type Status = "idle" | "creating" | "polling" | "active" | "failed";

interface Bot {
  role: string;
  engine: string;
  display_name: string;
  status: string;
}

interface Project {
  project_id: string;
  name: string;
  status: string;
  telegram_invite_link: string | null;
  error_message: string | null;
  bots: Bot[];
}

export default function App() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function create() {
    if (!name.trim()) return;
    setStatus("creating");
    setError(null);
    setProject(null);

    try {
      const res = await fetch(`${API}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": ADMIN_KEY,
        },
        body: JSON.stringify({ name: name.trim(), preset: "writer_researcher" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { project_id } = await res.json();

      setStatus("polling");
      pollRef.current = setInterval(async () => {
        const r = await fetch(`${API}/projects/${project_id}`, {
          headers: { "X-Admin-Key": ADMIN_KEY },
        });
        const data: Project = await r.json();
        setProject(data);
        if (data.status === "active" || data.status === "failed") {
          clearInterval(pollRef.current!);
          setStatus(data.status as Status);
        }
      }, 3000);
    } catch (e) {
      setError(String(e));
      setStatus("failed");
    }
  }

  function reset() {
    if (pollRef.current) clearInterval(pollRef.current);
    setStatus("idle");
    setProject(null);
    setError(null);
    setName("");
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create a Studio</h1>
        <div style={styles.notice}>
          <strong>⚠ Test mode</strong> — this app uses a static admin key for auth.
          In production, users authenticate with Google via Firebase, which issues a
          short-lived token sent as <code>Authorization: Bearer …</code>. The admin key
          is an internal operator shortcut and is never exposed to real users.
        </div>

        {status === "idle" || status === "failed" ? (
          <>
            <input
              style={styles.input}
              placeholder="Studio name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              autoFocus
            />
            <button style={styles.button} onClick={create} disabled={!name.trim()}>
              Create
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </>
        ) : status === "creating" ? (
          <p style={styles.status}>Creating project…</p>
        ) : status === "polling" ? (
          <div>
            <p style={styles.status}>
              Setting up <strong>{project?.name ?? name}</strong>…
            </p>
            {project?.bots.map((b) => (
              <div key={b.role} style={styles.bot}>
                <span style={b.status === "active" ? styles.dot.active : styles.dot.pending} />
                {b.display_name}
              </div>
            ))}
          </div>
        ) : status === "active" && project ? (
          <div>
            <p style={styles.success}>✓ {project.name} is ready</p>
            {project.bots.map((b) => (
              <div key={b.role} style={styles.bot}>
                <span style={styles.dot.active} />
                {b.display_name}
              </div>
            ))}
            {project.telegram_invite_link && (
              <a
                href={project.telegram_invite_link}
                target="_blank"
                rel="noreferrer"
                style={styles.link}
              >
                Join on Telegram →
              </a>
            )}
            <button style={{ ...styles.button, marginTop: 24 }} onClick={reset}>
              Create another
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f0f0f",
    fontFamily: "system-ui, sans-serif",
    color: "#f0f0f0",
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    padding: 40,
    width: 360,
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  title: { margin: "0 0 8px", fontSize: 22, fontWeight: 600 },
  input: {
    background: "#0f0f0f",
    border: "1px solid #333",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 16,
    color: "#f0f0f0",
    outline: "none",
  },
  button: {
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "11px 0",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  status: { color: "#aaa", margin: 0 },
  success: { color: "#4ade80", fontWeight: 600, margin: "0 0 12px" },
  error: { color: "#f87171", fontSize: 13, margin: 0 },
  bot: { display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 14 },
  dot: {
    active: { width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block" },
    pending: { width: 8, height: 8, borderRadius: "50%", background: "#555", display: "inline-block" },
  },
  notice: {
    background: "#2a1f00",
    border: "1px solid #5a3e00",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 12,
    color: "#c9a84c",
    lineHeight: 1.6,
  },
  link: {
    display: "block",
    marginTop: 16,
    color: "#a78bfa",
    fontWeight: 600,
    textDecoration: "none",
    fontSize: 15,
  },
} as const;
