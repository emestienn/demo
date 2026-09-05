import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { createMarkerIcon } from "./markerIcon.js";

export default function PlaceMiniMap({ place, className = "h-72 w-full rounded-2xl overflow-hidden" }) {
  const [lng, lat] = place.location.coordinates;

  return (
    <div className={className}>
      <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} className="map-dark" style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={createMarkerIcon(place.category, { active: true })}>
          <Popup>{place.name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
