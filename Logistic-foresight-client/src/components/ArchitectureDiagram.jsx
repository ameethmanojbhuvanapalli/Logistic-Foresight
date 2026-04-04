import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Info } from "lucide-react";
import services, {
  POLL_INTERVAL,
  WARMUP_TIMEOUT,
  KEEPALIVE_INTERVAL,
} from "../config/servicesConfig";

// ── Canvas dimensions ─────────────────────────────────────────────────────────
// Adjust W/H here (or in servicesConfig.js layout.cx/cy) to resize the diagram.
const W = 800;
const H = 490;
const NW = 160; // node width
const NH = 72;  // node height

// ── Swim-lane bands (background shading) ─────────────────────────────────────
// Edit label, y1, y2 and color to add / move lanes.
const LANES = [
  { label: "User Interface",    y1: 10,  y2: 120, color: "#f0f9ff" },
  { label: "Business Services", y1: 128, y2: 248, color: "#faf5ff" },
  { label: "ML & Data Layer",   y1: 256, y2: H-5, color: "#fff7ed" },
];

// ── Visual style maps ─────────────────────────────────────────────────────────
const TYPE_STYLE = {
  frontend: { fill: "#eff6ff", stroke: "#93c5fd", textColor: "#1e3a8a" },
  backend:  { fill: "#eef2ff", stroke: "#a5b4fc", textColor: "#312e81" },
  ml:       { fill: "#faf5ff", stroke: "#d8b4fe", textColor: "#6b21a8" },
  db:       { fill: "#fff7ed", stroke: "#fdba74", textColor: "#9a3412" },
  tool:     { fill: "#f0fdfa", stroke: "#5eead4", textColor: "#134e4a" },
};

const TYPE_LABELS = {
  frontend: "Frontend",
  backend:  "Backend",
  ml:       "ML / AI",
  db:       "Database",
  tool:     "Tool",
};

const STATUS_STYLE = {
  idle:         { dot: "#d1d5db", text: "#6b7280", label: "Idle" },
  warming:      { dot: "#facc15", text: "#a16207", label: "Warming…" },
  live:         { dot: "#22c55e", text: "#15803d", label: "Live" },
  failed:       { dot: "#ef4444", text: "#b91c1c", label: "Failed" },
  unconfigured: { dot: "#d1d5db", text: "#9ca3af", label: "Not configured" },
};

// ── Arrow path helper ─────────────────────────────────────────────────────────
// Returns an SVG path string for a smooth bezier connector between two nodes.
// Exit/entry edges are chosen based on the dominant direction of travel.
function arrowPath(from, to) {
  const hw = NW / 2;
  const hh = NH / 2;
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
  let sx, sy, tx, ty;

  if (Math.abs(dy) >= Math.abs(dx)) {
    // Predominantly vertical
    if (dy > 0) {
      sx = from.cx; sy = from.cy + hh; // exit bottom
      tx = to.cx;   ty = to.cy - hh;   // enter top
    } else {
      sx = from.cx; sy = from.cy - hh; // exit top
      tx = to.cx;   ty = to.cy + hh;   // enter bottom
    }
    const my = (sy + ty) / 2;
    return `M ${sx} ${sy} C ${sx} ${my}, ${tx} ${my}, ${tx} ${ty}`;
  } else {
    // Predominantly horizontal
    if (dx > 0) {
      sx = from.cx + hw; sy = from.cy; // exit right
      tx = to.cx - hw;   ty = to.cy;   // enter left
    } else {
      sx = from.cx - hw; sy = from.cy; // exit left
      tx = to.cx + hw;   ty = to.cy;   // enter right
    }
    const mx = (sx + tx) / 2;
    return `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`;
  }
}

