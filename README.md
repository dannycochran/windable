# Windable Overview

Windable is a (in progress) configurable library for setting up wind visualizations on your maps.
It can work with any Canvas map layer (Google Maps, Leaflet).
Windable borrows heavily from the work of Esri's Wind-js and earth.nullschool.

The source code is annotated (but not compiled) with ClosureJS style comments.

# Examples

Basic Google Maps usage:

https://damp-reaches-87397.herokuapp.com/google_basic

Configurable Google Maps usage:

https://damp-reaches-87397.herokuapp.com/google_configurable

# Running

```
npm install
grunt app
```
Will set up a server at localhost:5000.

# Wind Data

For dynamic loading, you'd write some gross hook that:
 1. Curls data from:

http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?file=gfs.t00z.pgrb2.1p00.f000&lev_${MILLIBARS}_mb=on&var_UGRD=on&var_VGRD=on&dir=%2Fgfs.${TIMESTAMP}

Where TIMESTAMP = YYYYMMDDHH (e.g 2016040106) -- the HH field must be one of: (00, 06, 12, 18) and MILLIBARS is an integer.
Continuous integers for millibars aren't supported, see: ftp://ftp.cpc.ncep.noaa.gov/wd51we/ams2010_sc/Obtaining%20data.pdf

 2. Converts grib2json using grib2json via a shell command.

 3. Send back the output json.