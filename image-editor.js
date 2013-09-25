/* ********************************************************************** */
/* ********************************************************************** */

var ImageEditor;

(function(){

/* ********************************************************************** */
/* Constructor */
/* ********************************************************************** */

ImageEditor = function (parentID, progressCB, errorCB)
{
  this.elem = $$("canvas");
  this.ctxt = this.elem.getContext('2d');
  $(parentID).appendChild(this.elem);

  // Image Info
  this.src = "";
  this.w = 0;
  this.h = 0;
  this.modified = false;

  // Undo
  this.undoStack = new CursorList();

  // Callbacks
  this.onProgress = progressCB || function(percent){};
  this.onError = errorCB || function(error){};
};

/* ********************************************************************** */
/* Canvas Copying */
/* ********************************************************************** */

function copyFromImage(self, img)
{
  self.elem.setAttribute("width", (self.w = img.width) + "px");
  self.elem.setAttribute("height", (self.h = img.height) + "px");
  self.ctxt.drawImage(img, 0, 0);
}

function copyFromCanvas(self, c)
{
  // can't drawImage; it only stores a pointer, not a deep copy
  self.elem.setAttribute("width", (self.w = c.w) + "px");
  self.elem.setAttribute("height", (self.h = c.h) + "px");
  self.ctxt.putImageData(c.getContext("2d").getImageData(0, 0, c.w, c.h), 0, 0);
}

function copyFromData(self, imgData)
{
  self.elem.setAttribute("width", (self.w = imgData.width) + "px");
  self.elem.setAttribute("height", (self.h = imgData.height) + "px");
  self.ctxt.putImageData(imgData, 0, 0);
}

function dupCanvas(self)
{
  var c = $$("canvas");
  c.setAttribute("width", (c.w = self.w) + "px");
  c.setAttribute("height", (c.h = self.h) + "px");
  c.getContext("2d").putImageData(self.ctxt.getImageData(0, 0, self.w, self.h), 0, 0);
  return c;
}

function newCanvas(w, h, img)
{
  var c = $$("canvas");
  c.setAttribute("width", (c.w = w) + "px");
  c.setAttribute("height", (c.h = h) + "px");
  img && c.getContext("2d").drawImage(img, 0, 0);
  return c;
}

/* ********************************************************************** */
/* Working Canvas */
/* ********************************************************************** */

/* The top of the undo stack always contains our current accepted image
 * (so we can undo/redo to it).
 * What is displayed is only a preview of the user's modifications.
 */
ImageEditor.prototype.commitChanges = function ()
{
  if (!this.w || !this.h) return;
  this.undoStack.push(dupCanvas(this));
  this.modified = true;
  return this;
};

ImageEditor.prototype.revertChanges = function ()
{
  var c = this.undoStack.curr();
  c && copyFromCanvas(this, c);
  return this;
};

/* ********************************************************************** */
/* Undo */
/* ********************************************************************** */

ImageEditor.prototype.clearUndo = function ()
{
  this.undoStack.clear();
  return this;
};

ImageEditor.prototype.canUndo = function ()
{
  return this.undoStack.hasPrev();
};

ImageEditor.prototype.canRedo = function ()
{
  return this.undoStack.hasNext();
};

ImageEditor.prototype.undo = function ()
{
  var c = this.undoStack.prev();
  if (!c) return;
  copyFromCanvas(this, c);
  this.modified = true;
  return this;
};

ImageEditor.prototype.redo = function ()
{
  var c = this.undoStack.next();
  if (!c) return;
  copyFromCanvas(this, c);
  this.modified = true;
  return this;
};

/* ********************************************************************** */
/* Image Processing */
/* ********************************************************************** */

ImageEditor.prototype.getHistogram = function getHistogram (channel, ondone)
{
  function hist(hist)
  {
    ondone && ondone(hist);
  }
  this.processImage({
    type: "histogram",
    channel: channel,
    ignoreResult: true
  }, hist);
};

ImageEditor.prototype.resize = function resize (w, h, ondone)
{
  function size(img)
  {
    copyFromData(this, img);
    ondone && ondone();
  }
  var c = newCanvas(w, h);
  this.processImage({
    type: "resize",
    newimg: c.getContext("2d").getImageData(0, 0, c.w, c.h),
    neww: c.w,
    newh: c.h,
    ignoreResult: true
  }, size.bind(this));
};

ImageEditor.prototype.processMap = function processMap (mapR, mapG, mapB, mapA, pxtype, ondone)
{
  this.processImage({
    type: "channel",
    maps: [ mapR, mapG, mapB, mapA ],
    pxtype: pxtype
  }, ondone);
};

ImageEditor.prototype.processExprs = function processExprs (exR, exG, exB, exA, vars, pxtype, ondone)
{
  this.processImage({
    type: "channel",
    exprs: [ exR, exG, exB, exA ],
    vars: vars,
    pxtype: pxtype
  }, ondone);
};

ImageEditor.prototype.processExpr = function processExpr (expr, vars, ondone)
{
  this.processImage({
    type: "pixel",
    expr: expr,
    vars: vars
  }, ondone);
};

ImageEditor.prototype.processFunc = function processFunc (fn, vars, ondone)
{
  this.processImage({
    type: "pixel",
    fn: fn,
    vars: vars
  }, ondone);
};

ImageEditor.prototype.processFilter = function processFilter (filter, alpha, ondone)
{
  this.processImage({
    type: "filter",
    filter: filter,
    alpha: alpha
  }, ondone);
};

ImageEditor.prototype.processImage = function processImage (data, ondone)
{
  var progress = this.onProgress;
  var ctxt = this.ctxt;
  var ignore = data.ignoreResult;
  data.img = ctxt.getImageData(0, 0, this.w, this.h);
  data.w = this.w;
  data.h = this.h;

  var w = new Worker("worker.js");

  function workerMessage(event)
  {
    if ("error" in event.data) {
      this.onError.apply(this, event.data.error);
      w.terminate();
      return;
    }
    if ("debug" in event.data) {
      console.log("worker:", event.data.debug);
      return;
    }
    progress(event.data.progress);
    if (event.data.progress >= 1) {
      ignore || ctxt.putImageData(event.data.result, 0, 0);
      ondone && ondone(event.data.result);
    }
  }
  w.addEventListener("message", workerMessage, false);
  w.postMessage(data);
};

/* ********************************************************************** */
/* Load/Save */
/* ********************************************************************** */

function loadImage(url, ondone)
{
  var img = $$("img");

  // img load progress is UNTESTED - couldn't find a browser that handled them
  img.onloadstart = this.onProgress.bind(this, 0);
  img.onprogress = function (e) {
    this.onProgress(e.lengthComputable ? e.loaded / e.total : -1);
  };
  img.onloadend = this.onProgress.bind(this, 1);

  img.onerror = this.onError.bind(this, "errorImageLoad", url);
  img.onload = function () { ondone(img); };
  img.src = url;
}

ImageEditor.prototype.loadImage = function (url, ondone)
{
  function cbLoad(img)
  {
    this.src = img.src;
    copyFromImage(this, img);
    this.modified = false;
    ondone && ondone();
  }
  loadImage(url, cbLoad.bind(this));
};

var exts = { // sync this with the OptionPanel menulist: {value=mime}
  "png": ".png",
  "jpeg": ".jpg",
  "bmp": ".bmp"
};

function saveToFile(elem, srcname, suffix, fmt)
{
  fmt || (fmt = "png");
  var name = srcname.substr(srcname.lastIndexOf("/") + 1)
                    .replace(/(\.[^\.]*)?$/, suffix + exts[fmt]);
  elem.toBlob(function (blob) {
    saveAs(blob, name);
  }, "image/" + fmt);
}

ImageEditor.prototype.saveToFile = function (fmt)
{
  saveToFile(this.elem, this.src, "", fmt);
};

/* ********************************************************************** */
/* Load/Save Alpha */
/* ********************************************************************** */

ImageEditor.prototype.loadChannelImage = function (url, channel, ondone)
{
  function load(img)
  {
    if (img.width !== this.w || img.height !== this.h) {
      this.onError("errorImageChannel");
      return;
    }
    var elem = newCanvas(this.w, this.h, img),
        ctxt = elem.getContext("2d"),
        data = ctxt.getImageData(0, 0, this.w, this.h);

    this.modified = true;
    this.processImage({
      type: "loadChannel",
      channel: channel || "a",
      fromimg: data
    }, ondone);
  }
  loadImage(url, load.bind(this));
};

/* ********************************************************************** */
/* ********************************************************************** */

})();
