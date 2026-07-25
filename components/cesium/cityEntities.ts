"use client";

import type {
  Camera,
  Cartesian2,
  LabelCollection,
  PointPrimitiveCollection,
  BillboardCollection,
  Scene,
  Viewer,
} from "cesium";
import type { CesiumTestCity } from "@/types/cesium-prototype";

const POINT_HEIGHT = 8000;
const LABEL_HEIGHT = 14000;

export type CityCollections = {
  points: PointPrimitiveCollection;
  labels: LabelCollection;
  filmLocationBillboards: BillboardCollection;
  landmarkBillboards: BillboardCollection;
  positions: Map<string, import("cesium").Cartesian3>;
};

export function createCityCollections(
  Cesium: typeof import("cesium"),
  viewer: Viewer,
  cities: CesiumTestCity[],
  showDebugCoords: boolean
): CityCollections {
  const points = viewer.scene.primitives.add(
    new Cesium.PointPrimitiveCollection()
  );
  const labels = viewer.scene.primitives.add(
    new Cesium.LabelCollection({ scene: viewer.scene })
  );
  const filmLocationBillboards = viewer.scene.primitives.add(
    new Cesium.BillboardCollection({ scene: viewer.scene })
  );
  const landmarkBillboards = viewer.scene.primitives.add(
    new Cesium.BillboardCollection({ scene: viewer.scene })
  );

  const positions = new Map<string, import("cesium").Cartesian3>();
  const pin = Cesium.Color.fromCssColorString("#10BF9B");

  for (const city of cities) {
    const position = Cesium.Cartesian3.fromDegrees(
      city.longitude,
      city.latitude,
      POINT_HEIGHT
    );
    positions.set(city.id, position);

    points.add({
      id: city.id,
      position,
      color: pin,
      pixelSize: 12,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: new Cesium.NearFarScalar(5e5, 1.3, 1.2e7, 0.5),
      translucencyByDistance: new Cesium.NearFarScalar(5e5, 1, 1.5e7, 0.4),
    });

    const debug =
      showDebugCoords && process.env.NODE_ENV === "development"
        ? `\n${city.longitude.toFixed(4)}, ${city.latitude.toFixed(4)}`
        : "";

    labels.add({
      id: `label-${city.id}`,
      position: Cesium.Cartesian3.fromDegrees(
        city.longitude,
        city.latitude,
        LABEL_HEIGHT
      ),
      text: `${city.nameZh}${debug}`,
      font: "14px sans-serif",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -14),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: new Cesium.NearFarScalar(5e5, 1, 1.2e7, 0.5),
      translucencyByDistance: new Cesium.NearFarScalar(5e5, 1, 1.5e7, 0.25),
      show: true,
    });
  }

  return {
    points,
    labels,
    filmLocationBillboards,
    landmarkBillboards,
    positions,
  };
}

export function setCityDebugLabels(
  collections: CityCollections,
  cities: CesiumTestCity[],
  showDebugCoords: boolean
): void {
  for (let i = 0; i < collections.labels.length; i += 1) {
    const label = collections.labels.get(i);
    const id = String(label.id).replace(/^label-/, "");
    const city = cities.find((c) => c.id === id);
    if (!city) continue;
    const debug =
      showDebugCoords && process.env.NODE_ENV === "development"
        ? `\n${city.longitude.toFixed(4)}, ${city.latitude.toFixed(4)}`
        : "";
    label.text = `${city.nameZh}${debug}`;
  }
}

export function flyToCity(
  Cesium: typeof import("cesium"),
  camera: Camera,
  city: CesiumTestCity
): void {
  camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      city.longitude,
      city.latitude,
      1_200_000
    ),
    duration: 1.6,
  });
}

export function flyToEastAsia(
  Cesium: typeof import("cesium"),
  camera: Camera
): void {
  camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(112, 32, 8_500_000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-55),
      roll: 0,
    },
    duration: 1.8,
  });
}

export function pickCityId(
  Cesium: typeof import("cesium"),
  scene: Scene,
  windowPosition: Cartesian2
): string | null {
  const picked = scene.pick(windowPosition);
  if (!Cesium.defined(picked) || picked.id === undefined || picked.id === null) {
    return null;
  }
  const id = String(picked.id);
  if (id.startsWith("label-")) return id.slice("label-".length);
  return id;
}

export function worldToScreen(
  Cesium: typeof import("cesium"),
  scene: Scene,
  position: import("cesium").Cartesian3
): { x: number; y: number; visible: boolean } | null {
  const canvas = scene.canvas;
  const result = Cesium.SceneTransforms.worldToWindowCoordinates(
    scene,
    position
  );
  if (!result) return null;

  // Hide when on the far side of the globe relative to the camera
  const camera = scene.camera;
  const surfaceNormal = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(
    position,
    new Cesium.Cartesian3()
  );
  const camDir = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.subtract(
      camera.positionWC,
      position,
      new Cesium.Cartesian3()
    ),
    new Cesium.Cartesian3()
  );
  const visible = Cesium.Cartesian3.dot(surfaceNormal, camDir) > 0.05;

  return {
    x: result.x,
    y: result.y,
    visible:
      visible &&
      result.x >= 0 &&
      result.y >= 0 &&
      result.x <= canvas.clientWidth &&
      result.y <= canvas.clientHeight,
  };
}
