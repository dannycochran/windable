import {googleMap} from '../map/map';

let map;
let rasterLayer;
let canvasSupport;
let windy;

export function onDojoLoad(
  Map, ArcGISTiledMapServiceLayer, 
  domUtils, esriRequest,
  parser, number, JSON, dom, 
  registry, RasterLayer, WebTiledLayer, esriConfig
  ) {
  parser.parse();
  // does the browser support canvas? 
  canvasSupport = supports_canvas();

  // map = googleMap.map;
  // map = new Map("mapCanvas", {
  //   center: [-99.076, 39.132],
  //   zoom: 3,
  //   basemap: "dark-gray"
  // });

  googleMap.on('load', mapLoaded);

  function mapLoaded() {

    // Add raster layer
    if (canvasSupport) {
      // rasterLayer = new RasterLayer(null, {
      //   opacity: 0.55
      // });
      rasterLayer = googleMap.canvasLayer;
      map = googleMap.map;
      // map.addLayer(rasterLayer);

      // map.on("extent-change", redraw);
      // map.on("resize", function(){});
      // map.on("zoom-start", redraw);
      // map.on("pan-start", redraw);

      var layersRequest = esriRequest({
        url: 'dist/data/gfs.json',
        content: {},
        handleAs: "json"
      });
      layersRequest.then(
        function(response) {
          windy = new Windy({ canvas: rasterLayer._element, data: response });
          redraw();
      }, function(error) {
          console.log("Error: ", error.message);
      });

    } else {
      dom.byId("mapCanvas").innerHTML = "This browser doesn't support canvas. Visit <a target='_blank' href='http://www.caniuse.com/#search=canvas'>caniuse.com</a> for supported browsers";
    }
  }

  // does the browser support canvas? 
  function supports_canvas() {
    return !!document.createElement("canvas").getContext;
  }

  function redraw(){

    // rasterLayer._element.width = 1000;
    // rasterLayer._element.height = 1000;

    windy.stop();
// (south-west latitude, longitude),(north-east latitude, longitude)
    var extent = map.getBounds();
    setTimeout(function(){
      windy.start(
        [[0,0],[1000, 1000]],
        1000,
        1000,
        [[extent.R.R, extent.R.j],[extent.j.R, extent.j.j]]
      );
    },500);
  }
};