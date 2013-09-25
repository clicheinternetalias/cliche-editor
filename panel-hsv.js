/* ********************************************************************** */
/* ********************************************************************** */

function HSVPanel()
{
  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, "HSV", [
      new zuiSpinnerGroup([
        this.spinH = new zuiSpinner("H", zuiNop, { min: -360, max: 360, step: 15, value: 0 }),
        this.spinS = new zuiSpinner("S", zuiNop, { min: -100, max: 100, step:  5, value: 0 }),
        this.spinV = new zuiSpinner("V", zuiNop, { min: -100, max: 100, step:  5, value: 0 }),
        this.spinA = new zuiSpinner("A", zuiNop, { min: -255, max: 255, step:  8, value: 0 })
      ]),
      new zuiButton("Execute", HSVPanel.cbExec.bind(this))
    ],
    HSVPanel.cbOpen.bind(this),
    HSVPanel.cbClose.bind(this)
  );
}

HSVPanel.cbExec = function ()
{
  gEditor.revertChanges();
  var vars = {
    h: +this.spinH.elem.value,
    s: +this.spinS.elem.value,
    v: +this.spinV.elem.value,
    a: +this.spinA.elem.value
  };
  (vars.h < 0) && (vars.h += 360);
  var pixel ="\
    var hsv = Color_hsvFromRGB(vars.R, vars.G, vars.B, vars.A);\
    return Color_rgbFromHSV(hsv.H + vars.h, hsv.S + vars.s,\
                            hsv.V + vars.v, hsv.A + vars.a);";
  gEditor.processFunc(pixel, vars);
};

HSVPanel.cbOpen = function ()
{
  this.spinH.elem.value = 0;
  this.spinS.elem.value = 0;
  this.spinV.elem.value = 0;
  this.spinA.elem.value = 0;
  this.spinH.focus();
};

HSVPanel.cbClose = function (accept)
{
  accept ? gEditor.commitChanges() : gEditor.revertChanges();
};

/* ********************************************************************** */
/* ********************************************************************** */

function YCbCrPanel()
{
  var data = { min: -255, max: 255, step: 8, value: 0 };
  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, "YCbCr", [
      new zuiSpinnerGroup([
        this.spinY  = new zuiSpinner("Y",  zuiNop, data),
        this.spinCb = new zuiSpinner("Cb", zuiNop, data),
        this.spinCr = new zuiSpinner("Cr", zuiNop, data),
        this.spinA  = new zuiSpinner("A",  zuiNop, data)
      ]),
      new zuiButton("Execute", YCbCrPanel.cbExec.bind(this))
    ],
    YCbCrPanel.cbOpen.bind(this),
    YCbCrPanel.cbClose.bind(this)
  );
}

YCbCrPanel.cbExec = function ()
{
  gEditor.revertChanges();
  var vars = {
    y:  +this.spinY.elem.value,
    cb: +this.spinCb.elem.value,
    cr: +this.spinCr.elem.value,
    a:  +this.spinA.elem.value
  };
  var pixel = "\
    var ycc = Color_ycbcrFromRGB(vars.R, vars.G, vars.B, vars.A);\
    return Color_rgbFromYCbCr(ycc.Y + vars.y, ycc.CB + vars.cb,\
                              ycc.CR + vars.cr, ycc.A + vars.a);";
  gEditor.processFunc(pixel, vars);
};

YCbCrPanel.cbOpen = function ()
{
  this.spinY.elem.value  = 0;
  this.spinCb.elem.value = 0;
  this.spinCr.elem.value = 0;
  this.spinA.elem.value  = 0;
  this.spinY.focus();
};

YCbCrPanel.cbClose = function (accept)
{
  accept ? gEditor.commitChanges() : gEditor.revertChanges();
};

/* ********************************************************************** */
/* ********************************************************************** */
