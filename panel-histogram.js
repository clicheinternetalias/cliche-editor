/* ********************************************************************** */
/* ********************************************************************** */

function HistogramPanel()
{
  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, "Histogram", [
      this.graph = new zuiGraph(192),
      this.menu = new zuiMenuList("", HistogramPanel.cbMenu.bind(this)),
      this.alpha = new zuiToggle("Include Alpha channel.", zuiNop),
      new zuiSpacer("big"),
      new zuiButton("Execute", HistogramPanel.cbExec.bind(this))
    ],
    HistogramPanel.cbOpen.bind(this),
    HistogramPanel.cbClose.bind(this)
  );
}

HistogramPanel.cbExec = function ()
{
  var mapto = ColorMap_fromExpr(this.menu.elem.value);
  var eq = Histogram_getCumulativeMap(this.histOrig);
  var map = Histogram_getMatchingMap(eq, mapto);
  gEditor.revertChanges();
  gEditor.processMap(map, map, map, !!this.alpha.elem.value ? map : null,
                     "rgb", HistogramPanel.cbUpdate.bind(this));
};

HistogramPanel.cbMenu = function ()
{
  HistogramPanel.drawGraph.call(this);
};

HistogramPanel.cbOpen = function ()
{
  this.histOrig = null;
  this.menu.setList(options.exprs);
  this.menu.focus();
  HistogramPanel.cbUpdate.call(this);
};

HistogramPanel.cbClose = function (accept)
{
  accept ? gEditor.commitChanges() : gEditor.revertChanges();
};

HistogramPanel.cbUpdate = function ()
{
  this.graph.clear();
  gEditor.getHistogram("y", HistogramPanel.drawGraph.bind(this));
};

/* ********************************************************************** */
/* ********************************************************************** */

HistogramPanel.drawGraph = function (hist)
{
  var map = ColorMap_fromExpr(this.menu.elem.value);
  hist && (this.histCur = hist);
  this.histOrig || (this.histOrig = this.histCur);
  this.graph.clear()
            .drawHistogram(Histogram_getScaledMap(this.histCur), "#000")
            .drawMap(Histogram_getCumulativeMap(this.histCur), "#ccc")
            .drawMap(map, "#88f");
};

/* ********************************************************************** */
/* ********************************************************************** */
