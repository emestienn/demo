import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { List, Map as MapIcon, Bookmark, Star } from "lucide-react";
import { placesApi, citiesApi, neighborhoodsApi } from "../api/content.js";
import { usersApi } from "../api/social.js";
import { useAuthStore } from "../stores/authStore.js";
import { createMarkerIcon } from "../components/map/markerIcon.js";
import { resolveImage, getApiErrorMessage } from "../api/client.js";
import { PriceLevel } from "../components/ui/Bits.jsx";
import { toast } from "../stores/toastStore.js";
import { PLACE_CATEGORIES } from "../constants/categories.js";
import { Spinner } from "../components/ui/Loading.jsx";

function FlyTo({ position, zoom = 15 }) {
  const map = useMap();
  if (position) map.flyTo(position, zoom, { duration: 0.8 });
  return null;
}

export default function MapExplorer() {
  const { t } = useTranslation(["explore", "common"]);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [mobileTab, setMobileTab] = useState("map");
  const [cityId, setCityId] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState(null);

  const { data: cities } = useQuery({ queryKey: ["cities"], queryFn: () => citiesApi.list() });
  const { data: neighborhoods } = useQuery({
    queryKey: ["neighborhoods", cityId],
    queryFn: () => neighborhoodsApi.list({ city: cityId }),
    enabled: Boolean(cityId),
  });

  const { data: placesRes, isLoading } = useQuery({
    queryKey: ["map-places", cityId, category],
    queryFn: () => placesApi.list({ city: cityId || undefined, category: category || undefined, limit: 60 }),
  });

  const savedIds = useQuery({
    queryKey: ["saved-places", "ids"],
    queryFn: () => usersApi.listSavedPlaces().then((list) => list.map((p) => p._id)),
    enabled: Boolean(user),
  });

  const places = placesRes?.data || [];
  const activeCity = cities?.data?.find((c) => c._id === cityId);
  const center = useMemo(() => {
    if (selected) return [selected.location.coordinates[1], selected.location.coordinates[0]];
    if (activeCity) return [activeCity.center.lat, activeCity.center.lng];
    return [36.5, 127.8];
  }, [selected, activeCity]);

  async function handleSave(placeId) {
    if (!user) return navigate("/login");
    try {
      await usersApi.toggleSavePlace(placeId);
      queryClient.invalidateQueries({ queryKey: ["saved-places"] });
      toast(t("explore:mapExplorer.savedToast"), "success");
    } catch (err) {
      toast(getApiErrorMessage(err), "error");
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b border-ink-800 px-5 py-3 flex flex-wrap items-center gap-3">
        <select
          className="input-field !w-auto !py-2"
          value={cityId}
          onChange={(e) => {
            setCityId(e.target.value);
            setSelected(null);
          }}
        >
          <option value="">{t("explore:mapExplorer.allCities")}</option>
          {(cities?.data || []).map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select className="input-field !w-auto !py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">{t("explore:mapExplorer.allCategories")}</option>
          {PLACE_CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">{t(`explore:categories.${c}`)}</option>
          ))}
        </select>
        {neighborhoods?.data?.length > 0 && (
          <div className="hidden md:flex gap-1.5 overflow-x-auto">
            {neighborhoods.data.slice(0, 8).map((n) => (
              <button
                key={n._id}
                onClick={() => setSelected({ location: { coordinates: [n.center.lng, n.center.lat] }, _zoomOnly: true })}
                className="pill hover:border-neon-cyan/50 hover:text-neon-cyan whitespace-nowrap"
              >
                {n.name}
              </button>
            ))}
          </div>
        )}
        <div className="ml-auto flex md:hidden gap-2">
          <button
            onClick={() => setMobileTab("map")}
            className={`h-9 w-9 flex items-center justify-center rounded-full border ${mobileTab === "map" ? "border-neon-cyan text-neon-cyan" : "border-ink-600"}`}
          >
            <MapIcon size={15} />
          </button>
          <button
            onClick={() => setMobileTab("list")}
            className={`h-9 w-9 flex items-center justify-center rounded-full border ${mobileTab === "list" ? "border-neon-cyan text-neon-cyan" : "border-ink-600"}`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className={`w-full md:w-[380px] shrink-0 border-r border-ink-800 overflow-y-auto ${mobileTab === "list" ? "block" : "hidden md:block"}`}>
          {isLoading && (
            <div className="p-6 flex justify-center">
              <Spinner />
            </div>
          )}
          {places.map((place) => (
            <button
              key={place._id}
              onClick={() => setSelected(place)}
              className={`w-full text-left flex gap-3 p-3.5 border-b border-ink-800/60 hover:bg-ink-900 transition ${
                selected?._id === place._id ? "bg-ink-900" : ""
              }`}
            >
              {place.images?.[0] && (
                <img src={resolveImage(place.images[0])} alt={place.name} className="h-16 w-16 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-bone-100 truncate">{place.name}</p>
                <p className="text-xs text-bone-200/50 truncate">{place.neighborhood?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-xs text-bone-200/60">
                    <Star size={11} className="fill-neon-cyan text-neon-cyan" /> {place.rating?.toFixed(1) || "New"}
                  </span>
                  <PriceLevel level={place.priceLevel} />
                </div>
              </div>
              <div className="flex flex-col justify-between items-end">
                {user && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(place._id);
                    }}
                  >
                    <Bookmark size={15} className={savedIds.data?.includes(place._id) ? "fill-neon-cyan text-neon-cyan" : "text-bone-200/40"} />
                  </span>
                )}
                <Link to={`/places/${place.slug}`} className="text-[11px] text-neon-cyan" onClick={(e) => e.stopPropagation()}>
                  {t("explore:mapExplorer.details")}
                </Link>
              </div>
            </button>
          ))}
          {!isLoading && !places.length && <p className="p-6 text-sm text-bone-200/50 text-center">{t("explore:mapExplorer.noResults")}</p>}
        </div>

        <div className={`flex-1 ${mobileTab === "map" ? "block" : "hidden md:block"}`}>
          <MapContainer center={center} zoom={activeCity ? activeCity.zoom : 7} className="map-dark" style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selected && <FlyTo position={center} zoom={selected._zoomOnly ? 14 : 16} />}
            {places.map((place) => (
              <Marker
                key={place._id}
                position={[place.location.coordinates[1], place.location.coordinates[0]]}
                icon={createMarkerIcon(place.category, { active: selected?._id === place._id })}
                eventHandlers={{ click: () => setSelected(place) }}
              >
                <Popup>
                  <div className="min-w-[160px]">
                    <p className="font-semibold text-sm mb-1">{place.name}</p>
                    <p className="text-xs opacity-70 mb-2 capitalize">{t(`explore:categories.${place.category}`)}</p>
                    <Link to={`/places/${place.slug}`} className="text-xs text-neon-cyan font-medium">
                      {t("explore:mapExplorer.viewDetailsArrow")}
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
