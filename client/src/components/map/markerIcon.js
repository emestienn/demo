import L from "leaflet";

const COLORS = {
  cafe: "#5ef2ff",
  restaurant: "#ff5fa8",
  bar: "#b083ff",
  nightlife: "#b083ff",
  shopping: "#5b8cff",
  culture: "#f5f4f0",
  landmark: "#f5f4f0",
  nature: "#5ef2ff",
  kpop: "#ff5fa8",
  art: "#b083ff",
  market: "#5b8cff",
  wellness: "#5ef2ff",
};

export function createMarkerIcon(category, { active = false } = {}) {
  const color = COLORS[category] || "#5ef2ff";
  const size = active ? 22 : 16;
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block;width:${size}px;height:${size}px;border-radius:9999px;
      background:${color};
      box-shadow:0 0 0 3px rgba(10,10,12,0.9), 0 0 16px 2px ${color}99;
      border:2px solid #0a0a0c;
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
