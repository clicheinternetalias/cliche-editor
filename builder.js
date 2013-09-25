/* ********************************************************************** */
/* ********************************************************************** */

/* $$(elem, attrs, children)
 * $$(elem, attrs)
 * $$(elem, children)  (only if children instanceof Array)
 * $$(elem)
 *
 * Creates or modifies an element's attributes and children.
 *
 * elem - string|node - name of element, or element
 * attrs - object - collection of attributes (optional)
 * children - array|any - collection of child elements (optional)
 *          - if children is an array of length 1 containing an array,
 *            the element's children will be replaced instead of appended
 *
 * Examples:
 *
 *   $$("div");
 *   $$("div", { id : "bar" });
 *   $$("div", { id : "bar" }, [ elem, "text" ]);   (append children)
 *   $$("div", { id : "bar" }, [[ elem, "text" ]]); (replace children)
 *   $$(g_div, [ elem, "text" ]);                   (append children)
 *   $$(g_div, [[ elem, "text" ]]);                 (replace children)
 */

/* ********************************************************************** */
/* ********************************************************************** */

var $$, $, $mixin;

(function(){

var hop = Object.prototype.hasOwnProperty;

/* ********************************************************************** */
/* ********************************************************************** */

var div;
$$ = function (elem, attrs, children)
{
  if (attrs instanceof Array) {
    children = attrs;
    attrs = {};
  }
  children || (children = []);
  var n, i, c;

  (typeof(elem) === "string") && (elem = document.createElement(elem));
  for (n in attrs) {
    if (!hop.call(attrs, n)) continue;
    if (typeof(attrs[n]) === "function")
      elem.addEventListener(n, attrs[n], false);
    else
      elem.setAttribute(n, attrs[n]);
  }

  if (children.length === 1 && children[0] instanceof Array) {
    while (elem.lastChild) elem.removeChild(elem.lastChild);
    children = children[0];
  }
  div || (div = document.createElement("div"));
  for (n = children.length, i = 0; i < n; ++i) {
    c = children[i];
    if (typeof(c) !== "object") {
      div.innerHTML = c.toString();
      c = document.createTextNode(div.innerText || div.textContent);
    }
    elem.appendChild(c);
  }
  return elem;
};

/* ********************************************************************** */
/* ********************************************************************** */

$ = function (id)
{
  return (typeof(id) === "string") ? document.getElementById(id) : id;
};

/* ********************************************************************** */
/* ********************************************************************** */

$mixin = function (dst, src)
{
  for (var n in src)
    hop.call(src, n) && !(n in dst) && (dst[n] = src[n]);
  return dst;
};

/* ********************************************************************** */
/* ********************************************************************** */

})();
