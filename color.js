/* ********************************************************************** */
/* ********************************************************************** */

// JFIF-style
// in:[0..255], out:[0..255]
function Color_ycbcrFromRGB(r, g, b, a)
{
  return {
    Y:  (  0 + (0.299    * r) + (0.587    * g) + (0.114    * b)) | 0,
    CB: (128 - (0.168736 * r) - (0.331264 * g) + (0.5      * b)) | 0,
    CR: (128 + (0.5      * r) - (0.418688 * g) - (0.081312 * b)) | 0,
    A: a
  };
}

// in:[0..255], out:[0..255]
function Color_rgbFromYCbCr(y, cb, cr, a)
{
  cb -= 128;
  cr -= 128;
  return {
    R: (y                + 1.402   * cr) | 0,
    G: (y - 0.34414 * cb - 0.71414 * cr) | 0,
    B: (y + 1.772   * cb               ) | 0,
    A: a
  };
}

/* ********************************************************************** */
/* ********************************************************************** */

// in:[0..255], out:[0..359][0..99][0..99]
function Color_hsvFromRGB(r, g, b, a)
{
  r /= 255;
  g /= 255;
  b /= 255;
  var d = 0, h = 0, max = r;
  if (r !== g || g !== b || b !== r) {
    if (g >= r && g >= b) {
      max = g;
      d = g - (r < b ? r : b);
      h = ((b - r) / d + 2) / 6;
    } else if (b >= r && b >= g) {
      max = b;
      d = b - (r < g ? r : g);
      h = ((r - g) / d + 4) / 6;
    } else if (g >= b) {
      d = r - b;
      h = ((g - b) / d) / 6;
    } else {
      d = r - g;
      h = ((g - b) / d + 6) / 6;
    }
  }
  return {
    H: (359 * h) | 0,
    S: (99 * (max && (d / max))) | 0,
    V: (99 * max) | 0,
    A: a
  };
}

// in:[0..360][0..100], out:[0..255]
function Color_rgbFromHSV(h, s, v, a)
{
  h /= 359;
  s /= 99;
  v *= 2.55;
  var i = (h * 6) | 0,
      f = h * 6 - i,
      p = (v * (1 - s)) | 0,
      q = (v * (1 - f * s)) | 0,
      t = (v * (1 - (1 - f) * s)) | 0;
  v |= 0;
  switch (i % 6) {
  case 0: return { R: v, G: t, B: p, A: a };
  case 1: return { R: q, G: v, B: p, A: a };
  case 2: return { R: p, G: v, B: t, A: a };
  case 3: return { R: p, G: q, B: v, A: a };
  case 4: return { R: t, G: p, B: v, A: a };
  case 5: return { R: v, G: p, B: q, A: a };
  }
  /*NOTREACHED*/
  return {};
}

/* ********************************************************************** */
/* ********************************************************************** */

function ColorMap_funcFromExpr(expr, vars)
{
  vars || (vars = {});
  var hop = Object.prototype.hasOwnProperty,
      s = "return " + expr.replace(/\b[A-Za-z][A-Za-z\d]*\b(?::=)?/g, function (m) {
    if (hop.call(Math, m)) return "Math." + m;
    var u = m.toUpperCase();
    if (hop.call(Math, u)) return "Math." + u;
    if (hop.call(vars, m)) return "" + vars[m];
    if (m === "Y") return "Color_ycbcrFromRGB(vars.R,vars.G,vars.B).Y";
    if (m === "CB") return "Color_ycbcrFromRGB(vars.R,vars.G,vars.B).CB";
    if (m === "CR") return "Color_ycbcrFromRGB(vars.R,vars.G,vars.B).CR";
    if (m === "H") return "Color_hsvFromRGB(vars.R,vars.G,vars.B).H";
    if (m === "S") return "Color_hsvFromRGB(vars.R,vars.G,vars.B).S";
    if (m === "V") return "Color_hsvFromRGB(vars.R,vars.G,vars.B).V";
    if (m.charAt(m.length - 1) === "=") return m.substr(0, m.length - 1);
    return "vars." + m;
  });
  return new Function("vars", s);
}

function ColorMap_fromFunc(func, vars, len)
{
  vars || (vars = {});
  len || (len = 256);
  function clamp(i) { return i < 0 ? 0 : i > 1 ? 1 : i; }
  var i = len, map = new Array(len);
  while (i--) {
    vars.i = i;
    vars.x = i / len;
    map[i] = clamp(func(vars)) * len;
  }
  return map;
}

function ColorMap_fromExpr(expr, vars, len)
{
  return ColorMap_fromFunc(ColorMap_funcFromExpr(expr || "x"), vars, len);
}

var ColorMap_identity = ColorMap_fromExpr();

/* ********************************************************************** */
/* ********************************************************************** */

/* Scale histogram.
 * Returns a map of the range [0..n]->[0..255] (n < 255)
 */
function Histogram_getScaledMap(hist)
{
  var max = 0;
  var scaled = [];
  for (var i = 0; i < 256; ++i) {
    if (max < hist[i]) max = hist[i];
  }
  max = 255 / max;
  for (var i = 0; i < 256; ++i) {
    scaled[i] = hist[i] * max;
  }
  return scaled;
}

/* ********************************************************************** */
/* ********************************************************************** */

/* Cumulative histogram.
 * Returns a map of the range [0..255]->[0..255]
 */
function Histogram_getCumulativeMap(hist)
{
  var eqMap = [];
  var sum = 0;
  for (var i = 0; i < 256; ++i) {
    sum += hist[i];
    eqMap[i] = (sum + .5) | 0;
  }
  return eqMap;
}

/* ********************************************************************** */
/* ********************************************************************** */

/* Map one histogram to another.
 * Both arguments should be the cumulative map of histograms.
 * Returns a map of the range [0..255]->[0..255]
 */
function Histogram_getMatchingMap(mapfrom, mapto)
{
  // http://fourier.eng.hmc.edu/e161/lectures/contrast_transform/node3.html
  var matchMap = [];
  var j = 0;
  for (var i = 0; i < 256; ++i) {
    if (mapfrom[i] <= mapto[j]) {
      matchMap[i] = j;
    } else {
      while (mapfrom[i] > mapto[j]) ++j;
      if (mapto[j] - mapfrom[i] > mapfrom[i] - mapto[j-1])
        matchMap[i] = j--;
      else
        matchMap[i] = j;
    }
  }
  return matchMap;
}

/* ********************************************************************** */
/* ********************************************************************** */
