import { useState, useCallback, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { POLL_INTERVAL, WARMUP_TIMEOUT, KEEPALIVE_INTERVAL } from "../config/servicesConfig";

const STATUS_LABELS = {
  idle: "Idle",
  warming: "Warming up…",
  live: "Live",
  failed: "Failed",
  unconfigured: "Not configured",
};

const STATUS_COLORS = {
  idle: "bg-gray-100 text-gray-500",
  warming: "bg-yellow-100 text-yellow-700",
  live: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-600",
  unconfigured: "bg-gray-100 text-gray-400",
};

const TYPE_BORDER = {
  frontend: "border-blue-300",
  backend: "border-indigo-300",
  ml: "border-purple-300",
  db: "border-orange-300",
  tool: "border-teal-300",
};

const TYPE_LABELS = {
  frontend: "Frontend",
  backend: "Backend",
  ml: "ML / AI",
  db: "Database",
  tool: "Tool",
};

function ServiceCard({ service }) {
  const { name, type, description, warmupUrl } = service;
  const isAlwaysLive = type === "frontend";

  const initialStatus = isAlwaysLive
    ? "live"
    : warmupUrl
    ? "idle"
    : "unconfigured";

  const [status, setStatus] = useState(initialStatus);
  const [showInfo, setShowInfo] = useState(false);

  const warmupTimerRef = useRef(null);
  const keepaliveTimerRef = useRef(null);
  const startTimeRef = useRef(null);

  const clearWarmupTimer = () => {
    if (warmupTimerRef.current) {
      clearTimeout(warmupTimerRef.current);
      warmupTimerRef.current = null;
    }
  };

  const startKeepalive = useCallback(
    (url) => {
      if (keepaliveTimerRef.current) return;
      keepaliveTimerRef.current = setInterval(() => {
        fetch(url, { mode: "no-cors", cache: "no-cache" }).catch(() => {});
      }, KEEPALIVE_INTERVAL);
    },
    []
  );

  useEffect(() => {
    return () => {
      clearWarmupTimer();
      if (keepaliveTimerRef.current) {
        clearInterval(keepaliveTimerRef.current);
      }
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
          startKeepalive(url);
        })
        .catch(() => {
          const elapsed = Date.now() - startTimeRef.current;
          if (elapsed >= WARMUP_TIMEOUT) {
            setStatus("failed");
          } else {
            warmupTimerRef.current = setTimeout(
              () => attemptPing(url),
              POLL_INTERVAL
            );
          }
        });
    },
    [startKeepalive]
  );

  const handleCardClick = useCallback(() => {
    if (isAlwaysLive || !warmupUrl || status === "warming" || status === "live") {
      return;
    }
    clearWarmupTimer();
    startTimeRef.current = Date.now();
    setStatus("warming");
    attemptPing(warmupUrl);
  }, [isAlwaysLive, warmupUrl, status, attemptPing]);

  const handleInfoClick = (e) => {
    e.stopPropagation();
    setShowInfo((prev) => !prev);
  };

  const borderColor = TYPE_BORDER[type] || "border-gray-300";
  const statusStyle = STATUS_COLORS[status];

  const isClickable =
    !isAlwaysLive && warmupUrl && status !== "warming" && status !== "live";

  return (
    <div
      onClick={handleCardClick}
      className={`relative bg-white rounded-xl border-2 ${borderColor} p-5 flex flex-col space-y-2 transition-shadow duration-200 select-none ${
        isClickable ? "cursor-pointer hover:shadow-lg" : "cursor-default"
      }`}
    >
      {/* Info toggle button */}
      <button
        onClick={handleInfoClick}
        className="absolute top-3 right-3 text-gray-400 hover:text-[#ff8c8c] transition-colors"
        title="Show service description"
        aria-label="Service info"
      >
        <Info size={18} />
      </button>

      {/* Service name */}
      <h3 className="text-base font-semibold text-gray-800 pr-7">{name}</h3>

      {/* Type label */}
      <span className="text-xs uppercase tracking-wide text-gray-400 font-medium">
        {TYPE_LABELS[type] || type}
      </span>

      {/* Status badge */}
      <span
        className={`inline-block text-xs px-2 py-1 rounded-full font-medium w-fit ${statusStyle}`}
      >
        {STATUS_LABELS[status]}
      </span>

      {/* Warming progress bar */}
      {status === "warming" && (
        <div className="w-full h-1 bg-yellow-100 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-yellow-400 rounded-full animate-pulse w-full" />
        </div>
      )}

      {/* Description revealed by info button */}
      {showInfo && (
        <p className="text-sm text-gray-500 border-t border-gray-100 pt-2 mt-1">
          {description}
        </p>
      )}

      {/* Click hint */}
      {isClickable && (
        <p className="text-xs text-gray-300 mt-1">Click to warm up</p>
      )}
    </div>
  );
}

export default ServiceCard;
