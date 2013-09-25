/* ********************************************************************** */
/* ********************************************************************** */

function zuiNop() {}

if (document.createEvent) {
  function _zuiFireEvent(elem, name)
  {
    var e = document.createEvent("HTMLEvents");
    e.initEvent("change", false, true);
    elem.dispatchEvent(e);
  }
} else if (document.body.fireEvent) {
  function _zuiFireEvent(elem, name)
  {
    elem.fireEvent && elem.fireEvent("on" + name);
  }
}

function _zuiDecode(str)
{
  _zuiDecode.div || (_zuiDecode.div = $$("div"));
  _zuiDecode.div.innerHTML = str;
  return _zuiDecode.div.textContent;
}
_zuiDecode.div = null;

function _zuiSetValue(value)
{
  var oldval = this.elem.value;
  this.elem.value = value;
  (oldval != this.elem.value) && _zuiFireEvent(this.elem, "change");
}

function _zuiFocus()
{
  this.elem.focus();
}

/* ********************************************************************** */
/* ********************************************************************** */

function zuiGraph(size)
{
  this.root = this.elem = $$("canvas", {
    "class": "zuiGraph"
  });
  this.setSize(size);
}

zuiGraph.prototype.setSize = function (size)
{
  $$(this.elem, {
    "width": size + "px",
    "height": size + "px"
  });
  this.size = size;
  return this;
};

zuiGraph.prototype.clear = function ()
{
  var ctxt = this.elem.getContext("2d");
  ctxt.fillStyle = "#fff";
  ctxt.fillRect(0, 0, this.size, this.size);
  return this;
};

zuiGraph.prototype.drawMap = function (map, color)
{
  var size = this.size,
      scale = size / 256,
      ctxt = this.elem.getContext('2d');
  ctxt.strokeStyle = color || "#000";
  ctxt.lineWidth = scale * 2;
  ctxt.beginPath();
  ctxt.moveTo(0 * scale, size - map[0] * scale);
  for (var i = 1; i < 256; ++i) {
    ctxt.lineTo(i * scale, size - map[i] * scale);
  }
  ctxt.stroke();
  return this;
};

zuiGraph.prototype.drawHistogram = function (hist, color)
{
  var size = this.size,
      scale = size / 256,
      ctxt = this.elem.getContext('2d');
  ctxt.strokeStyle = color || "#000";
  ctxt.lineWidth = scale;
  ctxt.beginPath();
  for (var i = 0; i < 256; ++i) {
    ctxt.moveTo(i * scale, size - 0 * scale);
    ctxt.lineTo(i * scale, size - hist[i] * scale);
  }
  ctxt.stroke();
  return this;
};

/* ********************************************************************** */
/* ********************************************************************** */

function zuiSpacer(big)
{
  this.root = this.elem = $$("div", {
    "class": "zuiSpacer" + (big ? "Big" : "")
  });
}

/* ********************************************************************** */
/* ********************************************************************** */

function zuiError()
{
  this.root = this.elem = $$("p", {
    "class": "zuiError"
  });
}

/* ********************************************************************** */
/* ********************************************************************** */

function zuiButton(label, callback)
{
  callback = callback.bind(this);
  this.root = this.elem = $$("input", {
    "class": "zuiButton",
    "type": "button",
    "click": callback,
    "value": _zuiDecode(label)
  });
}

zuiButton.prototype.focus = _zuiFocus;

/* ********************************************************************** */
/* ********************************************************************** */

function zuiRepeatButton(label, callback)
{
  zuiButton.call(this, label, callback);
  $mixin(this, zuiButton.prototype)

  callback = callback.bind(this);
  $$(this.elem, {
    "mousedown": zuiRepeatButton.cbDown.bind(this, callback),
    "mouseup": zuiRepeatButton.cbUp.bind(this),
    "keydown": zuiRepeatButton.cbKey.bind(this, callback)
  });
}

zuiRepeatButton.cbDown = function (callback)
{
  this.interval && clearInterval(this.interval);
  this.interval = setInterval(callback, 250);
};

zuiRepeatButton.cbUp = function ()
{
  clearInterval(this.interval);
  this.interval = null;
};

