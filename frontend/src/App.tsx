import { type FormEvent, useEffect, useState } from "react";

type Message = {
  id: number;
  message: string;
  userName: string;
  thread: string;
  createdAt: string;
};

export default function App() {
  const [health, setHealth] = useState<{
    ok: boolean;
    body: unknown | null;
  }>({ ok: false, body: null });
  const [messages, setMessages] = useState<Message[]>([]);
  const [userName, setUserName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        setHealth({ ok: true, body: await res.json() });
      } else {
        setHealth({ ok: false, body: null });
      }
    } catch {
      setHealth({ ok: false, body: null });
    }
  };

  const loadMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.status === 404) {
        setError("404");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMessages(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "fetch failed");
    }
  };

  useEffect(() => {
    checkHealth();
    loadMessages();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, userName }),
    });
    if (!res.ok) {
      setError(`POST failed: ${res.status}`);
      return;
    }
    setMessage("");
    loadMessages();
  };

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>匿名掲示板</h1>

      <section
        style={{
          border: "1px solid #ccc",
          borderRadius: 4,
          padding: "0.75rem 1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ margin: "0 0 0.5rem" }}>サーバ状態</h2>
        {health.ok ? (
          <>
            <pre style={{ margin: 0, fontSize: "0.875rem" }}>
              {JSON.stringify(health.body, null, 2)}
            </pre>
            <p style={{ margin: "0.5rem 0 0", color: "green" }}>
              健康に動いてそうです
            </p>
          </>
        ) : (
          <p style={{ margin: 0, color: "crimson" }}>
            サーバに繋がっていません
          </p>
        )}
      </section>

      <section>
        <h2>スレッド一覧</h2>
        <div id="thread-list">
          {error === "404" ? ( //new
            <p style={{ color: "#888" }}>まだサポートされていません</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {messages.length === 0 ? (
                <li style={{ color: "#888" }}>まだメッセージはありません</li>
              ) : (
                messages.map((m, index) => (
                  <a
                    href={`/threads/${m.thread}`}
                    style={{ margin: "0.5rem 0 0", whiteSpace: "pre-wrap" }}
                    key={`threadlink-${index}`}
                  >
                    {m.thread}
                  </a>
                ))
              )}
            </ul>
          )}
        </div>
        <form
          onSubmit={submit}
          style={{
            padding: "20px 0 0 0",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="名前"
            required
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="メッセージ"
            required
            rows={3}
            style={{
              font: "inherit",
              padding: "0.4rem 0.6rem",
              resize: "vertical",
            }}
          />
          <button type="submit" style={{ alignSelf: "flex-start" }}>
            投稿
          </button>
        </form>
        {error === "404" ? (
          <p style={{ color: "#888" }}>まだサポートされていません</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {messages.length === 0 ? (
              <li style={{ color: "#888" }}>まだメッセージはありません</li>
            ) : (
              messages.map((m) => (
                <li
                  key={m.id}
                  style={{
                    borderBottom: "1px solid #eee",
                    padding: "0.75rem 0",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>{m.userName}</span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#888",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {new Date(m.createdAt).toLocaleString("ja-JP")}
                  </span>
                  <p style={{ margin: "0.25rem 0 0", whiteSpace: "pre-wrap" }}>
                    {m.message}
                  </p>
                </li>
              ))
            )}
          </ul>
        )}
      </section>
    </main>
  );
}
