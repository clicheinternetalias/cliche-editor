/* ********************************************************************** */
/* ********************************************************************** */

function OptionPanel()
{
  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, "Options", [
      this.save = new zuiRadioGroup("Save Images as:", zuiNop, [
        [ "PNG", "png" ],
        [ "JPEG", "jpeg" ],
        [ "BMP", "bmp" ]
      ]),
      new zuiButton("Restore Defaults", OptionPanel.cbDefaults.bind(this))
    ],
    OptionPanel.cbOpen.bind(this),
    OptionPanel.cbClose.bind(this)
  );
}

OptionPanel.cbDefaults = function ()
{
  if (!window.confirm(messages.restoreDefaults))
    return;
  revertOptions();
};

OptionPanel.cbOpen = function ()
{
  this.save.setSelected(options.saveFormat);
  this.save.focus();
};

OptionPanel.cbClose = function (accept)
{
  if (!accept) return;
  options.saveFormat = this.save.getSelected();
  commitOptions();
};

/* ********************************************************************** */
/* ********************************************************************** */

function MainPanel()
{
  this.panels = [
    (this.gammaPanel = new GammaPanel()).root,
    (this.balancePanel = new BalancePanel()).root,
    (this.contrastPanel = new ContrastPanel()).root,
    (this.hsvPanel = new HSVPanel()).root,
    (this.ycbcrPanel = new YCbCrPanel()).root,
    (this.curveRGBPanel = new CurveRGBPanel()).root,
    (this.curveHSVPanel = new CurveHSVPanel()).root,
    (this.curveYCbCrPanel = new CurveYCbCrPanel()).root,
    (this.expPanel = new ExpPanel()).root,
    (this.logPanel = new LogPanel()).root,
    (this.sinehPanel = new SinehPanel()).root,
    (this.greyscalePanel = new GreyscalePanel()).root,
    (this.filterPanel = new FilterPanel()).root,
    (this.histogramPanel = new HistogramPanel()).root,
    (this.channelPanel = new ChannelPanel()).root,
    (this.loadChannelPanel = new LoadChannelPanel()).root,
    (this.resizePanel = new ResizePanel()).root,
    (this.optionPanel = new OptionPanel()).root,
    (this.exprEditorPanel = new ExprEditorPanel()).root,
    (this.matrixEditorPanel = new MatrixEditorPanel()).root
  ];

  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, "Image Editor", [
    new zuiGrid([
      [
        [
          new zuiButton("Open", MainPanel.cmdOpen.bind(this)),
          new zuiButton("Reload", MainPanel.cmdReload.bind(this)),
          new zuiButton("Save", MainPanel.cmdSave.bind(this)),
          new zuiButton("Options", MainPanel.cmdPanel.bind(this, this.optionPanel))
        ], [
          new zuiButton("Undo", MainPanel.cmdUndo.bind(this)),
          new zuiButton("Redo", MainPanel.cmdRedo.bind(this)),
//          new zuiButton("Clear Undo", MainPanel.cmdClearUndo.bind(this)),
          new zuiButton("Expr Editor", MainPanel.cmdPanel.bind(this, this.exprEditorPanel)),
          new zuiButton("Filter Editor", MainPanel.cmdPanel.bind(this, this.matrixEditorPanel))
        ]
      ], [
        [ new zuiSpacer("big") ], [ new zuiSpacer("big") ]
      ], [
        [
          new zuiButton("Resize", MainPanel.cmdPanel.bind(this, this.resizePanel)),
          new zuiButton("RGB", MainPanel.cmdPanel.bind(this, this.balancePanel)),
          new zuiButton("HSV", MainPanel.cmdPanel.bind(this, this.hsvPanel)),
          new zuiButton("YCbCr", MainPanel.cmdPanel.bind(this, this.ycbcrPanel)),
          new zuiButton("RGB Expr", MainPanel.cmdPanel.bind(this, this.curveRGBPanel)),
          new zuiButton("HSV Expr", MainPanel.cmdPanel.bind(this, this.curveHSVPanel)),
          new zuiButton("YCbCr Expr", MainPanel.cmdPanel.bind(this, this.curveYCbCrPanel)),
          new zuiButton("Channel", MainPanel.cmdPanel.bind(this, this.channelPanel)),
          new zuiButton("Load Channel", MainPanel.cmdPanel.bind(this, this.loadChannelPanel))
        ], [
          new zuiButton("Histogram", MainPanel.cmdPanel.bind(this, this.histogramPanel)),
          new zuiButton("Filters", MainPanel.cmdPanel.bind(this, this.filterPanel)),
          new zuiButton("Gamma", MainPanel.cmdPanel.bind(this, this.gammaPanel)),
          new zuiButton("Contrast", MainPanel.cmdPanel.bind(this, this.contrastPanel)),
          new zuiButton("Exp", MainPanel.cmdPanel.bind(this, this.expPanel)),
          new zuiButton("Log", MainPanel.cmdPanel.bind(this, this.logPanel)),
          new zuiButton("SineH", MainPanel.cmdPanel.bind(this, this.sinehPanel)),
          new zuiButton("Greyscale", MainPanel.cmdPanel.bind(this, this.greyscalePanel)),
          new zuiButton("Negative!", MainPanel.cmdNegative.bind(this))
        ]
      ]
    ])
  ]);
}

/* ********************************************************************** */
/* ********************************************************************** */

MainPanel.cmdPanel = function (panel)
{
  panel.open();
};

MainPanel.cmdSave = function ()
{
  gEditor.saveToFile(options.saveFormat);
};

MainPanel.cmdOpen = function ()
{
  if (gEditor.modified && !window.confirm(messages.openImage))
    return;
  doFileInput(function (url) {
    loadImageFromUrl(url);
  });
};

MainPanel.cmdReload = function ()
{
  if (gEditor.modified && !window.confirm(messages.reloadImage))
    return;
  loadImageFromUrl(gEditor.src);
};

/* ********************************************************************** */
/* ********************************************************************** */

MainPanel.cmdUndo = function ()
{
  gEditor.undo();
};

MainPanel.cmdRedo = function ()
{
  gEditor.redo();
};

MainPanel.cmdClearUndo = function ()
{
  if (!window.confirm(messages.clearUndo))
    return;
  gEditor.clearUndo();
};

/* ********************************************************************** */
/* ********************************************************************** */

MainPanel.cmdNegative = function ()
{
  gEditor.processExprs("1-x", "1-x", "1-x", null, {}, "rgb", function () {
    gEditor.commitChanges();
  });
};

/* ********************************************************************** */
/* ********************************************************************** */
