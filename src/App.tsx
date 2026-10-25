import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
type Times = Record<string, string>;
type Activity = {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  done: boolean;
};
type Settings = {
  city: string;
  country: string;
  method: string;
  school: string;
};
const defaults: Settings = {
  city: "Oslo",
  country: "Norway",
  method: "3",
  school: "0",
};
const prayerNames = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const labels: Record<string, string> = {
  Fajr: "Fajr",
  Sunrise: "Soloppgang",
  Dhuhr: "Dhuhr",
  Asr: "Asr",
  Maghrib: "Maghrib",
  Isha: "Isha",
};
const palette = [
  "#a7b5ee",
  "#eab0a2",
  "#a9d3b7",
  "#e5c28a",
  "#93c8d8",
  "#f4a6ba",
];
const load = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const minutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
const clock = (d: Date) =>
  d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const clean = (s: string) => s?.match(/\d{1,2}:\d{2}/)?.[0] || "";
const polar = (angle: number, r: number) => ({
  x: 300 + Math.sin((angle * Math.PI) / 180) * r,
  y: 300 - Math.cos((angle * Math.PI) / 180) * r,
});
const wedge = (a: number, b: number, outer: number, inner: number) => {
  const p = polar(a, outer),
    q = polar(b, outer),
    r = polar(b, inner),
    s = polar(a, inner);
  return `M ${p.x} ${p.y} A ${outer} ${outer} 0 ${b - a > 180 ? 1 : 0} 1 ${q.x} ${q.y} L ${r.x} ${r.y} A ${inner} ${inner} 0 ${b - a > 180 ? 1 : 0} 0 ${s.x} ${s.y} Z`;
};
// Smooth, pointed activity endings inspired by the original sketch.
const ribbon = (
  a: number,
  b: number,
  outer: number,
  inner: number,
  _pointStart: boolean,
  pointEnd: boolean,
) => {
  const mid = (outer + inner) / 2,
    span = b - a;
  const tip = Math.min(3.8, span * 0.32);
  const startOuter = polar(a, outer);
  const endOuter = polar(b - (pointEnd ? tip : 0), outer);
  const endInner = polar(b - (pointEnd ? tip : 0), inner);
  const startInner = polar(a, inner);
  const endTip = polar(b, mid);
  return `M ${startOuter.x} ${startOuter.y} A ${outer} ${outer} 0 ${span > 180 ? 1 : 0} 1 ${endOuter.x} ${endOuter.y} L ${endTip.x} ${endTip.y} L ${endInner.x} ${endInner.y} A ${inner} ${inner} 0 ${span > 180 ? 1 : 0} 0 ${startInner.x} ${startInner.y} Z`;
};
function App() {
  const [now, setNow] = useState(new Date());
  const [settings, setSettings] = useState<Settings>(() =>
    load("salah-settings", defaults),
  );
  const [editSettings, setEditSettings] = useState(false);
  const [times, setTimes] = useState<Record<string, Times>>({});
  const [apiError, setApiError] = useState("");
  const [activities, setActivities] = useState<Activity[]>(() =>
    load("salah-activities", []),
  );
  const [modal, setModal] = useState(false);
  const [draft, setDraft] = useState<Activity>({
    id: "",
    title: "",
    start: "09:00",
    end: "10:00",
    color: palette[0],
    done: false,
  });
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [simulated, setSimulated] = useState(false);
  const [demoTime, setDemoTime] = useState("17:45");
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(
    () => localStorage.setItem("salah-settings", JSON.stringify(settings)),
    [settings],
  );
  useEffect(
    () => localStorage.setItem("salah-activities", JSON.stringify(activities)),
    [activities],
  );
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const dates = [-1, 0, 1, 2].map((n) => {
      const d = new Date(`${selectedDate}T12:00:00`);
      d.setDate(d.getDate() + n);
      return dateKey(d);
    });
    setApiError("");
    Promise.all(
      dates.map(async (date) => {
        const [y, m, d] = date.split("-");
        const url = `https://api.aladhan.com/v1/timingsByCity/${d}-${m}-${y}?city=${encodeURIComponent(settings.city)}&country=${encodeURIComponent(settings.country)}&method=${settings.method}&school=${settings.school}&latitudeAdjustmentMethod=2`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("Kunne ikke hente bønnetider");
        const json = await response.json();
        if (json.code !== 200 || !json.data?.timings)
          throw new Error("Kontroller by og land");
        return [date, json.data.timings] as [string, Times];
      }),
    )
      .then((results) => {
        if (active) setTimes(Object.fromEntries(results));
      })
      .catch((e) => {
        if (active && e.name !== "AbortError") {
          setTimes({});
          setApiError(e.message || "Bønnetider utilgjengelige");
        }
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [settings, selectedDate]);
  const baseDate = new Date(`${selectedDate}T00:00:00`);
  const current = simulated ? new Date(`${selectedDate}T${demoTime}:00`) : now;
  const currentMinute =
    current.getHours() * 60 + current.getMinutes() + current.getSeconds() / 60;
  const hourFloor = Math.floor(currentMinute / 60);
  const visibleStart = hourFloor * 60;
  const horizon = visibleStart + 720;
  const isToday = selectedDate === dateKey(now);
  const events = useMemo(() => {
    const out: {
      key: string;
      name: string;
      minute: number;
      time: string;
      type: string;
    }[] = [];
    for (const offset of [-1, 0, 1, 2]) {
      const d = new Date(`${selectedDate}T12:00:00`);
      d.setDate(d.getDate() + offset);
      const key = dateKey(d);
      const t = times[key];
      if (!t) continue;
      for (const name of prayerNames) {
        const time = clean(t[name]);
        if (time)
          out.push({
            key,
            name,
            minute: offset * 1440 + minutes(time),
            time,
            type: "prayer",
          });
      }
      const last = clean(t.Lastthird);
      if (last)
        out.push({
          key,
          name: "Lastthird",
          minute: offset * 1440 + minutes(last),
          time: last,
          type: "night",
        });
    }
    return out;
  }, [times, selectedDate]);
  const nextPrayer = events
    .filter(
      (e) =>
        e.type === "prayer" &&
        e.name !== "Sunrise" &&
        e.minute >= currentMinute,
    )
    .sort((a, b) => a.minute - b.minute)[0];
  const displayActivities = activities
    .flatMap((a) => {
      const start = minutes(a.start),
        end = minutes(a.end) + (minutes(a.end) <= start ? 1440 : 0);
      return [-1, 0, 1].map((offset) => ({
        ...a,
        startMinute: start + offset * 1440,
        endMinute: end + offset * 1440,
        key: `${a.id}-${offset}`,
      }));
    })
    .filter((a) => a.endMinute > visibleStart && a.startMinute < horizon);
  const angle = (m: number) => ((((m % 720) + 720) % 720) / 720) * 360;
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const absolute = visibleStart + i * 60;
    return { hour: (absolute / 60) % 24, angle: angle(absolute) };
  });
  const openNew = () => {
    setDraft({
      id: "",
      title: "",
      start: clock(current),
      end: clock(new Date(current.getTime() + 3600000)),
      color: palette[activities.length % palette.length],
      done: false,
    });
    setModal(true);
  };
  const saveActivity = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    const item = {
      ...draft,
      id: draft.id || crypto.randomUUID(),
      title: draft.title.trim(),
    };
    setActivities((old) =>
      draft.id
        ? old.map((a) => (a.id === draft.id ? item : a))
        : [...old, item],
    );
    setModal(false);
  };
  const todayTimes = times[selectedDate];
  const fmtRemaining = (m: number) => {
    const v = Math.max(0, Math.round(m));
    return `${Math.floor(v / 60)}t ${v % 60}m`;
  };
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">✳</span>
          <div>
            <strong>AMANAH</strong>
            <small>Plan with purpose</small>
          </div>
        </div>
        <nav>
          <span className="nav-active">Min dag</span>
          <button onClick={() => setEditSettings(true)}>⚙ Innstillinger</button>
        </nav>
      </header>
      <main>
        <div className="intro">
          <div>
            <div className="eyebrow">DIN DAG, MED MENING</div>
            <h1>
              Assalamu alaikum <span>✺</span>
            </h1>
            <p>Skap rom for det som betyr mest</p>
          </div>
          <div className="date-control">
            <button
              aria-label="Forrige dag"
              onClick={() => {
                const d = new Date(`${selectedDate}T12:00:00`);
                d.setDate(d.getDate() - 1);
                setSelectedDate(dateKey(d));
              }}
            >
              ‹
            </button>
            <div>
              <small>VALGT DAG</small>
              <strong>
                {baseDate.toLocaleDateString("nb-NO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </strong>
            </div>
            <button
              aria-label="Neste dag"
              onClick={() => {
                const d = new Date(`${selectedDate}T12:00:00`);
                d.setDate(d.getDate() + 1);
                setSelectedDate(dateKey(d));
              }}
            >
              ›
            </button>
          </div>
        </div>
        <div className="dashboard">
          <section className="clock-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">TIDEN DIN</span>
                <h2>Din sirkulære dag</h2>
              </div>
              <span className="live-pill">
                <span />{" "}
                {simulated
                  ? "Forhåndsvisning"
                  : isToday
                    ? "Sanntid"
                    : "Valgt dato"}
              </span>
            </div>
            <p className="hint">
              12 timer fremover · tidligere timer erstattes automatisk
            </p>
            <div className="clock-wrap">
              <svg
                className="clock-svg"
                viewBox="0 0 600 600"
                role="img"
                aria-label="Dynamisk klokke med kommende aktiviteter og bønnetider"
              >
                <circle
                  cx="300"
                  cy="300"
                  r="237"
                  fill="none"
                  stroke="#eee9e0"
                  strokeWidth="42"
                />
                {Array.from({ length: 60 }, (_, i) => {
                  const a = i * 6,
                    p = polar(a, 267),
                    q = polar(a, i % 5 === 0 ? 280 : 273);
                  return (
                    <line
                      key={i}
                      x1={p.x}
                      y1={p.y}
                      x2={q.x}
                      y2={q.y}
                      stroke={i % 5 === 0 ? "#8a897e" : "#d4d2c8"}
                      strokeWidth={i % 5 === 0 ? 2.4 : 1}
                    />
                  );
                })}
                {displayActivities.flatMap((a) => {
                  const begin = Math.max(a.startMinute, visibleStart),
                    end = Math.min(a.endMinute, horizon);
                  if (end <= begin) return [];
                  // Split at every activity boundary so the available width is shared only during overlaps.
                  const boundaries = [
                    begin,
                    end,
                    ...displayActivities.flatMap((other) => [
                      other.startMinute,
                      other.endMinute,
                    ]),
                  ]
                    .filter((t) => t >= begin && t <= end)
                    .sort((x, y) => x - y);
                  return boundaries.slice(0, -1).flatMap((from, i) => {
                    const to = boundaries[i + 1];
                    if (to <= from) return [];
                    const mid = (from + to) / 2;
                    const simultaneous = displayActivities
                      .filter(
                        (other) =>
                          other.startMinute <= mid && other.endMinute > mid,
                      )
                      .sort(
                        (x, y) =>
                          x.startMinute - y.startMinute ||
                          x.key.localeCompare(y.key),
                      );
                    const lane = simultaneous.findIndex(
                      (other) => other.key === a.key,
                    );
                    if (lane < 0) return [];
                    const laneWidth = 39 / simultaneous.length;
                    const outer = 257 - lane * laneWidth;
                    const inner = outer - laneWidth + 0.8;
                    const startAngle = angle(from),
                      endAngle = startAngle + (to - from) / 2;
                    return (
                      <path
                        key={`${a.key}-${i}`}
                        d={ribbon(
                          startAngle + 0.08,
                          endAngle - 0.08,
                          outer,
                          inner,
                          Math.abs(from - a.startMinute) < 0.01,
                          Math.abs(to - a.endMinute) < 0.01,
                        )}
                        fill={a.color}
                        opacity={a.done ? 0.38 : 0.88}
                        stroke="#fffdf9"
                        strokeWidth="0.6"
                      />
                    );
                  });
                })}
                {events
                  .filter((e) => e.minute >= visibleStart && e.minute < horizon)
                  .map((e) => {
                    const a = angle(e.minute),
                      dot = polar(a, 211),
                      label = polar(a, 187);
                    return (
                      <g key={`${e.key}-${e.name}`}>
                        <circle
                          cx={dot.x}
                          cy={dot.y}
                          r="5.2"
                          fill={e.type === "night" ? "#a991b9" : "#426f60"}
                          stroke="#fffdf9"
                          strokeWidth="2"
                        />
                        <text
                          x={label.x}
                          y={label.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="prayer-label"
                        >
                          {e.name === "Lastthird"
                            ? "⅓ natt"
                            : e.name === "Sunrise"
                              ? "☀"
                              : e.name}
                        </text>
                      </g>
                    );
                  })}
                {displayActivities
                  .filter(
                    (a) =>
                      a.endMinute > visibleStart && a.startMinute < horizon,
                  )
                  .map((a) => {
                    const from = Math.max(a.startMinute, visibleStart),
                      to = Math.min(a.endMinute, horizon);
                    const mid = (from + to) / 2,
                      theta = angle(mid),
                      anchor = polar(theta, 215),
                      textPoint = polar(theta, 169);
                    const duration = to - from;
                    if (duration < 22) return null;
                    return (
                      <g
                        key={`activity-label-${a.key}`}
                        className="activity-annotation"
                      >
                        <line
                          x1={anchor.x}
                          y1={anchor.y}
                          x2={textPoint.x}
                          y2={textPoint.y}
                          stroke={a.color}
                          strokeWidth="1.6"
                          opacity=".85"
                        />
                        <text
                          x={textPoint.x}
                          y={textPoint.y - 5}
                          textAnchor="middle"
                          className="activity-clock-label"
                        >
                          {a.title.length > 13
                            ? a.title.slice(0, 12) + "…"
                            : a.title}
                        </text>
                      </g>
                    );
                  })}
                {timeSlots.map((s) => {
                  const p = polar(s.angle, 295);
                  return (
                    <text
                      key={s.hour}
                      x={p.x}
                      y={p.y}
                      dominantBaseline="middle"
                      textAnchor="middle"
                      className="hour-label"
                    >
                      {String(s.hour).padStart(2, "0")}
                    </text>
                  );
                })}
                {(() => {
                  const hourAngle = angle(currentMinute);
                  const minuteAngle =
                    (current.getMinutes() + current.getSeconds() / 60) * 6;
                  const hourTip = polar(hourAngle, 137),
                    minuteTip = polar(minuteAngle, 183);
                  const currentDot = polar(hourAngle, 237);
                  return (
                    <g>
                      <line
                        x1="300"
                        y1="300"
                        x2={hourTip.x}
                        y2={hourTip.y}
                        stroke="#a9aaa5"
                        opacity=".56"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <line
                        x1="300"
                        y1="300"
                        x2={minuteTip.x}
                        y2={minuteTip.y}
                        stroke="#a9aaa5"
                        opacity=".50"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <circle
                        cx={currentDot.x}
                        cy={currentDot.y}
                        r="9"
                        fill="#d64f4c"
                        stroke="#fffdf9"
                        strokeWidth="3"
                      />
                    </g>
                  );
                })()}
                <circle cx="300" cy="300" r="76" fill="#fffdf9" opacity=".93" />
                <text
                  x="300"
                  y="255"
                  textAnchor="middle"
                  className="center-caption"
                >
                  AKKURAT NÅ
                </text>
                <text
                  x="300"
                  y="310"
                  textAnchor="middle"
                  className="center-time"
                >
                  {clock(current)}
                </text>
                <text
                  x="300"
                  y="344"
                  textAnchor="middle"
                  className="center-sub"
                >
                  {nextPrayer
                    ? `Neste: ${labels[nextPrayer.name]} ${nextPrayer.time}`
                    : "Din tid er verdifull"}
                </text>
              </svg>
            </div>
            <div className="legend">
              <span>
                <i style={{ background: "#426f60" }} /> Salah
              </span>
              <span>
                <i style={{ background: "#a7b5ee" }} /> Aktiviteter
              </span>
              <span>
                <i style={{ background: "#a991b9" }} /> Siste tredjedel
              </span>
            </div>
            <div className="preview">
              <label>
                <input
                  type="checkbox"
                  checked={simulated}
                  onChange={(e) => setSimulated(e.target.checked)}
                />{" "}
                Test et tidspunkt
              </label>
              {simulated && (
                <input
                  type="time"
                  value={demoTime}
                  onChange={(e) => setDemoTime(e.target.value)}
                />
              )}
              <span>Prøv f.eks. 19:00 → 22:00 for å se timene byttes.</span>
            </div>
          </section>
          <aside className="sidebar">
            <section className="next-card">
              <div className="eyebrow">NESTE BØNN</div>
              <div className="next-top">
                <div>
                  <h2>{nextPrayer ? labels[nextPrayer.name] : "Salah"}</h2>
                  <p>{nextPrayer?.time || "—:—"}</p>
                </div>
                <div className="moon">☪</div>
              </div>
              <div className="next-bottom">
                {nextPrayer
                  ? `${fmtRemaining(nextPrayer.minute - currentMinute)} igjen`
                  : "Henter bønnetider…"}{" "}
                <span>✦</span>
              </div>
            </section>
            <section className="panel prayer-panel">
              <div className="panel-title">
                <h3>Bønnetider</h3>
                <span>{settings.city}</span>
              </div>
              {apiError && (
                <div className="error">
                  {apiError}. Åpne innstillinger for å endre sted.
                </div>
              )}
              {prayerNames.map((name) => (
                <div className="prayer-row" key={name}>
                  <span className="prayer-dot">
                    {name === "Sunrise" ? "☀" : "✧"}
                  </span>
                  <span>{labels[name]}</span>
                  <strong>{clean(todayTimes?.[name] || "") || "—:—"}</strong>
                </div>
              ))}
              <button
                className="text-link"
                onClick={() => setEditSettings(true)}
              >
                Endre sted og beregningsmetode ↗
              </button>
            </section>
            <section className="quote-card">
              <span>✦</span>
              <p>«Make the most of the time you have been given.»</p>
              <small>EN PÅMINNELSE FOR DAGEN</small>
            </section>
          </aside>
        </div>
        <section className="activities-panel">
          <div className="activities-head">
            <div>
              <span className="eyebrow">DAGLIG FOKUS</span>
              <h2>Min dagsplan</h2>
              <p>Planlegg dagen rundt bønnene dine.</p>
            </div>
            <button className="primary-btn" onClick={openNew}>
              ＋ Legg til aktivitet
            </button>
          </div>
          <div className="activity-list">
            {activities.length === 0 ? (
              <div className="empty">
                <span>✎</span>
                <h3>En ny dag, nye muligheter</h3>
                <p>Legg til din første aktivitet for å se den på klokken.</p>
                <button onClick={openNew}>Planlegg en aktivitet</button>
              </div>
            ) : (
              activities
                .slice()
                .sort((a, b) => minutes(a.start) - minutes(b.start))
                .map((a) => {
                  const start = minutes(a.start),
                    end = minutes(a.end) + (minutes(a.end) <= start ? 1440 : 0);
                  const remaining =
                    end - (currentMinute < start ? start : currentMinute);
                  return (
                    <div
                      className={`activity-item ${a.done ? "finished" : ""}`}
                      key={a.id}
                    >
                      <button
                        className="check"
                        aria-label="Marker som fullført"
                        onClick={() =>
                          setActivities((old) =>
                            old.map((x) =>
                              x.id === a.id ? { ...x, done: !x.done } : x,
                            ),
                          )
                        }
                      >
                        {a.done ? "✓" : ""}
                      </button>
                      <div
                        className="activity-color"
                        style={{ background: a.color }}
                      />
                      <div className="activity-info">
                        <strong>{a.title}</strong>
                        <small>
                          {a.start} – {a.end}
                        </small>
                      </div>
                      <div className="activity-duration">
                        {a.done
                          ? "Fullført"
                          : currentMinute >= start && currentMinute < end
                            ? "Pågår · " + fmtRemaining(remaining) + " igjen"
                            : fmtRemaining(end - start)}
                      </div>
                      <button
                        className="icon-btn"
                        aria-label="Rediger"
                        onClick={() => {
                          setDraft(a);
                          setModal(true);
                        }}
                      >
                        ✎
                      </button>
                      <button
                        className="icon-btn"
                        aria-label="Slett"
                        onClick={() =>
                          setActivities((old) =>
                            old.filter((x) => x.id !== a.id),
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        </section>
      </main>
      <footer>
        SAKINAH · Mindful time management <span>Made with intention ✦</span>
      </footer>
      {modal && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(false);
          }}
        >
          <form className="dialog" onSubmit={saveActivity}>
            <div className="dialog-header">
              <div>
                <span className="eyebrow">DIN PLAN</span>
                <h2>{draft.id ? "Rediger aktivitet" : "Ny aktivitet"}</h2>
              </div>
              <button type="button" onClick={() => setModal(false)}>
                ×
              </button>
            </div>
            <label>
              Aktivitet
              <input
                required
                autoFocus
                maxLength={70}
                placeholder="F.eks. Studere, Qur'an, arbeid…"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <div className="two-inputs">
              <label>
                Fra
                <input
                  type="time"
                  required
                  value={draft.start}
                  onChange={(e) =>
                    setDraft({ ...draft, start: e.target.value })
                  }
                />
              </label>
              <label>
                Til
                <input
                  type="time"
                  required
                  value={draft.end}
                  onChange={(e) => setDraft({ ...draft, end: e.target.value })}
                />
              </label>
            </div>
            <label>Farge</label>
            <div className="colors">
              {palette.map((c) => (
                <button
                  type="button"
                  aria-label={`Velg farge ${c}`}
                  className={draft.color === c ? "selected" : ""}
                  key={c}
                  style={{ background: c }}
                  onClick={() => setDraft({ ...draft, color: c })}
                />
              ))}
            </div>
            <label className="custom-color-label">
              Egen fargekode (HEX)
              <div className="custom-color-controls">
                <input
                  type="color"
                  aria-label="Velg egendefinert farge"
                  value={
                    /^#[0-9a-fA-F]{6}$/.test(draft.color)
                      ? draft.color
                      : "#a7b5ee"
                  }
                  onChange={(e) =>
                    setDraft({ ...draft, color: e.target.value })
                  }
                />
                <input
                  type="text"
                  aria-label="HEX-fargekode"
                  placeholder="#A7B5EE"
                  maxLength={7}
                  value={draft.color}
                  onChange={(e) =>
                    setDraft({ ...draft, color: e.target.value })
                  }
                />
              </div>
            </label>
            <button className="primary-btn full" type="submit">
              {draft.id ? "Lagre endringer" : "Legg til i dagsplan"}
            </button>
          </form>
        </div>
      )}
      {editSettings && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditSettings(false);
          }}
        >
          <form
            className="dialog"
            onSubmit={(e) => {
              e.preventDefault();
              setEditSettings(false);
            }}
          >
            <div className="dialog-header">
              <div>
                <span className="eyebrow">PERSONLIG TILPASNING</span>
                <h2>Innstillinger</h2>
              </div>
              <button type="button" onClick={() => setEditSettings(false)}>
                ×
              </button>
            </div>
            <label>
              By
              <input
                required
                value={settings.city}
                onChange={(e) =>
                  setSettings({ ...settings, city: e.target.value })
                }
              />
            </label>
            <label>
              Land
              <input
                required
                value={settings.country}
                onChange={(e) =>
                  setSettings({ ...settings, country: e.target.value })
                }
              />
            </label>
            <label>
              Beregningsmetode
              <select
                value={settings.method}
                onChange={(e) =>
                  setSettings({ ...settings, method: e.target.value })
                }
              >
                <option value="3">Muslim World League</option>
                <option value="2">ISNA</option>
                <option value="4">Umm Al-Qura</option>
                <option value="5">Egyptian General Authority</option>
                <option value="1">
                  University of Islamic Sciences, Karachi
                </option>
                <option value="13">Diyanet (Turkey)</option>
                <option value="15">Moonsighting Committee</option>
              </select>
            </label>
            <label>
              Asr-beregning
              <select
                value={settings.school}
                onChange={(e) =>
                  setSettings({ ...settings, school: e.target.value })
                }
              >
                <option value="0">Standard (Shafi'i, Maliki, Hanbali)</option>
                <option value="1">Hanafi</option>
              </select>
            </label>
            <p className="settings-note">
              Velg selv metoden du ønsker å følge. Bønnetider hentes fra AlAdhan
              og kan avvike fra din lokale moské, særlig på høye breddegrader.
            </p>
            <button type="submit" className="primary-btn full">
              Ferdig
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
export default App;
