<template>
  <div class="relative h-full w-full">
    <div class="h-full w-full" ref="mapContainer" />

    <!-- Pin mode overlay -->
    <Transition name="pin-hint-fade">
      <div
        v-if="pinMode"
        class="pointer-events-none absolute top-28 sm:top-20 left-1/2 -translate-x-1/2 z-[1002] flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 border border-blue-500/40 backdrop-blur-md text-blue-300 text-xs font-semibold shadow-xl whitespace-nowrap"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        Tap anywhere on the map to pin your location
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'

export interface MapLocation {
  lat?: number | string
  lng?: number | string
  x?: number | string
  y?: number | string
  plate_number?: string
  driver_name?: string
  driver_contact?: string
  status?: string
  barangays?: string[]
  city_name?: string
  description?: string
  title?: string
}

const props = defineProps<{
  userLocation?: MapLocation | null
  truckLocation?: MapLocation | null
  truckLocations?: MapLocation[] | null
  pinMode?: boolean
  hideUserControl?: boolean
}>()

const emit = defineEmits<{
  (e: 'pin-placed', coords: { lat: number; lng: number }): void
}>()

function getCoords(loc?: MapLocation | null) {
  if (!loc) return null
  const rawLat = loc.lat ?? loc.x
  const rawLng = loc.lng ?? loc.y
  if (rawLat === undefined || rawLng === undefined) return null
  const lat = typeof rawLat === 'number' ? rawLat : parseFloat(rawLat)
  const lng = typeof rawLng === 'number' ? rawLng : parseFloat(rawLng)
  if (isNaN(lat) || isNaN(lng)) return null
  return { lat, lng }
}

const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: any = null
let userMarker: any = null
let truckMarkers: any[] = []
let pinMarker: any = null
let L: any = null

function renderTruckMarkers() {
  if (!mapInstance || !L) return

  // Clear existing truck markers
  truckMarkers.forEach((m) => m.remove())
  truckMarkers = []

  const locs: MapLocation[] = []
  if (props.truckLocations && Array.isArray(props.truckLocations) && props.truckLocations.length > 0) {
    locs.push(...props.truckLocations)
  } else if (props.truckLocation) {
    locs.push(props.truckLocation)
  }

  locs.forEach((loc) => {
    const coords = getCoords(loc)
    if (!coords) return

    const truckIcon = L.divIcon({
      className: 'custom-truck-pin',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 bg-emerald-500/20 border-2 border-emerald-500 rounded-full shadow-lg backdrop-blur-md cursor-pointer hover:scale-110 transition-transform">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-400 z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z"/>
            <circle cx="6.5" cy="18.5" r="2.5"/>
            <circle cx="16.5" cy="18.5" r="2.5"/>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    })

    const marker = L.marker([coords.lat, coords.lng], { icon: truckIcon }).addTo(mapInstance)

    const plateNumber = loc.plate_number || 'Garbage Truck'
    const driverName = loc.driver_name || 'Assigned Driver'
    const driverContact = loc.driver_contact || 'N/A'
    const status = loc.status || 'ACTIVE'
    const barangaysList = loc.barangays && loc.barangays.length > 0 ? loc.barangays.join(', ') : (loc.city_name || 'Area Coverage')
    const description = loc.description || ''

    const statusBg = status === 'ONGOING' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                     status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                     'bg-amber-500/20 text-amber-400 border-amber-500/30'

    const popupContent = `
      <div class="custom-leaflet-popup p-3.5 bg-slate-900/95 border border-slate-700/80 rounded-xl text-slate-100 shadow-2xl backdrop-blur-md min-w-[230px] max-w-[290px]">
        <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
          <div class="flex items-center gap-1.5 font-bold text-emerald-400 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 18H9"/><path stroke-linecap="round" stroke-linejoin="round" d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z"/><circle cx="6.5" cy="18.5" r="2.5"/><circle cx="16.5" cy="18.5" r="2.5"/></svg>
            <span>${plateNumber}</span>
          </div>
          <span class="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-full border ${statusBg}">
            ${status}
          </span>
        </div>
        <div class="space-y-1.5 text-xs text-slate-300">
          <div class="flex items-center justify-between gap-2">
            <span class="text-slate-400 font-medium">Driver:</span>
            <span class="font-semibold text-slate-200">${driverName}</span>
          </div>
          ${driverContact !== 'N/A' ? `
          <div class="flex items-center justify-between gap-2">
            <span class="text-slate-400 font-medium">Contact:</span>
            <a href="tel:${driverContact}" class="text-blue-400 hover:underline font-mono">${driverContact}</a>
          </div>
          ` : ''}
          <div class="flex items-start justify-between gap-2 pt-0.5">
            <span class="text-slate-400 font-medium shrink-0">Coverage:</span>
            <span class="text-slate-200 text-right leading-tight">${barangaysList}</span>
          </div>
          ${description ? `
          <div class="pt-1.5 text-[11px] text-slate-400 italic border-t border-slate-800 mt-1">
            "${description}"
          </div>
          ` : ''}
        </div>
      </div>
    `

    marker.bindPopup(popupContent, {
      className: 'custom-popup-wrapper',
      closeButton: false,
      offset: [0, -10]
    })

    truckMarkers.push(marker)
  })
}

