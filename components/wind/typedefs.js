/**
 * Windable is not compiled, so these typedefs are never actually used. They
 * serve primarily as documentation.
 */

/**
 * WindData is the data required to render wind animation. It is sourced
 * from NOAA: http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl. This is an
 * array of length 2. The header information in each object should be constant
 * for 2d projections.
 * @typedef [[
 *    (!Object<
 *      header: {
 *        lo1:  number, // grid x origin (e.g. 0.0E, usually 0)
 *        la1: number, // grid y origin (e.g. 90.0N, usually 90)
 *        dx: number, // distance between x-grid points (usually 1)
 *        dy: number, // distance between y-grid points (usually 1)
 *        nx: number, // number of grid points W-E (usually 360)
 *        ny: number // number of grid points N-S (usually 181)
 *      },
 *      data: !Array<number> // one half of a coordinate (e.g. x in x,y)
 *   >)
 * ]]
 */
export let WindData;

/**
 * MapDimensions is used to determine dimensions.
 * @typedef {{
 *   width: (!number) The width of the canvas container element.
 *   height: (!number) The height of the canvas container element.
 *   latlng: (!Array<Array<number, number>>) [[west, south], [east, north]]
 *   cropBounds: (?Array<Array<number, number>>=) Optional bounds to crop map.
 * }}
 */
export let MapDimensions;

/**
 * ConfigPayload can be passed at construction and to the "update" function in
 * a WindMap instance.
 *
 * @typedef {{
 *   canvas: (!HTMLCanvasElement) The canvas to which wind will be rendered.
 *   extent: (Function():!MapDimensions) An MapDimensions object.
 *   data: (!WindData) Wind data from NOAA (see examples in data/).
 *
 *   boundsExceededCallback: (!Function=) An optional callback to invoke when x-axis bounds are exceeded.
 *   colorScheme: (!Array<string>=) An optional color scheme.
 *   velocityScale: (!number=) An optional scale for the particle velocity.
 *   particleWidth: (!number=) An optional particle width in pixels.
 *   particleFadeOpacity: (!number=) An optional fade opacity decimal.
 *   particleReduction: (!number=) An optional integer for changing the number of particles.
 * }}
 */
export let ConfigPayload;