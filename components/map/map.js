let resolve;
let reject;
let promise;
const loader = new Promise(function(res, rej) {
  resolve = res;
  reject = rej;
});

export const googleMap = {
  element: undefined,
  map: undefined,
  canvasLayer: undefined,
  context: undefined,
  canvas: undefined,
  rectLatLng: new google.maps.LatLng(40, -95),
  rectWidth: 6.5,
  load: loader,
  update: update2
};

function init() {
  // initialize the map
  const mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(39.3, -95.8),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: 'water',
        stylers: [{ color: '#c3cfdd'}]
      },
      {
        featureType: 'poi',
        stylers: [{visibility: 'off'}]
      }
    ]
  };

  googleMap.element = document.getElementById('googleMapCanvas');
  googleMap.map = new google.maps.Map(googleMap.element, mapOptions);

  // initialize the canvasLayer
  const canvasLayerOptions = {
    map: googleMap.map,
    resizeHandler: resize,
    animate: false,
    updateHandler: () => {
      resolve();
      update();
    }
  };
  googleMap.canvasLayer = new CanvasLayer(canvasLayerOptions);
  googleMap.context = googleMap.canvasLayer.canvas.getContext('2d');
  googleMap.canvas = googleMap.canvasLayer.canvas;
}

function resize() {
  // nothing to do here
}

function update2() {
  // clear previous canvas contents
  const canvasWidth = googleMap.element.clientWidth;
  const canvasHeight = googleMap.element.clientHeight;
  googleMap.context.clearRect(0, 0, canvasWidth, canvasHeight);

  // we like our rectangles green
  googleMap.context.fillStyle = 'rgba(0, 255, 0, 1)';
  
  /* We need to scale and translate the map for current view.
   * see https://developers.google.com/maps/documentation/javascript/maptypes#MapCoordinates
   */
  const mapProjection = googleMap.map.getProjection();

  /**
   * Clear transformation from last update by setting to identity matrix.
   * Could use context.resetTransform(), but most browsers don't support
   * it yet.
   */
  googleMap.context.setTransform(1, 0, 0, 1, 0, 0);
  
  // scale is just 2^zoom
  var scale = Math.pow(2, googleMap.map.zoom);
  googleMap.context.scale(scale, scale);

  /* If the map was not translated, the topLeft corner would be 0,0 in
   * world coordinates. Our translation is just the vector from the
   * world coordinate of the topLeft corder to 0,0.
   */
  var offset = mapProjection.fromLatLngToPoint(googleMap.canvasLayer.getTopLeft());
  googleMap.context.translate(-offset.x, -offset.y);

  // project rectLatLng to world coordinates and draw
  var worldPoint = mapProjection.fromLatLngToPoint(googleMap.rectLatLng);
  googleMap.context.fillRect(worldPoint.x, worldPoint.y, googleMap.rectWidth, googleMap.rectWidth);
}

function update() {
  // clear previous canvas contents
  const canvasWidth = googleMap.element.clientWidth;
  const canvasHeight = googleMap.element.clientHeight;
  googleMap.context.clearRect(0, 0, canvasWidth, canvasHeight);

  // we like our rectangles green
  googleMap.context.fillStyle = 'rgba(0, 255, 0, 1)';
  
  /* We need to scale and translate the map for current view.
   * see https://developers.google.com/maps/documentation/javascript/maptypes#MapCoordinates
   */
  const mapProjection = googleMap.map.getProjection();

  /**
   * Clear transformation from last update by setting to identity matrix.
   * Could use context.resetTransform(), but most browsers don't support
   * it yet.
   */
  googleMap.context.setTransform(1, 0, 0, 1, 0, 0);
  
  // scale is just 2^zoom
  var scale = Math.pow(2, googleMap.map.zoom);
  googleMap.context.scale(scale, scale);

  /* If the map was not translated, the topLeft corner would be 0,0 in
   * world coordinates. Our translation is just the vector from the
   * world coordinate of the topLeft corder to 0,0.
   */
  var offset = mapProjection.fromLatLngToPoint(googleMap.canvasLayer.getTopLeft());
  googleMap.context.translate(-offset.x, -offset.y);

  // project rectLatLng to world coordinates and draw
  var worldPoint = mapProjection.fromLatLngToPoint(googleMap.rectLatLng);
  googleMap.context.fillRect(worldPoint.x, worldPoint.y, googleMap.rectWidth, googleMap.rectWidth);
}

window.onload = init;
