let resolve;

export const googleMap = {
  element: undefined,
  map: undefined,
  canvas: undefined,
  load: new Promise((res, rej) => { resolve = res }),
  update: update,
  extent: extent
};

/**
 * Returns extent of the map.
 * @return {!MapDimensions} Bounds of the map.
 */
function extent() {
  const bounds = googleMap.map.getBounds();

  return {
    width: googleMap.element.clientWidth,
    height: googleMap.element.clientHeight,
    latlng:[
      [bounds.j.j, bounds.R.R],
      [bounds.j.R, bounds.R.j]
    ]
  };
}

function init() {
  // initialize the map
  const mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(39.3, -95.8),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: 'water',
        stylers: [{ color: '#ffffff'}]
      },
      {
        featureType: 'poi',
        stylers: [{visibility: 'off'}]
      }
    ]
  };

  googleMap.element = document.getElementById('google-map-canvas');
  googleMap.map = new google.maps.Map(googleMap.element, mapOptions);

  // initialize the canvasLayer
  const canvasLayerOptions = {
    map: googleMap.map,
    animate: false,
    updateHandler: () => resolve(update())
  };
  const canvasLayer = new CanvasLayer(canvasLayerOptions);
  googleMap.canvas = canvasLayer.canvas;
}

/**
 * We need to scale and translate the map for current view.
 * see https://developers.google.com/maps/documentation/javascript/maptypes#MapCoordinates
 */
function update() {
  const mapProjection = googleMap.map.getProjection();
  const scale = Math.pow(2, googleMap.map.zoom);
  googleMap.canvas.getContext('2d').scale(scale, scale);
}

window.onload = init;
