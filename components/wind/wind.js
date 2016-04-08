import {googleMap} from '../map/map';
import {fetchData} from '../data/fetchData';

let windy;
let windResponse;
let redrawDebounce = debounce(redraw, 100);

export function initiateWind() {
  if (supportsCanvas()) {
    googleMap.load.then(mapLoaded);
  } else {
    $el.innerHTML = 'This rotary dial of a browser doesn not support canvas.';
  }
}

function mapLoaded() {
  ['bounds_changed', 'center_changed', 'drag', 'resize', 'zoom_changed'].forEach(listener => {
    googleMap.map.addListener(listener, redrawDebounce);
  })

  fetchData().then(response => {
    windResponse = response;
    windy = new Windy({canvas: googleMap.canvas, data: windResponse});
    redraw();
  });
}

function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// does the browser support canvas? 
function supportsCanvas() {
  return !!document.createElement('canvas').getContext;
}

function redraw(){
  googleMap.canvas.width = googleMap.element.clientWidth;
  googleMap.canvas.height = googleMap.element.clientHeight;

  windy.stop();

  const bounds = googleMap.map.getBounds();
  const modified = {
    xmin: bounds.j.j,
    ymin: bounds.R.R,
    xmax: bounds.j.R,
    ymax: bounds.R.j
  };

  windy.start(
    [[0,0],[googleMap.element.clientWidth, googleMap.element.clientHeight]],
    googleMap.element.clientWidth,
    googleMap.element.clientHeight,
    [[modified.xmin, modified.ymin],[modified.xmax, modified.ymax]]
  );
}
