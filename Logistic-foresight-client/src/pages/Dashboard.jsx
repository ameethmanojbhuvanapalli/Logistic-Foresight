import NavigationBar from "../components/NavigationBar";
import Analytics from "../components/Analytics";
import Counters from "../components/Counters";
import CounterSettings from "../components/CounterSettings";
import Delivery from "../components/Delivery";
import OrderControls from '../components/OrderControls';

function Dashboard() {
  return (
    <div>
      {/* Navigation bar */}
      <NavigationBar />

      <div className="flex flex-col space-y-6 py-12 px-14 ml-10 font-poppins">
        <h2 className="text-4xl font-bold text-center text-[#ff8c8c]">
          Dashboard
        </h2>

        <OrderControls
          onOrdersGenerated={(orders) => console.log(orders)}
          onRegenerated={() => {/* refetch your data */}}
        />

        {/* Set the Timer and Helpers */}
        <CounterSettings />

        {/* Counters */}
        <Counters />

        {/* Analytics */}
        <Analytics />

        {/* Delivery */}
        <Delivery />
      </div>
    </div>
  );
}

export default Dashboard;
