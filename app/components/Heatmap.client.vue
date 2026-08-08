<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import type L from "leaflet";
import type { FeatureCollection } from "geojson";

const globalStore = useGlobalStore();
const { reports } = storeToRefs(globalStore);
const mapEl = ref<HTMLElement | null>(null);

let map: L.Map;
let Leaflet: typeof import("leaflet");
let geoLayer: L.GeoJSON;

const reportData = new Map<string, number>();
const geojson = await $fetch<FeatureCollection>("/ncr-barangays.geojson");

function rebuildReportMap() {
  reportData.clear();

  reports.value.forEach((city) => {
    city.barangays.forEach((barangay) => {
      reportData.set(
        `${city.city.toLowerCase()}|${barangay.name.toLowerCase()}`,
        barangay.report_count
      );
    });
  });
}

function getReports(feature: any) {
  const key = `${feature.properties.city.toLowerCase()}|${feature.properties.name.toLowerCase()}`;
  return reportData.get(key) ?? 0;
}

function getColor(reports: number) {
  if (reports === 0) return "#F3F4F6";
  if (reports <= 10) return "#FFF9C4";
  if (reports <= 25) return "#FFEB3B";
  if (reports <= 40) return "#FFC107";
  if (reports <= 55) return "#FF9800";
  if (reports <= 70) return "#F44336";
  if (reports <= 100) return "#ab0f03";
  return "#520701";
}

function styleFeature(feature: any) {
  return {
    fillColor: getColor(getReports(feature)),
    fillOpacity: 0.75,
    color: "#ffffff",
    weight: 0.5,
    opacity: 1,
  };
}

function redrawMap() {
  if (!geoLayer) return;

  rebuildReportMap();

  geoLayer.clearLayers();
  const selectedCity = reports.value[0]?.city
  const features = reports.value.length === 1
      ? geojson.features.filter((feature: any) => feature.properties.city === selectedCity )
      : geojson.features;

  geoLayer.addData({ type: "FeatureCollection", features } as FeatureCollection);
  geoLayer.setStyle(styleFeature);
  map.fitBounds(geoLayer.getBounds(), { padding: [20, 20] });
}

onMounted(async () => {
  await import("leaflet/dist/leaflet.css");
  const leafletModule = await import("leaflet");
  Leaflet = leafletModule.default;

  map = Leaflet.map(mapEl.value!, { zoomControl: false });

  Leaflet.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    { attribution: "&copy; OpenStreetMap &copy; CARTO" }
  ).addTo(map);

  Leaflet.control.zoom({
    position: "topright",
  }).addTo(map);

  geoLayer = Leaflet.geoJSON(undefined, {
    style: styleFeature,
    onEachFeature(feature: any, layer) {
      layer.bindTooltip(() => {
        const trashCount = getReports(feature);

        return `
          <div>
            <strong>${feature.properties.name}</strong><br>
            ${feature.properties.city}<br>
            Reported Trash: ${trashCount}
          </div>
        `;
      });

      layer.on({
        mouseover(e) {
          e.target.setStyle({ weight: 2, color: "#000", fillOpacity: 0.9 });
          e.target.bringToFront();
        },

        mouseout() { geoLayer.resetStyle(layer); },
      });
    },
  }).addTo(map);

  redrawMap();

  const currentZoom = map.getZoom();
  map.setMinZoom(currentZoom - 2);
});

watch(reports, () =>redrawMap(), { deep: true });

onBeforeUnmount(() => map?.remove());
</script>

<template>
  <div ref="mapEl" style="height: 100%; width: 100%; min-height: 400px; border-radius: 8px" />
</template>