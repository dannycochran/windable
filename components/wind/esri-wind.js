import {fetchData} from '../data/fetchData';

let map;
let windy;
let $el;
let rasterLayer;

export function onDojoLoad(
  Map, ArcGISTiledMapServiceLayer, 
  domUtils, esriRequest,
  parser, number, JSON, dom, 
  registry, RasterLayer
  ) {

  $el = document.getElementById('mapCanvas');

  map = new Map($el.id, {
    center: [-120, 42],
    zoom: 3,
    basemap: 'dark-gray',
  });

  if (supportsCanvas()) {
    rasterLayer = new RasterLayer(null, {
      opacity: 0.55
    });
    map.on('load', mapLoaded);
  } else {
    $el.innerHTML = 'This rotary dial of a browser doesn not support canvas.';
  }
}

function mapLoaded() {
  map.addLayer(rasterLayer);

  map.on('extent-change', redraw);
  map.on('resize', redraw);
  map.on('zoom-start', redraw);
  map.on('pan-start', redraw);

  fetchData().then(response => {
    windy = new Windy({canvas: rasterLayer._element, data: response});
    redraw();
  });
}

// does the browser support canvas? 
function supportsCanvas() {
  return !!document.createElement('canvas').getContext;
}

function redraw() {

  rasterLayer._element.width = map.width;
  rasterLayer._element.height = map.height;

  windy.stop();
  const extent = map.geographicExtent;

  console.log('esri redraw');

  setTimeout(function(){
    windy.start(
      [[0,0],[map.width, map.height]],
      map.width,
      map.height,
      [[extent.xmin, extent.ymin],[extent.xmax, extent.ymax]]
    );
  },100);
}