// ── Single diagram node ───────────────────────────────────────────────────────
function DiagramNode({ service, pos }) {
  const { name, type, description, warmupUrl } = service;
  const isAlwaysLive = type === "frontend";

  const [status, setStatus] = useState(
    isAlwaysLive ? "live" : warmupUrl ? "idle" : "unconfigured"
  );
  const [showInfo, setShowInfo] = useState(false);

  const warmupTimerRef = useRef(null);
  const keepaliveRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (warmupTimerRef.current) clearTimeout(warmupTimerRef.current);
      if (keepaliveRef.current) clearInterval(keepaliveRef.current);
    };
  }, []);

  const attemptPing = useCallback(
    (url) => {
      // mode: "no-cors" is intentional: we only need to wake the service, not
      // read its response. A successful fetch (opaque response) means the server
      // responded; a TypeError/network error means it is still sleeping.
      fetch(url, { mode: "no-cors", cache: "no-cache" })
        .then(() => {
          setStatus("live");
          if (!keepaliveRef.current) {
            keepaliveRef.current = setInterval(() => {
              fetch(url, { mode: "no-cors", cache: "no-cache" }).catch(() => {});
            }, KEEPALIVE_INTERVAL);
          }
        })
        .catch(() => {
          if (Date.now() - startTimeRef.current >= WARMUP_TIMEOUT) {
            setStatus("failed");
          } else {
            warmupTimerRef.current = setTimeout(() => attemptPing(url), POLL_INTERVAL);
          }
        });
    },
    []
  );

  const handleClick = useCallback(() => {
    if (isAlwaysLive || !warmupUrl || status === "warming" || status === "live") return;
    if (warmupTimerRef.current) clearTimeout(warmupTimerRef.current);
    startTimeRef.current = Date.now();
    setStatus("warming");
    attemptPing(warmupUrl);
  }, [isAlwaysLive, warmupUrl, status, attemptPing]);

  const ts = TYPE_STYLE[type] || TYPE_STYLE.backend;
  const ss = STATUS_STYLE[status];
  const isClickable = !isAlwaysLive && warmupUrl && status !== "warming" && status !== "live";

  const left = pos.cx - NW / 2;
  const top  = pos.cy - NH / 2;

  return (
    <div
      onClick={handleClick}
      style={{
        position: "absolute",
        left,
        top,
        width: NW,
        height: NH,
        backgroundColor: ts.fill,
        border: `2px solid ${ts.stroke}`,
        borderRadius: 10,
        cursor: isClickable ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "6px 10px 6px 10px",
        boxSizing: "border-box",
        userSelect: "none",
        zIndex: 2,
        fontFamily: "Poppins, sans-serif",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        if (isClickable) e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)";
      }}
      title={isClickable ? "Click to warm up" : undefined}
    >
      {/* Info toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowInfo((v) => !v); }}
        style={{
          position: "absolute", top: 5, right: 7,
          background: "none", border: "none", cursor: "pointer",
          padding: 0, color: "#9ca3af", lineHeight: 1,
        }}
        aria-label="Service info"
        title="Service description"
      >
        <Info size={13} />
      </button>

      {/* Service name */}
      <div style={{ fontSize: 12, fontWeight: 700, color: ts.textColor, paddingRight: 18, lineHeight: 1.3 }}>
        {name}
      </div>

      {/* Type tag */}
      <div style={{ fontSize: 9, color: ts.textColor, opacity: 0.7, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>
        {TYPE_LABELS[type] || type}
      </div>

      {/* Status row */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: ss.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: ss.text, fontWeight: 600 }}>{ss.label}</span>
        {status === "warming" && (
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: "#fef08a", overflow: "hidden", marginLeft: 2 }}>
            <div className="animate-pulse" style={{ height: "100%", background: "#eab308", borderRadius: 2, width: "100%" }} />
          </div>
        )}
      </div>

      {/* Info tooltip – floats below the node */}
      {showInfo && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: Math.max(NW, 220),
            background: "white",
            border: `1.5px solid ${ts.stroke}`,
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 11,
            color: "#4b5563",
            lineHeight: 1.5,
            zIndex: 20,
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}

// ── Main diagram component ────────────────────────────────────────────────────
function ArchitectureDiagram() {
  // Build a lookup: id → layout position
  const layoutMap = useMemo(() => {
    const m = {};
    services.forEach((s) => { if (s.layout) m[s.id] = s.layout; });
    return m;
  }, []);

  // Derive arrow edges from dependency declarations
  const edges = useMemo(() => {
    const result = [];
    services.forEach((svc) => {
      const from = layoutMap[svc.id];
      if (!from) return;
      (svc.dependencies || []).forEach((depId) => {
        const to = layoutMap[depId];
        if (to) result.push({ from, to, key: `${svc.id}→${depId}` });
      });
    });
    return result;
  }, [layoutMap]);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-gray-50 p-2">
      {/* Scroll wrapper – allows diagram to scroll horizontally on small screens */}
      <div style={{ position: "relative", width: W, height: H }} className="mx-auto">

        {/* ── SVG layer: swim-lane backgrounds + arrows ── */}
        <svg
          width={W}
          height={H}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        >
          <defs>
            {/* Arrowhead marker */}
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="#94a3b8" />
            </marker>
          </defs>

          {/* Swim-lane backgrounds */}
          {LANES.map((lane) => (
            <g key={lane.label}>
              <rect
                x={10} y={lane.y1}
                width={W - 20} height={lane.y2 - lane.y1}
                rx={8} fill={lane.color} stroke="#e2e8f0" strokeWidth={1}
              />
              <text
                x={20} y={lane.y1 + 14}
                fontSize={10} fill="#94a3b8"
                fontFamily="Poppins, sans-serif" fontWeight="600"
                textAnchor="start" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
              >
                {lane.label}
              </text>
            </g>
          ))}

          {/* Arrows */}
          {edges.map(({ from, to, key }) => (
            <path
              key={key}
              d={arrowPath(from, to)}
              stroke="#94a3b8"
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="none"
              markerEnd="url(#arrowhead)"
            />
          ))}
        </svg>

        {/* ── Node layer ── */}
        {services.map((svc) => {
          const pos = layoutMap[svc.id];
          if (!pos) return null;
          return <DiagramNode key={svc.id} service={svc} pos={pos} />;
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 pt-2 pb-1">
        {Object.entries(TYPE_STYLE).map(([type, style]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, borderRadius: 3, background: style.fill, border: `1.5px solid ${style.stroke}` }} />
            <span className="text-xs text-gray-400">{TYPE_LABELS[type]}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
          <span>Click a node to warm up · ℹ for description</span>
        </div>
      </div>
    </div>
  );
}

export default ArchitectureDiagram;