zuiRepeatButton.cbKey = function (callback, event)
{
  (event.which === " ") && callback();
};

/* ********************************************************************** */
/* ********************************************************************** */

function zuiToggle(label, callback, checked)
{
  callback = callback.bind(this);
  this.elem = $$("input", {
    "type": "checkbox",
    "click": zuiToggle.cb.bind(this, callback)
  });
  this.elem.checked = !!checked;
  this.root = $$("label", {
    "class": "zuiToggle"
  }, [ this.elem, $$("span", [ label ]) ]);
}

zuiToggle.cb = function (callback)
{
  callback(this.elem.checked);
};

zuiToggle.prototype.focus = _zuiFocus;

/* ********************************************************************** */
/* ********************************************************************** */

function zuiRadioGroup(label, callback, data) //data=[[label,value,checked]]
{
  callback = callback.bind(this);
  data || (data = []);
  var i = 0, itm, kids = [
    $$("p", { "class": "zuiRadioGroupLabel" }, [ label ])
  ];
  this.radios = [];
  zuiRadioGroup.radioCnt++;
  while ((itm = data[i++])) {
    k = new zuiRadioGroup.Radio(itm[0], itm[1], itm[2], callback);
    this.radios.push(k);
    kids.push(k.root);
    kids.push($$("br"));
  }
  kids.pop();
  this.root = this.elem = $$("div", {
    "class": "zuiRadioGroup"
  }, kids);
}

zuiRadioGroup.prototype.focus = function ()
{
  for (var i = 0; i < this.radios.length; ++i) {
    if (this.radios[i].elem.checked) {
      this.radios[i].elem.focus();
      return;
    }
  }
  this.radios[0].elem.focus();
}

zuiRadioGroup.prototype.getSelected = function ()
{
  for (var i = 0; i < this.radios.length; ++i) {
    if (this.radios[i].elem.checked)
      return this.radios[i].elem.value;
  }
  return undefined;
};

zuiRadioGroup.prototype.setSelected = function (value)
{
  var changed = false;
  for (var v, e, i = 0; i < this.radios.length; ++i) {
    e = this.radios[i].elem;
    v = e.checked;
    e.checked = (e.value == value);
    (v !== e.checked) && (changed = true);
  }
  changed && _zuiFireEvent(e, "change");
  return this;
};

zuiRadioGroup.cb = function (callback)
{
  callback(this.elem.value);
};

zuiRadioGroup.Radio = function (label, value, checked, callback)
{
  this.elem = $$("input", {
    "type": "radio",
    "name": "zuiRadioGroup" + zuiRadioGroup.radioCnt,
    "value": value,
    "change": zuiRadioGroup.cb.bind(this, callback)
  });
  this.elem.checked = !!checked;
  this.root = $$("label", {
    "class": "zuiRadio"
  }, [ this.elem, $$("span", [ label ]) ]);
};

zuiRadioGroup.radioCnt = 0;

/* ********************************************************************** */
/* ********************************************************************** */

function zuiText(label, callback, value)
{
  callback = callback.bind(this);
  this.elem = $$("input", {
    "type": "text",
    "change": zuiText.cb.bind(this, callback)
  });
  this.elem.value = value;
  this.root = $$("label", {
    "class": "zuiText"
  }, [ this.elem, $$("span", [ label ]) ]);
}

zuiText.cb = function (callback)
{
  callback(this.elem.value);
};

zuiText.prototype.setValue = _zuiSetValue;

zuiText.prototype.focus = _zuiFocus;

/* ********************************************************************** */
/* ********************************************************************** */

function zuiTextBox(callback)
{
  callback = callback.bind(this);
  this.root = this.elem = $$("textarea", {
    "class": "zuiTextBox",
    "change": zuiTextBox.cb.bind(this, callback)
  });
}

zuiTextBox.cb = function (callback)
{
  callback(this.elem.value);
};

zuiTextBox.prototype.setValue = _zuiSetValue;

zuiTextBox.prototype.focus = _zuiFocus;

/* ********************************************************************** */
/* ********************************************************************** */

