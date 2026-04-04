import NavigationBar from "../components/NavigationBar";
import ArchitectureDiagram from "../components/ArchitectureDiagram";
import { Link } from "react-router-dom";
import {
  TrendingUpDown,
  Group,
  Waypoints,
  Activity,
  Shuffle,
  AlertTriangle,
} from "lucide-react";

const features = [
  { label: "Real-time Counter Predictions", icon: Activity },
  { label: "Dynamic Counter Allocation", icon: Shuffle },
  { label: "Real-time Order Forecasts", icon: TrendingUpDown },
  { label: "Clustered Delivery Locations", icon: Group },
  { label: "Optimized Route Planning", icon: Waypoints },
];

const demoSteps = [
  {
    step: 1,
    title: "Warm up the services",
    detail:
      "Click each service card below to wake it up. Free-tier Render services spin down after inactivity and can take 30–90 seconds to respond. Wait until all required services show \u201cLive\u201d before proceeding.",
  },
  {
    step: 2,
    title: "Generate demo orders",
    detail:
      "Head to the Dashboard and use the Order Controls panel to generate a batch of sample orders. These are sent to Kafka and flow through the pipeline.",
  },
  {
    step: 3,
    title: "Observe counter predictions",
    detail:
      "The Counters panel updates in real time, showing how many counters are currently running and how many the ML model predicts will be needed.",
  },
  {
    step: 4,
    title: "Run analytics & forecasting",
    detail:
      "In the Analytics section, adjust the look-back window and trigger a forecast. The chart overlays predicted order volume against actuals.",
  },
  {
    step: 5,
    title: "Cluster & route deliveries",
    detail:
      "In the Delivery section, set vehicle capacity and warehouse coordinates, then click \u201cCluster Now\u201d. The map will render color-coded delivery clusters and optimized routes.",
  },
];

function Home() {
  return (
    <div>
      <NavigationBar />

      <div className="flex flex-col space-y-10 py-12 px-14 ml-10 font-poppins">
        {/* ── Hero ── */}
        <section className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-[#ff8c8c]">
            Logistic Foresight
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            An end-to-end logistics intelligence platform that predicts
            order-processing counter demand, forecasts future order volumes, and
            computes optimized delivery routes — all in real time.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="px-6 py-2 bg-[#ff8c8c] text-white rounded-lg font-semibold hover:bg-[#ee6666] transition-colors"
            >
              Open Dashboard
            </Link>
            <a
              href="https://github.com/ameethmanojbhuvanapalli/Logistic-Foresight"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 border border-[#ff8c8c] text-[#ff8c8c] rounded-lg font-semibold hover:bg-[#fff0f0] transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </section>

        {/* ── Key Features ── */}
        <section>
          <h2 className="text-2xl font-semibold text-[#ff8c8c] mb-4">
            Key Features
          </h2>
          <div className="flex flex-row flex-wrap justify-around gap-4">
            {features.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="bg-gray-50 p-4 hover:shadow-md border rounded-lg text-center flex flex-col items-center w-48 gap-2"
              >
                <p className="text-sm font-medium">{label}</p>
                <Icon className="h-10 w-10 text-[#ff8c8c]" />
              </div>
            ))}
          </div>
        </section>

        {/* ── Free-tier warning ── */}
        <section className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <AlertTriangle className="text-yellow-500 mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-semibold text-yellow-700">
              Free-tier cold-start notice
            </p>
            <p className="text-sm text-yellow-600 mt-1">
              All backend services are hosted on Render's free tier and may be
              sleeping. They can take <strong>30–90 seconds</strong> to wake up
              after the first request. Use the interactive architecture below to
              warm them up before using the Dashboard.
            </p>
          </div>
        </section>

        {/* ── Interactive Architecture ── */}
        <section>
          <h2 className="text-2xl font-semibold text-[#ff8c8c] mb-1">
            System Architecture
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Click a service card to wake it up. Click the{" "}
            <span className="inline-flex items-center gap-1 font-medium text-gray-600">
              ℹ
            </span>{" "}
            icon inside a card to read what the service does.
          </p>
          <ArchitectureDiagram />
        </section>

        {/* ── How to Demo ── */}
        <section>
          <h2 className="text-2xl font-semibold text-[#ff8c8c] mb-4">
            How to Demo
          </h2>
          <ol className="space-y-4">
            {demoSteps.map(({ step, title, detail }) => (
              <li key={step} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ff8c8c] text-white flex items-center justify-center font-bold text-sm">
                  {step}
                </span>
                <div>
                  <p className="font-semibold text-gray-800">{title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

export default Home;
