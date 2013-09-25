/* ********************************************************************** */
/* ********************************************************************** */

function MatrixEditorPanel()
{
  var update = MatrixEditorPanel.cbUpdate.bind(this);
  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, "Filters", [
      this.name = new zuiText("Name", update),
      this.mtx = new zuiTextBox(update),
      this.div = new zuiSpinner("Div", update),
      this.bias = new zuiSpinner("Bias", update),
      new zuiSpacer(),
      this.error = new zuiError(),
      new zuiSpacer(),
      this.menu = new zuiMenuListEditor("", MatrixEditorPanel.cbMenu.bind(this), {
        newItem: { label: "Custom Filter", value: "0,0,0,0,1,0,0,0,0,1,0" }
      })
    ],
    MatrixEditorPanel.cbOpen.bind(this),
    MatrixEditorPanel.cbClose.bind(this)
  );
  this.menu.elem.size = 7;
}

/* ********************************************************************** */
/* ********************************************************************** */

MatrixEditorPanel.cbUpdate = function ()
{
  var label = this.name.elem.value,
      divisor = +this.div.elem.value,
      bias = +this.bias.elem.value,
      mtx;

  $$(this.error.elem, [[ "" ]]);

  if (divisor === 0) {
    $$(this.error.elem, [ "Divisor cannot be zero." ]);
    return;
  }
  mtx = MatrixEditorPanel.parseMatrixFromString(this.mtx.elem.value);
  if (!mtx) {
    $$(this.error.elem, [ "Invalid number of matrix elements. Must be 9, 25, or 49." ]);
    return;
  }
  mtx.push(divisor, bias);
  this.menu.setItem(this.current.index, label, mtx.join(","));
};

MatrixEditorPanel.cbMenu = function ()
{
  this.current = this.menu.getItem();
  var f = splitFilterString(this.current.value),
      txt = MatrixEditorPanel.editorStringFromMatrix(f.matrix);
  this.name.elem.value = this.current.label;
  this.mtx.elem.value = txt;
  this.div.elem.value = f.divisor;
  this.bias.elem.value = f.bias;
};

MatrixEditorPanel.cbOpen = function ()
{
  $$(this.error.elem, [[ "" ]]);
  this.menu.setList(options.filters);
  this.menu.select(0);
  this.menu.focus();
};

MatrixEditorPanel.cbClose = function (accept)
{
  if (!accept) return;
  options.filters = this.menu.getList();
  commitOptions();
};

/* ********************************************************************** */
/* ********************************************************************** */

MatrixEditorPanel.parseMatrixFromString = function (s)
{
  var m = [], i, tok, tokens = s.match(/\s+|[-.\d]+|./g);
  for (i = 0; i < tokens.length; ++i) {
    tok = tokens[i];
    /^[-.\d]/.test(tok) && m.push(+tok);
  }
  return (m.length === 9 || m.length === 25 || m.length === 49) ? m : null;
};

MatrixEditorPanel.editorStringFromMatrix = function (m)
{
  var w = Math.sqrt(m.length) | 0;
  return m.map(function (v, i) {
    v += "";
    v = Array(Math.max(4 - v.length + 1, 1)).join(" ") + v;
    return v + ((i+1) % w ? " " : "\n");
  }).join("");
};

/* ********************************************************************** */
/* ********************************************************************** */