const focusTruck = () => {
  if (!mapInstance) return

  const userCoords = getCoords(props.userLocation)

  if (truckMarkers.length > 0) {
    let nearestLatLng = truckMarkers[0].getLatLng()

    if (userCoords) {
      let minDistance = Infinity

      truckMarkers.forEach((marker) => {
        const markerLatLng = marker.getLatLng()
        const dist = L
          ? L.latLng(userCoords.lat, userCoords.lng).distanceTo(markerLatLng)
          : Math.hypot(markerLatLng.lat - userCoords.lat, markerLatLng.lng - userCoords.lng)

        if (dist < minDistance) {
          minDistance = dist
          nearestLatLng = markerLatLng
        }
      })
    }

    mapInstance.panTo([nearestLatLng.lat, nearestLatLng.lng], { animate: true, duration: 1.2 })
  } else if (props.truckLocations && props.truckLocations.length > 0) {
    let nearestCoords = getCoords(props.truckLocations[0])

    if (userCoords && nearestCoords) {
      let minDistance = Infinity

      props.truckLocations.forEach((loc) => {
        const coords = getCoords(loc)
        if (coords) {
          const dist = L
            ? L.latLng(userCoords.lat, userCoords.lng).distanceTo(L.latLng(coords.lat, coords.lng))
            : Math.hypot(coords.lat - userCoords.lat, coords.lng - userCoords.lng)

          if (dist < minDistance) {
            minDistance = dist
            nearestCoords = coords
          }
        }
      })
    }

    if (nearestCoords) {
      mapInstance.panTo([nearestCoords.lat, nearestCoords.lng], { animate: true, duration: 1.2 })
    }
  } else {
    const coords = getCoords(props.truckLocation)
    if (coords) {
      mapInstance.panTo([coords.lat, coords.lng], { animate: true, duration: 1.2 })
    }
  }
}

const focusUser = () => {
  if (mapInstance) {
    const coords = getCoords(props.userLocation)
    if (coords) {
      mapInstance.panTo([coords.lat, coords.lng], { animate: true, duration: 1.2 })
    }
  }
}

const panTo = (lat: number, lng: number, zoom = 15) => {
  if (mapInstance) {
    mapInstance.flyTo([lat, lng], zoom, { duration: 1.5 })
  }
}

defineExpose({ panTo, placePin: placePinAt, focusTruck, focusUser })

