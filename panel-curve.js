/* ********************************************************************** */
/* ********************************************************************** */

function _CurvePanel(data)
{
  this.curveData = data;
  var update = _CurvePanel.updateGraph.bind(this);
  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, data.title, [
      this.graph = new zuiGraph(128),
      new zuiSpacer(),
      new zuiMenuListGroup([
        this.spin0 = new zuiMenuList(data.name0, update),
        this.spin1 = new zuiMenuList(data.name1, update),
        this.spin2 = new zuiMenuList(data.name2, update),
        this.spin3 = new zuiMenuList("A", update),
        new zuiToggle("Lock " + data.name + " graphs", zuiNop, data.locked)
      ]),
      new zuiButton("Execute", _CurvePanel.cbExec.bind(this))
    ],
    _CurvePanel.cbOpen.bind(this),
    _CurvePanel.cbClose.bind(this)
  );
}

_CurvePanel.cbExec = function ()
{
  gEditor.revertChanges();
  var ex0 = this.spin0.elem.value,
      ex1 = this.spin1.elem.value,
      ex2 = this.spin2.elem.value,
      ex3 = this.spin3.elem.value;
  gEditor.processExprs(ex0, ex1, ex2, ex3, {}, this.curveData.pixelType);
};

_CurvePanel.cbOpen = function ()
{
  this.spin0.setList(options.exprs);
  this.spin1.setList(options.exprs);
  this.spin2.setList(options.exprs);
  this.spin3.setList(options.exprs);
  this.spin0.focus();
  _CurvePanel.updateGraph.call(this);
};

_CurvePanel.cbClose = function (accept)
{
  accept ? gEditor.commitChanges() : gEditor.revertChanges();
};

_CurvePanel.updateGraph = function ()
{
  var map0 = ColorMap_fromExpr(this.spin0.elem.value),
      map1 = ColorMap_fromExpr(this.spin1.elem.value),
      map2 = ColorMap_fromExpr(this.spin2.elem.value),
      map3 = ColorMap_fromExpr(this.spin3.elem.value);
  this.graph.clear()
            .drawMap(map0, "#f00")
            .drawMap(map1, "#0c0")
            .drawMap(map2, "#00f")
            .drawMap(map3, "#ccc");
};

/* ********************************************************************** */
/* ********************************************************************** */

function CurveRGBPanel()
{
  _CurvePanel.call(this, {
    title: "RGB Curves",
    name: "RGB", name0: "R", name1: "G", name2: "B",
    locked: true,
    pixelType: "rgb"
  });
}

function CurveHSVPanel()
{
  _CurvePanel.call(this, {
    title: "HSV Curves",
    name: "HSV", name0: "H", name1: "S", name2: "V",
    maplen0: 360, maplen1: 100, maplen2: 100,
    locked: false,
    pixelType: "hsv"
  });
}

function CurveYCbCrPanel()
{
  _CurvePanel.call(this, {
    title: "YCbCr Curves",
    name: "YCbCr", name0: "Y", name1: "Cb", name2: "Cr",
    locked: false,
    pixelType: "ycbcr"
  });
}

/* ********************************************************************** */
/* ********************************************************************** */
