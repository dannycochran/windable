import {WindMap} from './wind/wind';
import {googleMap} from './map/map';
import {AltitudeModel} from './altitude/altitude_model';
import {palettes} from './utilities/palettes';
import {debounce} from './utilities/functions';

require('./build.scss');

// Export a singleton altitude model.
export const altitudeModel = new AltitudeModel();

// Our available data is hard coded to Friday April 1, 00:00:00.
const windDate = new Date('Fri Apr 9 2016 00:00:00 GMT-0700 (PDT)');

// Populate the select menu with millibar levels.
const menu = document.getElementById('millibar-levels');
altitudeModel.levels.forEach(level => {
  const select = document.createElement('option')
  select.innerHTML = level;
  menu.appendChild(select);
});

// Populate the colors menu.
const colorsMenu = document.getElementById('color-schemes');
const colors = Object.keys(palettes);
colors.forEach(palette => {
  const select = document.createElement('option');
  select.innerHTML = palette;
  colorsMenu.appendChild(select);
});

colorsMenu.selectedIndex = colors.indexOf('default');
menu.selectedIndex = altitudeModel.levels.indexOf(altitudeModel.millibars);

// Wait for the data to load and the map to be in the DOM.
Promise.all([altitudeModel.get({time: windDate}), googleMap.load]).then(response => {
  const windMap = new WindMap({
    canvas: googleMap.canvas,
    data: response[0],
    element: googleMap.element,
    getExtent: () => {
      const bounds = googleMap.map.getBounds();
      const extent = {
        xmin: bounds.j.j,
        ymin: bounds.R.R,
        xmax: bounds.j.R,
        ymax: bounds.R.j
      };
      return extent;
    }
  });

  const onSelectAltitude = function(e) {
    const selectedIndex = menu.selectedIndex;
    menu.disabled = true;
    altitudeModel.get({
      time: windDate,
      millibars: altitudeModel.levels[selectedIndex]
    }).then((data) => {
      windMap.update({data: data});
      menu.disabled = false;
    });
  };
  const onSelectColor = function(e) {
    const selectedIndex = colorsMenu.selectedIndex;
    windMap.update({colorScheme: palettes[colors[selectedIndex]]});
  };
  menu.addEventListener('change', onSelectAltitude);
  colorsMenu.addEventListener('change', onSelectColor);

  ['bounds_changed', 'resize'].forEach(listener => {
    googleMap.map.addListener(listener, windMap.start.bind(windMap));
  });
});
