/* ********************************************************************** */
/* ********************************************************************** */

function GreyscalePanel()
{
  this.weightData = { min: -1, max: 1, step: .01, value: 0 };
  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, "Greyscale", [
      this.method = new zuiRadioGroup("Method:", zuiNop, [
        [ "Lightness", "{V:=(max(R,G,B)+min(R,G,B))/2}", true ],
        [ "Average", "{V:=(R+G+B)/3}" ],
        [ "Maximum", "{V:=max(R,G,B)}" ],
        [ "Minimum", "{V:=min(R,G,B)}" ],
        [ "Photoshop", "{V:=sqrt(.241*pow(R,2)+.691*pow(G,2)+.068*pow(B,2))}" ],
        [ "Weighted", "{V:=(WR*R + WG*G + WB*B)}" ]
      ]),
      new zuiGroupBox("Weights:", [
        this.weightR = new zuiSpinner("R", zuiNop, this.weightData),
        this.weightG = new zuiSpinner("G", zuiNop, this.weightData),
        this.weightB = new zuiSpinner("B", zuiNop, this.weightData)
      ]),
      new zuiButton("Execute", GreyscalePanel.cbExec.bind(this))
    ],
    GreyscalePanel.cbOpen.bind(this),
    GreyscalePanel.cbClose.bind(this)
  );
}

GreyscalePanel.cbExec = function ()
{
  gEditor.revertChanges();
  var expr = this.method.getSelected(),
      vars = {
    WR: this.weightR.elem.value,
    WG: this.weightG.elem.value,
    WB: this.weightB.elem.value
  };
  gEditor.processExpr(expr, vars);
};

GreyscalePanel.cbOpen = function ()
{
  // sRGB/Rec709: 0.2126, 0.7152, 0.0722
  // YIQ, YUV, et al: 0.299, 0.587, 0.114
  // CIE XYZitu (D65): 0.222, 0.707, 0.071
  // CIE XYZccir709 (D65): 0.213, 0.715, 0.072
  this.weightR.elem.value = 0.2126;
  this.weightG.elem.value = 0.7152;
  this.weightB.elem.value = 0.0722;
  this.method.focus();
};

GreyscalePanel.cbClose = function (accept)
{
  accept ? gEditor.commitChanges() : gEditor.revertChanges();
};

/* ********************************************************************** */
/* ********************************************************************** */