function buildUserIcon() {
  return L.divIcon({
    className: 'custom-user-pin',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-5 w-5 bg-blue-500 border-2 border-white-900 shadow-md"></span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
}

function bindUserPopup(marker: any) {
  const userPopup = `
    <div class="custom-leaflet-popup px-3 py-2 bg-slate-900/95 border border-slate-700/80 rounded-xl text-slate-100 shadow-xl backdrop-blur-md">
      <div class="flex items-center gap-1.5 font-semibold text-blue-400 text-xs">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        <span>Your Location</span>
      </div>
    </div>
  `
  marker.bindPopup(userPopup, { className: 'custom-popup-wrapper', closeButton: false, offset: [0, -8] })
}

function buildPinIcon() {
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center">
        <div style="width:32px;height:32px;border-radius:50%;background:rgba(59,130,246,0.2);border:2px solid #60a5fa;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(59,130,246,0.4)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#93c5fd">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div style="width:2px;height:12px;background:#60a5fa;border-radius:1px;margin-top:1px"></div>
      </div>
    `,
    iconSize: [32, 46],
    iconAnchor: [16, 46]
  })
}

function bindPinPopup(marker: any, lat: number, lng: number) {
  const pinPopup = `
    <div class="custom-leaflet-popup px-3 py-2 bg-slate-900/95 border border-slate-700/80 rounded-xl text-slate-100 shadow-xl backdrop-blur-md">
      <div class="flex items-center gap-1.5 font-semibold text-blue-400 text-xs">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})</span>
      </div>
    </div>
  `
  marker.bindPopup(pinPopup, { className: 'custom-popup-wrapper', closeButton: false, offset: [0, -36] })
}

function placePinAt(lat: number, lng: number) {
  if (!L || !mapInstance) return
  if (pinMarker) {
    pinMarker.setLatLng([lat, lng])
    bindPinPopup(pinMarker, lat, lng)
  } else {
    pinMarker = L.marker([lat, lng], {
      icon: buildPinIcon(),
      draggable: true,
      zIndexOffset: 1000
    }).addTo(mapInstance)
    bindPinPopup(pinMarker, lat, lng)

    pinMarker.on('dragend', () => {
      const pos = pinMarker.getLatLng()
      bindPinPopup(pinMarker, pos.lat, pos.lng)
      emit('pin-placed', { lat: pos.lat, lng: pos.lng })
    })
  }
  emit('pin-placed', { lat, lng })
}

function removePinMarker() {
  if (pinMarker && mapInstance) {
    mapInstance.removeLayer(pinMarker)
    pinMarker = null
  }
}

let mapClickHandler: ((e: any) => void) | null = null

watch(() => props.pinMode, (active) => {
  if (!mapInstance) return
  if (active) {
    mapClickHandler = (e: any) => {
      placePinAt(e.latlng.lat, e.latlng.lng)
    }
    mapInstance.on('click', mapClickHandler)
    mapInstance.getContainer().style.cursor = 'crosshair'
  } else {
    if (mapClickHandler) {
      mapInstance.off('click', mapClickHandler)
      mapClickHandler = null
    }
    mapInstance.getContainer().style.cursor = ''
    removePinMarker()
  }
})

onMounted(async () => {
  const leafletModule = await import('leaflet')
  L = leafletModule.default || leafletModule
  import('leaflet/dist/leaflet.css')

  // Only center on user location if we actually have one; otherwise use a neutral overview of Metro Manila
  const userCoords = getCoords(props.userLocation)
  const initialLat = userCoords?.lat ?? 14.5995
  const initialLng = userCoords?.lng ?? 120.9842
  const initialZoom = userCoords ? 14 : 11

  mapInstance = L.map(mapContainer.value!, {
    center: [initialLat, initialLng],
    zoom: initialZoom,
    zoomControl: false,
    attributionControl: true
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(mapInstance)

  const MapControls = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function () {
      const div = L.DomUtil.create('div', 'custom-leaflet-controls flex flex-col gap-2 items-center')
      div.style.border = 'none'
      div.style.background = 'transparent'

      div.innerHTML = `
        <button id="leaflet-zoom-in-btn" title="Zoom In" type="button" class="flex items-center justify-center w-9 h-9 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-full shadow-lg cursor-pointer transition-all active:scale-90 border border-slate-700/60 hover:border-slate-500/40 backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button id="leaflet-zoom-out-btn" title="Zoom Out" type="button" class="flex items-center justify-center w-9 h-9 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-full shadow-lg cursor-pointer transition-all active:scale-90 border border-slate-700/60 hover:border-slate-500/40 backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button id="leaflet-track-truck-btn" title="Track Truck" type="button" class="flex items-center justify-center w-9 h-9 bg-slate-900/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded-full shadow-lg cursor-pointer transition-all active:scale-90 border border-slate-700/60 hover:border-emerald-500/40 backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z"/>
            <circle cx="6.5" cy="18.5" r="2.5"/>
            <circle cx="16.5" cy="18.5" r="2.5"/>
          </svg>
        </button>
        ${props.hideUserControl ? '' : `
        <button id="leaflet-track-user-btn" title="My Location" type="button" class="flex items-center justify-center w-9 h-9 bg-slate-900/90 hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded-full shadow-lg cursor-pointer transition-all active:scale-90 border border-slate-700/60 hover:border-blue-500/40 backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        </button>
        `}
      `

      L.DomEvent.disableClickPropagation(div)
      L.DomEvent.disableScrollPropagation(div)
      return div
    }
  })

  mapInstance.addControl(new MapControls())

  setTimeout(() => {
    document.getElementById('leaflet-track-truck-btn')?.addEventListener('click', focusTruck)
    if (!props.hideUserControl) {
      document.getElementById('leaflet-track-user-btn')?.addEventListener('click', focusUser)
    }
    document.getElementById('leaflet-zoom-in-btn')?.addEventListener('click', () => mapInstance?.zoomIn())
    document.getElementById('leaflet-zoom-out-btn')?.addEventListener('click', () => mapInstance?.zoomOut())
  }, 0)

  // Only place the user marker if we actually have a location — don't show a phantom pin
  if (userCoords) {
    userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: buildUserIcon() })
      .addTo(mapInstance)
    bindUserPopup(userMarker)
  }

  renderTruckMarkers()

  setTimeout(() => {
    mapInstance?.invalidateSize()
  }, 100)
})

watch(
  () => props.userLocation,
  (newLocation) => {
    const coords = getCoords(newLocation)
    if (mapInstance) {
      if (coords) {
        mapInstance.flyTo([coords.lat, coords.lng], 14, { duration: 1.5 })
        if (userMarker) {
          userMarker.setLatLng([coords.lat, coords.lng])
        } else {
          userMarker = L.marker([coords.lat, coords.lng], { icon: buildUserIcon() }).addTo(mapInstance)
          bindUserPopup(userMarker)
        }
      } else {
        if (userMarker) {
          userMarker.remove()
          userMarker = null
        }
      }
    }
  },
  { deep: true }
)

watch(
  [() => props.truckLocation, () => props.truckLocations],
  () => {
    renderTruckMarkers()
  },
  { deep: true }
)
</script>

<style>
.custom-user-pin,
.custom-truck-pin,
.custom-pin-marker {
  background: transparent !important;
  border: none !important;
}

.custom-popup-wrapper .leaflet-popup-content-wrapper {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0.75rem !important;
}

.custom-popup-wrapper .leaflet-popup-content {
  margin: 0 !important;
  line-height: inherit !important;
}

.custom-popup-wrapper .leaflet-popup-tip-container {
  display: none !important;
}

.leaflet-control-attribution {
  font-size: 8px !important;
  font-weight: 600 !important;
  opacity: 0.5;
}

.leaflet-bar {
  border: none !important;
  box-shadow: none !important;
}

.leaflet-top.leaflet-right {
  top: 85px !important;
  right: 16px !important;
  z-index: 1000 !important;
  pointer-events: auto !important;
}

.leaflet-control-zoom {
  border: none !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  margin-top: 0px !important;
  margin-right: 0px !important;
}

.leaflet-control-zoom-in,
.leaflet-control-zoom-out {
  background-color: rgba(15, 23, 42, 0.9) !important;
  color: rgb(226, 232, 240) !important;
  border: 1px solid rgba(51, 65, 85, 0.6) !important;
  backdrop-filter: blur(12px) !important;
  border-radius: 9999px !important;
  width: 36px !important;
  height: 36px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  line-height: 36px !important;
  margin: 0 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
}

.leaflet-control-zoom-in:hover,
.leaflet-control-zoom-out:hover {
  background-color: rgb(30, 41, 59) !important;
  color: rgb(255, 255, 255) !important;
  border-color: rgba(100, 116, 139, 0.8) !important;
}

.leaflet-control-zoom-in:active,
.leaflet-control-zoom-out:active {
  transform: scale(0.9) !important;
}

.pin-hint-fade-enter-active,
.pin-hint-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.pin-hint-fade-enter-from,
.pin-hint-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}
</style>