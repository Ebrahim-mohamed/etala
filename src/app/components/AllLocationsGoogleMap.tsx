"use client";

import {
  GoogleMap,
  useJsApiLoader,
  Libraries,
  OverlayView,
} from "@react-google-maps/api";
import { useCallback, useState, useEffect } from "react";

const LIBRARIES: Libraries = ["places", "geometry", "marker"];
const GOOGLE_MAPS_API_KEY = "AIzaSyDUofPccWK7lY1FR6Em5q1vjmqNypG_W9o";

const locations = [
  {
    id: 1,
    lat: 29.9759002,
    lng: 31.1308735,
    name: "Giza Pyramids",
    category: "landmarks",
  },
  {
    id: 2,
    lat: 30.0154,
    lng: 31.1893,
    name: "Grand Egyptian Museum",
    category: "landmarks",
  },
  {
    id: 3,
    lat: 30.056021,
    lng: 30.976639,
    name: "Sheikh Zayed City",
    category: "landmarks",
  },
  {
    id: 4,
    lat: 29.9719,
    lng: 30.9465,
    name: "Egyptian Media Production City",
    category: "landmarks",
  },
  {
    id: 5,
    lat: 30.1147,
    lng: 30.8933,
    name: "Sphinx International Airport",
    category: "landmarks",
  },
  {
    id: 30,
    lat: 29.955866,
    lng: 31.0431214,
    name: "6th October Military Hospital",
    category: "hospitals",
  },
  {
    id: 31,
    lat: 29.9458854,
    lng: 31.0748197,
    name: "Magdi Yacoub Global Heart Centre",
    category: "hospitals",
  },
  {
    id: 32,
    lat: 29.9485858,
    lng: 31.0968937,
    name: "Al Waha Hospital",
    category: "hospitals",
  },
  {
    id: 10,
    lat: 30.0275,
    lng: 30.9869,
    name: "Nile University.",
    category: "education",
  },
  {
    id: 13,
    lat: 29.9533,
    lng: 30.9525,
    name: "Misr University for Science and Technology",
    category: "education",
  },
  {
    id: 14,
    lat: 29.977,
    lng: 30.948,
    name: "6th of October University",
    category: "education",
  },
  {
    id: 15,
    lat: 30.0619,
    lng: 30.9496,
    name: "Zewail City of Science and Technology",
    category: "education",
  },
  {
    id: 40,
    lat: 30.0167,
    lng: 31.0667,
    name: "Newgiza University",
    category: "education",
  },
  {
    id: 16,
    lat: 29.9719,
    lng: 31.0177,
    name: "Mall of Egypt",
    category: "shopping",
  },
  {
    id: 18,
    lat: 30.0068,
    lng: 30.9746,
    name: "Mall of Arabia",
    category: "shopping",
  },
  {
    id: 19,
    lat: 29.9718,
    lng: 31.0195,
    name: "Ski Egypt",
    category: "shopping",
  },
  {
    id: 21,
    lat: 30.0121,
    lng: 31.1515,
    name: "Dream Park",
    category: "entertainment",
  },
  {
    id: 22,
    lat: 29.9628,
    lng: 31.0248,
    name: "Magic Land",
    category: "entertainment",
  },
  {
    id: 23,
    lat: 29.972,
    lng: 31.018,
    name: "VOX Cinemas",
    category: "entertainment",
  },
];

const containerStyle = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
};

const center = { lat: 29.9059596, lng: 31.0558759 };

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
  const [activeId, setActiveId] = useState<number | null>(null);
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

  // Reset active pin when category changes
  useEffect(() => {
    setActiveId(null);
  }, [selected]);

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
          onClick={() => setActiveId(null)}
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
          {/* Main project marker */}
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

          {/* Main project label */}
          <OverlayView
            position={center}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div style={getLabelStyle()}>
              <div
                className="text-orange-400 text-[6rem] max-[700px]:text-[8rem] font-bold"
                style={{ direction: isRTL ? "rtl" : "ltr" }}
              >
                Etala
              </div>
            </div>
          </OverlayView>

          {/* Category location markers */}
          {locations
            .filter((m) => selected === m.category)
            .map((m) => {
              const isActive = activeId === m.id;
              return (
                <OverlayView
                  key={m.id}
                  position={{ lat: m.lat, lng: m.lng }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div
                    style={{ position: "relative", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveId(isActive ? null : m.id);
                    }}
                  >
                    <img
                      src={`/assets/location-icons/${m.category}-move.svg`}
                      alt={m.name}
                      style={{
                        ...getMarkerStyle(),
                        transition: "transform 0.2s ease",
                        filter: isActive
                          ? "drop-shadow(0 0 6px rgba(0,0,0,0.5))"
                          : "none",
                        transform: isActive
                          ? isRTL
                            ? "translate(50%, -60%) scaleX(-1) scale(1.2)"
                            : "translate(-50%, -60%) scale(1.2)"
                          : getMarkerStyle().transform,
                      }}
                    />

                    {/* Tooltip bubble */}
                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          bottom: "calc(100% + 10px)",
                          transform: "translateX(-50%)",
                          backgroundColor: "white",
                          color: "#003349",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          whiteSpace: "nowrap",
                          fontSize: "13px",
                          fontWeight: 600,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                          zIndex: 9999,
                          pointerEvents: "none",
                          direction: isRTL ? "rtl" : "ltr",
                        }}
                      >
                        {m.name}
                        {/* Arrow pointing down */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "-6px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 0,
                            height: 0,
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderTop: "6px solid white",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </OverlayView>
              );
            })}
        </GoogleMap>
      </div>
    </div>
  );
}