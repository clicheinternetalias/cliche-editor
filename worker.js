/* ********************************************************************** */
/* ********************************************************************** */

importScripts("color.js");

onmessage = function (event)
{
  //type = filter|channel|pixel|loadChannel|histogram|resize
  processFn[event.data.type](event.data);
  self.close();
};

onerror = function (event)
{
  log(event);
};

function log(x)
{
  postMessage({ debug: x });
}

var processFn = {};

/* ********************************************************************** */
/* Progress */
/* ********************************************************************** */

var lastProgress = new Date();
function progress(i, n, rv)
{
  if (i >= n)
    postMessage({ progress: 1, result: rv });
  else if (i <= 0)
    postMessage({ progress: 0 });
  else {
    var now = new Date();
    var p = i / n;
    if (now - lastProgress > 200) {
      postMessage({ progress: p }); // too many messages freezes FF
      lastProgress = now;
    }
  }
}

/* ********************************************************************** */
/* Nearest-Neighbour Resize */
/* ********************************************************************** */

/* args = {
 *   newimg: imageData
 *   neww: n
 *   newh: n
 *   img: imageData
 *   w: n
 *   h: n
 * }
 */
processFn["resize"] = function processResize(args)
{
  var src = args.img.data;
  var srcw = args.w;
  var dst = args.newimg.data;
  var dstw = args.neww;
  var len = dst.length;
  var xx = (args.w - 1) / (args.neww - 1);
  var yy = (args.h - 1) / (args.newh - 1);
  var dstx = 0;
  var dsty = 0;

  for (var i = 0; i < len; i += 4) {
    progress(i, len);
    var srcx = (xx * dstx + .5) | 0;
    var srcy = (yy * dsty + .5) | 0;
    var j = (srcy * srcw + srcx) << 2;
    dst[i  ] = src[j];
    dst[i+1] = src[j+1];
    dst[i+2] = src[j+2];
    dst[i+3] = src[j+3];
    (++dstx >= dstw) && ((dstx = 0), ++dsty);
  }
  progress(i, len, args.newimg);
};

/* ********************************************************************** */
/* Histogram */
/* ********************************************************************** */

/* args = {
 *   channel: "r|g|b|a|y"
 *   img: imageData
 *   w: n
 *   h: n
 * }
 */
processFn["histogram"] = function getHistogram(args)
{
  var src = args.img.data;
  var len = src.length;

  var hist = [];
  for (var i = 0; i < 256; ++i) hist[i] = 0;

  var channel = { r: 0, g: 1, b: 2, a: 3, y: 4 }[args.channel || "y"];
  if (channel === 4) {
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      var lum = (0.2126 * src[i] + 0.7152 * src[i+1] + 0.0722 * src[i+2]) | 0;
      hist[lum]++;
    }
  } else {
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      hist[src[channel]]++;
    }
  }
  len /= 4;
  len /= 256;
  for (var i = 0; i < 256; ++i) hist[i] /= len;
  progress(len, len, hist);
};

/* ********************************************************************** */
/* Convolution Filters */
/* ********************************************************************** */

/* args = {
 *   filter: { matrix: [], divisor: n, bias: n }
 *   alpha: bool
 *   img: imageData
 *   w: n
 *   h: n
 * }
 */
processFn["filter"] = function processFilter(args)
{
  var a = !!args.alpha;
  var filter = args.filter || {};
  var d = filter.divisor || 1;
  var b = filter.bias || 0;
  var mtx = filter.matrix || [ 1 ];
  var mtxw = Math.sqrt(mtx.length) | 0;
  var mtxo = (mtxw / 2) | 0; // max distance from center of matrix (1,2,3...)
  var src = args.img.data;
  var len = src.length;
  var w = args.w;
  var h = args.h;
  var dst = [];
  var x = 0;
  var y = 0;

  for (var i = 0; i < len; i += 4) {
    progress(i, len);
    var sr = 0, sg = 0, sb = 0, sa = 0, k = 0;
    for (var my = -mtxo; my <= mtxo; ++my) {
      var y2 = y + my; y2 = y2 < 0 ? 0 : y2 > h ? h : y2;
      for (var mx = -mtxo; mx <= mtxo; ++mx) {
        var x2 = x + mx; x2 = x2 < 0 ? 0 : x2 > w ? w : x2;
        var j = (y2 * w + x2) << 2;
        var mval = mtx[k++];
        sr += src[j  ] * mval;
        sg += src[j+1] * mval;
        sb += src[j+2] * mval;
        a && (sa += src[j+3] * mval);
      }
    }
    dst[i  ] = (sr / d + b);
    dst[i+1] = (sg / d + b);
    dst[i+2] = (sb / d + b);
    dst[i+3] = a ? (sa / d + b) : src[i+3];
    (++x >= w) && ((x = 0), ++y);
  }
  args.img.data.set(dst);
  progress(i, len, args.img);
};

