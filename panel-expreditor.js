/* ********************************************************************** */
/* ********************************************************************** */

function ExprEditorPanel()
{
  this.size = 128;
  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, "Expr Editor", [
      this.graph = new zuiGraph(this.size),
      new zuiSpacer(),
      this.name = new zuiText("Name", ExprEditorPanel.cbName.bind(this)),
      new zuiSpacer(),
      this.expr = new zuiText("Expr", ExprEditorPanel.cbExpr.bind(this)),
      new zuiSpacer(),
      this.error = new zuiError(),
      new zuiSpacer(),
      this.menu = new zuiMenuListEditor("", ExprEditorPanel.cbMenu.bind(this), {
        newItem: { label: "New Expr", value: "x" }
      })
    ],
    ExprEditorPanel.cbOpen.bind(this),
    ExprEditorPanel.cbClose.bind(this)
  );
  this.menu.elem.size = 7;
}

/* ********************************************************************** */
/* ********************************************************************** */

ExprEditorPanel.cbName = function (v)
{
  this.menu.setItem(this.current.index,
                    this.current.label = v,
                    this.current.value);
};

ExprEditorPanel.cbExpr = function (v)
{
  this.menu.setItem(this.current.index,
                    this.current.label,
                    this.current.value = v);
  this.clearPreview();
  var msg = "";

  try { this.graph.drawMap(ColorMap_fromExpr(v)); }
  catch (e) { msg = e.toString(); }
  finally { $$(this.error.elem, [[ msg ]]); }
};

ExprEditorPanel.cbMenu = function (v)
{
  this.current = this.menu.getItem();
  if (!this.current) return;
  this.name.setValue(this.current.label);
  this.expr.setValue(this.current.value);
};

ExprEditorPanel.cbOpen = function ()
{
  this.menu.setList(options.exprs);
  this.menu.select(0);
  this.menu.focus();
};

ExprEditorPanel.cbClose = function (accept)
{
  if (!accept) return;
  options.exprs = this.menu.getList();
  commitOptions();
};

/* ********************************************************************** */
/* ********************************************************************** */

ExprEditorPanel.prototype.clearPreview = function ()
{
  this.graph.clear();
  var ctxt = this.graph.elem.getContext("2d");
  var x = this.size / 2;
  ctxt.strokeStyle = "#ccc";
  ctxt.beginPath();
  ctxt.moveTo(0, 0);         ctxt.lineTo(this.size, this.size);
  ctxt.moveTo(this.size, 0); ctxt.lineTo(0, this.size);
  ctxt.moveTo(0, x);         ctxt.lineTo(this.size, x);
  ctxt.moveTo(x, 0);         ctxt.lineTo(x, this.size);
  ctxt.stroke();
};

/* ********************************************************************** */
/* ********************************************************************** */
