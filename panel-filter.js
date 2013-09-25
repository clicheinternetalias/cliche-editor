/* ********************************************************************** */
/* ********************************************************************** */

function FilterPanel()
{
  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, "Filters", [
      this.display = new zuiGroupBox("", []),
      this.menu = new zuiMenuList("", FilterPanel.cbUpdate.bind(this)),
      this.alpha = new zuiToggle("Include Alpha channel.", zuiNop),
      new zuiSpacer("big"),
      new zuiButton("Execute", FilterPanel.cbExec.bind(this))
    ],
    FilterPanel.cbOpen.bind(this),
    FilterPanel.cbClose.bind(this)
  );
}

FilterPanel.cbExec = function ()
{
  gEditor.revertChanges();
  gEditor.processFilter(splitFilterString(this.menu.elem.value),
                        !!this.alpha.elem.value);
};

FilterPanel.cbOpen = function ()
{
  this.menu.setList(options.filters);
  this.menu.focus();
};

FilterPanel.cbClose = function (accept)
{
  accept ? gEditor.commitChanges() : gEditor.revertChanges();
};

FilterPanel.cbUpdate = function ()
{
  var f = splitFilterString(this.menu.elem.value),
      w = Math.sqrt(f.matrix.length) | 0,
      a = [], i, d;
  for (i = 0; i < w; ++i)
    a.push(f.matrix.slice(i * w, i * w + w));
  d = new zuiGrid(a);
  $$(this.display.elem, [[ d.root ]]);
  this.display.label.innerHTML = "Divisor: " + f.divisor + "<br>Bias: " + f.bias;
};

/* ********************************************************************** */
/* ********************************************************************** */
