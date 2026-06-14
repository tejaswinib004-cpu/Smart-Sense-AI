import { useEffect, useMemo, useRef, useState } from "react";

const COLORS = {
  bg: "#0f172a",
  surface: "#112240",
  panel: "#1e293b",
  accent: "#6366f1",
  accentSoft: "#c7d2fe",
  text: "#f8fafc",
  muted: "#a8b2d1",
  border: "rgba(148, 163, 184, 0.18)",
};
const FONT_FAMILY = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const DEFAULT_INPUTS = {
  sleepQuality: 7,
  studyPressure: 4,
  examAnxiety: 5,
  socialBalance: 7,
  physicalHealth: 6,
  timeManagement: 5,
};

const mockRecommendations = {
  Calm: [
    "Keep your regular sleep habits.",
    "Maintain your study routine with short review sessions.",
    "Continue using deep breathing for relaxation.",
  ],
  Moderate: [
    "Take a 10-minute walk after study blocks.",
    "Break tasks into smaller goals.",
    "Try a calming bedtime ritual before sleep.",
  ],
  High: [
    "Schedule a flexible study plan and prioritize rest.",
    "Practice breathing exercises before exams.",
    "Talk with a counselor or trusted mentor.",
  ],
};

const BOT_REPLIES = [
  { keywords: ["sleep", "bedtime", "insomnia", "rest"], response: "A consistent bedtime and calming pre-sleep routine can lower stress and improve recall." },
  { keywords: ["study", "exam", "revision", "homework", "test"], response: "Break your study into focused 25-minute sessions, then reward yourself with a short break." },
  { keywords: ["anxiety", "panic", "nervous", "worry"], response: "Deep breathing and visualizing a positive outcome can help quiet your mind before a big task." },
  { keywords: ["social", "friends", "family", "lonely"], response: "Share how you feel with someone close and set small boundaries so you can recharge." },
];

function getBotReply(message) {
  const norm = message.trim().toLowerCase();

  // keyword matching (robust against punctuation)
  for (const item of BOT_REPLIES) {
    if (item.keywords && item.keywords.some((k) => norm.includes(k))) {
      return item.response;
    }
  }

  // fallback: small heuristics for longer questions
  if (norm.includes("help") || norm.includes("how") || norm.includes("what") || norm.includes("why")) {
    return "That's a thoughtful question — could you share a bit more context? For example: when do you feel this most, and is it related to study, sleep, or social situations?";
  }

  // graceful default with an action suggestion
  return "Thanks for asking — try describing one recent moment you felt stressed, and I can suggest a focused step you can try immediately.";
}