/* ********************************************************************** */
/* Channel Maps */
/* ********************************************************************** */

/* args = {
 *   maps: [ [], [], [], [] ]
 *   exprs: [ "", "", "", "" ]
 *   vars: {}
 *   pxtype: "rgb"|"ycbcr"|"hsv"
 *   img: imageData
 *   w: n
 *   h: n
 * }
 */
processFn["channel"] = function processMap(args)
{
  var pxtype = args.pxtype || "rgb";
  var map0, map1, map2, map3;
  var img = args.img.data;
  var lens = {
    "rgb": [ 256, 256, 256 ],
    "ycbcr": [ 256, 256, 256 ],
    "hsv": [ 360, 100, 100 ]
  };
  if (args.exprs) {
    map0 = ColorMap_fromExpr(args.exprs[0], args.vars, lens[pxtype][0]);
    map1 = ColorMap_fromExpr(args.exprs[1], args.vars, lens[pxtype][1]);
    map2 = ColorMap_fromExpr(args.exprs[2], args.vars, lens[pxtype][2]);
    map3 = ColorMap_fromExpr(args.exprs[3], args.vars, lens[pxtype][3]);
  } else if (args.maps) {
    map0 = args.maps[0];
    map1 = args.maps[1];
    map2 = args.maps[2];
    map3 = args.maps[3];
  }
  map0 = map0 || ColorMap_identity;
  map1 = map1 || ColorMap_identity;
  map2 = map2 || ColorMap_identity;
  map3 = map3 || ColorMap_identity;

  processFn["channel"].pxtypes[pxtype](img, img.length, map0, map1, map2, map3);
  progress(img.length, img.length, args.img);
};

processFn["channel"].pxtypes = {

  "rgb": function processChannelRGB(dst, len, mapR, mapG, mapB, mapA) {
    for (var i = 0; i < len; ) {
      progress(i, len);
      dst[i] = mapR[dst[i]]; ++i;
      dst[i] = mapG[dst[i]]; ++i;
      dst[i] = mapB[dst[i]]; ++i;
      dst[i] = mapA[dst[i]]; ++i;
    }
  },
  "hsv": function processChannelHSV(dst, len, mapH, mapS, mapV, mapA) {
    for (var i = 0; i < len; ) {
      progress(i, len);
      var hsv = Color_hsvFromRGB(dst[i], dst[i+1], dst[i+2], dst[i+3]);
      var rgb = Color_rgbFromHSV(mapH[hsv.H], mapS[hsv.S],
                                 mapV[hsv.V], mapA[hsv.A]);
      dst[i++] = rgb.R;
      dst[i++] = rgb.G;
      dst[i++] = rgb.B;
      dst[i++] = rgb.A;
    }
  },
  "ycbcr": function processChannelYCbCr(dst, len, mapY, mapCb, mapCr, mapA) {
    for (var i = 0; i < len; ) {
      progress(i, len);
      var ycc = Color_ycbcrFromRGB(dst[i], dst[i+1], dst[i+2], dst[i+3]);
      var rgb = Color_rgbFromYCbCr(mapY[ycc.Y], mapCb[ycc.CB],
                                   mapCr[ycc.CR], mapA[ycc.A]);
      dst[i++] = rgb.R;
      dst[i++] = rgb.G;
      dst[i++] = rgb.B;
      dst[i++] = rgb.A;
    }
  }

}; //pxtypes

/* ********************************************************************** */
/* Pixel Functions */
/* ********************************************************************** */

/* args = {
 *   fn: ""
 *   expr: ""
 *   vars: {}
 *   img: imageData
 *   w: n
 *   h: n
 * }
 */
processFn["pixel"] = function processFunc(args)
{
  var fn = args.fn ? new Function("vars", args.fn)
                   : ColorMap_funcFromExpr(args.expr, args.vars);
  var vars = args.vars || {};
  var dst = args.img.data;
  var len = dst.length;

  // let's move some branches outside the loop
  vars.R = dst[0]; vars.G = dst[1]; vars.B = dst[2]; vars.A = dst[3];
  var rv = fn(vars);

  if ("V" in rv && "A" in rv) { // GreyA
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      vars.R = dst[i]; vars.G = dst[i+1]; vars.B = dst[i+2]; vars.A = dst[i+3];
      rv = fn(vars);
      dst[i] = dst[i+1] = dst[i+2] = rv.V;
      dst[i+3] = rv.A;
    }
  } else if ("V" in rv) { // Grey
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      vars.R = dst[i]; vars.G = dst[i+1]; vars.B = dst[i+2]; vars.A = dst[i+3];
      rv = fn(vars);
      dst[i] = dst[i+1] = dst[i+2] = rv.V;
    }
  } else if ("A" in rv) { // RGBA
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      vars.R = dst[i]; vars.G = dst[i+1]; vars.B = dst[i+2]; vars.A = dst[i+3];
      rv = fn(vars);
      dst[i] = rv.R; dst[i+1] = rv.G; dst[i+2] = rv.B; dst[i+3] = rv.A;
    }
  } else { // RGB
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      vars.R = dst[i]; vars.G = dst[i+1]; vars.B = dst[i+2]; vars.A = dst[i+3];
      rv = fn(vars);
      dst[i] = rv.R; dst[i+1] = rv.G; dst[i+2] = rv.B;
    }
  }
  progress(i, len, args.img);
};

