"use client";

import {
  GoogleMap,
  useJsApiLoader,
  Libraries,
  OverlayView,
} from "@react-google-maps/api";
import { useCallback, useState, useEffect } from "react";

const LIBRARIES: Libraries = ["places", "geometry", "marker"];
const GOOGLE_MAPS_API_KEY = "AIzaSyCe-gBIMId-D1eLjQfHJKjwc1TYtRG0CZQ";

const locations = [
  {
    id: 1,
    lat: 21.7341668,
    lng: 39.0828927,
    name: "Jeddah Tower",
    category: "landmarks",
  },
  {
    id: 2,
    lat: 21.7332871,
    lng: 39.084097,
    name: "Jeddah Economic City",
    category: "landmarks",
  },
  {
    id: 3,
    lat: 21.6023186,
    lng: 39.1077514,
    name: "Jeddah Corniche",
    category: "landmarks",
  },
  {
    id: 4,
    lat: 21.6158207,
    lng: 39.1062671,
    name: "Jeddah Waterfront Harbor",
    category: "landmarks",
  },
  {
    id: 5,
    lat: 21.763196,
    lng: 39.164318,
    name: "King Abdullah Sports City",
    category: "landmarks",
  },
  {
    id: 6,
    lat: 21.6829992,
    lng: 39.1667146,
    name: "King Abdulaziz International Airport",
    category: "landmarks",
  },
  {
    id: 8,
    lat: 21.7681918,
    lng: 39.1001376,
    name: "King Abdullah Medical Complex",
    category: "hospitals",
  },
  {
    id: 9,
    lat: 21.7414016,
    lng: 39.1736738,
    name: "New King Faisal Specialist Hospital",
    category: "hospitals",
  },
  {
    id: 10,
    lat: 21.4940484,
    lng: 39.2389317,
    name: "King Abdulaziz University",
    category: "education",
  },
  {
    id: 13,
    lat: 21.4783551,
    lng: 39.2930658,
    name: "Al-Andalus Private Schools",
    category: "education",
  },
  {
    id: 14,
    lat: 21.8571184,
    lng: 39.0623161,
    name: "University of Business and Technology - UBT",
    category: "education",
  },
  {
    id: 15,
    lat: 21.7693429,
    lng: 39.1318678,
    name: "Batterjee Medical College",
    category: "education",
  },
  {
    id: 16,
    lat: 21.7739847,
    lng: 39.1702953,
    name: "The Village Mall",
    category: "shopping",
  },
  {
    id: 18,
    lat: 21.6289161,
    lng: 39.1120399,
    name: "Red Sea Mall",
    category: "shopping",
  },
  {
    id: 19,
    lat: 21.632517,
    lng: 39.156161,
    name: "Mall of Arabia",
    category: "shopping",
  },
  {
    id: 21,
    lat: 21.5688248,
    lng: 39.1114231,
    name: "Al Shallal Theme Park",
    category: "entertainment",
  },
  {
    id: 22,
    lat: 21.5721858,
    lng: 39.1096142,
    name: "Fakieh Aquarium",
    category: "entertainment",
  },
];

const containerStyle = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
};

const center = { lat: 29.9059596, lng: 31.0584455 };

export function AllLocationsGoogleMapComponent({
  selected,
}: {
  selected: string;
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isRTL, setIsRTL] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const dir = document.documentElement.getAttribute("dir") || "ltr";
    setIsRTL(dir === "rtl");
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getMarkerStyle = (isMainMarker = false) => ({
    width: isMainMarker ? "100px" : "50px",
    height: isMainMarker ? "100px" : "50px",
    transform: isMainMarker
      ? isRTL
        ? "translate(50%, -100%) scaleX(-1)"
        : "translate(-50%, -100%)"
      : isRTL
      ? "translate(50%, -50%) scaleX(-1)"
      : "translate(-50%, -50%)",
    position: "absolute" as const,
  });

  const getLabelStyle = () => ({
    whiteSpace: "nowrap" as const,
    transform: "translate(-50%, 0)",
    textAlign: "center" as const,
    position: "absolute" as const,
    left: "50%",
  });

  const getMapScale = () => {
    return windowSize.width > 2500 ? "scale(4)" : "scale(1)";
  };

  const getMapZoom = () => {
    return windowSize.width > 2500 ? 12 : 11;
  };

  if (!isLoaded) {
    return <p>Loading map...</p>;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: "2.5rem",
      }}
    >
      <div
        style={{
          transform: getMapScale(),
          transformOrigin: "bottom bottom",
          width: "100%",
          height: "100%",
        }}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={getMapZoom()}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            minZoom: 1,
            maxZoom: 23,
            disableDoubleClickZoom: false,
            scrollwheel: true,
            gestureHandling: "greedy",
            fullscreenControl: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            rotateControl: false,
            scaleControl: false,
          }}
        >
          <OverlayView
            position={center}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div style={{ position: "relative" }}>
              <img
                src="/assets/map-marker.png"
                alt="Main marker"
                style={getMarkerStyle(true)}
              />
            </div>
          </OverlayView>

          <OverlayView
            position={center}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div style={getLabelStyle()}>
              <div
                className="text-orange-400 text-[3rem] max-[700px]:text-[8rem] font-bold"
                style={{ direction: isRTL ? "rtl" : "ltr" }}
              >
               Etala
              </div>
            </div>
          </OverlayView>

          {locations
            .filter((m) => selected === m.category)
            .map((m) => (
              <OverlayView
                key={m.id}
                position={{ lat: m.lat, lng: m.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <img
                  src={`/assets/location-icons/${m.category}-move.svg`}
                  alt={m.name}
                  style={getMarkerStyle()}
                />
              </OverlayView>
            ))}
        </GoogleMap>
      </div>
    </div>
  );
}
