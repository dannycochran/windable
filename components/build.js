import {AltitudeModel} from './altitude/altitude';
import {debounce} from './utilities/functions';
import {googleMap} from './map/map';
import {palettes} from './utilities/palettes';
import {WindMap} from './wind/wind';

require('./build.scss');

// Create an altitude model.
const altitudeModel = new AltitudeModel();

// Our available data is hard coded to Friday April 1, 00:00:00.
const windDate = new Date('Fri Apr 9 2016 00:00:00 GMT-0700 (PDT)');

// Populate the select menu with millibar levels.
const menu = document.getElementById('millibar-levels');
const colorsMenu = document.getElementById('color-schemes');
const particleInput = document.getElementById('particles-range');
const speedInput = document.getElementById('speed-range');

altitudeModel.levels.forEach(level => {
  const select = document.createElement('option')
  select.innerHTML = level;
  menu.appendChild(select);
});

// // Populate the colors menu.
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
    element: googleMap.element,
    data: response[0],
    extent: googleMap.extent
  });

  ['bounds_changed', 'resize'].forEach(listener => {
    googleMap.map.addListener(listener, windMap.update.bind(windMap));
  });

  // UI STUFF
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

  const onChangeParticleCount = function(e) {
    const value = Math.max(Number(e.currentTarget.value) / 100, 0.01);
    windMap.update({particleReduction: value});
  };

  const onChangeParticleSpeed = function(e) {
    const value = parseFloat(e.currentTarget.value) * 0.0000001;
    windMap.update({velocityScale: value});
  };

  speedInput.addEventListener('change', onChangeParticleSpeed);
  particleInput.addEventListener('change', onChangeParticleCount);
  menu.addEventListener('change', onSelectAltitude);
  colorsMenu.addEventListener('change', onSelectColor);
});
