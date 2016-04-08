import {WindMap} from './wind/wind';
import {googleMap} from './map/map';
import {fetchData} from './data/fetchData';
import {onDojoLoad} from './wind/esri-wind';

require('./build.scss');

window.dojoRequire([
  'esri/map', 'esri/layers/ArcGISTiledMapServiceLayer', 
  'esri/domUtils', 'esri/request',
  'dojo/parser', 'dojo/number', 'dojo/json', 'dojo/dom', 
  'dijit/registry', 'plugins/RasterLayer','esri/layers/WebTiledLayer',
  'esri/config',
  'dojo/domReady!'
], onDojoLoad);

// Wait for the data to load and the map to be in the DOM.
Promise.all([fetchData(), googleMap.load]).then(response => {
  const windMap = new WindMap({
    canvas: googleMap.canvas,
    data: response[0],
    element: googleMap.element,
    getExtent: () => {
      const bounds = googleMap.map.getBounds();
      return {
        xmin: bounds.j.j,
        ymin: bounds.R.R,
        xmax: bounds.j.R,
        ymax: bounds.R.j
      };
    }
  });

  ['dragend', 'resize', 'zoom_changed'].forEach(listener => {
    googleMap.map.addListener(listener, windMap.drawDebounce);
  })
});
