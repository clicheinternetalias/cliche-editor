
if (!Math.extend) {
  Math.extend = function (src)
  {
    var hop = Object.prototype.hasOwnProperty;
    if (src) {
      for (var id in src) {
        if (hop.call(src, id) && !hop.call(Math, id))
          Math[id] = src[id];
      }
    }
  };
}

Math.extend({

GAMMA : 0.5772156649015328606, /* Euler-Mascheroni */
EULER : 0.5772156649015328606, /* Euler-Mascheroni */
PHI : 1.6180339887498948482, /* golden ratio */
GOLDEN : 1.6180339887498948482, /* golden ratio */
PI1_4 : 0.78539816339744830961, /* pi * .25 */
PI1_2 : 1.57079632679489661923, /* pi * .5 */
PI3_4 : 2.35619449019234492884, /* pi * .75 */
TWOPI : 6.28318530717958647693, /* pi * 2 */
TAU : 6.28318530717958647693, /* pi * 2 */
SQRT3 : 1.73205080756887729352, /* sqrt(3) */
PLASTIC : 1.32471795724474602596, /* x ** 3 = x + 1 */
SILVER : 2.4142135623730950488, /* silver ratio */
RAD_TO_DEG : 57.2957795130823208768, /* 180/pi, 360/tau */
DEG_TO_RAD : 0.01745329251994329577, /* pi/180, tau/360 */

radToDeg : function (x) { return x * Math.RAD_TO_DEG; },
degToRad : function (x) { return x * Math.DEG_TO_RAD; },

isnan : function (x) { return isNaN(x); },
isinf : function (x) { return !isNaN(x) && !isFinite(x); },

fromPolar : function (r, t)
{
  return {
    x : r * Math.cos(t),
    y : r * Math.sin(t)
  };
},

toPolar : function (x, y)
{
  return {
    r : Math.sqrt(x * x + y * y),
    t : Math.atan2(y, x)
  };
},

sign : function (x)
{
  return (x ? (x < 0) : (1 / x === -Infinity)) ? -1 : 1; /* -0 */
},

mod : function (x, y) { return x % y; },

log2 : function (x) { return Math.log(x) / Math.LN2; },
log10 : function (x) { return Math.log(x) / Math.LN10; },
logb : function (x, b) { return Math.log(x) / Math.log(b || 10); },
cbrt : function (x) { return Math.exp(Math.log(x) / 3); },
root : function (x, b) { return Math.exp(Math.log(x) / b); },

cot : function (x) { return 1 / Math.tan(x); },
sec : function (x) { return 1 / Math.cos(x); },
csc : function (x) { return 1 / Math.sin(x); },

acot : function (x) { return Math.atan(1 / x); },
asec : function (x) { return Math.acos(1 / x); },
acsc : function (x) { return Math.asin(1 / x); },

sinh : function (x) { return (Math.exp(x) - Math.exp(-x)) / 2; },
cosh : function (x) { return (Math.exp(x) + Math.exp(-x)) / 2; },
tanh : function (x) { return Math.sinh(x) / Math.cosh(x); },
coth : function (x) { return Math.cosh(x) / Math.sinh(x); },
sech : function (x) { return 1 / Math.cosh(x); },
csch : function (x) { return 1 / Math.sinh(x); },

asinh : function (x) { return Math.log(x + Math.sqrt(x * x + 1)); },
acosh : function (x) { return Math.log(x + Math.sqrt(x * x - 1)); },
atanh : function (x) { return Math.log((1 + x) / (1 - x)) / 2; },
acoth : function (x) { return Math.atanh(1 / x); },
asech : function (x) { return Math.acosh(1 / x); },
acsch : function (x) { return Math.asinh(1 / x); },

isEven : function (x) { return x === Math.round(x) &&  (x % 2); },
isOdd  : function (x) { return x === Math.round(x) && !(x % 2); },

distance : function (dx, dy)
{
  return Math.sqrt(dx * dx + dy * dy);
},

constrain : function (x, lo, hi)
{
  return (x < lo) ? lo : (x > hi) ? hi : x;
},

lerp : function (x, lo, hi) { return lo + x * (hi - lo); },
unlerp : function (x, lo, hi) { return (x - lo) / (hi - lo); },

map : function (x, fromlo, fromhi, tolo, tohi)
{
  return tolo + (tohi - tolo) * ((x - fromlo) / (fromhi - fromlo));
},

fibonacci : function (x)
{
  var a = 0, b = 1, c;
  for (var i = 0; i < x; ++i) {
    c = a; a += b; b = c;
  }
  return a;
},

factorial : function (x)
{
  var tab = [
    1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800,
    479001600, 6227020800, 87178291200, 1307674368000, 20922789888000,
    355687428096000, 6402373705728000, 121645100408832000,
    2432902008176640000
  ];
  return tab[x] || Math.gamma(x + 1);
},

gamma : function (x)
{
  if (x <= 0 && x === Math.floor(x)) return Number.NaN;
  return (x < 0)
         ? -Math.PI / (x * Math.sin(Math.PI * x) * Math.gamma(-x))
         : (x < 15) // work-around for a bug
         ? Math.exp(Math.lngamma(x))
         : Number.NaN;
},

lngamma : function (x)
{
  if (x <= 0) return Number.NaN;

  var e = [
    57.15623566586292, -59.59796035547549, 14.136097974741746,
    -0.4919138160976202, 0.00003399464998481189,
    0.00004652362892704858, -0.00009837447530487956,
    0.0001580887032249125, -0.00021026444172410488,
    0.00021743961811521265, -0.0001643181065367639,
    0.00008441822398385275, -0.000026190838401581408,
    0.0000036899182659531625
  ];
  var g = x;
  var a = x;
  var d = a + 5.2421875;
  d = (a + 0.5) * Math.log(d) - d;
  var b = 0.9999999999999971;
  for (var c = 0; c < 14; c++) b += e[c] / ++g; // g += 1 ???
  return d + Math.log(2.5066282746310007 * b / a);
},

mean : function ()
{
  var n = arguments.length,
      rv = 0;
  for (var i = 0; i < n; ++i)
    rv += arguments[i] / n;
  return rv;
},

mode : function ()
{
  var a = Array.prototype.slice.call(arguments),
      n = a.length,
      o = [];
  for (var i = 0; i < n; ++i) o[a[i]] = 0;
  for (var i = 0; i < n; ++i) o[a[i]]++;
  o.sort(function (a,b) { return b - a; });
  return o[0];
},

median : function ()
{
  var a = Array.prototype.slice.call(arguments),
      n = a.length;
  a.sort(function (a,b) { return a - b; });
  return (n % 2) ? a[Math.floor(n/2)]
                 : Math.mean(Math.floor(a[n/2]), Math.ceil(a[n/2]));
},

stddev : function ()
{
  var a = Array.prototype.slice.call(arguments),
      n = a.length,
      m = Math.mean.apply(Math, a),
      rv = 0;
  for (var i = 0; i < n; ++i)
    rv += a[i] - m;
  return rv;
},

variance : function ()
{
  var a = Array.prototype.slice.call(arguments),
      d = Math.stddev.apply(a);
  return d * d;
},

gcd : function (a, b)
{
  a |= 0;
  b |= 0;
  while (b) { var t = a % b; a = b; b = t; }
  return a;
},

lcm : function (a, b) { return a * (b / Math.gcd(a, b)); },

nPr : function (n, k) { return Math.factorial(n) / Math.factorial(n - k); },
nCr : function (n, k) { return Math.nPr(n, k) / Math.factorial(k); },
lnPr : function (n, k) { return Math.lngamma(n + 1) / Math.lngamma(n - k + 1); },
lnCr : function (n, k) { return Math.lnPr(n, k) / Math.lngamma(k + 1); },

quadratic : function (a, b, c)
{
  var d = b * b - 4 * a * c;
  if (a == 0) return (b == 0 && c == 0) ? Number.NaN : -(c / b);
  return (d < 0) ? Number.NaN : (-b + Math.sqrt(d)) / (2 * a);
},

nquadratic : function (a, b, c)
{
  var d = b * b - 4 * a * c;
  if (a == 0) return (b == 0 && c == 0) ? Number.NaN : -(c / b);
  return (d < 0) ? Number.NaN : (-b - Math.sqrt(d)) / (2 * a);
},

integral : function (start, end, fn)
{
  var y1 = 0,
      y2 = 0,
      steps = 500,
      delta = (end - start) / (steps + 1),
      delta2 = delta / 2,
      rv = 0;

  steps += 2;
  for (var i = 0; i < steps; ++i) {
    y1 = y2;
    y2 = fn(start + i * delta);
    rv += (y1 + y2) * delta2;
  }
  return rv;
},

differential : function (x, fn)
{
  return (fn(x + 0.00005) - fn(x - 0.00005)) / 0.0001;
},

trunc : function (x) { return x < 0 ? Math.ceil(x) : Math.floor(x); }

}); //Math.extend

/* Aliases
 */
Math.extend({

avg : Math.mean

});
