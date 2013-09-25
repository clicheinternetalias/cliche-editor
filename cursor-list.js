/* ********************************************************************** */
/* A doubly-linked list with a moveable cursor.
 * This is not a complete container; it's specialized to an undo stack.
 */
/* ********************************************************************** */

function CursorList() // I &heart; Linked Lists
{
  this.clear();
}

(function () {

/* ********************************************************************** */
/* ********************************************************************** */

CursorList.prototype.clear = function ()
{
  this.cursor = this.anchor = {};
  this.anchor.prev = this.anchor.next = this.anchor;
  return this;
};

CursorList.prototype.push = function (data)
{
  // discard all elements after the cursor
  this.cursor = this.cursor.next = this.anchor.prev = {
    prev: this.cursor,
    next: this.anchor,
    data: data
  };
  return data;
};

CursorList.prototype.hasCurr = function ()
{
  return (this.cursor !== this.anchor);
};
CursorList.prototype.hasPrev = function ()
{
  return (this.cursor.prev !== this.anchor);
};
CursorList.prototype.hasNext = function ()
{
  return (this.cursor.next !== this.anchor);
};

CursorList.prototype.curr = function ()
{
  return this.cursor.data;
};
CursorList.prototype.prev = function ()
{
  return (this.cursor.prev === this.anchor) ? undefined :
         (this.cursor = this.cursor.prev).data;
};
CursorList.prototype.next = function ()
{
  return (this.cursor.next === this.anchor) ? undefined :
         (this.cursor = this.cursor.next).data;
};

/* ********************************************************************** */
/* ********************************************************************** */
if ("CursorList_TEST" in window) {

CursorList.prototype.toIndex = function ()
{
  var p = this.anchor, i = -1;
  do {
    if (p === this.cursor) break;
    ++i;
  } while ((p = p.next) !== this.anchor);
  return i;
};

CursorList.prototype.toString = function ()
{
  var rv = [], p = this.anchor;
  while ((p = p.next) !== this.anchor) rv.push(p.data);
  return this.toIndex() + ":" + rv.join(",");
};

}
/* ********************************************************************** */
/* ********************************************************************** */

})();
