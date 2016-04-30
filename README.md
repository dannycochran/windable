# Windable (v0.0.1)

Windable is a small (4kb gzipped) configurable library for setting up wind visualizations on your maps.
It can work with any Canvas map layer (Google Maps, Leaflet).
Windable uses the same rendering logic from earth.nullschool and Esri's windy.js, providing an abstraction to more easily configure your maps.

The source code is annotated (but not compiled) with ClosureJS style comments.

# Examples

Basic Google Maps usage:

https://damp-reaches-87397.herokuapp.com/google_basic

Basic Leaflet usage:

https://damp-reaches-87397.herokuapp.com/leaflet

Configurable Google Maps usage:

https://damp-reaches-87397.herokuapp.com/google_configurable

# Running

```
npm install
grunt app
```
Will set up a server at localhost:5000.

# Basic Configuration

WindMap requires you provide a canvas upon which to draw, an extent function that returns the map bounds, and a data object (see [components/wind/typedefs.js](https://github.com/dannycochran/windable/blob/master/components/wind/typedefs.js) for more info).

Configuration with Google Maps would look something like this (see [examples/googleMaps/basic.html](https://github.com/dannycochran/windable/blob/master/examples/googleMaps/basic.html)):

```javascript
const element = document.getElementById('google-map-canvas');

const map = new google.maps.Map(element, {
  zoom: 3,
  center: new google.maps.LatLng(39.3, -45.8)
});

const windMap = new WindMap({
  canvas: new CanvasLayer({map: map}).canvas,
  data: windData // see below for retrieving windData, and examples of data in data/
  extent: () => {
    return {
      width: element.clientWidth,
      height: element.clientHeight,
      latlng:[
        [map.getBounds().j.j, map.getBounds().H.H],
        [map.getBounds().j.H, map.getBounds().H.j]
      ]
    };
  }
});
```

windMap has three functions: stop, start, and update. Upon initialization, the windMap is started. Subsequent calls to update will clear the rendering canvas and restart the animation with any
new configurations.

To update your windMap with new configurations or data, you can do:

```javascript
windMap.update({
  data: newWindData,
  colorScheme: arrayOfHexColorStrings,
  particuleReduction: 0.1;
});
```

See ConfigPayload in [components/wind/typedefs.js](https://github.com/dannycochran/windable/blob/master/components/wind/typedefs.js) for a list of configurations.

# Wind Data

For dynamic loading, you'd need to do three steps:
 1. Curl data from:

    - http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?file=gfs.t00z.pgrb2.1p00.f000&lev_${MILLIBARS}_mb=on&var_UGRD=on&var_VGRD=on&dir=%2Fgfs.${TIMESTAMP}

    - Where TIMESTAMP = YYYYMMDDHH (e.g 2016040106) -- the HH field must be one of: (00, 06, 12, 18) and MILLIBARS is an integer.
    - Continuous integers for millibars aren't supported, see: ftp://ftp.cpc.ncep.noaa.gov/wd51we/ams2010_sc/Obtaining%20data.pdf
    - e.g. curl "http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?file=gfs.t00z.pgrb2.1p00.f000&lev_200_mb=on&var_UGRD=on&var_VGRD=on&dir=%2Fgfs.2016041500" -o gfs.t00z.pgrb2.1p00.f000

 2. Convert grib2json using grib2json.

 3. Send back the output json.
