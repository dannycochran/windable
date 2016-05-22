/**
 * A modified version of Esri's Windy.JS, which itself draws heavily from
 * Earth.nullschool's original implementation. Much of the logic from
 * those original libraries is untouched; the updates are mostly aesthetic.
 *
 * https://github.com/Esri/wind-js (MIT License)
 * https://github.com/cambecc/earth (MIT License)
 */

import {getAnimationFrame, isValue} from './../utilities/functions';
import {math} from './../utilities/math';
import {palettes} from './../utilities/palettes';

// Wind velocity at which particle intensity is maximum (m/s).
const MAX_WIND_INTENSITY = 30

// Max number of frames a particle is drawn before regeneration.
const MAX_PARTICLE_AGE = 100;

// Singleton for no wind in the form: [u, v, magnitude].
const NULL_WIND_VECTOR = [NaN, NaN, null];


export class Renderer {
  constructor(canvas, extent, context) {
    // Canvas element.
    this.canvas = canvas;

    // Returns map boundaries extent.
    this.extent = extent;

    // Canvas context.
    this.context = context;

    // Some default palettes.
    this.palettes = palettes;

    // A reference to the last used data source.
    this.data_ = null;

    // Boolean indicating if animation frame should continue.
    this.stopped_ = true;

    // The particle field.
    this.field_ = null;

    // The map boundaries.
    this.mapBounds_ = null;

    // Holds all the particles as length 6 vectors in an array.
    this.particleVectors_ = [];

    // Holds an RGB color scheme.
    this.rgbColorScheme_ = {};

    // Configurable fields for the user.
    this.config_ = {
      // An array of color hex codes.
      colorScheme: palettes.Purples,
      // The lower this is, the faster the particles disappear from the screen.
      particleFadeOpacity: 0.97,
      // Scale for wind velocity (Arbitrary; smaller values reduce velocity).
      velocityScale: 1/200000,
      // Line width of a drawn particle.
      particleWidth: 2,
      // Reduce particle count to this fraction (improves FPS).
      particleReduction: 0.1
    };

    // Determine the context type.
    if (!canvas) {
      throw new Error('Must provide an HTMLCanvasElement.');
    } else if (!extent) {
      throw new Error('Must provide an extent function.');
    } else if (!context) {
      throw new Error('Must provide a canvas context.');
    }
  }


  /**
   * Updates the wind animation with new configurations.
   * @param {!ConfigPayload} A ConfigPayload instance. 
   */
  start(config) {
    const extent = this.extent();

    const width = extent.width;
    const height = extent.height;
    const bounds = extent.cropBounds || [[0, 0], [width, height]];

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.mapBounds_ = {
      south: math.deg2rad(extent.latlng[0][1]),
      north: math.deg2rad(extent.latlng[1][1]),
      east: math.deg2rad(extent.latlng[1][0]),
      west: math.deg2rad(extent.latlng[0][0]),
      width: width,
      height: height
    };
    this.data_ = config.data || this.data_;

    // Do not animate if map repeats across x-axis.
    // @TODO (dannycochran) Figure out how to continuously display wind across
    // repeating map layout.
    if (this.mapBounds_.west - this.mapBounds_.east > 0 ||
        Math.abs(this.mapBounds_.west) - Math.abs(this.mapBounds_.east) === 0 || !this.data_) {
      if (config.boundsExceededCallback) {
        config.boundsExceededCallback(this.mapBounds_);
      }
      return;
    }

    // Optional configurations.
    this.config_.colorScheme = config.colorScheme || this.config_.colorScheme;
    this.config_.velocityScale = config.velocityScale || this.config_.velocityScale;
    this.config_.particleWidth = config.particleWidth || this.config_.particleWidth;
    this.config_.particleFadeOpacity = config.particleFadeOpacity || this.config_.particleFadeOpacity;
    this.config_.particleReduction = config.particleReduction || this.config_.particleReduction;

    // Build grid.
    const grid = this.buildGrid_(this.data_);
    const builtBounds = this.buildBounds_(bounds, width, height);

    this.field_ = this.interpolateField_(grid, builtBounds, this.mapBounds_);

    this.stopped_ = false;
    return this.animate_(builtBounds, this.data_[0].data.length);
  }