function SmartSensAI() {
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ssai_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [alert, setAlert] = useState("");
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem("ssai_history");
    return stored ? JSON.parse(stored) : [];
  });
  const [prediction, setPrediction] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Welcome! Ask me anything about stress, sleep habits, or study balance." },
  ]);
  const chatRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("ssai_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("ssai_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const summary = useMemo(() => {
    const total = history.length;
    const average = total
      ? history.reduce((sum, item) => sum + item.score, 0) / total
      : 0;
    const counts = history.reduce(
      (acc, item) => {
        acc[item.label] = (acc[item.label] || 0) + 1;
        return acc;
      },
      { Calm: 0, Moderate: 0, High: 0 }
    );
    return { total, average, counts };
  }, [history]);

  const chartData = useMemo(() => {
    return [
      { label: "Focus", value: inputs.timeManagement },
      { label: "Sleep", value: inputs.sleepQuality },
      { label: "Stress", value: inputs.examAnxiety },
      { label: "Balance", value: inputs.socialBalance },
    ];
  }, [inputs]);

  function getStressPrediction(values) {
    const raw =
      values.sleepQuality * 0.14 +
      values.studyPressure * 0.16 +
      values.examAnxiety * 0.24 +
      values.socialBalance * 0.12 +
      values.physicalHealth * 0.18 +
      values.timeManagement * 0.16;
    const score = Math.min(0.98, Math.max(0.08, raw / 10));
    let label = "Moderate";
    if (score <= 0.34) label = "Calm";
    else if (score >= 0.66) label = "High";
    return {
      label,
      score,
      confidence: 0.75 + Math.abs(0.5 - score) * 0.5,
      date: new Date().toLocaleString(),
      values,
    };
  }

  function handleAuthSubmit(event) {
    event.preventDefault();
    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password.trim();

    if (!email || !password) {
      setAlert("Please provide both email and password.");
      return;
    }

    if (authMode === "login") {
      const storedUser = localStorage.getItem("ssai_account_") ? null : null;
      const registered = localStorage.getItem(`ssai_account_${email}`);
      if (!registered) {
        setAlert("No account found. Please register first.");
        return;
      }
      const account = JSON.parse(registered);
      if (account.password !== password) {
        setAlert("Incorrect password. Try again.");
        return;
      }
      setUser({ name: account.name, email });
      setAuthForm({ name: "", email: "", password: "" });
      setAlert("");
      setPage("dashboard");
      return;
    }

    if (authMode === "register") {
      if (!authForm.name.trim()) {
        setAlert("Please provide a display name.");
        return;
      }
      const emailKey = authForm.email.trim().toLowerCase();
      if (localStorage.getItem(`ssai_account_${emailKey}`)) {
        setAlert("This email is already registered. Please log in.");
        return;
      }
      const account = {
        name: authForm.name.trim(),
        email: emailKey,
        password: password,
      };
      localStorage.setItem(`ssai_account_${emailKey}`, JSON.stringify(account));
      setUser({ name: account.name, email: emailKey });
      setAuthForm({ name: "", email: "", password: "" });
      setAlert("");
      setPage("dashboard");
      return;
    }
  }

  function handleLogout() {
    setUser(null);
    setPage("dashboard");
    setAlert("");
  }

  function handlePredict() {
    const result = getStressPrediction(inputs);
    setPrediction(result);
    const entry = {
      id: Date.now().toString(),
      ...result,
    };
    setHistory((existing) => [entry, ...existing].slice(0, 20));
    setPage("result");
  }

  function handleChatSend() {
    const message = chatInput.trim();
    if (!message) return;
    const nextMessages = [...messages, { from: "user", text: message }];
    setMessages(nextMessages);
    setChatInput("");

    const reply = getBotReply(message);

    setTimeout(() => {
      setMessages((current) => [...current, { from: "bot", text: reply }]);
    }, 700);
  }

  function handleQuickFill(mode) {
    const presets = {
      calm: {
        sleepQuality: 8,
        studyPressure: 3,
        examAnxiety: 2,
        socialBalance: 8,
        physicalHealth: 8,
        timeManagement: 8,
      },
      stressed: {
        sleepQuality: 4,
        studyPressure: 8,
        examAnxiety: 8,
        socialBalance: 3,
        physicalHealth: 4,
        timeManagement: 3,
      },
    };
    setInputs(presets[mode]);
  }

  function renderAuthPage() {
    return (
      <div style={styles.authPanel}>
        <div style={styles.authHeader}>
          <div style={styles.title}>{authMode === "login" ? "Welcome back" : "Create your account"}</div>
          <div style={styles.subtitle}>
            {authMode === "login"
              ? "Sign in to capture your assessment history and personalized insights."
              : "Register in seconds and save your wellbeing progress."}
          </div>
        </div>
        <form onSubmit={handleAuthSubmit} style={styles.authForm}>
          {authMode === "register" && (
            <label style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Display name</span>
              <input
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                style={styles.fieldInput}
                placeholder="Ava Lee"
              />
            </label>
          )}
          <label style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Email address</span>
            <input
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              style={styles.fieldInput}
              placeholder="ava@example.com"
            />
          </label>
          <label style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Password</span>
            <input
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              style={styles.fieldInput}
              placeholder="••••••••"
            />
          </label>
          {alert && <div style={styles.authAlert}>{alert}</div>}
          <button type="submit" style={styles.primaryButton}>
            {authMode === "login" ? "Sign in" : "Create account"}
          </button>
          <button
            type="button"
            style={styles.linkButton}
            onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setAlert("");
            }}
          >
            {authMode === "login" ? "New here? Register now" : "Already registered? Sign in"}
          </button>
        </form>
      </div>
    );
  }

  function renderDashboardPage() {
    return (
      <>
        <div style={styles.sectionHeader}>
          <div>
            <div style={styles.title}>Your wellbeing snapshot</div>
            <div style={styles.subtitle}>One place for stress scores, analytics, and daily recommendations.</div>
          </div>
          <div style={styles.statusChip}>Active learner</div>
        </div>

        <div style={styles.grid4}>
          <StatusCard label="Assessments" value={summary.total} />
          <StatusCard label="Average score" value={`${(summary.average * 100).toFixed(0)}%`} />
          <StatusCard label="Calm reports" value={summary.counts.Calm} />
          <StatusCard label="High alerts" value={summary.counts.High} />
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitle}>Focus & mood preview</div>
            <div style={styles.mutedText}>Inspect the current wellbeing inputs before your next check.</div>
          </div>
          <div style={styles.chartGrid}>
            {chartData.map((item) => (
              <div key={item.label} style={styles.miniChartCard}>
                <div style={styles.miniChartLabel}>{item.label}</div>
                <div style={styles.miniChartValue}>{item.value}</div>
                <div style={styles.barBase}>
                  <div style={{ ...styles.barFill, width: `${item.value * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.quickGrid}>
          <ActionCard
            title="Run a new stress check"
            subtitle="Use the guided slider assessment to evaluate your current state."
            onClick={() => setPage("predict")}
          />
          <ActionCard
            title="Explore analytics"
            subtitle="Review prediction trends, distribution, and daily habits."
            onClick={() => setPage("analytics")}
          />
          <ActionCard
            title="Ask the wellness coach"
            subtitle="Get fast advice on study balance, sleep, and stress management."
            onClick={() => setPage("chat")}
          />
        </div>
      </>
    );
  }

  function renderAssessmentPage() {
    return (
      <>
        <div style={styles.sectionHeader}>
          <div>
            <div style={styles.title}>Stress assessment</div>
            <div style={styles.subtitle}>Adjust the sliders to reflect how you feel today.</div>
          </div>
          <div style={styles.actionRow}>
            <button style={styles.ghostButton} onClick={() => handleQuickFill("calm")}>Calm day</button>
            <button style={styles.ghostButton} onClick={() => handleQuickFill("stressed")}>Stressed day</button>
          </div>
        </div>
        <div style={styles.formGrid}>
          {[
            { key: "sleepQuality", label: "Sleep quality", min: 1, max: 10 },
            { key: "studyPressure", label: "Study pressure", min: 1, max: 10 },
            { key: "examAnxiety", label: "Exam anxiety", min: 1, max: 10 },
            { key: "socialBalance", label: "Social balance", min: 1, max: 10 },
            { key: "physicalHealth", label: "Physical health", min: 1, max: 10 },
            { key: "timeManagement", label: "Time management", min: 1, max: 10 },
          ].map((item) => (
            <div key={item.key} style={styles.inputCard}>
              <div style={styles.inputLabel}>{item.label}</div>
              <input
                type="range"
                min={item.min}
                max={item.max}
                value={inputs[item.key]}
                onChange={(event) => setInputs({ ...inputs, [item.key]: Number(event.target.value) })}
                style={styles.slider}
              />
              <div style={styles.inputValue}>{inputs[item.key]}</div>
            </div>
          ))}
        </div>
        <button style={styles.primaryButton} onClick={handlePredict}>Predict stress level</button>
      </>
    );
  }

  function renderResultPage() {
    return (
      <>
        <div style={styles.sectionHeader}>
          <div>
            <div style={styles.title}>Prediction result</div>
            <div style={styles.subtitle}>A summary of your estimated stress level and next steps.</div>
          </div>
          <div style={styles.statusChip}>{prediction?.label || "No data"}</div>
        </div>
        {prediction ? (
          <div style={styles.panel}>
            <div style={styles.resultHero}>
              <div>
                <div style={styles.resultBadge}>{prediction.label}</div>
                <div style={styles.resultText}>{(prediction.score * 100).toFixed(0)}% stress score</div>
                <div style={styles.mutedText}>Confidence: {(prediction.confidence * 100).toFixed(0)}%</div>
              </div>
              <div style={styles.cardTag}>{prediction.date}</div>
            </div>
            <div style={styles.recommendations}>
              <div style={styles.recommendTitle}>Recommended actions</div>
              {mockRecommendations[prediction.label].map((item, index) => (
                <div key={index} style={styles.recommendItem}>• {item}</div>
              ))}
            </div>
            <div style={styles.buttonRow}>
              <button style={styles.primaryButton} onClick={() => setPage("predict")}>New assessment</button>
              <button style={styles.secondaryButton} onClick={() => setPage("history")}>View history</button>
            </div>
          </div>
        ) : (
          <div style={styles.emptyState}>No prediction is available yet. Please complete an assessment first.</div>
        )}
      </>
    );
  }

  function renderHistoryPage() {
    return (
      <>
        <div style={styles.sectionHeader}>
          <div>
            <div style={styles.title}>Assessment history</div>
            <div style={styles.subtitle}>Track how your stress responses change over time.</div>
          </div>
          <div style={styles.mutedText}>{history.length} saved entries</div>
        </div>
        <div style={styles.historyList}>
          {history.length === 0 ? (
            <div style={styles.emptyState}>Your history will appear here after the first assessment.</div>
          ) : (
            history.map((entry) => (
              <div key={entry.id} style={styles.historyRow}>
                <div>
                  <div style={styles.historyLabel}>{entry.label}</div>
                  <div style={styles.historyDate}>{entry.date}</div>
                </div>
                <div style={styles.historyScore}>{(entry.score * 100).toFixed(0)}%</div>
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  function renderAnalyticsPage() {
    const trendItems = history.slice(0, 6).reverse();
    return (
      <>
        <div style={styles.sectionHeader}>
          <div>
            <div style={styles.title}>Analytics & EDA</div>
            <div style={styles.subtitle}>Data-driven insights into stress, sleep, and study patterns.</div>
          </div>
          <div style={styles.statusChip}>Live analysis</div>
        </div>
        <div style={styles.grid4}>
          <StatusCard label="Latest mood" value={history[0]?.label || "Pending"} />
          <StatusCard label="Avg stress" value={`${(summary.average * 100).toFixed(0)}%`} />
          <StatusCard label="Calm ratio" value={`${summary.total ? ((summary.counts.Calm / summary.total) * 100).toFixed(0) : 0}%`} />
          <StatusCard label="High ratio" value={`${summary.total ? ((summary.counts.High / summary.total) * 100).toFixed(0) : 0}%`} />
        </div>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitle}>Stress distribution</div>
            <div style={styles.mutedText}>View how your assessment labels are currently distributed.</div>
          </div>
          <div style={styles.distributionGrid}>
            {Object.entries(summary.counts).map(([label, count]) => (
              <div key={label} style={styles.distributionItem}>
                <div style={styles.distributionLabel}>{label}</div>
                <div style={styles.distributionValue}>{count}</div>
                <div style={styles.barBase}>
                  <div style={{ ...styles.barFill, width: `${summary.total ? (count / summary.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitle}>Wellbeing input chart</div>
            <div style={styles.mutedText}>A visual guide to today’s strongest wellness signals.</div>
          </div>
          <div style={styles.analyticsChart}>
            {chartData.map((item) => (
              <div key={item.label} style={styles.analyticsBarColumn}>
                <div style={styles.analyticsBarContainer}>
                  <div style={{ ...styles.analyticsBarFill, height: `${Math.min(100, item.value * 9)}%` }} />
                </div>
                <div style={styles.analyticsBarLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitle}>Prediction trend</div>
            <div style={styles.mutedText}>The last six assessment scores show the direction of your wellbeing.</div>
          </div>
          <div style={styles.trendChart}>
            {trendItems.length === 0 ? (
              <div style={styles.emptyState}>Run a few assessments to generate trend analytics.</div>
            ) : (
              trendItems.map((entry, index) => {
                const width = entry.score * 100;
                return (
                  <div key={entry.id} style={styles.trendRow}>
                    <div>{new Date(entry.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    <div style={styles.trendBarBase}>
                      <div style={{ ...styles.trendBarFill, width: `${width}%` }} />
                    </div>
                    <div>{(entry.score * 100).toFixed(0)}%</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitle}>Prediction analysis</div>
            <div style={styles.mutedText}>Use your latest assessment to discover what is driving your current stress level.</div>
          </div>
          {prediction ? (
            <div style={styles.analysisList}>
              {Object.entries(prediction.values).map(([key, value]) => (
                <div key={key} style={styles.analysisRow}>
                  <div style={styles.analysisLabel}>{key.replace(/([A-Z])/g, " $1")}</div>
                  <div style={styles.analysisValue}>{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>Complete an assessment to view analysis details here.</div>
          )}
        </div>
      </>
    );
  }

  function renderChatPage() {
    return (
      <>
        <div style={styles.sectionHeader}>
          <div>
            <div style={styles.title}>Wellness coach</div>
            <div style={styles.subtitle}>Ask about stress, sleep, motivation, or exam prep.</div>
          </div>
          <div style={styles.mutedText}>Response time: <strong>under 1 second</strong></div>
        </div>
        <div ref={chatRef} style={styles.chatWindow}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                ...styles.chatMessage,
                alignSelf: message.from === "bot" ? "flex-start" : "flex-end",
                background: message.from === "bot" ? COLORS.surface : COLORS.accent,
                color: message.from === "bot" ? COLORS.text : "#fff",
              }}
            >
              {message.text}
            </div>
          ))}
        </div>
        <div style={styles.chatActions}>
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            style={styles.chatInput}
            placeholder="Ask about sleep, exams, or study habits"
            onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
          />
          <button style={styles.primaryButton} onClick={handleChatSend}>Send</button>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <div style={styles.unauthShell}>
        <div style={styles.unauthCard}>{renderAuthPage()}</div>
      </div>
    );
  }

  const pageName = {
    dashboard: "Dashboard",
    predict: "Stress check",
    result: "Result",
    history: "History",
    analytics: "Analytics",
    chat: "Chat",
  }[page];

  return (
    <div style={styles.appShell}>
      <aside style={styles.sidebar}>
        <div style={styles.brandBlock}>
          <div style={styles.brand}>SmartSenseAI</div>
          <div style={styles.brandTag}>Premium wellbeing hub</div>
        </div>
        <NavButton active={page === "dashboard"} onClick={() => setPage("dashboard")} label="Dashboard" />
        <NavButton active={page === "predict"} onClick={() => setPage("predict")} label="Stress check" />
        <NavButton active={page === "analytics"} onClick={() => setPage("analytics")} label="Analytics" />
        <NavButton active={page === "history"} onClick={() => setPage("history")} label="History" />
        <NavButton active={page === "chat"} onClick={() => setPage("chat")} label="Wellness chat" />
        <div style={styles.sidebarFooter}>
          <div>
            <div style={styles.sidebarName}>{user.name}</div>
            <div style={styles.sidebarMeta}>{user.email}</div>
          </div>
          <button style={styles.linkButton} onClick={handleLogout}>Sign out</button>
        </div>
      </aside>
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div>
            <div style={styles.pageTitle}>{pageName}</div>
            <div style={styles.subtitle}>Your next step to improve focus and reduce stress.</div>
          </div>
          <div style={styles.userBadge}>Hello, {user.name}</div>
        </header>
        <section style={styles.contentArea}>
          {page === "dashboard" && renderDashboardPage()}
          {page === "predict" && renderAssessmentPage()}
          {page === "result" && renderResultPage()}
          {page === "history" && renderHistoryPage()}
          {page === "analytics" && renderAnalyticsPage()}
          {page === "chat" && renderChatPage()}
        </section>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.navButton,
        background: active ? COLORS.accent : "transparent",
        color: active ? "#fff" : COLORS.text,
      }}
    >
      {label}
    </button>
  );
}

function StatusCard({ label, value }) {
  return (
    <div style={styles.statusCard}>
      <div style={styles.statusLabel}>{label}</div>
      <div style={styles.statusValue}>{value}</div>
    </div>
  );
}

function ActionCard({ title, subtitle, onClick }) {
  return (
    <button onClick={onClick} style={styles.actionCard}>
      <div style={styles.actionTitle}>{title}</div>
      <div style={styles.actionSubtitle}>{subtitle}</div>
    </button>
  );
}

const styles = {
  appShell: {
    display: "flex",
    minHeight: "100vh",
    width: "100vw",
    background: "transparent",
    color: COLORS.text,
    fontFamily: FONT_FAMILY,
  },
  unauthShell: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.bg,
    padding: 20,
  },
  unauthCard: {
    width: "100%",
    maxWidth: 520,
    background: COLORS.surface,
    borderRadius: 32,
    padding: 36,
    boxShadow: "0 28px 70px rgba(15, 23, 42, 0.3)",
  },
  authPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  authHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  authForm: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  fieldLabel: {
    color: COLORS.muted,
    fontSize: 14,
  },
  fieldInput: {
    borderRadius: 16,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.panel,
    color: COLORS.text,
    padding: "14px 16px",
    outline: "none",
  },
  authAlert: {
    color: "#f9a8d4",
    background: "rgba(249, 168, 212, 0.14)",
    borderRadius: 16,
    padding: 14,
  },
  linkButton: {
    background: "transparent",
    border: "none",
    color: COLORS.accentSoft,
    textAlign: "left",
    cursor: "pointer",
    padding: 0,
    marginTop: 8,
  },
  sidebar: {
    width: 260,
    minWidth: 260,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    gap: 18,
    background: "rgba(15, 23, 42, 0.96)",
    borderRight: `1px solid ${COLORS.border}`,
  },
  brandBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginBottom: 16,
  },
  brand: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: 0.4,
    fontFamily: "Cinzel, serif",
  },
  brandTag: {
    color: COLORS.muted,
    fontSize: 13,
  },
  navButton: {
    width: "100%",
    border: "none",
    borderRadius: 18,
    padding: "16px 18px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 15,
    transition: "background 0.2s ease",
  },
  sidebarFooter: {
    marginTop: "auto",
    paddingTop: 16,
    borderTop: `1px solid ${COLORS.border}`,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  sidebarName: {
    fontWeight: 700,
  },
  sidebarMeta: {
    color: COLORS.muted,
    fontSize: 13,
  },
  mainContent: {
    flex: 1,
    padding: 32,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 800,
    fontFamily: "Alice, serif",
  },
  userBadge: {
    padding: "12px 18px",
    borderRadius: 999,
    background: COLORS.panel,
    fontSize: 14,
    border: `1px solid ${COLORS.border}`,
  },
  contentArea: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "0.02em",
    fontFamily: "Alice, serif",
  },
  subtitle: {
    color: COLORS.muted,
    marginTop: 6,
    maxWidth: 620,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 18,
  },
  statusCard: {
    background: "rgba(15, 23, 42, 0.9)",
    borderRadius: 24,
    padding: 24,
    border: `1px solid ${COLORS.border}`,
    minHeight: 160,
  },
  statusLabel: {
    color: COLORS.muted,
    fontSize: 14,
  },
  statusValue: {
    marginTop: 12,
    fontSize: 32,
    fontWeight: 800,
  },
  panel: {
    background: "rgba(15, 23, 42, 0.92)",
    borderRadius: 28,
    padding: 26,
    border: `1px solid ${COLORS.border}`,
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 700,
    fontFamily: "Alice, serif",
  },
  primaryButton: {
    alignSelf: "flex-start",
    border: "none",
    borderRadius: 18,
    padding: "16px 24px",
    background: COLORS.accent,
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
  },
  secondaryButton: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: "16px 24px",
    background: "transparent",
    color: COLORS.text,
    cursor: "pointer",
    fontSize: 15,
  },
  ghostButton: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: "12px 20px",
    background: "transparent",
    color: COLORS.text,
    cursor: "pointer",
    fontSize: 14,
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 18,
  },
  actionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "flex-end",
  },
  actionCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
    background: "rgba(15, 23, 42, 0.9)",
    borderRadius: 24,
    padding: 24,
    border: `1px solid ${COLORS.border}`,
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: 700,
  },
  actionSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 1.6,
  },
  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 18,
  },
  statusChip: {
    padding: "10px 18px",
    borderRadius: 999,
    background: "rgba(99, 102, 241, 0.16)",
    color: COLORS.accentSoft,
    fontWeight: 700,
    fontSize: 13,
  },
  inputCard: {
    background: "rgba(15, 23, 42, 0.9)",
    borderRadius: 24,
    padding: 22,
    border: `1px solid ${COLORS.border}`,
  },
  inputLabel: {
    marginBottom: 12,
    fontWeight: 600,
  },
  slider: {
    width: "100%",
    accentColor: COLORS.accent,
  },
  inputValue: {
    marginTop: 14,
    color: COLORS.text,
    fontWeight: 700,
  },
  recommendTitle: {
    color: COLORS.muted,
    marginBottom: 10,
  },
  recommendations: {
    display: "grid",
    gap: 12,
    marginTop: 18,
  },
  recommendItem: {
    background: "rgba(15, 23, 42, 0.85)",
    borderRadius: 18,
    padding: 16,
    border: `1px solid ${COLORS.border}`,
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
  },
  historyList: {
    display: "grid",
    gap: 14,
  },
  historyRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    padding: 22,
    borderRadius: 24,
    background: "rgba(15, 23, 42, 0.9)",
    border: `1px solid ${COLORS.border}`,
  },
  historyLabel: {
    fontWeight: 700,
  },
  historyDate: {
    color: COLORS.muted,
    marginTop: 8,
    fontSize: 13,
  },
  historyScore: {
    fontWeight: 800,
    minWidth: 64,
    textAlign: "right",
  },
  emptyState: {
    padding: 36,
    borderRadius: 24,
    background: "rgba(15, 23, 42, 0.8)",
    color: COLORS.muted,
    textAlign: "center",
  },
  chatWindow: {
    background: "rgba(15, 23, 42, 0.92)",
    borderRadius: 24,
    padding: 22,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    minHeight: 360,
    maxHeight: 520,
    overflowY: "auto",
    border: `1px solid ${COLORS.border}`,
  },
  chatMessage: {
    borderRadius: 20,
    padding: "16px 18px",
    maxWidth: "80%",
    lineHeight: 1.6,
  },
  chatActions: {
    display: "flex",
    gap: 12,
    marginTop: 16,
  },
  chatInput: {
    flex: 1,
    borderRadius: 18,
    border: `1px solid ${COLORS.border}`,
    padding: "16px 18px",
    background: COLORS.panel,
    color: COLORS.text,
    outline: "none",
  },
  authPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  authHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  authForm: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  fieldLabel: {
    color: COLORS.muted,
    fontSize: 14,
  },
  fieldInput: {
    borderRadius: 18,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.panel,
    color: COLORS.text,
    padding: "14px 16px",
    outline: "none",
  },
  authAlert: {
    color: "#f9a8d4",
    background: "rgba(249, 168, 212, 0.16)",
    borderRadius: 18,
    padding: 14,
  },
  cardTag: {
    color: COLORS.muted,
    background: "rgba(148, 163, 184, 0.12)",
    padding: "10px 16px",
    borderRadius: 999,
    fontSize: 13,
  },
  resultHero: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
  },
  resultBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 18px",
    borderRadius: 999,
    marginBottom: 18,
    background: COLORS.accent,
    color: "#ffffff",
    fontWeight: 700,
  },
  resultText: {
    fontSize: 36,
    fontWeight: 800,
    lineHeight: 1,
  },
  resultSub: {
    color: COLORS.muted,
    marginBottom: 18,
  },
  recommendTitle: {
    color: COLORS.muted,
    marginBottom: 10,
    fontWeight: 700,
  },
  barBase: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    background: "rgba(148, 163, 184, 0.12)",
    overflow: "hidden",
    marginTop: 12,
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    background: COLORS.accent,
  },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
  },
  miniChartCard: {
    background: "rgba(15, 23, 42, 0.85)",
    borderRadius: 20,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  miniChartLabel: {
    color: COLORS.muted,
  },
  miniChartValue: {
    fontSize: 28,
    fontWeight: 800,
  },
  distributionGrid: {
    display: "grid",
    gap: 14,
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
  distributionItem: {
    display: "grid",
    gap: 8,
    padding: 18,
    background: "rgba(15, 23, 42, 0.95)",
    borderRadius: 20,
    border: `1px solid ${COLORS.border}`,
  },
  distributionLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  distributionValue: {
    fontSize: 22,
    fontWeight: 700,
  },
  trendChart: {
    display: "grid",
    gap: 12,
  },
  trendRow: {
    display: "grid",
    gridTemplateColumns: "90px minmax(0, 1fr) 80px",
    gap: 12,
    alignItems: "center",
    padding: 14,
    background: "rgba(15, 23, 42, 0.88)",
    borderRadius: 18,
  },
  trendBarBase: {
    background: "rgba(148, 163, 184, 0.12)",
    borderRadius: 999,
    height: 12,
    overflow: "hidden",
  },
  trendBarFill: {
    height: "100%",
    borderRadius: 999,
    background: COLORS.accent,
  },
  chartImage: {
    width: "100%",
    maxWidth: 720,
    borderRadius: 18,
    objectFit: "cover",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.25)",
  },
  fullChartCard: {
    background: "rgba(15, 23, 42, 0.92)",
    borderRadius: 20,
    padding: 12,
    border: `1px solid ${COLORS.border}`,
    marginBottom: 12,
  },
  fullChartImage: {
    width: "100%",
    height: "auto",
    borderRadius: 14,
    boxShadow: "0 24px 60px rgba(2,6,23,0.6)",
  },
  edaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
    alignItems: "start",
  },
  previewChartCard: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 12,
    background: "rgba(15, 23, 42, 0.88)",
    borderRadius: 20,
    border: `1px solid ${COLORS.border}`,
  },
  chartLabel: {
    color: COLORS.text,
    fontSize: 14,
    textTransform: "capitalize",
  },
  analysisList: {
    display: "grid",
    gap: 14,
  },
  analysisRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    background: "rgba(15, 23, 42, 0.9)",
    borderRadius: 20,
    padding: 18,
  },
  analyticsChart: {
    display: "flex",
    gap: 18,
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 220,
    padding: 18,
    background: "rgba(15, 23, 42, 0.88)",
    borderRadius: 24,
    border: `1px solid ${COLORS.border}`,
  },
  analyticsBarColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    flex: 1,
  },
  analyticsBarFill: {
    width: "100%",
    maxWidth: 60,
    borderRadius: 999,
    background: COLORS.accent,
    boxShadow: "0 14px 30px rgba(99, 102, 241, 0.22)",
  },
  analyticsBarContainer: {
    width: 64,
    height: 160,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    background: "rgba(148, 163, 184, 0.03)",
    borderRadius: 12,
    padding: 6,
    overflow: "hidden",
  },
  analyticsBarLabel: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: "center",
  },
  analysisLabel: {
    color: COLORS.muted,
  },
  analysisValue: {
    fontWeight: 700,
  },
};

export default SmartSensAI;
