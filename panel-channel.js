/* ********************************************************************** */
/* ********************************************************************** */

function ChannelPanel()
{
  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, "Channel", [
      this.channel = new zuiRadioGroup("", zuiNop, [
        [ "Alpha",            "{V:=A,A:=255}", true ],
        [ "Red",              "{V:=R,A:=255}" ],
        [ "Green",            "{V:=G,A:=255}" ],
        [ "Blue",             "{V:=B,A:=255}" ],
        [ "Luma (Y)",         "{V:=Y,A:=255}" ],
        [ "Chroma Blue (Cb)", "{V:=CB,A:=255}" ],
        [ "Chroma Red (Cr)",  "{V:=CR,A:=255}" ],
        [ "Hue",              "{V:=H/359*255,A:=255}" ],
        [ "Saturation",       "{V:=S/99*255,A:=255}" ],
        [ "Volume",           "{V:=V/99*255,A:=255}" ]
      ]),
      new zuiButton("Execute", ChannelPanel.cbExec.bind(this))
    ],
    ChannelPanel.cbOpen.bind(this),
    ChannelPanel.cbClose.bind(this)
  );
}

ChannelPanel.cbExec = function ()
{
  gEditor.revertChanges();
  gEditor.processExpr(this.channel.getSelected());
};

ChannelPanel.cbOpen = function ()
{
  this.channel.focus();
};

ChannelPanel.cbClose = function (accept)
{
  accept ? gEditor.commitChanges() : gEditor.revertChanges();
};

/* ********************************************************************** */
/* ********************************************************************** */

function LoadChannelPanel()
{
  $mixin(this, zuiDialog.prototype);
  zuiDialog.call(this, "Load Channel", [
      this.channel = new zuiRadioGroup("", zuiNop, [
        [ "Alpha",            "a", true ],
        [ "Red",              "r" ],
        [ "Green",            "g" ],
        [ "Blue",             "b" ],
        [ "Luma (Y)",         "y" ],
        [ "Chroma Blue (Cb)", "cb" ],
        [ "Chroma Red (Cr)",  "cr" ],
        [ "Hue",              "h" ],
        [ "Saturation",       "s" ],
        [ "Volume",           "v" ]
      ]),
      new zuiButton("Load File", LoadChannelPanel.cbExec.bind(this))
    ],
    LoadChannelPanel.cbOpen.bind(this),
    LoadChannelPanel.cbClose.bind(this)
  );
}

LoadChannelPanel.cbExec = function ()
{
  var ch = this.channel.getSelected();
  gEditor.revertChanges();
  doFileInput(function (url) {
    gEditor.loadChannelImage(url, ch);
  });
};

LoadChannelPanel.cbOpen = function ()
{
  this.channel.focus();
};

LoadChannelPanel.cbClose = function (accept)
{
  accept ? gEditor.commitChanges() : gEditor.revertChanges();
};

/* ********************************************************************** */
/* ********************************************************************** */
