"use client";

import {
  GoogleMap,
  OverlayView,
  useJsApiLoader,
  Libraries,
} from "@react-google-maps/api";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Constants outside component
const LIBRARIES: Libraries = ["places", "geometry", "marker"];
const GOOGLE_MAPS_API_KEY = "AIzaSyCe-gBIMId-D1eLjQfHJKjwc1TYtRG0CZQ";
const CENTER = { lat: 29.9059596, lng: 31.0584455 };

// Helper functions outside component
const getScaledSize = (baseSize: number) =>
  Math.max(baseSize, window.innerWidth * 0.03);

export function LocationPageGoogleMapComponent() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("locationPage");

  const [isVisible, setIsVisible] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isRTL, setIsRTL] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    mapInstance.setZoom(window.innerWidth > 3840 ? 14 : 12);
  }, []);

  const onUnmount = useCallback(() => setMap(null), []);

  useEffect(() => {
    if (!map) return;

    const zoomListener = map.addListener("zoom_changed", () => {
      setIsVisible(false);
    });

    return () => {
      zoomListener.remove();
    };
  }, [map]);

  useEffect(() => {
    // Reliable RTL detection
    const dir = document.documentElement.getAttribute("dir") || "ltr";
    setIsRTL(dir === "rtl");
  }, []);

  if (!isLoaded) return <div className="text-4xl p-8">loading</div>;

  return (
    <div
      className="w-full h-[90%] mt-[5rem] rounded-[4vh] overflow-hidden"
      style={{ touchAction: "manipulation" }}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={CENTER}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          //  mapTypeId: "satellite", 
          minZoom: 3,
          maxZoom: 23,
          scrollwheel: true,
          gestureHandling: "greedy",
          fullscreenControl: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          rotateControl: false,
          scaleControl: false,
          controlSize: getScaledSize(40),
        }}
      >
        {/* Main Marker */}
        <OverlayView
          position={CENTER}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div
            onClick={() => setIsVisible(!isVisible)}
            style={{
              position: "absolute",
              transform: isRTL
                ? "translate(50%, -100%) "
                : "translate(-50%, -100%)",
              cursor: "pointer",
              zIndex: 999,
            }}
          >
            <img
              src="/assets/map-marker.png"
              alt="Main marker"
              style={{
                width: "100px",
                height: "100px",
              }}
            />
          </div>
        </OverlayView>

        {isVisible && (
          <OverlayView
            position={CENTER}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              className="bg-white rounded-[2.5rem] mt-[9rem] w-fit h-fit border-[1px] border-black shadow-xl flex items-center p-[3rem]"
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: "10px",
                marginTop: "9rem",
                gap: "4rem",
                flexDirection: isRTL ? "row-reverse" : "row",
              }}
            >
              <img
                src="/assets/locatioVedioPlaceholder.png"
                className="h-[50rem] max-[1200px]:h-[70rem] object-cover rounded-[2rem] max-[850px]:hidden"
                alt="Location preview"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-[6rem] mb-[6rem] justify-center">
                  <img
                    src="/assets/etalaLogo_light.png"
                    className="w-[25rem] max-[1200px]:w-[30rem]"
                    alt="Tilal Hawdi"
                  />
                  <div className="w-[0.3rem] h-[12rem] max-[1200px]:h-[20rem] bg-black" />
                  <img
                    src="/assets/elmanara-light.png"
                    className="w-[25rem] max-[1200px]:w-[30rem]"
                    alt="Jeddah Heights"
                  />
                </div>
                <p className="text-[4rem] text-center font-bold mb-[4rem] text-black dark:text-black">
                  {t("residential-compound")}
                </p>
                <button
                  className="max-[1200px]:text-[6rem] text-[8rem] py-[2rem] px-[4rem] text-white rounded-[2.5rem] max-[1200px]:rounded-[4rem] bg-black hover:bg-gray-800 transition-all duration-300 font-bold w-full cursor-pointer max-[1200px]:min-w-[90rem] max-[3200px]:min-w-[67rem]"
                  style={{
                    touchAction: "manipulation",
                  }}
                  onClick={() => router.push(`/${params.locale}/details/info`)}
                >
                  {t("view-project")}
                </button>
              </div>
            </div>
          </OverlayView>
        )}
      </GoogleMap>
    </div>
  );
}
