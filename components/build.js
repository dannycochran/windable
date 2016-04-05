import {onDojoLoad} from './wind/wind';

window.dojoRequire([
  'esri/map', 'esri/layers/ArcGISTiledMapServiceLayer', 
  'esri/domUtils', 'esri/request',
  'dojo/parser', 'dojo/number', 'dojo/json', 'dojo/dom', 
  'dijit/registry', 'plugins/RasterLayer','esri/layers/WebTiledLayer',
  'esri/config',
  'dojo/domReady!'
], onDojoLoad);