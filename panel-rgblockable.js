/* ********************************************************************** */
/* ********************************************************************** */

function _DialogRGBLock(data) //data={title,min,max,step,value,locked,open,close,exec}
{
  this.lockdata = data;
  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, data.title, [
      new zuiSpinnerGroup([
        this.spinR = new zuiSpinner("R", zuiNop, data),
        this.spinG = new zuiSpinner("G", zuiNop, data),
        this.spinB = new zuiSpinner("B", zuiNop, data),
        this.spinA = new zuiSpinner("A", zuiNop, data),
        new zuiToggle("Lock RGB scales", zuiNop, data.locked)
      ]),
      new zuiButton("Execute", _DialogRGBLock.cbExec.bind(this, data.exec.bind(this)))
    ],
    _DialogRGBLock.cbOpen.bind(this),
    _DialogRGBLock.cbClose.bind(this)
  );
}

_DialogRGBLock.cbExec = function (callback)
{
  gEditor.revertChanges();
  var r = +this.spinR.elem.value,
      g = +this.spinG.elem.value,
      b = +this.spinB.elem.value,
      a = +this.spinA.elem.value;
  callback(r, g, b, a);
};

_DialogRGBLock.cbOpen = function ()
{
  this.spinR.elem.value = this.lockdata.value;
  this.spinG.elem.value = this.lockdata.value;
  this.spinB.elem.value = this.lockdata.value;
  this.spinA.elem.value = this.lockdata.value;
  this.spinR.focus();
};

_DialogRGBLock.cbClose = function (accept)
{
  accept ? gEditor.commitChanges() : gEditor.revertChanges();
};

/* ********************************************************************** */
/* ********************************************************************** */

function _execExpr(r, g, b, a)
{
  var expr = this.lockdata.expr,
      convert = this.lockdata.convert,
      mapR = ColorMap_fromExpr(expr, { N: convert(r) }),
      mapG = ColorMap_fromExpr(expr, { N: convert(g) }),
      mapB = ColorMap_fromExpr(expr, { N: convert(b) }),
      mapA = ColorMap_fromExpr(expr, { N: convert(a) });
  gEditor.processMap(mapR, mapG, mapB, mapA);
}

function GammaPanel()
{
  _DialogRGBLock.call(this, {
    title: "Gamma",
    locked: true,
    min: -100, max: 100, step: 5, value: 0,
    convert: function (n) {
      n = -n / 100;
      return 1 + ((n > 0) ? 10 * Math.pow(n, 3) : n);
    },
    expr: "pow(x,N)",
    exec: _execExpr
  });
}

function ContrastPanel()
{
  _DialogRGBLock.call(this, {
    title: "Contrast",
    locked: true,
    min: -128, max: 128, step: 8, value: 0,
    convert: function (n) { return ((n + 128) / 128); },
    expr: "((x-.5)*N)+.5",
    exec: _execExpr
  });
}

function BalancePanel()
{
  _DialogRGBLock.call(this, {
    title: "Balance",
    locked: false,
    min: -255, max: 255, step: 8, value: 0,
    convert: function (n) { return (n / 255); },
    expr: "x+N",
    exec: _execExpr
  });
}

function ExpPanel()
{
  _DialogRGBLock.call(this, {
    title: "Exp",
    locked: true,
    min: 0, max: 10, step: 1, value: 0,
    convert: function (n) { return n; },
    expr: "N==0?(x):exp(x*N-1)/N",
    exec: _execExpr
  });
}

function LogPanel()
{
  _DialogRGBLock.call(this, {
    title: "Logarithm",
    locked: true,
    min: 0, max: 200, step: 5, value: 0,
    convert: function (n) { return n; },
    expr: "N==0?(x):log(1+x*N)/log(1+N)",
    exec: _execExpr
  });
}

function SinehPanel()
{
  _DialogRGBLock.call(this, {
    title: "SineH",
    locked: true,
    min: 0, max: 200, step: 5, value: 0,
    convert: function (n) { return n; },
    expr: "N==0?(x):asinh(x*N)/asinh(N)",
    exec: _execExpr
  });
}

/* ********************************************************************** */
/* ********************************************************************** */