function zuiNumber(label, callback, data) //data={min,max,value}
{
  callback = callback.bind(this);
  data || (data = {});
  this.max = data.max;
  this.min = data.min;
  this.elem = $$("input", {
    "type": "number",
    "maxlength": "6",
    "min": data.min,
    "max": data.max,
    "change": zuiNumber.cb.bind(this, callback)
  });
  this.elem.value = data.value;
  this.root = $$("div", {
    "class": "zuiNumber"
  }, [ $$("label", [ this.elem, $$("span", [ label ]) ]) ]);
}

zuiNumber.cb = function (callback)
{
  var change, v = parseFloat(this.elem.value), v2;
  if (isNaN(v)) {
    this.elem.value = this.oldval || 0;
    return;
  }
  v2 = v > this.max ? this.max : v < this.min ? this.min : v;
  change = (this.oldval !== v2);
  this.oldval = this.elem.value = v2;
  change && callback(v2);
};

zuiNumber.prototype.setValue = _zuiSetValue;

zuiNumber.prototype.focus = _zuiFocus;

/* ********************************************************************** */
/* ********************************************************************** */

function zuiSpinner(label, callback, data) //data={min,max,step,value}
{
  this.data = data || {};
  this.number = new zuiNumber("", callback, this.data);
  this.button0 = new zuiRepeatButton("&minus;", zuiSpinner.cb.bind(this, -this.data.step));
  this.button1 = new zuiRepeatButton("&plus;", zuiSpinner.cb.bind(this, this.data.step));
  $$(this.button0.root, { "class": "zuiSpinButton" });
  $$(this.button1.root, { "class": "zuiSpinButton" });
  this.elem = this.number.elem;
  this.root = $$("div", {
    "class": "zuiSpinner"
  }, [
    this.number.root,
    this.button0.root,
    this.button1.root,
    $$("span", [ label ])
  ]);
}

zuiSpinner.cb = function (amt)
{
  var oldval = this.elem.value;
  this.elem.value = parseFloat(this.elem.value) + amt;
  (oldval != this.elem.value) && _zuiFireEvent(this.number.elem, "change");
};

zuiSpinner.prototype.setValue = _zuiSetValue;

zuiSpinner.prototype.focus = _zuiFocus;

/* ********************************************************************** */
/* ********************************************************************** */

function zuiMenuList(label, callback, data) //data=[{label,value,selected}]
{
  callback = callback.bind(this);
  this.elem = $$("select", {
    "change": zuiMenuList.cb.bind(this, callback)
  });
  this.root = $$("div", {
    "class": "zuiMenuList"
  }, [ $$("label", [ this.elem, $$("span", [ label ]) ]) ]);
  this.setList(data);
}

zuiMenuList.cb = function (callback)
{
  callback(this.elem.value);
};

zuiMenuList.prototype.focus = _zuiFocus;

zuiMenuList.prototype.setItem = function (i, label, value)
{
  var e = this.elem.item(i),
      oldtext = e.textContent,
      oldval = e.value;
  e.textContent = typeof(label) !== "undefined" ? label : value;
  e.value = typeof(value) !== "undefined" ? value : label;
  (oldtext != e.textContent || oldval != e.value) &&
    _zuiFireEvent(this.elem, "change");
  return this;
};

zuiMenuList.prototype.getItem = function (i)
{
  (typeof(i) === "undefined") && (i = this.elem.selectedIndex);
  var e = this.elem.item(i);
  return { index: i, label: e.textContent, value: e.value };
};

zuiMenuList.prototype.setList = function (data)
{
  data || (data = []);
  var kids = [], k, selected = 0;
  for (var i = 0; i < data.length; ++i) {
    k = $$("option", {
      "value": typeof(data[i].value) !== "undefined" ? data[i].value : data[i].label,
    }, [
      typeof(data[i].label) !== "undefined" ? data[i].label : data[i].value
    ]);
    data[i].selected && (selected = i);
    kids.push(k);
  }
  $$(this.elem, [ kids ]); //dbl array for replace
  this.elem.selectedIndex = selected;
  _zuiFireEvent(this.elem, "change");
  return this;
};

zuiMenuList.prototype.getList = function ()
{
  var data = [], e;
  for (var i = 0; i < this.elem.length; ++i) {
    e = this.elem.item(i);
    data[i] = {
      index: i,
      label: e.textContent,
      value: e.value,
      selected: i == this.elem.selectedIndex
    };
  }
  return data;
};

