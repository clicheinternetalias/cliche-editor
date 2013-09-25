/* ********************************************************************** */
/* ********************************************************************** */

function ResizePanel()
{
  var data = { min: 0, max: 65535, step: 100 };
  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, "Resize", [
      this.width = new zuiSpinner("W", ResizePanel.cbUpdate.bind(this, "w"), data),
      this.height = new zuiSpinner("H", ResizePanel.cbUpdate.bind(this, "h"), data),
      this.aspect = new zuiToggle("Maintain aspect ratio.", ResizePanel.cbUpdate.bind(this), true),
      new zuiSpacer("big"),
      new zuiButton("Execute", ResizePanel.cbExec.bind(this))
    ],
    ResizePanel.cbOpen.bind(this),
    ResizePanel.cbClose.bind(this)
  );
}

/* ********************************************************************** */
/* ********************************************************************** */

ResizePanel.cbUpdate = function (recent)
{
  if (!this.aspect.elem.value) return;
  this.recent = recent || this.recent || "w";
  if (this.recent === "w")
    this.height.elem.value = Math.round(+this.width.elem.value / this.ratio);
  else
    this.width.elem.value = Math.round(+this.height.elem.value * this.ratio);
};

ResizePanel.cbExec = function (v)
{
  gEditor.revertChanges();
  gEditor.resize(+this.width.elem.value, +this.height.elem.value);
};

ResizePanel.cbOpen = function ()
{
  this.width.elem.value = gEditor.w;
  this.height.elem.value = gEditor.h;
  this.ratio = gEditor.w / gEditor.h;
  this.width.focus();
};

ResizePanel.cbClose = function (accept)
{
  if (!accept) return;
  accept ? gEditor.commitChanges() : gEditor.revertChanges();
};

/* ********************************************************************** */
/* ********************************************************************** */
