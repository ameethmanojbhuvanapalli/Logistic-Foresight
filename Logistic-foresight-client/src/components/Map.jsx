import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";
import { Tab } from "@headlessui/react";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useRef } from "react";
import useStore from "../store";
import useGet from "../hooks/useGet";
import { toast } from "react-toastify";
import wicon from "../assets/icons/warehouseIcon.png";
import licon from "../assets/icons/deliverIcon.png"
import L from 'leaflet';

const warehouseIcon = L.icon({
  iconUrl: wicon,
  iconSize: [40, 40], // Size of the icon
  iconAnchor: [12, 41], // The point of the icon which will correspond to marker's location
  popupAnchor: [1, -34], // The point from which the popup should open relative to the iconAnchor
});

const deliverIcon = L.icon({
  iconUrl: licon,
  iconSize: [30, 30], // Size of the icon
  iconAnchor: [12, 30], // The point of the icon which will correspond to marker's location
  popupAnchor: [1, -34], // The point from which the popup should open relative to the iconAnchor
});

// Custom component to handle map centering
const CenterMap = ({ lat, lng }) => {
  const map = useMap();
  
  useEffect(() => {
    // Set the map view to the new coordinates
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);

  return null; // This component does not render anything visible
};

const Map = () => {
  const serviceUrl = import.meta.env.VITE_DELIVERY_SERVICE_URL;
  const { mapData, warehouseLat, warehouseLong, setMapData } = useStore();
  const { data, loading, error } = useGet(
    `${serviceUrl}/api/orders/clusters`
  );
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (data) {
      setMapData(data);
    } else {
      setMapData([]);
    }
  }, [data, setMapData]);

  const clusterColorMapping = {
    0: "#FF0000", 1: "#00FF00", 2: "#0000FF", 3: "#FFFF00", 4: "#FF00FF",
    5: "#00FFFF", 6: "#FFA500", 7: "#800080", 8: "#FFC0CB", 9: "#808000",
    10: "#00FF7F", 11: "#FF4500", 12: "#1E90FF", 13: "#FFD700", 14: "#ADFF2F",
    15: "#DC143C", 16: "#FF1493", 17: "#7FFF00", 18: "#8A2BE2", 19: "#FF69B4"
  };

  const renderMarkersAndPolylines = (cluster) => {
    const positions = cluster.Route.map((point) => [
      point.Latitude,
      point.Longitude
    ]);
  
    return (
      <div key={cluster.Cluster}>
        {positions.map((pos, idx) => {
          // Check if the position is the warehouse location
          const isWarehouseLocation = pos[0] === warehouseLat && pos[1] === warehouseLong;
  
          // Render the marker only if it's not the warehouse location
          return !isWarehouseLocation ? (
            <Marker position={pos} key={idx} icon={deliverIcon}>
              <Popup>Delivery Location: Lat: {pos[0]}, Long: {pos[1]}</Popup>
            </Marker>
          ) : (
            <Marker position={pos} key={idx} icon={warehouseIcon}>
              <Popup>Warehouse Location</Popup>
            </Marker>
          );
        })}
        <Polyline
          positions={positions}
          color={clusterColorMapping[cluster.Cluster] || "black"}
        />
      </div>
    );
  };
  

  const handleDelivery = async (clusterForDelivery) => {
    try {
      const response = await fetch(
        `${serviceUrl}/api/orders/deliver/${clusterForDelivery}`,
        { method: "POST" }
      );
      const result = await response.text();

      if (result === "Orders in Cluster delivered successfully!") {
        const newDataResponse = await fetch(
          `${serviceUrl}/api/orders/clusters`
        );
        const newData = await newDataResponse.json();
        setMapData(newData);

        if (newData.length === 0) setActiveTab(0);

        toast.success("Delivery successful!", {
          position: "bottom-left", autoClose: 3000
        });
      } else {
        toast.error("Delivery not successful. No changes made.", {
          position: "top-center", autoClose: 3000
        });
      }
    } catch (error) {
      console.error("Error delivering orders or fetching clusters:", error);
      toast.error("Delivery not successful. No changes made.", {
        position: "top-center", autoClose: 3000
      });
    }
  };

  return (
    <div className="w-full">
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 p-2 bg-[#ff8c8c] rounded-sm">
          <Tab className={({ selected }) =>
            selected ? "bg-slate-50 px-2 text-gray-950 p-1 shadow rounded-md"
              : "px-2 text-blue-100 p-1 hover:bg-white/[0.12] hover:text-white rounded-md"
          }>
            All
          </Tab>
          {mapData.length === 0 ? (
            <span className="text-center text-slate-50 py-1 w-full">
              No clusters found
            </span>
          ) : (
            mapData.map((cluster) => (
              <Tab key={cluster.Cluster}
                className={({ selected }) =>
                  selected ? "bg-slate-50 p-1 shadow rounded-md"
                    : "text-blue-100 p-1 hover:bg-white/[0.12] hover:text-white rounded-md"
                }>
                Cluster {cluster.Cluster}
              </Tab>
            ))
          )}
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <MapContainer
              center={[warehouseLat, warehouseLong]}
              zoom={11}
              style={{ height: "500px", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker position={[warehouseLat, warehouseLong]} icon={warehouseIcon}>
                <Popup>Warehouse Location</Popup>
              </Marker>
              {mapData.length > 0 && mapData.map((cluster) => renderMarkersAndPolylines(cluster))}
              <CenterMap lat={warehouseLat} lng={warehouseLong} />
            </MapContainer>
          </Tab.Panel>
          {mapData.map((cluster) => (
            <Tab.Panel key={cluster.Cluster}>
              <MapContainer
                center={[warehouseLat, warehouseLong]}
                zoom={12}
                style={{ height: "500px", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[warehouseLat, warehouseLong]} icon={warehouseIcon}>
                  <Popup>Warehouse Location</Popup>
                </Marker>
                {renderMarkersAndPolylines(cluster)}
                <CenterMap lat={warehouseLat} lng={warehouseLong} />
              </MapContainer>
              <button
                onClick={() => handleDelivery(cluster.Cluster)}
                className="mt-2 flex items-center px-4 py-2 bg-[#ff8c8c] hover:bg-[#e96868] text-white rounded">
                Deliver Orders
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="ml-2">
                  <g
                    fill="none"
                    stroke="#ffffff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    color="#ffffff">
                    <circle cx="17" cy="19" r="2" />
                    <circle cx="7" cy="19" r="2" />
                    <path d="M2 9v4.947c0 2.382 0 3.573.732 4.313c.487.492 1.171.657 2.268.712M12.427 5c.913.3 1.63 1.024 1.926 1.947c.147.456.147 1.02.147 2.15c0 .752 0 1.128.098 1.432a2.01 2.01 0 0 0 1.284 1.298c.301.099.673.099 1.418.099H22v2.021c0 2.382 0 3.573-.732 4.313c-.487.492-1.171.657-2.268.712M9 19h6" />
                    <path d="M14.5 7h1.821c1.456 0 2.183 0 2.775.354c.593.353.938.994 1.038 1.612" />
                  </g>
                </svg>
              </button>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Map;