zuiMenuList.prototype.select = function (i)
{
  var oldidx = this.elem.selectedIndex;
  this.elem.selectedIndex = i < 0 ? 0 :
                            i >= this.elem.length ? this.elem.length : i;
  (oldidx != this.elem.selectedIndex) && _zuiFireEvent(this.elem, "change");
  return this;
};

zuiMenuList.prototype.add = function (label, value)
{
  var e = $$("option", { "value": value || label }, [ label || value ]);
  this.elem.add(e);
  this.select(this.elem.length - 1);
  return this;
};

zuiMenuList.prototype.remove = function (i)
{
  var e = this.elem.item(i);
  this.elem.remove(i);
  this.elem.selectedIndex = i >= this.elem.length ? this.elem.length - 1 : i;
  _zuiFireEvent(this.elem, "change");
  return e;
};

zuiMenuList.prototype.move = function (i, dir) //dir=1:down,-1:up
{
  if (dir < 0 && i <= 0) return this;
  if (dir > 0 && i >= this.elem.length - 1) return this;
  var e = this.elem.item(i);
  this.elem.remove(i);
  this.elem.add(e, i + dir);
  this.elem.selectedIndex = i + dir;
  _zuiFireEvent(this.elem, "change");
  return this;
};

/* ********************************************************************** */
/* ********************************************************************** */

function _zuiLockingGroup(data, callback) //data=[zuiObj]
{
  callback = callback.bind(this);
  var toggle = data[4] ? 4 : data[3] && data[3].type == "checkbox" ? 3 : 0;
  $$(data[0].elem, { "change": _zuiLockingGroup.cbSpin.bind(this, callback, data[0]) });
  $$(data[1].elem, { "change": _zuiLockingGroup.cbSpin.bind(this, callback, data[1]) });
  $$(data[2].elem, { "change": _zuiLockingGroup.cbSpin.bind(this, callback, data[2]) });
  this.data = data;
  toggle && $$(this.elem = data[toggle].elem, {
    "change": _zuiLockingGroup.cbToggle.bind(this, callback)
  });
  this.root = $$("div", {
    "class": "zuiLockingGroup"
  }, [
    $$("div", { "class": "zuiLockingGroupSliders" }, [
      data[0].root,
      data[1].root,
      data[2].root,
      data[3] ? data[3].root : ""
    ]),
    toggle ? data[toggle].root : ""
  ]);
}

_zuiLockingGroup.cbSpin = function (callback, src)
{
  this.recent = src || this.recent || this.data[0];
  if (!this.elem || !this.elem.checked || this.locking) return;
  this.locking = true;
  var dst = this.data.slice(0, 3);
  dst.splice(dst.indexOf(this.recent), 1);
  callback(this.recent, dst[0], dst[1]);
  this.locking = false;
};

_zuiLockingGroup.cbToggle = function (callback, v)
{
  v && _zuiLockingGroup.cbSpin.call(this, callback, this.recent);
};

/* ********************************************************************** */
/* ********************************************************************** */

function zuiSpinnerGroup(data) //data=[zuiObj]
{
  _zuiLockingGroup.call(this, data, zuiSpinnerGroup.cb);
}

zuiSpinnerGroup.cb = function (src, dst1, dst2)
{
  dst1.setValue(src.elem.value);
  dst2.setValue(src.elem.value);
  return;
  var old1 = dst1.elem.value,
      old2 = dst2.elem.value;
  dst1.elem.value = src.elem.value;
  dst2.elem.value = src.elem.value;
  (old1 != dst1.elem.value) && _zuiFireEvent(dst1.elem, "change");
  (old2 != dst2.elem.value) && _zuiFireEvent(dst2.elem, "change");
};

/* ********************************************************************** */
/* ********************************************************************** */

function zuiMenuListGroup(data) //data=[zuiObj]
{
  _zuiLockingGroup.call(this, data, zuiMenuListGroup.cb);
}

zuiMenuListGroup.cb = function (src, dst1, dst2)
{
  dst1.select(src.elem.selectedIndex);
  dst2.select(src.elem.selectedIndex);
};

/* ********************************************************************** */
/* ********************************************************************** */

