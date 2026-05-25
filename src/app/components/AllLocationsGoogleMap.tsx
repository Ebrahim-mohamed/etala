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
  // {
  //   id: 8,
  //   lat: 21.7681918,
  //   lng: 39.1001376,
  //   name: "King Abdullah Medical Complex",
  //   category: "hospitals",
  // },
  // {
  //   id: 9,
  //   lat: 21.7414016,
  //   lng: 39.1736738,
  //   name: "New King Faisal Specialist Hospital",
  //   category: "hospitals",
  // },
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
    lat: 29.9770,
    lng: 30.9480,
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
    id: 15,
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
    lat: 29.9720,
    lng: 31.0180,
    name: "VOX Cinemas",
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
