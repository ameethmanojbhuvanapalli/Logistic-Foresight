import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import services, {
  POLL_INTERVAL,
  WARMUP_TIMEOUT,
  KEEPALIVE_INTERVAL,
} from "../config/servicesConfig";

// ─────────────────────────────────────────────────────────────────────────────
// Canvas & node dimensions
// ─────────────────────────────────────────────────────────────────────────────
const W  = 860;   // SVG canvas width  (px)
const H  = 520;   // SVG canvas height (px)
const NW = 158;   // node box width
const NH = 76;    // node box height
const HR = 26;    // colored header strip height inside each node
const CR = 8;     // corner radius

// ─────────────────────────────────────────────────────────────────────────────
// Swim-lane configuration
// Edit label, y1/y2, fill and stroke to add / reposition lanes.
// ─────────────────────────────────────────────────────────────────────────────
const LANES = [
  { label: "User Interface",    y1: 8,   y2: 122, fill: "#f0f9ff", stroke: "#93c5fd" },
  { label: "Application Layer", y1: 130, y2: 262, fill: "#f5f3ff", stroke: "#c4b5fd" },
  { label: "Data & ML Layer",   y1: 270, y2: H-6, fill: "#fff7ed", stroke: "#fdba74" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Visual style per service type
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_STYLE = {
  frontend: { header: "#2563eb", headerTxt: "#fff", body: "#eff6ff", bodyTxt: "#1e3a8a", label: "Frontend"  },
  backend:  { header: "#6366f1", headerTxt: "#fff", body: "#eef2ff", bodyTxt: "#312e81", label: "Backend"   },
  ml:       { header: "#9333ea", headerTxt: "#fff", body: "#faf5ff", bodyTxt: "#581c87", label: "ML / AI"   },
  db:       { header: "#ea580c", headerTxt: "#fff", body: "#fff7ed", bodyTxt: "#9a3412", label: "Database"  },
  tool:     { header: "#0d9488", headerTxt: "#fff", body: "#f0fdfa", bodyTxt: "#134e4a", label: "Tool"      },
};

// ─────────────────────────────────────────────────────────────────────────────
// Status dot color & label
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_DOT = {
  idle:         "#94a3b8",
  warming:      "#eab308",
  live:         "#22c55e",
  failed:       "#ef4444",
  unconfigured: "#cbd5e1",
};

const STATUS_LABEL = {
  idle:         "Idle",
  warming:      "Warming…",
  live:         "Live",
  failed:       "Failed",
  unconfigured: "—",
};

// ─────────────────────────────────────────────────────────────────────────────
// Arrow path helper — orthogonal "elbow" connector between two node centres.
// Exits the bottom of the source, enters the top of the target (vertical-
// dominant), or exits a side for horizontal-dominant connections.
// ─────────────────────────────────────────────────────────────────────────────
function elbowPath(from, to) {
  const hw = NW / 2;
  const hh = NH / 2;
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;

  if (Math.abs(dy) >= Math.abs(dx)) {
    // Vertical-dominant
    if (dy > 0) {
      const sx = from.cx, sy = from.cy + hh;
      const tx = to.cx,   ty = to.cy   - hh;
      const my = (sy + ty) / 2;
      return `M ${sx} ${sy} L ${sx} ${my} L ${tx} ${my} L ${tx} ${ty}`;
    } else {
      const sx = from.cx, sy = from.cy - hh;
      const tx = to.cx,   ty = to.cy   + hh;
      const my = (sy + ty) / 2;
      return `M ${sx} ${sy} L ${sx} ${my} L ${tx} ${my} L ${tx} ${ty}`;
    }
  } else {
    // Horizontal-dominant
    if (dx > 0) {
      const sx = from.cx + hw, sy = from.cy;
      const tx = to.cx   - hw, ty = to.cy;
      const mx = (sx + tx) / 2;
      return `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ty} L ${tx} ${ty}`;
    } else {
      const sx = from.cx - hw, sy = from.cy;
      const tx = to.cx   + hw, ty = to.cy;
      const mx = (sx + tx) / 2;
      return `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ty} L ${tx} ${ty}`;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual SVG node
// ─────────────────────────────────────────────────────────────────────────────
function SvgNode({ service, status, onWarmup, isInfoOpen, onToggleInfo }) {
  const { id, name, type } = service;
  const pos = service.layout;
  if (!pos) return null;

  const ts = TYPE_STYLE[type] || TYPE_STYLE.backend;
  const isAlwaysLive = type === "frontend";
  const isClickable  = !isAlwaysLive && service.warmupUrl &&
                       status !== "warming" && status !== "live";

  const x = pos.cx - NW / 2;
  const y = pos.cy - NH / 2;

  // truncate name to fit header
  const displayName = name.length > 20 ? name.slice(0, 19) + "…" : name;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={() => isClickable && onWarmup(service)}
      style={{ cursor: isClickable ? "pointer" : "default" }}
      role={isClickable ? "button" : undefined}
      aria-label={isClickable ? `Warm up ${name}` : name}
    >
      {/* Drop shadow */}
      <rect x={2} y={3} width={NW} height={NH} rx={CR} fill="rgba(0,0,0,0.08)" />

      {/* Body background */}
      <rect width={NW} height={NH} rx={CR} fill={ts.body} stroke={ts.header} strokeWidth={1.5} />

      {/* Colored header strip — clip to preserve rounded top corners only */}
      <clipPath id={`hclip-${id}`}>
        <rect width={NW} height={HR + CR} rx={CR} />
      </clipPath>
      <rect
        width={NW} height={HR + CR}
        clipPath={`url(#hclip-${id})`}
        fill={ts.header}
      />

      {/* Service name in header */}
      <text
        x={NW / 2} y={HR / 2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={11} fontWeight="700" fill={ts.headerTxt}
        fontFamily="Poppins, sans-serif"
      >
        {displayName}
      </text>

      {/* ℹ button in header top-right */}
      <g
        transform={`translate(${NW - 11}, 8)`}
        onClick={(e) => { e.stopPropagation(); onToggleInfo(id); }}
        style={{ cursor: "pointer" }}
        role="button"
        aria-label={`${name} info`}
      >
        <circle r={7} fill="rgba(255,255,255,0.25)" stroke={ts.headerTxt} strokeWidth={1} strokeOpacity={0.5} />
        <text
          textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fill={ts.headerTxt}
          fontFamily="sans-serif"
        >
          ℹ
        </text>
      </g>

      {/* Status dot */}
      <circle cx={14} cy={HR + (NH - HR) / 2} r={5} fill={STATUS_DOT[status]}>
        {status === "warming" && (
          <animate attributeName="opacity" values="0.3;1;0.3" dur="0.9s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Status text */}
      <text
        x={24} y={HR + (NH - HR) / 2 + 1}
        dominantBaseline="middle"
        fontSize={10} fill={ts.bodyTxt}
        fontFamily="Poppins, sans-serif"
      >
        {STATUS_LABEL[status]}
      </text>

      {/* Type badge (right side of body) */}
      <text
        x={NW - 8} y={HR + (NH - HR) / 2 + 1}
        textAnchor="end" dominantBaseline="middle"
        fontSize={8.5} fill={ts.header} opacity={0.7}
        fontFamily="Poppins, sans-serif"
      >
        {ts.label}
      </text>

      {/* Warming pulse bar at bottom */}
      {status === "warming" && (
        <rect y={NH - 5} width={NW} height={5} fill="#fde68a">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="0.9s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Hover tooltip title */}
      <title>{isClickable ? `Click to warm up ${name}` : name}</title>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ArchitectureDiagram
// ─────────────────────────────────────────────────────────────────────────────
function ArchitectureDiagram() {
  // Per-service warmup state
  const [nodeStates, setNodeStates] = useState(() => {
    const m = {};
    services.forEach((s) => {
      m[s.id] = s.type === "frontend" ? "live" : s.warmupUrl ? "idle" : "unconfigured";
    });
    return m;
  });

  // Which node has its description panel open (id or null)
  const [openInfo, setOpenInfo] = useState(null);

  const warmupTimers  = useRef({});
  const keepaliveTimers = useRef({});
  const startTimes    = useRef({});

  useEffect(() => {
    return () => {
      Object.values(warmupTimers.current).forEach(clearTimeout);
      Object.values(keepaliveTimers.current).forEach(clearInterval);
    };
  }, []);

  const attemptPing = useCallback((id, url) => {
    // mode: "no-cors" is intentional: we only need to wake the service, not
    // read its response. A successful fetch (opaque response) means the server
    // responded; a TypeError/network error means it is still sleeping.
    fetch(url, { mode: "no-cors", cache: "no-cache" })
      .then(() => {
        setNodeStates((s) => ({ ...s, [id]: "live" }));
        if (!keepaliveTimers.current[id]) {
          keepaliveTimers.current[id] = setInterval(() => {
            fetch(url, { mode: "no-cors", cache: "no-cache" }).catch(() => {});
          }, KEEPALIVE_INTERVAL);
        }
      })
      .catch(() => {
        if (Date.now() - startTimes.current[id] >= WARMUP_TIMEOUT) {
          setNodeStates((s) => ({ ...s, [id]: "failed" }));
        } else {
          warmupTimers.current[id] = setTimeout(() => attemptPing(id, url), POLL_INTERVAL);
        }
      });
  }, []);

  const handleWarmup = useCallback((svc) => {
    const { id, warmupUrl } = svc;
    setNodeStates((prev) => {
      if (prev[id] === "warming" || prev[id] === "live") return prev;
      if (warmupTimers.current[id]) clearTimeout(warmupTimers.current[id]);
      startTimes.current[id] = Date.now();
      setTimeout(() => attemptPing(id, warmupUrl), 0);
      return { ...prev, [id]: "warming" };
    });
  }, [attemptPing]);

  const handleToggleInfo = useCallback((id) => {
    setOpenInfo((prev) => (prev === id ? null : id));
  }, []);

  // Derive arrow edges from dependency declarations in servicesConfig.js
  const edges = useMemo(() => {
    const byId = Object.fromEntries(services.map((s) => [s.id, s]));
    const result = [];
    services.forEach((svc) => {
      if (!svc.layout) return;
      (svc.dependencies || []).forEach((depId) => {
        const dep = byId[depId];
        if (dep?.layout) {
          result.push({ from: svc.layout, to: dep.layout, key: `${svc.id}→${depId}` });
        }
      });
    });
    return result;
  }, []);

  const infoService = openInfo ? services.find((s) => s.id === openInfo) : null;
  const infoPos = infoService?.layout;

  // Position the info panel to the right of the node; flip left if near right edge.
  const PANEL_W = 230;
  const PANEL_OFFSET = NW / 2 + 12;
  const rawX = infoPos ? infoPos.cx + PANEL_OFFSET : 0;
  const infoPanelX = infoPos
    ? rawX + PANEL_W > W - 8 ? infoPos.cx - PANEL_OFFSET - PANEL_W : rawX
    : 0;
  const infoPanelY = infoPos ? Math.max(infoPos.cy - NH / 2, 8) : 0;

  const infoTypeStyle = infoService ? (TYPE_STYLE[infoService.type] || TYPE_STYLE.backend) : null;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-2 shadow-sm">
      {/* position:relative wrapper so the HTML tooltip overlay aligns with SVG coords */}
      <div
        style={{ position: "relative", width: W, margin: "0 auto" }}
        onClick={() => setOpenInfo(null)}
      >
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: "block" }}
        >
          <defs>
            {/* Arrowhead marker */}
            <marker id="ah" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
              <path d="M 0 0 L 9 3.5 L 0 7 Z" fill="#94a3b8" />
            </marker>
          </defs>

          {/* ── Swim-lane backgrounds ── */}
          {LANES.map((lane) => (
            <g key={lane.label}>
              <rect
                x={8} y={lane.y1} width={W - 16} height={lane.y2 - lane.y1}
                rx={8} fill={lane.fill} stroke={lane.stroke} strokeWidth={1}
              />
              {/* Lane label */}
              <text
                x={22} y={lane.y1 + 15}
                fontSize={9} fill="#94a3b8"
                fontFamily="Poppins, sans-serif" fontWeight="700"
                letterSpacing="0.08em"
              >
                {lane.label.toUpperCase()}
              </text>
            </g>
          ))}

          {/* ── Arrows ── */}
          {edges.map(({ from, to, key }) => (
            <path
              key={key}
              d={elbowPath(from, to)}
              stroke="#94a3b8"
              strokeWidth={1.5}
              fill="none"
              strokeLinejoin="round"
              markerEnd="url(#ah)"
            />
          ))}

          {/* ── Service nodes ── */}
          {services.map((svc) => (
            <SvgNode
              key={svc.id}
              service={svc}
              status={nodeStates[svc.id]}
              onWarmup={handleWarmup}
              isInfoOpen={openInfo === svc.id}
              onToggleInfo={handleToggleInfo}
            />
          ))}
        </svg>

        {/* ── Description panel — HTML overlay, never clipped by SVG viewport ── */}
        {infoService && infoPos && infoTypeStyle && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: infoPanelX,
              top: infoPanelY,
              width: PANEL_W,
              background: "white",
              border: `1.5px solid ${infoTypeStyle.header}`,
              borderTop: `4px solid ${infoTypeStyle.header}`,
              borderRadius: 8,
              padding: "10px 13px 12px",
              fontSize: 12,
              color: "#374151",
              lineHeight: 1.6,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              zIndex: 20,
              pointerEvents: "auto",
            }}
          >
            <strong
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 13,
                color: infoTypeStyle.header,
              }}
            >
              {infoService.name}
            </strong>

            <p style={{ margin: 0, marginBottom: 8 }}>
              {infoService.description}
            </p>

            {infoService.accessUrl && (
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                {/* ✅ THIS WAS YOUR BUG */}
                <a
                  href={infoService.accessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    background: infoTypeStyle.header,
                    color: "white",
                    borderRadius: 4,
                    textDecoration: "none",
                    fontSize: 11,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Open Studio →
                </a>

                {infoService.credentials && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "6px 8px",
                      background: "#f9fafb",
                      borderRadius: 4,
                      fontSize: 10,
                      fontFamily: "monospace",
                    }}
                  >
                    <div>
                      <strong>Username:</strong> {infoService.credentials.username}
                    </div>
                    <div>
                      <strong>Password:</strong> {infoService.credentials.password}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 pt-2 pb-1 border-t border-gray-100">
        {Object.entries(TYPE_STYLE).map(([type, style]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div style={{
              width: 13, height: 13, borderRadius: 3,
              background: style.body, border: `2px solid ${style.header}`,
            }} />
            <span className="text-xs text-gray-400">{style.label}</span>
          </div>
        ))}
        <span className="ml-auto text-xs text-gray-400 italic">
          Click node to warm up &middot; ℹ for description
        </span>
      </div>
    </div>
  );
}

export default ArchitectureDiagram;