/* ********************************************************************** */
/* Channel Loading / Saving */
/* ********************************************************************** */

/* args = {
 *   channel: "r|g|b|y|cb|cr|h|s|v|a"
 *   fromimg: imageData
 *   img: imageData
 *   w: n
 *   h: n
 * }
 */
processFn["loadChannel"] = function processLoadChannel(args)
{
  var img = args.img.data;
  processFn["channel"]
    .channels[args.channel](img, img.length, args.fromimg.data);
  progress(img.length, img.length, args.img);
};

processFn["channel"].channels = {

  "r": function processLoadChannelR(dst, len, src) {
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      dst[i] = src[i];
    }
  },
  "g": function processLoadChannelG(dst, len, src) {
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      dst[i+1] = src[i];
    }
  },
  "b": function processLoadChannelB(dst, len, src) {
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      dst[i+2] = src[i];
    }
  },
  "a": function processLoadChannelA(dst, len, src) {
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      dst[i+3] = src[i];
    }
  },
  "h": function processLoadChannelH(dst, len, src) {
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      var hsv = Color_hsvFromRGB(dst[i], dst[i+1], dst[i+2], dst[i+3]);
      var rgb = Color_rgbFromHSV(src[i]/255*359, hsv.S, hsv.V, hsv.A);
      dst[i  ] = rgb.R;
      dst[i+1] = rgb.G;
      dst[i+2] = rgb.B;
      dst[i+3] = rgb.A;
    }
  },
  "s": function processLoadChannelS(dst, len, src) {
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      var hsv = Color_hsvFromRGB(dst[i], dst[i+1], dst[i+2], dst[i+3]);
      var rgb = Color_rgbFromHSV(hsv.H, src[i]/255*99, hsv.V, hsv.A);
      dst[i  ] = rgb.R;
      dst[i+1] = rgb.G;
      dst[i+2] = rgb.B;
      dst[i+3] = rgb.A;
    }
  },
  "v": function processLoadChannelV(dst, len, src) {
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      var hsv = Color_hsvFromRGB(dst[i], dst[i+1], dst[i+2], dst[i+3]);
      var rgb = Color_rgbFromHSV(hsv.H, hsv.S, src[i]/255*99, hsv.A);
      dst[i  ] = rgb.R;
      dst[i+1] = rgb.G;
      dst[i+2] = rgb.B;
      dst[i+3] = rgb.A;
    }
  },
  "y": function processLoadChannelY(dst, len, src) {
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      var ycc = Color_ycbcrFromRGB(dst[i], dst[i+1], dst[i+2], dst[i+3]);
      var rgb = Color_rgbFromYCbCr(src[i], ycc.CB, ycc.CR, ycc.A);
      dst[i  ] = rgb.R;
      dst[i+1] = rgb.G;
      dst[i+2] = rgb.B;
      dst[i+3] = rgb.A;
    }
  },
  "cb": function processLoadChannelCb(dst, len, src) {
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      var ycc = Color_ycbcrFromRGB(dst[i], dst[i+1], dst[i+2], dst[i+3]);
      var rgb = Color_rgbFromYCbCr(ycc.Y, src[i], ycc.CR, ycc.A);
      dst[i  ] = rgb.R;
      dst[i+1] = rgb.G;
      dst[i+2] = rgb.B;
      dst[i+3] = rgb.A;
    }
  },
  "cr": function processLoadChannelCr(dst, len, src) {
    for (var i = 0; i < len; i += 4) {
      progress(i, len);
      var ycc = Color_ycbcrFromRGB(dst[i], dst[i+1], dst[i+2], dst[i+3]);
      var rgb = Color_rgbFromYCbCr(ycc.Y, ycc.CB, src[i], ycc.A);
      dst[i  ] = rgb.R;
      dst[i+1] = rgb.G;
      dst[i+2] = rgb.B;
      dst[i+3] = rgb.A;
    }
  }

}; //channels

/* ********************************************************************** */
/* ********************************************************************** */
