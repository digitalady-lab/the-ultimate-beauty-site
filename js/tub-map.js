/* ═══════════════════════════════════════════════════════════════
   THE ULTIMATE BEAUTY — MAPBOX TÉRKÉP
   Elegáns sötét térkép arany stílussal
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── CONFIG ─────────────────────────────────────────────────
  // Token loaded from map-config.js
  var MAPBOX_TOKEN = window.TUB_MAPBOX_TOKEN || '';

  var CLINIC = {
    lng: 19.01115,
    lat: 47.49201,
    zoom: 15.5,
    name: 'The Ultimate Beauty Clinic',
    address: '1124 Budapest, Németvölgyi út 68.',
    phone: '+36 1 790 3017'
  };

  // ─── INIT MAP ───────────────────────────────────────────────
  function initMap() {
    var container = document.getElementById('tub-map');
    if (!container || MAPBOX_TOKEN === 'MAPBOX_TOKEN_IDE') {
      console.warn('[TUB Map] Mapbox token nincs beállítva vagy nincs map container');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    var map = new mapboxgl.Map({
      container: 'tub-map',
      style: {
        version: 8,
        name: 'TUB Dark Gold',
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=' + MAPBOX_TOKEN
            ],
            tileSize: 512
          }
        },
        layers: [{
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm-tiles',
          paint: {
            'raster-saturation': -0.6,
            'raster-brightness-max': 0.7,
            'raster-contrast': 0.15
          }
        }]
      },
      center: [CLINIC.lng, CLINIC.lat],
      zoom: CLINIC.zoom,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      scrollZoom: false,
      dragPan: true
    });

    // Attribution (required by Mapbox)
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    // Navigation controls
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    // ─── CUSTOM MARKER ────────────────────────────────────────
    var markerEl = document.createElement('div');
    markerEl.className = 'tub-map-marker';
    markerEl.innerHTML =
      '<div class="tub-map-marker__pin">' +
        '<span class="tub-map-marker__icon">✦</span>' +
      '</div>' +
      '<div class="tub-map-marker__pulse"></div>';

    new mapboxgl.Marker({ element: markerEl, anchor: 'bottom' })
      .setLngLat([CLINIC.lng, CLINIC.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25, className: 'tub-map-popup' })
          .setHTML(
            '<div class="tub-map-popup__content">' +
              '<div class="tub-map-popup__name">' + CLINIC.name + '</div>' +
              '<div class="tub-map-popup__address">' + CLINIC.address + '</div>' +
              '<div class="tub-map-popup__phone">' + CLINIC.phone + '</div>' +
              '<a class="tub-map-popup__directions" href="https://www.google.com/maps/dir/?api=1&destination=' + CLINIC.lat + ',' + CLINIC.lng + '" target="_blank" rel="noopener">Útvonaltervezés →</a>' +
            '</div>'
          )
      )
      .addTo(map)
      .togglePopup(); // Open by default
  }

  // ─── LOAD WHEN READY ────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }
})();
