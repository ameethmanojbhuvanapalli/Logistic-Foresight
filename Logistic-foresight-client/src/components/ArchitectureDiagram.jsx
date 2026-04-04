import services from "../config/servicesConfig";
import ServiceCard from "./ServiceCard";

function ArchitectureDiagram() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}

export default ArchitectureDiagram;
