/**
 * A modified version of Esri's Windy.JS, which itself draws heavily from
 * Earth.nullschool's original implementation. Almost all of the logic from
 * those original libraries is untouched; the updates are purely aesthetic.
 *
 * https://github.com/Esri/wind-js (MIT License)
 * https://github.com/cambecc/earth (MIT License)
 */

import {getAnimationFrame, isValue} from '../utilities/functions';
import {math} from '../utilities/math';

export const Windy = function(windyConfig) {
  // Wind velocity at which particle intensity is maximum (m/s).
  const MAX_WIND_INTENSITY = 30;

  // Max number of frames a particle is drawn before regeneration.
  const MAX_PARTICLE_AGE = 100;

  // Particle count scalar (completely arbitrary--this values looks nice).
  const PARTICLE_MULTIPLIER = 8;

  // Singleton for no wind in the form: [u, v, magnitude].
  const NULL_WIND_VECTOR = [NaN, NaN, null];

  // Default color scheme is Purple -> Blue.
  let colorScheme = ['#fff7fb','#ece7f2','#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0','#045a8d','#023858'];

  // The lower this is, the faster the particles disappear from the screen.
  let particleFadeOpacity = 0.97;

  // Scale for wind velocity (Arbitrary; smaller values reduce velocity).
  let velocityScale = 1/200000; 

  // Line width of a drawn particle.
  let particleWidth = 2;

  // Reduce particle count to this fraction (improves FPS).
  let particleReduction = 0.75;

  // Hold onto the previous configuration in the event of exceeding map bounds.
  let previousBounds;

  const createWindBuilder = function(uComp, vComp) {
    return {
      data: (i) => [uComp.data[i], vComp.data[i]],
      header: uComp.header,
      interpolate: math.bilinearInterpolateVector
    };
  };

  /**
   * Creates a wind builder.
   * @param {!WindData} An instance of WindData.
   * @return {!Object} A wind builder object.
   */
  const createBuilder = function(windData) {
    let uComp = null;
    let vComp = null;

    windData.forEach(function(record) {
      switch (record.header.parameterCategory + "," + record.header.parameterNumber) {
        case "2,2": uComp = record; break;
        case "2,3": vComp = record; break;
      }
    });

    return createWindBuilder(uComp, vComp);
  };

  const buildGrid = function(windData) {
    const builder = createBuilder(windData);

    // The grid's origin (e.g., 0.0E, 90.0N)
    const λ0 = builder.header.lo1;
    const φ0 = builder.header.la1;

    // Distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat).
    const Δλ = builder.header.dx;
    const Δφ = builder.header.dy;

    // Number of grid points W-E and N-S (e.g., 144 x 73).
    const ni = builder.header.nx;
    const nj = builder.header.ny;

    // Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases
    // from φ0:
    // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
    const grid = [];
    const isContinuous = Math.floor(ni * Δλ) >= 360;
    let p = 0;

    for (let j = 0; j < nj; j++) {
      const row = [];
      for (let i = 0; i < ni; i++, p++) {
        row[i] = builder.data(p);
      }

      // For wrapped grids, duplicate first column as last column to simplify
      // interpolation logic.
      if (isContinuous) {
        row.push(row[0]);
      }

      grid[j] = row;
    }

    return function (λ, φ) {
      // Calculate longitude index in wrapped range [0, 360).
      const i = math.floorMod(λ - λ0, 360) / Δλ;

      // Calculate latitude index in direction +90 to -90.
      const j = (φ0 - φ) / Δφ;
      const fi = Math.floor(i), ci = fi + 1;
      const fj = Math.floor(j), cj = fj + 1;

      let row;
      if ((row = grid[fj])) {
        const g00 = row[fi];
        const g10 = row[ci];
        if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
          const g01 = row[fi];
          const g11 = row[ci];
          if (isValue(g01) && isValue(g11)) {
            // All four points found, so interpolate the value.
            return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
          }
        }
      }
      return null;
    }
  };

  /**
   * Calculate distortion of the wind vector caused by the shape of the
   * projection at point (x, y). The wind vector is modified in place and
   * returned by this function.
   */
  const distort = function(λ, φ, x, y, scale, wind, windy) {
    const u = wind[0] * scale;
    const v = wind[1] * scale;
    const d = math.distortion(λ, φ, x, y, windy);

    // Scale distortion vectors by u and v, then add.
    wind[0] = d[0] * u + d[2] * v;
    wind[1] = d[1] * u + d[3] * v;

    return wind;
  };

  const createField = function(columns, bounds) {
    /**
     * @returns {Array} wind vector [u, v, magnitude] at the point (x, y).
     */
    function field(x, y) {
      const column = columns[Math.round(x)];
      return column && column[Math.round(y)] || NULL_WIND_VECTOR;
    }

    // Frees the massive "columns" array for GC. Without this, the array is
    // leaked (in Chrome) each time a new field is interpolated because the
    // field closure's context is leaked, for reasons that defy explanation.
    field.release = () => { columns = []; };

    // UNDONE: this method is terrible
    field.randomize = function(o) {
      let x;
      let y;
      let safetyNet = 0;
      do {
        x = Math.round(Math.floor(Math.random() * bounds.width) + bounds.x);
        y = Math.round(Math.floor(Math.random() * bounds.height) + bounds.y);
      } while (field(x, y)[2] === null && safetyNet++ < 30);
      o.x = x;
      o.y = y;
      return o;
    };

    return field;
  };

  const buildBounds = function(bounds, width, height) {
    const upperLeft = bounds[0];
    const lowerRight = bounds[1];
    const x = Math.round(upperLeft[0]);
    const y = Math.max(Math.floor(upperLeft[1], 0), 0);
    const xMax = Math.min(Math.ceil(lowerRight[0], width), width - 1);
    const yMax = Math.min(Math.ceil(lowerRight[1], height), height - 1);
    return {x: x, y: y, xMax: width, yMax: yMax, width: width, height: height};
  };

  const interpolateField = function(grid, bounds, extent) {
    const velocity = bounds.height * velocityScale;

    let x = bounds.x;
    let columns = [];

    function interpolateColumn(x) {
      const column = [];
      for (let y = bounds.y; y <= bounds.yMax; y += 2) {
        const coord = math.invert(x, y, extent);

        if (coord) {
          const λ = coord[0];
          const φ = coord[1];

          if (isFinite(λ)) {
            let wind = grid(λ, φ);

            if (wind) {
              wind = distort(λ, φ, x, y, velocity, wind, extent);
              column[y+1] = column[y] = wind;
            }
          }
        }
      }
      columns[x+1] = columns[x] = column;
    }

    while (x < bounds.width) {
      interpolateColumn(x);
      x += 2;
    }

    return createField(columns, bounds);
  };

  /**
   * Moves the wind particles.
   */
  const evolve = function(buckets, particles, field) {
    buckets.forEach(bucket => { bucket.length = 0; });
    particles.forEach(function(particle) {
      if (particle.age > MAX_PARTICLE_AGE) {
        field.randomize(particle).age = 0;
      }

      // Vector at current position.
      const vector = field(particle.x, particle.y);

      if (vector[2] === null) {
        // Particle has escaped the grid, never to return.
        particle.age = MAX_PARTICLE_AGE;
      } else {
        const xt = particle.x + vector[0];
        const yt = particle.y + vector[1];

        if (field(xt, yt)[2] !== null) {
          // Path from (x,y) to (xt,yt) is visible, so add this particle to
          // the appropriate draw bucket.
          particle.xt = xt;
          particle.yt = yt;
          buckets[colorScheme.indexFor(vector[2])].push(particle);
        } else {
          // Particle isn't visible, but it still moves through the field.
          particle.x = xt;
          particle.y = yt;
        }
      }
      particle.age += 1;
    });
  };

  /**
   * Draws the particles' position to the canvas.
   */
  const draw = function(buckets, bounds, context) {
    // Fade existing particle trails.
    const prev = context.globalCompositeOperation;
    context.globalCompositeOperation = "destination-in";
    context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    context.globalCompositeOperation = prev;

    // Draw new particle trails.
    buckets.forEach((bucket, i) => {
      if (bucket.length > 0) {
        context.beginPath();
        context.strokeStyle = colorScheme[i];

        bucket.forEach((particle) => {
          context.moveTo(particle.x, particle.y);
          context.lineTo(particle.xt, particle.yt);
          particle.x = particle.xt;
          particle.y = particle.yt;
        });

        context.stroke();
      }
    });
  }

  /**
   * Animates the wind visualization.
   */
  const animate = function(bounds, field) {
    colorScheme.indexFor = function(m) {  // map wind speed to a style
      const len = colorScheme.length - 1;
      return Math.floor(
        Math.min(m, MAX_WIND_INTENSITY) / MAX_WIND_INTENSITY * len);
    };

    const buckets = colorScheme.map(Array);
    const particleCount = Math.round(bounds.width * PARTICLE_MULTIPLIER) * particleReduction;

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(field.randomize({
        age: Math.floor(Math.random() * MAX_PARTICLE_AGE) + 0
      }));
    }

    const context = windyConfig.canvas.getContext('2d');
    context.lineWidth = particleWidth;
    context.fillStyle = `rgba(0, 0, 0, ${particleFadeOpacity})`;
    let counter = 0;

    (function frame() {
      try {
        if (!windy.stop) {
          counter += 1;
          if (counter >= 1000) {
            counter = 0;
            clear();
          }
          getAnimationFrame(frame);
          evolve(buckets, particles, field);
          draw(buckets, bounds, context);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  };


  /**
   * Updates the wind animation with new configurations.
   * @param {!ConfigPayload} A ConfigPayload instance. 
   */
  const update = function(config) {
    const extent = config.extent();
    const width = extent.width;
    const height = extent.height;
    const bounds = extent.cropBounds || [[0, 0], [width, height]];

    config.canvas.width = width;
    config.canvas.height = height;
    config.canvas.style.width = width + 'px';
    config.canvas.style.height = height + 'px';

    let mapBounds = {
      south: math.deg2rad(extent.latlng[0][1]),
      north: math.deg2rad(extent.latlng[1][1]),
      east: math.deg2rad(extent.latlng[1][0]),
      west: math.deg2rad(extent.latlng[0][0]),
      width: width,
      height: height
    };

    // Do not animate if map repeats across x-axis.
    // @todo (dannycochran) Figure out how to continuously display wind across
    // repeating map layout.
    if (mapBounds.west - mapBounds.east > 0) {
      if (config.boundsExceededCallback) {
        config.boundsExceededCallback(mapBounds);
      }
      return;
    }

    // Optional configurations.
    colorScheme = config.colorScheme || colorScheme;
    velocityScale = config.velocityScale || velocityScale;
    particleWidth = config.particleWidth || particleWidth;
    particleFadeOpacity = config.particleFadeOpacity || particleFadeOpacity;
    particleReduction = config.particleReduction || particleReduction;

    // Build grid.
    const grid = buildGrid(config.data);
    const builtBounds = buildBounds(bounds, width, height);

    windy.field = interpolateField(grid, builtBounds, mapBounds);;
    windy.mapBounds = mapBounds;

    windy.stop = false;
    animate(builtBounds, windy.field);
  };

  /**
   * Stops and clears the wind animation.
   */
  const stop = function() {
    clear(windy.mapBounds);
    windy.stop = true;
    if (windy.field) windy.field.release();
  };

  const clear = function(bounds) {
    if (bounds) {
      const context = windyConfig.canvas.getContext('2d');
      context.clearRect(0, 0, bounds.width, bounds.height);

      if (context.resetTransform) {
        context.resetTransform();
      } else {
        context.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
  }; 

  const windy = {};

  return {stop: stop, update: update};
};