  /**
   * Stops and clears the wind animation.
   */
  stop() {
    this.clear_();
    this.stopped_ = true;
    if (this.field_) this.field_.release();

    return this;
  }


  /**
   * Constructs an NX by NY grid (360 by 181 in most cases). Each grid square
   * is 1x1.
   * 
   * @param {!WindData} windData An instance of WindData.
   * @return {!Function} A function to interpolate the wind points on the grid.
   */
  buildGrid_(windData) {
    const uComp = windData[0];
    const vComp = windData[1];

    // Returns an x,y coordinate pair from uComp and vComp.
    const getDataPoint = (i) => [uComp.data[i], vComp.data[i]];

    // The grid's origin (e.g., 0.0E, 90.0N)
    const λ0 = uComp.header.lo1;
    const φ0 = uComp.header.la1;

    // Distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat).
    const Δλ = uComp.header.dx;
    const Δφ = uComp.header.dy;

    // Number of grid points W-E and N-S (e.g., 144 x 73).
    const ni = uComp.header.nx;
    const nj = uComp.header.ny;

    // Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases
    // from φ0:
    // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
    const grid = [];
    const isContinuous = Math.floor(ni * Δλ) >= 360;
    let p = 0;

    for (let j = 0; j < nj; j++) {
      const row = [];
      for (let i = 0; i < ni; i++, p++) {
        row[i] = getDataPoint(p);
      }

      // For wrapped grids, duplicate first column as last column to simplify
      // interpolation logic.
      if (isContinuous) {
        row.push(row[0]);
      }

      grid[j] = row;
    }

    return function(λ, φ) {
      // Calculate longitude index in wrapped range [0, 360).
      const i = math.floorMod(λ - λ0, 360) / Δλ;

      // Calculate latitude index in direction +90 to -90.
      const j = (φ0 - φ) / Δφ;
      const fi = Math.floor(i);
      const ci = fi + 1;
      const fj = Math.floor(j);
      const cj = fj + 1;

      let row;
      if ((row = grid[fj])) {
        const g00 = row[fi];
        const g10 = row[ci];
        if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
          const g01 = row[fi];
          const g11 = row[ci];
          if (isValue(g01) && isValue(g11)) {
            // All four points found, so interpolate the value.
            return math.bilinearInterpolateVector(i - fi, j - fj, g00, g10, g01, g11);
          }
        }
      }
      return null;
    }
  }


  /**
   * Calculate distortion of the wind vector caused by the shape of the
   * projection at point (x, y). The wind vector is modified in place and
   * returned by this function.
   */
  distort_(λ, φ, x, y, scale, wind) {
    const u = wind[0] * scale;
    const v = wind[1] * scale;
    const d = math.distortion(λ, φ, x, y, this.mapBounds_);

    // Scale distortion vectors by u and v, then add.
    wind[0] = d[0] * u + d[2] * v;
    wind[1] = d[1] * u + d[3] * v;

    return wind;
  }


  createField_(columns, bounds) {
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
    field.randomize = (particle) => {
      return Object.assign(particle, {
        x1: Math.round(Math.floor(Math.random() * bounds.width) + bounds.x),
        y1: Math.round(Math.floor(Math.random() * bounds.height) + bounds.y)
      });
    };

    return field;
  }


  buildBounds_(bounds, width, height) {
    const upperLeft = bounds[0];
    const lowerRight = bounds[1];
    const x = Math.round(upperLeft[0]);
    const y = Math.max(Math.floor(upperLeft[1], 0), 0);
    const xMax = Math.min(Math.ceil(lowerRight[0], width), width - 1);
    const yMax = Math.min(Math.ceil(lowerRight[1], height), height - 1);
    return {x: x, y: y, xMax: width, yMax: yMax, width: width, height: height};
  }


  interpolateField_(grid, bounds) {
    const velocity = bounds.height * this.config_.velocityScale;

    let x = bounds.x;
    let columns = [];

    const interpolateColumn = x => {
      const column = [];
      for (let y = bounds.y; y <= bounds.yMax; y += 2) {
        const coord = math.invert(x, y, this.mapBounds_);

        if (coord) {
          const λ = coord[0];
          const φ = coord[1];

          if (isFinite(λ)) {
            let wind = grid(λ, φ);

            if (wind) {
              wind = this.distort_(λ, φ, x, y, velocity, wind);
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

    return this.createField_(columns, bounds);
  }


  /**
   * Moves the wind particles.
   */
  evolve_(buckets, particles) {
    this.particleVectors_.length = 0;
    buckets.forEach(bucket => { bucket.length = 0; });

    particles.forEach(particle => {
      if (particle.age > MAX_PARTICLE_AGE) {
        this.field_.randomize(particle).age = 0;
      }

      // Vector at current position.
      const vector = this.field_(particle.x1, particle.y1);

      if (vector[2] === null) {
        // Particle has escaped the grid, never to return.
        particle.age = MAX_PARTICLE_AGE;
      } else {
        const x2 = particle.x1 + vector[0];
        const y2 = particle.y1 + vector[1];

        if (this.field_(x2, y2)[2] !== null) {
          // Path from (x,y) to (xt,yt) is visible, so add this particle to
          // the appropriate draw bucket.
          particle.x2 = x2;
          particle.y2 = y2;

          const colorIndex = this.config_.colorScheme.indexFor(vector[2]);
          const rgba = this.rgbColorScheme_.get(colorIndex);

          buckets[colorIndex].push(particle);

          this.particleVectors_.push(particle.x1 * this.resolution);
          this.particleVectors_.push(particle.y1 * this.resolution);
          rgba.forEach(v => { this.particleVectors_.push(v); });
          this.particleVectors_.push(particle.x2 * this.resolution);
          this.particleVectors_.push(particle.y2 * this.resolution);
          rgba.forEach(v => { this.particleVectors_.push(v); });
        } else {
          // Particle isn't visible, but it still moves through the field.
          particle.x1 = x2;
          particle.y1 = y2;
        }
      }
      particle.age += 1;
    });
  }


  /**
   * Animates the wind visualization.
   */
  animate_(bounds, numPoints) {
    this.config_.colorScheme.indexFor = (m) => {  // map wind speed to a style
      const length = this.config_.colorScheme.length - 1;
      return Math.floor(
        Math.min(m, MAX_WIND_INTENSITY) / MAX_WIND_INTENSITY * length);
    };

    this.rgbColorScheme_ = {
      colors: this.config_.colorScheme.map(hex => {
        hex = hex.replace('#','');
        const r = parseInt(hex.substring(0,2), 16);
        const g = parseInt(hex.substring(2,4), 16);
        const b = parseInt(hex.substring(4,6), 16);

        return [r, g, b, 255];
      }),
      get: (index) => {
        return this.rgbColorScheme_.colors[index];
      }
    }

    const buckets = this.config_.colorScheme.map(Array);
    const particles = [];
    for (let i = 0; i < numPoints * this.config_.particleReduction; i++) {
      particles.push(this.field_.randomize({
        age: Math.floor(Math.random() * MAX_PARTICLE_AGE)
      }));
    }

    let counter = 0;
    this.prepare_();

    const frame = () => {
      if (!this.stopped_) {
        counter += 1;
        if (counter >= 1000) {
          counter = 0;
          this.clear_();
        }
        this.currentFrame_ = getAnimationFrame(frame);
        this.evolve_(buckets, particles);
        this.draw_(buckets, bounds);
      }
    };

    frame();
  }


  /**
   * Clear the drawing context. Implementation specific to renderer.
   */
  clear_() {
    if (this.currentFrame_) cancelAnimationFrame(this.currentFrame_);
    return this;
  }


  /**
   * Prepare the drawing context. Implementation specific to renderer.
   */
  prepare_() {
    return this;
  }


  /**
   * Draw the drawing context. Implementation specific to renderer.
   */
  draw_() {
    return this;
  }
};
