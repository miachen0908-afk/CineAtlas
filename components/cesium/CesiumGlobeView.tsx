"use client";

import { useEffect, useRef } from "react";
import type { ImageryLayer, Viewer } from "cesium";
import type { CesiumDayNightMode, CesiumTestCity } from "@/types/cesium-prototype";
import {
  createCityCollections,
  flyToCity,
  flyToEastAsia,
  pickCityId,
  setCityDebugLabels,
  worldToScreen,
  type CityCollections,
} from "./cityEntities";
import {
  setupDayNightLayers,
  useDayNightTransition,
} from "./useDayNightLayers";

export type ScreenAnchor = {
  cityId: string;
  x: number;
  y: number;
  visible: boolean;
};

type CesiumGlobeViewProps = {
  cities: CesiumTestCity[];
  mode: CesiumDayNightMode;
  showCities: boolean;
  showDebugCoords: boolean;
  selectedCityId: string | null;
  onSelectCity: (id: string | null) => void;
  onAnchorChange: (anchor: ScreenAnchor | null) => void;
  onReady?: (api: CesiumGlobeApi) => void;
};

export type CesiumGlobeApi = {
  flyToCityId: (id: string) => void;
  flyHome: () => void;
  saveCamera: () => void;
  restoreCamera: () => void;
};

const CAMERA_STORAGE_KEY = "cesium-prototype-camera";

type DayNightLayers = {
  day: ImageryLayer;
  night: ImageryLayer;
};