function zuiGroupBox(label, data) // data=[zuiObj]
{
  this.data = data || [];
  var body = [
    this.label = $$("p", { "class": "zuiGroupBoxLabel" }, [ label ]),
    this.elem = $$("div", { "class": "zuiGroupBoxContent" })
  ];
  for (var i = 0; i < this.data.length; ++i) {
    body.push(this.data[i].root);
  }
  this.root = $$("div", {
    "class": "zuiGroupBox"
  }, body);
}

/* ********************************************************************** */
/* ********************************************************************** */

function zuiGrid(data) // data=[[zuiObj]] || [[[zuiObj]]]
{
  this.data = data || [];
  var body = [];
  for (var row, i = 0; i < this.data.length; ++i) {
    rowData = this.data[i];
    row = [];
    for (var cell, j = 0; j < rowData.length; ++j) {
      cellData = rowData[j] instanceof Array ? rowData[j] : [ rowData[j] ];
      cell = [];
      for (var k = 0; k < cellData.length; ++k) {
        cell.push(cellData[k].root || cellData[k]);
      }
      row.push($$("td", cell));
    }
    body.push($$("tr", row));
  }
  this.root = this.elem = $$("table", {
    "class": "zuiGrid"
  }, body);
}

/* ********************************************************************** */
/* ********************************************************************** */

function zuiDialog(label, data, onOpen, onClose) //data=[zuiObj]
{
  var canClose = !!onClose;
  onClose || (onClose = zuiNop);
  onClose = onClose.bind(this);
  this.onOpen = onOpen;
  this.data = data || [];

  this.root = $$("div", {
    "class": "zuiDialog"
  }, [
    $$("p", { "class": "zuiDialogTitle" }, [ label ]),
    this.elem = $$("div", { "class": "zuiDialogBody" })
  ]);

  var body = [];
  for (var i = 0; i < this.data.length; ++i) {
    body.push(this.data[i].root);
  }
  $$(this.elem, body);

  if (canClose) {
    this.onClose = onClose;
    this.bottom0 = new zuiButton("OK", zuiDialog.cb.bind(this, onClose, true));
    this.bottom1 = new zuiButton("Cancel", zuiDialog.cb.bind(this, onClose, false));
    this.bottom = new zuiGrid([[ this.bottom0, this.bottom1 ]]);
    $$(this.root, [
      $$("div", {
        "class": "zuiDialogButtons"
      }, [ this.bottom.root ])
    ]);
    this.root.style.display = "none";
  } else {
    this.root.style.display = "block";
  }
}

zuiDialog.cb = function (callback, accepted)
{
  this.root.style.display = "none";
  callback(accepted);
};

zuiDialog.prototype.open = function ()
{
  this.root.style.display = "block";
  this.onOpen();
  return this;
};

zuiDialog.prototype.close = function ()
{
  this.root.style.display = "none";
  this.onClose(false);
  return this;
};

/* ********************************************************************** */
/* ********************************************************************** */

function zuiMenuListEditor(label, callback, data)
{
  $mixin(this, zuiMenuList.prototype);
  zuiMenuList.call(this, label, callback, data);
  this.elem.size = 7;
  this.newItem = data.newItem;

  this.buttons = new zuiGrid([
    [
      [ new zuiButton("Move up", zuiMenuListEditor.cbMove.bind(this, -1)),
        new zuiButton("Move down", zuiMenuListEditor.cbMove.bind(this, 1)) ],
      [ new zuiButton("Add", zuiMenuListEditor.cbAdd.bind(this)),
        new zuiButton("Remove", zuiMenuListEditor.cbRemove.bind(this)) ]
    ]
  ]);
  this.root = $$("div", {
    "class": "zuiMenuListEditor"
  }, [
    this.root, this.buttons.root
  ]);
}

zuiMenuListEditor.cbMove = function (dir)
{
  this.move(this.elem.selectedIndex, dir);
};

zuiMenuListEditor.cbAdd = function ()
{
  this.add(this.newItem.label, this.newItem.value);
};

zuiMenuListEditor.cbRemove = function ()
{
  this.remove(this.elem.selectedIndex);
};

/* ********************************************************************** */
/* ********************************************************************** */