export function CesiumGlobeView({
  cities,
  mode,
  showCities,
  showDebugCoords,
  selectedCityId,
  onSelectCity,
  onAnchorChange,
  onReady,
}: CesiumGlobeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const cesiumRef = useRef<typeof import("cesium") | null>(null);
  const layersRef = useRef<DayNightLayers | null>(null);
  const collectionsRef = useRef<CityCollections | null>(null);
  const autoRotateRef = useRef(true);
  const selectedRef = useRef(selectedCityId);
  const citiesRef = useRef(cities);

  selectedRef.current = selectedCityId;
  citiesRef.current = cities;

  useDayNightTransition(layersRef, mode);

  useEffect(() => {
    const collections = collectionsRef.current;
    if (!collections) return;
    collections.points.show = showCities;
    collections.labels.show = showCities;
  }, [showCities]);

  useEffect(() => {
    const collections = collectionsRef.current;
    if (!collections) return;
    setCityDebugLabels(collections, cities, showDebugCoords);
  }, [showDebugCoords, cities]);

  useEffect(() => {
    let destroyed = false;
    let removeInput: (() => void) | null = null;
    let removeTick: (() => void) | null = null;

    async function init() {
      if (!containerRef.current || viewerRef.current) return;

      (window as unknown as { CESIUM_BASE_URL: string }).CESIUM_BASE_URL =
        "/cesium/";

      const Cesium = await import("cesium");
      if (destroyed || !containerRef.current) return;
      cesiumRef.current = Cesium;

      const viewer = new Cesium.Viewer(containerRef.current, {
        animation: false,
        timeline: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        creditContainer: document.createElement("div"),
        baseLayer: false,
      });

      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#050505");
      viewer.scene.globe.enableLighting = false;
      viewer.scene.fog.enabled = true;
      if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = true;
      viewer.scene.backgroundColor = Cesium.Color.BLACK;
      if (viewer.scene.sun) viewer.scene.sun.show = mode !== "night";
      if (viewer.scene.moon) viewer.scene.moon.show = false;
      if (viewer.scene.skyBox) viewer.scene.skyBox.show = true;

      try {
        const credit = viewer.cesiumWidget.creditContainer as HTMLElement;
        credit.style.display = "none";
      } catch {
        // ignore credit hide failures
      }

      viewerRef.current = viewer;

      layersRef.current = await setupDayNightLayers(Cesium, viewer, mode);
      if (destroyed) {
        viewer.destroy();
        return;
      }

      collectionsRef.current = createCityCollections(
        Cesium,
        viewer,
        citiesRef.current,
        showDebugCoords
      );
      collectionsRef.current.points.show = showCities;
      collectionsRef.current.labels.show = showCities;

      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(112, 32, 8_500_000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-55),
          roll: 0,
        },
      });

      const pauseRotate = () => {
        autoRotateRef.current = false;
      };
      const resumeRotate = () => {
        window.setTimeout(() => {
          autoRotateRef.current = true;
        }, 2500);
      };

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(() => pauseRotate(), Cesium.ScreenSpaceEventType.LEFT_DOWN);
      handler.setInputAction(() => resumeRotate(), Cesium.ScreenSpaceEventType.LEFT_UP);
      handler.setInputAction(() => pauseRotate(), Cesium.ScreenSpaceEventType.WHEEL);
      handler.setInputAction(() => pauseRotate(), Cesium.ScreenSpaceEventType.PINCH_START);
      handler.setInputAction(
        (movement: { position: import("cesium").Cartesian2 }) => {
          const id = pickCityId(Cesium, viewer.scene, movement.position);
          if (id) {
            onSelectCity(id);
            const city = citiesRef.current.find((c) => c.id === id);
            if (city) flyToCity(Cesium, viewer.camera, city);
          } else {
            onSelectCity(null);
          }
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );

      removeInput = () => handler.destroy();

      const onTick = () => {
        if (autoRotateRef.current) {
          viewer.scene.camera.rotate(
            Cesium.Cartesian3.UNIT_Z,
            Cesium.Math.toRadians(-0.012)
          );
        }

        const sel = selectedRef.current;
        const collections = collectionsRef.current;
        if (!sel || !collections) {
          onAnchorChange(null);
          return;
        }
        const pos = collections.positions.get(sel);
        if (!pos) {
          onAnchorChange(null);
          return;
        }
        const screen = worldToScreen(Cesium, viewer.scene, pos);
        if (!screen) {
          onAnchorChange(null);
          return;
        }
        onAnchorChange({
          cityId: sel,
          x: screen.x,
          y: screen.y,
          visible: screen.visible,
        });
      };

      viewer.clock.onTick.addEventListener(onTick);
      removeTick = () => viewer.clock.onTick.removeEventListener(onTick);

      const api: CesiumGlobeApi = {
        flyToCityId: (id) => {
          const city = citiesRef.current.find((c) => c.id === id);
          if (city && cesiumRef.current && viewerRef.current) {
            flyToCity(cesiumRef.current, viewerRef.current.camera, city);
          }
        },
        flyHome: () => {
          if (cesiumRef.current && viewerRef.current) {
            flyToEastAsia(cesiumRef.current, viewerRef.current.camera);
          }
        },
        saveCamera: () => {
          const cam = viewer.camera;
          const carto = Cesium.Cartographic.fromCartesian(cam.positionWC);
          const snapshot = {
            longitude: Cesium.Math.toDegrees(carto.longitude),
            latitude: Cesium.Math.toDegrees(carto.latitude),
            height: carto.height,
            heading: cam.heading,
            pitch: cam.pitch,
            roll: cam.roll,
          };
          sessionStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify(snapshot));
        },
        restoreCamera: () => {
          const raw = sessionStorage.getItem(CAMERA_STORAGE_KEY);
          if (!raw) return;
          try {
            const snap = JSON.parse(raw) as {
              longitude: number;
              latitude: number;
              height: number;
              heading: number;
              pitch: number;
              roll: number;
            };
            viewer.camera.setView({
              destination: Cesium.Cartesian3.fromDegrees(
                snap.longitude,
                snap.latitude,
                snap.height
              ),
              orientation: {
                heading: snap.heading,
                pitch: snap.pitch,
                roll: snap.roll,
              },
            });
          } catch {
            // ignore corrupt snapshot
          }
        },
      };
      onReady?.(api);
    }

    void init();

    return () => {
      destroyed = true;
      removeInput?.();
      removeTick?.();
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
      layersRef.current = null;
      collectionsRef.current = null;
      cesiumRef.current = null;
    };
    // Intentionally mount-once: cities/mode props applied via other effects / refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const Cesium = cesiumRef.current;
    const viewer = viewerRef.current;
    if (!Cesium || !viewer || viewer.isDestroyed()) return;
    if (viewer.scene.sun) viewer.scene.sun.show = mode === "day";
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full [&_.cesium-viewer-bottom]:!hidden [&_.cesium-viewer-toolbar]:!hidden"
    />
  );
}
