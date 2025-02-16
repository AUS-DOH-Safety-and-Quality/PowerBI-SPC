(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.spc = {}));
})(this, (function (exports) { 'use strict';

  var xhtml = "http://www.w3.org/1999/xhtml";

  var namespaces = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  function namespace(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
  }

  function creatorInherit(name) {
    return function() {
      var document = this.ownerDocument,
          uri = this.namespaceURI;
      return uri === xhtml && document.documentElement.namespaceURI === xhtml
          ? document.createElement(name)
          : document.createElementNS(uri, name);
    };
  }

  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }

  function creator(name) {
    var fullname = namespace(name);
    return (fullname.local
        ? creatorFixed
        : creatorInherit)(fullname);
  }

  function none() {}

  function selector(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  function selection_select(select) {
    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  // Given something array like (or null), returns something that is strictly an
  // array. This is used to ensure that array-like objects passed to d3.selectAll
  // or selection.selectAll are converted into proper arrays when creating a
  // selection; we don’t ever want to create a selection backed by a live
  // HTMLCollection or NodeList. However, note that selection.selectAll will use a
  // static NodeList as a group, since it safely derived from querySelectorAll.
  function array$1(x) {
    return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
  }

  function empty() {
    return [];
  }

  function selectorAll(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  function arrayAll(select) {
    return function() {
      return array$1(select.apply(this, arguments));
    };
  }

  function selection_selectAll(select) {
    if (typeof select === "function") select = arrayAll(select);
    else select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }

    return new Selection(subgroups, parents);
  }

  function matcher(selector) {
    return function() {
      return this.matches(selector);
    };
  }

  function childMatcher(selector) {
    return function(node) {
      return node.matches(selector);
    };
  }

  var find = Array.prototype.find;

  function childFind(match) {
    return function() {
      return find.call(this.children, match);
    };
  }

  function childFirst() {
    return this.firstElementChild;
  }

  function selection_selectChild(match) {
    return this.select(match == null ? childFirst
        : childFind(typeof match === "function" ? match : childMatcher(match)));
  }

  var filter = Array.prototype.filter;

  function children() {
    return Array.from(this.children);
  }

  function childrenFilter(match) {
    return function() {
      return filter.call(this.children, match);
    };
  }

  function selection_selectChildren(match) {
    return this.selectAll(match == null ? children
        : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
  }

  function selection_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function sparse(update) {
    return new Array(update.length);
  }

  function selection_enter() {
    return new Selection(this._enter || this._groups.map(sparse), this._parents);
  }

  function EnterNode(parent, datum) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum;
  }

  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
    insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
    querySelector: function(selector) { return this._parent.querySelector(selector); },
    querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
  };

  function constant$3(x) {
    return function() {
      return x;
    };
  }

  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0,
        node,
        groupLength = group.length,
        dataLength = data.length;

    // Put any non-null nodes that fit into update.
    // Put any null nodes into enter.
    // Put any remaining data into enter.
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Put any non-null nodes that don’t fit into exit.
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }

  function bindKey(parent, group, enter, update, exit, data, key) {
    var i,
        node,
        nodeByKeyValue = new Map,
        groupLength = group.length,
        dataLength = data.length,
        keyValues = new Array(groupLength),
        keyValue;

    // Compute the key for each node.
    // If multiple nodes have the same key, the duplicates are added to exit.
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
        if (nodeByKeyValue.has(keyValue)) {
          exit[i] = node;
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    }

    // Compute the key for each datum.
    // If there a node associated with this key, join and add it to update.
    // If there is not (or the key is a duplicate), add it to enter.
    for (i = 0; i < dataLength; ++i) {
      keyValue = key.call(parent, data[i], i, data) + "";
      if (node = nodeByKeyValue.get(keyValue)) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue.delete(keyValue);
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Add any remaining nodes that were not bound to data to exit.
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
        exit[i] = node;
      }
    }
  }

  function datum(node) {
    return node.__data__;
  }

  function selection_data(value, key) {
    if (!arguments.length) return Array.from(this, datum);

    var bind = key ? bindKey : bindIndex,
        parents = this._parents,
        groups = this._groups;

    if (typeof value !== "function") value = constant$3(value);

    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j],
          group = groups[j],
          groupLength = group.length,
          data = arraylike(value.call(parent, parent && parent.__data__, j, parents)),
          dataLength = data.length,
          enterGroup = enter[j] = new Array(dataLength),
          updateGroup = update[j] = new Array(dataLength),
          exitGroup = exit[j] = new Array(groupLength);

      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

      // Now connect the enter nodes to their following update node, such that
      // appendChild can insert the materialized enter node before this node,
      // rather than at the end of the parent node.
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
          previous._next = next || null;
        }
      }
    }

    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }

  // Given some data, this returns an array-like view of it: an object that
  // exposes a length property and allows numeric indexing. Note that unlike
  // selectAll, this isn’t worried about “live” collections because the resulting
  // array will only be used briefly while data is being bound. (It is possible to
  // cause the data to change while iterating by using a key function, but please
  // don’t; we’d rather avoid a gratuitous copy.)
  function arraylike(data) {
    return typeof data === "object" && "length" in data
      ? data // Array, TypedArray, NodeList, array-like
      : Array.from(data); // Map, Set, iterable, string, or anything else
  }

  function selection_exit() {
    return new Selection(this._exit || this._groups.map(sparse), this._parents);
  }

  function selection_join(onenter, onupdate, onexit) {
    var enter = this.enter(), update = this, exit = this.exit();
    if (typeof onenter === "function") {
      enter = onenter(enter);
      if (enter) enter = enter.selection();
    } else {
      enter = enter.append(onenter + "");
    }
    if (onupdate != null) {
      update = onupdate(update);
      if (update) update = update.selection();
    }
    if (onexit == null) exit.remove(); else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  function selection_merge(context) {
    var selection = context.selection ? context.selection() : context;

    for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Selection(merges, this._parents);
  }

  function selection_order() {

    for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }

    return this;
  }

  function selection_sort(compare) {
    if (!compare) compare = ascending$1;

    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }

    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }

    return new Selection(sortgroups, this._parents).order();
  }

  function ascending$1(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function selection_call() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  function selection_nodes() {
    return Array.from(this);
  }

  function selection_node() {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }

    return null;
  }

  function selection_size() {
    let size = 0;
    for (const node of this) ++size; // eslint-disable-line no-unused-vars
    return size;
  }

  function selection_empty() {
    return !this.node();
  }

  function selection_each(callback) {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }

    return this;
  }

  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }

  function attrConstantNS(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }

  function attrFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }

  function attrFunctionNS(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }

  function selection_attr(name, value) {
    var fullname = namespace(name);

    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local
          ? node.getAttributeNS(fullname.space, fullname.local)
          : node.getAttribute(fullname);
    }

    return this.each((value == null
        ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
        ? (fullname.local ? attrFunctionNS : attrFunction)
        : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
  }

  function defaultView(node) {
    return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
        || (node.document && node) // node is a Window
        || node.defaultView; // node is a Document
  }

  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }

  function styleFunction(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }

  function selection_style(name, value, priority) {
    return arguments.length > 1
        ? this.each((value == null
              ? styleRemove : typeof value === "function"
              ? styleFunction
              : styleConstant)(name, value, priority == null ? "" : priority))
        : styleValue(this.node(), name);
  }

  function styleValue(node, name) {
    return node.style.getPropertyValue(name)
        || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }

  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }

  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }

  function selection_property(name, value) {
    return arguments.length > 1
        ? this.each((value == null
            ? propertyRemove : typeof value === "function"
            ? propertyFunction
            : propertyConstant)(name, value))
        : this.node()[name];
  }

  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }

  function classList(node) {
    return node.classList || new ClassList(node);
  }

  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }

  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };

  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }

  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }

  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }

  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }

  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }

  function selection_classed(name, value) {
    var names = classArray(name + "");

    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }

    return this.each((typeof value === "function"
        ? classedFunction : value
        ? classedTrue
        : classedFalse)(names, value));
  }

  function textRemove() {
    this.textContent = "";
  }

  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }

  function selection_text(value) {
    return arguments.length
        ? this.each(value == null
            ? textRemove : (typeof value === "function"
            ? textFunction
            : textConstant)(value))
        : this.node().textContent;
  }

  function htmlRemove() {
    this.innerHTML = "";
  }

  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }

  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }

  function selection_html(value) {
    return arguments.length
        ? this.each(value == null
            ? htmlRemove : (typeof value === "function"
            ? htmlFunction
            : htmlConstant)(value))
        : this.node().innerHTML;
  }

  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }

  function selection_raise() {
    return this.each(raise);
  }

  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }

  function selection_lower() {
    return this.each(lower);
  }

  function selection_append(name) {
    var create = typeof name === "function" ? name : creator(name);
    return this.select(function() {
      return this.appendChild(create.apply(this, arguments));
    });
  }

  function constantNull() {
    return null;
  }

  function selection_insert(name, before) {
    var create = typeof name === "function" ? name : creator(name),
        select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
    return this.select(function() {
      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }

  function selection_remove() {
    return this.each(remove);
  }

  function selection_cloneShallow() {
    var clone = this.cloneNode(false), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_cloneDeep() {
    var clone = this.cloneNode(true), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_clone(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  function selection_datum(value) {
    return arguments.length
        ? this.property("__data__", value)
        : this.node().__data__;
  }

  function contextListener(listener) {
    return function(event) {
      listener.call(this, event, this.__data__);
    };
  }

  function parseTypenames$1(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return {type: t, name: name};
    });
  }

  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }

  function onAdd(typename, value, options) {
    return function() {
      var on = this.__on, o, listener = contextListener(value);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, options);
      o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }

  function selection_on(typename, value, options) {
    var typenames = parseTypenames$1(typename + ""), i, n = typenames.length, t;

    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }

    on = value ? onAdd : onRemove;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
    return this;
  }

  function dispatchEvent(node, type, params) {
    var window = defaultView(node),
        event = window.CustomEvent;

    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
      else event.initEvent(type, false, false);
    }

    node.dispatchEvent(event);
  }

  function dispatchConstant(type, params) {
    return function() {
      return dispatchEvent(this, type, params);
    };
  }

  function dispatchFunction(type, params) {
    return function() {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }

  function selection_dispatch(type, params) {
    return this.each((typeof params === "function"
        ? dispatchFunction
        : dispatchConstant)(type, params));
  }

  function* selection_iterator() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) yield node;
      }
    }
  }

  var root = [null];

  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }

  function selection_selection() {
    return this;
  }

  Selection.prototype = {
    constructor: Selection,
    select: selection_select,
    selectAll: selection_selectAll,
    selectChild: selection_selectChild,
    selectChildren: selection_selectChildren,
    filter: selection_filter,
    data: selection_data,
    enter: selection_enter,
    exit: selection_exit,
    join: selection_join,
    merge: selection_merge,
    selection: selection_selection,
    order: selection_order,
    sort: selection_sort,
    call: selection_call,
    nodes: selection_nodes,
    node: selection_node,
    size: selection_size,
    empty: selection_empty,
    each: selection_each,
    attr: selection_attr,
    style: selection_style,
    property: selection_property,
    classed: selection_classed,
    text: selection_text,
    html: selection_html,
    raise: selection_raise,
    lower: selection_lower,
    append: selection_append,
    insert: selection_insert,
    remove: selection_remove,
    clone: selection_clone,
    datum: selection_datum,
    on: selection_on,
    dispatch: selection_dispatch,
    [Symbol.iterator]: selection_iterator
  };

  function select(selector) {
    return typeof selector === "string"
        ? new Selection([[document.querySelector(selector)]], [document.documentElement])
        : new Selection([[selector]], root);
  }

  function sourceEvent(event) {
    let sourceEvent;
    while (sourceEvent = event.sourceEvent) event = sourceEvent;
    return event;
  }

  function pointer(event, node) {
    event = sourceEvent(event);
    if (node === undefined) node = event.currentTarget;
    if (node) {
      var svg = node.ownerSVGElement || node;
      if (svg.createSVGPoint) {
        var point = svg.createSVGPoint();
        point.x = event.clientX, point.y = event.clientY;
        point = point.matrixTransform(node.getScreenCTM().inverse());
        return [point.x, point.y];
      }
      if (node.getBoundingClientRect) {
        var rect = node.getBoundingClientRect();
        return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
      }
    }
    return [event.pageX, event.pageY];
  }

  function selectAll(selector) {
    return typeof selector === "string"
        ? new Selection([document.querySelectorAll(selector)], [document.documentElement])
        : new Selection([array$1(selector)], root);
  }

  function ascending(a, b) {
    return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function descending(a, b) {
    return a == null || b == null ? NaN
      : b < a ? -1
      : b > a ? 1
      : b >= a ? 0
      : NaN;
  }

  function bisector(f) {
    let compare1, compare2, delta;

    // If an accessor is specified, promote it to a comparator. In this case we
    // can test whether the search value is (self-) comparable. We can’t do this
    // for a comparator (except for specific, known comparators) because we can’t
    // tell if the comparator is symmetric, and an asymmetric comparator can’t be
    // used to test whether a single value is comparable.
    if (f.length !== 2) {
      compare1 = ascending;
      compare2 = (d, x) => ascending(f(d), x);
      delta = (d, x) => f(d) - x;
    } else {
      compare1 = f === ascending || f === descending ? f : zero$1;
      compare2 = f;
      delta = f;
    }

    function left(a, x, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x, x) !== 0) return hi;
        do {
          const mid = (lo + hi) >>> 1;
          if (compare2(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        } while (lo < hi);
      }
      return lo;
    }

    function right(a, x, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x, x) !== 0) return hi;
        do {
          const mid = (lo + hi) >>> 1;
          if (compare2(a[mid], x) <= 0) lo = mid + 1;
          else hi = mid;
        } while (lo < hi);
      }
      return lo;
    }

    function center(a, x, lo = 0, hi = a.length) {
      const i = left(a, x, lo, hi - 1);
      return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
    }

    return {left, center, right};
  }

  function zero$1() {
    return 0;
  }

  function number$2(x) {
    return x === null ? NaN : +x;
  }

  function* numbers(values, valueof) {
    {
      for (let value of values) {
        if (value != null && (value = +value) >= value) {
          yield value;
        }
      }
    }
  }

  const ascendingBisect = bisector(ascending);
  const bisectRight = ascendingBisect.right;
  bisector(number$2).center;

  class InternMap extends Map {
    constructor(entries, key = keyof) {
      super();
      Object.defineProperties(this, {_intern: {value: new Map()}, _key: {value: key}});
      if (entries != null) for (const [key, value] of entries) this.set(key, value);
    }
    get(key) {
      return super.get(intern_get(this, key));
    }
    has(key) {
      return super.has(intern_get(this, key));
    }
    set(key, value) {
      return super.set(intern_set(this, key), value);
    }
    delete(key) {
      return super.delete(intern_delete(this, key));
    }
  }

  function intern_get({_intern, _key}, value) {
    const key = _key(value);
    return _intern.has(key) ? _intern.get(key) : value;
  }

  function intern_set({_intern, _key}, value) {
    const key = _key(value);
    if (_intern.has(key)) return _intern.get(key);
    _intern.set(key, value);
    return value;
  }

  function intern_delete({_intern, _key}, value) {
    const key = _key(value);
    if (_intern.has(key)) {
      value = _intern.get(key);
      _intern.delete(key);
    }
    return value;
  }

  function keyof(value) {
    return value !== null && typeof value === "object" ? value.valueOf() : value;
  }

  function identity$3(x) {
    return x;
  }

  function groups(values, ...keys) {
    return nest(values, Array.from, identity$3, keys);
  }

  function nest(values, map, reduce, keys) {
    return (function regroup(values, i) {
      if (i >= keys.length) return reduce(values);
      const groups = new InternMap();
      const keyof = keys[i++];
      let index = -1;
      for (const value of values) {
        const key = keyof(value, ++index, values);
        const group = groups.get(key);
        if (group) group.push(value);
        else groups.set(key, [value]);
      }
      for (const [key, values] of groups) {
        groups.set(key, regroup(values, i));
      }
      return map(groups);
    })(values, 0);
  }

  function compareDefined(compare = ascending) {
    if (compare === ascending) return ascendingDefined;
    if (typeof compare !== "function") throw new TypeError("compare is not a function");
    return (a, b) => {
      const x = compare(a, b);
      if (x || x === 0) return x;
      return (compare(b, b) === 0) - (compare(a, a) === 0);
    };
  }

  function ascendingDefined(a, b) {
    return (a == null || !(a >= a)) - (b == null || !(b >= b)) || (a < b ? -1 : a > b ? 1 : 0);
  }

  const e10 = Math.sqrt(50),
      e5 = Math.sqrt(10),
      e2 = Math.sqrt(2);

  function tickSpec(start, stop, count) {
    const step = (stop - start) / Math.max(0, count),
        power = Math.floor(Math.log10(step)),
        error = step / Math.pow(10, power),
        factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
    let i1, i2, inc;
    if (power < 0) {
      inc = Math.pow(10, -power) / factor;
      i1 = Math.round(start * inc);
      i2 = Math.round(stop * inc);
      if (i1 / inc < start) ++i1;
      if (i2 / inc > stop) --i2;
      inc = -inc;
    } else {
      inc = Math.pow(10, power) * factor;
      i1 = Math.round(start / inc);
      i2 = Math.round(stop / inc);
      if (i1 * inc < start) ++i1;
      if (i2 * inc > stop) --i2;
    }
    if (i2 < i1 && 0.5 <= count && count < 2) return tickSpec(start, stop, count * 2);
    return [i1, i2, inc];
  }

  function ticks(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    if (!(count > 0)) return [];
    if (start === stop) return [start];
    const reverse = stop < start, [i1, i2, inc] = reverse ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
    if (!(i2 >= i1)) return [];
    const n = i2 - i1 + 1, ticks = new Array(n);
    if (reverse) {
      if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) / -inc;
      else for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) * inc;
    } else {
      if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) / -inc;
      else for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) * inc;
    }
    return ticks;
  }

  function tickIncrement(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    return tickSpec(start, stop, count)[2];
  }

  function tickStep(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    const reverse = stop < start, inc = reverse ? tickIncrement(stop, start, count) : tickIncrement(start, stop, count);
    return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
  }

  function max(values, valueof) {
    let max;
    {
      for (const value of values) {
        if (value != null
            && (max < value || (max === undefined && value >= value))) {
          max = value;
        }
      }
    }
    return max;
  }

  function min(values, valueof) {
    let min;
    {
      for (const value of values) {
        if (value != null
            && (min > value || (min === undefined && value >= value))) {
          min = value;
        }
      }
    }
    return min;
  }

  function minIndex(values, valueof) {
    let min;
    let minIndex = -1;
    let index = -1;
    if (valueof === undefined) {
      for (const value of values) {
        ++index;
        if (value != null
            && (min > value || (min === undefined && value >= value))) {
          min = value, minIndex = index;
        }
      }
    } else {
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null
            && (min > value || (min === undefined && value >= value))) {
          min = value, minIndex = index;
        }
      }
    }
    return minIndex;
  }

  // Based on https://github.com/mourner/quickselect
  // ISC license, Copyright 2018 Vladimir Agafonkin.
  function quickselect(array, k, left = 0, right = Infinity, compare) {
    k = Math.floor(k);
    left = Math.floor(Math.max(0, left));
    right = Math.floor(Math.min(array.length - 1, right));

    if (!(left <= k && k <= right)) return array;

    compare = compare === undefined ? ascendingDefined : compareDefined(compare);

    while (right > left) {
      if (right - left > 600) {
        const n = right - left + 1;
        const m = k - left + 1;
        const z = Math.log(n);
        const s = 0.5 * Math.exp(2 * z / 3);
        const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
        const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
        const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
        quickselect(array, k, newLeft, newRight, compare);
      }

      const t = array[k];
      let i = left;
      let j = right;

      swap(array, left, k);
      if (compare(array[right], t) > 0) swap(array, left, right);

      while (i < j) {
        swap(array, i, j), ++i, --j;
        while (compare(array[i], t) < 0) ++i;
        while (compare(array[j], t) > 0) --j;
      }

      if (compare(array[left], t) === 0) swap(array, left, j);
      else ++j, swap(array, j, right);

      if (j <= k) left = j + 1;
      if (k <= j) right = j - 1;
    }

    return array;
  }

  function swap(array, i, j) {
    const t = array[i];
    array[i] = array[j];
    array[j] = t;
  }

  function quantile(values, p, valueof) {
    values = Float64Array.from(numbers(values));
    if (!(n = values.length) || isNaN(p = +p)) return;
    if (p <= 0 || n < 2) return min(values);
    if (p >= 1) return max(values);
    var n,
        i = (n - 1) * p,
        i0 = Math.floor(i),
        value0 = max(quickselect(values, i0).subarray(0, i0 + 1)),
        value1 = min(values.subarray(i0 + 1));
    return value0 + (value1 - value0) * (i - i0);
  }

  function mean(values, valueof) {
    let count = 0;
    let sum = 0;
    {
      for (let value of values) {
        if (value != null && (value = +value) >= value) {
          ++count, sum += value;
        }
      }
    }
    if (count) return sum / count;
  }

  function median(values, valueof) {
    return quantile(values, 0.5);
  }

  function leastIndex(values, compare = ascending) {
    if (compare.length === 1) return minIndex(values, compare);
    let minValue;
    let min = -1;
    let index = -1;
    for (const value of values) {
      ++index;
      if (min < 0
          ? compare(value, value) === 0
          : compare(value, minValue) < 0) {
        minValue = value;
        min = index;
      }
    }
    return min;
  }

  function sum(values, valueof) {
    let sum = 0;
    {
      for (let value of values) {
        if (value = +value) {
          sum += value;
        }
      }
    }
    return sum;
  }

  function constant$2(x) {
    return function constant() {
      return x;
    };
  }

  const sqrt$1 = Math.sqrt;
  const pi$1 = Math.PI;
  const tau$1 = 2 * pi$1;

  const pi = Math.PI,
      tau = 2 * pi,
      epsilon$1 = 1e-6,
      tauEpsilon = tau - epsilon$1;

  function append(strings) {
    this._ += strings[0];
    for (let i = 1, n = strings.length; i < n; ++i) {
      this._ += arguments[i] + strings[i];
    }
  }

  function appendRound(digits) {
    let d = Math.floor(digits);
    if (!(d >= 0)) throw new Error(`invalid digits: ${digits}`);
    if (d > 15) return append;
    const k = 10 ** d;
    return function(strings) {
      this._ += strings[0];
      for (let i = 1, n = strings.length; i < n; ++i) {
        this._ += Math.round(arguments[i] * k) / k + strings[i];
      }
    };
  }

  class Path {
    constructor(digits) {
      this._x0 = this._y0 = // start of current subpath
      this._x1 = this._y1 = null; // end of current subpath
      this._ = "";
      this._append = digits == null ? append : appendRound(digits);
    }
    moveTo(x, y) {
      this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
    }
    closePath() {
      if (this._x1 !== null) {
        this._x1 = this._x0, this._y1 = this._y0;
        this._append`Z`;
      }
    }
    lineTo(x, y) {
      this._append`L${this._x1 = +x},${this._y1 = +y}`;
    }
    quadraticCurveTo(x1, y1, x, y) {
      this._append`Q${+x1},${+y1},${this._x1 = +x},${this._y1 = +y}`;
    }
    bezierCurveTo(x1, y1, x2, y2, x, y) {
      this._append`C${+x1},${+y1},${+x2},${+y2},${this._x1 = +x},${this._y1 = +y}`;
    }
    arcTo(x1, y1, x2, y2, r) {
      x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;

      // Is the radius negative? Error.
      if (r < 0) throw new Error(`negative radius: ${r}`);

      let x0 = this._x1,
          y0 = this._y1,
          x21 = x2 - x1,
          y21 = y2 - y1,
          x01 = x0 - x1,
          y01 = y0 - y1,
          l01_2 = x01 * x01 + y01 * y01;

      // Is this path empty? Move to (x1,y1).
      if (this._x1 === null) {
        this._append`M${this._x1 = x1},${this._y1 = y1}`;
      }

      // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
      else if (!(l01_2 > epsilon$1));

      // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
      // Equivalently, is (x1,y1) coincident with (x2,y2)?
      // Or, is the radius zero? Line to (x1,y1).
      else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon$1) || !r) {
        this._append`L${this._x1 = x1},${this._y1 = y1}`;
      }

      // Otherwise, draw an arc!
      else {
        let x20 = x2 - x0,
            y20 = y2 - y0,
            l21_2 = x21 * x21 + y21 * y21,
            l20_2 = x20 * x20 + y20 * y20,
            l21 = Math.sqrt(l21_2),
            l01 = Math.sqrt(l01_2),
            l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
            t01 = l / l01,
            t21 = l / l21;

        // If the start tangent is not coincident with (x0,y0), line to.
        if (Math.abs(t01 - 1) > epsilon$1) {
          this._append`L${x1 + t01 * x01},${y1 + t01 * y01}`;
        }

        this._append`A${r},${r},0,0,${+(y01 * x20 > x01 * y20)},${this._x1 = x1 + t21 * x21},${this._y1 = y1 + t21 * y21}`;
      }
    }
    arc(x, y, r, a0, a1, ccw) {
      x = +x, y = +y, r = +r, ccw = !!ccw;

      // Is the radius negative? Error.
      if (r < 0) throw new Error(`negative radius: ${r}`);

      let dx = r * Math.cos(a0),
          dy = r * Math.sin(a0),
          x0 = x + dx,
          y0 = y + dy,
          cw = 1 ^ ccw,
          da = ccw ? a0 - a1 : a1 - a0;

      // Is this path empty? Move to (x0,y0).
      if (this._x1 === null) {
        this._append`M${x0},${y0}`;
      }

      // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
      else if (Math.abs(this._x1 - x0) > epsilon$1 || Math.abs(this._y1 - y0) > epsilon$1) {
        this._append`L${x0},${y0}`;
      }

      // Is this arc empty? We’re done.
      if (!r) return;

      // Does the angle go the wrong way? Flip the direction.
      if (da < 0) da = da % tau + tau;

      // Is this a complete circle? Draw two arcs to complete the circle.
      if (da > tauEpsilon) {
        this._append`A${r},${r},0,1,${cw},${x - dx},${y - dy}A${r},${r},0,1,${cw},${this._x1 = x0},${this._y1 = y0}`;
      }

      // Is this arc non-empty? Draw an arc!
      else if (da > epsilon$1) {
        this._append`A${r},${r},0,${+(da >= pi)},${cw},${this._x1 = x + r * Math.cos(a1)},${this._y1 = y + r * Math.sin(a1)}`;
      }
    }
    rect(x, y, w, h) {
      this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${w = +w}v${+h}h${-w}Z`;
    }
    toString() {
      return this._;
    }
  }

  function withPath(shape) {
    let digits = 3;

    shape.digits = function(_) {
      if (!arguments.length) return digits;
      if (_ == null) {
        digits = null;
      } else {
        const d = Math.floor(_);
        if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`);
        digits = d;
      }
      return shape;
    };

    return () => new Path(digits);
  }

  function array(x) {
    return typeof x === "object" && "length" in x
      ? x // Array, TypedArray, NodeList, array-like
      : Array.from(x); // Map, Set, iterable, string, or anything else
  }

  function Linear(context) {
    this._context = context;
  }

  Linear.prototype = {
    areaStart: function() {
      this._line = 0;
    },
    areaEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
      this._line = 1 - this._line;
    },
    point: function(x, y) {
      x = +x, y = +y;
      switch (this._point) {
        case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
        case 1: this._point = 2; // falls through
        default: this._context.lineTo(x, y); break;
      }
    }
  };

  function curveLinear(context) {
    return new Linear(context);
  }

  function x(p) {
    return p[0];
  }

  function y(p) {
    return p[1];
  }

  function line(x$1, y$1) {
    var defined = constant$2(true),
        context = null,
        curve = curveLinear,
        output = null,
        path = withPath(line);

    x$1 = typeof x$1 === "function" ? x$1 : (x$1 === undefined) ? x : constant$2(x$1);
    y$1 = typeof y$1 === "function" ? y$1 : (y$1 === undefined) ? y : constant$2(y$1);

    function line(data) {
      var i,
          n = (data = array(data)).length,
          d,
          defined0 = false,
          buffer;

      if (context == null) output = curve(buffer = path());

      for (i = 0; i <= n; ++i) {
        if (!(i < n && defined(d = data[i], i, data)) === defined0) {
          if (defined0 = !defined0) output.lineStart();
          else output.lineEnd();
        }
        if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
      }

      if (buffer) return output = null, buffer + "" || null;
    }

    line.x = function(_) {
      return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant$2(+_), line) : x$1;
    };

    line.y = function(_) {
      return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant$2(+_), line) : y$1;
    };

    line.defined = function(_) {
      return arguments.length ? (defined = typeof _ === "function" ? _ : constant$2(!!_), line) : defined;
    };

    line.curve = function(_) {
      return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
    };

    line.context = function(_) {
      return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
    };

    return line;
  }

  var circle = {
    draw(context, size) {
      const r = sqrt$1(size / pi$1);
      context.moveTo(r, 0);
      context.arc(0, 0, r, 0, tau$1);
    }
  };

  const sqrt3 = sqrt$1(3);

  var triangle = {
    draw(context, size) {
      const y = -sqrt$1(size / (sqrt3 * 3));
      context.moveTo(0, y * 2);
      context.lineTo(-sqrt3 * y, -y);
      context.lineTo(sqrt3 * y, -y);
      context.closePath();
    }
  };

  function Symbol$1(type, size) {
    let context = null,
        path = withPath(symbol);

    type = typeof type === "function" ? type : constant$2(type || circle);
    size = typeof size === "function" ? size : constant$2(size === undefined ? 64 : +size);

    function symbol() {
      let buffer;
      if (!context) context = buffer = path();
      type.apply(this, arguments).draw(context, +size.apply(this, arguments));
      if (buffer) return context = null, buffer + "" || null;
    }

    symbol.type = function(_) {
      return arguments.length ? (type = typeof _ === "function" ? _ : constant$2(_), symbol) : type;
    };

    symbol.size = function(_) {
      return arguments.length ? (size = typeof _ === "function" ? _ : constant$2(+_), symbol) : size;
    };

    symbol.context = function(_) {
      return arguments.length ? (context = _ == null ? null : _, symbol) : context;
    };

    return symbol;
  }

  function identity$2(x) {
    return x;
  }

  var top = 1,
      right = 2,
      bottom = 3,
      left = 4,
      epsilon = 1e-6;

  function translateX(x) {
    return "translate(" + x + ",0)";
  }

  function translateY(y) {
    return "translate(0," + y + ")";
  }

  function number$1(scale) {
    return d => +scale(d);
  }

  function center(scale, offset) {
    offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
    if (scale.round()) offset = Math.round(offset);
    return d => +scale(d) + offset;
  }

  function entering() {
    return !this.__axis;
  }

  function axis(orient, scale) {
    var tickArguments = [],
        tickValues = null,
        tickFormat = null,
        tickSizeInner = 6,
        tickSizeOuter = 6,
        tickPadding = 3,
        offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5,
        k = orient === top || orient === left ? -1 : 1,
        x = orient === left || orient === right ? "x" : "y",
        transform = orient === top || orient === bottom ? translateX : translateY;

    function axis(context) {
      var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
          format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity$2) : tickFormat,
          spacing = Math.max(tickSizeInner, 0) + tickPadding,
          range = scale.range(),
          range0 = +range[0] + offset,
          range1 = +range[range.length - 1] + offset,
          position = (scale.bandwidth ? center : number$1)(scale.copy(), offset),
          selection = context.selection ? context.selection() : context,
          path = selection.selectAll(".domain").data([null]),
          tick = selection.selectAll(".tick").data(values, scale).order(),
          tickExit = tick.exit(),
          tickEnter = tick.enter().append("g").attr("class", "tick"),
          line = tick.select("line"),
          text = tick.select("text");

      path = path.merge(path.enter().insert("path", ".tick")
          .attr("class", "domain")
          .attr("stroke", "currentColor"));

      tick = tick.merge(tickEnter);

      line = line.merge(tickEnter.append("line")
          .attr("stroke", "currentColor")
          .attr(x + "2", k * tickSizeInner));

      text = text.merge(tickEnter.append("text")
          .attr("fill", "currentColor")
          .attr(x, k * spacing)
          .attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));

      if (context !== selection) {
        path = path.transition(context);
        tick = tick.transition(context);
        line = line.transition(context);
        text = text.transition(context);

        tickExit = tickExit.transition(context)
            .attr("opacity", epsilon)
            .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d + offset) : this.getAttribute("transform"); });

        tickEnter
            .attr("opacity", epsilon)
            .attr("transform", function(d) { var p = this.parentNode.__axis; return transform((p && isFinite(p = p(d)) ? p : position(d)) + offset); });
      }

      tickExit.remove();

      path
          .attr("d", orient === left || orient === right
              ? (tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H" + offset + "V" + range1 + "H" + k * tickSizeOuter : "M" + offset + "," + range0 + "V" + range1)
              : (tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V" + offset + "H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + "," + offset + "H" + range1));

      tick
          .attr("opacity", 1)
          .attr("transform", function(d) { return transform(position(d) + offset); });

      line
          .attr(x + "2", k * tickSizeInner);

      text
          .attr(x, k * spacing)
          .text(format);

      selection.filter(entering)
          .attr("fill", "none")
          .attr("font-size", 10)
          .attr("font-family", "sans-serif")
          .attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");

      selection
          .each(function() { this.__axis = position; });
    }

    axis.scale = function(_) {
      return arguments.length ? (scale = _, axis) : scale;
    };

    axis.ticks = function() {
      return tickArguments = Array.from(arguments), axis;
    };

    axis.tickArguments = function(_) {
      return arguments.length ? (tickArguments = _ == null ? [] : Array.from(_), axis) : tickArguments.slice();
    };

    axis.tickValues = function(_) {
      return arguments.length ? (tickValues = _ == null ? null : Array.from(_), axis) : tickValues && tickValues.slice();
    };

    axis.tickFormat = function(_) {
      return arguments.length ? (tickFormat = _, axis) : tickFormat;
    };

    axis.tickSize = function(_) {
      return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
    };

    axis.tickSizeInner = function(_) {
      return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
    };

    axis.tickSizeOuter = function(_) {
      return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
    };

    axis.tickPadding = function(_) {
      return arguments.length ? (tickPadding = +_, axis) : tickPadding;
    };

    axis.offset = function(_) {
      return arguments.length ? (offset = +_, axis) : offset;
    };

    return axis;
  }

  function axisBottom(scale) {
    return axis(bottom, scale);
  }

  function axisLeft(scale) {
    return axis(left, scale);
  }

  function initRange(domain, range) {
    switch (arguments.length) {
      case 0: break;
      case 1: this.range(domain); break;
      default: this.range(range).domain(domain); break;
    }
    return this;
  }

  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }

  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  function Color() {}

  var darker = 0.7;
  var brighter = 1 / darker;

  var reI = "\\s*([+-]?\\d+)\\s*",
      reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",
      reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
      reHex = /^#([0-9a-f]{3,8})$/,
      reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`),
      reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`),
      reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`),
      reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`),
      reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`),
      reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);

  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
  };

  define(Color, color, {
    copy(channels) {
      return Object.assign(new this.constructor, this, channels);
    },
    displayable() {
      return this.rgb().displayable();
    },
    hex: color_formatHex, // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHex8: color_formatHex8,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });

  function color_formatHex() {
    return this.rgb().formatHex();
  }

  function color_formatHex8() {
    return this.rgb().formatHex8();
  }

  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }

  function color_formatRgb() {
    return this.rgb().formatRgb();
  }

  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
        : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
        : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
        : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
        : null) // invalid hex
        : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
        : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
        : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
        : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
        : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
        : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
        : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
        : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
        : null;
  }

  function rgbn(n) {
    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
  }

  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }

  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb;
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }

  function rgb$1(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }

  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Rgb, rgb$1, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb() {
      return this;
    },
    clamp() {
      return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
    },
    displayable() {
      return (-0.5 <= this.r && this.r < 255.5)
          && (-0.5 <= this.g && this.g < 255.5)
          && (-0.5 <= this.b && this.b < 255.5)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex, // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatHex8: rgb_formatHex8,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));

  function rgb_formatHex() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }

  function rgb_formatHex8() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
  }

  function rgb_formatRgb() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
  }

  function clampa(opacity) {
    return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
  }

  function clampi(value) {
    return Math.max(0, Math.min(255, Math.round(value) || 0));
  }

  function hex(value) {
    value = clampi(value);
    return (value < 16 ? "0" : "") + value.toString(16);
  }

  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }

  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl;
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        h = NaN,
        s = max - min,
        l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }

  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }

  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hsl, hsl, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb() {
      var h = this.h % 360 + (this.h < 0) * 360,
          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
          l = this.l,
          m2 = l + (l < 0.5 ? l : 1 - l) * s,
          m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    clamp() {
      return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
    },
    displayable() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s))
          && (0 <= this.l && this.l <= 1)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl() {
      const a = clampa(this.opacity);
      return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
    }
  }));

  function clamph(value) {
    value = (value || 0) % 360;
    return value < 0 ? value + 360 : value;
  }

  function clampt(value) {
    return Math.max(0, Math.min(1, value || 0));
  }

  /* From FvD 13.37, CSS Color Module Level 3 */
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60
        : h < 180 ? m2
        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
        : m1) * 255;
  }

  var constant$1 = x => () => x;

  function linear$1(a, d) {
    return function(t) {
      return a + t * d;
    };
  }

  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }

  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
    };
  }

  function nogamma(a, b) {
    var d = b - a;
    return d ? linear$1(a, d) : constant$1(isNaN(a) ? b : a);
  }

  var rgb = (function rgbGamma(y) {
    var color = gamma(y);

    function rgb(start, end) {
      var r = color((start = rgb$1(start)).r, (end = rgb$1(end)).r),
          g = color(start.g, end.g),
          b = color(start.b, end.b),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    rgb.gamma = rgbGamma;

    return rgb;
  })(1);

  function numberArray(a, b) {
    if (!b) b = [];
    var n = a ? Math.min(b.length, a.length) : 0,
        c = b.slice(),
        i;
    return function(t) {
      for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
      return c;
    };
  }

  function isNumberArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
  }

  function genericArray(a, b) {
    var nb = b ? b.length : 0,
        na = a ? Math.min(nb, a.length) : 0,
        x = new Array(na),
        c = new Array(nb),
        i;

    for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
    for (; i < nb; ++i) c[i] = b[i];

    return function(t) {
      for (i = 0; i < na; ++i) c[i] = x[i](t);
      return c;
    };
  }

  function date(a, b) {
    var d = new Date;
    return a = +a, b = +b, function(t) {
      return d.setTime(a * (1 - t) + b * t), d;
    };
  }

  function interpolateNumber(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  function object(a, b) {
    var i = {},
        c = {},
        k;

    if (a === null || typeof a !== "object") a = {};
    if (b === null || typeof b !== "object") b = {};

    for (k in b) {
      if (k in a) {
        i[k] = interpolate(a[k], b[k]);
      } else {
        c[k] = b[k];
      }
    }

    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
      reB = new RegExp(reA.source, "g");

  function zero(b) {
    return function() {
      return b;
    };
  }

  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }

  function string(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
        am, // current match in a
        bm, // current match in b
        bs, // string preceding current number in b, if any
        i = -1, // index in s
        s = [], // string constants and placeholders
        q = []; // number interpolators

    // Coerce inputs to strings.
    a = a + "", b = b + "";

    // Interpolate pairs of numbers in a & b.
    while ((am = reA.exec(a))
        && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) { // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else { // interpolate non-matching numbers
        s[++i] = null;
        q.push({i: i, x: interpolateNumber(am, bm)});
      }
      bi = reB.lastIndex;
    }

    // Add remains of b.
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }

    // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.
    return s.length < 2 ? (q[0]
        ? one(q[0].x)
        : zero(b))
        : (b = q.length, function(t) {
            for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
            return s.join("");
          });
  }

  function interpolate(a, b) {
    var t = typeof b, c;
    return b == null || t === "boolean" ? constant$1(b)
        : (t === "number" ? interpolateNumber
        : t === "string" ? ((c = color(b)) ? (b = c, rgb) : string)
        : b instanceof color ? rgb
        : b instanceof Date ? date
        : isNumberArray(b) ? numberArray
        : Array.isArray(b) ? genericArray
        : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
        : interpolateNumber)(a, b);
  }

  function interpolateRound(a, b) {
    return a = +a, b = +b, function(t) {
      return Math.round(a * (1 - t) + b * t);
    };
  }

  function constants$1(x) {
    return function() {
      return x;
    };
  }

  function number(x) {
    return +x;
  }

  var unit = [0, 1];

  function identity$1(x) {
    return x;
  }

  function normalize(a, b) {
    return (b -= (a = +a))
        ? function(x) { return (x - a) / b; }
        : constants$1(isNaN(b) ? NaN : 0.5);
  }

  function clamper(a, b) {
    var t;
    if (a > b) t = a, a = b, b = t;
    return function(x) { return Math.max(a, Math.min(b, x)); };
  }

  // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
  // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
  function bimap(domain, range, interpolate) {
    var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
    else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
    return function(x) { return r0(d0(x)); };
  }

  function polymap(domain, range, interpolate) {
    var j = Math.min(domain.length, range.length) - 1,
        d = new Array(j),
        r = new Array(j),
        i = -1;

    // Reverse descending domains.
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }

    while (++i < j) {
      d[i] = normalize(domain[i], domain[i + 1]);
      r[i] = interpolate(range[i], range[i + 1]);
    }

    return function(x) {
      var i = bisectRight(domain, x, 1, j) - 1;
      return r[i](d[i](x));
    };
  }

  function copy(source, target) {
    return target
        .domain(source.domain())
        .range(source.range())
        .interpolate(source.interpolate())
        .clamp(source.clamp())
        .unknown(source.unknown());
  }

  function transformer() {
    var domain = unit,
        range = unit,
        interpolate$1 = interpolate,
        transform,
        untransform,
        unknown,
        clamp = identity$1,
        piecewise,
        output,
        input;

    function rescale() {
      var n = Math.min(domain.length, range.length);
      if (clamp !== identity$1) clamp = clamper(domain[0], domain[n - 1]);
      piecewise = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }

    function scale(x) {
      return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
    }

    scale.invert = function(y) {
      return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
    };

    scale.domain = function(_) {
      return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
    };

    scale.range = function(_) {
      return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
    };

    scale.rangeRound = function(_) {
      return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
    };

    scale.clamp = function(_) {
      return arguments.length ? (clamp = _ ? true : identity$1, rescale()) : clamp !== identity$1;
    };

    scale.interpolate = function(_) {
      return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
    };

    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };

    return function(t, u) {
      transform = t, untransform = u;
      return rescale();
    };
  }

  function continuous() {
    return transformer()(identity$1, identity$1);
  }

  function formatDecimal(x) {
    return Math.abs(x = Math.round(x)) >= 1e21
        ? x.toLocaleString("en").replace(/,/g, "")
        : x.toString(10);
  }

  // Computes the decimal coefficient and exponent of the specified number x with
  // significant digits p, where x is positive and p is in [1, 21] or undefined.
  // For example, formatDecimalParts(1.23) returns ["123", 0].
  function formatDecimalParts(x, p) {
    if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
    var i, coefficient = x.slice(0, i);

    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [
      coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
      +x.slice(i + 1)
    ];
  }

  function exponent(x) {
    return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
  }

  function formatGroup(grouping, thousands) {
    return function(value, width) {
      var i = value.length,
          t = [],
          j = 0,
          g = grouping[0],
          length = 0;

      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = grouping[j = (j + 1) % grouping.length];
      }

      return t.reverse().join(thousands);
    };
  }

  function formatNumerals(numerals) {
    return function(value) {
      return value.replace(/[0-9]/g, function(i) {
        return numerals[+i];
      });
    };
  }

  // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
  var re$1 = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

  function formatSpecifier(specifier) {
    if (!(match = re$1.exec(specifier))) throw new Error("invalid format: " + specifier);
    var match;
    return new FormatSpecifier({
      fill: match[1],
      align: match[2],
      sign: match[3],
      symbol: match[4],
      zero: match[5],
      width: match[6],
      comma: match[7],
      precision: match[8] && match[8].slice(1),
      trim: match[9],
      type: match[10]
    });
  }

  formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

  function FormatSpecifier(specifier) {
    this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
    this.align = specifier.align === undefined ? ">" : specifier.align + "";
    this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
    this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
    this.zero = !!specifier.zero;
    this.width = specifier.width === undefined ? undefined : +specifier.width;
    this.comma = !!specifier.comma;
    this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
    this.trim = !!specifier.trim;
    this.type = specifier.type === undefined ? "" : specifier.type + "";
  }

  FormatSpecifier.prototype.toString = function() {
    return this.fill
        + this.align
        + this.sign
        + this.symbol
        + (this.zero ? "0" : "")
        + (this.width === undefined ? "" : Math.max(1, this.width | 0))
        + (this.comma ? "," : "")
        + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
        + (this.trim ? "~" : "")
        + this.type;
  };

  // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
  function formatTrim(s) {
    out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".": i0 = i1 = i; break;
        case "0": if (i0 === 0) i0 = i; i1 = i; break;
        default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
      }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
  }

  var prefixExponent;

  function formatPrefixAuto(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1],
        i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
        n = coefficient.length;
    return i === n ? coefficient
        : i > n ? coefficient + new Array(i - n + 1).join("0")
        : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
        : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
  }

  function formatRounded(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
        : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
        : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  var formatTypes = {
    "%": (x, p) => (x * 100).toFixed(p),
    "b": (x) => Math.round(x).toString(2),
    "c": (x) => x + "",
    "d": formatDecimal,
    "e": (x, p) => x.toExponential(p),
    "f": (x, p) => x.toFixed(p),
    "g": (x, p) => x.toPrecision(p),
    "o": (x) => Math.round(x).toString(8),
    "p": (x, p) => formatRounded(x * 100, p),
    "r": formatRounded,
    "s": formatPrefixAuto,
    "X": (x) => Math.round(x).toString(16).toUpperCase(),
    "x": (x) => Math.round(x).toString(16)
  };

  function identity(x) {
    return x;
  }

  var map = Array.prototype.map,
      prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

  function formatLocale(locale) {
    var group = locale.grouping === undefined || locale.thousands === undefined ? identity : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
        currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
        currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
        decimal = locale.decimal === undefined ? "." : locale.decimal + "",
        numerals = locale.numerals === undefined ? identity : formatNumerals(map.call(locale.numerals, String)),
        percent = locale.percent === undefined ? "%" : locale.percent + "",
        minus = locale.minus === undefined ? "−" : locale.minus + "",
        nan = locale.nan === undefined ? "NaN" : locale.nan + "";

    function newFormat(specifier) {
      specifier = formatSpecifier(specifier);

      var fill = specifier.fill,
          align = specifier.align,
          sign = specifier.sign,
          symbol = specifier.symbol,
          zero = specifier.zero,
          width = specifier.width,
          comma = specifier.comma,
          precision = specifier.precision,
          trim = specifier.trim,
          type = specifier.type;

      // The "n" type is an alias for ",g".
      if (type === "n") comma = true, type = "g";

      // The "" type, and any invalid type, is an alias for ".12~g".
      else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

      // If zero fill is specified, padding goes after sign and before digits.
      if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

      // Compute the prefix and suffix.
      // For SI-prefix, the suffix is lazily computed.
      var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
          suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

      // What format function should we use?
      // Is this an integer type?
      // Can this type generate exponential notation?
      var formatType = formatTypes[type],
          maybeSuffix = /[defgprs%]/.test(type);

      // Set the default precision if not specified,
      // or clamp the specified precision to the supported range.
      // For significant precision, it must be in [1, 21].
      // For fixed precision, it must be in [0, 20].
      precision = precision === undefined ? 6
          : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
          : Math.max(0, Math.min(20, precision));

      function format(value) {
        var valuePrefix = prefix,
            valueSuffix = suffix,
            i, n, c;

        if (type === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;

          // Determine the sign. -0 is not less than 0, but 1 / -0 is!
          var valueNegative = value < 0 || 1 / value < 0;

          // Perform the initial formatting.
          value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

          // Trim insignificant zeros.
          if (trim) value = formatTrim(value);

          // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
          if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

          // Compute the prefix and suffix.
          valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
          valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

          // Break the formatted value into the integer “value” part that can be
          // grouped, and fractional or exponential “suffix” part that is not.
          if (maybeSuffix) {
            i = -1, n = value.length;
            while (++i < n) {
              if (c = value.charCodeAt(i), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }

        // If the fill character is not "0", grouping is applied before padding.
        if (comma && !zero) value = group(value, Infinity);

        // Compute the padding.
        var length = valuePrefix.length + value.length + valueSuffix.length,
            padding = length < width ? new Array(width - length + 1).join(fill) : "";

        // If the fill character is "0", grouping is applied after padding.
        if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

        // Reconstruct the final output based on the desired alignment.
        switch (align) {
          case "<": value = valuePrefix + value + valueSuffix + padding; break;
          case "=": value = valuePrefix + padding + value + valueSuffix; break;
          case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
          default: value = padding + valuePrefix + value + valueSuffix; break;
        }

        return numerals(value);
      }

      format.toString = function() {
        return specifier + "";
      };

      return format;
    }

    function formatPrefix(specifier, value) {
      var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
          e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
          k = Math.pow(10, -e),
          prefix = prefixes[8 + e / 3];
      return function(value) {
        return f(k * value) + prefix;
      };
    }

    return {
      format: newFormat,
      formatPrefix: formatPrefix
    };
  }

  var locale;
  var format;
  var formatPrefix;

  defaultLocale({
    thousands: ",",
    grouping: [3],
    currency: ["$", ""]
  });

  function defaultLocale(definition) {
    locale = formatLocale(definition);
    format = locale.format;
    formatPrefix = locale.formatPrefix;
    return locale;
  }

  function precisionFixed(step) {
    return Math.max(0, -exponent(Math.abs(step)));
  }

  function precisionPrefix(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
  }

  function precisionRound(step, max) {
    step = Math.abs(step), max = Math.abs(max) - step;
    return Math.max(0, exponent(max) - exponent(step)) + 1;
  }

  function tickFormat(start, stop, count, specifier) {
    var step = tickStep(start, stop, count),
        precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        var value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
        return formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return format(specifier);
  }

  function linearish(scale) {
    var domain = scale.domain;

    scale.ticks = function(count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };

    scale.tickFormat = function(count, specifier) {
      var d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };

    scale.nice = function(count) {
      if (count == null) count = 10;

      var d = domain();
      var i0 = 0;
      var i1 = d.length - 1;
      var start = d[i0];
      var stop = d[i1];
      var prestep;
      var step;
      var maxIter = 10;

      if (stop < start) {
        step = start, start = stop, stop = step;
        step = i0, i0 = i1, i1 = step;
      }
      
      while (maxIter-- > 0) {
        step = tickIncrement(start, stop, count);
        if (step === prestep) {
          d[i0] = start;
          d[i1] = stop;
          return domain(d);
        } else if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
        } else {
          break;
        }
        prestep = step;
      }

      return scale;
    };

    return scale;
  }

  function linear() {
    var scale = continuous();

    scale.copy = function() {
      return copy(scale, linear());
    };

    initRange.apply(scale, arguments);

    return linearish(scale);
  }

  var noop = {value: () => {}};

  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }

  function Dispatch(_) {
    this._ = _;
  }

  function parseTypenames(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return {type: t, name: name};
    });
  }

  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._,
          T = parseTypenames(typename + "", _),
          t,
          i = -1,
          n = T.length;

      // If no callback was specified, return the callback of the given type and name.
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        return;
      }

      // If a type was specified, set the callback for the given type and name.
      // Otherwise, if a null callback was specified, remove callbacks of the given name.
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
      }

      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };

  function get(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }

  function set(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({name: name, value: callback});
    return type;
  }

  // These are typically used in conjunction with noevent to ensure that we can
  // preventDefault on the event.
  const nonpassive = {passive: false};
  const nonpassivecapture = {capture: true, passive: false};

  function nopropagation(event) {
    event.stopImmediatePropagation();
  }

  function noevent(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function nodrag(view) {
    var root = view.document.documentElement,
        selection = select(view).on("dragstart.drag", noevent, nonpassivecapture);
    if ("onselectstart" in root) {
      selection.on("selectstart.drag", noevent, nonpassivecapture);
    } else {
      root.__noselect = root.style.MozUserSelect;
      root.style.MozUserSelect = "none";
    }
  }

  function yesdrag(view, noclick) {
    var root = view.document.documentElement,
        selection = select(view).on("dragstart.drag", null);
    if (noclick) {
      selection.on("click.drag", noevent, nonpassivecapture);
      setTimeout(function() { selection.on("click.drag", null); }, 0);
    }
    if ("onselectstart" in root) {
      selection.on("selectstart.drag", null);
    } else {
      root.style.MozUserSelect = root.__noselect;
      delete root.__noselect;
    }
  }

  var constant = x => () => x;

  function DragEvent(type, {
    sourceEvent,
    subject,
    target,
    identifier,
    active,
    x, y, dx, dy,
    dispatch
  }) {
    Object.defineProperties(this, {
      type: {value: type, enumerable: true, configurable: true},
      sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
      subject: {value: subject, enumerable: true, configurable: true},
      target: {value: target, enumerable: true, configurable: true},
      identifier: {value: identifier, enumerable: true, configurable: true},
      active: {value: active, enumerable: true, configurable: true},
      x: {value: x, enumerable: true, configurable: true},
      y: {value: y, enumerable: true, configurable: true},
      dx: {value: dx, enumerable: true, configurable: true},
      dy: {value: dy, enumerable: true, configurable: true},
      _: {value: dispatch}
    });
  }

  DragEvent.prototype.on = function() {
    var value = this._.on.apply(this._, arguments);
    return value === this._ ? this : value;
  };

  // Ignore right-click, since that should open the context menu.
  function defaultFilter(event) {
    return !event.ctrlKey && !event.button;
  }

  function defaultContainer() {
    return this.parentNode;
  }

  function defaultSubject(event, d) {
    return d == null ? {x: event.x, y: event.y} : d;
  }

  function defaultTouchable() {
    return navigator.maxTouchPoints || ("ontouchstart" in this);
  }

  function drag() {
    var filter = defaultFilter,
        container = defaultContainer,
        subject = defaultSubject,
        touchable = defaultTouchable,
        gestures = {},
        listeners = dispatch("start", "drag", "end"),
        active = 0,
        mousedownx,
        mousedowny,
        mousemoving,
        touchending,
        clickDistance2 = 0;

    function drag(selection) {
      selection
          .on("mousedown.drag", mousedowned)
        .filter(touchable)
          .on("touchstart.drag", touchstarted)
          .on("touchmove.drag", touchmoved, nonpassive)
          .on("touchend.drag touchcancel.drag", touchended)
          .style("touch-action", "none")
          .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    }

    function mousedowned(event, d) {
      if (touchending || !filter.call(this, event, d)) return;
      var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
      if (!gesture) return;
      select(event.view)
        .on("mousemove.drag", mousemoved, nonpassivecapture)
        .on("mouseup.drag", mouseupped, nonpassivecapture);
      nodrag(event.view);
      nopropagation(event);
      mousemoving = false;
      mousedownx = event.clientX;
      mousedowny = event.clientY;
      gesture("start", event);
    }

    function mousemoved(event) {
      noevent(event);
      if (!mousemoving) {
        var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
        mousemoving = dx * dx + dy * dy > clickDistance2;
      }
      gestures.mouse("drag", event);
    }

    function mouseupped(event) {
      select(event.view).on("mousemove.drag mouseup.drag", null);
      yesdrag(event.view, mousemoving);
      noevent(event);
      gestures.mouse("end", event);
    }

    function touchstarted(event, d) {
      if (!filter.call(this, event, d)) return;
      var touches = event.changedTouches,
          c = container.call(this, event, d),
          n = touches.length, i, gesture;

      for (i = 0; i < n; ++i) {
        if (gesture = beforestart(this, c, event, d, touches[i].identifier, touches[i])) {
          nopropagation(event);
          gesture("start", event, touches[i]);
        }
      }
    }

    function touchmoved(event) {
      var touches = event.changedTouches,
          n = touches.length, i, gesture;

      for (i = 0; i < n; ++i) {
        if (gesture = gestures[touches[i].identifier]) {
          noevent(event);
          gesture("drag", event, touches[i]);
        }
      }
    }

    function touchended(event) {
      var touches = event.changedTouches,
          n = touches.length, i, gesture;

      if (touchending) clearTimeout(touchending);
      touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
      for (i = 0; i < n; ++i) {
        if (gesture = gestures[touches[i].identifier]) {
          nopropagation(event);
          gesture("end", event, touches[i]);
        }
      }
    }

    function beforestart(that, container, event, d, identifier, touch) {
      var dispatch = listeners.copy(),
          p = pointer(touch || event, container), dx, dy,
          s;

      if ((s = subject.call(that, new DragEvent("beforestart", {
          sourceEvent: event,
          target: drag,
          identifier,
          active,
          x: p[0],
          y: p[1],
          dx: 0,
          dy: 0,
          dispatch
        }), d)) == null) return;

      dx = s.x - p[0] || 0;
      dy = s.y - p[1] || 0;

      return function gesture(type, event, touch) {
        var p0 = p, n;
        switch (type) {
          case "start": gestures[identifier] = gesture, n = active++; break;
          case "end": delete gestures[identifier], --active; // falls through
          case "drag": p = pointer(touch || event, container), n = active; break;
        }
        dispatch.call(
          type,
          that,
          new DragEvent(type, {
            sourceEvent: event,
            subject: s,
            target: drag,
            identifier,
            active: n,
            x: p[0] + dx,
            y: p[1] + dy,
            dx: p[0] - p0[0],
            dy: p[1] - p0[1],
            dispatch
          }),
          d
        );
      };
    }

    drag.filter = function(_) {
      return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), drag) : filter;
    };

    drag.container = function(_) {
      return arguments.length ? (container = typeof _ === "function" ? _ : constant(_), drag) : container;
    };

    drag.subject = function(_) {
      return arguments.length ? (subject = typeof _ === "function" ? _ : constant(_), drag) : subject;
    };

    drag.touchable = function(_) {
      return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), drag) : touchable;
    };

    drag.on = function() {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? drag : value;
    };

    drag.clickDistance = function(_) {
      return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
    };

    return drag;
  }

  var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    axisBottom: axisBottom,
    axisLeft: axisLeft,
    drag: drag,
    groups: groups,
    leastIndex: leastIndex,
    line: line,
    scaleLinear: linear,
    select: select,
    selectAll: selectAll,
    symbol: Symbol$1,
    symbolTriangle: triangle
  });

  function addContextMenu(selection, visualObj) {
      if (!(visualObj.viewModel.plotProperties.displayPlot
          || visualObj.viewModel.inputSettings.settings.summary_table.show_table
          || visualObj.viewModel.showGrouped)) {
          selection.on("contextmenu", () => { return; });
          return;
      }
      selection.on('contextmenu', (event) => {
          const eventTarget = event.target;
          const dataPoint = (select(eventTarget).datum());
          visualObj.selectionManager.showContextMenu(dataPoint ? dataPoint.identity : {}, {
              x: event.clientX,
              y: event.clientY
          });
          event.preventDefault();
      });
  }

  function assuranceIconToDraw(controlLimits, inputSettings, derivedSettings) {
      var _a;
      if (!(derivedSettings.chart_type_props.has_control_limits)) {
          return "none";
      }
      const imp_direction = inputSettings.outliers.improvement_direction;
      const N = controlLimits.ll99.length - 1;
      const alt_target = (_a = controlLimits === null || controlLimits === void 0 ? void 0 : controlLimits.alt_targets) === null || _a === void 0 ? void 0 : _a[N];
      if (isNullOrUndefined(alt_target) || imp_direction === "neutral") {
          return "none";
      }
      const impDirectionIncrease = imp_direction === "increase";
      if (alt_target > controlLimits.ul99[N]) {
          return impDirectionIncrease ? "consistentFail" : "consistentPass";
      }
      else if (alt_target < controlLimits.ll99[N]) {
          return impDirectionIncrease ? "consistentPass" : "consistentFail";
      }
      else {
          return "inconsistent";
      }
  }

  function isNullOrUndefined(value) {
      return value === null || value === undefined;
  }

  function between(x, lower, upper) {
      let is_between = true;
      if (!isNullOrUndefined(lower)) {
          is_between = is_between && (x >= lower);
      }
      if (!isNullOrUndefined(upper)) {
          is_between = is_between && (x <= upper);
      }
      return is_between;
  }

  function broadcastBinary(fun) {
      return function (x, y) {
          if (Array.isArray(x) && Array.isArray(y)) {
              return x.map((d, idx) => fun(d, y[idx]));
          }
          else if (Array.isArray(x) && !Array.isArray(y)) {
              return x.map(d => fun(d, y));
          }
          else if (!Array.isArray(x) && Array.isArray(y)) {
              return y.map(d => fun(x, d));
          }
          else {
              return fun(x, y);
          }
      };
  }
  const pow = broadcastBinary((x, y) => (x >= 0.0) ? Math.pow(x, y) : -Math.pow(-x, y));
  const add = broadcastBinary((x, y) => x + y);
  const subtract = broadcastBinary((x, y) => x - y);
  const divide = broadcastBinary((x, y) => x / y);
  const multiply = broadcastBinary((x, y) => {
      return (isNullOrUndefined(x) || isNullOrUndefined(y)) ? null : (x * y);
  });

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$M;
  var hasRequiredMain$M;

  function requireMain$M () {
  	if (hasRequiredMain$M) return main$M;
  	hasRequiredMain$M = 1;

  	// MAIN //

  	/**
  	* Tests if a double-precision floating-point numeric value is `NaN`.
  	*
  	* @param {number} x - value to test
  	* @returns {boolean} boolean indicating whether the value is `NaN`
  	*
  	* @example
  	* var bool = isnan( NaN );
  	* // returns true
  	*
  	* @example
  	* var bool = isnan( 7.0 );
  	* // returns false
  	*/
  	function isnan( x ) {
  		return ( x !== x );
  	}


  	// EXPORTS //

  	main$M = isnan;
  	return main$M;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$10;
  var hasRequiredLib$10;

  function requireLib$10 () {
  	if (hasRequiredLib$10) return lib$10;
  	hasRequiredLib$10 = 1;

  	/**
  	* Test if a double-precision floating-point numeric value is `NaN`.
  	*
  	* @module @stdlib/math-base-assert-is-nan
  	*
  	* @example
  	* var isnan = require( '@stdlib/math-base-assert-is-nan' );
  	*
  	* var bool = isnan( NaN );
  	* // returns true
  	*
  	* bool = isnan( 7.0 );
  	* // returns false
  	*/

  	// MODULES //

  	var main = requireMain$M();


  	// EXPORTS //

  	lib$10 = main;
  	return lib$10;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$$;
  var hasRequiredLib$$;

  function requireLib$$ () {
  	if (hasRequiredLib$$) return lib$$;
  	hasRequiredLib$$ = 1;

  	/**
  	* Double-precision floating-point positive infinity.
  	*
  	* @module @stdlib/constants-float64-pinf
  	* @type {number}
  	*
  	* @example
  	* var FLOAT64_PINF = require( '@stdlib/constants-float64-pinf' );
  	* // returns Infinity
  	*/


  	// MAIN //

  	/**
  	* Double-precision floating-point positive infinity.
  	*
  	* ## Notes
  	*
  	* Double-precision floating-point positive infinity has the bit sequence
  	*
  	* ```binarystring
  	* 0 11111111111 00000000000000000000 00000000000000000000000000000000
  	* ```
  	*
  	* @constant
  	* @type {number}
  	* @default Number.POSITIVE_INFINITY
  	* @see [IEEE 754]{@link https://en.wikipedia.org/wiki/IEEE_754-1985}
  	*/
  	var FLOAT64_PINF = Number.POSITIVE_INFINITY; // eslint-disable-line stdlib/require-globals


  	// EXPORTS //

  	lib$$ = FLOAT64_PINF;
  	return lib$$;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$L;
  var hasRequiredMain$L;

  function requireMain$L () {
  	if (hasRequiredMain$L) return main$L;
  	hasRequiredMain$L = 1;

  	// EXPORTS //

  	main$L = Number; // eslint-disable-line stdlib/require-globals
  	return main$L;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$_;
  var hasRequiredLib$_;

  function requireLib$_ () {
  	if (hasRequiredLib$_) return lib$_;
  	hasRequiredLib$_ = 1;

  	/**
  	* Constructor which returns a `Number` object.
  	*
  	* @module @stdlib/number-ctor
  	*
  	* @example
  	* var Number = require( '@stdlib/number-ctor' );
  	*
  	* var v = new Number( 10.0 );
  	* // returns <Number>
  	*/

  	// MODULES //

  	var main = requireMain$L();


  	// EXPORTS //

  	lib$_ = main;
  	return lib$_;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$Z;
  var hasRequiredLib$Z;

  function requireLib$Z () {
  	if (hasRequiredLib$Z) return lib$Z;
  	hasRequiredLib$Z = 1;

  	/**
  	* Double-precision floating-point negative infinity.
  	*
  	* @module @stdlib/constants-float64-ninf
  	* @type {number}
  	*
  	* @example
  	* var FLOAT64_NINF = require( '@stdlib/constants-float64-ninf' );
  	* // returns -Infinity
  	*/

  	// MODULES //

  	var Number = requireLib$_();


  	// MAIN //

  	/**
  	* Double-precision floating-point negative infinity.
  	*
  	* ## Notes
  	*
  	* Double-precision floating-point negative infinity has the bit sequence
  	*
  	* ```binarystring
  	* 1 11111111111 00000000000000000000 00000000000000000000000000000000
  	* ```
  	*
  	* @constant
  	* @type {number}
  	* @default Number.NEGATIVE_INFINITY
  	* @see [IEEE 754]{@link https://en.wikipedia.org/wiki/IEEE_754-1985}
  	*/
  	var FLOAT64_NINF = Number.NEGATIVE_INFINITY;


  	// EXPORTS //

  	lib$Z = FLOAT64_NINF;
  	return lib$Z;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$K;
  var hasRequiredMain$K;

  function requireMain$K () {
  	if (hasRequiredMain$K) return main$K;
  	hasRequiredMain$K = 1;

  	// MODULES //

  	var PINF = requireLib$$();
  	var NINF = requireLib$Z();


  	// MAIN //

  	/**
  	* Tests if a double-precision floating-point numeric value is infinite.
  	*
  	* @param {number} x - value to test
  	* @returns {boolean} boolean indicating whether the value is infinite
  	*
  	* @example
  	* var bool = isInfinite( Infinity );
  	* // returns true
  	*
  	* @example
  	* var bool = isInfinite( -Infinity );
  	* // returns true
  	*
  	* @example
  	* var bool = isInfinite( 5.0 );
  	* // returns false
  	*
  	* @example
  	* var bool = isInfinite( NaN );
  	* // returns false
  	*/
  	function isInfinite( x ) {
  		return (x === PINF || x === NINF);
  	}


  	// EXPORTS //

  	main$K = isInfinite;
  	return main$K;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$Y;
  var hasRequiredLib$Y;

  function requireLib$Y () {
  	if (hasRequiredLib$Y) return lib$Y;
  	hasRequiredLib$Y = 1;

  	/**
  	* Test if a double-precision floating-point numeric value is infinite.
  	*
  	* @module @stdlib/math-base-assert-is-infinite
  	*
  	* @example
  	* var isInfinite = require( '@stdlib/math-base-assert-is-infinite' );
  	*
  	* var bool = isInfinite( Infinity );
  	* // returns true
  	*
  	* bool = isInfinite( -Infinity );
  	* // returns true
  	*
  	* bool = isInfinite( 5.0 );
  	* // returns false
  	*
  	* bool = isInfinite( NaN );
  	* // returns false
  	*/

  	// MODULES //

  	var main = requireMain$K();


  	// EXPORTS //

  	lib$Y = main;
  	return lib$Y;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2021 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$J;
  var hasRequiredMain$J;

  function requireMain$J () {
  	if (hasRequiredMain$J) return main$J;
  	hasRequiredMain$J = 1;

  	// MAIN //

  	/**
  	* Computes the absolute value of a double-precision floating-point number `x`.
  	*
  	* @param {number} x - input value
  	* @returns {number} absolute value
  	*
  	* @example
  	* var v = abs( -1.0 );
  	* // returns 1.0
  	*
  	* @example
  	* var v = abs( 2.0 );
  	* // returns 2.0
  	*
  	* @example
  	* var v = abs( 0.0 );
  	* // returns 0.0
  	*
  	* @example
  	* var v = abs( -0.0 );
  	* // returns 0.0
  	*
  	* @example
  	* var v = abs( NaN );
  	* // returns NaN
  	*/
  	function abs( x ) {
  		return Math.abs( x ); // eslint-disable-line stdlib/no-builtin-math
  	}


  	// EXPORTS //

  	main$J = abs;
  	return main$J;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$X;
  var hasRequiredLib$X;

  function requireLib$X () {
  	if (hasRequiredLib$X) return lib$X;
  	hasRequiredLib$X = 1;

  	/**
  	* Compute an absolute value of a double-precision floating-point number.
  	*
  	* @module @stdlib/math-base-special-abs
  	*
  	* @example
  	* var abs = require( '@stdlib/math-base-special-abs' );
  	*
  	* var v = abs( -1.0 );
  	* // returns 1.0
  	*
  	* v = abs( 2.0 );
  	* // returns 2.0
  	*
  	* v = abs( 0.0 );
  	* // returns 0.0
  	*
  	* v = abs( -0.0 );
  	* // returns 0.0
  	*
  	* v = abs( NaN );
  	* // returns NaN
  	*/

  	// MODULES //

  	var main = requireMain$J();


  	// EXPORTS //

  	lib$X = main;
  	return lib$X;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$I;
  var hasRequiredMain$I;

  function requireMain$I () {
  	if (hasRequiredMain$I) return main$I;
  	hasRequiredMain$I = 1;

  	// MAIN //

  	/**
  	* Tests for native `Symbol` support.
  	*
  	* @returns {boolean} boolean indicating if an environment has `Symbol` support
  	*
  	* @example
  	* var bool = hasSymbolSupport();
  	* // returns <boolean>
  	*/
  	function hasSymbolSupport() {
  		return (
  			typeof Symbol === 'function' &&
  			typeof Symbol( 'foo' ) === 'symbol'
  		);
  	}


  	// EXPORTS //

  	main$I = hasSymbolSupport;
  	return main$I;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$W;
  var hasRequiredLib$W;

  function requireLib$W () {
  	if (hasRequiredLib$W) return lib$W;
  	hasRequiredLib$W = 1;

  	/**
  	* Test for native `Symbol` support.
  	*
  	* @module @stdlib/assert-has-symbol-support
  	*
  	* @example
  	* var hasSymbolSupport = require( '@stdlib/assert-has-symbol-support' );
  	*
  	* var bool = hasSymbolSupport();
  	* // returns <boolean>
  	*/

  	// MODULES //

  	var main = requireMain$I();


  	// EXPORTS //

  	lib$W = main;
  	return lib$W;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$H;
  var hasRequiredMain$H;

  function requireMain$H () {
  	if (hasRequiredMain$H) return main$H;
  	hasRequiredMain$H = 1;

  	// MODULES //

  	var hasSymbols = requireLib$W();


  	// VARIABLES //

  	var FLG = hasSymbols();


  	// MAIN //

  	/**
  	* Tests for native `toStringTag` support.
  	*
  	* @returns {boolean} boolean indicating if an environment has `toStringTag` support
  	*
  	* @example
  	* var bool = hasToStringTagSupport();
  	* // returns <boolean>
  	*/
  	function hasToStringTagSupport() {
  		return ( FLG && typeof Symbol.toStringTag === 'symbol' );
  	}


  	// EXPORTS //

  	main$H = hasToStringTagSupport;
  	return main$H;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$V;
  var hasRequiredLib$V;

  function requireLib$V () {
  	if (hasRequiredLib$V) return lib$V;
  	hasRequiredLib$V = 1;

  	/**
  	* Test for native `toStringTag` support.
  	*
  	* @module @stdlib/assert-has-tostringtag-support
  	*
  	* @example
  	* var hasToStringTagSupport = require( '@stdlib/assert-has-tostringtag-support' );
  	*
  	* var bool = hasToStringTagSupport();
  	* // returns <boolean>
  	*/

  	// MODULES //

  	var main = requireMain$H();


  	// EXPORTS //

  	lib$V = main;
  	return lib$V;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var tostring;
  var hasRequiredTostring;

  function requireTostring () {
  	if (hasRequiredTostring) return tostring;
  	hasRequiredTostring = 1;

  	// MAIN //

  	var toStr = Object.prototype.toString;


  	// EXPORTS //

  	tostring = toStr;
  	return tostring;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$G;
  var hasRequiredMain$G;

  function requireMain$G () {
  	if (hasRequiredMain$G) return main$G;
  	hasRequiredMain$G = 1;

  	// MODULES //

  	var toStr = requireTostring();


  	// MAIN //

  	/**
  	* Returns a string value indicating a specification defined classification (via the internal property `[[Class]]`) of an object.
  	*
  	* @param {*} v - input value
  	* @returns {string} string value indicating a specification defined classification of the input value
  	*
  	* @example
  	* var str = nativeClass( 'a' );
  	* // returns '[object String]'
  	*
  	* @example
  	* var str = nativeClass( 5 );
  	* // returns '[object Number]'
  	*
  	* @example
  	* function Beep() {
  	*     return this;
  	* }
  	* var str = nativeClass( new Beep() );
  	* // returns '[object Object]'
  	*/
  	function nativeClass( v ) {
  		return toStr.call( v );
  	}


  	// EXPORTS //

  	main$G = nativeClass;
  	return main$G;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$F;
  var hasRequiredMain$F;

  function requireMain$F () {
  	if (hasRequiredMain$F) return main$F;
  	hasRequiredMain$F = 1;

  	// FUNCTIONS //

  	var has = Object.prototype.hasOwnProperty;


  	// MAIN //

  	/**
  	* Tests if an object has a specified property.
  	*
  	* @param {*} value - value to test
  	* @param {*} property - property to test
  	* @returns {boolean} boolean indicating if an object has a specified property
  	*
  	* @example
  	* var beep = {
  	*     'boop': true
  	* };
  	*
  	* var bool = hasOwnProp( beep, 'boop' );
  	* // returns true
  	*
  	* @example
  	* var beep = {
  	*     'boop': true
  	* };
  	*
  	* var bool = hasOwnProp( beep, 'bap' );
  	* // returns false
  	*/
  	function hasOwnProp( value, property ) {
  		if (
  			value === void 0 ||
  			value === null
  		) {
  			return false;
  		}
  		return has.call( value, property );
  	}


  	// EXPORTS //

  	main$F = hasOwnProp;
  	return main$F;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$U;
  var hasRequiredLib$U;

  function requireLib$U () {
  	if (hasRequiredLib$U) return lib$U;
  	hasRequiredLib$U = 1;

  	/**
  	* Test whether an object has a specified property.
  	*
  	* @module @stdlib/assert-has-own-property
  	*
  	* @example
  	* var hasOwnProp = require( '@stdlib/assert-has-own-property' );
  	*
  	* var beep = {
  	*     'boop': true
  	* };
  	*
  	* var bool = hasOwnProp( beep, 'boop' );
  	* // returns true
  	*
  	* bool = hasOwnProp( beep, 'bop' );
  	* // returns false
  	*/

  	// MODULES //

  	var main = requireMain$F();


  	// EXPORTS //

  	lib$U = main;
  	return lib$U;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$E;
  var hasRequiredMain$E;

  function requireMain$E () {
  	if (hasRequiredMain$E) return main$E;
  	hasRequiredMain$E = 1;

  	// MAIN //

  	var Sym = ( typeof Symbol === 'function' ) ? Symbol : void 0; // eslint-disable-line stdlib/require-globals


  	// EXPORTS //

  	main$E = Sym;
  	return main$E;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$T;
  var hasRequiredLib$T;

  function requireLib$T () {
  	if (hasRequiredLib$T) return lib$T;
  	hasRequiredLib$T = 1;

  	/**
  	* Symbol factory.
  	*
  	* @module @stdlib/symbol-ctor
  	*
  	* @example
  	* var Symbol = require( '@stdlib/symbol-ctor' );
  	*
  	* var s = Symbol( 'beep' );
  	* // returns <symbol>
  	*/

  	// MODULES //

  	var main = requireMain$E();


  	// EXPORTS //

  	lib$T = main;
  	return lib$T;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var tostringtag;
  var hasRequiredTostringtag;

  function requireTostringtag () {
  	if (hasRequiredTostringtag) return tostringtag;
  	hasRequiredTostringtag = 1;

  	// MODULES //

  	var Symbol = requireLib$T();


  	// MAIN //

  	var toStrTag = ( typeof Symbol === 'function' ) ? Symbol.toStringTag : '';


  	// EXPORTS //

  	tostringtag = toStrTag;
  	return tostringtag;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyfill$1;
  var hasRequiredPolyfill$5;

  function requirePolyfill$5 () {
  	if (hasRequiredPolyfill$5) return polyfill$1;
  	hasRequiredPolyfill$5 = 1;

  	// MODULES //

  	var hasOwnProp = requireLib$U();
  	var toStringTag = requireTostringtag();
  	var toStr = requireTostring();


  	// MAIN //

  	/**
  	* Returns a string value indicating a specification defined classification of an object in environments supporting `Symbol.toStringTag`.
  	*
  	* @param {*} v - input value
  	* @returns {string} string value indicating a specification defined classification of the input value
  	*
  	* @example
  	* var str = nativeClass( 'a' );
  	* // returns '[object String]'
  	*
  	* @example
  	* var str = nativeClass( 5 );
  	* // returns '[object Number]'
  	*
  	* @example
  	* function Beep() {
  	*     return this;
  	* }
  	* var str = nativeClass( new Beep() );
  	* // returns '[object Object]'
  	*/
  	function nativeClass( v ) {
  		var isOwn;
  		var tag;
  		var out;

  		if ( v === null || v === void 0 ) {
  			return toStr.call( v );
  		}
  		tag = v[ toStringTag ];
  		isOwn = hasOwnProp( v, toStringTag );

  		// Attempt to override the `toStringTag` property. For built-ins having a `Symbol.toStringTag` property (e.g., `JSON`, `Math`, etc), the `Symbol.toStringTag` property is read-only (e.g., , so we need to wrap in a `try/catch`.
  		try {
  			v[ toStringTag ] = void 0;
  		} catch ( err ) { // eslint-disable-line no-unused-vars
  			return toStr.call( v );
  		}
  		out = toStr.call( v );

  		if ( isOwn ) {
  			v[ toStringTag ] = tag;
  		} else {
  			delete v[ toStringTag ];
  		}
  		return out;
  	}


  	// EXPORTS //

  	polyfill$1 = nativeClass;
  	return polyfill$1;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$S;
  var hasRequiredLib$S;

  function requireLib$S () {
  	if (hasRequiredLib$S) return lib$S;
  	hasRequiredLib$S = 1;

  	/**
  	* Return a string value indicating a specification defined classification of an object.
  	*
  	* @module @stdlib/utils-native-class
  	*
  	* @example
  	* var nativeClass = require( '@stdlib/utils-native-class' );
  	*
  	* var str = nativeClass( 'a' );
  	* // returns '[object String]'
  	*
  	* str = nativeClass( 5 );
  	* // returns '[object Number]'
  	*
  	* function Beep() {
  	*     return this;
  	* }
  	* str = nativeClass( new Beep() );
  	* // returns '[object Object]'
  	*/

  	// MODULES //

  	var hasToStringTag = requireLib$V();
  	var builtin = requireMain$G();
  	var polyfill = requirePolyfill$5();


  	// MAIN //

  	var main;
  	if ( hasToStringTag() ) {
  		main = polyfill;
  	} else {
  		main = builtin;
  	}


  	// EXPORTS //

  	lib$S = main;
  	return lib$S;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$D;
  var hasRequiredMain$D;

  function requireMain$D () {
  	if (hasRequiredMain$D) return main$D;
  	hasRequiredMain$D = 1;

  	// MODULES //

  	var nativeClass = requireLib$S();


  	// VARIABLES //

  	var hasUint32Array = ( typeof Uint32Array === 'function' ); // eslint-disable-line stdlib/require-globals


  	// MAIN //

  	/**
  	* Tests if a value is a Uint32Array.
  	*
  	* @param {*} value - value to test
  	* @returns {boolean} boolean indicating whether value is a Uint32Array
  	*
  	* @example
  	* var bool = isUint32Array( new Uint32Array( 10 ) );
  	* // returns true
  	*
  	* @example
  	* var bool = isUint32Array( [] );
  	* // returns false
  	*/
  	function isUint32Array( value ) {
  		return (
  			( hasUint32Array && value instanceof Uint32Array ) || // eslint-disable-line stdlib/require-globals
  			nativeClass( value ) === '[object Uint32Array]'
  		);
  	}


  	// EXPORTS //

  	main$D = isUint32Array;
  	return main$D;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$R;
  var hasRequiredLib$R;

  function requireLib$R () {
  	if (hasRequiredLib$R) return lib$R;
  	hasRequiredLib$R = 1;

  	/**
  	* Test if a value is a Uint32Array.
  	*
  	* @module @stdlib/assert-is-uint32array
  	*
  	* @example
  	* var isUint32Array = require( '@stdlib/assert-is-uint32array' );
  	*
  	* var bool = isUint32Array( new Uint32Array( 10 ) );
  	* // returns true
  	*
  	* bool = isUint32Array( [] );
  	* // returns false
  	*/

  	// MODULES //

  	var isUint32Array = requireMain$D();


  	// EXPORTS //

  	lib$R = isUint32Array;
  	return lib$R;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$Q;
  var hasRequiredLib$Q;

  function requireLib$Q () {
  	if (hasRequiredLib$Q) return lib$Q;
  	hasRequiredLib$Q = 1;

  	/**
  	* Maximum unsigned 32-bit integer.
  	*
  	* @module @stdlib/constants-uint32-max
  	* @type {uinteger32}
  	*
  	* @example
  	* var UINT32_MAX = require( '@stdlib/constants-uint32-max' );
  	* // returns 4294967295
  	*/


  	// MAIN //

  	/**
  	* Maximum unsigned 32-bit integer.
  	*
  	* ## Notes
  	*
  	* The number has the value
  	*
  	* ```tex
  	* 2^{32} - 1
  	* ```
  	*
  	* which corresponds to the bit sequence
  	*
  	* ```binarystring
  	* 11111111111111111111111111111111
  	* ```
  	*
  	* @constant
  	* @type {uinteger32}
  	* @default 4294967295
  	*/
  	var UINT32_MAX = 4294967295;


  	// EXPORTS //

  	lib$Q = UINT32_MAX;
  	return lib$Q;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var uint32array;
  var hasRequiredUint32array;

  function requireUint32array () {
  	if (hasRequiredUint32array) return uint32array;
  	hasRequiredUint32array = 1;

  	// MAIN //

  	var main = ( typeof Uint32Array === 'function' ) ? Uint32Array : null; // eslint-disable-line stdlib/require-globals


  	// EXPORTS //

  	uint32array = main;
  	return uint32array;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$C;
  var hasRequiredMain$C;

  function requireMain$C () {
  	if (hasRequiredMain$C) return main$C;
  	hasRequiredMain$C = 1;

  	// MODULES //

  	var isUint32Array = requireLib$R();
  	var UINT32_MAX = requireLib$Q();
  	var GlobalUint32Array = requireUint32array();


  	// MAIN //

  	/**
  	* Tests for native `Uint32Array` support.
  	*
  	* @returns {boolean} boolean indicating if an environment has `Uint32Array` support
  	*
  	* @example
  	* var bool = hasUint32ArraySupport();
  	* // returns <boolean>
  	*/
  	function hasUint32ArraySupport() {
  		var bool;
  		var arr;

  		if ( typeof GlobalUint32Array !== 'function' ) {
  			return false;
  		}
  		// Test basic support...
  		try {
  			arr = [ 1, 3.14, -3.14, UINT32_MAX+1, UINT32_MAX+2 ];
  			arr = new GlobalUint32Array( arr );
  			bool = (
  				isUint32Array( arr ) &&
  				arr[ 0 ] === 1 &&
  				arr[ 1 ] === 3 &&            // truncation
  				arr[ 2 ] === UINT32_MAX-2 && // truncation and wrap around
  				arr[ 3 ] === 0 &&            // wrap around
  				arr[ 4 ] === 1               // wrap around
  			);
  		} catch ( err ) { // eslint-disable-line no-unused-vars
  			bool = false;
  		}
  		return bool;
  	}


  	// EXPORTS //

  	main$C = hasUint32ArraySupport;
  	return main$C;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$P;
  var hasRequiredLib$P;

  function requireLib$P () {
  	if (hasRequiredLib$P) return lib$P;
  	hasRequiredLib$P = 1;

  	/**
  	* Test for native `Uint32Array` support.
  	*
  	* @module @stdlib/assert-has-uint32array-support
  	*
  	* @example
  	* var hasUint32ArraySupport = require( '@stdlib/assert-has-uint32array-support' );
  	*
  	* var bool = hasUint32ArraySupport();
  	* // returns <boolean>
  	*/

  	// MODULES //

  	var hasUint32ArraySupport = requireMain$C();


  	// EXPORTS //

  	lib$P = hasUint32ArraySupport;
  	return lib$P;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$B;
  var hasRequiredMain$B;

  function requireMain$B () {
  	if (hasRequiredMain$B) return main$B;
  	hasRequiredMain$B = 1;

  	// MAIN //

  	var ctor = ( typeof Uint32Array === 'function' ) ? Uint32Array : void 0; // eslint-disable-line stdlib/require-globals


  	// EXPORTS //

  	main$B = ctor;
  	return main$B;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyfill_1$3;
  var hasRequiredPolyfill$4;

  function requirePolyfill$4 () {
  	if (hasRequiredPolyfill$4) return polyfill_1$3;
  	hasRequiredPolyfill$4 = 1;

  	// TODO: write polyfill

  	// MAIN //

  	/**
  	* Typed array which represents an array of 32-bit unsigned integers in the platform byte order.
  	*
  	* @throws {Error} not implemented
  	*/
  	function polyfill() {
  		throw new Error( 'not implemented' );
  	}


  	// EXPORTS //

  	polyfill_1$3 = polyfill;
  	return polyfill_1$3;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$O;
  var hasRequiredLib$O;

  function requireLib$O () {
  	if (hasRequiredLib$O) return lib$O;
  	hasRequiredLib$O = 1;

  	/**
  	* Typed array constructor which returns a typed array representing an array of 32-bit unsigned integers in the platform byte order.
  	*
  	* @module @stdlib/array-uint32
  	*
  	* @example
  	* var ctor = require( '@stdlib/array-uint32' );
  	*
  	* var arr = new ctor( 10 );
  	* // returns <Uint32Array>
  	*/

  	// MODULES //

  	var hasUint32ArraySupport = requireLib$P();
  	var builtin = requireMain$B();
  	var polyfill = requirePolyfill$4();


  	// MAIN //

  	var ctor;
  	if ( hasUint32ArraySupport() ) {
  		ctor = builtin;
  	} else {
  		ctor = polyfill;
  	}


  	// EXPORTS //

  	lib$O = ctor;
  	return lib$O;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$A;
  var hasRequiredMain$A;

  function requireMain$A () {
  	if (hasRequiredMain$A) return main$A;
  	hasRequiredMain$A = 1;

  	// MODULES //

  	var nativeClass = requireLib$S();


  	// VARIABLES //

  	var hasFloat64Array = ( typeof Float64Array === 'function' ); // eslint-disable-line stdlib/require-globals


  	// MAIN //

  	/**
  	* Tests if a value is a Float64Array.
  	*
  	* @param {*} value - value to test
  	* @returns {boolean} boolean indicating whether value is a Float64Array
  	*
  	* @example
  	* var bool = isFloat64Array( new Float64Array( 10 ) );
  	* // returns true
  	*
  	* @example
  	* var bool = isFloat64Array( [] );
  	* // returns false
  	*/
  	function isFloat64Array( value ) {
  		return (
  			( hasFloat64Array && value instanceof Float64Array ) || // eslint-disable-line stdlib/require-globals
  			nativeClass( value ) === '[object Float64Array]'
  		);
  	}


  	// EXPORTS //

  	main$A = isFloat64Array;
  	return main$A;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$N;
  var hasRequiredLib$N;

  function requireLib$N () {
  	if (hasRequiredLib$N) return lib$N;
  	hasRequiredLib$N = 1;

  	/**
  	* Test if a value is a Float64Array.
  	*
  	* @module @stdlib/assert-is-float64array
  	*
  	* @example
  	* var isFloat64Array = require( '@stdlib/assert-is-float64array' );
  	*
  	* var bool = isFloat64Array( new Float64Array( 10 ) );
  	* // returns true
  	*
  	* bool = isFloat64Array( [] );
  	* // returns false
  	*/

  	// MODULES //

  	var isFloat64Array = requireMain$A();


  	// EXPORTS //

  	lib$N = isFloat64Array;
  	return lib$N;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var float64array;
  var hasRequiredFloat64array;

  function requireFloat64array () {
  	if (hasRequiredFloat64array) return float64array;
  	hasRequiredFloat64array = 1;

  	// MAIN //

  	var main = ( typeof Float64Array === 'function' ) ? Float64Array : null; // eslint-disable-line stdlib/require-globals


  	// EXPORTS //

  	float64array = main;
  	return float64array;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$z;
  var hasRequiredMain$z;

  function requireMain$z () {
  	if (hasRequiredMain$z) return main$z;
  	hasRequiredMain$z = 1;

  	// MODULES //

  	var isFloat64Array = requireLib$N();
  	var GlobalFloat64Array = requireFloat64array();


  	// MAIN //

  	/**
  	* Tests for native `Float64Array` support.
  	*
  	* @returns {boolean} boolean indicating if an environment has `Float64Array` support
  	*
  	* @example
  	* var bool = hasFloat64ArraySupport();
  	* // returns <boolean>
  	*/
  	function hasFloat64ArraySupport() {
  		var bool;
  		var arr;

  		if ( typeof GlobalFloat64Array !== 'function' ) {
  			return false;
  		}
  		// Test basic support...
  		try {
  			arr = new GlobalFloat64Array( [ 1.0, 3.14, -3.14, NaN ] );
  			bool = (
  				isFloat64Array( arr ) &&
  				arr[ 0 ] === 1.0 &&
  				arr[ 1 ] === 3.14 &&
  				arr[ 2 ] === -3.14 &&
  				arr[ 3 ] !== arr[ 3 ]
  			);
  		} catch ( err ) { // eslint-disable-line no-unused-vars
  			bool = false;
  		}
  		return bool;
  	}


  	// EXPORTS //

  	main$z = hasFloat64ArraySupport;
  	return main$z;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$M;
  var hasRequiredLib$M;

  function requireLib$M () {
  	if (hasRequiredLib$M) return lib$M;
  	hasRequiredLib$M = 1;

  	/**
  	* Test for native `Float64Array` support.
  	*
  	* @module @stdlib/assert-has-float64array-support
  	*
  	* @example
  	* var hasFloat64ArraySupport = require( '@stdlib/assert-has-float64array-support' );
  	*
  	* var bool = hasFloat64ArraySupport();
  	* // returns <boolean>
  	*/

  	// MODULES //

  	var hasFloat64ArraySupport = requireMain$z();


  	// EXPORTS //

  	lib$M = hasFloat64ArraySupport;
  	return lib$M;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$y;
  var hasRequiredMain$y;

  function requireMain$y () {
  	if (hasRequiredMain$y) return main$y;
  	hasRequiredMain$y = 1;

  	// MAIN //

  	var ctor = ( typeof Float64Array === 'function' ) ? Float64Array : void 0; // eslint-disable-line stdlib/require-globals


  	// EXPORTS //

  	main$y = ctor;
  	return main$y;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyfill_1$2;
  var hasRequiredPolyfill$3;

  function requirePolyfill$3 () {
  	if (hasRequiredPolyfill$3) return polyfill_1$2;
  	hasRequiredPolyfill$3 = 1;

  	// TODO: write polyfill

  	// MAIN //

  	/**
  	* Typed array which represents an array of double-precision floating-point numbers in the platform byte order.
  	*
  	* @throws {Error} not implemented
  	*/
  	function polyfill() {
  		throw new Error( 'not implemented' );
  	}


  	// EXPORTS //

  	polyfill_1$2 = polyfill;
  	return polyfill_1$2;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$L;
  var hasRequiredLib$L;

  function requireLib$L () {
  	if (hasRequiredLib$L) return lib$L;
  	hasRequiredLib$L = 1;

  	/**
  	* Typed array constructor which returns a typed array representing an array of double-precision floating-point numbers in the platform byte order.
  	*
  	* @module @stdlib/array-float64
  	*
  	* @example
  	* var ctor = require( '@stdlib/array-float64' );
  	*
  	* var arr = new ctor( 10 );
  	* // returns <Float64Array>
  	*/

  	// MODULES //

  	var hasFloat64ArraySupport = requireLib$M();
  	var builtin = requireMain$y();
  	var polyfill = requirePolyfill$3();


  	// MAIN //

  	var ctor;
  	if ( hasFloat64ArraySupport() ) {
  		ctor = builtin;
  	} else {
  		ctor = polyfill;
  	}


  	// EXPORTS //

  	lib$L = ctor;
  	return lib$L;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$x;
  var hasRequiredMain$x;

  function requireMain$x () {
  	if (hasRequiredMain$x) return main$x;
  	hasRequiredMain$x = 1;

  	// MODULES //

  	var nativeClass = requireLib$S();


  	// VARIABLES //

  	var hasUint8Array = ( typeof Uint8Array === 'function' ); // eslint-disable-line stdlib/require-globals


  	// MAIN //

  	/**
  	* Tests if a value is a Uint8Array.
  	*
  	* @param {*} value - value to test
  	* @returns {boolean} boolean indicating whether value is a Uint8Array
  	*
  	* @example
  	* var bool = isUint8Array( new Uint8Array( 10 ) );
  	* // returns true
  	*
  	* @example
  	* var bool = isUint8Array( [] );
  	* // returns false
  	*/
  	function isUint8Array( value ) {
  		return (
  			( hasUint8Array && value instanceof Uint8Array ) || // eslint-disable-line stdlib/require-globals
  			nativeClass( value ) === '[object Uint8Array]'
  		);
  	}


  	// EXPORTS //

  	main$x = isUint8Array;
  	return main$x;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$K;
  var hasRequiredLib$K;

  function requireLib$K () {
  	if (hasRequiredLib$K) return lib$K;
  	hasRequiredLib$K = 1;

  	/**
  	* Test if a value is a Uint8Array.
  	*
  	* @module @stdlib/assert-is-uint8array
  	*
  	* @example
  	* var isUint8Array = require( '@stdlib/assert-is-uint8array' );
  	*
  	* var bool = isUint8Array( new Uint8Array( 10 ) );
  	* // returns true
  	*
  	* bool = isUint8Array( [] );
  	* // returns false
  	*/

  	// MODULES //

  	var isUint8Array = requireMain$x();


  	// EXPORTS //

  	lib$K = isUint8Array;
  	return lib$K;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$J;
  var hasRequiredLib$J;

  function requireLib$J () {
  	if (hasRequiredLib$J) return lib$J;
  	hasRequiredLib$J = 1;

  	/**
  	* Maximum unsigned 8-bit integer.
  	*
  	* @module @stdlib/constants-uint8-max
  	* @type {integer32}
  	*
  	* @example
  	* var UINT8_MAX = require( '@stdlib/constants-uint8-max' );
  	* // returns 255
  	*/


  	// MAIN //

  	/**
  	* Maximum unsigned 8-bit integer.
  	*
  	* ## Notes
  	*
  	* The number has the value
  	*
  	* ```tex
  	* 2^{8} - 1
  	* ```
  	*
  	* which corresponds to the bit sequence
  	*
  	* ```binarystring
  	* 11111111
  	* ```
  	*
  	* @constant
  	* @type {integer32}
  	* @default 255
  	*/
  	var UINT8_MAX = 255|0; // asm type annotation


  	// EXPORTS //

  	lib$J = UINT8_MAX;
  	return lib$J;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var uint8array;
  var hasRequiredUint8array;

  function requireUint8array () {
  	if (hasRequiredUint8array) return uint8array;
  	hasRequiredUint8array = 1;

  	// MAIN //

  	var main = ( typeof Uint8Array === 'function' ) ? Uint8Array : null; // eslint-disable-line stdlib/require-globals


  	// EXPORTS //

  	uint8array = main;
  	return uint8array;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$w;
  var hasRequiredMain$w;

  function requireMain$w () {
  	if (hasRequiredMain$w) return main$w;
  	hasRequiredMain$w = 1;

  	// MODULES //

  	var isUint8Array = requireLib$K();
  	var UINT8_MAX = requireLib$J();
  	var GlobalUint8Array = requireUint8array();


  	// MAIN //

  	/**
  	* Tests for native `Uint8Array` support.
  	*
  	* @returns {boolean} boolean indicating if an environment has `Uint8Array` support
  	*
  	* @example
  	* var bool = hasUint8ArraySupport();
  	* // returns <boolean>
  	*/
  	function hasUint8ArraySupport() {
  		var bool;
  		var arr;

  		if ( typeof GlobalUint8Array !== 'function' ) {
  			return false;
  		}
  		// Test basic support...
  		try {
  			arr = [ 1, 3.14, -3.14, UINT8_MAX+1, UINT8_MAX+2 ];
  			arr = new GlobalUint8Array( arr );
  			bool = (
  				isUint8Array( arr ) &&
  				arr[ 0 ] === 1 &&
  				arr[ 1 ] === 3 &&           // truncation
  				arr[ 2 ] === UINT8_MAX-2 && // truncation and wrap around
  				arr[ 3 ] === 0 &&           // wrap around
  				arr[ 4 ] === 1              // wrap around
  			);
  		} catch ( err ) { // eslint-disable-line no-unused-vars
  			bool = false;
  		}
  		return bool;
  	}


  	// EXPORTS //

  	main$w = hasUint8ArraySupport;
  	return main$w;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$I;
  var hasRequiredLib$I;

  function requireLib$I () {
  	if (hasRequiredLib$I) return lib$I;
  	hasRequiredLib$I = 1;

  	/**
  	* Test for native `Uint8Array` support.
  	*
  	* @module @stdlib/assert-has-uint8array-support
  	*
  	* @example
  	* var hasUint8ArraySupport = require( '@stdlib/assert-has-uint8array-support' );
  	*
  	* var bool = hasUint8ArraySupport();
  	* // returns <boolean>
  	*/

  	// MODULES //

  	var hasUint8ArraySupport = requireMain$w();


  	// EXPORTS //

  	lib$I = hasUint8ArraySupport;
  	return lib$I;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$v;
  var hasRequiredMain$v;

  function requireMain$v () {
  	if (hasRequiredMain$v) return main$v;
  	hasRequiredMain$v = 1;

  	// MAIN //

  	var ctor = ( typeof Uint8Array === 'function' ) ? Uint8Array : void 0; // eslint-disable-line stdlib/require-globals


  	// EXPORTS //

  	main$v = ctor;
  	return main$v;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyfill_1$1;
  var hasRequiredPolyfill$2;

  function requirePolyfill$2 () {
  	if (hasRequiredPolyfill$2) return polyfill_1$1;
  	hasRequiredPolyfill$2 = 1;

  	// TODO: write polyfill

  	// MAIN //

  	/**
  	* Typed array which represents an array of 8-bit unsigned integers in the platform byte order.
  	*
  	* @throws {Error} not implemented
  	*/
  	function polyfill() {
  		throw new Error( 'not implemented' );
  	}


  	// EXPORTS //

  	polyfill_1$1 = polyfill;
  	return polyfill_1$1;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$H;
  var hasRequiredLib$H;

  function requireLib$H () {
  	if (hasRequiredLib$H) return lib$H;
  	hasRequiredLib$H = 1;

  	/**
  	* Typed array constructor which returns a typed array representing an array of 8-bit unsigned integers in the platform byte order.
  	*
  	* @module @stdlib/array-uint8
  	*
  	* @example
  	* var ctor = require( '@stdlib/array-uint8' );
  	*
  	* var arr = new ctor( 10 );
  	* // returns <Uint8Array>
  	*/

  	// MODULES //

  	var hasUint8ArraySupport = requireLib$I();
  	var builtin = requireMain$v();
  	var polyfill = requirePolyfill$2();


  	// MAIN //

  	var ctor;
  	if ( hasUint8ArraySupport() ) {
  		ctor = builtin;
  	} else {
  		ctor = polyfill;
  	}


  	// EXPORTS //

  	lib$H = ctor;
  	return lib$H;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$u;
  var hasRequiredMain$u;

  function requireMain$u () {
  	if (hasRequiredMain$u) return main$u;
  	hasRequiredMain$u = 1;

  	// MODULES //

  	var nativeClass = requireLib$S();


  	// VARIABLES //

  	var hasUint16Array = ( typeof Uint16Array === 'function' ); // eslint-disable-line stdlib/require-globals


  	// MAIN //

  	/**
  	* Tests if a value is a Uint16Array.
  	*
  	* @param {*} value - value to test
  	* @returns {boolean} boolean indicating whether value is a Uint16Array
  	*
  	* @example
  	* var bool = isUint16Array( new Uint16Array( 10 ) );
  	* // returns true
  	*
  	* @example
  	* var bool = isUint16Array( [] );
  	* // returns false
  	*/
  	function isUint16Array( value ) {
  		return (
  			( hasUint16Array && value instanceof Uint16Array ) || // eslint-disable-line stdlib/require-globals
  			nativeClass( value ) === '[object Uint16Array]'
  		);
  	}


  	// EXPORTS //

  	main$u = isUint16Array;
  	return main$u;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$G;
  var hasRequiredLib$G;

  function requireLib$G () {
  	if (hasRequiredLib$G) return lib$G;
  	hasRequiredLib$G = 1;

  	/**
  	* Test if a value is a Uint16Array.
  	*
  	* @module @stdlib/assert-is-uint16array
  	*
  	* @example
  	* var isUint16Array = require( '@stdlib/assert-is-uint16array' );
  	*
  	* var bool = isUint16Array( new Uint16Array( 10 ) );
  	* // returns true
  	*
  	* bool = isUint16Array( [] );
  	* // returns false
  	*/

  	// MODULES //

  	var isUint16Array = requireMain$u();


  	// EXPORTS //

  	lib$G = isUint16Array;
  	return lib$G;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$F;
  var hasRequiredLib$F;

  function requireLib$F () {
  	if (hasRequiredLib$F) return lib$F;
  	hasRequiredLib$F = 1;

  	/**
  	* Maximum unsigned 16-bit integer.
  	*
  	* @module @stdlib/constants-uint16-max
  	* @type {integer32}
  	*
  	* @example
  	* var UINT16_MAX = require( '@stdlib/constants-uint16-max' );
  	* // returns 65535
  	*/


  	// MAIN //

  	/**
  	* Maximum unsigned 16-bit integer.
  	*
  	* ## Notes
  	*
  	* The number has the value
  	*
  	* ```tex
  	* 2^{16} - 1
  	* ```
  	*
  	* which corresponds to the bit sequence
  	*
  	* ```binarystring
  	* 1111111111111111
  	* ```
  	*
  	* @constant
  	* @type {integer32}
  	* @default 65535
  	*/
  	var UINT16_MAX = 65535|0; // asm type annotation


  	// EXPORTS //

  	lib$F = UINT16_MAX;
  	return lib$F;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var uint16array;
  var hasRequiredUint16array;

  function requireUint16array () {
  	if (hasRequiredUint16array) return uint16array;
  	hasRequiredUint16array = 1;

  	// MAIN //

  	var main = ( typeof Uint16Array === 'function' ) ? Uint16Array : null; // eslint-disable-line stdlib/require-globals


  	// EXPORTS //

  	uint16array = main;
  	return uint16array;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$t;
  var hasRequiredMain$t;

  function requireMain$t () {
  	if (hasRequiredMain$t) return main$t;
  	hasRequiredMain$t = 1;

  	// MODULES //

  	var isUint16Array = requireLib$G();
  	var UINT16_MAX = requireLib$F();
  	var GlobalUint16Array = requireUint16array();


  	// MAIN //

  	/**
  	* Tests for native `Uint16Array` support.
  	*
  	* @returns {boolean} boolean indicating if an environment has `Uint16Array` support
  	*
  	* @example
  	* var bool = hasUint16ArraySupport();
  	* // returns <boolean>
  	*/
  	function hasUint16ArraySupport() {
  		var bool;
  		var arr;

  		if ( typeof GlobalUint16Array !== 'function' ) {
  			return false;
  		}
  		// Test basic support...
  		try {
  			arr = [ 1, 3.14, -3.14, UINT16_MAX+1, UINT16_MAX+2 ];
  			arr = new GlobalUint16Array( arr );
  			bool = (
  				isUint16Array( arr ) &&
  				arr[ 0 ] === 1 &&
  				arr[ 1 ] === 3 &&            // truncation
  				arr[ 2 ] === UINT16_MAX-2 && // truncation and wrap around
  				arr[ 3 ] === 0 &&            // wrap around
  				arr[ 4 ] === 1               // wrap around
  			);
  		} catch ( err ) { // eslint-disable-line no-unused-vars
  			bool = false;
  		}
  		return bool;
  	}


  	// EXPORTS //

  	main$t = hasUint16ArraySupport;
  	return main$t;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$E;
  var hasRequiredLib$E;

  function requireLib$E () {
  	if (hasRequiredLib$E) return lib$E;
  	hasRequiredLib$E = 1;

  	/**
  	* Test for native `Uint16Array` support.
  	*
  	* @module @stdlib/assert-has-uint16array-support
  	*
  	* @example
  	* var hasUint16ArraySupport = require( '@stdlib/assert-has-uint16array-support' );
  	*
  	* var bool = hasUint16ArraySupport();
  	* // returns <boolean>
  	*/

  	// MODULES //

  	var hasUint16ArraySupport = requireMain$t();


  	// EXPORTS //

  	lib$E = hasUint16ArraySupport;
  	return lib$E;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$s;
  var hasRequiredMain$s;

  function requireMain$s () {
  	if (hasRequiredMain$s) return main$s;
  	hasRequiredMain$s = 1;

  	// MAIN //

  	var ctor = ( typeof Uint16Array === 'function' ) ? Uint16Array : void 0; // eslint-disable-line stdlib/require-globals


  	// EXPORTS //

  	main$s = ctor;
  	return main$s;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyfill_1;
  var hasRequiredPolyfill$1;

  function requirePolyfill$1 () {
  	if (hasRequiredPolyfill$1) return polyfill_1;
  	hasRequiredPolyfill$1 = 1;

  	// TODO: write polyfill

  	// MAIN //

  	/**
  	* Typed array which represents an array of 16-bit unsigned integers in the platform byte order.
  	*
  	* @throws {Error} not implemented
  	*/
  	function polyfill() {
  		throw new Error( 'not implemented' );
  	}


  	// EXPORTS //

  	polyfill_1 = polyfill;
  	return polyfill_1;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$D;
  var hasRequiredLib$D;

  function requireLib$D () {
  	if (hasRequiredLib$D) return lib$D;
  	hasRequiredLib$D = 1;

  	/**
  	* Typed array constructor which returns a typed array representing an array of 16-bit unsigned integers in the platform byte order.
  	*
  	* @module @stdlib/array-uint16
  	*
  	* @example
  	* var ctor = require( '@stdlib/array-uint16' );
  	*
  	* var arr = new ctor( 10 );
  	* // returns <Uint16Array>
  	*/

  	// MODULES //

  	var hasUint16ArraySupport = requireLib$E();
  	var builtin = requireMain$s();
  	var polyfill = requirePolyfill$1();


  	// MAIN //

  	var ctor;
  	if ( hasUint16ArraySupport() ) {
  		ctor = builtin;
  	} else {
  		ctor = polyfill;
  	}


  	// EXPORTS //

  	lib$D = ctor;
  	return lib$D;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var ctors_1;
  var hasRequiredCtors;

  function requireCtors () {
  	if (hasRequiredCtors) return ctors_1;
  	hasRequiredCtors = 1;

  	// MODULES //

  	var Uint8Array = requireLib$H();
  	var Uint16Array = requireLib$D();


  	// MAIN //

  	var ctors = {
  		'uint16': Uint16Array,
  		'uint8': Uint8Array
  	};


  	// EXPORTS //

  	ctors_1 = ctors;
  	return ctors_1;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$r;
  var hasRequiredMain$r;

  function requireMain$r () {
  	if (hasRequiredMain$r) return main$r;
  	hasRequiredMain$r = 1;

  	// MODULES //

  	var ctors = requireCtors();


  	// VARIABLES //

  	var bool;


  	// FUNCTIONS //

  	/**
  	* Returns a boolean indicating if an environment is little endian.
  	*
  	* @private
  	* @returns {boolean} boolean indicating if an environment is little endian
  	*
  	* @example
  	* var bool = isLittleEndian();
  	* // returns <boolean>
  	*/
  	function isLittleEndian() {
  		var uint16view;
  		var uint8view;

  		uint16view = new ctors[ 'uint16' ]( 1 );

  		/*
  		* Set the uint16 view to a value having distinguishable lower and higher order words.
  		*
  		* 4660 => 0x1234 => 0x12 0x34 => '00010010 00110100' => (0x12,0x34) == (18,52)
  		*/
  		uint16view[ 0 ] = 0x1234;

  		// Create a uint8 view on top of the uint16 buffer:
  		uint8view = new ctors[ 'uint8' ]( uint16view.buffer );

  		// If little endian, the least significant byte will be first...
  		return ( uint8view[ 0 ] === 0x34 );
  	}


  	// MAIN //

  	bool = isLittleEndian();


  	// EXPORTS //

  	main$r = bool;
  	return main$r;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$C;
  var hasRequiredLib$C;

  function requireLib$C () {
  	if (hasRequiredLib$C) return lib$C;
  	hasRequiredLib$C = 1;

  	/**
  	* Return a boolean indicating if an environment is little endian.
  	*
  	* @module @stdlib/assert-is-little-endian
  	*
  	* @example
  	* var IS_LITTLE_ENDIAN = require( '@stdlib/assert-is-little-endian' );
  	*
  	* var bool = IS_LITTLE_ENDIAN;
  	* // returns <boolean>
  	*/

  	// MODULES //

  	var IS_LITTLE_ENDIAN = requireMain$r();


  	// EXPORTS //

  	lib$C = IS_LITTLE_ENDIAN;
  	return lib$C;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var high$1;
  var hasRequiredHigh$1;

  function requireHigh$1 () {
  	if (hasRequiredHigh$1) return high$1;
  	hasRequiredHigh$1 = 1;

  	// MODULES //

  	var isLittleEndian = requireLib$C();


  	// MAIN //

  	var HIGH;
  	if ( isLittleEndian === true ) {
  		HIGH = 1; // second index
  	} else {
  		HIGH = 0; // first index
  	}


  	// EXPORTS //

  	high$1 = HIGH;
  	return high$1;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$q;
  var hasRequiredMain$q;

  function requireMain$q () {
  	if (hasRequiredMain$q) return main$q;
  	hasRequiredMain$q = 1;

  	// MODULES //

  	var Uint32Array = requireLib$O();
  	var Float64Array = requireLib$L();
  	var HIGH = requireHigh$1();


  	// VARIABLES //

  	var FLOAT64_VIEW = new Float64Array( 1 );
  	var UINT32_VIEW = new Uint32Array( FLOAT64_VIEW.buffer );


  	// MAIN //

  	/**
  	* Returns an unsigned 32-bit integer corresponding to the more significant 32 bits of a double-precision floating-point number.
  	*
  	* ## Notes
  	*
  	* ```text
  	* float64 (64 bits)
  	* f := fraction (significand/mantissa) (52 bits)
  	* e := exponent (11 bits)
  	* s := sign bit (1 bit)
  	*
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* |                                Float64                                |
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* |              Uint32               |               Uint32              |
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* ```
  	*
  	* If little endian (more significant bits last):
  	*
  	* ```text
  	*                         <-- lower      higher -->
  	* |   f7       f6       f5       f4       f3       f2    e2 | f1 |s|  e1  |
  	* ```
  	*
  	* If big endian (more significant bits first):
  	*
  	* ```text
  	*                         <-- higher      lower -->
  	* |s| e1    e2 | f1     f2       f3       f4       f5        f6      f7   |
  	* ```
  	*
  	* In which Uint32 can we find the higher order bits? If little endian, the second; if big endian, the first.
  	*
  	* ## References
  	*
  	* -   [Open Group][1]
  	*
  	* [1]: http://pubs.opengroup.org/onlinepubs/9629399/chap14.htm
  	*
  	* @param {number} x - input value
  	* @returns {uinteger32} higher order word
  	*
  	* @example
  	* var w = getHighWord( 3.14e201 ); // => 01101001110001001000001011000011
  	* // returns 1774486211
  	*/
  	function getHighWord( x ) {
  		FLOAT64_VIEW[ 0 ] = x;
  		return UINT32_VIEW[ HIGH ];
  	}


  	// EXPORTS //

  	main$q = getHighWord;
  	return main$q;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$B;
  var hasRequiredLib$B;

  function requireLib$B () {
  	if (hasRequiredLib$B) return lib$B;
  	hasRequiredLib$B = 1;

  	/**
  	* Return an unsigned 32-bit integer corresponding to the more significant 32 bits of a double-precision floating-point number.
  	*
  	* @module @stdlib/number-float64-base-get-high-word
  	*
  	* @example
  	* var getHighWord = require( '@stdlib/number-float64-base-get-high-word' );
  	*
  	* var w = getHighWord( 3.14e201 ); // => 01101001110001001000001011000011
  	* // returns 1774486211
  	*/

  	// MODULES //

  	var main = requireMain$q();


  	// EXPORTS //

  	lib$B = main;
  	return lib$B;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var high;
  var hasRequiredHigh;

  function requireHigh () {
  	if (hasRequiredHigh) return high;
  	hasRequiredHigh = 1;

  	// MODULES //

  	var isLittleEndian = requireLib$C();


  	// MAIN //

  	var HIGH;
  	if ( isLittleEndian === true ) {
  		HIGH = 1; // second index
  	} else {
  		HIGH = 0; // first index
  	}


  	// EXPORTS //

  	high = HIGH;
  	return high;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$p;
  var hasRequiredMain$p;

  function requireMain$p () {
  	if (hasRequiredMain$p) return main$p;
  	hasRequiredMain$p = 1;

  	// MODULES //

  	var Uint32Array = requireLib$O();
  	var Float64Array = requireLib$L();
  	var HIGH = requireHigh();


  	// VARIABLES //

  	var FLOAT64_VIEW = new Float64Array( 1 );
  	var UINT32_VIEW = new Uint32Array( FLOAT64_VIEW.buffer );


  	// MAIN //

  	/**
  	* Sets the more significant 32 bits of a double-precision floating-point number.
  	*
  	* ## Notes
  	*
  	* ```text
  	* float64 (64 bits)
  	* f := fraction (significand/mantissa) (52 bits)
  	* e := exponent (11 bits)
  	* s := sign bit (1 bit)
  	*
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* |                                Float64                                |
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* |              Uint32               |               Uint32              |
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* ```
  	*
  	* If little endian (more significant bits last):
  	*
  	* ```text
  	*                         <-- lower      higher -->
  	* |   f7       f6       f5       f4       f3       f2    e2 | f1 |s|  e1  |
  	* ```
  	*
  	* If big endian (more significant bits first):
  	*
  	* ```text
  	*                         <-- higher      lower -->
  	* |s| e1    e2 | f1     f2       f3       f4       f5        f6      f7   |
  	* ```
  	*
  	* In which Uint32 can we find the higher order bits? If little endian, the second; if big endian, the first.
  	*
  	* ## References
  	*
  	* -   [Open Group][1]
  	*
  	* [1]: http://pubs.opengroup.org/onlinepubs/9629399/chap14.htm
  	*
  	* @param {number} x - double
  	* @param {uinteger32} high - unsigned 32-bit integer to replace the higher order word of `x`
  	* @returns {number} double having the same lower order word as `x`
  	*
  	* @example
  	* var high = 5 >>> 0; // => 0 00000000000 00000000000000000101
  	*
  	* var y = setHighWord( 3.14e201, high ); // => 0 00000000000 0000000000000000010110010011110010110101100010000010
  	* // returns 1.18350528745e-313
  	*
  	* @example
  	* var PINF = require( '@stdlib/constants-float64-pinf' ); // => 0 11111111111 00000000000000000000 00000000000000000000000000000000
  	*
  	* var high = 1072693248 >>> 0; // => 0 01111111111 00000000000000000000
  	*
  	* // Set the higher order bits of `+infinity` to return `1`:
  	* var y = setHighWord( PINF, high ); // => 0 01111111111 0000000000000000000000000000000000000000000000000000
  	* // returns 1.0
  	*/
  	function setHighWord( x, high ) {
  		FLOAT64_VIEW[ 0 ] = x;
  		UINT32_VIEW[ HIGH ] = ( high >>> 0 ); // identity bit shift to ensure integer
  		return FLOAT64_VIEW[ 0 ];
  	}


  	// EXPORTS //

  	main$p = setHighWord;
  	return main$p;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$A;
  var hasRequiredLib$A;

  function requireLib$A () {
  	if (hasRequiredLib$A) return lib$A;
  	hasRequiredLib$A = 1;

  	/**
  	* Set the more significant 32 bits of a double-precision floating-point number.
  	*
  	* @module @stdlib/number-float64-base-set-high-word
  	*
  	* @example
  	* var setHighWord = require( '@stdlib/number-float64-base-set-high-word' );
  	*
  	* var high = 5 >>> 0; // => 0 00000000000 00000000000000000101
  	*
  	* var y = setHighWord( 3.14e201, high ); // => 0 00000000000 0000000000000000010110010011110010110101100010000010
  	* // returns 1.18350528745e-313
  	*
  	* @example
  	* var PINF = require( '@stdlib/constants-float64-pinf' ); // => 0 11111111111 00000000000000000000 00000000000000000000000000000000
  	* var setHighWord = require( '@stdlib/number-float64-base-set-high-word' );
  	*
  	* var high = 1072693248 >>> 0; // => 0 01111111111 00000000000000000000
  	*
  	* // Set the higher order bits of `+infinity` to return `1`:
  	* var y = setHighWord( PINF, high ); // => 0 01111111111 0000000000000000000000000000000000000000000000000000
  	* // returns 1.0
  	*/

  	// MODULES //

  	var main = requireMain$p();


  	// EXPORTS //

  	lib$A = main;
  	return lib$A;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$z;
  var hasRequiredLib$z;

  function requireLib$z () {
  	if (hasRequiredLib$z) return lib$z;
  	hasRequiredLib$z = 1;

  	/**
  	* The bias of a double-precision floating-point number's exponent.
  	*
  	* @module @stdlib/constants-float64-exponent-bias
  	* @type {integer32}
  	*
  	* @example
  	* var FLOAT64_EXPONENT_BIAS = require( '@stdlib/constants-float64-exponent-bias' );
  	* // returns 1023
  	*/


  	// MAIN //

  	/**
  	* Bias of a double-precision floating-point number's exponent.
  	*
  	* ## Notes
  	*
  	* The bias can be computed via
  	*
  	* ```tex
  	* \mathrm{bias} = 2^{k-1} - 1
  	* ```
  	*
  	* where \\(k\\) is the number of bits in the exponent; here, \\(k = 11\\).
  	*
  	* @constant
  	* @type {integer32}
  	* @default 1023
  	* @see [IEEE 754]{@link https://en.wikipedia.org/wiki/IEEE_754-1985}
  	*/
  	var FLOAT64_EXPONENT_BIAS = 1023|0; // asm type annotation


  	// EXPORTS //

  	lib$z = FLOAT64_EXPONENT_BIAS;
  	return lib$z;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_p;
  var hasRequiredPolyval_p;

  function requirePolyval_p () {
  	if (hasRequiredPolyval_p) return polyval_p;
  	hasRequiredPolyval_p = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return 0.3999999999940942;
  		}
  		return 0.3999999999940942 + (x * (0.22222198432149784 + (x * 0.15313837699209373))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_p = evalpoly;
  	return polyval_p;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_q;
  var hasRequiredPolyval_q;

  function requirePolyval_q () {
  	if (hasRequiredPolyval_q) return polyval_q;
  	hasRequiredPolyval_q = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return 0.6666666666666735;
  		}
  		return 0.6666666666666735 + (x * (0.2857142874366239 + (x * (0.1818357216161805 + (x * 0.14798198605116586))))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_q = evalpoly;
  	return polyval_q;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  *
  * ## Notice
  *
  * The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_log.c}. The implementation follows the original, but has been modified for JavaScript.
  *
  * ```text
  * Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
  *
  * Developed at SunPro, a Sun Microsystems, Inc. business.
  * Permission to use, copy, modify, and distribute this
  * software is freely granted, provided that this notice
  * is preserved.
  * ```
  */

  var main$o;
  var hasRequiredMain$o;

  function requireMain$o () {
  	if (hasRequiredMain$o) return main$o;
  	hasRequiredMain$o = 1;

  	// MODULES //

  	var getHighWord = requireLib$B();
  	var setHighWord = requireLib$A();
  	var isnan = requireLib$10();
  	var BIAS = requireLib$z();
  	var NINF = requireLib$Z();
  	var polyvalP = requirePolyval_p();
  	var polyvalQ = requirePolyval_q();


  	// VARIABLES //

  	var LN2_HI = 6.93147180369123816490e-01; // 3FE62E42 FEE00000
  	var LN2_LO = 1.90821492927058770002e-10; // 3DEA39EF 35793C76
  	var TWO54 = 1.80143985094819840000e+16;  // 0x43500000, 0x00000000
  	var ONE_THIRD = 0.33333333333333333;

  	// 0x000fffff = 1048575 => 0 00000000000 11111111111111111111
  	var HIGH_SIGNIFICAND_MASK = 0x000fffff|0; // asm type annotation

  	// 0x7ff00000 = 2146435072 => 0 11111111111 00000000000000000000 => biased exponent: 2047 = 1023+1023 => 2^1023
  	var HIGH_MAX_NORMAL_EXP = 0x7ff00000|0; // asm type annotation

  	// 0x00100000 = 1048576 => 0 00000000001 00000000000000000000 => biased exponent: 1 = -1022+1023 => 2^-1022
  	var HIGH_MIN_NORMAL_EXP = 0x00100000|0; // asm type annotation

  	// 0x3ff00000 = 1072693248 => 0 01111111111 00000000000000000000 => biased exponent: 1023 = 0+1023 => 2^0 = 1
  	var HIGH_BIASED_EXP_0 = 0x3ff00000|0; // asm type annotation


  	// MAIN //

  	/**
  	* Evaluates the natural logarithm of a double-precision floating-point number.
  	*
  	* @param {NonNegativeNumber} x - input value
  	* @returns {number} function value
  	*
  	* @example
  	* var v = ln( 4.0 );
  	* // returns ~1.386
  	*
  	* @example
  	* var v = ln( 0.0 );
  	* // returns -Infinity
  	*
  	* @example
  	* var v = ln( Infinity );
  	* // returns Infinity
  	*
  	* @example
  	* var v = ln( NaN );
  	* // returns NaN
  	*
  	* @example
  	* var v = ln( -4.0 );
  	* // returns NaN
  	*/
  	function ln( x ) {
  		var hfsq;
  		var hx;
  		var t2;
  		var t1;
  		var k;
  		var R;
  		var f;
  		var i;
  		var j;
  		var s;
  		var w;
  		var z;

  		if ( x === 0.0 ) {
  			return NINF;
  		}
  		if ( isnan( x ) || x < 0.0 ) {
  			return NaN;
  		}
  		hx = getHighWord( x );
  		k = 0|0; // asm type annotation
  		if ( hx < HIGH_MIN_NORMAL_EXP ) {
  			// Case: 0 < x < 2**-1022
  			k -= 54|0; // asm type annotation

  			// Subnormal number, scale up `x`:
  			x *= TWO54;
  			hx = getHighWord( x );
  		}
  		if ( hx >= HIGH_MAX_NORMAL_EXP ) {
  			return x + x;
  		}
  		k += ( ( hx>>20 ) - BIAS )|0; // asm type annotation
  		hx &= HIGH_SIGNIFICAND_MASK;
  		i = ( (hx+0x95f64) & 0x100000 )|0; // asm type annotation

  		// Normalize `x` or `x/2`...
  		x = setHighWord( x, hx|(i^HIGH_BIASED_EXP_0) );
  		k += ( i>>20 )|0; // asm type annotation
  		f = x - 1.0;
  		if ( (HIGH_SIGNIFICAND_MASK&(2+hx)) < 3 ) {
  			// Case: -2**-20 <= f < 2**-20
  			if ( f === 0.0 ) {
  				if ( k === 0 ) {
  					return 0.0;
  				}
  				return (k * LN2_HI) + (k * LN2_LO);
  			}
  			R = f * f * ( 0.5 - (ONE_THIRD*f) );
  			if ( k === 0 ) {
  				return f - R;
  			}
  			return (k * LN2_HI) - ( (R-(k*LN2_LO)) - f );
  		}
  		s = f / (2.0 + f);
  		z = s * s;
  		i = ( hx - 0x6147a )|0; // asm type annotation
  		w = z * z;
  		j = ( 0x6b851 - hx )|0; // asm type annotation
  		t1 = w * polyvalP( w );
  		t2 = z * polyvalQ( w );
  		i |= j;
  		R = t2 + t1;
  		if ( i > 0 ) {
  			hfsq = 0.5 * f * f;
  			if ( k === 0 ) {
  				return f - ( hfsq - (s * (hfsq+R)) );
  			}
  			return (k * LN2_HI) - ( hfsq - ((s*(hfsq+R))+(k*LN2_LO)) - f );
  		}
  		if ( k === 0 ) {
  			return f - (s*(f-R));
  		}
  		return (k * LN2_HI) - ( ( (s*(f-R)) - (k*LN2_LO) ) - f );
  	}


  	// EXPORTS //

  	main$o = ln;
  	return main$o;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$y;
  var hasRequiredLib$y;

  function requireLib$y () {
  	if (hasRequiredLib$y) return lib$y;
  	hasRequiredLib$y = 1;

  	/**
  	* Evaluate the natural logarithm of a double-precision floating-point number.
  	*
  	* @module @stdlib/math-base-special-ln
  	*
  	* @example
  	* var ln = require( '@stdlib/math-base-special-ln' );
  	*
  	* var v = ln( 4.0 );
  	* // returns ~1.386
  	*
  	* v = ln( 0.0 );
  	* // returns -Infinity
  	*
  	* v = ln( Infinity );
  	* // returns Infinity
  	*
  	* v = ln( NaN );
  	* // returns NaN
  	*
  	* v = ln( -4.0 );
  	* // returns NaN
  	*/

  	// MODULES //

  	var main = requireMain$o();


  	// EXPORTS //

  	lib$y = main;
  	return lib$y;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$n;
  var hasRequiredMain$n;

  function requireMain$n () {
  	if (hasRequiredMain$n) return main$n;
  	hasRequiredMain$n = 1;

  	// TODO: implementation (?)

  	/**
  	* Rounds a double-precision floating-point number toward negative infinity.
  	*
  	* @param {number} x - input value
  	* @returns {number} rounded value
  	*
  	* @example
  	* var v = floor( -4.2 );
  	* // returns -5.0
  	*
  	* @example
  	* var v = floor( 9.99999 );
  	* // returns 9.0
  	*
  	* @example
  	* var v = floor( 0.0 );
  	* // returns 0.0
  	*
  	* @example
  	* var v = floor( NaN );
  	* // returns NaN
  	*/
  	var floor = Math.floor; // eslint-disable-line stdlib/no-builtin-math


  	// EXPORTS //

  	main$n = floor;
  	return main$n;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$x;
  var hasRequiredLib$x;

  function requireLib$x () {
  	if (hasRequiredLib$x) return lib$x;
  	hasRequiredLib$x = 1;

  	/**
  	* Round a double-precision floating-point number toward negative infinity.
  	*
  	* @module @stdlib/math-base-special-floor
  	*
  	* @example
  	* var floor = require( '@stdlib/math-base-special-floor' );
  	*
  	* var v = floor( -4.2 );
  	* // returns -5.0
  	*
  	* v = floor( 9.99999 );
  	* // returns 9.0
  	*
  	* v = floor( 0.0 );
  	* // returns 0.0
  	*
  	* v = floor( NaN );
  	* // returns NaN
  	*/

  	// MODULES //

  	var main = requireMain$n();


  	// EXPORTS //

  	lib$x = main;
  	return lib$x;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$m;
  var hasRequiredMain$m;

  function requireMain$m () {
  	if (hasRequiredMain$m) return main$m;
  	hasRequiredMain$m = 1;

  	// TODO: implementation (?)

  	/**
  	* Rounds a double-precision floating-point number toward positive infinity.
  	*
  	* @param {number} x - input value
  	* @returns {number} rounded value
  	*
  	* @example
  	* var v = ceil( -4.2 );
  	* // returns -4.0
  	*
  	* @example
  	* var v = ceil( 9.99999 );
  	* // returns 10.0
  	*
  	* @example
  	* var v = ceil( 0.0 );
  	* // returns 0.0
  	*
  	* @example
  	* var v = ceil( NaN );
  	* // returns NaN
  	*/
  	var ceil = Math.ceil; // eslint-disable-line stdlib/no-builtin-math


  	// EXPORTS //

  	main$m = ceil;
  	return main$m;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$w;
  var hasRequiredLib$w;

  function requireLib$w () {
  	if (hasRequiredLib$w) return lib$w;
  	hasRequiredLib$w = 1;

  	/**
  	* Round a double-precision floating-point number toward positive infinity.
  	*
  	* @module @stdlib/math-base-special-ceil
  	*
  	* @example
  	* var ceil = require( '@stdlib/math-base-special-ceil' );
  	*
  	* var v = ceil( -4.2 );
  	* // returns -4.0
  	*
  	* v = ceil( 9.99999 );
  	* // returns 10.0
  	*
  	* v = ceil( 0.0 );
  	* // returns 0.0
  	*
  	* v = ceil( NaN );
  	* // returns NaN
  	*/

  	// MODULES //

  	var main = requireMain$m();


  	// EXPORTS //

  	lib$w = main;
  	return lib$w;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$l;
  var hasRequiredMain$l;

  function requireMain$l () {
  	if (hasRequiredMain$l) return main$l;
  	hasRequiredMain$l = 1;

  	// MODULES //

  	var floor = requireLib$x();
  	var ceil = requireLib$w();


  	// MAIN //

  	/**
  	* Rounds a double-precision floating-point number toward zero.
  	*
  	* @param {number} x - input value
  	* @returns {number} rounded value
  	*
  	* @example
  	* var v = trunc( -4.2 );
  	* // returns -4.0
  	*
  	* @example
  	* var v = trunc( 9.99999 );
  	* // returns 9.0
  	*
  	* @example
  	* var v = trunc( 0.0 );
  	* // returns 0.0
  	*
  	* @example
  	* var v = trunc( -0.0 );
  	* // returns -0.0
  	*
  	* @example
  	* var v = trunc( NaN );
  	* // returns NaN
  	*
  	* @example
  	* var v = trunc( Infinity );
  	* // returns Infinity
  	*
  	* @example
  	* var v = trunc( -Infinity );
  	* // returns -Infinity
  	*/
  	function trunc( x ) {
  		if ( x < 0.0 ) {
  			return ceil( x );
  		}
  		return floor( x );
  	}


  	// EXPORTS //

  	main$l = trunc;
  	return main$l;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$v;
  var hasRequiredLib$v;

  function requireLib$v () {
  	if (hasRequiredLib$v) return lib$v;
  	hasRequiredLib$v = 1;

  	/**
  	* Round a double-precision floating-point number toward zero.
  	*
  	* @module @stdlib/math-base-special-trunc
  	*
  	* @example
  	* var trunc = require( '@stdlib/math-base-special-trunc' );
  	*
  	* var v = trunc( -4.2 );
  	* // returns -4.0
  	*
  	* v = trunc( 9.99999 );
  	* // returns 9.0
  	*
  	* v = trunc( 0.0 );
  	* // returns 0.0
  	*
  	* v = trunc( -0.0 );
  	* // returns -0.0
  	*
  	* v = trunc( NaN );
  	* // returns NaN
  	*
  	* v = trunc( Infinity );
  	* // returns Infinity
  	*
  	* v = trunc( -Infinity );
  	* // returns -Infinity
  	*/

  	// MODULES //

  	var main = requireMain$l();


  	// EXPORTS //

  	lib$v = main;
  	return lib$v;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_c13;
  var hasRequiredPolyval_c13;

  function requirePolyval_c13 () {
  	if (hasRequiredPolyval_c13) return polyval_c13;
  	hasRequiredPolyval_c13 = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return 0.0416666666666666;
  		}
  		return 0.0416666666666666 + (x * (-0.001388888888887411 + (x * 0.00002480158728947673))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_c13 = evalpoly;
  	return polyval_c13;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_c46;
  var hasRequiredPolyval_c46;

  function requirePolyval_c46 () {
  	if (hasRequiredPolyval_c46) return polyval_c46;
  	hasRequiredPolyval_c46 = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return -2.7557314351390663e-7;
  		}
  		return -2.7557314351390663e-7 + (x * (2.087572321298175e-9 + (x * -11359647557788195e-27))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_c46 = evalpoly;
  	return polyval_c46;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  *
  * ## Notice
  *
  * The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/12.2.0/lib/msun/src/k_cos.c}. The implementation follows the original, but has been modified for JavaScript.
  *
  * ```text
  * Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
  *
  * Developed at SunPro, a Sun Microsystems, Inc. business.
  * Permission to use, copy, modify, and distribute this
  * software is freely granted, provided that this notice
  * is preserved.
  * ```
  */

  var main$k;
  var hasRequiredMain$k;

  function requireMain$k () {
  	if (hasRequiredMain$k) return main$k;
  	hasRequiredMain$k = 1;

  	// MODULES //

  	var polyval13 = requirePolyval_c13();
  	var polyval46 = requirePolyval_c46();


  	// MAIN //

  	/**
  	* Computes the cosine on \\( \[-\pi/4, \pi/4] \\), where \\( \pi/4 \approx 0.785398164 \\).
  	*
  	* ## Method
  	*
  	* -   Since \\( \cos(-x) = \cos(x) \\), we need only to consider positive \\(x\\).
  	*
  	* -   If \\( x < 2^{-27} \\), return \\(1\\) which is inexact if \\( x \ne 0 \\).
  	*
  	* -   \\( cos(x) \\) is approximated by a polynomial of degree \\(14\\) on \\( \[0,\pi/4] \\).
  	*
  	*     ```tex
  	*     \cos(x) \approx 1 - \frac{x \cdot x}{2} + C_1 \cdot x^4 + \ldots + C_6 \cdot x^{14}
  	*     ```
  	*
  	*     where the Remez error is
  	*
  	*     ```tex
  	*     \left| \cos(x) - \left( 1 - \frac{x^2}{2} + C_1x^4 + C_2x^6 + C_3x^8 + C_4x^{10} + C_5x^{12} + C_6x^{15} \right) \right| \le 2^{-58}
  	*     ```
  	*
  	* -   Let \\( C_1x^4 + C_2x^6 + C_3x^8 + C_4x^{10} + C_5x^{12} + C_6x^{14} \\), then
  	*
  	*     ```tex
  	*     \cos(x) \approx 1 - \frac{x \cdot x}{2} + r
  	*     ```
  	*
  	*     Since
  	*
  	*     ```tex
  	*     \cos(x+y) \approx \cos(x) - \sin(x) \cdot y \approx \cos(x) - x \cdot y
  	*     ```
  	*
  	*     a correction term is necessary in \\( \cos(x) \\). Hence,
  	*
  	*     ```tex
  	*     \cos(x+y) = 1 - \left( \frac{x \cdot x}{2} - (r - x \cdot y) \right)
  	*     ```
  	*
  	*     For better accuracy, rearrange to
  	*
  	*     ```tex
  	*     \cos(x+y) \approx w + \left( t + ( r - x \cdot y ) \right)
  	*     ```
  	*
  	*     where \\( w = 1 - \frac{x \cdot x}{2} \\) and \\( t \\) is a tiny correction term (\\( 1 - \frac{x \cdot x}{2} = w + t \\) exactly in infinite precision). The exactness of \\(w + t\\) in infinite precision depends on \\(w\\) and \\(t\\) having the same precision as \\(x\\).
  	*
  	* @param {number} x - input value (in radians, assumed to be bounded by ~pi/4 in magnitude)
  	* @param {number} y - tail of `x`
  	* @returns {number} cosine
  	*
  	* @example
  	* var v = kernelCos( 0.0, 0.0 );
  	* // returns ~1.0
  	*
  	* @example
  	* var v = kernelCos( 3.141592653589793/6.0, 0.0 );
  	* // returns ~0.866
  	*
  	* @example
  	* var v = kernelCos( 0.785, -1.144e-17 );
  	* // returns ~0.707
  	*
  	* @example
  	* var v = kernelCos( NaN, 0.0 );
  	* // returns NaN
  	*/
  	function kernelCos( x, y ) {
  		var hz;
  		var r;
  		var w;
  		var z;

  		z = x * x;
  		w = z * z;
  		r = z * polyval13( z );
  		r += w * w * polyval46( z );
  		hz = 0.5 * z;
  		w = 1.0 - hz;
  		return w + ( ((1.0-w) - hz) + ((z*r) - (x*y)) );
  	}


  	// EXPORTS //

  	main$k = kernelCos;
  	return main$k;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$u;
  var hasRequiredLib$u;

  function requireLib$u () {
  	if (hasRequiredLib$u) return lib$u;
  	hasRequiredLib$u = 1;

  	/**
  	* Compute the cosine of a number on `[-π/4, π/4]`.
  	*
  	* @module @stdlib/math-base-special-kernel-cos
  	*
  	* @example
  	* var kernelCos = require( '@stdlib/math-base-special-kernel-cos' );
  	*
  	* var v = kernelCos( 0.0, 0.0 );
  	* // returns ~1.0
  	*
  	* v = kernelCos( 3.141592653589793/6.0, 0.0 );
  	* // returns ~0.866
  	*
  	* v = kernelCos( 0.785, -1.144e-17 );
  	* // returns ~0.707
  	*
  	* v = kernelCos( NaN, 0.0 );
  	* // returns NaN
  	*/

  	// MODULES //

  	var main = requireMain$k();


  	// EXPORTS //

  	lib$u = main;
  	return lib$u;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  *
  * ## Notice
  *
  * The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/k_sin.c}. The implementation follows the original, but has been modified for JavaScript.
  *
  * ```text
  * Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
  *
  * Developed at SunPro, a Sun Microsystems, Inc. business.
  * Permission to use, copy, modify, and distribute this
  * software is freely granted, provided that this notice
  * is preserved.
  * ```
  */

  var main$j;
  var hasRequiredMain$j;

  function requireMain$j () {
  	if (hasRequiredMain$j) return main$j;
  	hasRequiredMain$j = 1;

  	// VARIABLES //

  	var S1 = -0.16666666666666632; // 0xBFC55555, 0x55555549
  	var S2 = 8.33333333332248946124e-03;  // 0x3F811111, 0x1110F8A6
  	var S3 = -1984126982985795e-19; // 0xBF2A01A0, 0x19C161D5
  	var S4 = 2.75573137070700676789e-06;  // 0x3EC71DE3, 0x57B1FE7D
  	var S5 = -2.5050760253406863e-8; // 0xBE5AE5E6, 0x8A2B9CEB
  	var S6 = 1.58969099521155010221e-10;  // 0x3DE5D93A, 0x5ACFD57C


  	// MAIN //

  	/**
  	* Computes the sine on \\( \approx \[-\pi/4, \pi/4] \\) (except on \\(-0\\)), where \\( \pi/4 \approx 0.7854 \\).
  	*
  	* ## Method
  	*
  	* -   Since \\( \sin(-x) = -\sin(x) \\), we need only to consider positive \\(x\\).
  	*
  	* -   Callers must return \\( \sin(-0) = -0 \\) without calling here since our odd polynomial is not evaluated in a way that preserves \\(-0\\). Callers may do the optimization \\( \sin(x) \approx x \\) for tiny \\(x\\).
  	*
  	* -   \\( \sin(x) \\) is approximated by a polynomial of degree \\(13\\) on \\( \left\[0,\tfrac{pi}{4}\right] \\)
  	*
  	*     ```tex
  	*     \sin(x) \approx x + S_1 \cdot x^3 + \ldots + S_6 \cdot x^{13}
  	*     ```
  	*
  	*     where
  	*
  	*     ```tex
  	*     \left| \frac{\sin(x)}{x} \left( 1 + S_1 \cdot x + S_2 \cdot x + S_3 \cdot x + S_4 \cdot x + S_5 \cdot x + S_6 \cdot x \right) \right| \le 2^{-58}
  	*     ```
  	*
  	* -   We have
  	*
  	*     ```tex
  	*     \sin(x+y) = \sin(x) + \sin'(x') \cdot y \approx \sin(x) + (1-x*x/2) \cdot y
  	*     ```
  	*
  	*     For better accuracy, let
  	*
  	*     ```tex
  	*     r = x^3 * \left( S_2 + x^2 \cdot \left( S_3 + x^2 * \left( S_4 + x^2 \cdot ( S_5+x^2 \cdot S_6 ) \right) \right) \right)
  	*     ```
  	*
  	*     then
  	*
  	*     ```tex
  	*     \sin(x) = x + \left( S_1 \cdot x + ( x \cdot (r-y/2) + y ) \right)
  	*     ```
  	*
  	* @param {number} x - input value (in radians, assumed to be bounded by `~pi/4` in magnitude)
  	* @param {number} y - tail of `x`
  	* @returns {number} sine
  	*
  	* @example
  	* var v = kernelSin( 0.0, 0.0 );
  	* // returns ~0.0
  	*
  	* @example
  	* var v = kernelSin( 3.141592653589793/6.0, 0.0 );
  	* // returns ~0.5
  	*
  	* @example
  	* var v = kernelSin( 0.619, 9.279e-18 );
  	* // returns ~0.58
  	*
  	* @example
  	* var v = kernelSin( NaN, 0.0 );
  	* // returns NaN
  	*
  	* @example
  	* var v = kernelSin( 3.0, NaN );
  	* // returns NaN
  	*
  	* @example
  	* var v = kernelSin( NaN, NaN );
  	* // returns NaN
  	*/
  	function kernelSin( x, y ) {
  		var r;
  		var v;
  		var w;
  		var z;

  		z = x * x;
  		w = z * z;
  		r = S2 + (z * (S3 + (z*S4))) + (z * w * (S5 + (z*S6)));
  		v = z * x;
  		if ( y === 0.0 ) {
  			return x + (v * (S1 + (z*r)));
  		}
  		return x - (((z*((0.5*y) - (v*r))) - y) - (v*S1));
  	}


  	// EXPORTS //

  	main$j = kernelSin;
  	return main$j;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$t;
  var hasRequiredLib$t;

  function requireLib$t () {
  	if (hasRequiredLib$t) return lib$t;
  	hasRequiredLib$t = 1;

  	/**
  	* Compute the sine of a number on `[-π/4, π/4]`.
  	*
  	* @module @stdlib/math-base-special-kernel-sin
  	*
  	* @example
  	* var kernelSin = require( '@stdlib/math-base-special-kernel-sin' );
  	*
  	* var v = kernelSin( 0.0, 0.0 );
  	* // returns ~0.0
  	*
  	* v = kernelSin( 3.141592653589793/6.0, 0.0 );
  	* // returns ~0.5
  	*
  	* v = kernelSin( 0.619, 9.279e-18 );
  	* // returns ~0.581
  	*
  	* v = kernelSin( NaN, 0.0 );
  	* // returns NaN
  	*
  	* v = kernelSin( 3.0, NaN );
  	* // returns NaN
  	*
  	* v = kernelSin( NaN, NaN );
  	* // returns NaN
  	*/

  	// MODULES //

  	var main = requireMain$j();


  	// EXPORTS //

  	lib$t = main;
  	return lib$t;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$s;
  var hasRequiredLib$s;

  function requireLib$s () {
  	if (hasRequiredLib$s) return lib$s;
  	hasRequiredLib$s = 1;

  	/**
  	* High word mask for excluding the sign bit of a double-precision floating-point number.
  	*
  	* @module @stdlib/constants-float64-high-word-abs-mask
  	* @type {uinteger32}
  	*
  	* @example
  	* var FLOAT64_HIGH_WORD_ABS_MASK = require( '@stdlib/constants-float64-high-word-abs-mask' );
  	* // returns 2147483647
  	*/


  	// MAIN //

  	/**
  	* High word mask for excluding the sign bit of a double-precision floating-point number.
  	*
  	* ## Notes
  	*
  	* The high word mask for excluding the sign bit of a double-precision floating-point number is an unsigned 32-bit integer with the value \\( 2147483647 \\), which corresponds to the bit sequence
  	*
  	* ```binarystring
  	* 0 11111111111 11111111111111111111
  	* ```
  	*
  	* @constant
  	* @type {uinteger32}
  	* @default 0x7fffffff
  	* @see [IEEE 754]{@link https://en.wikipedia.org/wiki/IEEE_754-1985}
  	*/
  	var FLOAT64_HIGH_WORD_ABS_MASK = 0x7fffffff>>>0; // eslint-disable-line id-length


  	// EXPORTS //

  	lib$s = FLOAT64_HIGH_WORD_ABS_MASK;
  	return lib$s;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$r;
  var hasRequiredLib$r;

  function requireLib$r () {
  	if (hasRequiredLib$r) return lib$r;
  	hasRequiredLib$r = 1;

  	/**
  	* High word mask for the exponent of a double-precision floating-point number.
  	*
  	* @module @stdlib/constants-float64-high-word-exponent-mask
  	* @type {uinteger32}
  	*
  	* @example
  	* var FLOAT64_HIGH_WORD_EXPONENT_MASK = require( '@stdlib/constants-float64-high-word-exponent-mask' );
  	* // returns 2146435072
  	*/


  	// MAIN //

  	/**
  	* High word mask for the exponent of a double-precision floating-point number.
  	*
  	* ## Notes
  	*
  	* The high word mask for the exponent of a double-precision floating-point number is an unsigned 32-bit integer with the value \\( 2146435072 \\), which corresponds to the bit sequence
  	*
  	* ```binarystring
  	* 0 11111111111 00000000000000000000
  	* ```
  	*
  	* @constant
  	* @type {uinteger32}
  	* @default 0x7ff00000
  	* @see [IEEE 754]{@link https://en.wikipedia.org/wiki/IEEE_754-1985}
  	*/
  	var FLOAT64_HIGH_WORD_EXPONENT_MASK = 0x7ff00000;


  	// EXPORTS //

  	lib$r = FLOAT64_HIGH_WORD_EXPONENT_MASK;
  	return lib$r;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$q;
  var hasRequiredLib$q;

  function requireLib$q () {
  	if (hasRequiredLib$q) return lib$q;
  	hasRequiredLib$q = 1;

  	/**
  	* High word mask for the significand of a double-precision floating-point number.
  	*
  	* @module @stdlib/constants-float64-high-word-significand-mask
  	* @type {uinteger32}
  	*
  	* @example
  	* var FLOAT64_HIGH_WORD_SIGNIFICAND_MASK = require( '@stdlib/constants-float64-high-word-significand-mask' );
  	* // returns 1048575
  	*/


  	// MAIN //

  	/**
  	* High word mask for the significand of a double-precision floating-point number.
  	*
  	* ## Notes
  	*
  	* The high word mask for the significand of a double-precision floating-point number is an unsigned 32-bit integer with the value \\( 1048575 \\), which corresponds to the bit sequence
  	*
  	* ```binarystring
  	* 0 00000000000 11111111111111111111
  	* ```
  	*
  	* @constant
  	* @type {uinteger32}
  	* @default 0x000fffff
  	* @see [IEEE 754]{@link https://en.wikipedia.org/wiki/IEEE_754-1985}
  	*/
  	var FLOAT64_HIGH_WORD_SIGNIFICAND_MASK = 0x000fffff;


  	// EXPORTS //

  	lib$q = FLOAT64_HIGH_WORD_SIGNIFICAND_MASK;
  	return lib$q;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var low;
  var hasRequiredLow;

  function requireLow () {
  	if (hasRequiredLow) return low;
  	hasRequiredLow = 1;

  	// MODULES //

  	var isLittleEndian = requireLib$C();


  	// MAIN //

  	var LOW;
  	if ( isLittleEndian === true ) {
  		LOW = 0; // first index
  	} else {
  		LOW = 1; // second index
  	}


  	// EXPORTS //

  	low = LOW;
  	return low;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$i;
  var hasRequiredMain$i;

  function requireMain$i () {
  	if (hasRequiredMain$i) return main$i;
  	hasRequiredMain$i = 1;

  	// MODULES //

  	var Uint32Array = requireLib$O();
  	var Float64Array = requireLib$L();
  	var LOW = requireLow();


  	// VARIABLES //

  	var FLOAT64_VIEW = new Float64Array( 1 );
  	var UINT32_VIEW = new Uint32Array( FLOAT64_VIEW.buffer );


  	// MAIN //

  	/**
  	* Returns a 32-bit unsigned integer corresponding to the less significant 32 bits of a double-precision floating-point number.
  	*
  	* ## Notes
  	*
  	* ```text
  	* float64 (64 bits)
  	* f := fraction (significand/mantissa) (52 bits)
  	* e := exponent (11 bits)
  	* s := sign bit (1 bit)
  	*
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* |                                Float64                                |
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* |              Uint32               |               Uint32              |
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* ```
  	*
  	* If little endian (more significant bits last):
  	*
  	* ```text
  	*                         <-- lower      higher -->
  	* |   f7       f6       f5       f4       f3       f2    e2 | f1 |s|  e1  |
  	* ```
  	*
  	* If big endian (more significant bits first):
  	*
  	* ```text
  	*                         <-- higher      lower -->
  	* |s| e1    e2 | f1     f2       f3       f4       f5        f6      f7   |
  	* ```
  	*
  	* In which Uint32 can we find the lower order bits? If little endian, the first; if big endian, the second.
  	*
  	* ## References
  	*
  	* -   [Open Group][1]
  	*
  	* [1]: http://pubs.opengroup.org/onlinepubs/9629399/chap14.htm
  	*
  	* @param {number} x - input value
  	* @returns {uinteger32} lower order word
  	*
  	* @example
  	* var w = getLowWord( 3.14e201 ); // => 10010011110010110101100010000010
  	* // returns 2479577218
  	*/
  	function getLowWord( x ) {
  		FLOAT64_VIEW[ 0 ] = x;
  		return UINT32_VIEW[ LOW ];
  	}


  	// EXPORTS //

  	main$i = getLowWord;
  	return main$i;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$p;
  var hasRequiredLib$p;

  function requireLib$p () {
  	if (hasRequiredLib$p) return lib$p;
  	hasRequiredLib$p = 1;

  	/**
  	* Return an unsigned 32-bit integer corresponding to the less significant 32 bits of a double-precision floating-point number.
  	*
  	* @module @stdlib/number-float64-base-get-low-word
  	*
  	* @example
  	* var getLowWord = require( '@stdlib/number-float64-base-get-low-word' );
  	*
  	* var w = getLowWord( 3.14e201 ); // => 10010011110010110101100010000010
  	* // returns 2479577218
  	*/

  	// MODULES //

  	var main = requireMain$i();


  	// EXPORTS //

  	lib$p = main;
  	return lib$p;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var indices_1$1;
  var hasRequiredIndices$1;

  function requireIndices$1 () {
  	if (hasRequiredIndices$1) return indices_1$1;
  	hasRequiredIndices$1 = 1;

  	// MODULES //

  	var isLittleEndian = requireLib$C();


  	// MAIN //

  	var indices;
  	var HIGH;
  	var LOW;

  	if ( isLittleEndian === true ) {
  		HIGH = 1; // second index
  		LOW = 0; // first index
  	} else {
  		HIGH = 0; // first index
  		LOW = 1; // second index
  	}
  	indices = {
  		'HIGH': HIGH,
  		'LOW': LOW
  	};


  	// EXPORTS //

  	indices_1$1 = indices;
  	return indices_1$1;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$h;
  var hasRequiredMain$h;

  function requireMain$h () {
  	if (hasRequiredMain$h) return main$h;
  	hasRequiredMain$h = 1;

  	// MODULES //

  	var Uint32Array = requireLib$O();
  	var Float64Array = requireLib$L();
  	var indices = requireIndices$1();


  	// VARIABLES //

  	var FLOAT64_VIEW = new Float64Array( 1 );
  	var UINT32_VIEW = new Uint32Array( FLOAT64_VIEW.buffer );

  	var HIGH = indices.HIGH;
  	var LOW = indices.LOW;


  	// MAIN //

  	/**
  	* Creates a double-precision floating-point number from a higher order word (unsigned 32-bit integer) and a lower order word (unsigned 32-bit integer).
  	*
  	* ## Notes
  	*
  	* ```text
  	* float64 (64 bits)
  	* f := fraction (significand/mantissa) (52 bits)
  	* e := exponent (11 bits)
  	* s := sign bit (1 bit)
  	*
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* |                                Float64                                |
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* |              Uint32               |               Uint32              |
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* ```
  	*
  	* If little endian (more significant bits last):
  	*
  	* ```text
  	*                         <-- lower      higher -->
  	* |   f7       f6       f5       f4       f3       f2    e2 | f1 |s|  e1  |
  	* ```
  	*
  	* If big endian (more significant bits first):
  	*
  	* ```text
  	*                         <-- higher      lower -->
  	* |s| e1    e2 | f1     f2       f3       f4       f5        f6      f7   |
  	* ```
  	*
  	* In which Uint32 should we place the higher order bits? If little endian, the second; if big endian, the first.
  	*
  	* ## References
  	*
  	* -   [Open Group][1]
  	*
  	* [1]: http://pubs.opengroup.org/onlinepubs/9629399/chap14.htm
  	*
  	* @param {uinteger32} high - higher order word (unsigned 32-bit integer)
  	* @param {uinteger32} low - lower order word (unsigned 32-bit integer)
  	* @returns {number} floating-point number
  	*
  	* @example
  	* var v = fromWords( 1774486211, 2479577218 );
  	* // returns 3.14e201
  	*
  	* @example
  	* var v = fromWords( 3221823995, 1413754136 );
  	* // returns -3.141592653589793
  	*
  	* @example
  	* var v = fromWords( 0, 0 );
  	* // returns 0.0
  	*
  	* @example
  	* var v = fromWords( 2147483648, 0 );
  	* // returns -0.0
  	*
  	* @example
  	* var v = fromWords( 2146959360, 0 );
  	* // returns NaN
  	*
  	* @example
  	* var v = fromWords( 2146435072, 0 );
  	* // returns Infinity
  	*
  	* @example
  	* var v = fromWords( 4293918720, 0 );
  	* // returns -Infinity
  	*/
  	function fromWords( high, low ) {
  		UINT32_VIEW[ HIGH ] = high;
  		UINT32_VIEW[ LOW ] = low;
  		return FLOAT64_VIEW[ 0 ];
  	}


  	// EXPORTS //

  	main$h = fromWords;
  	return main$h;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$o;
  var hasRequiredLib$o;

  function requireLib$o () {
  	if (hasRequiredLib$o) return lib$o;
  	hasRequiredLib$o = 1;

  	/**
  	* Create a double-precision floating-point number from a higher order word (unsigned 32-bit integer) and a lower order word (unsigned 32-bit integer).
  	*
  	* @module @stdlib/number-float64-base-from-words
  	*
  	* @example
  	* var fromWords = require( '@stdlib/number-float64-base-from-words' );
  	*
  	* var v = fromWords( 1774486211, 2479577218 );
  	* // returns 3.14e201
  	*
  	* v = fromWords( 3221823995, 1413754136 );
  	* // returns -3.141592653589793
  	*
  	* v = fromWords( 0, 0 );
  	* // returns 0.0
  	*
  	* v = fromWords( 2147483648, 0 );
  	* // returns -0.0
  	*
  	* v = fromWords( 2146959360, 0 );
  	* // returns NaN
  	*
  	* v = fromWords( 2146435072, 0 );
  	* // returns Infinity
  	*
  	* v = fromWords( 4293918720, 0 );
  	* // returns -Infinity
  	*/

  	// MODULES //

  	var main = requireMain$h();


  	// EXPORTS //

  	lib$o = main;
  	return lib$o;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$n;
  var hasRequiredLib$n;

  function requireLib$n () {
  	if (hasRequiredLib$n) return lib$n;
  	hasRequiredLib$n = 1;

  	/**
  	* The maximum biased base 2 exponent for a double-precision floating-point number.
  	*
  	* @module @stdlib/constants-float64-max-base2-exponent
  	* @type {integer32}
  	*
  	* @example
  	* var FLOAT64_MAX_BASE2_EXPONENT = require( '@stdlib/constants-float64-max-base2-exponent' );
  	* // returns 1023
  	*/


  	// MAIN //

  	/**
  	* The maximum biased base 2 exponent for a double-precision floating-point number.
  	*
  	* ```text
  	* 11111111110 => 2046 - BIAS = 1023
  	* ```
  	*
  	* where `BIAS = 1023`.
  	*
  	* @constant
  	* @type {integer32}
  	* @default 1023
  	* @see [IEEE 754]{@link https://en.wikipedia.org/wiki/IEEE_754-1985}
  	*/
  	var FLOAT64_MAX_BASE2_EXPONENT = 1023|0; // asm type annotation


  	// EXPORTS //

  	lib$n = FLOAT64_MAX_BASE2_EXPONENT;
  	return lib$n;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$m;
  var hasRequiredLib$m;

  function requireLib$m () {
  	if (hasRequiredLib$m) return lib$m;
  	hasRequiredLib$m = 1;

  	/**
  	* The maximum biased base 2 exponent for a subnormal double-precision floating-point number.
  	*
  	* @module @stdlib/constants-float64-max-base2-exponent-subnormal
  	* @type {integer32}
  	*
  	* @example
  	* var FLOAT64_MAX_BASE2_EXPONENT_SUBNORMAL = require( '@stdlib/constants-float64-max-base2-exponent-subnormal' );
  	* // returns -1023
  	*/


  	// MAIN //

  	/**
  	* The maximum biased base 2 exponent for a subnormal double-precision floating-point number.
  	*
  	* ```text
  	* 00000000000 => 0 - BIAS = -1023
  	* ```
  	*
  	* where `BIAS = 1023`.
  	*
  	* @constant
  	* @type {integer32}
  	* @default -1023
  	* @see [IEEE 754]{@link https://en.wikipedia.org/wiki/IEEE_754-1985}
  	*/
  	var FLOAT64_MAX_BASE2_EXPONENT_SUBNORMAL = -1023|0; // asm type annotation


  	// EXPORTS //

  	lib$m = FLOAT64_MAX_BASE2_EXPONENT_SUBNORMAL;
  	return lib$m;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$l;
  var hasRequiredLib$l;

  function requireLib$l () {
  	if (hasRequiredLib$l) return lib$l;
  	hasRequiredLib$l = 1;

  	/**
  	* The minimum biased base 2 exponent for a subnormal double-precision floating-point number.
  	*
  	* @module @stdlib/constants-float64-min-base2-exponent-subnormal
  	* @type {integer32}
  	*
  	* @example
  	* var FLOAT64_MIN_BASE2_EXPONENT_SUBNORMAL = require( '@stdlib/constants-float64-min-base2-exponent-subnormal' );
  	* // returns -1074
  	*/


  	// MAIN //

  	/**
  	* The minimum biased base 2 exponent for a subnormal double-precision floating-point number.
  	*
  	* ```text
  	* -(BIAS+(52-1)) = -(1023+51) = -1074
  	* ```
  	*
  	* where `BIAS = 1023` and `52` is the number of digits in the significand.
  	*
  	* @constant
  	* @type {integer32}
  	* @default -1074
  	* @see [IEEE 754]{@link https://en.wikipedia.org/wiki/IEEE_754-1985}
  	*/
  	var FLOAT64_MIN_BASE2_EXPONENT_SUBNORMAL = -1074|0; // asm type annotation


  	// EXPORTS //

  	lib$l = FLOAT64_MIN_BASE2_EXPONENT_SUBNORMAL;
  	return lib$l;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$k;
  var hasRequiredLib$k;

  function requireLib$k () {
  	if (hasRequiredLib$k) return lib$k;
  	hasRequiredLib$k = 1;

  	/**
  	* High word mask for the sign bit of a double-precision floating-point number.
  	*
  	* @module @stdlib/constants-float64-high-word-sign-mask
  	* @type {uinteger32}
  	*
  	* @example
  	* var FLOAT64_HIGH_WORD_SIGN_MASK = require( '@stdlib/constants-float64-high-word-sign-mask' );
  	* // returns 2147483648
  	*/


  	// MAIN //

  	/**
  	* High word mask for the sign bit of a double-precision floating-point number.
  	*
  	* ## Notes
  	*
  	* The high word mask for the sign bit of a double-precision floating-point number is an unsigned 32-bit integer with the value \\( 2147483648 \\), which corresponds to the bit sequence
  	*
  	* ```binarystring
  	* 1 00000000000 00000000000000000000
  	* ```
  	*
  	* @constant
  	* @type {uinteger32}
  	* @default 0x80000000
  	* @see [IEEE 754]{@link https://en.wikipedia.org/wiki/IEEE_754-1985}
  	*/
  	var FLOAT64_HIGH_WORD_SIGN_MASK = 0x80000000>>>0; // eslint-disable-line id-length


  	// EXPORTS //

  	lib$k = FLOAT64_HIGH_WORD_SIGN_MASK;
  	return lib$k;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2021 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var define_property;
  var hasRequiredDefine_property;

  function requireDefine_property () {
  	if (hasRequiredDefine_property) return define_property;
  	hasRequiredDefine_property = 1;

  	// MAIN //

  	var main = ( typeof Object.defineProperty === 'function' ) ? Object.defineProperty : null;


  	// EXPORTS //

  	define_property = main;
  	return define_property;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2021 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var has_define_property_support;
  var hasRequiredHas_define_property_support;

  function requireHas_define_property_support () {
  	if (hasRequiredHas_define_property_support) return has_define_property_support;
  	hasRequiredHas_define_property_support = 1;

  	// MODULES //

  	var defineProperty = requireDefine_property();


  	// MAIN //

  	/**
  	* Tests for `Object.defineProperty` support.
  	*
  	* @private
  	* @returns {boolean} boolean indicating if an environment has `Object.defineProperty` support
  	*
  	* @example
  	* var bool = hasDefinePropertySupport();
  	* // returns <boolean>
  	*/
  	function hasDefinePropertySupport() {
  		// Test basic support...
  		try {
  			defineProperty( {}, 'x', {} );
  			return true;
  		} catch ( err ) { // eslint-disable-line no-unused-vars
  			return false;
  		}
  	}


  	// EXPORTS //

  	has_define_property_support = hasDefinePropertySupport;
  	return has_define_property_support;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var builtin;
  var hasRequiredBuiltin;

  function requireBuiltin () {
  	if (hasRequiredBuiltin) return builtin;
  	hasRequiredBuiltin = 1;

  	// MAIN //

  	/**
  	* Defines (or modifies) an object property.
  	*
  	* ## Notes
  	*
  	* -   Property descriptors come in two flavors: **data descriptors** and **accessor descriptors**. A data descriptor is a property that has a value, which may or may not be writable. An accessor descriptor is a property described by a getter-setter function pair. A descriptor must be one of these two flavors and cannot be both.
  	*
  	* @name defineProperty
  	* @type {Function}
  	* @param {Object} obj - object on which to define the property
  	* @param {(string|symbol)} prop - property name
  	* @param {Object} descriptor - property descriptor
  	* @param {boolean} [descriptor.configurable=false] - boolean indicating if property descriptor can be changed and if the property can be deleted from the provided object
  	* @param {boolean} [descriptor.enumerable=false] - boolean indicating if the property shows up when enumerating object properties
  	* @param {boolean} [descriptor.writable=false] - boolean indicating if the value associated with the property can be changed with an assignment operator
  	* @param {*} [descriptor.value] - property value
  	* @param {(Function|void)} [descriptor.get=undefined] - function which serves as a getter for the property, or, if no getter, undefined. When the property is accessed, a getter function is called without arguments and with the `this` context set to the object through which the property is accessed (which may not be the object on which the property is defined due to inheritance). The return value will be used as the property value.
  	* @param {(Function|void)} [descriptor.set=undefined] - function which serves as a setter for the property, or, if no setter, undefined. When assigning a property value, a setter function is called with one argument (the value being assigned to the property) and with the `this` context set to the object through which the property is assigned.
  	* @throws {TypeError} first argument must be an object
  	* @throws {TypeError} third argument must be an object
  	* @throws {Error} property descriptor cannot have both a value and a setter and/or getter
  	* @returns {Object} object with added property
  	*
  	* @example
  	* var obj = {};
  	*
  	* defineProperty( obj, 'foo', {
  	*     'value': 'bar'
  	* });
  	*
  	* var str = obj.foo;
  	* // returns 'bar'
  	*/
  	var defineProperty = Object.defineProperty;


  	// EXPORTS //

  	builtin = defineProperty;
  	return builtin;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var is_number;
  var hasRequiredIs_number;

  function requireIs_number () {
  	if (hasRequiredIs_number) return is_number;
  	hasRequiredIs_number = 1;

  	/**
  	* Tests if a value is a number primitive.
  	*
  	* @param {*} value - value to test
  	* @returns {boolean} boolean indicating if a value is a number primitive
  	*
  	* @example
  	* var bool = isNumber( 3.14 );
  	* // returns true
  	*
  	* @example
  	* var bool = isNumber( NaN );
  	* // returns true
  	*
  	* @example
  	* var bool = isNumber( new Number( 3.14 ) );
  	* // returns false
  	*/
  	function isNumber( value ) {
  		return ( typeof value === 'number' );  // NOTE: we inline the `isNumber.isPrimitive` function from `@stdlib/assert/is-number` in order to avoid circular dependencies.
  	}


  	// EXPORTS //

  	is_number = isNumber;
  	return is_number;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var zero_pad;
  var hasRequiredZero_pad;

  function requireZero_pad () {
  	if (hasRequiredZero_pad) return zero_pad;
  	hasRequiredZero_pad = 1;

  	// FUNCTIONS //

  	/**
  	* Tests if a string starts with a minus sign (`-`).
  	*
  	* @private
  	* @param {string} str - input string
  	* @returns {boolean} boolean indicating if a string starts with a minus sign (`-`)
  	*/
  	function startsWithMinus( str ) {
  		return str[ 0 ] === '-';
  	}

  	/**
  	* Returns a string of `n` zeros.
  	*
  	* @private
  	* @param {number} n - number of zeros
  	* @returns {string} string of zeros
  	*/
  	function zeros( n ) {
  		var out = '';
  		var i;
  		for ( i = 0; i < n; i++ ) {
  			out += '0';
  		}
  		return out;
  	}


  	// MAIN //

  	/**
  	* Pads a token with zeros to the specified width.
  	*
  	* @private
  	* @param {string} str - token argument
  	* @param {number} width - token width
  	* @param {boolean} [right=false] - boolean indicating whether to pad to the right
  	* @returns {string} padded token argument
  	*/
  	function zeroPad( str, width, right ) {
  		var negative = false;
  		var pad = width - str.length;
  		if ( pad < 0 ) {
  			return str;
  		}
  		if ( startsWithMinus( str ) ) {
  			negative = true;
  			str = str.substr( 1 );
  		}
  		str = ( right ) ?
  			str + zeros( pad ) :
  			zeros( pad ) + str;
  		if ( negative ) {
  			str = '-' + str;
  		}
  		return str;
  	}


  	// EXPORTS //

  	zero_pad = zeroPad;
  	return zero_pad;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var format_integer;
  var hasRequiredFormat_integer;

  function requireFormat_integer () {
  	if (hasRequiredFormat_integer) return format_integer;
  	hasRequiredFormat_integer = 1;

  	// MODULES //

  	var isNumber = requireIs_number();
  	var zeroPad = requireZero_pad();

  	// NOTE: for the following, we explicitly avoid using stdlib packages in this particular package in order to avoid circular dependencies.
  	var lowercase = String.prototype.toLowerCase;
  	var uppercase = String.prototype.toUpperCase;


  	// MAIN //

  	/**
  	* Formats a token object argument as an integer.
  	*
  	* @private
  	* @param {Object} token - token object
  	* @throws {Error} must provide a valid integer
  	* @returns {string} formatted token argument
  	*/
  	function formatInteger( token ) {
  		var base;
  		var out;
  		var i;

  		switch ( token.specifier ) {
  		case 'b':
  			// Case: %b (binary)
  			base = 2;
  			break;
  		case 'o':
  			// Case: %o (octal)
  			base = 8;
  			break;
  		case 'x':
  		case 'X':
  			// Case: %x, %X (hexadecimal)
  			base = 16;
  			break;
  		case 'd':
  		case 'i':
  		case 'u':
  		default:
  			// Case: %d, %i, %u (decimal)
  			base = 10;
  			break;
  		}
  		out = token.arg;
  		i = parseInt( out, 10 );
  		if ( !isFinite( i ) ) { // NOTE: We use the global `isFinite` function here instead of `@stdlib/math/base/assert/is-finite` in order to avoid circular dependencies.
  			if ( !isNumber( out ) ) {
  				throw new Error( 'invalid integer. Value: ' + out );
  			}
  			i = 0;
  		}
  		if ( i < 0 && ( token.specifier === 'u' || base !== 10 ) ) {
  			i = 0xffffffff + i + 1;
  		}
  		if ( i < 0 ) {
  			out = ( -i ).toString( base );
  			if ( token.precision ) {
  				out = zeroPad( out, token.precision, token.padRight );
  			}
  			out = '-' + out;
  		} else {
  			out = i.toString( base );
  			if ( !i && !token.precision ) {
  				out = '';
  			} else if ( token.precision ) {
  				out = zeroPad( out, token.precision, token.padRight );
  			}
  			if ( token.sign ) {
  				out = token.sign + out;
  			}
  		}
  		if ( base === 16 ) {
  			if ( token.alternate ) {
  				out = '0x' + out;
  			}
  			out = ( token.specifier === uppercase.call( token.specifier ) ) ?
  				uppercase.call( out ) :
  				lowercase.call( out );
  		}
  		if ( base === 8 ) {
  			if ( token.alternate && out.charAt( 0 ) !== '0' ) {
  				out = '0' + out;
  			}
  		}
  		return out;
  	}


  	// EXPORTS //

  	format_integer = formatInteger;
  	return format_integer;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var is_string$1;
  var hasRequiredIs_string$1;

  function requireIs_string$1 () {
  	if (hasRequiredIs_string$1) return is_string$1;
  	hasRequiredIs_string$1 = 1;

  	/**
  	* Tests if a value is a string primitive.
  	*
  	* @param {*} value - value to test
  	* @returns {boolean} boolean indicating if a value is a string primitive
  	*
  	* @example
  	* var bool = isString( 'beep' );
  	* // returns true
  	*
  	* @example
  	* var bool = isString( new String( 'beep' ) );
  	* // returns false
  	*/
  	function isString( value ) {
  		return ( typeof value === 'string' ); // NOTE: we inline the `isString.isPrimitive` function from `@stdlib/assert/is-string` in order to avoid circular dependencies.
  	}


  	// EXPORTS //

  	is_string$1 = isString;
  	return is_string$1;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var format_double;
  var hasRequiredFormat_double;

  function requireFormat_double () {
  	if (hasRequiredFormat_double) return format_double;
  	hasRequiredFormat_double = 1;

  	// MODULES //

  	var isNumber = requireIs_number();

  	// NOTE: for the following, we explicitly avoid using stdlib packages in this particular package in order to avoid circular dependencies.
  	var abs = Math.abs; // eslint-disable-line stdlib/no-builtin-math
  	var lowercase = String.prototype.toLowerCase;
  	var uppercase = String.prototype.toUpperCase;
  	var replace = String.prototype.replace;


  	// VARIABLES //

  	var RE_EXP_POS_DIGITS = /e\+(\d)$/;
  	var RE_EXP_NEG_DIGITS = /e-(\d)$/;
  	var RE_ONLY_DIGITS = /^(\d+)$/;
  	var RE_DIGITS_BEFORE_EXP = /^(\d+)e/;
  	var RE_TRAILING_PERIOD_ZERO = /\.0$/;
  	var RE_PERIOD_ZERO_EXP = /\.0*e/;
  	var RE_ZERO_BEFORE_EXP = /(\..*[^0])0*e/;


  	// MAIN //

  	/**
  	* Formats a token object argument as a floating-point number.
  	*
  	* @private
  	* @param {Object} token - token object
  	* @throws {Error} must provide a valid floating-point number
  	* @returns {string} formatted token argument
  	*/
  	function formatDouble( token ) {
  		var digits;
  		var out;
  		var f = parseFloat( token.arg );
  		if ( !isFinite( f ) ) { // NOTE: We use the global `isFinite` function here instead of `@stdlib/math/base/assert/is-finite` in order to avoid circular dependencies.
  			if ( !isNumber( token.arg ) ) {
  				throw new Error( 'invalid floating-point number. Value: ' + out );
  			}
  			// Case: NaN, Infinity, or -Infinity
  			f = token.arg;
  		}
  		switch ( token.specifier ) {
  		case 'e':
  		case 'E':
  			out = f.toExponential( token.precision );
  			break;
  		case 'f':
  		case 'F':
  			out = f.toFixed( token.precision );
  			break;
  		case 'g':
  		case 'G':
  			if ( abs( f ) < 0.0001 ) {
  				digits = token.precision;
  				if ( digits > 0 ) {
  					digits -= 1;
  				}
  				out = f.toExponential( digits );
  			} else {
  				out = f.toPrecision( token.precision );
  			}
  			if ( !token.alternate ) {
  				out = replace.call( out, RE_ZERO_BEFORE_EXP, '$1e' );
  				out = replace.call( out, RE_PERIOD_ZERO_EXP, 'e' );
  				out = replace.call( out, RE_TRAILING_PERIOD_ZERO, '' );
  			}
  			break;
  		default:
  			throw new Error( 'invalid double notation. Value: ' + token.specifier );
  		}
  		out = replace.call( out, RE_EXP_POS_DIGITS, 'e+0$1' );
  		out = replace.call( out, RE_EXP_NEG_DIGITS, 'e-0$1' );
  		if ( token.alternate ) {
  			out = replace.call( out, RE_ONLY_DIGITS, '$1.' );
  			out = replace.call( out, RE_DIGITS_BEFORE_EXP, '$1.e' );
  		}
  		if ( f >= 0 && token.sign ) {
  			out = token.sign + out;
  		}
  		out = ( token.specifier === uppercase.call( token.specifier ) ) ?
  			uppercase.call( out ) :
  			lowercase.call( out );
  		return out;
  	}


  	// EXPORTS //

  	format_double = formatDouble;
  	return format_double;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var space_pad;
  var hasRequiredSpace_pad;

  function requireSpace_pad () {
  	if (hasRequiredSpace_pad) return space_pad;
  	hasRequiredSpace_pad = 1;

  	// FUNCTIONS //

  	/**
  	* Returns `n` spaces.
  	*
  	* @private
  	* @param {number} n - number of spaces
  	* @returns {string} string of spaces
  	*/
  	function spaces( n ) {
  		var out = '';
  		var i;
  		for ( i = 0; i < n; i++ ) {
  			out += ' ';
  		}
  		return out;
  	}


  	// MAIN //

  	/**
  	* Pads a token with spaces to the specified width.
  	*
  	* @private
  	* @param {string} str - token argument
  	* @param {number} width - token width
  	* @param {boolean} [right=false] - boolean indicating whether to pad to the right
  	* @returns {string} padded token argument
  	*/
  	function spacePad( str, width, right ) {
  		var pad = width - str.length;
  		if ( pad < 0 ) {
  			return str;
  		}
  		str = ( right ) ?
  			str + spaces( pad ) :
  			spaces( pad ) + str;
  		return str;
  	}


  	// EXPORTS //

  	space_pad = spacePad;
  	return space_pad;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$g;
  var hasRequiredMain$g;

  function requireMain$g () {
  	if (hasRequiredMain$g) return main$g;
  	hasRequiredMain$g = 1;

  	// MODULES //

  	var formatInteger = requireFormat_integer();
  	var isString = requireIs_string$1();
  	var formatDouble = requireFormat_double();
  	var spacePad = requireSpace_pad();
  	var zeroPad = requireZero_pad();


  	// VARIABLES //

  	var fromCharCode = String.fromCharCode;
  	var isArray = Array.isArray; // NOTE: We use the global `Array.isArray` function here instead of `@stdlib/assert/is-array` to avoid circular dependencies.


  	// FUNCTIONS //

  	/**
  	* Returns a boolean indicating whether a value is `NaN`.
  	*
  	* @private
  	* @param {*} value - input value
  	* @returns {boolean} boolean indicating whether a value is `NaN`
  	*
  	* @example
  	* var bool = isnan( NaN );
  	* // returns true
  	*
  	* @example
  	* var bool = isnan( 4 );
  	* // returns false
  	*/
  	function isnan( value ) { // explicitly define a function here instead of `@stdlib/math/base/assert/is-nan` in order to avoid circular dependencies
  		return ( value !== value );
  	}

  	/**
  	* Initializes token object with properties of supplied format identifier object or default values if not present.
  	*
  	* @private
  	* @param {Object} token - format identifier object
  	* @returns {Object} token object
  	*/
  	function initialize( token ) {
  		var out = {};
  		out.specifier = token.specifier;
  		out.precision = ( token.precision === void 0 ) ? 1 : token.precision;
  		out.width = token.width;
  		out.flags = token.flags || '';
  		out.mapping = token.mapping;
  		return out;
  	}


  	// MAIN //

  	/**
  	* Generates string from a token array by interpolating values.
  	*
  	* @param {Array} tokens - string parts and format identifier objects
  	* @param {Array} ...args - variable values
  	* @throws {TypeError} first argument must be an array
  	* @throws {Error} invalid flags
  	* @returns {string} formatted string
  	*
  	* @example
  	* var tokens = [ 'beep ', { 'specifier': 's' } ];
  	* var out = formatInterpolate( tokens, 'boop' );
  	* // returns 'beep boop'
  	*/
  	function formatInterpolate( tokens ) {
  		var hasPeriod;
  		var flags;
  		var token;
  		var flag;
  		var num;
  		var out;
  		var pos;
  		var i;
  		var j;

  		if ( !isArray( tokens ) ) {
  			throw new TypeError( 'invalid argument. First argument must be an array. Value: `' + tokens + '`.' );
  		}
  		out = '';
  		pos = 1;
  		for ( i = 0; i < tokens.length; i++ ) {
  			token = tokens[ i ];
  			if ( isString( token ) ) {
  				out += token;
  			} else {
  				hasPeriod = token.precision !== void 0;
  				token = initialize( token );
  				if ( !token.specifier ) {
  					throw new TypeError( 'invalid argument. Token is missing `specifier` property. Index: `'+ i +'`. Value: `' + token + '`.' );
  				}
  				if ( token.mapping ) {
  					pos = token.mapping;
  				}
  				flags = token.flags;
  				for ( j = 0; j < flags.length; j++ ) {
  					flag = flags.charAt( j );
  					switch ( flag ) {
  					case ' ':
  						token.sign = ' ';
  						break;
  					case '+':
  						token.sign = '+';
  						break;
  					case '-':
  						token.padRight = true;
  						token.padZeros = false;
  						break;
  					case '0':
  						token.padZeros = flags.indexOf( '-' ) < 0; // NOTE: We use built-in `Array.prototype.indexOf` here instead of `@stdlib/assert/contains` in order to avoid circular dependencies.
  						break;
  					case '#':
  						token.alternate = true;
  						break;
  					default:
  						throw new Error( 'invalid flag: ' + flag );
  					}
  				}
  				if ( token.width === '*' ) {
  					token.width = parseInt( arguments[ pos ], 10 );
  					pos += 1;
  					if ( isnan( token.width ) ) {
  						throw new TypeError( 'the argument for * width at position ' + pos + ' is not a number. Value: `' + token.width + '`.' );
  					}
  					if ( token.width < 0 ) {
  						token.padRight = true;
  						token.width = -token.width;
  					}
  				}
  				if ( hasPeriod ) {
  					if ( token.precision === '*' ) {
  						token.precision = parseInt( arguments[ pos ], 10 );
  						pos += 1;
  						if ( isnan( token.precision ) ) {
  							throw new TypeError( 'the argument for * precision at position ' + pos + ' is not a number. Value: `' + token.precision + '`.' );
  						}
  						if ( token.precision < 0 ) {
  							token.precision = 1;
  							hasPeriod = false;
  						}
  					}
  				}
  				token.arg = arguments[ pos ];
  				switch ( token.specifier ) {
  				case 'b':
  				case 'o':
  				case 'x':
  				case 'X':
  				case 'd':
  				case 'i':
  				case 'u':
  					// Case: %b (binary), %o (octal), %x, %X (hexadecimal), %d, %i (decimal), %u (unsigned decimal)
  					if ( hasPeriod ) {
  						token.padZeros = false;
  					}
  					token.arg = formatInteger( token );
  					break;
  				case 's':
  					// Case: %s (string)
  					token.maxWidth = ( hasPeriod ) ? token.precision : -1;
  					token.arg = String( token.arg );
  					break;
  				case 'c':
  					// Case: %c (character)
  					if ( !isnan( token.arg ) ) {
  						num = parseInt( token.arg, 10 );
  						if ( num < 0 || num > 127 ) {
  							throw new Error( 'invalid character code. Value: ' + token.arg );
  						}
  						token.arg = ( isnan( num ) ) ? String( token.arg ) : fromCharCode( num ); // eslint-disable-line max-len
  					}
  					break;
  				case 'e':
  				case 'E':
  				case 'f':
  				case 'F':
  				case 'g':
  				case 'G':
  					// Case: %e, %E (scientific notation), %f, %F (decimal floating point), %g, %G (uses the shorter of %e/E or %f/F)
  					if ( !hasPeriod ) {
  						token.precision = 6;
  					}
  					token.arg = formatDouble( token );
  					break;
  				default:
  					throw new Error( 'invalid specifier: ' + token.specifier );
  				}
  				// Fit argument into field width...
  				if ( token.maxWidth >= 0 && token.arg.length > token.maxWidth ) {
  					token.arg = token.arg.substring( 0, token.maxWidth );
  				}
  				if ( token.padZeros ) {
  					token.arg = zeroPad( token.arg, token.width || token.precision, token.padRight ); // eslint-disable-line max-len
  				} else if ( token.width ) {
  					token.arg = spacePad( token.arg, token.width, token.padRight );
  				}
  				out += token.arg || '';
  				pos += 1;
  			}
  		}
  		return out;
  	}


  	// EXPORTS //

  	main$g = formatInterpolate;
  	return main$g;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$j;
  var hasRequiredLib$j;

  function requireLib$j () {
  	if (hasRequiredLib$j) return lib$j;
  	hasRequiredLib$j = 1;

  	/**
  	* Generate string from a token array by interpolating values.
  	*
  	* @module @stdlib/string-base-format-interpolate
  	*
  	* @example
  	* var formatInterpolate = require( '@stdlib/string-base-format-interpolate' );
  	*
  	* var tokens = ['Hello ', { 'specifier': 's' }, '!' ];
  	* var out = formatInterpolate( tokens, 'World' );
  	* // returns 'Hello World!'
  	*/

  	// MODULES //

  	var main = requireMain$g();


  	// EXPORTS //

  	lib$j = main;
  	return lib$j;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$f;
  var hasRequiredMain$f;

  function requireMain$f () {
  	if (hasRequiredMain$f) return main$f;
  	hasRequiredMain$f = 1;

  	// VARIABLES //

  	var RE = /%(?:([1-9]\d*)\$)?([0 +\-#]*)(\*|\d+)?(?:(\.)(\*|\d+)?)?[hlL]?([%A-Za-z])/g;


  	// FUNCTIONS //

  	/**
  	* Parses a delimiter.
  	*
  	* @private
  	* @param {Array} match - regular expression match
  	* @returns {Object} delimiter token object
  	*/
  	function parse( match ) {
  		var token = {
  			'mapping': ( match[ 1 ] ) ? parseInt( match[ 1 ], 10 ) : void 0,
  			'flags': match[ 2 ],
  			'width': match[ 3 ],
  			'precision': match[ 5 ],
  			'specifier': match[ 6 ]
  		};
  		if ( match[ 4 ] === '.' && match[ 5 ] === void 0 ) {
  			token.precision = '1';
  		}
  		return token;
  	}


  	// MAIN //

  	/**
  	* Tokenizes a string into an array of string parts and format identifier objects.
  	*
  	* @param {string} str - input string
  	* @returns {Array} tokens
  	*
  	* @example
  	* var tokens = formatTokenize( 'Hello %s!' );
  	* // returns [ 'Hello ', {...}, '!' ]
  	*/
  	function formatTokenize( str ) {
  		var content;
  		var tokens;
  		var match;
  		var prev;

  		tokens = [];
  		prev = 0;
  		match = RE.exec( str );
  		while ( match ) {
  			content = str.slice( prev, RE.lastIndex - match[ 0 ].length );
  			if ( content.length ) {
  				tokens.push( content );
  			}
  			tokens.push( parse( match ) );
  			prev = RE.lastIndex;
  			match = RE.exec( str );
  		}
  		content = str.slice( prev );
  		if ( content.length ) {
  			tokens.push( content );
  		}
  		return tokens;
  	}


  	// EXPORTS //

  	main$f = formatTokenize;
  	return main$f;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$i;
  var hasRequiredLib$i;

  function requireLib$i () {
  	if (hasRequiredLib$i) return lib$i;
  	hasRequiredLib$i = 1;

  	/**
  	* Tokenize a string into an array of string parts and format identifier objects.
  	*
  	* @module @stdlib/string-base-format-tokenize
  	*
  	* @example
  	* var formatTokenize = require( '@stdlib/string-base-format-tokenize' );
  	*
  	* var str = 'Hello %s!';
  	* var tokens = formatTokenize( str );
  	* // returns [ 'Hello ', {...}, '!' ]
  	*/

  	// MODULES //

  	var main = requireMain$f();


  	// EXPORTS //

  	lib$i = main;
  	return lib$i;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var is_string;
  var hasRequiredIs_string;

  function requireIs_string () {
  	if (hasRequiredIs_string) return is_string;
  	hasRequiredIs_string = 1;

  	/**
  	* Tests if a value is a string primitive.
  	*
  	* @param {*} value - value to test
  	* @returns {boolean} boolean indicating if a value is a string primitive
  	*
  	* @example
  	* var bool = isString( 'beep' );
  	* // returns true
  	*
  	* @example
  	* var bool = isString( new String( 'beep' ) );
  	* // returns false
  	*/
  	function isString( value ) {
  		return ( typeof value === 'string' ); // NOTE: we inline the `isString.isPrimitive` function from `@stdlib/assert/is-string` in order to avoid circular dependencies.
  	}


  	// EXPORTS //

  	is_string = isString;
  	return is_string;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$e;
  var hasRequiredMain$e;

  function requireMain$e () {
  	if (hasRequiredMain$e) return main$e;
  	hasRequiredMain$e = 1;

  	// MODULES //

  	var interpolate = requireLib$j();
  	var tokenize = requireLib$i();
  	var isString = requireIs_string();


  	// MAIN //

  	/**
  	* Inserts supplied variable values into a format string.
  	*
  	* @param {string} str - input string
  	* @param {Array} ...args - variable values
  	* @throws {TypeError} first argument must be a string
  	* @throws {Error} invalid flags
  	* @returns {string} formatted string
  	*
  	* @example
  	* var str = format( 'Hello %s!', 'world' );
  	* // returns 'Hello world!'
  	*
  	* @example
  	* var str = format( 'Pi: ~%.2f', 3.141592653589793 );
  	* // returns 'Pi: ~3.14'
  	*/
  	function format( str ) {
  		var args;
  		var i;

  		if ( !isString( str ) ) {
  			throw new TypeError( format( 'invalid argument. First argument must be a string. Value: `%s`.', str ) );
  		}
  		args = [ tokenize( str ) ];
  		for ( i = 1; i < arguments.length; i++ ) {
  			args.push( arguments[ i ] );
  		}
  		return interpolate.apply( null, args );
  	}


  	// EXPORTS //

  	main$e = format;
  	return main$e;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$h;
  var hasRequiredLib$h;

  function requireLib$h () {
  	if (hasRequiredLib$h) return lib$h;
  	hasRequiredLib$h = 1;

  	/**
  	* Insert supplied variable values into a format string.
  	*
  	* @module @stdlib/string-format
  	*
  	* @example
  	* var format = require( '@stdlib/string-format' );
  	*
  	* var out = format( '%s %s!', 'Hello', 'World' );
  	* // returns 'Hello World!'
  	*
  	* out = format( 'Pi: ~%.2f', 3.141592653589793 );
  	* // returns 'Pi: ~3.14'
  	*/

  	// MODULES //

  	var main = requireMain$e();


  	// EXPORTS //

  	lib$h = main;
  	return lib$h;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyfill;
  var hasRequiredPolyfill;

  function requirePolyfill () {
  	if (hasRequiredPolyfill) return polyfill;
  	hasRequiredPolyfill = 1;

  	// MODULES //

  	var format = requireLib$h();


  	// VARIABLES //

  	var objectProtoype = Object.prototype;
  	var toStr = objectProtoype.toString;
  	var defineGetter = objectProtoype.__defineGetter__;
  	var defineSetter = objectProtoype.__defineSetter__;
  	var lookupGetter = objectProtoype.__lookupGetter__;
  	var lookupSetter = objectProtoype.__lookupSetter__;


  	// MAIN //

  	/**
  	* Defines (or modifies) an object property.
  	*
  	* ## Notes
  	*
  	* -   Property descriptors come in two flavors: **data descriptors** and **accessor descriptors**. A data descriptor is a property that has a value, which may or may not be writable. An accessor descriptor is a property described by a getter-setter function pair. A descriptor must be one of these two flavors and cannot be both.
  	*
  	* @param {Object} obj - object on which to define the property
  	* @param {string} prop - property name
  	* @param {Object} descriptor - property descriptor
  	* @param {boolean} [descriptor.configurable=false] - boolean indicating if property descriptor can be changed and if the property can be deleted from the provided object
  	* @param {boolean} [descriptor.enumerable=false] - boolean indicating if the property shows up when enumerating object properties
  	* @param {boolean} [descriptor.writable=false] - boolean indicating if the value associated with the property can be changed with an assignment operator
  	* @param {*} [descriptor.value] - property value
  	* @param {(Function|void)} [descriptor.get=undefined] - function which serves as a getter for the property, or, if no getter, undefined. When the property is accessed, a getter function is called without arguments and with the `this` context set to the object through which the property is accessed (which may not be the object on which the property is defined due to inheritance). The return value will be used as the property value.
  	* @param {(Function|void)} [descriptor.set=undefined] - function which serves as a setter for the property, or, if no setter, undefined. When assigning a property value, a setter function is called with one argument (the value being assigned to the property) and with the `this` context set to the object through which the property is assigned.
  	* @throws {TypeError} first argument must be an object
  	* @throws {TypeError} third argument must be an object
  	* @throws {Error} property descriptor cannot have both a value and a setter and/or getter
  	* @returns {Object} object with added property
  	*
  	* @example
  	* var obj = {};
  	*
  	* defineProperty( obj, 'foo', {
  	*     'value': 'bar'
  	* });
  	*
  	* var str = obj.foo;
  	* // returns 'bar'
  	*/
  	function defineProperty( obj, prop, descriptor ) {
  		var prototype;
  		var hasValue;
  		var hasGet;
  		var hasSet;

  		if ( typeof obj !== 'object' || obj === null || toStr.call( obj ) === '[object Array]' ) {
  			throw new TypeError( format( 'invalid argument. First argument must be an object. Value: `%s`.', obj ) );
  		}
  		if ( typeof descriptor !== 'object' || descriptor === null || toStr.call( descriptor ) === '[object Array]' ) {
  			throw new TypeError( format( 'invalid argument. Property descriptor must be an object. Value: `%s`.', descriptor ) );
  		}
  		hasValue = ( 'value' in descriptor );
  		if ( hasValue ) {
  			if (
  				lookupGetter.call( obj, prop ) ||
  				lookupSetter.call( obj, prop )
  			) {
  				// Override `__proto__` to avoid touching inherited accessors:
  				prototype = obj.__proto__;
  				obj.__proto__ = objectProtoype;

  				// Delete property as existing getters/setters prevent assigning value to specified property:
  				delete obj[ prop ];
  				obj[ prop ] = descriptor.value;

  				// Restore original prototype:
  				obj.__proto__ = prototype;
  			} else {
  				obj[ prop ] = descriptor.value;
  			}
  		}
  		hasGet = ( 'get' in descriptor );
  		hasSet = ( 'set' in descriptor );

  		if ( hasValue && ( hasGet || hasSet ) ) {
  			throw new Error( 'invalid argument. Cannot specify one or more accessors and a value or writable attribute in the property descriptor.' );
  		}

  		if ( hasGet && defineGetter ) {
  			defineGetter.call( obj, prop, descriptor.get );
  		}
  		if ( hasSet && defineSetter ) {
  			defineSetter.call( obj, prop, descriptor.set );
  		}
  		return obj;
  	}


  	// EXPORTS //

  	polyfill = defineProperty;
  	return polyfill;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$g;
  var hasRequiredLib$g;

  function requireLib$g () {
  	if (hasRequiredLib$g) return lib$g;
  	hasRequiredLib$g = 1;

  	/**
  	* Define (or modify) an object property.
  	*
  	* @module @stdlib/utils-define-property
  	*
  	* @example
  	* var defineProperty = require( '@stdlib/utils-define-property' );
  	*
  	* var obj = {};
  	* defineProperty( obj, 'foo', {
  	*     'value': 'bar',
  	*     'writable': false,
  	*     'configurable': false,
  	*     'enumerable': false
  	* });
  	* obj.foo = 'boop'; // => throws
  	*/

  	// MODULES //

  	var hasDefinePropertySupport = requireHas_define_property_support();
  	var builtin = requireBuiltin();
  	var polyfill = requirePolyfill();


  	// MAIN //

  	var defineProperty;
  	if ( hasDefinePropertySupport() ) {
  		defineProperty = builtin;
  	} else {
  		defineProperty = polyfill;
  	}


  	// EXPORTS //

  	lib$g = defineProperty;
  	return lib$g;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$d;
  var hasRequiredMain$d;

  function requireMain$d () {
  	if (hasRequiredMain$d) return main$d;
  	hasRequiredMain$d = 1;

  	// MODULES //

  	var defineProperty = requireLib$g();


  	// MAIN //

  	/**
  	* Defines a non-enumerable read-only property.
  	*
  	* @param {Object} obj - object on which to define the property
  	* @param {(string|symbol)} prop - property name
  	* @param {*} value - value to set
  	*
  	* @example
  	* var obj = {};
  	*
  	* setNonEnumerableReadOnly( obj, 'foo', 'bar' );
  	*
  	* try {
  	*     obj.foo = 'boop';
  	* } catch ( err ) {
  	*     console.error( err.message );
  	* }
  	*/
  	function setNonEnumerableReadOnly( obj, prop, value ) {
  		defineProperty( obj, prop, {
  			'configurable': false,
  			'enumerable': false,
  			'writable': false,
  			'value': value
  		});
  	}


  	// EXPORTS //

  	main$d = setNonEnumerableReadOnly;
  	return main$d;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$f;
  var hasRequiredLib$f;

  function requireLib$f () {
  	if (hasRequiredLib$f) return lib$f;
  	hasRequiredLib$f = 1;

  	/**
  	* Define a non-enumerable read-only property.
  	*
  	* @module @stdlib/utils-define-nonenumerable-read-only-property
  	*
  	* @example
  	* var setNonEnumerableReadOnly = require( '@stdlib/utils-define-nonenumerable-read-only-property' );
  	*
  	* var obj = {};
  	*
  	* setNonEnumerableReadOnly( obj, 'foo', 'bar' );
  	*
  	* try {
  	*     obj.foo = 'boop';
  	* } catch ( err ) {
  	*     console.error( err.message );
  	* }
  	*/

  	// MODULES //

  	var main = requireMain$d();


  	// EXPORTS //

  	lib$f = main;
  	return lib$f;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var indices_1;
  var hasRequiredIndices;

  function requireIndices () {
  	if (hasRequiredIndices) return indices_1;
  	hasRequiredIndices = 1;

  	// MODULES //

  	var isLittleEndian = requireLib$C();


  	// MAIN //

  	var indices;
  	var HIGH;
  	var LOW;

  	if ( isLittleEndian === true ) {
  		HIGH = 1; // second index
  		LOW = 0; // first index
  	} else {
  		HIGH = 0; // first index
  		LOW = 1; // second index
  	}
  	indices = {
  		'HIGH': HIGH,
  		'LOW': LOW
  	};


  	// EXPORTS //

  	indices_1 = indices;
  	return indices_1;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var assign$1;
  var hasRequiredAssign$1;

  function requireAssign$1 () {
  	if (hasRequiredAssign$1) return assign$1;
  	hasRequiredAssign$1 = 1;

  	// MODULES //

  	var Uint32Array = requireLib$O();
  	var Float64Array = requireLib$L();
  	var indices = requireIndices();


  	// VARIABLES //

  	var FLOAT64_VIEW = new Float64Array( 1 );
  	var UINT32_VIEW = new Uint32Array( FLOAT64_VIEW.buffer );

  	var HIGH = indices.HIGH;
  	var LOW = indices.LOW;


  	// MAIN //

  	/**
  	* Splits a double-precision floating-point number into a higher order word (unsigned 32-bit integer) and a lower order word (unsigned 32-bit integer).
  	*
  	* ## Notes
  	*
  	* ```text
  	* float64 (64 bits)
  	* f := fraction (significand/mantissa) (52 bits)
  	* e := exponent (11 bits)
  	* s := sign bit (1 bit)
  	*
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* |                                Float64                                |
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* |              Uint32               |               Uint32              |
  	* |-------- -------- -------- -------- -------- -------- -------- --------|
  	* ```
  	*
  	* If little endian (more significant bits last):
  	*
  	* ```text
  	*                         <-- lower      higher -->
  	* |   f7       f6       f5       f4       f3       f2    e2 | f1 |s|  e1  |
  	* ```
  	*
  	* If big endian (more significant bits first):
  	*
  	* ```text
  	*                         <-- higher      lower -->
  	* |s| e1    e2 | f1     f2       f3       f4       f5        f6      f7   |
  	* ```
  	*
  	* In which Uint32 can we find the higher order bits? If little endian, the second; if big endian, the first.
  	*
  	* ## References
  	*
  	* -   [Open Group][1]
  	*
  	* [1]: http://pubs.opengroup.org/onlinepubs/9629399/chap14.htm
  	*
  	* @private
  	* @param {number} x - input value
  	* @param {Collection} out - output array
  	* @param {integer} stride - output array stride
  	* @param {NonNegativeInteger} offset - output array index offset
  	* @returns {Collection} output array
  	*
  	* @example
  	* var Uint32Array = require( '@stdlib/array-uint32' );
  	*
  	* var out = new Uint32Array( 2 );
  	*
  	* var w = toWords( 3.14e201, out, 1, 0 );
  	* // returns <Uint32Array>[ 1774486211, 2479577218 ]
  	*
  	* var bool = ( w === out );
  	* // returns true
  	*/
  	function toWords( x, out, stride, offset ) {
  		FLOAT64_VIEW[ 0 ] = x;
  		out[ offset ] = UINT32_VIEW[ HIGH ];
  		out[ offset + stride ] = UINT32_VIEW[ LOW ];
  		return out;
  	}


  	// EXPORTS //

  	assign$1 = toWords;
  	return assign$1;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$c;
  var hasRequiredMain$c;

  function requireMain$c () {
  	if (hasRequiredMain$c) return main$c;
  	hasRequiredMain$c = 1;

  	// MODULES //

  	var fcn = requireAssign$1();


  	// MAIN //

  	/**
  	* Splits a double-precision floating-point number into a higher order word (unsigned 32-bit integer) and a lower order word (unsigned 32-bit integer).
  	*
  	* @param {number} x - input value
  	* @returns {Array<number>} output array
  	*
  	* @example
  	* var w = toWords( 3.14e201 );
  	* // returns [ 1774486211, 2479577218 ]
  	*/
  	function toWords( x ) {
  		return fcn( x, [ 0>>>0, 0>>>0 ], 1, 0 );
  	}


  	// EXPORTS //

  	main$c = toWords;
  	return main$c;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$e;
  var hasRequiredLib$e;

  function requireLib$e () {
  	if (hasRequiredLib$e) return lib$e;
  	hasRequiredLib$e = 1;

  	/**
  	* Split a double-precision floating-point number into a higher order word (unsigned 32-bit integer) and a lower order word (unsigned 32-bit integer).
  	*
  	* @module @stdlib/number-float64-base-to-words
  	*
  	* @example
  	* var toWords = require( '@stdlib/number-float64-base-to-words' );
  	*
  	* var w = toWords( 3.14e201 );
  	* // returns [ 1774486211, 2479577218 ]
  	*
  	* @example
  	* var Uint32Array = require( '@stdlib/array-uint32' );
  	* var toWords = require( '@stdlib/number-float64-base-to-words' );
  	*
  	* var out = new Uint32Array( 2 );
  	*
  	* var w = toWords.assign( 3.14e201, out, 1, 0 );
  	* // returns <Uint32Array>[ 1774486211, 2479577218 ]
  	*
  	* var bool = ( w === out );
  	* // returns true
  	*/

  	// MODULES //

  	var setReadOnly = requireLib$f();
  	var main = requireMain$c();
  	var assign = requireAssign$1();


  	// MAIN //

  	setReadOnly( main, 'assign', assign );


  	// EXPORTS //

  	lib$e = main;
  	return lib$e;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$b;
  var hasRequiredMain$b;

  function requireMain$b () {
  	if (hasRequiredMain$b) return main$b;
  	hasRequiredMain$b = 1;

  	// MODULES //

  	var SIGN_MASK = requireLib$k();
  	var ABS_MASK = requireLib$s();
  	var toWords = requireLib$e();
  	var getHighWord = requireLib$B();
  	var fromWords = requireLib$o();


  	// VARIABLES //

  	// High/low words workspace:
  	var WORDS = [ 0, 0 ];


  	// MAIN //

  	/**
  	* Returns a double-precision floating-point number with the magnitude of `x` and the sign of `y`.
  	*
  	* @param {number} x - number from which to derive a magnitude
  	* @param {number} y - number from which to derive a sign
  	* @returns {number} a double-precision floating-point number
  	*
  	* @example
  	* var z = copysign( -3.14, 10.0 );
  	* // returns 3.14
  	*
  	* @example
  	* var z = copysign( 3.14, -1.0 );
  	* // returns -3.14
  	*
  	* @example
  	* var z = copysign( 1.0, -0.0 );
  	* // returns -1.0
  	*
  	* @example
  	* var z = copysign( -3.14, -0.0 );
  	* // returns -3.14
  	*
  	* @example
  	* var z = copysign( -0.0, 1.0 );
  	* // returns 0.0
  	*/
  	function copysign( x, y ) {
  		var hx;
  		var hy;

  		// Split `x` into higher and lower order words:
  		toWords.assign( x, WORDS, 1, 0 );
  		hx = WORDS[ 0 ];

  		// Turn off the sign bit of `x`:
  		hx &= ABS_MASK;

  		// Extract the higher order word from `y`:
  		hy = getHighWord( y );

  		// Leave only the sign bit of `y` turned on:
  		hy &= SIGN_MASK;

  		// Copy the sign bit of `y` to `x`:
  		hx |= hy;

  		// Return a new value having the same magnitude as `x`, but with the sign of `y`:
  		return fromWords( hx, WORDS[ 1 ] );
  	}


  	// EXPORTS //

  	main$b = copysign;
  	return main$b;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$d;
  var hasRequiredLib$d;

  function requireLib$d () {
  	if (hasRequiredLib$d) return lib$d;
  	hasRequiredLib$d = 1;

  	/**
  	* Return a double-precision floating-point number with the magnitude of `x` and the sign of `y`.
  	*
  	* @module @stdlib/math-base-special-copysign
  	*
  	* @example
  	* var copysign = require( '@stdlib/math-base-special-copysign' );
  	*
  	* var z = copysign( -3.14, 10.0 );
  	* // returns 3.14
  	*
  	* z = copysign( 3.14, -1.0 );
  	* // returns -3.14
  	*
  	* z = copysign( 1.0, -0.0 );
  	* // returns -1.0
  	*
  	* z = copysign( -3.14, -0.0 );
  	* // returns -3.14
  	*
  	* z = copysign( -0.0, 1.0 );
  	* // returns 0.0
  	*/

  	// MODULES //

  	var main = requireMain$b();


  	// EXPORTS //

  	lib$d = main;
  	return lib$d;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$c;
  var hasRequiredLib$c;

  function requireLib$c () {
  	if (hasRequiredLib$c) return lib$c;
  	hasRequiredLib$c = 1;

  	/**
  	* Smallest positive double-precision floating-point normal number.
  	*
  	* @module @stdlib/constants-float64-smallest-normal
  	* @type {number}
  	*
  	* @example
  	* var FLOAT64_SMALLEST_NORMAL = require( '@stdlib/constants-float64-smallest-normal' );
  	* // returns 2.2250738585072014e-308
  	*/


  	// MAIN //

  	/**
  	* The smallest positive double-precision floating-point normal number.
  	*
  	* ## Notes
  	*
  	* The number has the value
  	*
  	* ```tex
  	* \frac{1}{2^{1023-1}}
  	* ```
  	*
  	* which corresponds to the bit sequence
  	*
  	* ```binarystring
  	* 0 00000000001 00000000000000000000 00000000000000000000000000000000
  	* ```
  	*
  	* @constant
  	* @type {number}
  	* @default 2.2250738585072014e-308
  	* @see [IEEE 754]{@link https://en.wikipedia.org/wiki/IEEE_754-1985}
  	*/
  	var FLOAT64_SMALLEST_NORMAL = 2.2250738585072014e-308;


  	// EXPORTS //

  	lib$c = FLOAT64_SMALLEST_NORMAL;
  	return lib$c;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var assign;
  var hasRequiredAssign;

  function requireAssign () {
  	if (hasRequiredAssign) return assign;
  	hasRequiredAssign = 1;

  	// MODULES //

  	var FLOAT64_SMALLEST_NORMAL = requireLib$c();
  	var isInfinite = requireLib$Y();
  	var isnan = requireLib$10();
  	var abs = requireLib$X();


  	// VARIABLES //

  	// (1<<52)
  	var SCALAR = 4503599627370496;


  	// MAIN //

  	/**
  	* Returns a normal number `y` and exponent `exp` satisfying \\(x = y \cdot 2^\mathrm{exp}\\) and assigns results to a provided output array.
  	*
  	* @param {number} x - input value
  	* @param {Collection} out - output array
  	* @param {integer} stride - output array stride
  	* @param {NonNegativeInteger} offset - output array index offset
  	* @returns {Collection} output array
  	*
  	* @example
  	* var pow = require( '@stdlib/math-base-special-pow' );
  	*
  	* var out = normalize( 3.14e-319, [ 0.0, 0 ], 1, 0 );
  	* // returns [ 1.4141234400356668e-303, -52 ]
  	*
  	* var y = out[ 0 ];
  	* var exp = out[ 1 ];
  	*
  	* var bool = ( y*pow(2.0,exp) === 3.14e-319 );
  	* // returns true
  	*
  	* @example
  	* var out = normalize( 0.0, [ 0.0, 0 ], 1, 0 );
  	* // returns [ 0.0, 0 ];
  	*
  	* @example
  	* var PINF = require( '@stdlib/constants-float64-pinf' );
  	*
  	* var out = normalize( PINF, [ 0.0, 0 ], 1, 0 );
  	* // returns [ Infinity, 0 ]
  	*
  	* @example
  	* var NINF = require( '@stdlib/constants-float64-ninf' );
  	*
  	* var out = normalize( NINF, [ 0.0, 0 ], 1, 0 );
  	* // returns [ -Infinity, 0 ]
  	*
  	* @example
  	* var out = normalize( NaN, [ 0.0, 0 ], 1, 0 );
  	* // returns [ NaN, 0 ]
  	*/
  	function normalize( x, out, stride, offset ) {
  		if ( isnan( x ) || isInfinite( x ) ) {
  			out[ offset ] = x;
  			out[ offset + stride ] = 0;
  			return out;
  		}
  		if ( x !== 0.0 && abs( x ) < FLOAT64_SMALLEST_NORMAL ) {
  			out[ offset ] = x * SCALAR;
  			out[ offset + stride ] = -52;
  			return out;
  		}
  		out[ offset ] = x;
  		out[ offset + stride ] = 0;
  		return out;
  	}


  	// EXPORTS //

  	assign = normalize;
  	return assign;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$a;
  var hasRequiredMain$a;

  function requireMain$a () {
  	if (hasRequiredMain$a) return main$a;
  	hasRequiredMain$a = 1;

  	// MODULES //

  	var fcn = requireAssign();


  	// MAIN //

  	/**
  	* Returns a normal number `y` and exponent `exp` satisfying \\(x = y \cdot 2^\mathrm{exp}\\).
  	*
  	* @param {number} x - input value
  	* @returns {NumberArray} output array
  	*
  	* @example
  	* var pow = require( '@stdlib/math-base-special-pow' );
  	*
  	* var out = normalize( 3.14e-319 );
  	* // returns [ 1.4141234400356668e-303, -52 ]
  	*
  	* var y = out[ 0 ];
  	* var exp = out[ 1 ];
  	*
  	* var bool = ( y*pow(2.0,exp) === 3.14e-319 );
  	* // returns true
  	*
  	* @example
  	* var out = normalize( 0.0 );
  	* // returns [ 0.0, 0 ]
  	*
  	* @example
  	* var PINF = require( '@stdlib/constants-float64-pinf' );
  	*
  	* var out = normalize( PINF );
  	* // returns [ Infinity, 0 ]
  	*
  	* @example
  	* var NINF = require( '@stdlib/constants-float64-ninf' );
  	*
  	* var out = normalize( NINF );
  	* // returns [ -Infinity, 0 ]
  	*
  	* @example
  	* var out = normalize( NaN );
  	* // returns [ NaN, 0 ]
  	*/
  	function normalize( x ) {
  		return fcn( x, [ 0.0, 0 ], 1, 0 );
  	}


  	// EXPORTS //

  	main$a = normalize;
  	return main$a;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$b;
  var hasRequiredLib$b;

  function requireLib$b () {
  	if (hasRequiredLib$b) return lib$b;
  	hasRequiredLib$b = 1;

  	/**
  	* Return a normal number `y` and exponent `exp` satisfying \\(x = y \cdot 2^\mathrm{exp}\\).
  	*
  	* @module @stdlib/number-float64-base-normalize
  	*
  	* @example
  	* var normalize = require( '@stdlib/number-float64-base-normalize' );
  	* var pow = require( '@stdlib/math-base-special-pow' );
  	*
  	* var out = normalize( 3.14e-319 );
  	* // returns [ 1.4141234400356668e-303, -52 ]
  	*
  	* var y = out[ 0 ];
  	* var exp = out[ 1 ];
  	*
  	* var bool = ( y*pow(2.0, exp) === 3.14e-319 );
  	* // returns true
  	*
  	* @example
  	* var Float64Array = require( '@stdlib/array-float64' );
  	* var normalize = require( '@stdlib/number-float64-base-normalize' );
  	*
  	* var out = new Float64Array( 2 );
  	*
  	* var v = normalize.assign( 3.14e-319, out, 1, 0 );
  	* // returns <Float64Array>[ 1.4141234400356668e-303, -52 ]
  	*
  	* var bool = ( v === out );
  	* // returns true
  	*/

  	// MODULES //

  	var setReadOnly = requireLib$f();
  	var main = requireMain$a();
  	var assign = requireAssign();


  	// MAIN //

  	setReadOnly( main, 'assign', assign );


  	// EXPORTS //

  	lib$b = main;
  	return lib$b;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$9;
  var hasRequiredMain$9;

  function requireMain$9 () {
  	if (hasRequiredMain$9) return main$9;
  	hasRequiredMain$9 = 1;

  	// MODULES //

  	var getHighWord = requireLib$B();
  	var EXP_MASK = requireLib$r();
  	var BIAS = requireLib$z();


  	// MAIN //

  	/**
  	* Returns an integer corresponding to the unbiased exponent of a double-precision floating-point number.
  	*
  	* @param {number} x - input value
  	* @returns {integer32} unbiased exponent
  	*
  	* @example
  	* var exp = exponent( 3.14e-307 ); // => 2**-1019 ~ 1e-307
  	* // returns -1019
  	*
  	* @example
  	* var exp = exponent( -3.14 );
  	* // returns 1
  	*
  	* @example
  	* var exp = exponent( 0.0 );
  	* // returns -1023
  	*
  	* @example
  	* var exp = exponent( NaN );
  	* // returns 1024
  	*/
  	function exponent( x ) {
  		// Extract from the input value a higher order word (unsigned 32-bit integer) which contains the exponent:
  		var high = getHighWord( x );

  		// Apply a mask to isolate only the exponent bits and then shift off all bits which are part of the fraction:
  		high = ( high & EXP_MASK ) >>> 20;

  		// Remove the bias and return:
  		return (high - BIAS)|0; // asm type annotation
  	}


  	// EXPORTS //

  	main$9 = exponent;
  	return main$9;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$a;
  var hasRequiredLib$a;

  function requireLib$a () {
  	if (hasRequiredLib$a) return lib$a;
  	hasRequiredLib$a = 1;

  	/**
  	* Return an integer corresponding to the unbiased exponent of a double-precision floating-point number.
  	*
  	* @module @stdlib/number-float64-base-exponent
  	*
  	* @example
  	* var exponent = require( '@stdlib/number-float64-base-exponent' );
  	*
  	* var exp = exponent( 3.14e-307 ); // => 2**-1019 ~ 1e-307
  	* // returns -1019
  	*
  	* exp = exponent( -3.14 );
  	* // returns 1
  	*
  	* exp = exponent( 0.0 );
  	* // returns -1023
  	*
  	* exp = exponent( NaN );
  	* // returns 1024
  	*/

  	// MODULES //

  	var main = requireMain$9();


  	// EXPORTS //

  	lib$a = main;
  	return lib$a;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$8;
  var hasRequiredMain$8;

  function requireMain$8 () {
  	if (hasRequiredMain$8) return main$8;
  	hasRequiredMain$8 = 1;

  	// NOTES //

  	/*
  	* => ldexp: load exponent (see [The Open Group]{@link http://pubs.opengroup.org/onlinepubs/9699919799/functions/ldexp.html} and [cppreference]{@link http://en.cppreference.com/w/c/numeric/math/ldexp}).
  	*/


  	// MODULES //

  	var PINF = requireLib$$();
  	var NINF = requireLib$Z();
  	var BIAS = requireLib$z();
  	var MAX_EXPONENT = requireLib$n();
  	var MAX_SUBNORMAL_EXPONENT = requireLib$m();
  	var MIN_SUBNORMAL_EXPONENT = requireLib$l();
  	var isnan = requireLib$10();
  	var isInfinite = requireLib$Y();
  	var copysign = requireLib$d();
  	var normalize = requireLib$b().assign;
  	var floatExp = requireLib$a();
  	var toWords = requireLib$e();
  	var fromWords = requireLib$o();


  	// VARIABLES //

  	// 1/(1<<52) = 1/(2**52) = 1/4503599627370496
  	var TWO52_INV = 2.220446049250313e-16;

  	// Exponent all 0s: 1 00000000000 11111111111111111111 => 2148532223
  	var CLEAR_EXP_MASK = 0x800fffff>>>0; // asm type annotation

  	// Normalization workspace:
  	var FRAC = [ 0.0, 0.0 ];

  	// High/low words workspace:
  	var WORDS = [ 0, 0 ];


  	// MAIN //

  	/**
  	* Multiplies a double-precision floating-point number by an integer power of two.
  	*
  	* @param {number} frac - fraction
  	* @param {integer} exp - exponent
  	* @returns {number} double-precision floating-point number
  	*
  	* @example
  	* var x = ldexp( 0.5, 3 ); // => 0.5 * 2^3 = 0.5 * 8
  	* // returns 4.0
  	*
  	* @example
  	* var x = ldexp( 4.0, -2 ); // => 4 * 2^(-2) = 4 * (1/4)
  	* // returns 1.0
  	*
  	* @example
  	* var x = ldexp( 0.0, 20 );
  	* // returns 0.0
  	*
  	* @example
  	* var x = ldexp( -0.0, 39 );
  	* // returns -0.0
  	*
  	* @example
  	* var x = ldexp( NaN, -101 );
  	* // returns NaN
  	*
  	* @example
  	* var x = ldexp( Infinity, 11 );
  	* // returns Infinity
  	*
  	* @example
  	* var x = ldexp( -Infinity, -118 );
  	* // returns -Infinity
  	*/
  	function ldexp( frac, exp ) {
  		var high;
  		var m;
  		if (
  			exp === 0 ||
  			frac === 0.0 || // handles +-0
  			isnan( frac ) ||
  			isInfinite( frac )
  		) {
  			return frac;
  		}
  		// Normalize the input fraction:
  		normalize( frac, FRAC, 1, 0 );
  		frac = FRAC[ 0 ];
  		exp += FRAC[ 1 ];

  		// Extract the exponent from `frac` and add it to `exp`:
  		exp += floatExp( frac );

  		// Check for underflow/overflow...
  		if ( exp < MIN_SUBNORMAL_EXPONENT ) {
  			return copysign( 0.0, frac );
  		}
  		if ( exp > MAX_EXPONENT ) {
  			if ( frac < 0.0 ) {
  				return NINF;
  			}
  			return PINF;
  		}
  		// Check for a subnormal and scale accordingly to retain precision...
  		if ( exp <= MAX_SUBNORMAL_EXPONENT ) {
  			exp += 52;
  			m = TWO52_INV;
  		} else {
  			m = 1.0;
  		}
  		// Split the fraction into higher and lower order words:
  		toWords.assign( frac, WORDS, 1, 0 );
  		high = WORDS[ 0 ];

  		// Clear the exponent bits within the higher order word:
  		high &= CLEAR_EXP_MASK;

  		// Set the exponent bits to the new exponent:
  		high |= ((exp+BIAS) << 20);

  		// Create a new floating-point number:
  		return m * fromWords( high, WORDS[ 1 ] );
  	}


  	// EXPORTS //

  	main$8 = ldexp;
  	return main$8;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$9;
  var hasRequiredLib$9;

  function requireLib$9 () {
  	if (hasRequiredLib$9) return lib$9;
  	hasRequiredLib$9 = 1;

  	/**
  	* Multiply a double-precision floating-point number by an integer power of two.
  	*
  	* @module @stdlib/math-base-special-ldexp
  	*
  	* @example
  	* var ldexp = require( '@stdlib/math-base-special-ldexp' );
  	*
  	* var x = ldexp( 0.5, 3 ); // => 0.5 * 2^3 = 0.5 * 8
  	* // returns 4.0
  	*
  	* x = ldexp( 4.0, -2 ); // => 4 * 2^(-2) = 4 * (1/4)
  	* // returns 1.0
  	*
  	* x = ldexp( 0.0, 20 );
  	* // returns 0.0
  	*
  	* x = ldexp( -0.0, 39 );
  	* // returns -0.0
  	*
  	* x = ldexp( NaN, -101 );
  	* // returns NaN
  	*
  	* x = ldexp( Infinity, 11 );
  	* // returns Infinity
  	*
  	* x = ldexp( -Infinity, -118 );
  	* // returns -Infinity
  	*/

  	// MODULES //

  	var main = requireMain$8();


  	// EXPORTS //

  	lib$9 = main;
  	return lib$9;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2021 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$7;
  var hasRequiredMain$7;

  function requireMain$7 () {
  	if (hasRequiredMain$7) return main$7;
  	hasRequiredMain$7 = 1;

  	// MAIN //

  	/**
  	* Returns a filled "generic" array.
  	*
  	* @param {*} value - fill value
  	* @param {NonNegativeInteger} len - array length
  	* @returns {Array} filled array
  	*
  	* @example
  	* var out = filled( 0.0, 3 );
  	* // returns [ 0.0, 0.0, 0.0 ]
  	*
  	* @example
  	* var out = filled( 'beep', 3 );
  	* // returns [ 'beep', 'beep', 'beep' ]
  	*/
  	function filled( value, len ) {
  		var arr;
  		var i;

  		// Manually push elements in order to ensure "fast" elements...
  		arr = [];
  		for ( i = 0; i < len; i++ ) {
  			arr.push( value );
  		}
  		return arr;
  	}


  	// EXPORTS //

  	main$7 = filled;
  	return main$7;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2021 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$8;
  var hasRequiredLib$8;

  function requireLib$8 () {
  	if (hasRequiredLib$8) return lib$8;
  	hasRequiredLib$8 = 1;

  	/**
  	* Create a filled "generic" array.
  	*
  	* @module @stdlib/array-base-filled
  	*
  	* @example
  	* var filled = require( '@stdlib/array-base-filled' );
  	*
  	* var out = filled( 0.0, 3 );
  	* // returns [ 0.0, 0.0, 0.0 ]
  	*
  	* @example
  	* var filled = require( '@stdlib/array-base-filled' );
  	*
  	* var out = filled( 'beep', 3 );
  	* // returns [ 'beep', 'beep', 'beep' ]
  	*/

  	// MODULES //

  	var main = requireMain$7();


  	// EXPORTS //

  	lib$8 = main;
  	return lib$8;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2021 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$6;
  var hasRequiredMain$6;

  function requireMain$6 () {
  	if (hasRequiredMain$6) return main$6;
  	hasRequiredMain$6 = 1;

  	// MODULES //

  	var filled = requireLib$8();


  	// MAIN //

  	/**
  	* Returns a zero-filled "generic" array.
  	*
  	* @param {NonNegativeInteger} len - array length
  	* @returns {Array} output array
  	*
  	* @example
  	* var out = zeros( 3 );
  	* // returns [ 0.0, 0.0, 0.0 ]
  	*/
  	function zeros( len ) {
  		return filled( 0.0, len );
  	}


  	// EXPORTS //

  	main$6 = zeros;
  	return main$6;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2021 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$7;
  var hasRequiredLib$7;

  function requireLib$7 () {
  	if (hasRequiredLib$7) return lib$7;
  	hasRequiredLib$7 = 1;

  	/**
  	* Create a zero-filled "generic" array.
  	*
  	* @module @stdlib/array-base-zeros
  	*
  	* @example
  	* var zeros = require( '@stdlib/array-base-zeros' );
  	*
  	* var out = zeros( 3 );
  	* // returns [ 0.0, 0.0, 0.0 ]
  	*/

  	// MODULES //

  	var main = requireMain$6();


  	// EXPORTS //

  	lib$7 = main;
  	return lib$7;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  *
  * ## Notice
  *
  * The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/k_rem_pio2.c}. The implementation follows the original, but has been modified for JavaScript.
  *
  * ```text
  * Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
  *
  * Developed at SunPro, a Sun Microsystems, Inc. business.
  * Permission to use, copy, modify, and distribute this
  * software is freely granted, provided that this notice
  * is preserved.
  * ```
  */

  var kernel_rempio2;
  var hasRequiredKernel_rempio2;

  function requireKernel_rempio2 () {
  	if (hasRequiredKernel_rempio2) return kernel_rempio2;
  	hasRequiredKernel_rempio2 = 1;

  	// MODULES //

  	var floor = requireLib$x();
  	var ldexp = requireLib$9();
  	var zeros = requireLib$7();


  	// VARIABLES //

  	/*
  	* Table of constants for `2/π` (`396` hex digits, `476` decimal).
  	*
  	* Integer array which contains the (`24*i`)-th to (`24*i+23`)-th bit of `2/π` after binary point. The corresponding floating value is
  	*
  	* ```tex
  	* \operatorname{ipio2}[i] \cdot 2^{-24(i+1)}
  	* ```
  	*
  	* This table must have at least `(e0-3)/24 + jk` terms. For quad precision (`e0 <= 16360`, `jk = 6`), this is `686`.
  	*/
  	var IPIO2 = [
  		0xA2F983, 0x6E4E44, 0x1529FC, 0x2757D1, 0xF534DD, 0xC0DB62,
  		0x95993C, 0x439041, 0xFE5163, 0xABDEBB, 0xC561B7, 0x246E3A,
  		0x424DD2, 0xE00649, 0x2EEA09, 0xD1921C, 0xFE1DEB, 0x1CB129,
  		0xA73EE8, 0x8235F5, 0x2EBB44, 0x84E99C, 0x7026B4, 0x5F7E41,
  		0x3991D6, 0x398353, 0x39F49C, 0x845F8B, 0xBDF928, 0x3B1FF8,
  		0x97FFDE, 0x05980F, 0xEF2F11, 0x8B5A0A, 0x6D1F6D, 0x367ECF,
  		0x27CB09, 0xB74F46, 0x3F669E, 0x5FEA2D, 0x7527BA, 0xC7EBE5,
  		0xF17B3D, 0x0739F7, 0x8A5292, 0xEA6BFB, 0x5FB11F, 0x8D5D08,
  		0x560330, 0x46FC7B, 0x6BABF0, 0xCFBC20, 0x9AF436, 0x1DA9E3,
  		0x91615E, 0xE61B08, 0x659985, 0x5F14A0, 0x68408D, 0xFFD880,
  		0x4D7327, 0x310606, 0x1556CA, 0x73A8C9, 0x60E27B, 0xC08C6B
  	];

  	// Double precision array, obtained by cutting `π/2` into `24` bits chunks...
  	var PIO2 = [
  		1.57079625129699707031e+00, // 0x3FF921FB, 0x40000000
  		7.54978941586159635335e-08, // 0x3E74442D, 0x00000000
  		5.39030252995776476554e-15, // 0x3CF84698, 0x80000000
  		3.28200341580791294123e-22, // 0x3B78CC51, 0x60000000
  		1.27065575308067607349e-29, // 0x39F01B83, 0x80000000
  		1.22933308981111328932e-36, // 0x387A2520, 0x40000000
  		2.73370053816464559624e-44, // 0x36E38222, 0x80000000
  		2.16741683877804819444e-51  // 0x3569F31D, 0x00000000
  	];
  	var TWO24 = 1.67772160000000000000e+07;  // 0x41700000, 0x00000000
  	var TWON24 = 5.96046447753906250000e-08; // 0x3E700000, 0x00000000

  	// Arrays for storing temporary values (note that, in C, this is not thread safe):
  	var F = zeros( 20 );
  	var Q = zeros( 20 );
  	var FQ = zeros( 20 );
  	var IQ = zeros( 20 );


  	// FUNCTIONS //

  	/**
  	* Performs the computation for `kernelRempio2()`.
  	*
  	* @private
  	* @param {PositiveNumber} x - input value
  	* @param {(Array|TypedArray|Object)} y - output object for storing double precision numbers
  	* @param {integer} jz - number of terms of `ipio2[]` used
  	* @param {Array<integer>} q - array with integral values, representing the 24-bits chunk of the product of `x` and `2/π`
  	* @param {integer} q0 - the corresponding exponent of `q[0]` (the exponent for `q[i]` would be `q0-24*i`)
  	* @param {integer} jk - `jk+1` is the initial number of terms of `IPIO2[]` needed in the computation
  	* @param {integer} jv - index for pointing to the suitable `ipio2[]` for the computation
  	* @param {integer} jx - `nx - 1`
  	* @param {Array<number>} f - `IPIO2[]` in floating point
  	* @returns {number} last three binary digits of `N`
  	*/
  	function compute( x, y, jz, q, q0, jk, jv, jx, f ) {
  		var carry;
  		var fw;
  		var ih;
  		var jp;
  		var i;
  		var k;
  		var n;
  		var j;
  		var z;

  		// `jp+1` is the number of terms in `PIO2[]` needed:
  		jp = jk;

  		// Distill `q[]` into `IQ[]` in reverse order...
  		z = q[ jz ];
  		j = jz;
  		for ( i = 0; j > 0; i++ ) {
  			fw = ( TWON24 * z )|0;
  			IQ[ i ] = ( z - (TWO24*fw) )|0;
  			z = q[ j-1 ] + fw;
  			j -= 1;
  		}
  		// Compute `n`...
  		z = ldexp( z, q0 );
  		z -= 8.0 * floor( z*0.125 ); // Trim off integer >= 8
  		n = z|0;
  		z -= n;
  		ih = 0;
  		if ( q0 > 0 ) {
  			// Need `IQ[jz-1]` to determine `n`...
  			i = ( IQ[ jz-1 ] >> (24-q0) );
  			n += i;
  			IQ[ jz-1 ] -= ( i << (24-q0) );
  			ih = ( IQ[ jz-1 ] >> (23-q0) );
  		}
  		else if ( q0 === 0 ) {
  			ih = ( IQ[ jz-1 ] >> 23 );
  		}
  		else if ( z >= 0.5 ) {
  			ih = 2;
  		}
  		// Case: q > 0.5
  		if ( ih > 0 ) {
  			n += 1;
  			carry = 0;

  			// Compute `1-q`:
  			for ( i = 0; i < jz; i++ ) {
  				j = IQ[ i ];
  				if ( carry === 0 ) {
  					if ( j !== 0 ) {
  						carry = 1;
  						IQ[ i ] = 0x1000000 - j;
  					}
  				} else {
  					IQ[ i ] = 0xffffff - j;
  				}
  			}
  			if ( q0 > 0 ) {
  				// Rare case: chance is 1 in 12...
  				switch ( q0 ) { // eslint-disable-line default-case
  				case 1:
  					IQ[ jz-1 ] &= 0x7fffff;
  					break;
  				case 2:
  					IQ[ jz-1 ] &= 0x3fffff;
  					break;
  				}
  			}
  			if ( ih === 2 ) {
  				z = 1.0 - z;
  				if ( carry !== 0 ) {
  					z -= ldexp( 1.0, q0 );
  				}
  			}
  		}
  		// Check if re-computation is needed...
  		if ( z === 0.0 ) {
  			j = 0;
  			for ( i = jz-1; i >= jk; i-- ) {
  				j |= IQ[ i ];
  			}
  			if ( j === 0 ) {
  				// Need re-computation...
  				for ( k = 1; IQ[ jk-k ] === 0; k++ ) {
  					// `k` is the number of terms needed...
  				}
  				for ( i = jz+1; i <= jz+k; i++ ) {
  					// Add `q[jz+1]` to `q[jz+k]`...
  					f[ jx+i ] = IPIO2[ jv+i ];
  					fw = 0.0;
  					for ( j = 0; j <= jx; j++ ) {
  						fw += x[ j ] * f[ jx + (i-j) ];
  					}
  					q[ i ] = fw;
  				}
  				jz += k;
  				return compute( x, y, jz, q, q0, jk, jv, jx, f );
  			}
  		}
  		// Chop off zero terms...
  		if ( z === 0.0 ) {
  			jz -= 1;
  			q0 -= 24;
  			while ( IQ[ jz ] === 0 ) {
  				jz -= 1;
  				q0 -= 24;
  			}
  		} else {
  			// Break `z` into 24-bit if necessary...
  			z = ldexp( z, -q0 );
  			if ( z >= TWO24 ) {
  				fw = (TWON24*z)|0;
  				IQ[ jz ] = ( z - (TWO24*fw) )|0;
  				jz += 1;
  				q0 += 24;
  				IQ[ jz ] = fw;
  			} else {
  				IQ[ jz ] = z|0;
  			}
  		}
  		// Convert integer "bit" chunk to floating-point value...
  		fw = ldexp( 1.0, q0 );
  		for ( i = jz; i >= 0; i-- ) {
  			q[ i ] = fw * IQ[i];
  			fw *= TWON24;
  		}
  		// Compute `PIO2[0,...,jp]*q[jz,...,0]`...
  		for ( i = jz; i >= 0; i-- ) {
  			fw = 0.0;
  			for ( k = 0; k <= jp && k <= jz-i; k++ ) {
  				fw += PIO2[ k ] * q[ i+k ];
  			}
  			FQ[ jz-i ] = fw;
  		}
  		// Compress `FQ[]` into `y[]`...
  		fw = 0.0;
  		for ( i = jz; i >= 0; i-- ) {
  			fw += FQ[ i ];
  		}
  		if ( ih === 0 ) {
  			y[ 0 ] = fw;
  		} else {
  			y[ 0 ] = -fw;
  		}
  		fw = FQ[ 0 ] - fw;
  		for ( i = 1; i <= jz; i++ ) {
  			fw += FQ[i];
  		}
  		if ( ih === 0 ) {
  			y[ 1 ] = fw;
  		} else {
  			y[ 1 ] = -fw;
  		}
  		return ( n & 7 );
  	}


  	// MAIN //

  	/**
  	* Returns the last three binary digits of `N` with `y = x - Nπ/2` so that `|y| < π/2`.
  	*
  	* ## Method
  	*
  	* -   The method is to compute the integer (`mod 8`) and fraction parts of `2x/π` without doing the full multiplication. In general, we skip the part of the product that is known to be a huge integer (more accurately, equals `0 mod 8` ). Thus, the number of operations is independent of the exponent of the input.
  	*
  	* @private
  	* @param {PositiveNumber} x - input value
  	* @param {(Array|TypedArray|Object)} y - remainder elements
  	* @param {PositiveInteger} e0 - the exponent of `x[0]` (must be <= 16360)
  	* @param {PositiveInteger} nx - dimension of `x[]`
  	* @returns {number} last three binary digits of `N`
  	*/
  	function kernelRempio2( x, y, e0, nx ) {
  		var fw;
  		var jk;
  		var jv;
  		var jx;
  		var jz;
  		var q0;
  		var i;
  		var j;
  		var m;

  		// Initialize `jk` for double-precision floating-point numbers:
  		jk = 4;

  		// Determine `jx`, `jv`, `q0` (note that `q0 < 3`):
  		jx = nx - 1;
  		jv = ( (e0 - 3) / 24 )|0;
  		if ( jv < 0 ) {
  			jv = 0;
  		}
  		q0 = e0 - (24 * (jv + 1));

  		// Set up `F[0]` to `F[jx+jk]` where `F[jx+jk] = IPIO2[jv+jk]`:
  		j = jv - jx;
  		m = jx + jk;
  		for ( i = 0; i <= m; i++ ) {
  			if ( j < 0 ) {
  				F[ i ] = 0.0;
  			} else {
  				F[ i ] = IPIO2[ j ];
  			}
  			j += 1;
  		}
  		// Compute `Q[0],Q[1],...,Q[jk]`:
  		for ( i = 0; i <= jk; i++ ) {
  			fw = 0.0;
  			for ( j = 0; j <= jx; j++ ) {
  				fw += x[ j ] * F[ jx + (i-j) ];
  			}
  			Q[ i ] = fw;
  		}
  		jz = jk;
  		return compute( x, y, jz, Q, q0, jk, jv, jx, F );
  	}


  	// EXPORTS //

  	kernel_rempio2 = kernelRempio2;
  	return kernel_rempio2;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$5;
  var hasRequiredMain$5;

  function requireMain$5 () {
  	if (hasRequiredMain$5) return main$5;
  	hasRequiredMain$5 = 1;

  	// TODO: implementation

  	/**
  	* Rounds a numeric value to the nearest integer.
  	*
  	* @param {number} x - input value
  	* @returns {number} function value
  	*
  	* @example
  	* var v = round( -4.2 );
  	* // returns -4.0
  	*
  	* @example
  	* var v = round( -4.5 );
  	* // returns -4.0
  	*
  	* @example
  	* var v = round( -4.6 );
  	* // returns -5.0
  	*
  	* @example
  	* var v = round( 9.99999 );
  	* // returns 10.0
  	*
  	* @example
  	* var v = round( 9.5 );
  	* // returns 10.0
  	*
  	* @example
  	* var v = round( 9.2 );
  	* // returns 9.0
  	*
  	* @example
  	* var v = round( 0.0 );
  	* // returns 0.0
  	*
  	* @example
  	* var v = round( -0.0 );
  	* // returns -0.0
  	*
  	* @example
  	* var v = round( Infinity );
  	* // returns Infinity
  	*
  	* @example
  	* var v = round( -Infinity );
  	* // returns -Infinity
  	*
  	* @example
  	* var v = round( NaN );
  	* // returns NaN
  	*/
  	var round = Math.round; // eslint-disable-line stdlib/no-builtin-math


  	// EXPORTS //

  	main$5 = round;
  	return main$5;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$6;
  var hasRequiredLib$6;

  function requireLib$6 () {
  	if (hasRequiredLib$6) return lib$6;
  	hasRequiredLib$6 = 1;

  	// TODO: implementation

  	/**
  	* Round a numeric value to the nearest integer.
  	*
  	* @module @stdlib/math-base-special-round
  	*
  	* @example
  	* var round = require( '@stdlib/math-base-special-round' );
  	*
  	* var v = round( -4.2 );
  	* // returns -4.0
  	*
  	* v = round( -4.5 );
  	* // returns -4.0
  	*
  	* v = round( -4.6 );
  	* // returns -5.0
  	*
  	* v = round( 9.99999 );
  	* // returns 10.0
  	*
  	* v = round( 9.5 );
  	* // returns 10.0
  	*
  	* v = round( 9.2 );
  	* // returns 9.0
  	*
  	* v = round( 0.0 );
  	* // returns 0.0
  	*
  	* v = round( -0.0 );
  	* // returns -0.0
  	*
  	* v = round( Infinity );
  	* // returns Infinity
  	*
  	* v = round( -Infinity );
  	* // returns -Infinity
  	*
  	* v = round( NaN );
  	* // returns NaN
  	*/

  	// MODULES //

  	var main = requireMain$5();


  	// EXPORTS //

  	lib$6 = main;
  	return lib$6;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  *
  * ## Notice
  *
  * The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/k_rem_pio2.c}. The implementation follows the original, but has been modified for JavaScript.
  *
  * ```text
  * Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
  *
  * Developed at SunPro, a Sun Microsystems, Inc. business.
  * Permission to use, copy, modify, and distribute this
  * software is freely granted, provided that this notice
  * is preserved.
  * ```
  */

  var rempio2_medium;
  var hasRequiredRempio2_medium;

  function requireRempio2_medium () {
  	if (hasRequiredRempio2_medium) return rempio2_medium;
  	hasRequiredRempio2_medium = 1;

  	// MODULES //

  	var round = requireLib$6();
  	var getHighWord = requireLib$B();


  	// VARIABLES //

  	// 53 bits of 2/π:
  	var INVPIO2 = 6.36619772367581382433e-01; // 0x3FE45F30, 0x6DC9C883

  	// First 33 bits of π/2:
  	var PIO2_1 = 1.57079632673412561417e+00;  // 0x3FF921FB, 0x54400000

  	// PIO2_1T = π/2 - PIO2_1:
  	var PIO2_1T = 6.07710050650619224932e-11; // 0x3DD0B461, 0x1A626331

  	// Another 33 bits of π/2:
  	var PIO2_2 = 6.07710050630396597660e-11;  // 0x3DD0B461, 0x1A600000

  	// PIO2_2T = π/2 - ( PIO2_1 + PIO2_2 ):
  	var PIO2_2T = 2.02226624879595063154e-21; // 0x3BA3198A, 0x2E037073

  	// Another 33 bits of π/2:
  	var PIO2_3 = 2.02226624871116645580e-21;  // 0x3BA3198A, 0x2E000000

  	// PIO2_3T = π/2 - ( PIO2_1 + PIO2_2 + PIO2_3 ):
  	var PIO2_3T = 8.47842766036889956997e-32; // 0x397B839A, 0x252049C1

  	// Exponent mask (2047 => 0x7ff):
  	var EXPONENT_MASK = 0x7ff|0; // asm type annotation


  	// MAIN //

  	/**
  	* Computes `x - nπ/2 = r` for medium-sized inputs.
  	*
  	* @private
  	* @param {number} x - input value
  	* @param {uint32} ix - high word of `x`
  	* @param {(Array|TypedArray|Object)} y - remainder elements
  	* @returns {integer} factor of `π/2`
  	*/
  	function rempio2Medium( x, ix, y ) {
  		var high;
  		var n;
  		var t;
  		var r;
  		var w;
  		var i;
  		var j;

  		n = round( x * INVPIO2 );
  		r = x - ( n * PIO2_1 );
  		w = n * PIO2_1T;

  		// First rounding (good to 85 bits)...
  		j = (ix >> 20)|0; // asm type annotation
  		y[ 0 ] = r - w;
  		high = getHighWord( y[0] );
  		i = j - ( (high >> 20) & EXPONENT_MASK );

  		// Check if a second iteration is needed (good to 118 bits)...
  		if ( i > 16 ) {
  			t = r;
  			w = n * PIO2_2;
  			r = t - w;
  			w = (n * PIO2_2T) - ((t-r) - w);
  			y[ 0 ] = r - w;
  			high = getHighWord( y[0] );
  			i = j - ( (high >> 20) & EXPONENT_MASK );

  			// Check if a third iteration is needed (151 bits accumulated)...
  			if ( i > 49 ) {
  				t = r;
  				w = n * PIO2_3;
  				r = t - w;
  				w = (n * PIO2_3T) - ((t-r) - w);
  				y[ 0 ] = r - w;
  			}
  		}
  		y[ 1 ] = (r - y[0]) - w;
  		return n;
  	}


  	// EXPORTS //

  	rempio2_medium = rempio2Medium;
  	return rempio2_medium;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  *
  * ## Notice
  *
  * The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_rem_pio2.c}. The implementation follows the original, but has been modified for JavaScript.
  *
  * ```text
  * Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
  *
  * Developed at SunPro, a Sun Microsystems, Inc. business.
  * Permission to use, copy, modify, and distribute this
  * software is freely granted, provided that this notice
  * is preserved.
  *
  * Optimized by Bruce D. Evans.
  * ```
  */

  var main$4;
  var hasRequiredMain$4;

  function requireMain$4 () {
  	if (hasRequiredMain$4) return main$4;
  	hasRequiredMain$4 = 1;

  	// MODULES //

  	var ABS_MASK = requireLib$s();
  	var EXPONENT_MASK = requireLib$r();
  	var SIGNIFICAND_MASK = requireLib$q();
  	var getHighWord = requireLib$B();
  	var getLowWord = requireLib$p();
  	var fromWords = requireLib$o();
  	var rempio2Kernel = requireKernel_rempio2();
  	var rempio2Medium = requireRempio2_medium();


  	// VARIABLES //

  	var ZERO = 0.00000000000000000000e+00;    // 0x00000000, 0x00000000
  	var TWO24 = 1.67772160000000000000e+07;   // 0x41700000, 0x00000000

  	// 33 bits of π/2:
  	var PIO2_1 = 1.57079632673412561417e+00;  // 0x3FF921FB, 0x54400000

  	// PIO2_1T = π/2 - PIO2_1:
  	var PIO2_1T = 6.07710050650619224932e-11; // 0x3DD0B461, 0x1A626331
  	var TWO_PIO2_1T = 2.0 * PIO2_1T;
  	var THREE_PIO2_1T = 3.0 * PIO2_1T;
  	var FOUR_PIO2_1T = 4.0 * PIO2_1T;

  	// High word significand for π and π/2: 0x921fb = 598523 => 00000000000010010010000111111011
  	var PI_HIGH_WORD_SIGNIFICAND = 0x921fb|0; // asm type annotation

  	// High word for π/4: 0x3fe921fb = 1072243195 => 00111111111010010010000111111011
  	var PIO4_HIGH_WORD = 0x3fe921fb|0; // asm type annotation

  	// High word for 3π/4: 0x4002d97c = 1073928572 => 01000000000000101101100101111100
  	var THREE_PIO4_HIGH_WORD = 0x4002d97c|0; // asm type annotation

  	// High word for 5π/4: 0x400f6a7a = 1074752122 => 01000000000011110110101001111010
  	var FIVE_PIO4_HIGH_WORD = 0x400f6a7a|0; // asm type annotation

  	// High word for 6π/4: 0x4012d97c = 1074977148 => 01000000000100101101100101111100
  	var THREE_PIO2_HIGH_WORD = 0x4012d97c|0; // asm type annotation

  	// High word for 7π/4: 0x4015fdbc = 1075183036 => 01000000000101011111110110111100
  	var SEVEN_PIO4_HIGH_WORD = 0x4015fdbc|0; // asm type annotation

  	// High word for 8π/4: 0x401921fb = 1075388923 => 01000000000110010010000111111011
  	var TWO_PI_HIGH_WORD = 0x401921fb|0; // asm type annotation

  	// High word for 9π/4: 0x401c463b = 1075594811 => 01000000000111000100011000111011
  	var NINE_PIO4_HIGH_WORD = 0x401c463b|0; // asm type annotation

  	// 2^20*π/2 = 1647099.3291652855 => 0100000100111001001000011111101101010100010001000010110100011000 => high word => 0x413921fb = 1094263291 => 01000001001110010010000111111011
  	var MEDIUM = 0x413921fb|0; // asm type annotation

  	// Arrays for storing temporary values:
  	var TX = [ 0.0, 0.0, 0.0 ];
  	var TY = [ 0.0, 0.0 ];


  	// MAIN //

  	/**
  	* Computes `x - nπ/2 = r`.
  	*
  	* ## Notes
  	*
  	* -   Returns `n` and stores the remainder `r` as two numbers `y[0]` and `y[1]`, such that `y[0]+y[1] = r`.
  	*
  	* @param {number} x - input value
  	* @param {(Array|TypedArray|Object)} y - remainder elements
  	* @returns {integer} factor of `π/2`
  	*
  	* @example
  	* var y = [ 0.0, 0.0 ];
  	* var n = rempio2( 128.0, y );
  	* // returns 81
  	*
  	* var y1 = y[ 0 ];
  	* // returns ~0.765
  	*
  	* var y2 = y[ 1 ];
  	* // returns ~3.618e-17
  	*
  	* @example
  	* var y = [ 0.0, 0.0 ];
  	* var n = rempio2( NaN, y );
  	* // returns 0
  	*
  	* var y1 = y[ 0 ];
  	* // returns NaN
  	*
  	* var y2 = y[ 1 ];
  	* // returns NaN
  	*/
  	function rempio2( x, y ) {
  		var low;
  		var e0;
  		var hx;
  		var ix;
  		var nx;
  		var i;
  		var n;
  		var z;

  		hx = getHighWord( x );
  		ix = (hx & ABS_MASK)|0; // asm type annotation

  		// Case: |x| ~<= π/4 (no need for reduction)
  		if ( ix <= PIO4_HIGH_WORD ) {
  			y[ 0 ] = x;
  			y[ 1 ] = 0.0;
  			return 0;
  		}
  		// Case: |x| ~<= 5π/4
  		if ( ix <= FIVE_PIO4_HIGH_WORD ) {
  			// Case: |x| ~= π/2 or π
  			if ( (ix & SIGNIFICAND_MASK) === PI_HIGH_WORD_SIGNIFICAND ) {
  				// Cancellation => use medium case
  				return rempio2Medium( x, ix, y );
  			}
  			// Case: |x| ~<= 3π/4
  			if ( ix <= THREE_PIO4_HIGH_WORD ) {
  				if ( x > 0.0 ) {
  					z = x - PIO2_1;
  					y[ 0 ] = z - PIO2_1T;
  					y[ 1 ] = (z - y[0]) - PIO2_1T;
  					return 1;
  				}
  				z = x + PIO2_1;
  				y[ 0 ] = z + PIO2_1T;
  				y[ 1 ] = (z - y[0]) + PIO2_1T;
  				return -1;
  			}
  			if ( x > 0.0 ) {
  				z = x - ( 2.0*PIO2_1 );
  				y[ 0 ] = z - TWO_PIO2_1T;
  				y[ 1 ] = (z - y[0]) - TWO_PIO2_1T;
  				return 2;
  			}
  			z = x + ( 2.0*PIO2_1 );
  			y[ 0 ] = z + TWO_PIO2_1T;
  			y[ 1 ] = (z - y[0]) + TWO_PIO2_1T;
  			return -2;
  		}
  		// Case: |x| ~<= 9π/4
  		if ( ix <= NINE_PIO4_HIGH_WORD ) {
  			// Case: |x| ~<= 7π/4
  			if ( ix <= SEVEN_PIO4_HIGH_WORD ) {
  				// Case: |x| ~= 3π/2
  				if ( ix === THREE_PIO2_HIGH_WORD ) {
  					return rempio2Medium( x, ix, y );
  				}
  				if ( x > 0.0 ) {
  					z = x - ( 3.0*PIO2_1 );
  					y[ 0 ] = z - THREE_PIO2_1T;
  					y[ 1 ] = (z - y[0]) - THREE_PIO2_1T;
  					return 3;
  				}
  				z = x + ( 3.0*PIO2_1 );
  				y[ 0 ] = z + THREE_PIO2_1T;
  				y[ 1 ] = (z - y[0]) + THREE_PIO2_1T;
  				return -3;
  			}
  			// Case: |x| ~= 4π/2
  			if ( ix === TWO_PI_HIGH_WORD ) {
  				return rempio2Medium( x, ix, y );
  			}
  			if ( x > 0.0 ) {
  				z = x - ( 4.0*PIO2_1 );
  				y[ 0 ] = z - FOUR_PIO2_1T;
  				y[ 1 ] = (z - y[0]) - FOUR_PIO2_1T;
  				return 4;
  			}
  			z = x + ( 4.0*PIO2_1 );
  			y[ 0 ] = z + FOUR_PIO2_1T;
  			y[ 1 ] = (z - y[0]) + FOUR_PIO2_1T;
  			return -4;
  		}
  		// Case: |x| ~< 2^20*π/2 (medium size)
  		if ( ix < MEDIUM ) {
  			return rempio2Medium( x, ix, y );
  		}
  		// Case: x is NaN or infinity
  		if ( ix >= EXPONENT_MASK ) {
  			y[ 0 ] = NaN;
  			y[ 1 ] = NaN;
  			return 0.0;
  		}
  		// Set z = scalbn(|x|, ilogb(x)-23)...
  		low = getLowWord( x );
  		e0 = (ix >> 20) - 1046; // `e0 = ilogb(z) - 23` => unbiased exponent minus 23
  		z = fromWords( ix - ((e0 << 20)|0), low );
  		for ( i = 0; i < 2; i++ ) {
  			TX[ i ] = z|0;
  			z = (z - TX[i]) * TWO24;
  		}
  		TX[ 2 ] = z;
  		nx = 3;
  		while ( TX[ nx-1 ] === ZERO ) {
  			// Skip zero term...
  			nx -= 1;
  		}
  		n = rempio2Kernel( TX, TY, e0, nx, 1 );
  		if ( x < 0.0 ) {
  			y[ 0 ] = -TY[ 0 ];
  			y[ 1 ] = -TY[ 1 ];
  			return -n;
  		}
  		y[ 0 ] = TY[ 0 ];
  		y[ 1 ] = TY[ 1 ];
  		return n;
  	}


  	// EXPORTS //

  	main$4 = rempio2;
  	return main$4;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$5;
  var hasRequiredLib$5;

  function requireLib$5 () {
  	if (hasRequiredLib$5) return lib$5;
  	hasRequiredLib$5 = 1;

  	/**
  	* Compute `x - nπ/2 = r`.
  	*
  	* @module @stdlib/math-base-special-rempio2
  	*
  	* @example
  	* var rempio2 = require( '@stdlib/math-base-special-rempio2' );
  	*
  	* var y = [ 0.0, 0.0 ];
  	* var n = rempio2( 128.0, y );
  	* // returns 81
  	*
  	* var y1 = y[ 0 ];
  	* // returns ~0.765
  	*
  	* var y2 = y[ 1 ];
  	* // returns ~3.618e-17
  	*/

  	// MODULES //

  	var rempio2 = requireMain$4();


  	// EXPORTS //

  	lib$5 = rempio2;
  	return lib$5;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  *
  * ## Notice
  *
  * The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_cos.c}. The implementation follows the original, but has been modified for JavaScript.
  *
  * ```text
  * Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
  *
  * Developed at SunPro, a Sun Microsystems, Inc. business.
  * Permission to use, copy, modify, and distribute this
  * software is freely granted, provided that this notice
  * is preserved.
  * ```
  */

  var main$3;
  var hasRequiredMain$3;

  function requireMain$3 () {
  	if (hasRequiredMain$3) return main$3;
  	hasRequiredMain$3 = 1;

  	// MODULES //

  	var getHighWord = requireLib$B();
  	var kernelCos = requireLib$u();
  	var kernelSin = requireLib$t();
  	var rempio2 = requireLib$5();


  	// VARIABLES //

  	// Scratch array for storing temporary values:
  	var buffer = [ 0.0, 0.0 ]; // WARNING: not thread safe

  	// High word absolute value mask: 0x7fffffff => 01111111111111111111111111111111
  	var HIGH_WORD_ABS_MASK = 0x7fffffff|0; // asm type annotation

  	// High word of π/4: 0x3fe921fb => 00111111111010010010000111111011
  	var HIGH_WORD_PIO4 = 0x3fe921fb|0; // asm type annotation

  	// High word of 2^-27: 0x3e400000 => 00111110010000000000000000000000
  	var HIGH_WORD_TWO_NEG_27 = 0x3e400000|0; // asm type annotation

  	// High word exponent mask: 0x7ff00000 => 01111111111100000000000000000000
  	var HIGH_WORD_EXPONENT_MASK = 0x7ff00000|0; // asm type annotation


  	// MAIN //

  	/**
  	* Computes the cosine of a number.
  	*
  	* @param {number} x - input value (in radians)
  	* @returns {number} cosine
  	*
  	* @example
  	* var v = cos( 0.0 );
  	* // returns 1.0
  	*
  	* @example
  	* var v = cos( 3.141592653589793/4.0 );
  	* // returns ~0.707
  	*
  	* @example
  	* var v = cos( -3.141592653589793/6.0 );
  	* // returns ~0.866
  	*
  	* @example
  	* var v = cos( NaN );
  	* // returns NaN
  	*/
  	function cos( x ) {
  		var ix;
  		var n;

  		ix = getHighWord( x );
  		ix &= HIGH_WORD_ABS_MASK;

  		// Case: |x| ~< pi/4
  		if ( ix <= HIGH_WORD_PIO4 ) {
  			// Case: x < 2**-27
  			if ( ix < HIGH_WORD_TWO_NEG_27 ) {
  				return 1.0;
  			}
  			return kernelCos( x, 0.0 );
  		}
  		// Case: cos(Inf or NaN) is NaN */
  		if ( ix >= HIGH_WORD_EXPONENT_MASK ) {
  			return NaN;
  		}
  		// Case: Argument reduction needed...
  		n = rempio2( x, buffer );
  		switch ( n & 3 ) {
  		case 0:
  			return kernelCos( buffer[ 0 ], buffer[ 1 ] );
  		case 1:
  			return -kernelSin( buffer[ 0 ], buffer[ 1 ] );
  		case 2:
  			return -kernelCos( buffer[ 0 ], buffer[ 1 ] );
  		default:
  			return kernelSin( buffer[ 0 ], buffer[ 1 ] );
  		}
  	}


  	// EXPORTS //

  	main$3 = cos;
  	return main$3;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$4;
  var hasRequiredLib$4;

  function requireLib$4 () {
  	if (hasRequiredLib$4) return lib$4;
  	hasRequiredLib$4 = 1;

  	/**
  	* Compute the cosine of a number.
  	*
  	* @module @stdlib/math-base-special-cos
  	*
  	* @example
  	* var cos = require( '@stdlib/math-base-special-cos' );
  	*
  	* var v = cos( 0.0 );
  	* // returns 1.0
  	*
  	* v = cos( 3.141592653589793/4.0 );
  	* // returns ~0.707
  	*
  	* v = cos( -3.141592653589793/6.0 );
  	* // returns ~0.866
  	*/

  	// MODULES //

  	var main = requireMain$3();


  	// EXPORTS //

  	lib$4 = main;
  	return lib$4;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  *
  * ## Notice
  *
  * The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_sin.c}. The implementation follows the original, but has been modified for JavaScript.
  *
  * ```text
  * Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
  *
  * Developed at SunPro, a Sun Microsystems, Inc. business.
  * Permission to use, copy, modify, and distribute this
  * software is freely granted, provided that this notice
  * is preserved.
  * ```
  */

  var main$2;
  var hasRequiredMain$2;

  function requireMain$2 () {
  	if (hasRequiredMain$2) return main$2;
  	hasRequiredMain$2 = 1;

  	// MODULES //

  	var ABS_MASK = requireLib$s();
  	var EXPONENT_MASK = requireLib$r();
  	var getHighWord = requireLib$B();
  	var kernelCos = requireLib$u();
  	var kernelSin = requireLib$t();
  	var rempio2 = requireLib$5();


  	// VARIABLES //

  	// High word for PI/4: 0x3fe921fb = 1072243195 => 00111111111010010010000111111011
  	var PIO4_HIGH_WORD = 0x3fe921fb|0; // asm type annotation

  	// 2^-26 = 1.4901161193847656e-8 => 0011111001010000000000000000000000000000000000000000000000000000 => high word => 00111110010100000000000000000000 => 0x3e500000 = 1045430272
  	var SMALL_HIGH_WORD = 0x3e500000|0; // asm type annotation

  	// Array for storing remainder elements:
  	var Y = [ 0.0, 0.0 ];


  	// MAIN //

  	/**
  	* Computes the sine of a number.
  	*
  	* ## Method
  	*
  	* -   Let \\(S\\), \\(C\\), and \\(T\\) denote the \\(\sin\\), \\(\cos\\), and \\(\tan\\), respectively, on \\(\[-\pi/4, +\pi/4\]\\).
  	*
  	* -   Reduce the argument \\(x\\) to \\(y1+y2 = x-k\pi/2\\) in \\(\[-\pi/4, +\pi/4\]\\), and let \\(n = k \mod 4\\).
  	*
  	* -   We have
  	*
  	*     | n | sin(x) | cos(x) | tan(x) |
  	*     | - | ------ | ------ | ------ |
  	*     | 0 |   S    |   C    |    T   |
  	*     | 1 |   C    |  -S    |  -1/T  |
  	*     | 2 |  -S    |  -C    |    T   |
  	*     | 3 |  -C    |   S    |  -1/T  |
  	*
  	* @param {number} x - input value (in radians)
  	* @returns {number} sine
  	*
  	* @example
  	* var v = sin( 0.0 );
  	* // returns ~0.0
  	*
  	* @example
  	* var v = sin( 3.141592653589793/2.0 );
  	* // returns ~1.0
  	*
  	* @example
  	* var v = sin( -3.141592653589793/6.0 );
  	* // returns ~-0.5
  	*
  	* @example
  	* var v = sin( NaN );
  	* // returns NaN
  	*/
  	function sin( x ) {
  		var ix;
  		var n;

  		ix = getHighWord( x );
  		ix &= ABS_MASK;

  		// Case: |x| ~< π/4
  		if ( ix <= PIO4_HIGH_WORD ) {
  			// Case: |x| ~< 2^-26
  			if ( ix < SMALL_HIGH_WORD ) {
  				return x;
  			}
  			return kernelSin( x, 0.0 );
  		}
  		// Case: x is NaN or infinity
  		if ( ix >= EXPONENT_MASK ) {
  			return NaN;
  		}
  		// Argument reduction...
  		n = rempio2( x, Y );
  		switch ( n & 3 ) {
  		case 0:
  			return kernelSin( Y[ 0 ], Y[ 1 ] );
  		case 1:
  			return kernelCos( Y[ 0 ], Y[ 1 ] );
  		case 2:
  			return -kernelSin( Y[ 0 ], Y[ 1 ] );
  		default:
  			return -kernelCos( Y[ 0 ], Y[ 1 ] );
  		}
  	}


  	// EXPORTS //

  	main$2 = sin;
  	return main$2;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$3;
  var hasRequiredLib$3;

  function requireLib$3 () {
  	if (hasRequiredLib$3) return lib$3;
  	hasRequiredLib$3 = 1;

  	/**
  	* Compute the sine of a number.
  	*
  	* @module @stdlib/math-base-special-sin
  	*
  	* @example
  	* var sin = require( '@stdlib/math-base-special-sin' );
  	*
  	* var v = sin( 0.0 );
  	* // returns ~0.0
  	*
  	* v = sin( 3.141592653589793/2.0 );
  	* // returns ~1.0
  	*
  	* v = sin( -3.141592653589793/6.0 );
  	* // returns ~-0.5
  	*
  	* v = sin( NaN );
  	* // returns NaN
  	*/

  	// MODULES //

  	var main = requireMain$2();


  	// EXPORTS //

  	lib$3 = main;
  	return lib$3;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$2;
  var hasRequiredLib$2;

  function requireLib$2 () {
  	if (hasRequiredLib$2) return lib$2;
  	hasRequiredLib$2 = 1;

  	/**
  	* The mathematical constant `π`.
  	*
  	* @module @stdlib/constants-float64-pi
  	* @type {number}
  	*
  	* @example
  	* var PI = require( '@stdlib/constants-float64-pi' );
  	* // returns 3.141592653589793
  	*/


  	// MAIN //

  	/**
  	* The mathematical constant `π`.
  	*
  	* @constant
  	* @type {number}
  	* @default 3.141592653589793
  	* @see [Wikipedia]{@link https://en.wikipedia.org/wiki/Pi}
  	*/
  	var PI = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679; // eslint-disable-line max-len


  	// EXPORTS //

  	lib$2 = PI;
  	return lib$2;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var main$1;
  var hasRequiredMain$1;

  function requireMain$1 () {
  	if (hasRequiredMain$1) return main$1;
  	hasRequiredMain$1 = 1;

  	/*
  	* Notes:
  	*	=> sin(-x) = -sin(x)
  	*	=> sin(+n) = +0, where `n` is a positive integer
  	*	=> sin(-n) = -sin(+n) = -0, where `n` is a positive integer
  	*	=> cos(-x) = cos(x)
  	*/


  	// MODULES //

  	var isnan = requireLib$10();
  	var isInfinite = requireLib$Y();
  	var cos = requireLib$4();
  	var sin = requireLib$3();
  	var abs = requireLib$X();
  	var copysign = requireLib$d();
  	var PI = requireLib$2();


  	// MAIN //

  	/**
  	* Computes the value of `sin(πx)`.
  	*
  	* @param {number} x - input value
  	* @returns {number} function value
  	*
  	* @example
  	* var y = sinpi( 0.0 );
  	* // returns 0.0
  	*
  	* @example
  	* var y = sinpi( 0.5 );
  	* // returns 1.0
  	*
  	* @example
  	* var y = sinpi( 0.9 );
  	* // returns ~0.309
  	*
  	* @example
  	* var y = sinpi( NaN );
  	* // returns NaN
  	*/
  	function sinpi( x ) {
  		var ar;
  		var r;
  		if ( isnan( x ) ) {
  			return NaN;
  		}
  		if ( isInfinite( x ) ) {
  			return NaN;
  		}
  		// Argument reduction (reduce to [0,2))...
  		r = x % 2.0; // sign preserving
  		ar = abs( r );

  		// If `x` is an integer, the mod is an integer...
  		if ( ar === 0.0 || ar === 1.0 ) {
  			return copysign( 0.0, r );
  		}
  		if ( ar < 0.25 ) {
  			return sin( PI*r );
  		}
  		// In each of the following, we further reduce to [-π/4,π/4)...
  		if ( ar < 0.75 ) {
  			ar = 0.5 - ar;
  			return copysign( cos( PI*ar ), r );
  		}
  		if ( ar < 1.25 ) {
  			r = copysign( 1.0, r ) - r;
  			return sin( PI*r );
  		}
  		if ( ar < 1.75 ) {
  			ar -= 1.5;
  			return -copysign( cos( PI*ar ), r );
  		}
  		r -= copysign( 2.0, r );
  		return sin( PI*r );
  	}


  	// EXPORTS //

  	main$1 = sinpi;
  	return main$1;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib$1;
  var hasRequiredLib$1;

  function requireLib$1 () {
  	if (hasRequiredLib$1) return lib$1;
  	hasRequiredLib$1 = 1;

  	/**
  	* Compute the value of `sin(πx)`.
  	*
  	* @module @stdlib/math-base-special-sinpi
  	*
  	* @example
  	* var sinpi = require( '@stdlib/math-base-special-sinpi' );
  	*
  	* var y = sinpi( 0.0 );
  	* // returns 0.0
  	*
  	* y = sinpi( 0.5 );
  	* // returns 1.0
  	*
  	* y = sinpi( 0.9 );
  	* // returns ~0.309
  	*
  	* y = sinpi( NaN );
  	* // returns NaN
  	*/

  	// MODULES //

  	var main = requireMain$1();


  	// EXPORTS //

  	lib$1 = main;
  	return lib$1;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_a1;
  var hasRequiredPolyval_a1;

  function requirePolyval_a1 () {
  	if (hasRequiredPolyval_a1) return polyval_a1;
  	hasRequiredPolyval_a1 = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return 0.06735230105312927;
  		}
  		return 0.06735230105312927 + (x * (0.007385550860814029 + (x * (0.0011927076318336207 + (x * (0.00022086279071390839 + (x * 0.000025214456545125733))))))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_a1 = evalpoly;
  	return polyval_a1;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_a2;
  var hasRequiredPolyval_a2;

  function requirePolyval_a2 () {
  	if (hasRequiredPolyval_a2) return polyval_a2;
  	hasRequiredPolyval_a2 = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return 0.020580808432516733;
  		}
  		return 0.020580808432516733 + (x * (0.0028905138367341563 + (x * (0.0005100697921535113 + (x * (0.00010801156724758394 + (x * 0.000044864094961891516))))))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_a2 = evalpoly;
  	return polyval_a2;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_r;
  var hasRequiredPolyval_r;

  function requirePolyval_r () {
  	if (hasRequiredPolyval_r) return polyval_r;
  	hasRequiredPolyval_r = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return 1.3920053346762105;
  		}
  		return 1.3920053346762105 + (x * (0.7219355475671381 + (x * (0.17193386563280308 + (x * (0.01864591917156529 + (x * (0.0007779424963818936 + (x * 0.000007326684307446256))))))))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_r = evalpoly;
  	return polyval_r;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_s;
  var hasRequiredPolyval_s;

  function requirePolyval_s () {
  	if (hasRequiredPolyval_s) return polyval_s;
  	hasRequiredPolyval_s = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return 0.21498241596060885;
  		}
  		return 0.21498241596060885 + (x * (0.325778796408931 + (x * (0.14635047265246445 + (x * (0.02664227030336386 + (x * (0.0018402845140733772 + (x * 0.00003194753265841009))))))))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_s = evalpoly;
  	return polyval_s;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_t1;
  var hasRequiredPolyval_t1;

  function requirePolyval_t1 () {
  	if (hasRequiredPolyval_t1) return polyval_t1;
  	hasRequiredPolyval_t1 = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return -0.032788541075985965;
  		}
  		return -0.032788541075985965 + (x * (0.006100538702462913 + (x * (-0.0014034646998923284 + (x * 0.00031563207090362595))))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_t1 = evalpoly;
  	return polyval_t1;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_t2;
  var hasRequiredPolyval_t2;

  function requirePolyval_t2 () {
  	if (hasRequiredPolyval_t2) return polyval_t2;
  	hasRequiredPolyval_t2 = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return 0.01797067508118204;
  		}
  		return 0.01797067508118204 + (x * (-0.0036845201678113826 + (x * (0.000881081882437654 + (x * -31275416837512086e-20))))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_t2 = evalpoly;
  	return polyval_t2;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_t3;
  var hasRequiredPolyval_t3;

  function requirePolyval_t3 () {
  	if (hasRequiredPolyval_t3) return polyval_t3;
  	hasRequiredPolyval_t3 = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return -0.010314224129834144;
  		}
  		return -0.010314224129834144 + (x * (0.0022596478090061247 + (x * (-5385953053567405e-19 + (x * 0.0003355291926355191))))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_t3 = evalpoly;
  	return polyval_t3;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_u;
  var hasRequiredPolyval_u;

  function requirePolyval_u () {
  	if (hasRequiredPolyval_u) return polyval_u;
  	hasRequiredPolyval_u = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return 0.6328270640250934;
  		}
  		return 0.6328270640250934 + (x * (1.4549225013723477 + (x * (0.9777175279633727 + (x * (0.22896372806469245 + (x * 0.013381091853678766))))))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_u = evalpoly;
  	return polyval_u;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_v;
  var hasRequiredPolyval_v;

  function requirePolyval_v () {
  	if (hasRequiredPolyval_v) return polyval_v;
  	hasRequiredPolyval_v = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return 2.4559779371304113;
  		}
  		return 2.4559779371304113 + (x * (2.128489763798934 + (x * (0.7692851504566728 + (x * (0.10422264559336913 + (x * 0.003217092422824239))))))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_v = evalpoly;
  	return polyval_v;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var polyval_w;
  var hasRequiredPolyval_w;

  function requirePolyval_w () {
  	if (hasRequiredPolyval_w) return polyval_w;
  	hasRequiredPolyval_w = 1;

  	// MAIN //

  	/**
  	* Evaluates a polynomial.
  	*
  	* ## Notes
  	*
  	* -   The implementation uses [Horner's rule][horners-method] for efficient computation.
  	*
  	* [horners-method]: https://en.wikipedia.org/wiki/Horner%27s_method
  	*
  	* @private
  	* @param {number} x - value at which to evaluate the polynomial
  	* @returns {number} evaluated polynomial
  	*/
  	function evalpoly( x ) {
  		if ( x === 0.0 ) {
  			return 0.08333333333333297;
  		}
  		return 0.08333333333333297 + (x * (-0.0027777777772877554 + (x * (0.0007936505586430196 + (x * (-59518755745034e-17 + (x * (0.0008363399189962821 + (x * -0.0016309293409657527))))))))); // eslint-disable-line max-len
  	}


  	// EXPORTS //

  	polyval_w = evalpoly;
  	return polyval_w;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  *
  * ## Notice
  *
  * The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_lgamma_r.c}. The implementation follows the original, but has been modified for JavaScript.
  *
  * ```text
  * Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
  *
  * Developed at SunPro, a Sun Microsystems, Inc. business.
  * Permission to use, copy, modify, and distribute this
  * software is freely granted, provided that this notice
  * is preserved.
  * ```
  */

  var main;
  var hasRequiredMain;

  function requireMain () {
  	if (hasRequiredMain) return main;
  	hasRequiredMain = 1;

  	// MODULES //

  	var isnan = requireLib$10();
  	var isInfinite = requireLib$Y();
  	var abs = requireLib$X();
  	var ln = requireLib$y();
  	var trunc = requireLib$v();
  	var sinpi = requireLib$1();
  	var PI = requireLib$2();
  	var PINF = requireLib$$();
  	var polyvalA1 = requirePolyval_a1();
  	var polyvalA2 = requirePolyval_a2();
  	var polyvalR = requirePolyval_r();
  	var polyvalS = requirePolyval_s();
  	var polyvalT1 = requirePolyval_t1();
  	var polyvalT2 = requirePolyval_t2();
  	var polyvalT3 = requirePolyval_t3();
  	var polyvalU = requirePolyval_u();
  	var polyvalV = requirePolyval_v();
  	var polyvalW = requirePolyval_w();


  	// VARIABLES //

  	var A1C = 7.72156649015328655494e-02; // 0x3FB3C467E37DB0C8
  	var A2C = 3.22467033424113591611e-01; // 0x3FD4A34CC4A60FAD
  	var RC = 1.0;
  	var SC = -0.07721566490153287; // 0xBFB3C467E37DB0C8
  	var T1C = 4.83836122723810047042e-01; // 0x3FDEF72BC8EE38A2
  	var T2C = -0.1475877229945939; // 0xBFC2E4278DC6C509
  	var T3C = 6.46249402391333854778e-02; // 0x3FB08B4294D5419B
  	var UC = -0.07721566490153287; // 0xBFB3C467E37DB0C8
  	var VC = 1.0;
  	var WC = 4.18938533204672725052e-01; // 0x3FDACFE390C97D69
  	var YMIN = 1.461632144968362245;
  	var TWO52 = 4503599627370496; // 2**52
  	var TWO58 = 288230376151711744; // 2**58
  	var TINY = 8.470329472543003e-22;
  	var TC = 1.46163214496836224576e+00; // 0x3FF762D86356BE3F
  	var TF = -0.12148629053584961; // 0xBFBF19B9BCC38A42
  	var TT = -3638676997039505e-33; // 0xBC50C7CAA48A971F => TT = -(tail of TF)


  	// MAIN //

  	/**
  	* Evaluates the natural logarithm of the gamma function.
  	*
  	* ## Method
  	*
  	* 1.  Argument reduction for \\(0 < x \leq 8\\). Since \\(\Gamma(1+s) = s \Gamma(s)\\), for \\(x \in \[0,8]\\), we may reduce \\(x\\) to a number in \\(\[1.5,2.5]\\) by
  	*
  	*     ```tex
  	*     \operatorname{lgamma}(1+s) = \ln(s) + \operatorname{lgamma}(s)
  	*     ```
  	*
  	*     For example,
  	*
  	*     ```tex
  	*     \begin{align*}
  	*     \operatorname{lgamma}(7.3) &= \ln(6.3) + \operatorname{lgamma}(6.3) \\
  	*     &= \ln(6.3 \cdot 5.3) + \operatorname{lgamma}(5.3) \\
  	*     &= \ln(6.3 \cdot 5.3 \cdot 4.3 \cdot 3.3 \cdot2.3) + \operatorname{lgamma}(2.3)
  	*     \end{align*}
  	*     ```
  	*
  	* 2.  Compute a polynomial approximation of \\(\mathrm{lgamma}\\) around its minimum (\\(\mathrm{ymin} = 1.461632144968362245\\)) to maintain monotonicity. On the interval \\(\[\mathrm{ymin} - 0.23, \mathrm{ymin} + 0.27]\\) (i.e., \\(\[1.23164,1.73163]\\)), we let \\(z = x - \mathrm{ymin}\\) and use
  	*
  	*     ```tex
  	*     \operatorname{lgamma}(x) = -1.214862905358496078218 + z^2 \cdot \operatorname{poly}(z)
  	*     ```
  	*
  	*     where \\(\operatorname{poly}(z)\\) is a \\(14\\) degree polynomial.
  	*
  	* 3.  Compute a rational approximation in the primary interval \\(\[2,3]\\). Let \\( s = x - 2.0 \\). We can thus use the approximation
  	*
  	*     ```tex
  	*     \operatorname{lgamma}(x) = \frac{s}{2} + s\frac{\operatorname{P}(s)}{\operatorname{Q}(s)}
  	*     ```
  	*
  	*     with accuracy
  	*
  	*     ```tex
  	*     \biggl|\frac{\mathrm{P}}{\mathrm{Q}} - \biggr(\operatorname{lgamma}(x)-\frac{s}{2}\biggl)\biggl| < 2^{-61.71}
  	*     ```
  	*
  	*     The algorithms are based on the observation
  	*
  	*     ```tex
  	*     \operatorname{lgamma}(2+s) = s(1 - \gamma) + \frac{\zeta(2) - 1}{2} s^2 - \frac{\zeta(3) - 1}{3} s^3 + \ldots
  	*     ```
  	*
  	*     where \\(\zeta\\) is the zeta function and \\(\gamma = 0.5772156649...\\) is the Euler-Mascheroni constant, which is very close to \\(0.5\\).
  	*
  	* 4.  For \\(x \geq 8\\),
  	*
  	*     ```tex
  	*     \operatorname{lgamma}(x) \approx \biggl(x-\frac{1}{2}\biggr) \ln(x) - x + \frac{\ln(2\pi)}{2} + \frac{1}{12x} - \frac{1}{360x^3} + \ldots
  	*     ```
  	*
  	*     which can be expressed
  	*
  	*     ```tex
  	*     \operatorname{lgamma}(x) \approx \biggl(x-\frac{1}{2}\biggr)(\ln(x)-1)-\frac{\ln(2\pi)-1}{2} + \ldots
  	*     ```
  	*
  	*     Let \\(z = \frac{1}{x}\\). We can then use the approximation
  	*
  	*     ```tex
  	*     f(z) = \operatorname{lgamma}(x) - \biggl(x-\frac{1}{2}\biggr)(\ln(x)-1)
  	*     ```
  	*
  	*     by
  	*
  	*     ```tex
  	*     w = w_0 + w_1 z + w_2 z^3 + w_3 z^5 + \ldots + w_6 z^{11}
  	*     ```
  	*
  	*     where
  	*
  	*     ```tex
  	*     |w - f(z)| < 2^{-58.74}
  	*     ```
  	*
  	* 5.  For negative \\(x\\), since
  	*
  	*     ```tex
  	*     -x \Gamma(-x) \Gamma(x) = \frac{\pi}{\sin(\pi x)}
  	*     ```
  	*
  	*     where \\(\Gamma\\) is the gamma function, we have
  	*
  	*     ```tex
  	*     \Gamma(x) = \frac{\pi}{\sin(\pi x)(-x)\Gamma(-x)}
  	*     ```
  	*
  	*     Since \\(\Gamma(-x)\\) is positive,
  	*
  	*     ```tex
  	*     \operatorname{sign}(\Gamma(x)) = \operatorname{sign}(\sin(\pi x))
  	*     ```
  	*
  	*     for \\(x < 0\\). Hence, for \\(x < 0\\),
  	*
  	*     ```tex
  	*     \mathrm{signgam} = \operatorname{sign}(\sin(\pi x))
  	*     ```
  	*
  	*     and
  	*
  	*     ```tex
  	*     \begin{align*}
  	*     \operatorname{lgamma}(x) &= \ln(|\Gamma(x)|) \\
  	*     &= \ln\biggl(\frac{\pi}{|x \sin(\pi x)|}\biggr) - \operatorname{lgamma}(-x)
  	*     \end{align*}
  	*     ```
  	*
  	*     <!-- <note> -->
  	*
  	*     Note that one should avoid computing \\(\pi (-x)\\) directly in the computation of \\(\sin(\pi (-x))\\).
  	*
  	*     <!-- </note> -->
  	*
  	* ## Special Cases
  	*
  	* ```tex
  	* \begin{align*}
  	* \operatorname{lgamma}(2+s) &\approx s (1-\gamma) & \mathrm{for\ tiny\ s} \\
  	* \operatorname{lgamma}(x) &\approx -\ln(x) & \mathrm{for\ tiny\ x} \\
  	* \operatorname{lgamma}(1) &= 0 & \\
  	* \operatorname{lgamma}(2) &= 0 & \\
  	* \operatorname{lgamma}(0) &= \infty & \\
  	* \operatorname{lgamma}(\infty) &= \infty & \\
  	* \operatorname{lgamma}(-\mathrm{integer}) &= \pm \infty
  	* \end{align*}
  	* ```
  	*
  	* @param {number} x - input value
  	* @returns {number} function value
  	*
  	* @example
  	* var v = gammaln( 1.0 );
  	* // returns 0.0
  	*
  	* @example
  	* var v = gammaln( 2.0 );
  	* // returns 0.0
  	*
  	* @example
  	* var v = gammaln( 4.0 );
  	* // returns ~1.792
  	*
  	* @example
  	* var v = gammaln( -0.5 );
  	* // returns ~1.266
  	*
  	* @example
  	* var v = gammaln( 0.5 );
  	* // returns ~0.572
  	*
  	* @example
  	* var v = gammaln( 0.0 );
  	* // returns Infinity
  	*
  	* @example
  	* var v = gammaln( NaN );
  	* // returns NaN
  	*/
  	function gammaln( x ) {
  		var isNegative;
  		var nadj;
  		var flg;
  		var p3;
  		var p2;
  		var p1;
  		var p;
  		var q;
  		var t;
  		var w;
  		var y;
  		var z;
  		var r;

  		// Special cases: NaN, +-infinity
  		if ( isnan( x ) || isInfinite( x ) ) {
  			return x;
  		}
  		// Special case: 0
  		if ( x === 0.0 ) {
  			return PINF;
  		}
  		if ( x < 0.0 ) {
  			isNegative = true;
  			x = -x;
  		} else {
  			isNegative = false;
  		}
  		// If |x| < 2**-70, return -ln(|x|)
  		if ( x < TINY ) {
  			return -ln( x );
  		}
  		if ( isNegative ) {
  			// If |x| >= 2**52, must be -integer
  			if ( x >= TWO52 ) {
  				return PINF;
  			}
  			t = sinpi( x );
  			if ( t === 0.0 ) {
  				return PINF;
  			}
  			nadj = ln( PI / abs( t*x ) );
  		}
  		// If x equals 1 or 2, return 0
  		if ( x === 1.0 || x === 2.0 ) {
  			return 0.0;
  		}
  		// If x < 2, use lgamma(x) = lgamma(x+1) - log(x)
  		if ( x < 2.0 ) {
  			if ( x <= 0.9 ) {
  				r = -ln( x );

  				// 0.7316 <= x <=  0.9
  				if ( x >= ( YMIN - 1.0 + 0.27 ) ) {
  					y = 1.0 - x;
  					flg = 0;
  				}
  				// 0.2316 <= x < 0.7316
  				else if ( x >= (YMIN - 1.0 - 0.27) ) {
  					y = x - (TC - 1.0);
  					flg = 1;
  				}
  				// 0 < x < 0.2316
  				else {
  					y = x;
  					flg = 2;
  				}
  			} else {
  				r = 0.0;

  				// 1.7316 <= x < 2
  				if ( x >= (YMIN + 0.27) ) {
  					y = 2.0 - x;
  					flg = 0;
  				}
  				// 1.2316 <= x < 1.7316
  				else if ( x >= (YMIN - 0.27) ) {
  					y = x - TC;
  					flg = 1;
  				}
  				// 0.9 < x < 1.2316
  				else {
  					y = x - 1.0;
  					flg = 2;
  				}
  			}
  			switch ( flg ) { // eslint-disable-line default-case
  			case 0:
  				z = y * y;
  				p1 = A1C + (z*polyvalA1( z ));
  				p2 = z * (A2C + (z*polyvalA2( z )));
  				p = (y*p1) + p2;
  				r += ( p - (0.5*y) );
  				break;
  			case 1:
  				z = y * y;
  				w = z * y;
  				p1 = T1C + (w*polyvalT1( w ));
  				p2 = T2C + (w*polyvalT2( w ));
  				p3 = T3C + (w*polyvalT3( w ));
  				p = (z*p1) - (TT - (w*(p2+(y*p3))));
  				r += ( TF + p );
  				break;
  			case 2:
  				p1 = y * (UC + (y*polyvalU( y )));
  				p2 = VC + (y*polyvalV( y ));
  				r += (-0.5*y) + (p1/p2);
  				break;
  			}
  		}
  		// 2 <= x < 8
  		else if ( x < 8.0 ) {
  			flg = trunc( x );
  			y = x - flg;
  			p = y * (SC + (y*polyvalS( y )));
  			q = RC + (y*polyvalR( y ));
  			r = (0.5*y) + (p/q);
  			z = 1.0; // gammaln(1+s) = ln(s) + gammaln(s)
  			switch ( flg ) { // eslint-disable-line default-case
  			case 7:
  				z *= y + 6.0;

  				/* Falls through */
  			case 6:
  				z *= y + 5.0;

  				/* Falls through */
  			case 5:
  				z *= y + 4.0;

  				/* Falls through */
  			case 4:
  				z *= y + 3.0;

  				/* Falls through */
  			case 3:
  				z *= y + 2.0;
  				r += ln( z );
  			}
  		}
  		// 8 <= x < 2**58
  		else if ( x < TWO58 ) {
  			t = ln( x );
  			z = 1.0 / x;
  			y = z * z;
  			w = WC + (z*polyvalW( y ));
  			r = ((x-0.5)*(t-1.0)) + w;
  		}
  		// 2**58 <= x <= Inf
  		else {
  			r = x * ( ln(x)-1.0 );
  		}
  		if ( isNegative ) {
  			r = nadj - r;
  		}
  		return r;
  	}


  	// EXPORTS //

  	main = gammaln;
  	return main;
  }

  /**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

  var lib;
  var hasRequiredLib;

  function requireLib () {
  	if (hasRequiredLib) return lib;
  	hasRequiredLib = 1;

  	/**
  	* Evaluate the natural logarithm of the gamma function.
  	*
  	* @module @stdlib/math-base-special-gammaln
  	*
  	* @example
  	* var gammaln = require( '@stdlib/math-base-special-gammaln' );
  	*
  	* var v = gammaln( 1.0 );
  	* // returns 0.0
  	*
  	* v = gammaln( 2.0 );
  	* // returns 0.0
  	*
  	* v = gammaln( 4.0 );
  	* // returns ~1.792
  	*
  	* v = gammaln( -0.5 );
  	* // returns ~1.266
  	*
  	* v = gammaln( 0.5 );
  	* // returns ~0.572
  	*
  	* v = gammaln( 0.0 );
  	* // returns Infinity
  	*
  	* v = gammaln( NaN );
  	* // returns NaN
  	*/

  	// MODULES //

  	var main = requireMain();


  	// EXPORTS //

  	lib = main;
  	return lib;
  }

  var libExports = requireLib();
  var gammaln = /*@__PURE__*/getDefaultExportFromCjs(libExports);

  function broadcastUnary(fun) {
      return function (y) {
          if (Array.isArray(y)) {
              return y.map((d) => fun(d));
          }
          else {
              return fun(y);
          }
      };
  }
  const sqrt = broadcastUnary(Math.sqrt);
  const abs = broadcastUnary((x) => (x ? Math.abs(x) : x));
  const exp = broadcastUnary(Math.exp);
  const lgamma = broadcastUnary(gammaln);
  const square = broadcastUnary((x) => Math.pow(x, 2));

  const formatValues = function (value, name, inputSettings, derivedSettings) {
      const suffix = derivedSettings.percentLabels ? "%" : "";
      const sig_figs = inputSettings.spc.sig_figs;
      if (isNullOrUndefined(value)) {
          return "";
      }
      switch (name) {
          case "date":
              return value;
          case "integer": {
              return value.toFixed(derivedSettings.chart_type_props.integer_num_den ? 0 : sig_figs);
          }
          default:
              return value.toFixed(sig_figs) + suffix;
      }
  };
  function valueFormatter(inputSettings, derivedSettings) {
      const formatValuesImpl = function (value, name) {
          return formatValues(value, name, inputSettings, derivedSettings);
      };
      return formatValuesImpl;
  }

  function buildTooltip(table_row, inputTooltips, inputSettings, derivedSettings) {
      const ast_limit = inputSettings.outliers.astronomical_limit;
      const two_in_three_limit = inputSettings.outliers.two_in_three_limit;
      const formatValues = valueFormatter(inputSettings, derivedSettings);
      const tooltip = new Array();
      tooltip.push({
          displayName: "Date",
          value: table_row.date
      });
      if (inputSettings.spc.ttip_show_value) {
          const ttip_label_value = inputSettings.spc.ttip_label_value;
          tooltip.push({
              displayName: ttip_label_value === "Automatic" ? derivedSettings.chart_type_props.value_name : ttip_label_value,
              value: formatValues(table_row.value, "value")
          });
      }
      if (inputSettings.spc.ttip_show_numerator && !isNullOrUndefined(table_row.numerator)) {
          tooltip.push({
              displayName: inputSettings.spc.ttip_label_numerator,
              value: formatValues(table_row.numerator, "integer")
          });
      }
      if (inputSettings.spc.ttip_show_denominator && !isNullOrUndefined(table_row.denominator)) {
          tooltip.push({
              displayName: inputSettings.spc.ttip_label_denominator,
              value: formatValues(table_row.denominator, "integer")
          });
      }
      if (inputSettings.lines.show_specification && inputSettings.lines.ttip_show_specification) {
          if (!isNullOrUndefined(table_row.speclimits_upper)) {
              tooltip.push({
                  displayName: `Upper ${inputSettings.lines.ttip_label_specification}`,
                  value: formatValues(table_row.speclimits_upper, "value")
              });
          }
          if (!isNullOrUndefined(table_row.speclimits_lower)) {
              tooltip.push({
                  displayName: `Lower ${inputSettings.lines.ttip_label_specification}`,
                  value: formatValues(table_row.speclimits_lower, "value")
              });
          }
      }
      if (derivedSettings.chart_type_props.has_control_limits) {
          ["68", "95", "99"].forEach(limit => {
              if (inputSettings.lines[`ttip_show_${limit}`] && inputSettings.lines[`show_${limit}`]) {
                  tooltip.push({
                      displayName: `${inputSettings.lines[`ttip_label_${limit}_prefix_upper`]}${inputSettings.lines[`ttip_label_${limit}`]}`,
                      value: formatValues(table_row[`ul${limit}`], "value")
                  });
              }
          });
      }
      if (inputSettings.lines.show_target && inputSettings.lines.ttip_show_target) {
          tooltip.push({
              displayName: inputSettings.lines.ttip_label_target,
              value: formatValues(table_row.target, "value")
          });
      }
      if (inputSettings.lines.show_alt_target && inputSettings.lines.ttip_show_alt_target && !isNullOrUndefined(table_row.alt_target)) {
          tooltip.push({
              displayName: inputSettings.lines.ttip_label_alt_target,
              value: formatValues(table_row.alt_target, "value")
          });
      }
      if (derivedSettings.chart_type_props.has_control_limits) {
          ["68", "95", "99"].forEach(limit => {
              if (inputSettings.lines[`ttip_show_${limit}`] && inputSettings.lines[`show_${limit}`]) {
                  tooltip.push({
                      displayName: `${inputSettings.lines[`ttip_label_${limit}_prefix_lower`]}${inputSettings.lines[`ttip_label_${limit}`]}`,
                      value: formatValues(table_row[`ll${limit}`], "value")
                  });
              }
          });
      }
      if ([table_row.astpoint, table_row.trend, table_row.shift, table_row.two_in_three].some(d => d !== "none")) {
          const patterns = new Array();
          if (table_row.astpoint !== "none") {
              let flag_text = "Astronomical Point";
              if (ast_limit !== "3 Sigma") {
                  flag_text = `${flag_text} (${ast_limit})`;
              }
              patterns.push(flag_text);
          }
          if (table_row.trend !== "none") {
              patterns.push("Trend");
          }
          if (table_row.shift !== "none") {
              patterns.push("Shift");
          }
          if (table_row.two_in_three !== "none") {
              let flag_text = "Two-in-Three";
              if (two_in_three_limit !== "2 Sigma") {
                  flag_text = `${flag_text} (${two_in_three_limit})`;
              }
              patterns.push(flag_text);
          }
          tooltip.push({
              displayName: "Pattern(s)",
              value: patterns.join("\n")
          });
      }
      if (!isNullOrUndefined(inputTooltips) && inputTooltips.length > 0) {
          inputTooltips.forEach(customTooltip => tooltip.push(customTooltip));
      }
      return tooltip;
  }

  const checkFlagDirection = broadcastBinary((outlierStatus, flagSettings) => {
      if (outlierStatus === "none") {
          return outlierStatus;
      }
      const increaseDirectionMap = {
          "upper": "improvement",
          "lower": "deterioration"
      };
      const decreaseDirectionMap = {
          "lower": "improvement",
          "upper": "deterioration"
      };
      const neutralDirectionMap = {
          "lower": "neutral_low",
          "upper": "neutral_high"
      };
      const flagDirectionMap = {
          "increase": increaseDirectionMap[outlierStatus],
          "decrease": decreaseDirectionMap[outlierStatus],
          "neutral": neutralDirectionMap[outlierStatus]
      };
      const mappedFlag = flagDirectionMap[flagSettings.improvement_direction];
      if (flagSettings.process_flag_type !== "both") {
          return mappedFlag === flagSettings.process_flag_type ? mappedFlag : "none";
      }
      else {
          return mappedFlag;
      }
  });

  const c4 = broadcastUnary((sampleSize) => {
      if ((sampleSize <= 1) || isNullOrUndefined(sampleSize)) {
          return null;
      }
      const Nminus1 = sampleSize - 1;
      return sqrt(2.0 / Nminus1)
          * exp(lgamma(sampleSize / 2.0) - lgamma(Nminus1 / 2.0));
  });
  const c5 = broadcastUnary((sampleSize) => {
      return sqrt(1 - square(c4(sampleSize)));
  });
  const a3 = broadcastUnary((sampleSize) => {
      const filt_samp = sampleSize <= 1 ? null : sampleSize;
      return 3.0 / (c4(filt_samp) * sqrt(filt_samp));
  });
  const b_helper = broadcastBinary((sampleSize, sigma) => {
      return (sigma * c5(sampleSize)) / c4(sampleSize);
  });
  const b3 = broadcastBinary((sampleSize, sigma) => {
      return 1 - b_helper(sampleSize, sigma);
  });
  const b4 = broadcastBinary((sampleSize, sigma) => {
      return 1 + b_helper(sampleSize, sigma);
  });

  function diff(x) {
      return x.map((d, idx, arr) => (idx > 0) ? d - arr[idx - 1] : null);
  }

  const textOptions = {
      font: {
          default: "'Arial', sans-serif",
          valid: [
              "'Arial', sans-serif",
              "Arial",
              "'Arial Black'",
              "'Arial Unicode MS'",
              "Calibri",
              "Cambria",
              "'Cambria Math'",
              "Candara",
              "'Comic Sans MS'",
              "Consolas",
              "Constantia",
              "Corbel",
              "'Courier New'",
              "wf_standard-font, helvetica, arial, sans-serif",
              "wf_standard-font_light, helvetica, arial, sans-serif",
              "Georgia",
              "'Lucida Sans Unicode'",
              "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif",
              "'Segoe UI Light', wf_segoe-ui_light, helvetica, arial, sans-serif",
              "'Segoe UI Semibold', wf_segoe-ui_semibold, helvetica, arial, sans-serif",
              "'Segoe UI Bold', wf_segoe-ui_bold, helvetica, arial, sans-serif",
              "Symbol",
              "Tahoma",
              "'Times New Roman'",
              "'Trebuchet MS'",
              "Verdana",
              "Wingdings"
          ]
      },
      size: {
          default: 10,
          valid: { numberRange: { min: 0, max: 100 } }
      },
      weight: {
          default: "normal",
          valid: ["normal", "bold", "bolder", "lighter"]
      },
      text_transform: {
          default: "uppercase",
          valid: ["uppercase", "lowercase", "capitalize", "none"]
      },
      text_overflow: {
          default: "ellipsis",
          valid: ["ellipsis", "clip", "none"]
      },
      text_align: {
          default: "center",
          valid: ["center", "left", "right"]
      }
  };
  const lineOptions = {
      type: {
          valid: ["10 0", "10 10", "2 5"]
      },
      width: {
          valid: { numberRange: { min: 0, max: 100 } }
      }
  };
  const iconOptions = {
      location: {
          default: "Top Right",
          valid: ["Top Right", "Bottom Right", "Top Left", "Bottom Left"]
      },
      scaling: {
          default: 1,
          valid: { numberRange: { min: 0 } }
      }
  };
  const colourOptions = {
      improvement: { default: "#00B0F0" },
      deterioration: { default: "#E46C0A" },
      neutral_low: { default: "#490092" },
      neutral_high: { default: "#490092" },
      limits: { default: "#6495ED" },
      standard: { default: "#000000" }
  };
  const borderOptions = {
      width: {
          default: 1,
          valid: { numberRange: { min: 0 } }
      },
      style: {
          default: "solid",
          valid: ["solid", "dotted", "dashed", "double", "groove", "ridge", "inset", "outset", "none"]
      },
      colour: {
          default: "#000000"
      }
  };
  const labelOptions = {
      limits: { default: "beside", valid: ["outside", "inside", "above", "below", "beside"] },
      standard: { default: "beside", valid: ["above", "below", "beside"] }
  };

  const defaultSettings = {
      canvas: {
          show_errors: { default: true },
          lower_padding: { default: 10 },
          upper_padding: { default: 10 },
          left_padding: { default: 10 },
          right_padding: { default: 10 }
      },
      spc: {
          chart_type: { default: "i", valid: ["run", "i", "i_m", "i_mm", "mr", "p", "pp", "u", "up", "c", "xbar", "s", "g", "t"] },
          outliers_in_limits: { default: false },
          multiplier: { default: 1, valid: { numberRange: { min: 0 } } },
          sig_figs: { default: 2, valid: { numberRange: { min: 0, max: 20 } } },
          perc_labels: { default: "Automatic", valid: ["Automatic", "Yes", "No"] },
          split_on_click: { default: false },
          num_points_subset: { default: null },
          subset_points_from: { default: "Start", valid: ["Start", "End"] },
          ttip_show_numerator: { default: true },
          ttip_label_numerator: { default: "Numerator" },
          ttip_show_denominator: { default: true },
          ttip_label_denominator: { default: "Denominator" },
          ttip_show_value: { default: true },
          ttip_label_value: { default: "Automatic" },
          ll_truncate: { default: null },
          ul_truncate: { default: null }
      },
      outliers: {
          process_flag_type: { default: "both", valid: ["both", "improvement", "deterioration"] },
          improvement_direction: { default: "increase", valid: ["increase", "neutral", "decrease"] },
          astronomical: { default: false },
          astronomical_limit: { default: "3 Sigma", valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"] },
          ast_colour_improvement: colourOptions.improvement,
          ast_colour_deterioration: colourOptions.deterioration,
          ast_colour_neutral_low: colourOptions.neutral_low,
          ast_colour_neutral_high: colourOptions.neutral_high,
          shift: { default: false },
          shift_n: { default: 7, valid: { numberRange: { min: 1 } } },
          shift_colour_improvement: colourOptions.improvement,
          shift_colour_deterioration: colourOptions.deterioration,
          shift_colour_neutral_low: colourOptions.neutral_low,
          shift_colour_neutral_high: colourOptions.neutral_high,
          trend: { default: false },
          trend_n: { default: 5, valid: { numberRange: { min: 1 } } },
          trend_colour_improvement: colourOptions.improvement,
          trend_colour_deterioration: colourOptions.deterioration,
          trend_colour_neutral_low: colourOptions.neutral_low,
          trend_colour_neutral_high: colourOptions.neutral_high,
          two_in_three: { default: false },
          two_in_three_highlight_series: { default: false },
          two_in_three_limit: { default: "2 Sigma", valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"] },
          twointhree_colour_improvement: colourOptions.improvement,
          twointhree_colour_deterioration: colourOptions.deterioration,
          twointhree_colour_neutral_low: colourOptions.neutral_low,
          twointhree_colour_neutral_high: colourOptions.neutral_high
      },
      nhs_icons: {
          flag_last_point: { default: true },
          show_variation_icons: { default: false },
          variation_icons_locations: iconOptions.location,
          variation_icons_scaling: iconOptions.scaling,
          show_assurance_icons: { default: false },
          assurance_icons_locations: iconOptions.location,
          assurance_icons_scaling: iconOptions.scaling
      },
      scatter: {
          size: { default: 2.5, valid: { numberRange: { min: 0, max: 100 } } },
          colour: colourOptions.standard,
          opacity: { default: 1, valid: { numberRange: { min: 0, max: 1 } } },
          opacity_unselected: { default: 0.2, valid: { numberRange: { min: 0, max: 1 } } }
      },
      lines: {
          show_99: { default: true },
          show_95: { default: true },
          show_68: { default: false },
          show_main: { default: true },
          show_target: { default: true },
          show_alt_target: { default: false },
          show_specification: { default: false },
          width_99: { default: 2, valid: lineOptions.width.valid },
          width_95: { default: 2, valid: lineOptions.width.valid },
          width_68: { default: 2, valid: lineOptions.width.valid },
          width_main: { default: 1, valid: lineOptions.width.valid },
          width_target: { default: 1.5, valid: lineOptions.width.valid },
          width_alt_target: { default: 1.5, valid: lineOptions.width.valid },
          width_specification: { default: 2, valid: lineOptions.width.valid },
          type_99: { default: "10 10", valid: lineOptions.type.valid },
          type_95: { default: "2 5", valid: lineOptions.type.valid },
          type_68: { default: "2 5", valid: lineOptions.type.valid },
          type_main: { default: "10 0", valid: lineOptions.type.valid },
          type_target: { default: "10 0", valid: lineOptions.type.valid },
          type_alt_target: { default: "10 0", valid: lineOptions.type.valid },
          type_specification: { default: "10 10", valid: lineOptions.type.valid },
          colour_99: colourOptions.limits,
          colour_95: colourOptions.limits,
          colour_68: colourOptions.limits,
          colour_main: colourOptions.standard,
          colour_target: colourOptions.standard,
          colour_alt_target: colourOptions.standard,
          colour_specification: colourOptions.limits,
          ttip_show_99: { default: true },
          ttip_show_95: { default: false },
          ttip_show_68: { default: false },
          ttip_show_target: { default: true },
          ttip_show_alt_target: { default: true },
          ttip_show_specification: { default: true },
          ttip_label_99: { default: "99% Limit" },
          ttip_label_99_prefix_lower: { default: "Lower " },
          ttip_label_99_prefix_upper: { default: "Upper " },
          ttip_label_95: { default: "95% Limit" },
          ttip_label_95_prefix_lower: { default: "Lower " },
          ttip_label_95_prefix_upper: { default: "Upper " },
          ttip_label_68: { default: "68% Limit" },
          ttip_label_68_prefix_lower: { default: "Lower " },
          ttip_label_68_prefix_upper: { default: "Upper " },
          ttip_label_target: { default: "Centerline" },
          ttip_label_alt_target: { default: "Alt. Target" },
          ttip_label_specification: { default: "Specification Limit" },
          ttip_label_specification_prefix_lower: { default: "Lower " },
          ttip_label_specification_prefix_upper: { default: "Upper " },
          alt_target: { default: null },
          specification_upper: { default: null },
          specification_lower: { default: null },
          multiplier_alt_target: { default: false },
          multiplier_specification: { default: false },
          plot_label_show_99: { default: false },
          plot_label_show_95: { default: false },
          plot_label_show_68: { default: false },
          plot_label_show_main: { default: false },
          plot_label_show_target: { default: false },
          plot_label_show_alt_target: { default: false },
          plot_label_show_specification: { default: false },
          plot_label_position_99: labelOptions.limits,
          plot_label_position_95: labelOptions.limits,
          plot_label_position_68: labelOptions.limits,
          plot_label_position_main: labelOptions.standard,
          plot_label_position_target: labelOptions.standard,
          plot_label_position_alt_target: labelOptions.standard,
          plot_label_position_specification: labelOptions.limits,
          plot_label_vpad_99: { default: 0 },
          plot_label_vpad_95: { default: 0 },
          plot_label_vpad_68: { default: 0 },
          plot_label_vpad_main: { default: 0 },
          plot_label_vpad_target: { default: 0 },
          plot_label_vpad_alt_target: { default: 0 },
          plot_label_vpad_specification: { default: 0 },
          plot_label_hpad_99: { default: 10 },
          plot_label_hpad_95: { default: 10 },
          plot_label_hpad_68: { default: 10 },
          plot_label_hpad_main: { default: 10 },
          plot_label_hpad_target: { default: 10 },
          plot_label_hpad_alt_target: { default: 10 },
          plot_label_hpad_specification: { default: 10 },
          plot_label_font_99: textOptions.font,
          plot_label_font_95: textOptions.font,
          plot_label_font_68: textOptions.font,
          plot_label_font_main: textOptions.font,
          plot_label_font_target: textOptions.font,
          plot_label_font_alt_target: textOptions.font,
          plot_label_font_specification: textOptions.font,
          plot_label_size_99: textOptions.size,
          plot_label_size_95: textOptions.size,
          plot_label_size_68: textOptions.size,
          plot_label_size_main: textOptions.size,
          plot_label_size_target: textOptions.size,
          plot_label_size_alt_target: textOptions.size,
          plot_label_size_specification: textOptions.size,
          plot_label_colour_99: colourOptions.standard,
          plot_label_colour_95: colourOptions.standard,
          plot_label_colour_68: colourOptions.standard,
          plot_label_colour_main: colourOptions.standard,
          plot_label_colour_target: colourOptions.standard,
          plot_label_colour_alt_target: colourOptions.standard,
          plot_label_colour_specification: colourOptions.standard,
          plot_label_prefix_99: { default: "" },
          plot_label_prefix_95: { default: "" },
          plot_label_prefix_68: { default: "" },
          plot_label_prefix_main: { default: "" },
          plot_label_prefix_target: { default: "" },
          plot_label_prefix_alt_target: { default: "" },
          plot_label_prefix_specification: { default: "" }
      },
      x_axis: {
          xlimit_colour: colourOptions.standard,
          xlimit_ticks: { default: true },
          xlimit_tick_font: textOptions.font,
          xlimit_tick_size: textOptions.size,
          xlimit_tick_colour: colourOptions.standard,
          xlimit_tick_rotation: { default: -35, valid: { numberRange: { min: -360, max: 360 } } },
          xlimit_tick_count: { default: 10, valid: { numberRange: { min: 0, max: 100 } } },
          xlimit_label: { default: null },
          xlimit_label_font: textOptions.font,
          xlimit_label_size: textOptions.size,
          xlimit_label_colour: colourOptions.standard,
          xlimit_l: { default: null },
          xlimit_u: { default: null }
      },
      y_axis: {
          ylimit_colour: colourOptions.standard,
          ylimit_ticks: { default: true },
          ylimit_tick_font: textOptions.font,
          ylimit_tick_size: textOptions.size,
          ylimit_tick_colour: colourOptions.standard,
          ylimit_tick_rotation: { default: 0, valid: { numberRange: { min: -360, max: 360 } } },
          ylimit_tick_count: { default: 10, valid: { numberRange: { min: 0, max: 100 } } },
          ylimit_label: { default: null },
          ylimit_label_font: textOptions.font,
          ylimit_label_size: textOptions.size,
          ylimit_label_colour: colourOptions.standard,
          ylimit_l: { default: null },
          ylimit_u: { default: null },
          limit_multiplier: { default: 1.5, valid: { numberRange: { min: 0 } } },
          ylimit_sig_figs: { default: null }
      },
      dates: {
          date_format_day: { default: "DD", valid: ["DD", "Thurs DD", "Thursday DD", "(blank)"] },
          date_format_month: { default: "MM", valid: ["MM", "Mon", "Month", "(blank)"] },
          date_format_year: { default: "YYYY", valid: ["YYYY", "YY", "(blank)"] },
          date_format_delim: { default: "/", valid: ["/", "-", " "] },
          date_format_locale: { default: "en-GB", valid: ["en-GB", "en-US"] }
      },
      summary_table: {
          show_table: { default: false },
          table_text_overflow: textOptions.text_overflow,
          table_opacity: { default: 1, valid: { numberRange: { min: 0, max: 1 } } },
          table_opacity_unselected: { default: 0.2, valid: { numberRange: { min: 0, max: 1 } } },
          table_variation_filter: { default: "all", valid: ["all", "common", "special", "improvement", "deterioration", "neutral"] },
          table_assurance_filter: { default: "all", valid: ["all", "any", "pass", "fail", "inconsistent"] },
          table_outer_border_style: borderOptions.style,
          table_outer_border_width: borderOptions.width,
          table_outer_border_colour: borderOptions.colour,
          table_outer_border_top: { default: true },
          table_outer_border_bottom: { default: true },
          table_outer_border_left: { default: true },
          table_outer_border_right: { default: true },
          table_header_font: textOptions.font,
          table_header_font_weight: textOptions.weight,
          table_header_text_transform: textOptions.text_transform,
          table_header_text_align: textOptions.text_align,
          table_header_text_padding: { default: 1, valid: { numberRange: { min: 0, max: 100 } } },
          table_header_size: textOptions.size,
          table_header_colour: colourOptions.standard,
          table_header_bg_colour: { default: "#D3D3D3" },
          table_header_border_style: borderOptions.style,
          table_header_border_width: borderOptions.width,
          table_header_border_colour: borderOptions.colour,
          table_header_border_bottom: { default: true },
          table_header_border_inner: { default: true },
          table_body_font: textOptions.font,
          table_body_font_weight: textOptions.weight,
          table_body_text_transform: textOptions.text_transform,
          table_body_text_align: textOptions.text_align,
          table_body_text_padding: { default: 1, valid: { numberRange: { min: 0, max: 100 } } },
          table_body_size: textOptions.size,
          table_body_colour: colourOptions.standard,
          table_body_bg_colour: { default: "#FFFFFF" },
          table_body_border_style: borderOptions.style,
          table_body_border_width: borderOptions.width,
          table_body_border_colour: borderOptions.colour,
          table_body_border_top_bottom: { default: true },
          table_body_border_left_right: { default: true }
      },
      download_options: {
          show_button: { default: false }
      },
      labels: {
          show_labels: { default: true },
          label_position: { default: "top", valid: ["top", "bottom"] },
          label_y_offset: { default: 20 },
          label_line_offset: { default: 5 },
          label_angle_offset: { default: 0, valid: { numberRange: { min: -90, max: 90 } } },
          label_font: textOptions.font,
          label_size: textOptions.size,
          label_colour: colourOptions.standard,
          label_line_colour: colourOptions.standard,
          label_line_width: { default: 1, valid: lineOptions.width.valid },
          label_line_type: { default: "10 0", valid: lineOptions.type.valid },
          label_line_max_length: { default: 1000, valid: { numberRange: { min: 0, max: 10000 } } },
          label_marker_show: { default: true },
          label_marker_offset: { default: 5 },
          label_marker_size: { default: 3, valid: { numberRange: { min: 0, max: 100 } } },
          label_marker_colour: colourOptions.standard,
          label_marker_outline_colour: colourOptions.standard
      }
  };
  const settingsPaneGroupings = {
      outliers: {
          "General": ["process_flag_type", "improvement_direction"],
          "Astronomical Points": ["astronomical", "astronomical_limit", "ast_colour_improvement", "ast_colour_deterioration", "ast_colour_neutral_low", "ast_colour_neutral_high"],
          "Shifts": ["shift", "shift_n", "shift_colour_improvement", "shift_colour_deterioration", "shift_colour_neutral_low", "shift_colour_neutral_high"],
          "Trends": ["trend", "trend_n", "trend_colour_improvement", "trend_colour_deterioration", "trend_colour_neutral_low", "trend_colour_neutral_high"],
          "Two-In-Three": ["two_in_three", "two_in_three_highlight_series", "two_in_three_limit", "twointhree_colour_improvement", "twointhree_colour_deterioration", "twointhree_colour_neutral_low", "twointhree_colour_neutral_high"]
      },
      lines: {
          "Main": ["show_main", "width_main", "type_main", "colour_main", "plot_label_show_main", "plot_label_position_main", "plot_label_vpad_main", "plot_label_hpad_main", "plot_label_font_main", "plot_label_size_main", "plot_label_colour_main", "plot_label_prefix_main"],
          "Target": ["show_target", "width_target", "type_target", "colour_target", "ttip_show_target", "ttip_label_target", "plot_label_show_target", "plot_label_position_target", "plot_label_vpad_target", "plot_label_hpad_target", "plot_label_font_target", "plot_label_size_target", "plot_label_colour_target", "plot_label_prefix_target"],
          "Alt. Target": ["show_alt_target", "alt_target", "multiplier_alt_target", "width_alt_target", "type_alt_target", "colour_alt_target", "ttip_show_alt_target", "ttip_label_alt_target", "plot_label_show_alt_target", "plot_label_position_alt_target", "plot_label_vpad_alt_target", "plot_label_hpad_alt_target", "plot_label_font_alt_target", "plot_label_size_alt_target", "plot_label_colour_alt_target", "plot_label_prefix_alt_target"],
          "68% Limits": ["show_68", "width_68", "type_68", "colour_68", "ttip_show_68", "ttip_label_68", "ttip_label_68_prefix_lower", "ttip_label_68_prefix_upper", "plot_label_show_68", "plot_label_position_68", "plot_label_vpad_68", "plot_label_hpad_68", "plot_label_font_68", "plot_label_size_68", "plot_label_colour_68", "plot_label_prefix_68"],
          "95% Limits": ["show_95", "width_95", "type_95", "colour_95", "ttip_show_95", "ttip_label_95", "ttip_label_95_prefix_lower", "ttip_label_95_prefix_upper", "plot_label_show_95", "plot_label_position_95", "plot_label_vpad_95", "plot_label_hpad_95", "plot_label_font_95", "plot_label_size_95", "plot_label_colour_95", "plot_label_prefix_95"],
          "99% Limits": ["show_99", "width_99", "type_99", "colour_99", "ttip_show_99", "ttip_label_99", "ttip_label_99_prefix_lower", "ttip_label_99_prefix_upper", "plot_label_show_99", "plot_label_position_99", "plot_label_vpad_99", "plot_label_hpad_99", "plot_label_font_99", "plot_label_size_99", "plot_label_colour_99", "plot_label_prefix_99"],
          "Specification Limits": ["show_specification", "specification_upper", "specification_lower", "multiplier_specification", "width_specification", "type_specification", "colour_specification", "ttip_show_specification", "ttip_label_specification", "ttip_label_specification_prefix_lower", "ttip_label_specification_prefix_upper", "plot_label_show_specification", "plot_label_position_specification", "plot_label_vpad_specification", "plot_label_hpad_specification", "plot_label_font_specification", "plot_label_size_specification", "plot_label_colour_specification", "plot_label_prefix_specification"]
      },
      x_axis: {
          "Axis": ["xlimit_colour", "xlimit_l", "xlimit_u"],
          "Ticks": ["xlimit_ticks", "xlimit_tick_count", "xlimit_tick_font", "xlimit_tick_size", "xlimit_tick_colour", "xlimit_tick_rotation"],
          "Label": ["xlimit_label", "xlimit_label_font", "xlimit_label_size", "xlimit_label_colour"]
      },
      y_axis: {
          "Axis": ["ylimit_colour", "limit_multiplier", "ylimit_sig_figs", "ylimit_l", "ylimit_u"],
          "Ticks": ["ylimit_ticks", "ylimit_tick_count", "ylimit_tick_font", "ylimit_tick_size", "ylimit_tick_colour", "ylimit_tick_rotation"],
          "Label": ["ylimit_label", "ylimit_label_font", "ylimit_label_size", "ylimit_label_colour"]
      },
      summary_table: {
          "General": ["show_table", "table_variation_filter", "table_assurance_filter", "table_text_overflow", "table_opacity", "table_opacity_unselected", "table_outer_border_style", "table_outer_border_width", "table_outer_border_colour", "table_outer_border_top", "table_outer_border_bottom", "table_outer_border_left", "table_outer_border_right"],
          "Header": ["table_header_font", "table_header_size", "table_header_text_align", "table_header_font_weight", "table_header_text_transform", "table_header_text_padding", "table_header_colour", "table_header_bg_colour", "table_header_border_style", "table_header_border_width", "table_header_border_colour", "table_header_border_bottom", "table_header_border_inner"],
          "Body": ["table_body_font", "table_body_size", "table_body_text_align", "table_body_font_weight", "table_body_text_transform", "table_body_text_padding", "table_body_colour", "table_body_bg_colour", "table_body_border_style", "table_body_border_width", "table_body_border_colour", "table_body_border_top_bottom", "table_body_border_left_right"]
      }
  };

  function rep(x, n) {
      return Array(n).fill(x);
  }

  function getSettingValue(settingObject, settingGroup, settingName, defaultValue) {
      var _a;
      const propertyValue = (_a = settingObject === null || settingObject === void 0 ? void 0 : settingObject[settingGroup]) === null || _a === void 0 ? void 0 : _a[settingName];
      if (isNullOrUndefined(propertyValue)) {
          return defaultValue;
      }
      return (propertyValue === null || propertyValue === void 0 ? void 0 : propertyValue.solid) ? propertyValue.solid.color
          : propertyValue;
  }
  function extractConditionalFormatting(categoricalView, settingGroupName, inputSettings, idxs) {
      if (isNullOrUndefined(categoricalView)) {
          return { values: null, validation: { status: 0, messages: rep(new Array(), 1) } };
      }
      if (isNullOrUndefined(categoricalView.categories)) {
          return { values: null, validation: { status: 0, messages: rep(new Array(), 1) } };
      }
      const inputCategories = categoricalView.categories[0];
      const settingNames = Object.keys(inputSettings[settingGroupName]);
      const validationRtn = JSON.parse(JSON.stringify({ status: 0, messages: rep([], inputCategories.values.length) }));
      const n = idxs.length;
      let rtn = new Array(n);
      for (let i = 0; i < n; i++) {
          const inpObjects = inputCategories.objects ? inputCategories.objects[idxs[i]] : null;
          rtn[i] = Object.fromEntries(settingNames.map(settingName => {
              var _a;
              const defaultSetting = defaultSettings[settingGroupName][settingName]["default"];
              let extractedSetting = getSettingValue(inpObjects, settingGroupName, settingName, defaultSetting);
              extractedSetting = extractedSetting === "" ? defaultSetting : extractedSetting;
              const valid = (_a = defaultSettings[settingGroupName][settingName]) === null || _a === void 0 ? void 0 : _a["valid"];
              if (valid) {
                  let message = "";
                  if (valid instanceof Array && !valid.includes(extractedSetting)) {
                      message = `${extractedSetting} is not a valid value for ${settingName}. Valid values are: ${valid.join(", ")}`;
                  }
                  else if (valid.numberRange && !between(extractedSetting, valid.numberRange.min, valid.numberRange.max)) {
                      message = `${extractedSetting} is not a valid value for ${settingName}. Valid values are between ${valid.numberRange.min} and ${valid.numberRange.max}`;
                  }
                  if (message !== "") {
                      extractedSetting = defaultSettings[settingGroupName][settingName]["default"];
                      validationRtn.messages[i].push(message);
                  }
              }
              return [settingName, extractedSetting];
          }));
      }
      const validationMessages = validationRtn.messages.filter(d => d.length > 0);
      if (!validationRtn.messages.some(d => d.length === 0)) {
          validationRtn.status = 1;
          validationRtn.error = `${validationMessages[0][0]}`;
      }
      return { values: rtn, validation: validationRtn };
  }

  function datePartsToRecord(dateParts) {
      const datePartsRecord = Object.fromEntries(dateParts.filter(part => part.type !== "literal").map(part => [part.type, part.value]));
      ["weekday", "day", "month", "year"].forEach(key => {
          var _a;
          (_a = datePartsRecord[key]) !== null && _a !== void 0 ? _a : (datePartsRecord[key] = "");
      });
      return datePartsRecord;
  }
  function extractKeys(inputView, inputSettings, idxs) {
      var _a, _b, _c;
      const col = inputView.categories.filter(viewColumn => { var _a, _b; return (_b = (_a = viewColumn.source) === null || _a === void 0 ? void 0 : _a.roles) === null || _b === void 0 ? void 0 : _b["key"]; });
      const n_keys = idxs.length;
      let ret = new Array(n_keys);
      if (col.length === 1 && !((_a = col[0].source.type) === null || _a === void 0 ? void 0 : _a.temporal)) {
          for (let i = 0; i < n_keys; i++) {
              ret[i] = isNullOrUndefined(col[0].values[idxs[i]]) ? null : String(col[0].values[idxs[i]]);
          }
          return ret;
      }
      const delim = inputSettings.dates.date_format_delim;
      if (!(col.every(d => { var _a, _b; return (_b = (_a = d.source) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.temporal; }))) {
          const blankKey = rep("", col.length).join(delim);
          for (let i = 0; i < n_keys; i++) {
              const currKey = col.map(keyCol => keyCol.values[idxs[i]]).join(delim);
              ret[i] = currKey === blankKey ? null : currKey;
          }
          return ret;
      }
      const inputDates = parseInputDates(col, idxs);
      const formatter = new Intl.DateTimeFormat(inputSettings.dates.date_format_locale, dateSettingsToFormatOptions(inputSettings.dates));
      let day_elem = inputSettings.dates.date_format_locale === "en-GB" ? "day" : "month";
      let month_elem = inputSettings.dates.date_format_locale === "en-GB" ? "month" : "day";
      for (let i = 0; i < n_keys; i++) {
          if (isNullOrUndefined(inputDates.dates[i])) {
              ret[i] = null;
          }
          const dateParts = datePartsToRecord(formatter.formatToParts(inputDates.dates[i]));
          const datePartStrings = [dateParts.weekday + " " + dateParts[day_elem],
              dateParts[month_elem], (_c = (_b = inputDates.quarters) === null || _b === void 0 ? void 0 : _b[i]) !== null && _c !== void 0 ? _c : "", dateParts.year];
          ret[i] = datePartStrings.filter(d => String(d).trim()).join(delim);
      }
      return ret;
  }
  function extractTooltips(inputView, inputSettings, idxs) {
      const tooltipColumns = inputView.values.filter(viewColumn => viewColumn.source.roles.tooltips);
      const n_keys = idxs.length;
      let ret = new Array(n_keys);
      for (let i = 0; i < n_keys; i++) {
          ret[i] = tooltipColumns.map(viewColumn => {
              var _a;
              const config = { valueType: viewColumn.source.type, dateSettings: inputSettings.dates };
              const tooltipValueFormatted = formatPrimitiveValue((_a = viewColumn === null || viewColumn === void 0 ? void 0 : viewColumn.values) === null || _a === void 0 ? void 0 : _a[idxs[i]], config);
              return {
                  displayName: viewColumn.source.displayName,
                  value: tooltipValueFormatted
              };
          });
      }
      return ret;
  }
  function extractDataColumn(inputView, name, inputSettings, idxs) {
      var _a, _b, _c, _d;
      if (name === "key") {
          return extractKeys(inputView, inputSettings, idxs);
      }
      if (name === "tooltips") {
          return extractTooltips(inputView, inputSettings, idxs);
      }
      const columnRaw = inputView.values.filter(viewColumn => { var _a, _b; return (_b = (_a = viewColumn === null || viewColumn === void 0 ? void 0 : viewColumn.source) === null || _a === void 0 ? void 0 : _a.roles) === null || _b === void 0 ? void 0 : _b[name]; });
      if (columnRaw.length === 0) {
          return null;
      }
      const n_keys = idxs.length;
      if (name === "groupings" || name === "labels") {
          let ret = new Array(n_keys);
          for (let i = 0; i < n_keys; i++) {
              ret[i] = isNullOrUndefined((_b = (_a = columnRaw === null || columnRaw === void 0 ? void 0 : columnRaw[0]) === null || _a === void 0 ? void 0 : _a.values) === null || _b === void 0 ? void 0 : _b[idxs[i]]) ? null : String(columnRaw[0].values[idxs[i]]);
          }
          return ret;
      }
      let ret = new Array(n_keys);
      for (let i = 0; i < n_keys; i++) {
          ret[i] = isNullOrUndefined((_d = (_c = columnRaw === null || columnRaw === void 0 ? void 0 : columnRaw[0]) === null || _c === void 0 ? void 0 : _c.values) === null || _d === void 0 ? void 0 : _d[idxs[i]]) ? null : Number(columnRaw[0].values[idxs[i]]);
      }
      return ret;
  }

  function invalidInputData(inputValidStatus) {
      return {
          limitInputArgs: null,
          spcSettings: null,
          highlights: null,
          anyHighlights: false,
          categories: null,
          groupings: null,
          groupingIndexes: null,
          scatter_formatting: null,
          label_formatting: null,
          tooltips: null,
          labels: null,
          warningMessage: inputValidStatus.error,
          alt_targets: null,
          speclimits_lower: null,
          speclimits_upper: null,
          validationStatus: inputValidStatus
      };
  }
  function extractInputData(inputView, inputSettings, derivedSettings, validationMessages, idxs) {
      var _a, _b, _c, _d, _e, _f;
      const numerators = extractDataColumn(inputView, "numerators", inputSettings, idxs);
      const denominators = extractDataColumn(inputView, "denominators", inputSettings, idxs);
      const xbar_sds = extractDataColumn(inputView, "xbar_sds", inputSettings, idxs);
      const keys = extractDataColumn(inputView, "key", inputSettings, idxs);
      const tooltips = extractDataColumn(inputView, "tooltips", inputSettings, idxs);
      const groupings = extractDataColumn(inputView, "groupings", inputSettings, idxs);
      const labels = extractDataColumn(inputView, "labels", inputSettings, idxs);
      const highlights = idxs.map(d => { var _a, _b, _c; return (_c = (_b = (_a = inputView === null || inputView === void 0 ? void 0 : inputView.values) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.highlights) === null || _c === void 0 ? void 0 : _c[d]; });
      let scatter_cond = (_a = extractConditionalFormatting(inputView, "scatter", inputSettings, idxs)) === null || _a === void 0 ? void 0 : _a.values;
      let labels_cond = (_b = extractConditionalFormatting(inputView, "labels", inputSettings, idxs)) === null || _b === void 0 ? void 0 : _b.values;
      let alt_targets = (_c = extractConditionalFormatting(inputView, "lines", inputSettings, idxs)) === null || _c === void 0 ? void 0 : _c.values.map(d => inputSettings.lines.show_alt_target ? d.alt_target : null);
      let speclimits_lower = (_d = extractConditionalFormatting(inputView, "lines", inputSettings, idxs)) === null || _d === void 0 ? void 0 : _d.values.map(d => d.show_specification ? d.specification_lower : null);
      let speclimits_upper = (_e = extractConditionalFormatting(inputView, "lines", inputSettings, idxs)) === null || _e === void 0 ? void 0 : _e.values.map(d => d.show_specification ? d.specification_upper : null);
      let spcSettings = (_f = extractConditionalFormatting(inputView, "spc", inputSettings, idxs)) === null || _f === void 0 ? void 0 : _f.values;
      const inputValidStatus = validateInputData(keys, numerators, denominators, xbar_sds, derivedSettings.chart_type_props, idxs);
      if (inputValidStatus.status !== 0) {
          return invalidInputData(inputValidStatus);
      }
      const valid_ids = new Array();
      const valid_keys = new Array();
      const removalMessages = new Array();
      const groupVarName = inputView.categories[0].source.displayName;
      const settingsMessages = validationMessages;
      let valid_x = 0;
      idxs.forEach((i, idx) => {
          if (inputValidStatus.messages[idx] === "") {
              valid_ids.push(idx);
              valid_keys.push({ x: valid_x, id: i, label: keys[idx] });
              valid_x += 1;
              if (settingsMessages[i].length > 0) {
                  settingsMessages[i].forEach(setting_removal_message => {
                      removalMessages.push(`Conditional formatting for ${groupVarName} ${keys[idx]} ignored due to: ${setting_removal_message}.`);
                  });
              }
          }
          else {
              removalMessages.push(`${groupVarName} ${keys[idx]} removed due to: ${inputValidStatus.messages[idx]}.`);
          }
      });
      const valid_groupings = extractValues(groupings, valid_ids);
      const groupingIndexes = new Array();
      let current_grouping = valid_groupings[0];
      valid_groupings.forEach((d, idx) => {
          if (d !== current_grouping) {
              groupingIndexes.push(idx - 1);
              current_grouping = d;
          }
      });
      const valid_alt_targets = extractValues(alt_targets, valid_ids);
      if (inputSettings.nhs_icons.show_assurance_icons) {
          const alt_targets_length = valid_alt_targets === null || valid_alt_targets === void 0 ? void 0 : valid_alt_targets.length;
          if (alt_targets_length > 0) {
              const last_target = valid_alt_targets === null || valid_alt_targets === void 0 ? void 0 : valid_alt_targets[alt_targets_length - 1];
              if (isNullOrUndefined(last_target)) {
                  removalMessages.push("NHS Assurance icon requires a valid alt. target at last observation.");
              }
          }
          if (!derivedSettings.chart_type_props.has_control_limits) {
              removalMessages.push("NHS Assurance icon requires chart with control limits.");
          }
      }
      const curr_highlights = extractValues(highlights, valid_ids);
      const num_points_subset = spcSettings[0].num_points_subset;
      let subset_points;
      if (isNullOrUndefined(num_points_subset) || !between(num_points_subset, 1, valid_ids.length)) {
          subset_points = seq(0, valid_ids.length - 1);
      }
      else {
          if (spcSettings[0].subset_points_from === "Start") {
              subset_points = seq(0, spcSettings[0].num_points_subset - 1);
          }
          else {
              subset_points = seq(valid_ids.length - spcSettings[0].num_points_subset, valid_ids.length - 1);
          }
      }
      return {
          limitInputArgs: {
              keys: valid_keys,
              numerators: extractValues(numerators, valid_ids),
              denominators: extractValues(denominators, valid_ids),
              xbar_sds: extractValues(xbar_sds, valid_ids),
              outliers_in_limits: spcSettings[0].outliers_in_limits,
              subset_points: subset_points
          },
          spcSettings: spcSettings[0],
          tooltips: extractValues(tooltips, valid_ids),
          labels: extractValues(labels, valid_ids),
          highlights: curr_highlights,
          anyHighlights: curr_highlights.filter(d => !isNullOrUndefined(d)).length > 0,
          categories: inputView.categories[0],
          groupings: valid_groupings,
          groupingIndexes: groupingIndexes,
          scatter_formatting: extractValues(scatter_cond, valid_ids),
          label_formatting: extractValues(labels_cond, valid_ids),
          warningMessage: removalMessages.length > 0 ? removalMessages.join("\n") : "",
          alt_targets: valid_alt_targets,
          speclimits_lower: extractValues(speclimits_lower, valid_ids),
          speclimits_upper: extractValues(speclimits_upper, valid_ids),
          validationStatus: inputValidStatus
      };
  }

  function extractValues(valuesArray, indexArray) {
      if (valuesArray) {
          return valuesArray.filter((_, idx) => indexArray.indexOf(idx) != -1);
      }
      else {
          return [];
      }
  }

  const lineNameMap = {
      "ll99": "99",
      "ll95": "95",
      "ll68": "68",
      "ul68": "68",
      "ul95": "95",
      "ul99": "99",
      "targets": "target",
      "values": "main",
      "alt_targets": "alt_target",
      "speclimits_lower": "specification",
      "speclimits_upper": "specification"
  };
  function getAesthetic(type, group, aesthetic, inputSettings) {
      const mapName = group.includes("line") ? lineNameMap[type] : type;
      const settingName = aesthetic + "_" + mapName;
      return inputSettings[group][settingName];
  }

  const truncate = broadcastBinary((val, limits) => {
      let rtn = val;
      if (limits.lower || limits.lower == 0) {
          rtn = (rtn < limits.lower ? limits.lower : rtn);
      }
      if (limits.upper) {
          rtn = (rtn > limits.upper ? limits.upper : rtn);
      }
      return rtn;
  });

  function variationIconsToDraw(outliers, inputSettings) {
      const imp_direction = inputSettings.outliers.improvement_direction;
      const suffix_map = {
          "increase": "High",
          "decrease": "Low",
          "neutral": ""
      };
      const invert_suffix_map = {
          "High": "Low",
          "Low": "High",
          "": ""
      };
      const suffix = suffix_map[imp_direction];
      const flag_last = inputSettings.nhs_icons.flag_last_point;
      let allFlags;
      if (flag_last) {
          const N = outliers.astpoint.length - 1;
          allFlags = [outliers.astpoint[N], outliers.shift[N], outliers.trend[N], outliers.two_in_three[N]];
      }
      else {
          allFlags = outliers.astpoint.concat(outliers.shift, outliers.trend, outliers.two_in_three);
      }
      const iconsPresent = new Array();
      if (allFlags.includes("improvement")) {
          iconsPresent.push("improvement" + suffix);
      }
      if (allFlags.includes("deterioration")) {
          iconsPresent.push("concern" + invert_suffix_map[suffix]);
      }
      if (allFlags.includes("neutral_low")) {
          iconsPresent.push("neutralLow");
      }
      if (allFlags.includes("neutral_high")) {
          iconsPresent.push("neutralHigh");
      }
      if (iconsPresent.length === 0) {
          iconsPresent.push("commonCause");
      }
      return iconsPresent;
  }

  function validateDataView(inputDV, inputSettingsClass) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
      if (!(inputDV === null || inputDV === void 0 ? void 0 : inputDV[0])) {
          return "No data present";
      }
      if (!((_b = (_a = inputDV[0]) === null || _a === void 0 ? void 0 : _a.categorical) === null || _b === void 0 ? void 0 : _b.categories) || !((_d = (_c = inputDV[0]) === null || _c === void 0 ? void 0 : _c.categorical) === null || _d === void 0 ? void 0 : _d.categories.some(d => { var _a, _b; return (_b = (_a = d.source) === null || _a === void 0 ? void 0 : _a.roles) === null || _b === void 0 ? void 0 : _b.key; }))) {
          return "No grouping/ID variable passed!";
      }
      const numeratorsPresent = (_f = (_e = inputDV[0].categorical) === null || _e === void 0 ? void 0 : _e.values) === null || _f === void 0 ? void 0 : _f.some(d => { var _a, _b; return (_b = (_a = d.source) === null || _a === void 0 ? void 0 : _a.roles) === null || _b === void 0 ? void 0 : _b.numerators; });
      if (!numeratorsPresent) {
          return "No Numerators passed!";
      }
      let needs_denominator;
      let needs_sd;
      let chart_type;
      if (inputSettingsClass === null || inputSettingsClass === void 0 ? void 0 : inputSettingsClass.derivedSettingsGrouped) {
          inputSettingsClass === null || inputSettingsClass === void 0 ? void 0 : inputSettingsClass.derivedSettingsGrouped.forEach((d) => {
              if (d.chart_type_props.needs_denominator) {
                  chart_type = d.chart_type_props.name;
                  needs_denominator = true;
              }
              if (d.chart_type_props.needs_sd) {
                  chart_type = d.chart_type_props.name;
                  needs_sd = true;
              }
          });
      }
      else {
          chart_type = inputSettingsClass.settings.spc.chart_type;
          needs_denominator = inputSettingsClass.derivedSettings.chart_type_props.needs_denominator;
          needs_sd = inputSettingsClass.derivedSettings.chart_type_props.needs_sd;
      }
      if (needs_denominator) {
          const denominatorsPresent = (_h = (_g = inputDV[0].categorical) === null || _g === void 0 ? void 0 : _g.values) === null || _h === void 0 ? void 0 : _h.some(d => { var _a, _b; return (_b = (_a = d.source) === null || _a === void 0 ? void 0 : _a.roles) === null || _b === void 0 ? void 0 : _b.denominators; });
          if (!denominatorsPresent) {
              return `Chart type '${chart_type}' requires denominators!`;
          }
      }
      if (needs_sd) {
          const xbarSDPresent = (_k = (_j = inputDV[0].categorical) === null || _j === void 0 ? void 0 : _j.values) === null || _k === void 0 ? void 0 : _k.some(d => { var _a, _b; return (_b = (_a = d.source) === null || _a === void 0 ? void 0 : _a.roles) === null || _b === void 0 ? void 0 : _b.xbar_sds; });
          if (!xbarSDPresent) {
              return `Chart type '${chart_type}' requires SDs!`;
          }
      }
      return "valid";
  }

  function validateInputDataImpl(key, numerator, denominator, xbar_sd, chart_type_props, check_denom) {
      const rtn = { message: "", type: 0 };
      if (isNullOrUndefined(key)) {
          rtn.message = "Date missing";
          rtn.type = 2;
      }
      else if (isNullOrUndefined(numerator)) {
          rtn.message = "Numerator missing";
          rtn.type = 3;
      }
      else if (chart_type_props.numerator_non_negative && numerator < 0) {
          rtn.message = "Numerator negative";
          rtn.type = 4;
      }
      else if (check_denom) {
          if (isNullOrUndefined(denominator)) {
              rtn.message = "Denominator missing";
              rtn.type = 5;
          }
          else if (denominator < 0) {
              rtn.message = "Denominator negative";
              rtn.type = 6;
          }
          else if (chart_type_props.numerator_leq_denominator && denominator < numerator) {
              rtn.message = "Denominator < numerator";
              rtn.type = 7;
          }
      }
      else if (chart_type_props.needs_sd) {
          if (isNullOrUndefined(xbar_sd)) {
              rtn.message = "SD missing";
              rtn.type = 8;
          }
          else if (xbar_sd < 0) {
              rtn.message = "SD negative";
              rtn.type = 9;
          }
      }
      return rtn;
  }
  function validateInputData(keys, numerators, denominators, xbar_sds, chart_type_props, idxs) {
      let allSameType = false;
      let messages = new Array();
      let all_status = new Array();
      const check_denom = chart_type_props.needs_denominator
          || (chart_type_props.denominator_optional && !isNullOrUndefined(denominators) && denominators.length > 0);
      const n = idxs.length;
      for (let i = 0; i < n; i++) {
          const validation = validateInputDataImpl(keys[i], numerators === null || numerators === void 0 ? void 0 : numerators[i], denominators === null || denominators === void 0 ? void 0 : denominators[i], xbar_sds === null || xbar_sds === void 0 ? void 0 : xbar_sds[i], chart_type_props, check_denom);
          messages.push(validation.message);
          all_status.push(validation.type);
      }
      let allSameTypeSet = new Set(all_status);
      allSameType = allSameTypeSet.size === 1;
      let commonType = Array.from(allSameTypeSet)[0];
      let validationRtn = {
          status: (allSameType && commonType !== 0) ? 1 : 0,
          messages: messages
      };
      if (allSameType && commonType !== 0) {
          switch (commonType) {
              case 1: {
                  validationRtn.error = "Grouping missing";
                  break;
              }
              case 2: {
                  validationRtn.error = "All dates/IDs are missing or null!";
                  break;
              }
              case 3: {
                  validationRtn.error = "All numerators are missing or null!";
                  break;
              }
              case 4: {
                  validationRtn.error = "All numerators are negative!";
                  break;
              }
              case 5: {
                  validationRtn.error = "All denominators missing or null!";
                  break;
              }
              case 6: {
                  validationRtn.error = "All denominators are negative!";
                  break;
              }
              case 7: {
                  validationRtn.error = "All denominators are smaller than numerators!";
                  break;
              }
              case 8: {
                  validationRtn.error = "All SDs missing or null!";
                  break;
              }
              case 9: {
                  validationRtn.error = "All SDs are negative!";
                  break;
              }
          }
      }
      return validationRtn;
  }

  const formatPrimitiveValue = broadcastBinary((rawValue, config) => {
      if (isNullOrUndefined(rawValue)) {
          return null;
      }
      if (config.valueType.numeric) {
          return rawValue.toString();
      }
      else {
          return rawValue;
      }
  });

  const weekdayDateMap = {
      "DD": null,
      "Thurs DD": "short",
      "Thursday DD": "long",
      "(blank)": null
  };
  const monthDateMap = {
      "MM": "2-digit",
      "Mon": "short",
      "Month": "long",
      "(blank)": null
  };
  const yearDateMap = {
      "YYYY": "numeric",
      "YY": "2-digit",
      "(blank)": null
  };
  const dayDateMap = {
      "DD": "2-digit",
      "Thurs DD": "2-digit",
      "Thursday DD": "2-digit",
      "(blank)": null
  };
  const dateOptionsLookup = {
      "weekday": weekdayDateMap,
      "day": dayDateMap,
      "month": monthDateMap,
      "year": yearDateMap
  };
  function dateSettingsToFormatOptions(date_settings) {
      const formatOpts = new Array();
      Object.keys(date_settings).forEach((key) => {
          if (key !== "date_format_locale" && key !== "date_format_delim") {
              const formattedKey = key.replace("date_format_", "");
              const lookup = dateOptionsLookup[formattedKey];
              const val = lookup[date_settings[key]];
              if (!isNullOrUndefined(val)) {
                  formatOpts.push([formattedKey, val]);
                  if (formattedKey === "day" && date_settings[key] !== "DD") {
                      formatOpts.push(["weekday", weekdayDateMap[date_settings[key]]]);
                  }
              }
          }
      });
      return Object.fromEntries(formatOpts);
  }

  /*
   *  Power BI Visualizations
   *
   *  Copyright (c) Microsoft Corporation
   *  All rights reserved.
   *  MIT License
   *
   *  Permission is hereby granted, free of charge, to any person obtaining a copy
   *  of this software and associated documentation files (the ""Software""), to deal
   *  in the Software without restriction, including without limitation the rights
   *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   *  copies of the Software, and to permit persons to whom the Software is
   *  furnished to do so, subject to the following conditions:
   *
   *  The above copyright notice and this permission notice shall be included in
   *  all copies or substantial portions of the Software.
   *
   *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   *  THE SOFTWARE.
   */
  // NOTE: this file includes standalone utilities that should have no dependencies on external libraries, including jQuery.
  /**
   * Extensions for Enumerations.
   */
  /**
   * Gets a value indicating whether the value has the bit flags set.
   */
  function hasFlag(value, flag) {
      return (value & flag) === flag;
  }

  /*
   *  Power BI Visualizations
   *
   *  Copyright (c) Microsoft Corporation
   *  All rights reserved.
   *  MIT License
   *
   *  Permission is hereby granted, free of charge, to any person obtaining a copy
   *  of this software and associated documentation files (the ""Software""), to deal
   *  in the Software without restriction, including without limitation the rights
   *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   *  copies of the Software, and to permit persons to whom the Software is
   *  furnished to do so, subject to the following conditions:
   *
   *  The above copyright notice and this permission notice shall be included in
   *  all copies or substantial portions of the Software.
   *
   *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   *  THE SOFTWARE.
   */
  // NOTE: this file includes standalone utilities that should have no dependencies on external libraries, including jQuery.
  /**
   * Performs JSON-style comparison of two objects.
   */
  function equals(x, y) {
      if (x === y)
          return true;
      return JSON.stringify(x) === JSON.stringify(y);
  }

  /*
   *  Power BI Visualizations
   *
   *  Copyright (c) Microsoft Corporation
   *  All rights reserved.
   *  MIT License
   *
   *  Permission is hereby granted, free of charge, to any person obtaining a copy
   *  of this software and associated documentation files (the ""Software""), to deal
   *  in the Software without restriction, including without limitation the rights
   *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   *  copies of the Software, and to permit persons to whom the Software is
   *  furnished to do so, subject to the following conditions:
   *
   *  The above copyright notice and this permission notice shall be included in
   *  all copies or substantial portions of the Software.
   *
   *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   *  THE SOFTWARE.
   */
  // powerbi.extensibility.utils.type
  /** Describes a data value type, including a primitive type and extended type if any (derived from data category). */
  class ValueType {
      /** Do not call the ValueType constructor directly. Use the ValueType.fromXXX methods. */
      constructor(underlyingType, category, enumType, variantTypes) {
          this.underlyingType = underlyingType;
          this.category = category;
          if (hasFlag(underlyingType, ExtendedType.Temporal)) {
              this.temporalType = new TemporalType(underlyingType);
          }
          if (hasFlag(underlyingType, ExtendedType.Geography)) {
              this.geographyType = new GeographyType(underlyingType);
          }
          if (hasFlag(underlyingType, ExtendedType.Miscellaneous)) {
              this.miscType = new MiscellaneousType(underlyingType);
          }
          if (hasFlag(underlyingType, ExtendedType.Formatting)) {
              this.formattingType = new FormattingType(underlyingType);
          }
          if (hasFlag(underlyingType, ExtendedType.Enumeration)) {
              this.enumType = enumType;
          }
          if (hasFlag(underlyingType, ExtendedType.Scripting)) {
              this.scriptingType = new ScriptType(underlyingType);
          }
          if (hasFlag(underlyingType, ExtendedType.Variant)) {
              this.variationTypes = variantTypes;
          }
      }
      /** Creates or retrieves a ValueType object based on the specified ValueTypeDescriptor. */
      static fromDescriptor(descriptor) {
          descriptor = descriptor || {};
          // Simplified primitive types
          if (descriptor.text)
              return ValueType.fromExtendedType(ExtendedType.Text);
          if (descriptor.integer)
              return ValueType.fromExtendedType(ExtendedType.Integer);
          if (descriptor.numeric)
              return ValueType.fromExtendedType(ExtendedType.Double);
          if (descriptor.bool)
              return ValueType.fromExtendedType(ExtendedType.Boolean);
          if (descriptor.dateTime)
              return ValueType.fromExtendedType(ExtendedType.DateTime);
          if (descriptor.duration)
              return ValueType.fromExtendedType(ExtendedType.Duration);
          if (descriptor.binary)
              return ValueType.fromExtendedType(ExtendedType.Binary);
          if (descriptor.none)
              return ValueType.fromExtendedType(ExtendedType.None);
          // Extended types
          if (descriptor.scripting) {
              if (descriptor.scripting.source)
                  return ValueType.fromExtendedType(ExtendedType.ScriptSource);
          }
          if (descriptor.enumeration)
              return ValueType.fromEnum(descriptor.enumeration);
          if (descriptor.temporal) {
              if (descriptor.temporal.year)
                  return ValueType.fromExtendedType(ExtendedType.Years_Integer);
              if (descriptor.temporal.quarter)
                  return ValueType.fromExtendedType(ExtendedType.Quarters_Integer);
              if (descriptor.temporal.month)
                  return ValueType.fromExtendedType(ExtendedType.Months_Integer);
              if (descriptor.temporal.day)
                  return ValueType.fromExtendedType(ExtendedType.DayOfMonth_Integer);
              if (descriptor.temporal.paddedDateTableDate)
                  return ValueType.fromExtendedType(ExtendedType.PaddedDateTableDates);
          }
          if (descriptor.geography) {
              if (descriptor.geography.address)
                  return ValueType.fromExtendedType(ExtendedType.Address);
              if (descriptor.geography.city)
                  return ValueType.fromExtendedType(ExtendedType.City);
              if (descriptor.geography.continent)
                  return ValueType.fromExtendedType(ExtendedType.Continent);
              if (descriptor.geography.country)
                  return ValueType.fromExtendedType(ExtendedType.Country);
              if (descriptor.geography.county)
                  return ValueType.fromExtendedType(ExtendedType.County);
              if (descriptor.geography.region)
                  return ValueType.fromExtendedType(ExtendedType.Region);
              if (descriptor.geography.postalCode)
                  return ValueType.fromExtendedType(ExtendedType.PostalCode_Text);
              if (descriptor.geography.stateOrProvince)
                  return ValueType.fromExtendedType(ExtendedType.StateOrProvince);
              if (descriptor.geography.place)
                  return ValueType.fromExtendedType(ExtendedType.Place);
              if (descriptor.geography.latitude)
                  return ValueType.fromExtendedType(ExtendedType.Latitude_Double);
              if (descriptor.geography.longitude)
                  return ValueType.fromExtendedType(ExtendedType.Longitude_Double);
          }
          if (descriptor.misc) {
              if (descriptor.misc.image)
                  return ValueType.fromExtendedType(ExtendedType.Image);
              if (descriptor.misc.imageUrl)
                  return ValueType.fromExtendedType(ExtendedType.ImageUrl);
              if (descriptor.misc.webUrl)
                  return ValueType.fromExtendedType(ExtendedType.WebUrl);
              if (descriptor.misc.barcode)
                  return ValueType.fromExtendedType(ExtendedType.Barcode_Text);
          }
          if (descriptor.formatting) {
              if (descriptor.formatting.color)
                  return ValueType.fromExtendedType(ExtendedType.Color);
              if (descriptor.formatting.formatString)
                  return ValueType.fromExtendedType(ExtendedType.FormatString);
              if (descriptor.formatting.alignment)
                  return ValueType.fromExtendedType(ExtendedType.Alignment);
              if (descriptor.formatting.labelDisplayUnits)
                  return ValueType.fromExtendedType(ExtendedType.LabelDisplayUnits);
              if (descriptor.formatting.fontSize)
                  return ValueType.fromExtendedType(ExtendedType.FontSize);
              if (descriptor.formatting.labelDensity)
                  return ValueType.fromExtendedType(ExtendedType.LabelDensity);
          }
          if (descriptor.extendedType) {
              return ValueType.fromExtendedType(descriptor.extendedType);
          }
          if (descriptor.operations) {
              if (descriptor.operations.searchEnabled)
                  return ValueType.fromExtendedType(ExtendedType.SearchEnabled);
          }
          if (descriptor.variant) {
              const variantTypes = descriptor.variant.map((variantType) => ValueType.fromDescriptor(variantType));
              return ValueType.fromVariant(variantTypes);
          }
          return ValueType.fromExtendedType(ExtendedType.Null);
      }
      /** Advanced: Generally use fromDescriptor instead. Creates or retrieves a ValueType object for the specified ExtendedType. */
      static fromExtendedType(extendedType) {
          extendedType = extendedType || ExtendedType.Null;
          const primitiveType = getPrimitiveType(extendedType), category = getCategoryFromExtendedType(extendedType);
          return ValueType.fromPrimitiveTypeAndCategory(primitiveType, category);
      }
      /** Creates or retrieves a ValueType object for the specified PrimitiveType and data category. */
      static fromPrimitiveTypeAndCategory(primitiveType, category) {
          primitiveType = primitiveType || PrimitiveType.Null;
          category = category || null;
          let id = primitiveType.toString();
          if (category)
              id += "|" + category;
          return ValueType.typeCache[id] || (ValueType.typeCache[id] = new ValueType(toExtendedType(primitiveType, category), category));
      }
      /** Creates a ValueType to describe the given IEnumType. */
      static fromEnum(enumType) {
          return new ValueType(ExtendedType.Enumeration, null, enumType);
      }
      /** Creates a ValueType to describe the given Variant type. */
      static fromVariant(variantTypes) {
          return new ValueType(ExtendedType.Variant, /* category */ null, /* enumType */ null, variantTypes);
      }
      /** Determines if the specified type is compatible from at least one of the otherTypes. */
      static isCompatibleTo(typeDescriptor, otherTypes) {
          const valueType = ValueType.fromDescriptor(typeDescriptor);
          for (const otherType of otherTypes) {
              const otherValueType = ValueType.fromDescriptor(otherType);
              if (otherValueType.isCompatibleFrom(valueType))
                  return true;
          }
          return false;
      }
      /** Determines if the instance ValueType is convertable from the 'other' ValueType. */
      isCompatibleFrom(other) {
          const otherPrimitiveType = other.primitiveType;
          if (this === other ||
              this.primitiveType === otherPrimitiveType ||
              otherPrimitiveType === PrimitiveType.Null ||
              // Return true if both types are numbers
              (this.numeric && other.numeric))
              return true;
          return false;
      }
      /**
       * Determines if the instance ValueType is equal to the 'other' ValueType
       * @param {ValueType} other the other ValueType to check equality against
       * @returns True if the instance ValueType is equal to the 'other' ValueType
       */
      equals(other) {
          return equals(this, other);
      }
      /** Gets the exact primitive type of this ValueType. */
      get primitiveType() {
          return getPrimitiveType(this.underlyingType);
      }
      /** Gets the exact extended type of this ValueType. */
      get extendedType() {
          return this.underlyingType;
      }
      /** Gets the data category string (if any) for this ValueType. */
      get categoryString() {
          return this.category;
      }
      // Simplified primitive types
      /** Indicates whether the type represents text values. */
      get text() {
          return this.primitiveType === PrimitiveType.Text;
      }
      /** Indicates whether the type represents any numeric value. */
      get numeric() {
          return hasFlag(this.underlyingType, ExtendedType.Numeric);
      }
      /** Indicates whether the type represents integer numeric values. */
      get integer() {
          return this.primitiveType === PrimitiveType.Integer;
      }
      /** Indicates whether the type represents Boolean values. */
      get bool() {
          return this.primitiveType === PrimitiveType.Boolean;
      }
      /** Indicates whether the type represents any date/time values. */
      get dateTime() {
          return this.primitiveType === PrimitiveType.DateTime ||
              this.primitiveType === PrimitiveType.Date ||
              this.primitiveType === PrimitiveType.Time;
      }
      /** Indicates whether the type represents duration values. */
      get duration() {
          return this.primitiveType === PrimitiveType.Duration;
      }
      /** Indicates whether the type represents binary values. */
      get binary() {
          return this.primitiveType === PrimitiveType.Binary;
      }
      /** Indicates whether the type represents none values. */
      get none() {
          return this.primitiveType === PrimitiveType.None;
      }
      // Extended types
      /** Returns an object describing temporal values represented by the type, if it represents a temporal type. */
      get temporal() {
          return this.temporalType;
      }
      /** Returns an object describing geographic values represented by the type, if it represents a geographic type. */
      get geography() {
          return this.geographyType;
      }
      /** Returns an object describing the specific values represented by the type, if it represents a miscellaneous extended type. */
      get misc() {
          return this.miscType;
      }
      /** Returns an object describing the formatting values represented by the type, if it represents a formatting type. */
      get formatting() {
          return this.formattingType;
      }
      /** Returns an object describing the enum values represented by the type, if it represents an enumeration type. */
      get enumeration() {
          return this.enumType;
      }
      get scripting() {
          return this.scriptingType;
      }
      /** Returns an array describing the variant values represented by the type, if it represents an Variant type. */
      get variant() {
          return this.variationTypes;
      }
  }
  ValueType.typeCache = {};
  class ScriptType {
      constructor(underlyingType) {
          this.underlyingType = underlyingType;
      }
      get source() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.ScriptSource);
      }
  }
  class TemporalType {
      constructor(underlyingType) {
          this.underlyingType = underlyingType;
      }
      get year() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Years);
      }
      get quarter() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Quarters);
      }
      get month() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Months);
      }
      get day() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.DayOfMonth);
      }
      get paddedDateTableDate() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.PaddedDateTableDates);
      }
  }
  class GeographyType {
      constructor(underlyingType) {
          this.underlyingType = underlyingType;
      }
      get address() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Address);
      }
      get city() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.City);
      }
      get continent() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Continent);
      }
      get country() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Country);
      }
      get county() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.County);
      }
      get region() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Region);
      }
      get postalCode() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.PostalCode);
      }
      get stateOrProvince() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.StateOrProvince);
      }
      get place() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Place);
      }
      get latitude() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Latitude);
      }
      get longitude() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Longitude);
      }
  }
  class MiscellaneousType {
      constructor(underlyingType) {
          this.underlyingType = underlyingType;
      }
      get image() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Image);
      }
      get imageUrl() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.ImageUrl);
      }
      get webUrl() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.WebUrl);
      }
      get barcode() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Barcode);
      }
  }
  class FormattingType {
      constructor(underlyingType) {
          this.underlyingType = underlyingType;
      }
      get color() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Color);
      }
      get formatString() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.FormatString);
      }
      get alignment() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.Alignment);
      }
      get labelDisplayUnits() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.LabelDisplayUnits);
      }
      get fontSize() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.FontSize);
      }
      get labelDensity() {
          return matchesExtendedTypeWithAnyPrimitive(this.underlyingType, ExtendedType.LabelDensity);
      }
  }
  /** Defines primitive value types. Must be consistent with types defined by server conceptual schema. */
  var PrimitiveType;
  (function (PrimitiveType) {
      PrimitiveType[PrimitiveType["Null"] = 0] = "Null";
      PrimitiveType[PrimitiveType["Text"] = 1] = "Text";
      PrimitiveType[PrimitiveType["Decimal"] = 2] = "Decimal";
      PrimitiveType[PrimitiveType["Double"] = 3] = "Double";
      PrimitiveType[PrimitiveType["Integer"] = 4] = "Integer";
      PrimitiveType[PrimitiveType["Boolean"] = 5] = "Boolean";
      PrimitiveType[PrimitiveType["Date"] = 6] = "Date";
      PrimitiveType[PrimitiveType["DateTime"] = 7] = "DateTime";
      PrimitiveType[PrimitiveType["DateTimeZone"] = 8] = "DateTimeZone";
      PrimitiveType[PrimitiveType["Time"] = 9] = "Time";
      PrimitiveType[PrimitiveType["Duration"] = 10] = "Duration";
      PrimitiveType[PrimitiveType["Binary"] = 11] = "Binary";
      PrimitiveType[PrimitiveType["None"] = 12] = "None";
      PrimitiveType[PrimitiveType["Variant"] = 13] = "Variant";
  })(PrimitiveType || (PrimitiveType = {}));
  var PrimitiveTypeStrings;
  (function (PrimitiveTypeStrings) {
      PrimitiveTypeStrings[PrimitiveTypeStrings["Null"] = 0] = "Null";
      PrimitiveTypeStrings[PrimitiveTypeStrings["Text"] = 1] = "Text";
      PrimitiveTypeStrings[PrimitiveTypeStrings["Decimal"] = 2] = "Decimal";
      PrimitiveTypeStrings[PrimitiveTypeStrings["Double"] = 3] = "Double";
      PrimitiveTypeStrings[PrimitiveTypeStrings["Integer"] = 4] = "Integer";
      PrimitiveTypeStrings[PrimitiveTypeStrings["Boolean"] = 5] = "Boolean";
      PrimitiveTypeStrings[PrimitiveTypeStrings["Date"] = 6] = "Date";
      PrimitiveTypeStrings[PrimitiveTypeStrings["DateTime"] = 7] = "DateTime";
      PrimitiveTypeStrings[PrimitiveTypeStrings["DateTimeZone"] = 8] = "DateTimeZone";
      PrimitiveTypeStrings[PrimitiveTypeStrings["Time"] = 9] = "Time";
      PrimitiveTypeStrings[PrimitiveTypeStrings["Duration"] = 10] = "Duration";
      PrimitiveTypeStrings[PrimitiveTypeStrings["Binary"] = 11] = "Binary";
      PrimitiveTypeStrings[PrimitiveTypeStrings["None"] = 12] = "None";
      PrimitiveTypeStrings[PrimitiveTypeStrings["Variant"] = 13] = "Variant";
  })(PrimitiveTypeStrings || (PrimitiveTypeStrings = {}));
  /** Defines extended value types, which include primitive types and known data categories constrained to expected primitive types. */
  var ExtendedType;
  (function (ExtendedType) {
      // Flags (1 << 8-15 range [0xFF00])
      // Important: Enum members must be declared before they are used in TypeScript.
      ExtendedType[ExtendedType["Numeric"] = 256] = "Numeric";
      ExtendedType[ExtendedType["Temporal"] = 512] = "Temporal";
      ExtendedType[ExtendedType["Geography"] = 1024] = "Geography";
      ExtendedType[ExtendedType["Miscellaneous"] = 2048] = "Miscellaneous";
      ExtendedType[ExtendedType["Formatting"] = 4096] = "Formatting";
      ExtendedType[ExtendedType["Scripting"] = 8192] = "Scripting";
      // Primitive types (0-255 range [0xFF] | flags)
      // The member names and base values must match those in PrimitiveType.
      ExtendedType[ExtendedType["Null"] = 0] = "Null";
      ExtendedType[ExtendedType["Text"] = 1] = "Text";
      ExtendedType[ExtendedType["Decimal"] = 258] = "Decimal";
      ExtendedType[ExtendedType["Double"] = 259] = "Double";
      ExtendedType[ExtendedType["Integer"] = 260] = "Integer";
      ExtendedType[ExtendedType["Boolean"] = 5] = "Boolean";
      ExtendedType[ExtendedType["Date"] = 518] = "Date";
      ExtendedType[ExtendedType["DateTime"] = 519] = "DateTime";
      ExtendedType[ExtendedType["DateTimeZone"] = 520] = "DateTimeZone";
      ExtendedType[ExtendedType["Time"] = 521] = "Time";
      ExtendedType[ExtendedType["Duration"] = 10] = "Duration";
      ExtendedType[ExtendedType["Binary"] = 11] = "Binary";
      ExtendedType[ExtendedType["None"] = 12] = "None";
      ExtendedType[ExtendedType["Variant"] = 13] = "Variant";
      // Extended types (0-32767 << 16 range [0xFFFF0000] | corresponding primitive type | flags)
      // Temporal
      ExtendedType[ExtendedType["Years"] = 66048] = "Years";
      ExtendedType[ExtendedType["Years_Text"] = 66049] = "Years_Text";
      ExtendedType[ExtendedType["Years_Integer"] = 66308] = "Years_Integer";
      ExtendedType[ExtendedType["Years_Date"] = 66054] = "Years_Date";
      ExtendedType[ExtendedType["Years_DateTime"] = 66055] = "Years_DateTime";
      ExtendedType[ExtendedType["Months"] = 131584] = "Months";
      ExtendedType[ExtendedType["Months_Text"] = 131585] = "Months_Text";
      ExtendedType[ExtendedType["Months_Integer"] = 131844] = "Months_Integer";
      ExtendedType[ExtendedType["Months_Date"] = 131590] = "Months_Date";
      ExtendedType[ExtendedType["Months_DateTime"] = 131591] = "Months_DateTime";
      ExtendedType[ExtendedType["PaddedDateTableDates"] = 197127] = "PaddedDateTableDates";
      ExtendedType[ExtendedType["Quarters"] = 262656] = "Quarters";
      ExtendedType[ExtendedType["Quarters_Text"] = 262657] = "Quarters_Text";
      ExtendedType[ExtendedType["Quarters_Integer"] = 262916] = "Quarters_Integer";
      ExtendedType[ExtendedType["Quarters_Date"] = 262662] = "Quarters_Date";
      ExtendedType[ExtendedType["Quarters_DateTime"] = 262663] = "Quarters_DateTime";
      ExtendedType[ExtendedType["DayOfMonth"] = 328192] = "DayOfMonth";
      ExtendedType[ExtendedType["DayOfMonth_Text"] = 328193] = "DayOfMonth_Text";
      ExtendedType[ExtendedType["DayOfMonth_Integer"] = 328452] = "DayOfMonth_Integer";
      ExtendedType[ExtendedType["DayOfMonth_Date"] = 328198] = "DayOfMonth_Date";
      ExtendedType[ExtendedType["DayOfMonth_DateTime"] = 328199] = "DayOfMonth_DateTime";
      // Geography
      ExtendedType[ExtendedType["Address"] = 6554625] = "Address";
      ExtendedType[ExtendedType["City"] = 6620161] = "City";
      ExtendedType[ExtendedType["Continent"] = 6685697] = "Continent";
      ExtendedType[ExtendedType["Country"] = 6751233] = "Country";
      ExtendedType[ExtendedType["County"] = 6816769] = "County";
      ExtendedType[ExtendedType["Region"] = 6882305] = "Region";
      ExtendedType[ExtendedType["PostalCode"] = 6947840] = "PostalCode";
      ExtendedType[ExtendedType["PostalCode_Text"] = 6947841] = "PostalCode_Text";
      ExtendedType[ExtendedType["PostalCode_Integer"] = 6948100] = "PostalCode_Integer";
      ExtendedType[ExtendedType["StateOrProvince"] = 7013377] = "StateOrProvince";
      ExtendedType[ExtendedType["Place"] = 7078913] = "Place";
      ExtendedType[ExtendedType["Latitude"] = 7144448] = "Latitude";
      ExtendedType[ExtendedType["Latitude_Decimal"] = 7144706] = "Latitude_Decimal";
      ExtendedType[ExtendedType["Latitude_Double"] = 7144707] = "Latitude_Double";
      ExtendedType[ExtendedType["Longitude"] = 7209984] = "Longitude";
      ExtendedType[ExtendedType["Longitude_Decimal"] = 7210242] = "Longitude_Decimal";
      ExtendedType[ExtendedType["Longitude_Double"] = 7210243] = "Longitude_Double";
      // Miscellaneous
      ExtendedType[ExtendedType["Image"] = 13109259] = "Image";
      ExtendedType[ExtendedType["ImageUrl"] = 13174785] = "ImageUrl";
      ExtendedType[ExtendedType["WebUrl"] = 13240321] = "WebUrl";
      ExtendedType[ExtendedType["Barcode"] = 13305856] = "Barcode";
      ExtendedType[ExtendedType["Barcode_Text"] = 13305857] = "Barcode_Text";
      ExtendedType[ExtendedType["Barcode_Integer"] = 13306116] = "Barcode_Integer";
      // Formatting
      ExtendedType[ExtendedType["Color"] = 19664897] = "Color";
      ExtendedType[ExtendedType["FormatString"] = 19730433] = "FormatString";
      ExtendedType[ExtendedType["Alignment"] = 20058113] = "Alignment";
      ExtendedType[ExtendedType["LabelDisplayUnits"] = 20123649] = "LabelDisplayUnits";
      ExtendedType[ExtendedType["FontSize"] = 20189443] = "FontSize";
      ExtendedType[ExtendedType["LabelDensity"] = 20254979] = "LabelDensity";
      // Enumeration
      ExtendedType[ExtendedType["Enumeration"] = 26214401] = "Enumeration";
      // Scripting
      ExtendedType[ExtendedType["ScriptSource"] = 32776193] = "ScriptSource";
      // NOTE: To avoid confusion, underscores should be used only to delimit primitive type variants of an extended type
      // (e.g. Year_Integer or Latitude_Double above)
      // Operations
      ExtendedType[ExtendedType["SearchEnabled"] = 65541] = "SearchEnabled";
  })(ExtendedType || (ExtendedType = {}));
  var ExtendedTypeStrings;
  (function (ExtendedTypeStrings) {
      ExtendedTypeStrings[ExtendedTypeStrings["Numeric"] = 256] = "Numeric";
      ExtendedTypeStrings[ExtendedTypeStrings["Temporal"] = 512] = "Temporal";
      ExtendedTypeStrings[ExtendedTypeStrings["Geography"] = 1024] = "Geography";
      ExtendedTypeStrings[ExtendedTypeStrings["Miscellaneous"] = 2048] = "Miscellaneous";
      ExtendedTypeStrings[ExtendedTypeStrings["Formatting"] = 4096] = "Formatting";
      ExtendedTypeStrings[ExtendedTypeStrings["Scripting"] = 8192] = "Scripting";
      ExtendedTypeStrings[ExtendedTypeStrings["Null"] = 0] = "Null";
      ExtendedTypeStrings[ExtendedTypeStrings["Text"] = 1] = "Text";
      ExtendedTypeStrings[ExtendedTypeStrings["Decimal"] = 258] = "Decimal";
      ExtendedTypeStrings[ExtendedTypeStrings["Double"] = 259] = "Double";
      ExtendedTypeStrings[ExtendedTypeStrings["Integer"] = 260] = "Integer";
      ExtendedTypeStrings[ExtendedTypeStrings["Boolean"] = 5] = "Boolean";
      ExtendedTypeStrings[ExtendedTypeStrings["Date"] = 518] = "Date";
      ExtendedTypeStrings[ExtendedTypeStrings["DateTime"] = 519] = "DateTime";
      ExtendedTypeStrings[ExtendedTypeStrings["DateTimeZone"] = 520] = "DateTimeZone";
      ExtendedTypeStrings[ExtendedTypeStrings["Time"] = 521] = "Time";
      ExtendedTypeStrings[ExtendedTypeStrings["Duration"] = 10] = "Duration";
      ExtendedTypeStrings[ExtendedTypeStrings["Binary"] = 11] = "Binary";
      ExtendedTypeStrings[ExtendedTypeStrings["None"] = 12] = "None";
      ExtendedTypeStrings[ExtendedTypeStrings["Variant"] = 13] = "Variant";
      ExtendedTypeStrings[ExtendedTypeStrings["Years"] = 66048] = "Years";
      ExtendedTypeStrings[ExtendedTypeStrings["Years_Text"] = 66049] = "Years_Text";
      ExtendedTypeStrings[ExtendedTypeStrings["Years_Integer"] = 66308] = "Years_Integer";
      ExtendedTypeStrings[ExtendedTypeStrings["Years_Date"] = 66054] = "Years_Date";
      ExtendedTypeStrings[ExtendedTypeStrings["Years_DateTime"] = 66055] = "Years_DateTime";
      ExtendedTypeStrings[ExtendedTypeStrings["Months"] = 131584] = "Months";
      ExtendedTypeStrings[ExtendedTypeStrings["Months_Text"] = 131585] = "Months_Text";
      ExtendedTypeStrings[ExtendedTypeStrings["Months_Integer"] = 131844] = "Months_Integer";
      ExtendedTypeStrings[ExtendedTypeStrings["Months_Date"] = 131590] = "Months_Date";
      ExtendedTypeStrings[ExtendedTypeStrings["Months_DateTime"] = 131591] = "Months_DateTime";
      ExtendedTypeStrings[ExtendedTypeStrings["PaddedDateTableDates"] = 197127] = "PaddedDateTableDates";
      ExtendedTypeStrings[ExtendedTypeStrings["Quarters"] = 262656] = "Quarters";
      ExtendedTypeStrings[ExtendedTypeStrings["Quarters_Text"] = 262657] = "Quarters_Text";
      ExtendedTypeStrings[ExtendedTypeStrings["Quarters_Integer"] = 262916] = "Quarters_Integer";
      ExtendedTypeStrings[ExtendedTypeStrings["Quarters_Date"] = 262662] = "Quarters_Date";
      ExtendedTypeStrings[ExtendedTypeStrings["Quarters_DateTime"] = 262663] = "Quarters_DateTime";
      ExtendedTypeStrings[ExtendedTypeStrings["DayOfMonth"] = 328192] = "DayOfMonth";
      ExtendedTypeStrings[ExtendedTypeStrings["DayOfMonth_Text"] = 328193] = "DayOfMonth_Text";
      ExtendedTypeStrings[ExtendedTypeStrings["DayOfMonth_Integer"] = 328452] = "DayOfMonth_Integer";
      ExtendedTypeStrings[ExtendedTypeStrings["DayOfMonth_Date"] = 328198] = "DayOfMonth_Date";
      ExtendedTypeStrings[ExtendedTypeStrings["DayOfMonth_DateTime"] = 328199] = "DayOfMonth_DateTime";
      ExtendedTypeStrings[ExtendedTypeStrings["Address"] = 6554625] = "Address";
      ExtendedTypeStrings[ExtendedTypeStrings["City"] = 6620161] = "City";
      ExtendedTypeStrings[ExtendedTypeStrings["Continent"] = 6685697] = "Continent";
      ExtendedTypeStrings[ExtendedTypeStrings["Country"] = 6751233] = "Country";
      ExtendedTypeStrings[ExtendedTypeStrings["County"] = 6816769] = "County";
      ExtendedTypeStrings[ExtendedTypeStrings["Region"] = 6882305] = "Region";
      ExtendedTypeStrings[ExtendedTypeStrings["PostalCode"] = 6947840] = "PostalCode";
      ExtendedTypeStrings[ExtendedTypeStrings["PostalCode_Text"] = 6947841] = "PostalCode_Text";
      ExtendedTypeStrings[ExtendedTypeStrings["PostalCode_Integer"] = 6948100] = "PostalCode_Integer";
      ExtendedTypeStrings[ExtendedTypeStrings["StateOrProvince"] = 7013377] = "StateOrProvince";
      ExtendedTypeStrings[ExtendedTypeStrings["Place"] = 7078913] = "Place";
      ExtendedTypeStrings[ExtendedTypeStrings["Latitude"] = 7144448] = "Latitude";
      ExtendedTypeStrings[ExtendedTypeStrings["Latitude_Decimal"] = 7144706] = "Latitude_Decimal";
      ExtendedTypeStrings[ExtendedTypeStrings["Latitude_Double"] = 7144707] = "Latitude_Double";
      ExtendedTypeStrings[ExtendedTypeStrings["Longitude"] = 7209984] = "Longitude";
      ExtendedTypeStrings[ExtendedTypeStrings["Longitude_Decimal"] = 7210242] = "Longitude_Decimal";
      ExtendedTypeStrings[ExtendedTypeStrings["Longitude_Double"] = 7210243] = "Longitude_Double";
      ExtendedTypeStrings[ExtendedTypeStrings["Image"] = 13109259] = "Image";
      ExtendedTypeStrings[ExtendedTypeStrings["ImageUrl"] = 13174785] = "ImageUrl";
      ExtendedTypeStrings[ExtendedTypeStrings["WebUrl"] = 13240321] = "WebUrl";
      ExtendedTypeStrings[ExtendedTypeStrings["Barcode"] = 13305856] = "Barcode";
      ExtendedTypeStrings[ExtendedTypeStrings["Barcode_Text"] = 13305857] = "Barcode_Text";
      ExtendedTypeStrings[ExtendedTypeStrings["Barcode_Integer"] = 13306116] = "Barcode_Integer";
      ExtendedTypeStrings[ExtendedTypeStrings["Color"] = 19664897] = "Color";
      ExtendedTypeStrings[ExtendedTypeStrings["FormatString"] = 19730433] = "FormatString";
      ExtendedTypeStrings[ExtendedTypeStrings["Alignment"] = 20058113] = "Alignment";
      ExtendedTypeStrings[ExtendedTypeStrings["LabelDisplayUnits"] = 20123649] = "LabelDisplayUnits";
      ExtendedTypeStrings[ExtendedTypeStrings["FontSize"] = 20189443] = "FontSize";
      ExtendedTypeStrings[ExtendedTypeStrings["LabelDensity"] = 20254979] = "LabelDensity";
      ExtendedTypeStrings[ExtendedTypeStrings["Enumeration"] = 26214401] = "Enumeration";
      ExtendedTypeStrings[ExtendedTypeStrings["ScriptSource"] = 32776193] = "ScriptSource";
      ExtendedTypeStrings[ExtendedTypeStrings["SearchEnabled"] = 65541] = "SearchEnabled";
  })(ExtendedTypeStrings || (ExtendedTypeStrings = {}));
  const PrimitiveTypeMask = 0xFF;
  const PrimitiveTypeWithFlagsMask = 0xFFFF;
  const PrimitiveTypeFlagsExcludedMask = 0xFFFF0000;
  function getPrimitiveType(extendedType) {
      return extendedType & PrimitiveTypeMask;
  }
  function isPrimitiveType(extendedType) {
      return (extendedType & PrimitiveTypeWithFlagsMask) === extendedType;
  }
  function getCategoryFromExtendedType(extendedType) {
      if (isPrimitiveType(extendedType))
          return null;
      let category = ExtendedTypeStrings[extendedType];
      if (category) {
          // Check for ExtendedType declaration without a primitive type.
          // If exists, use it as category (e.g. Longitude rather than Longitude_Double)
          // Otherwise use the ExtendedType declaration with a primitive type (e.g. Address)
          const delimIdx = category.lastIndexOf("_");
          if (delimIdx > 0) {
              const baseCategory = category.slice(0, delimIdx);
              if (ExtendedTypeStrings[baseCategory]) {
                  category = baseCategory;
              }
          }
      }
      return category || null;
  }
  function toExtendedType(primitiveType, category) {
      const primitiveString = PrimitiveTypeStrings[primitiveType];
      let t = ExtendedTypeStrings[primitiveString];
      if (t == null) {
          t = ExtendedType.Null;
      }
      if (primitiveType && category) {
          let categoryType = ExtendedTypeStrings[category];
          if (categoryType) {
              const categoryPrimitiveType = getPrimitiveType(categoryType);
              if (categoryPrimitiveType === PrimitiveType.Null) {
                  // Category supports multiple primitive types, check if requested primitive type is supported
                  // (note: important to use t here rather than primitiveType as it may include primitive type flags)
                  categoryType = t | categoryType;
                  if (ExtendedTypeStrings[categoryType]) {
                      t = categoryType;
                  }
              }
              else if (categoryPrimitiveType === primitiveType) {
                  // Primitive type matches the single supported type for the category
                  t = categoryType;
              }
          }
      }
      return t;
  }
  function matchesExtendedTypeWithAnyPrimitive(a, b) {
      return (a & PrimitiveTypeFlagsExcludedMask) === (b & PrimitiveTypeFlagsExcludedMask);
  }

  const monthNameToNumber = {
      "January": 0,
      "February": 1,
      "March": 2,
      "April": 3,
      "May": 4,
      "June": 5,
      "July": 6,
      "August": 7,
      "September": 8,
      "October": 9,
      "November": 10,
      "December": 11
  };
  function temporalTypeToKey(inputType, inputValue) {
      const temporalType = ValueType.fromExtendedType(inputType['underlyingType']);
      if (temporalType.temporal.day) {
          return ["day", (inputValue)];
      }
      else if (temporalType.temporal.month) {
          return ["month", monthNameToNumber[(inputValue)]];
      }
      else if (temporalType.temporal.quarter) {
          return ["quarter", inputValue];
      }
      else if (temporalType.temporal.year) {
          return ["year", (inputValue)];
      }
      else {
          return null;
      }
  }
  function parseInputDates(inputs, idxs) {
      var _a, _b, _c, _d;
      const n_keys = idxs.length;
      let inputDates = new Array(n_keys);
      const inputQuarters = new Array(n_keys);
      if (inputs.length > 1) {
          for (let i = 0; i < n_keys; i++) {
              const datePartsArray = [];
              for (let j = 0; j < inputs.length; j++) {
                  datePartsArray.push(temporalTypeToKey(inputs[j].source.type, inputs[j].values[idxs[i]]));
              }
              const datePartsObj = Object.fromEntries(datePartsArray);
              if (datePartsObj === null || datePartsObj === void 0 ? void 0 : datePartsObj.quarter) {
                  inputQuarters.push(datePartsObj.quarter);
              }
              inputDates[i] = new Date((_a = datePartsObj === null || datePartsObj === void 0 ? void 0 : datePartsObj.year) !== null && _a !== void 0 ? _a : 1970, (_b = datePartsObj === null || datePartsObj === void 0 ? void 0 : datePartsObj.month) !== null && _b !== void 0 ? _b : 0, (_c = datePartsObj === null || datePartsObj === void 0 ? void 0 : datePartsObj.day) !== null && _c !== void 0 ? _c : 1);
          }
      }
      else {
          for (let i = 0; i < n_keys; i++) {
              inputDates[i] = (_d = inputs === null || inputs === void 0 ? void 0 : inputs[0]) === null || _d === void 0 ? void 0 : _d.values[idxs[i]];
          }
      }
      return { dates: inputDates, quarters: inputQuarters };
  }

  function identitySelected(identity, selectionManager) {
      const allSelectedIdentities = selectionManager.getSelectionIds();
      if (Array.isArray(identity)) {
          return identity.some((d) => allSelectedIdentities.some((e) => e.includes(d)));
      }
      else {
          return allSelectedIdentities.some((d) => d.includes(identity));
      }
  }

  function seq(start, end) {
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  function drawDots(selection, visualObj) {
      selection
          .select(".dotsgroup")
          .selectAll("circle")
          .data(visualObj.viewModel.plotPoints)
          .join("circle")
          .filter((d) => !isNullOrUndefined(d.value))
          .attr("cy", (d) => visualObj.viewModel.plotProperties.yScale(d.value))
          .attr("cx", (d) => visualObj.viewModel.plotProperties.xScale(d.x))
          .attr("r", (d) => d.aesthetics.size)
          .style("fill", (d) => {
          const ylower = visualObj.viewModel.plotProperties.yAxis.lower;
          const yupper = visualObj.viewModel.plotProperties.yAxis.upper;
          const xlower = visualObj.viewModel.plotProperties.xAxis.lower;
          const xupper = visualObj.viewModel.plotProperties.xAxis.upper;
          return (between(d.value, ylower, yupper) && between(d.x, xlower, xupper)) ? d.aesthetics.colour : "#FFFFFF";
      })
          .on("click", (event, d) => {
          if (visualObj.host.hostCapabilities.allowInteractions) {
              if (visualObj.viewModel.inputSettings.settings.spc.split_on_click) {
                  const xIndex = visualObj.viewModel.splitIndexes.indexOf(d.x);
                  if (xIndex > -1) {
                      visualObj.viewModel.splitIndexes.splice(xIndex, 1);
                  }
                  else {
                      visualObj.viewModel.splitIndexes.push(d.x);
                  }
                  visualObj.host.persistProperties({
                      replace: [{
                              objectName: "split_indexes_storage",
                              selector: undefined,
                              properties: { split_indexes: JSON.stringify(visualObj.viewModel.splitIndexes) }
                          }]
                  });
              }
              else {
                  visualObj.selectionManager
                      .select(d.identity, (event.ctrlKey || event.metaKey))
                      .then(() => {
                      visualObj.updateHighlighting();
                  });
              }
              event.stopPropagation();
          }
      })
          .on("mouseover", (event, d) => {
          const x = event.pageX;
          const y = event.pageY;
          visualObj.host.tooltipService.show({
              dataItems: d.tooltip,
              identities: [d.identity],
              coordinates: [x, y],
              isTouchEvent: false
          });
      })
          .on("mouseout", () => {
          visualObj.host.tooltipService.hide({
              immediately: true,
              isTouchEvent: false
          });
      });
      selection.on('click', () => {
          visualObj.selectionManager.clear();
          visualObj.updateHighlighting();
      });
  }

  function commonCause(selection) {
      selection.append("g")
          .attr("clip-path", "url(#clip2)")
          .append("g")
          .attr("clip-path", "url(#clip3)")
          .attr("filter", "url(#fx0)")
          .attr("transform", "translate(16 25)")
          .append("g")
          .attr("clip-path", "url(#clip4)")
          .append("path")
          .attr("d", "M17.47 172.83C17.47 86.9332 87.1031 17.3 173 17.3 258.897 17.3 328.53 86.9332 328.53 172.83 328.53 258.727 258.897 328.36 173 328.36 87.1031 328.36 17.47 258.727 17.47 172.83Z")
          .attr("stroke", "#A6A6A6")
          .attr("stroke-width", "21")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M38 189C38 105.605 105.605 38 189 38 272.395 38 340 105.605 340 189 340 272.395 272.395 340 189 340 105.605 340 38 272.395 38 189Z")
          .attr("stroke", "#A6A6A6")
          .attr("stroke-width", "20")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M106.903 196.084 144.607 228.433 138.766 235.241 101.062 202.892Z")
          .attr("stroke", "#A6A6A6")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#A6A6A6")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M146.159 218.909 179.921 159.846 187.708 164.298 153.946 223.361Z")
          .attr("stroke", "#A6A6A6")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#A6A6A6")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M198.708 154.94 239.365 214.134 231.971 219.212 191.314 160.019Z")
          .attr("stroke", "#A6A6A6")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#A6A6A6")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M238.825 216.117 285.383 198.784 288.512 207.19 241.954 224.523Z")
          .attr("stroke", "#A6A6A6")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#A6A6A6")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M76.5001 195C76.5001 183.678 85.6782 174.5 97.0001 174.5 108.322 174.5 117.5 183.678 117.5 195 117.5 206.322 108.322 215.5 97.0001 215.5 85.6782 215.5 76.5001 206.322 76.5001 195Z")
          .attr("stroke", "#A6A6A6")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#A6A6A6")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M123.5 233C123.5 221.678 132.678 212.5 144 212.5 155.322 212.5 164.5 221.678 164.5 233 164.5 244.322 155.322 253.5 144 253.5 132.678 253.5 123.5 244.322 123.5 233Z")
          .attr("stroke", "#A6A6A6")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#A6A6A6")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M170.5 153.5C170.5 141.902 179.902 132.5 191.5 132.5 203.098 132.5 212.5 141.902 212.5 153.5 212.5 165.098 203.098 174.5 191.5 174.5 179.902 174.5 170.5 165.098 170.5 153.5Z")
          .attr("stroke", "#A6A6A6")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#A6A6A6")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M217.5 221.5C217.5 209.902 226.902 200.5 238.5 200.5 250.098 200.5 259.5 209.902 259.5 221.5 259.5 233.098 250.098 242.5 238.5 242.5 226.902 242.5 217.5 233.098 217.5 221.5Z")
          .attr("stroke", "#A6A6A6")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#A6A6A6")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M265.5 206.5C265.5 194.902 274.678 185.5 286 185.5 297.322 185.5 306.5 194.902 306.5 206.5 306.5 218.098 297.322 227.5 286 227.5 274.678 227.5 265.5 218.098 265.5 206.5Z")
          .attr("stroke", "#A6A6A6")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#A6A6A6")
          .attr("fill-rule", "evenodd");
  }

  function concernHigh(selection) {
      selection.append("g")
          .attr("clip-path", "url(#clip2)")
          .append("g")
          .attr("clip-path", "url(#clip3)")
          .attr("filter", "url(#fx0)")
          .attr("transform", "translate(16 25)")
          .append("g")
          .attr("clip-path", "url(#clip4)")
          .append("path")
          .attr("d", "M0 155.53C-1.9801e-14 69.6331 69.6331-1.9801e-14 155.53-3.96021e-14 241.427-7.92042e-14 311.06 69.6331 311.06 155.53 311.06 241.427 241.427 311.06 155.53 311.06 69.6331 311.06-9.90052e-14 241.427 0 155.53Z")
          .attr("stroke", "#E46C0A")
          .attr("stroke-width", "21")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 17.47 328.36)");
      selection.append("path")
          .attr("d", "M0 151C-1.92243e-14 67.605 67.605-1.92243e-14 151-3.84486e-14 234.395-7.68973e-14 302 67.605 302 151 302 234.395 234.395 302 151 302 67.605 302-9.61216e-14 234.395 0 151Z")
          .attr("stroke", "#E46C0A")
          .attr("stroke-width", "20")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 38 340)");
      selection.append("text")
          .attr("fill", "#E46C0A")
          .attr("font-family", "Arial,Arial_MSFontService,sans-serif")
          .attr("font-weight", "700")
          .attr("font-size", "117")
          .attr("transform", "translate(106.228 172)")
          .text("H");
      selection.append("rect")
          .attr("x", "0")
          .attr("y", "0")
          .attr("width", "49.6797")
          .attr("height", "8.97008")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("transform", "matrix(0.919094 0.394039 0.394039 -0.919094 95.4025 215.096)");
      selection.append("rect")
          .attr("x", "0")
          .attr("y", "0")
          .attr("width", "49.6797")
          .attr("height", "8.97008")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("transform", "matrix(0.880045 -0.47489 -0.47489 -0.880045 149.897 232.457)");
      selection.append("rect")
          .attr("x", "0")
          .attr("y", "0")
          .attr("width", "49.6797")
          .attr("height", "8.97008")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("transform", "matrix(0.715824 -0.698281 -0.698281 -0.715824 199.882 206.276)");
      selection.append("rect")
          .attr("x", "0")
          .attr("y", "0")
          .attr("width", "49.6797")
          .attr("height", "8.97008")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("transform", "matrix(0.937161 0.348898 0.348898 -0.937161 238.113 168.387)");
      selection.append("path")
          .attr("d", "M0 21C-2.60992e-15 9.40202 9.17816-2.67358e-15 20.5-5.34716e-15 31.8218-1.06943e-14 41 9.40202 41 21 41 32.598 31.8218 42 20.5 42 9.17816 42-1.30496e-14 32.598 0 21Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 76.5001 231.5)");
      selection.append("path")
          .attr("d", "M0 20.5C-2.60992e-15 9.17816 9.17816-2.60992e-15 20.5-5.21985e-15 31.8218-1.04397e-14 41 9.17816 41 20.5 41 31.8218 31.8218 41 20.5 41 9.17816 41-1.30496e-14 31.8218 0 20.5Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 123.5 249.5)");
      selection.append("path")
          .attr("d", "M0 21C-2.67358e-15 9.40202 9.40202-2.67358e-15 21-5.34716e-15 32.598-1.06943e-14 42 9.40202 42 21 42 32.598 32.598 42 21 42 9.40202 42-1.33679e-14 32.598 0 21Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 170.5 231.5)");
      selection.append("path")
          .attr("d", "M0 20.5C-2.67358e-15 9.17816 9.40202-2.60992e-15 21-5.21985e-15 32.598-1.04397e-14 42 9.17816 42 20.5 42 31.8218 32.598 41 21 41 9.40202 41-1.33679e-14 31.8218 0 20.5Z")
          .attr("stroke", "#E46C0A")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#E46C0A")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 217.5 185.5)");
      selection.append("path")
          .attr("d", "M0 20.5C-2.60992e-15 9.17816 9.17816-2.60992e-15 20.5-5.21985e-15 31.8218-1.04397e-14 41 9.17816 41 20.5 41 31.8218 31.8218 41 20.5 41 9.17816 41-1.30496e-14 31.8218 0 20.5Z")
          .attr("stroke", "#E46C0A")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#E46C0A")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 265.5 200.5)");
  }

  function concernLow(selection) {
      selection.append("g")
          .attr("clip-path", "url(#clip2)")
          .append("g")
          .attr("clip-path", "url(#clip3)")
          .attr("filter", "url(#fx0)")
          .attr("transform", "translate(16 25)")
          .append("g")
          .attr("clip-path", "url(#clip4)")
          .append("path")
          .attr("d", "M17.47 172.83C17.47 86.9332 87.1031 17.3 173 17.3 258.897 17.3 328.53 86.9332 328.53 172.83 328.53 258.727 258.897 328.36 173 328.36 87.1031 328.36 17.47 258.727 17.47 172.83Z")
          .attr("stroke", "#E46C0A")
          .attr("stroke-width", "21")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M38 189C38 105.605 105.605 38 189 38 272.395 38 340 105.605 340 189 340 272.395 272.395 340 189 340 105.605 340 38 272.395 38 189Z")
          .attr("stroke", "#E46C0A")
          .attr("stroke-width", "20")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("text")
          .attr("fill", "#E46C0A")
          .attr("font-family", "Arial,Arial_MSFontService,sans-serif")
          .attr("font-weight", "700")
          .attr("font-size", "117")
          .attr("transform", "translate(106.228 292)")
          .text("L");
      selection.append("path")
          .attr("d", "M95.4025 162.857 141.063 143.281 144.597 151.525 98.9371 171.101Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M149.897 145.496 193.618 169.089 189.358 176.983 145.638 153.39Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M199.882 171.677 235.443 206.367 229.18 212.788 193.618 178.098Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M238.113 209.566 284.671 192.233 287.8 200.639 241.243 217.972Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M76.5001 168.5C76.5001 156.902 85.6782 147.5 97.0001 147.5 108.322 147.5 117.5 156.902 117.5 168.5 117.5 180.098 108.322 189.5 97.0001 189.5 85.6782 189.5 76.5001 180.098 76.5001 168.5Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M123.5 150C123.5 138.678 132.678 129.5 144 129.5 155.322 129.5 164.5 138.678 164.5 150 164.5 161.322 155.322 170.5 144 170.5 132.678 170.5 123.5 161.322 123.5 150Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M170.5 168.5C170.5 156.902 179.902 147.5 191.5 147.5 203.098 147.5 212.5 156.902 212.5 168.5 212.5 180.098 203.098 189.5 191.5 189.5 179.902 189.5 170.5 180.098 170.5 168.5Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M217.5 214C217.5 202.678 226.902 193.5 238.5 193.5 250.098 193.5 259.5 202.678 259.5 214 259.5 225.322 250.098 234.5 238.5 234.5 226.902 234.5 217.5 225.322 217.5 214Z")
          .attr("stroke", "#E46C0A")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#E46C0A")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M265.5 199C265.5 187.678 274.678 178.5 286 178.5 297.322 178.5 306.5 187.678 306.5 199 306.5 210.322 297.322 219.5 286 219.5 274.678 219.5 265.5 210.322 265.5 199Z")
          .attr("stroke", "#E46C0A")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#E46C0A")
          .attr("fill-rule", "evenodd");
  }

  function improvementHigh(selection) {
      selection.append("g")
          .attr("clip-path", "url(#clip2)")
          .append("g")
          .attr("clip-path", "url(#clip3)")
          .attr("filter", "url(#fx0)")
          .attr("transform", "translate(16 25)")
          .append("g")
          .attr("clip-path", "url(#clip4)")
          .append("path")
          .attr("d", "M0 155.53C-1.9801e-14 69.6331 69.6331-1.9801e-14 155.53-3.96021e-14 241.427-7.92042e-14 311.06 69.6331 311.06 155.53 311.06 241.427 241.427 311.06 155.53 311.06 69.6331 311.06-9.90052e-14 241.427 0 155.53Z")
          .attr("stroke", "#00B0F0")
          .attr("stroke-width", "21")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 17.47 328.36)");
      selection.append("path")
          .attr("d", "M0 151C-1.92243e-14 67.605 67.605-1.92243e-14 151-3.84486e-14 234.395-7.68973e-14 302 67.605 302 151 302 234.395 234.395 302 151 302 67.605 302-9.61216e-14 234.395 0 151Z")
          .attr("stroke", "#00B0F0")
          .attr("stroke-width", "20")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 38 340)");
      selection.append("text")
          .attr("fill", "#00B0F0")
          .attr("font-family", "Arial,Arial_MSFontService,sans-serif")
          .attr("font-weight", "700")
          .attr("font-size", "117")
          .attr("transform", "translate(106.228 172)")
          .text("H");
      selection.append("rect")
          .attr("x", "0")
          .attr("y", "0")
          .attr("width", "49.6797")
          .attr("height", "8.97008")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("transform", "matrix(0.919094 0.394039 0.394039 -0.919094 95.4025 215.096)");
      selection.append("rect")
          .attr("x", "0")
          .attr("y", "0")
          .attr("width", "49.6797")
          .attr("height", "8.97008")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("transform", "matrix(0.880045 -0.47489 -0.47489 -0.880045 149.897 232.457)");
      selection.append("rect")
          .attr("x", "0")
          .attr("y", "0")
          .attr("width", "49.6797")
          .attr("height", "8.97008")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("transform", "matrix(0.715824 -0.698281 -0.698281 -0.715824 199.882 206.276)");
      selection.append("rect")
          .attr("x", "0")
          .attr("y", "0")
          .attr("width", "49.6797")
          .attr("height", "8.97008")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("transform", "matrix(0.937161 0.348898 0.348898 -0.937161 238.113 168.387)");
      selection.append("path")
          .attr("d", "M0 21C-2.60992e-15 9.40202 9.17816-2.67358e-15 20.5-5.34716e-15 31.8218-1.06943e-14 41 9.40202 41 21 41 32.598 31.8218 42 20.5 42 9.17816 42-1.30496e-14 32.598 0 21Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 76.5001 231.5)");
      selection.append("path")
          .attr("d", "M0 20.5C-2.60992e-15 9.17816 9.17816-2.60992e-15 20.5-5.21985e-15 31.8218-1.04397e-14 41 9.17816 41 20.5 41 31.8218 31.8218 41 20.5 41 9.17816 41-1.30496e-14 31.8218 0 20.5Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 123.5 249.5)");
      selection.append("path")
          .attr("d", "M0 21C-2.67358e-15 9.40202 9.40202-2.67358e-15 21-5.34716e-15 32.598-1.06943e-14 42 9.40202 42 21 42 32.598 32.598 42 21 42 9.40202 42-1.33679e-14 32.598 0 21Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 170.5 231.5)");
      selection.append("path")
          .attr("d", "M0 20.5C-2.67358e-15 9.17816 9.40202-2.60992e-15 21-5.21985e-15 32.598-1.04397e-14 42 9.17816 42 20.5 42 31.8218 32.598 41 21 41 9.40202 41-1.33679e-14 31.8218 0 20.5Z")
          .attr("stroke", "#00B0F0")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#00B0F0")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 217.5 185.5)");
      selection.append("path")
          .attr("d", "M0 20.5C-2.60992e-15 9.17816 9.17816-2.60992e-15 20.5-5.21985e-15 31.8218-1.04397e-14 41 9.17816 41 20.5 41 31.8218 31.8218 41 20.5 41 9.17816 41-1.30496e-14 31.8218 0 20.5Z")
          .attr("stroke", "#00B0F0")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#00B0F0")
          .attr("fill-rule", "evenodd")
          .attr("transform", "matrix(1 0 0 -1 265.5 200.5)");
  }

  function improvementLow(selection) {
      selection.append("g")
          .attr("clip-path", "url(#clip2)")
          .append("g")
          .attr("clip-path", "url(#clip3)")
          .attr("filter", "url(#fx0)")
          .attr("transform", "translate(16 25)")
          .append("g")
          .attr("clip-path", "url(#clip4)")
          .append("path")
          .attr("d", "M17.47 172.83C17.47 86.9332 87.1031 17.3 173 17.3 258.897 17.3 328.53 86.9332 328.53 172.83 328.53 258.727 258.897 328.36 173 328.36 87.1031 328.36 17.47 258.727 17.47 172.83Z")
          .attr("stroke", "#00B0F0")
          .attr("stroke-width", "21")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M38 189C38 105.605 105.605 38 189 38 272.395 38 340 105.605 340 189 340 272.395 272.395 340 189 340 105.605 340 38 272.395 38 189Z")
          .attr("stroke", "#00B0F0")
          .attr("stroke-width", "20")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("text")
          .attr("fill", "#00B0F0")
          .attr("font-family", "Arial,Arial_MSFontService,sans-serif")
          .attr("font-weight", "700")
          .attr("font-size", "117")
          .attr("transform", "translate(106.228 292)")
          .text("L");
      selection.append("path")
          .attr("d", "M95.4025 162.857 141.063 143.281 144.597 151.525 98.9371 171.101Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M149.897 145.496 193.618 169.089 189.358 176.983 145.638 153.39Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M199.882 171.677 235.443 206.367 229.18 212.788 193.618 178.098Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M238.113 209.566 284.671 192.233 287.8 200.639 241.243 217.972Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M76.5001 168.5C76.5001 156.902 85.6782 147.5 97.0001 147.5 108.322 147.5 117.5 156.902 117.5 168.5 117.5 180.098 108.322 189.5 97.0001 189.5 85.6782 189.5 76.5001 180.098 76.5001 168.5Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M123.5 150C123.5 138.678 132.678 129.5 144 129.5 155.322 129.5 164.5 138.678 164.5 150 164.5 161.322 155.322 170.5 144 170.5 132.678 170.5 123.5 161.322 123.5 150Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M170.5 168.5C170.5 156.902 179.902 147.5 191.5 147.5 203.098 147.5 212.5 156.902 212.5 168.5 212.5 180.098 203.098 189.5 191.5 189.5 179.902 189.5 170.5 180.098 170.5 168.5Z")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#7F7F7F")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M217.5 214C217.5 202.678 226.902 193.5 238.5 193.5 250.098 193.5 259.5 202.678 259.5 214 259.5 225.322 250.098 234.5 238.5 234.5 226.902 234.5 217.5 225.322 217.5 214Z")
          .attr("stroke", "#00B0F0")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#00B0F0")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M265.5 199C265.5 187.678 274.678 178.5 286 178.5 297.322 178.5 306.5 187.678 306.5 199 306.5 210.322 297.322 219.5 286 219.5 274.678 219.5 265.5 210.322 265.5 199Z")
          .attr("stroke", "#00B0F0")
          .attr("stroke-width", "2.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#00B0F0")
          .attr("fill-rule", "evenodd");
  }

  function neutralHigh(selection) {
      selection.append("g")
          .attr("clip-path", "url(#clip2)")
          .append("g")
          .attr("clip-path", "url(#clip3)")
          .attr("filter", "url(#fx0)")
          .attr("transform", "translate(16 25)")
          .append("g")
          .attr("clip-path", "url(#clip4)")
          .append("path")
          .attr("d", "M17.47 172.83C17.47 86.9332 87.1031 17.3 173 17.3 258.897 17.3 328.53 86.9332 328.53 172.83 328.53 258.727 258.897 328.36 173 328.36 87.1031 328.36 17.47 258.727 17.47 172.83Z")
          .attr("stroke", "#490092")
          .attr("stroke-width", "21")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M38 189C38 105.605 105.605 38 189 38 272.395 38 340 105.605 340 189 340 272.395 272.395 340 189 340 105.605 340 38 272.395 38 189Z")
          .attr("stroke", "#490092")
          .attr("stroke-width", "20")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M103.652 242.245 180.02 165.878 151.735 137.593 258.273 119.68 240.359 226.217 212.075 197.933 135.708 274.3Z")
          .attr("fill", "#490092")
          .attr("fill-rule", "evenodd");
  }

  function neutralLow(selection) {
      selection.append("g")
          .attr("clip-path", "url(#clip2)")
          .append("g")
          .attr("clip-path", "url(#clip3)")
          .attr("filter", "url(#fx0)")
          .attr("transform", "translate(16 25)")
          .append("g")
          .attr("clip-path", "url(#clip4)")
          .append("path")
          .attr("d", "M17.47 172.83C17.47 86.9332 87.1031 17.3 173 17.3 258.897 17.3 328.53 86.9332 328.53 172.83 328.53 258.727 258.897 328.36 173 328.36 87.1031 328.36 17.47 258.727 17.47 172.83Z")
          .attr("stroke", "#490092")
          .attr("stroke-width", "21")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M38 189C38 105.605 105.605 38 189 38 272.395 38 340 105.605 340 189 340 272.395 272.395 340 189 340 105.605 340 38 272.395 38 189Z")
          .attr("stroke", "#490092")
          .attr("stroke-width", "20")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M135.708 103.652 212.075 180.02 240.359 151.735 258.273 258.273 151.735 240.359 180.02 212.075 103.652 135.708Z")
          .attr("fill", "#490092")
          .attr("fill-rule", "evenodd");
  }

  function consistentFail(selection) {
      selection.append("g")
          .attr("clip-path", "url(#clip2)")
          .append("g")
          .attr("clip-path", "url(#clip3)")
          .attr("filter", "url(#fx0)")
          .attr("transform", "translate(16 25)")
          .append("g")
          .attr("clip-path", "url(#clip4)")
          .append("path")
          .attr("d", "M17.47 172.83C17.47 86.9332 87.1031 17.3 173 17.3 258.897 17.3 328.53 86.9332 328.53 172.83 328.53 258.727 258.897 328.36 173 328.36 87.1031 328.36 17.47 258.727 17.47 172.83Z")
          .attr("stroke", "#FF6600")
          .attr("stroke-width", "21")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M38 189C38 105.605 105.605 38 189 38 272.395 38 340 105.605 340 189 340 272.395 272.395 340 189 340 105.605 340 38 272.395 38 189Z")
          .attr("stroke", "#FF6600")
          .attr("stroke-width", "20")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("text")
          .attr("fill", "#FF6600")
          .attr("font-family", "Arial,Arial_MSFontService,sans-serif")
          .attr("font-weight", "700")
          .attr("font-size", "117")
          .attr("transform", "translate(155.851 158)")
          .text("F");
      selection.append("path")
          .attr("d", "M38.5001 185.5 340.862 185.5")
          .attr("stroke", "#FF6600")
          .attr("stroke-width", "8.66667")
          .attr("stroke-miterlimit", "8")
          .attr("stroke-dasharray", "26 8.66667")
          .attr("fill", "none")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M72.5001 238.762C89.0456 218.168 107.725 200.801 129.638 200.507 152.134 201.459 176.57 238.689 192.563 241.313 206.31 244.118 205.897 217.733 212.814 216.659 217.563 215.414 220.151 238.182 233.066 240.463 248.557 243.786 291.62 234.385 302.5 236.212")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "10.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "none")
          .attr("fill-rule", "evenodd");
  }

  function consistentPass(selection) {
      selection.append("g")
          .attr("clip-path", "url(#clip2)")
          .append("g")
          .attr("clip-path", "url(#clip3)")
          .attr("filter", "url(#fx0)")
          .attr("transform", "translate(16 25)")
          .append("g")
          .attr("clip-path", "url(#clip4)")
          .append("path")
          .attr("d", "M17.47 172.83C17.47 86.9332 87.1031 17.3 173 17.3 258.897 17.3 328.53 86.9332 328.53 172.83 328.53 258.727 258.897 328.36 173 328.36 87.1031 328.36 17.47 258.727 17.47 172.83Z")
          .attr("stroke", "#0072C6")
          .attr("stroke-width", "21")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M38 189C38 105.605 105.605 38 189 38 272.395 38 340 105.605 340 189 340 272.395 272.395 340 189 340 105.605 340 38 272.395 38 189Z")
          .attr("stroke", "#0072C6")
          .attr("stroke-width", "20")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("text")
          .attr("fill", "#0072C6")
          .attr("font-family", "Arial,Arial_MSFontService,sans-serif")
          .attr("font-weight", "700")
          .attr("font-size", "117")
          .attr("transform", "translate(155.851 158)")
          .text("P");
      selection.append("path")
          .attr("d", "M55.5001 257.5 323.847 257.5")
          .attr("stroke", "#0072C6")
          .attr("stroke-width", "8.66667")
          .attr("stroke-miterlimit", "8")
          .attr("stroke-dasharray", "26 8.66667")
          .attr("fill", "none")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M72.5001 238.762C89.0456 218.168 107.725 200.801 129.638 200.507 152.134 201.459 176.57 238.689 192.563 241.313 206.31 244.118 205.897 217.733 212.814 216.659 217.563 215.414 220.151 238.182 233.066 240.463 248.557 243.786 291.62 234.385 302.5 236.212")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "10.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "none")
          .attr("fill-rule", "evenodd");
  }

  function inconsistent(selection) {
      selection.append("g")
          .attr("clip-path", "url(#clip2)")
          .append("g")
          .attr("clip-path", "url(#clip3)")
          .attr("filter", "url(#fx0)")
          .attr("transform", "translate(16 25)")
          .append("g")
          .attr("clip-path", "url(#clip4)")
          .append("path")
          .attr("d", "M17.47 173.345C17.47 87.1637 87.1031 17.3 173 17.3 258.897 17.3 328.53 87.1637 328.53 173.345 328.53 259.526 258.897 329.39 173 329.39 87.1031 329.39 17.47 259.526 17.47 173.345Z")
          .attr("stroke", "#BFBFBF")
          .attr("stroke-width", "21")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M38 189.5C38 105.829 105.605 38 189 38 272.395 38 340 105.829 340 189.5 340 273.171 272.395 341 189 341 105.605 341 38 273.171 38 189.5Z")
          .attr("stroke", "#BFBFBF")
          .attr("stroke-width", "20")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "#FFFFFF")
          .attr("fill-rule", "evenodd");
      selection.append("text")
          .attr("fill", "#7F7F7F")
          .attr("font-family", "Arial,Arial_MSFontService,sans-serif")
          .attr("font-weight", "700")
          .attr("font-size", "117")
          .attr("transform", "translate(155.851 158)")
          .text("?");
      selection.append("path")
          .attr("d", "M38.5001 222.5 340.862 222.5")
          .attr("stroke", "#BFBFBF")
          .attr("stroke-width", "8.66667")
          .attr("stroke-miterlimit", "8")
          .attr("stroke-dasharray", "26 8.66667")
          .attr("fill", "none")
          .attr("fill-rule", "evenodd");
      selection.append("path")
          .attr("d", "M72.5001 239.762C89.0456 219.168 107.725 201.801 129.638 201.507 152.134 202.459 176.57 239.689 192.563 242.313 206.31 245.118 205.897 218.733 212.814 217.659 217.563 216.414 220.151 239.182 233.066 241.463 248.557 244.786 291.62 235.385 302.5 237.212")
          .attr("stroke", "#7F7F7F")
          .attr("stroke-width", "10.66667")
          .attr("stroke-miterlimit", "8")
          .attr("fill", "none")
          .attr("fill-rule", "evenodd");
  }

  var nhsIcons = /*#__PURE__*/Object.freeze({
    __proto__: null,
    commonCause: commonCause,
    concernHigh: concernHigh,
    concernLow: concernLow,
    consistentFail: consistentFail,
    consistentPass: consistentPass,
    improvementHigh: improvementHigh,
    improvementLow: improvementLow,
    inconsistent: inconsistent,
    neutralHigh: neutralHigh,
    neutralLow: neutralLow
  });

  function iconTransformSpec(svg_width, svg_height, location, scaling, count) {
      const scaling_factor = (0.08 * (svg_height / 378)) * scaling;
      const icon_x = location.includes("Right")
          ? (svg_width / scaling_factor) - (378 + (count * 378))
          : location.includes("Centre") ? (svg_width / scaling_factor) / 2 - 189
              : (count * 378);
      const icon_y = location.includes("Bottom")
          ? (svg_height / scaling_factor) - 378
          : location.includes("Centre") ? (svg_height / scaling_factor) / 2 - 189
              : 0;
      return `scale(${scaling_factor}) translate(${icon_x}, ${icon_y})`;
  }
  function initialiseIconSVG(selection, icon_name, transform_spec) {
      const icon_group = selection.append('g')
          .classed("icongroup", true);
      if (transform_spec) {
          icon_group.attr("transform", transform_spec);
      }
      const icon_defs = icon_group.append("defs");
      const icon_defs_filter = icon_defs.append("filter")
          .attr("id", "fx0")
          .attr("x", "-10%")
          .attr("y", "-10%")
          .attr("width", "120%")
          .attr("height", "120%")
          .attr("filterUnits", "userSpaceOnUse")
          .attr("userSpaceOnUse", "userSpaceOnUse");
      const icon_comptrans = icon_defs_filter.append("feComponentTransfer")
          .attr("color-interpolation-filters", "sRGB");
      icon_comptrans.append("feFuncR")
          .attr("type", "discrete")
          .attr("tableValues", "0 0");
      icon_comptrans.append("feFuncG")
          .attr("type", "discrete")
          .attr("tableValues", "0 0");
      icon_comptrans.append("feFuncB")
          .attr("type", "discrete")
          .attr("tableValues", "0 0");
      icon_comptrans.append("feFuncA")
          .attr("type", "linear")
          .attr("slope", "0.4")
          .attr("intercept", "0");
      icon_defs_filter.append("feGaussianBlur")
          .attr("stdDeviation", "1.77778 1.77778");
      icon_defs.append("clipPath")
          .attr("id", "clip1")
          .append("rect")
          .attr("x", "0")
          .attr("y", "0")
          .attr("width", "378")
          .attr("height", "378");
      icon_defs.append("clipPath")
          .attr("id", "clip2")
          .append("path")
          .attr("d", "M189 38C105.605 38 38 105.605 38 189 38 272.395 105.605 340 189 340 272.395 340 340 272.395 340 189 340 105.605 272.395 38 189 38ZM5.63264e-06 5.63264e-06 378 5.63264e-06 378 378 5.63264e-06 378Z")
          .attr("fill-rule", "evenodd")
          .attr("clip-rule", "evenodd");
      icon_defs.append("clipPath")
          .attr("id", "clip3")
          .append("rect")
          .attr("x", "-2")
          .attr("y", "-2")
          .attr("width", "346")
          .attr("height", "346");
      icon_group.append("g")
          .classed(icon_name, true)
          .attr("clip-path", "url(#clip1)")
          .append("rect")
          .attr("x", "0")
          .attr("y", "0")
          .attr("width", "378")
          .attr("height", "378")
          .attr("fill", "#FFFFFF");
  }

  function drawIcons(selection, visualObj) {
      selection.selectAll(".icongroup").remove();
      if (!(visualObj.viewModel.plotProperties.displayPlot)) {
          return;
      }
      const nhsIconSettings = visualObj.viewModel.inputSettings.settings.nhs_icons;
      const draw_variation = nhsIconSettings.show_variation_icons;
      const variation_location = nhsIconSettings.variation_icons_locations;
      const svg_width = visualObj.viewModel.svgWidth;
      const svg_height = visualObj.viewModel.svgHeight;
      let numVariationIcons = 0;
      if (draw_variation) {
          const variation_scaling = nhsIconSettings.variation_icons_scaling;
          const variationIconsPresent = variationIconsToDraw(visualObj.viewModel.outliers, visualObj.viewModel.inputSettings.settings);
          variationIconsPresent.forEach((icon, idx) => {
              selection
                  .call(initialiseIconSVG, icon, iconTransformSpec(svg_width, svg_height, variation_location, variation_scaling, idx))
                  .selectAll(`.${icon}`)
                  .call(nhsIcons[icon]);
          });
          numVariationIcons = variationIconsPresent.length;
      }
      const draw_assurance = nhsIconSettings.show_assurance_icons;
      if (draw_assurance) {
          const assurance_location = nhsIconSettings.assurance_icons_locations;
          const assurance_scaling = nhsIconSettings.assurance_icons_scaling;
          const assuranceIconPresent = assuranceIconToDraw(visualObj.viewModel.controlLimits, visualObj.viewModel.inputSettings.settings, visualObj.viewModel.inputSettings.derivedSettings);
          if (assuranceIconPresent === "none") {
              return;
          }
          const currIconCount = (numVariationIcons > 0 && variation_location === assurance_location)
              ? numVariationIcons
              : 0;
          selection
              .call(initialiseIconSVG, assuranceIconPresent, iconTransformSpec(svg_width, svg_height, assurance_location, assurance_scaling, currIconCount))
              .selectAll(`.${assuranceIconPresent}`)
              .call(nhsIcons[assuranceIconPresent]);
      }
  }

  function drawLines(selection, visualObj) {
      selection
          .select(".linesgroup")
          .selectAll("path")
          .data(visualObj.viewModel.groupedLines)
          .join("path")
          .attr("d", d => {
          const ylower = visualObj.viewModel.plotProperties.yAxis.lower;
          const yupper = visualObj.viewModel.plotProperties.yAxis.upper;
          const xlower = visualObj.viewModel.plotProperties.xAxis.lower;
          const xupper = visualObj.viewModel.plotProperties.xAxis.upper;
          return line()
              .x(d => visualObj.viewModel.plotProperties.xScale(d.x))
              .y(d => visualObj.viewModel.plotProperties.yScale(d.line_value))
              .defined(d => {
              return !isNullOrUndefined(d.line_value)
                  && between(d.line_value, ylower, yupper)
                  && between(d.x, xlower, xupper);
          })(d[1]);
      })
          .attr("fill", "none")
          .attr("stroke", d => {
          return visualObj.viewModel.colourPalette.isHighContrast
              ? visualObj.viewModel.colourPalette.foregroundColour
              : getAesthetic(d[0], "lines", "colour", visualObj.viewModel.inputSettings.settings);
      })
          .attr("stroke-width", d => getAesthetic(d[0], "lines", "width", visualObj.viewModel.inputSettings.settings))
          .attr("stroke-dasharray", d => getAesthetic(d[0], "lines", "type", visualObj.viewModel.inputSettings.settings));
  }

  function drawTooltipLine(selection, visualObj) {
      const plotProperties = visualObj.viewModel.plotProperties;
      const xAxisLine = selection
          .select(".ttip-line-x")
          .attr("x1", 0)
          .attr("x2", 0)
          .attr("y1", plotProperties.yAxis.end_padding)
          .attr("y2", visualObj.viewModel.svgHeight - plotProperties.yAxis.start_padding)
          .attr("stroke-width", "1px")
          .attr("stroke", "black")
          .style("stroke-opacity", 0);
      const yAxisLine = selection
          .select(".ttip-line-y")
          .attr("x1", plotProperties.xAxis.start_padding)
          .attr("x2", visualObj.viewModel.svgWidth - plotProperties.xAxis.end_padding)
          .attr("y1", 0)
          .attr("y2", 0)
          .attr("stroke-width", "1px")
          .attr("stroke", "black")
          .style("stroke-opacity", 0);
      selection.on("mousemove", (event) => {
          if (!plotProperties.displayPlot) {
              return;
          }
          const plotPoints = visualObj.viewModel.plotPoints;
          const xValue = plotProperties.xScale.invert(event.pageX);
          const xRange = plotPoints.map(d => d.x).map(d => Math.abs(d - xValue));
          const nearestDenominator = leastIndex(xRange, (a, b) => a - b);
          const x_coord = plotProperties.xScale(plotPoints[nearestDenominator].x);
          const y_coord = plotProperties.yScale(plotPoints[nearestDenominator].value);
          visualObj.host.tooltipService.show({
              dataItems: plotPoints[nearestDenominator].tooltip,
              identities: [plotPoints[nearestDenominator].identity],
              coordinates: [x_coord, y_coord],
              isTouchEvent: false
          });
          xAxisLine.style("stroke-opacity", 0.4)
              .attr("x1", x_coord)
              .attr("x2", x_coord);
          yAxisLine.style("stroke-opacity", 0.4)
              .attr("y1", y_coord)
              .attr("y2", y_coord);
      })
          .on("mouseleave", () => {
          if (!plotProperties.displayPlot) {
              return;
          }
          visualObj.host.tooltipService.hide({ immediately: true, isTouchEvent: false });
          xAxisLine.style("stroke-opacity", 0);
          yAxisLine.style("stroke-opacity", 0);
      });
  }

  function drawXAxis(selection, visualObj) {
      const xAxisProperties = visualObj.viewModel.plotProperties.xAxis;
      const xAxis = axisBottom(visualObj.viewModel.plotProperties.xScale);
      if (xAxisProperties.ticks) {
          if (xAxisProperties.tick_count) {
              xAxis.ticks(xAxisProperties.tick_count);
          }
          if (visualObj.viewModel.tickLabels) {
              xAxis.tickFormat(axisX => {
                  const targetKey = visualObj.viewModel.tickLabels.filter(d => d.x == axisX);
                  return targetKey.length > 0 ? targetKey[0].label : "";
              });
          }
      }
      else {
          xAxis.tickValues([]);
      }
      const plotHeight = visualObj.viewModel.svgHeight;
      const xAxisHeight = plotHeight - visualObj.viewModel.plotProperties.yAxis.start_padding;
      const displayPlot = visualObj.viewModel.plotProperties.displayPlot;
      const xAxisGroup = selection.select(".xaxisgroup");
      xAxisGroup
          .call(xAxis)
          .attr("color", displayPlot ? xAxisProperties.colour : "#FFFFFF")
          .attr("transform", `translate(0, ${xAxisHeight})`)
          .selectAll(".tick text")
          .style("text-anchor", xAxisProperties.tick_rotation < 0.0 ? "end" : "start")
          .attr("dx", xAxisProperties.tick_rotation < 0.0 ? "-.8em" : ".8em")
          .attr("dy", xAxisProperties.tick_rotation < 0.0 ? "-.15em" : ".15em")
          .attr("transform", "rotate(" + xAxisProperties.tick_rotation + ")")
          .style("font-size", xAxisProperties.tick_size)
          .style("font-family", xAxisProperties.tick_font)
          .style("fill", displayPlot ? xAxisProperties.tick_colour : "#FFFFFF");
      const xAxisNode = selection.selectAll(".xaxisgroup").node();
      if (!xAxisNode) {
          selection.select(".xaxislabel")
              .style("fill", displayPlot ? xAxisProperties.label_colour : "#FFFFFF");
          return;
      }
      const xAxisCoordinates = xAxisNode.getBoundingClientRect();
      const bottomMidpoint = plotHeight - ((plotHeight - xAxisCoordinates.bottom) / 2);
      selection.select(".xaxislabel")
          .attr("x", visualObj.viewModel.svgWidth / 2)
          .attr("y", bottomMidpoint)
          .style("text-anchor", "middle")
          .text(xAxisProperties.label)
          .style("font-size", xAxisProperties.label_size)
          .style("font-family", xAxisProperties.label_font)
          .style("fill", displayPlot ? xAxisProperties.label_colour : "#FFFFFF");
  }

  function drawYAxis(selection, visualObj) {
      const yAxisProperties = visualObj.viewModel.plotProperties.yAxis;
      const yAxis = axisLeft(visualObj.viewModel.plotProperties.yScale);
      const yaxis_sig_figs = visualObj.viewModel.inputSettings.settings.y_axis.ylimit_sig_figs;
      const sig_figs = isNullOrUndefined(yaxis_sig_figs) ? visualObj.viewModel.inputSettings.settings.spc.sig_figs : yaxis_sig_figs;
      const displayPlot = visualObj.viewModel.plotProperties.displayPlot;
      if (yAxisProperties.ticks) {
          if (yAxisProperties.tick_count) {
              yAxis.ticks(yAxisProperties.tick_count);
          }
          if (visualObj.viewModel.inputData) {
              yAxis.tickFormat((d) => {
                  return visualObj.viewModel.inputSettings.derivedSettings.percentLabels
                      ? d.toFixed(sig_figs) + "%"
                      : d.toFixed(sig_figs);
              });
          }
      }
      else {
          yAxis.tickValues([]);
      }
      const yAxisGroup = selection.select(".yaxisgroup");
      yAxisGroup
          .call(yAxis)
          .attr("color", displayPlot ? yAxisProperties.colour : "#FFFFFF")
          .attr("transform", `translate(${visualObj.viewModel.plotProperties.xAxis.start_padding}, 0)`)
          .selectAll(".tick text")
          .style("text-anchor", "right")
          .attr("transform", `rotate(${yAxisProperties.tick_rotation})`)
          .style("font-size", yAxisProperties.tick_size)
          .style("font-family", yAxisProperties.tick_font)
          .style("fill", displayPlot ? yAxisProperties.tick_colour : "#FFFFFF");
      const yAxisNode = selection.selectAll(".yaxisgroup").node();
      if (!yAxisNode) {
          selection.select(".yaxislabel")
              .style("fill", displayPlot ? yAxisProperties.label_colour : "#FFFFFF");
          return;
      }
      const yAxisCoordinates = yAxisNode.getBoundingClientRect();
      const leftMidpoint = yAxisCoordinates.x * 0.7;
      const y = visualObj.viewModel.svgHeight / 2;
      selection.select(".yaxislabel")
          .attr("x", leftMidpoint)
          .attr("y", y)
          .attr("transform", `rotate(-90, ${leftMidpoint}, ${y})`)
          .text(yAxisProperties.label)
          .style("text-anchor", "middle")
          .style("font-size", yAxisProperties.label_size)
          .style("font-family", yAxisProperties.label_font)
          .style("fill", displayPlot ? yAxisProperties.label_colour : "#FFFFFF");
  }

  function initialiseSVG(selection, removeAll = false) {
      if (removeAll) {
          selection.selectChildren().remove();
      }
      selection.append('line').classed("ttip-line-x", true);
      selection.append('line').classed("ttip-line-y", true);
      selection.append('g').classed("xaxisgroup", true);
      selection.append('text').classed("xaxislabel", true);
      selection.append('g').classed("yaxisgroup", true);
      selection.append('text').classed("yaxislabel", true);
      selection.append('g').classed("linesgroup", true);
      selection.append('g').classed("dotsgroup", true);
  }

  function drawErrors(selection, options, message, type = null) {
      selection.call(initialiseSVG, true);
      const errMessageSVG = selection.append("g").classed("errormessage", true);
      if (type) {
          const preamble = {
              "internal": "Internal Error! Please file a bug report with the following text:",
              "settings": "Invalid settings provided for all observations! First error:"
          };
          errMessageSVG.append('text')
              .attr("x", options.viewport.width / 2)
              .attr("y", options.viewport.height / 3)
              .style("text-anchor", "middle")
              .text(preamble[type])
              .style("font-size", "10px");
      }
      errMessageSVG.append('text')
          .attr("x", options.viewport.width / 2)
          .attr("y", options.viewport.height / 2)
          .style("text-anchor", "middle")
          .text(message)
          .style("font-size", "10px");
  }

  function drawTableHeaders(selection, cols, tableSettings, maxWidth) {
      const tableHeaders = selection.select(".table-header")
          .selectAll("th")
          .data(cols)
          .join("th");
      tableHeaders.selectAll("text")
          .data(d => [d.label])
          .join("text")
          .text(d => d)
          .style("font-size", `${tableSettings.table_header_size}px`)
          .style("font-family", tableSettings.table_header_font)
          .style("color", tableSettings.table_header_colour);
      tableHeaders.style("padding", `${tableSettings.table_header_text_padding}px`)
          .style("background-color", tableSettings.table_header_bg_colour)
          .style("font-weight", tableSettings.table_header_font_weight)
          .style("text-transform", tableSettings.table_header_text_transform)
          .style("text-align", tableSettings.table_header_text_align)
          .style("border-width", `${tableSettings.table_header_border_width}px`)
          .style("border-style", tableSettings.table_header_border_style)
          .style("border-color", tableSettings.table_header_border_colour)
          .style("border-top", "inherit");
      if (!tableSettings.table_header_border_bottom) {
          tableHeaders.style("border-bottom", "none");
      }
      if (!tableSettings.table_header_border_inner) {
          tableHeaders.style("border-left", "none")
              .style("border-right", "none");
      }
      if (tableSettings.table_text_overflow !== "none") {
          tableHeaders.style("overflow", "hidden")
              .style("max-width", `${maxWidth}px`)
              .style("text-overflow", tableSettings.table_text_overflow);
      }
      else {
          tableHeaders.style("overflow", "auto")
              .style("max-width", "none");
      }
  }
  function drawTableRows(selection, visualObj, plotPoints, tableSettings, maxWidth) {
      const tableRows = selection
          .select(".table-body")
          .selectAll('tr')
          .data(plotPoints)
          .join('tr')
          .on("click", (event, d) => {
          if (visualObj.host.hostCapabilities.allowInteractions) {
              const alreadySel = identitySelected(d.identity, visualObj.selectionManager);
              visualObj.selectionManager
                  .select(d.identity, alreadySel || event.ctrlKey || event.metaKey)
                  .then(() => visualObj.updateHighlighting());
              event.stopPropagation();
          }
      })
          .on("mouseover", (event) => {
          select(event.target).select(function () {
              return this.closest("td");
          }).style("background-color", "lightgray");
      })
          .on("mouseout", (event) => {
          var _a, _b;
          let currentTD = select(event.target).select(function () {
              return this.closest("td");
          });
          let rowData = select(currentTD.node().parentNode).datum();
          currentTD.style("background-color", (_b = (_a = rowData.aesthetics) === null || _a === void 0 ? void 0 : _a["table_body_bg_colour"]) !== null && _b !== void 0 ? _b : "inherit");
      });
      if (tableSettings.table_text_overflow !== "none") {
          tableRows.style("overflow", "hidden")
              .style("max-width", `${maxWidth}px`)
              .style("text-overflow", tableSettings.table_text_overflow);
      }
      else {
          tableRows.style("overflow", "auto")
              .style("max-width", "none");
      }
  }
  function drawOuterBorder(selection, tableSettings) {
      selection.select(".table-group")
          .style("border-width", `${tableSettings.table_outer_border_width}px`)
          .style("border-style", tableSettings.table_outer_border_style)
          .style("border-color", tableSettings.table_outer_border_colour);
      ["top", "right", "bottom", "left"].forEach((side) => {
          if (!tableSettings[`table_outer_border_${side}`]) {
              selection.select(".table-group").style(`border-${side}`, "none");
          }
      });
      selection.selectAll("th:first-child")
          .style("border-left", "inherit");
      selection.selectAll("th:last-child")
          .style("border-right", "inherit");
      selection.selectAll("td:first-child")
          .style("border-left", "inherit");
      selection.selectAll("td:last-child")
          .style("border-right", "inherit");
      selection.selectAll("tr:first-child")
          .selectAll("td")
          .style("border-top", "inherit");
      selection.selectAll("tr:last-child")
          .selectAll("td")
          .style("border-bottom", "inherit");
  }
  function drawTableCells(selection, cols, inputSettings, showGrouped) {
      const tableCells = selection.select(".table-body")
          .selectAll('tr')
          .selectAll('td')
          .data((d) => cols.map(col => {
          return { column: col.name, value: d.table_row[col.name] };
      }))
          .join('td');
      const draw_icons = inputSettings.nhs_icons.show_variation_icons || inputSettings.nhs_icons.show_assurance_icons;
      const thisSelDims = tableCells.node().getBoundingClientRect();
      tableCells.each(function (d) {
          var _a;
          const currNode = select(this);
          const parentNode = select(currNode.property("parentNode"));
          const rowData = parentNode.datum();
          if (showGrouped && draw_icons && (d.column === "variation" || d.column === "assurance")) {
              const scaling = inputSettings.nhs_icons[`${d.column}_icons_scaling`];
              currNode
                  .append("svg")
                  .attr("width", `${thisSelDims.width * 0.5 * scaling}px`)
                  .attr("viewBox", "0 0 378 378")
                  .classed("rowsvg", true)
                  .call(initialiseIconSVG, d.value)
                  .selectAll(".icongroup")
                  .selectAll(`.${d.value}`)
                  .call(nhsIcons[d.value]);
          }
          else {
              const value = typeof d.value === "number"
                  ? d.value.toFixed(inputSettings.spc.sig_figs)
                  : d.value;
              currNode.text(value).classed("cell-text", true);
          }
          const tableAesthetics = ((_a = rowData.aesthetics) === null || _a === void 0 ? void 0 : _a["table_body_bg_colour"])
              ? rowData.aesthetics
              : inputSettings.summary_table;
          currNode.style("background-color", tableAesthetics.table_body_bg_colour)
              .style("font-weight", tableAesthetics.table_body_font_weight)
              .style("text-transform", tableAesthetics.table_body_text_transform)
              .style("text-align", tableAesthetics.table_body_text_align)
              .style("font-size", `${tableAesthetics.table_body_size}px`)
              .style("font-family", tableAesthetics.table_body_font)
              .style("color", tableAesthetics.table_body_colour)
              .style("border-width", `${tableAesthetics.table_body_border_width}px`)
              .style("border-style", tableAesthetics.table_body_border_style)
              .style("border-color", tableAesthetics.table_body_border_colour)
              .style("padding", `${tableAesthetics.table_body_text_padding}px`)
              .style("opacity", "inherit");
          if (!tableAesthetics.table_body_border_left_right) {
              currNode.style("border-left", "none")
                  .style("border-right", "none");
          }
          if (!tableAesthetics.table_body_border_top_bottom) {
              currNode.style("border-top", "none")
                  .style("border-bottom", "none");
          }
      });
  }
  function drawSummaryTable(selection, visualObj) {
      selection.selectAll(".rowsvg").remove();
      selection.selectAll(".cell-text").remove();
      let plotPoints;
      let cols;
      if (visualObj.viewModel.showGrouped) {
          plotPoints = visualObj.viewModel.plotPointsGrouped;
          cols = visualObj.viewModel.tableColumnsGrouped;
      }
      else {
          plotPoints = visualObj.viewModel.plotPoints;
          cols = visualObj.viewModel.tableColumns;
      }
      const maxWidth = visualObj.viewModel.svgWidth / cols.length;
      const tableSettings = visualObj.viewModel.inputSettings.settings.summary_table;
      selection.call(drawTableHeaders, cols, tableSettings, maxWidth)
          .call(drawTableRows, visualObj, plotPoints, tableSettings, maxWidth);
      if (plotPoints.length > 0) {
          selection.call(drawTableCells, cols, visualObj.viewModel.inputSettings.settings, visualObj.viewModel.showGrouped);
      }
      selection.call(drawOuterBorder, tableSettings);
      selection.on('click', () => {
          visualObj.selectionManager.clear();
          visualObj.updateHighlighting();
      });
  }

  function drawDownloadButton(selection, visualObj) {
      if (!(visualObj.viewModel.inputSettings.settings.download_options.show_button)) {
          selection.select(".download-btn-group").remove();
          return;
      }
      if (selection.select(".download-btn-group").empty()) {
          selection.append("text").classed("download-btn-group", true);
      }
      const table_rows = visualObj.viewModel.plotPoints.map(d => d.table_row);
      const csv_rows = new Array();
      csv_rows.push(Object.keys(table_rows[0]).join(","));
      table_rows.forEach(row => {
          csv_rows.push(Object.values(row).join(","));
      });
      selection.select(".download-btn-group")
          .attr("x", visualObj.viewModel.svgWidth - 50)
          .attr("y", visualObj.viewModel.svgHeight - 5)
          .text("Download")
          .style("font-size", "10px")
          .style("text-decoration", "underline")
          .on("click", () => {
          visualObj.host.downloadService
              .exportVisualsContent(csv_rows.join("\n"), "chartdata.csv", "csv", "csv file");
      });
  }

  const labelFormatting = function (selection, visualObj) {
      const allData = selection.data();
      const initialLabelXY = allData.map(d => {
          var _a, _b;
          const label_direction_mult = d.label.aesthetics.label_position === "top" ? -1 : 1;
          const plotHeight = visualObj.viewModel.svgHeight;
          const xAxisHeight = plotHeight - visualObj.viewModel.plotProperties.yAxis.start_padding;
          const label_position = d.label.aesthetics.label_position;
          let y_offset = d.label.aesthetics.label_y_offset;
          const label_initial = label_position === "top" ? (0 + y_offset) : (xAxisHeight - y_offset);
          const y = visualObj.viewModel.plotProperties.yScale(d.value);
          let side_length = label_position === "top" ? (y - label_initial) : (label_initial - y);
          const x_val = visualObj.viewModel.plotProperties.xScale(d.x);
          const y_val = visualObj.viewModel.plotProperties.yScale(d.value);
          const theta = (_a = d.label.angle) !== null && _a !== void 0 ? _a : (d.label.aesthetics.label_angle_offset + label_direction_mult * 90);
          side_length = (_b = d.label.distance) !== null && _b !== void 0 ? _b : (Math.min(side_length, d.label.aesthetics.label_line_max_length));
          let line_offset = d.label.aesthetics.label_line_offset;
          line_offset = label_position === "top" ? line_offset : -(line_offset + d.label.aesthetics.label_size / 2);
          let marker_offset = d.label.aesthetics.label_marker_offset + d.label.aesthetics.label_size / 2;
          marker_offset = label_position === "top" ? -marker_offset : marker_offset;
          return { x: x_val + side_length * Math.cos(theta * Math.PI / 180),
              y: y_val + side_length * Math.sin(theta * Math.PI / 180),
              theta: theta,
              line_offset: line_offset,
              marker_offset: marker_offset
          };
      });
      selection.select("text")
          .text(d => d.label.text_value)
          .attr("x", (_, i) => initialLabelXY[i].x)
          .attr("y", (_, i) => initialLabelXY[i].y)
          .style("text-anchor", "middle")
          .style("font-size", d => `${d.label.aesthetics.label_size}px`)
          .style("font-family", d => d.label.aesthetics.label_font)
          .style("fill", d => d.label.aesthetics.label_colour);
      selection.select("line")
          .attr("x1", (_, i) => initialLabelXY[i].x)
          .attr("y1", (_, i) => initialLabelXY[i].y + initialLabelXY[i].line_offset)
          .attr("x2", (d, i) => {
          const marker_offset = initialLabelXY[i].marker_offset;
          const angle = initialLabelXY[i].theta - (d.label.aesthetics.label_position === "top" ? 180 : 0);
          return visualObj.viewModel.plotProperties.xScale(d.x) + marker_offset * Math.cos(angle * Math.PI / 180);
      })
          .attr("y2", (d, i) => {
          const marker_offset = initialLabelXY[i].marker_offset;
          const angle = initialLabelXY[i].theta - (d.label.aesthetics.label_position === "top" ? 180 : 0);
          return visualObj.viewModel.plotProperties.yScale(d.value) + marker_offset * Math.sin(angle * Math.PI / 180);
      })
          .style("stroke", visualObj.viewModel.inputSettings.settings.labels.label_line_colour)
          .style("stroke-width", d => { var _a; return ((_a = d.label.text_value) !== null && _a !== void 0 ? _a : "") === "" ? 0 : visualObj.viewModel.inputSettings.settings.labels.label_line_width; })
          .style("stroke-dasharray", visualObj.viewModel.inputSettings.settings.labels.label_line_type);
      selection.select("path")
          .attr("d", d => {
          var _a;
          const show_marker = d.label.aesthetics.label_marker_show && ((_a = d.label.text_value) !== null && _a !== void 0 ? _a : "") !== "";
          const marker_size = show_marker ? Math.pow(d.label.aesthetics.label_marker_size, 2) : 0;
          return Symbol$1().type(triangle).size(marker_size)();
      })
          .attr("transform", (d, i) => {
          const marker_offset = initialLabelXY[i].marker_offset;
          const x = visualObj.viewModel.plotProperties.xScale(d.x);
          const y = visualObj.viewModel.plotProperties.yScale(d.value);
          const angle = initialLabelXY[i].theta - (d.label.aesthetics.label_position === "top" ? 180 : 0);
          const x_offset = marker_offset * Math.cos(angle * Math.PI / 180);
          const y_offset = marker_offset * Math.sin(angle * Math.PI / 180);
          return `translate(${x + x_offset}, ${y + y_offset}) rotate(${angle + (d.label.aesthetics.label_position === "top" ? 90 : 270)})`;
      })
          .style("fill", d => d.label.aesthetics.label_marker_colour)
          .style("stroke", d => d.label.aesthetics.label_marker_outline_colour);
  };
  function drawLabels(selection, visualObj) {
      if (!visualObj.viewModel.inputSettings.settings.labels.show_labels) {
          selection.select(".text-labels").remove();
          return;
      }
      if (selection.select(".text-labels").empty()) {
          selection.append("g").classed("text-labels", true);
      }
      const dragFun = drag().on("drag", function (e) {
          const d = e.subject;
          const x_val = visualObj.viewModel.plotProperties.xScale(d.x);
          const y_val = visualObj.viewModel.plotProperties.yScale(d.value);
          const angle = Math.atan2(e.sourceEvent.y - y_val, e.sourceEvent.x - x_val) * 180 / Math.PI;
          const distance = Math.sqrt(Math.pow(e.sourceEvent.y - y_val, 2) + Math.pow(e.sourceEvent.x - x_val, 2));
          const marker_offset = 10;
          const x_offset = marker_offset * Math.cos(angle * Math.PI / 180);
          const y_offset = marker_offset * Math.sin(angle * Math.PI / 180);
          e.subject.label.angle = angle;
          e.subject.label.distance = distance;
          select(this)
              .select("text")
              .attr("x", e.sourceEvent.x)
              .attr("y", e.sourceEvent.y);
          let line_offset = d.label.aesthetics.label_line_offset;
          line_offset = d.label.aesthetics.label_position === "top" ? line_offset : -(line_offset + d.label.aesthetics.label_size / 2);
          select(this)
              .select("line")
              .attr("x1", e.sourceEvent.x)
              .attr("y1", e.sourceEvent.y + line_offset)
              .attr("x2", x_val + x_offset)
              .attr("y2", y_val + y_offset);
          select(this)
              .select("path")
              .attr("transform", `translate(${x_val + x_offset}, ${y_val + y_offset}) rotate(${angle - 90})`);
      });
      selection.select(".text-labels")
          .selectAll(".text-group-inner")
          .data(visualObj.viewModel.plotPoints)
          .join((enter) => {
          let grp = enter.append("g").classed("text-group-inner", true);
          grp.append("text");
          grp.append("line");
          grp.append("path");
          grp.call(labelFormatting, visualObj)
              .call(dragFun);
          return grp;
      }, (update) => {
          update.call(labelFormatting, visualObj);
          return update;
      });
  }

  const positionOffsetMap = {
      "above": -1,
      "below": 1,
      "beside": -1
  };
  const outsideMap = {
      "ll99": "below",
      "ll95": "below",
      "ll68": "below",
      "ul68": "above",
      "ul95": "above",
      "ul99": "above",
      "speclimits_lower": "below",
      "speclimits_upper": "above"
  };
  const insideMap = {
      "ll99": "above",
      "ll95": "above",
      "ll68": "above",
      "ul68": "below",
      "ul95": "below",
      "ul99": "below",
      "speclimits_lower": "above",
      "speclimits_upper": "below"
  };
  function drawLineLabels(selection, visualObj) {
      const lineSettings = visualObj.viewModel.inputSettings.settings.lines;
      const formatValue = valueFormatter(visualObj.viewModel.inputSettings.settings, visualObj.viewModel.inputSettings.derivedSettings);
      selection
          .select(".linesgroup")
          .selectAll("text")
          .data(visualObj.viewModel.groupedLines)
          .join("text")
          .text(d => {
          return lineSettings[`plot_label_show_${lineNameMap[d[0]]}`]
              ? lineSettings[`plot_label_prefix_${lineNameMap[d[0]]}`] + formatValue(d[1][d[1].length - 1].line_value, "value")
              : "";
      })
          .attr("x", d => visualObj.viewModel.plotProperties.xScale(d[1][d[1].length - 1].x))
          .attr("y", d => visualObj.viewModel.plotProperties.yScale(d[1][d[1].length - 1].line_value))
          .attr("fill", d => lineSettings[`plot_label_colour_${lineNameMap[d[0]]}`])
          .attr("font-size", d => `${lineSettings[`plot_label_size_${lineNameMap[d[0]]}`]}px`)
          .attr("font-family", d => lineSettings[`plot_label_font_${lineNameMap[d[0]]}`])
          .attr("text-anchor", d => lineSettings[`plot_label_position_${lineNameMap[d[0]]}`] === "beside" ? "start" : "end")
          .attr("dx", d => {
          const offset = (lineSettings[`plot_label_position_${lineNameMap[d[0]]}`] === "beside" ? 1 : -1) * lineSettings[`plot_label_hpad_${lineNameMap[d[0]]}`];
          return `${offset}px`;
      })
          .attr("dy", function (d) {
          const bounds = select(this).node().getBoundingClientRect();
          let position = lineSettings[`plot_label_position_${lineNameMap[d[0]]}`];
          let vpadding = lineSettings[`plot_label_vpad_${lineNameMap[d[0]]}`];
          if (["outside", "inside"].includes(position)) {
              position = position === "outside" ? outsideMap[d[0]] : insideMap[d[0]];
          }
          const heightMap = {
              "above": -lineSettings[`width_${lineNameMap[d[0]]}`],
              "below": lineSettings[`plot_label_size_${lineNameMap[d[0]]}`],
              "beside": bounds.height / 4
          };
          return `${positionOffsetMap[position] * vpadding + heightMap[position]}px`;
      });
  }

  class plotPropertiesClass {
      initialiseScale(svgWidth, svgHeight) {
          this.xScale = linear()
              .domain([this.xAxis.lower, this.xAxis.upper])
              .range([this.xAxis.start_padding,
              svgWidth - this.xAxis.end_padding]);
          this.yScale = linear()
              .domain([this.yAxis.lower, this.yAxis.upper])
              .range([svgHeight - this.yAxis.start_padding,
              this.yAxis.end_padding]);
      }
      update(options, plotPoints, controlLimits, inputData, inputSettings, derivedSettings, colorPalette) {
          var _a;
          this.displayPlot = plotPoints
              ? plotPoints.length > 1
              : null;
          let xLowerLimit = inputSettings.x_axis.xlimit_l;
          let xUpperLimit = inputSettings.x_axis.xlimit_u;
          let yLowerLimit = inputSettings.y_axis.ylimit_l;
          let yUpperLimit = inputSettings.y_axis.ylimit_u;
          if (((_a = inputData === null || inputData === void 0 ? void 0 : inputData.validationStatus) === null || _a === void 0 ? void 0 : _a.status) == 0 && controlLimits) {
              xUpperLimit = !isNullOrUndefined(xUpperLimit) ? xUpperLimit : max(controlLimits.keys.map(d => d.x));
              const limitMultiplier = inputSettings.y_axis.limit_multiplier;
              const values = controlLimits.values;
              const ul99 = controlLimits === null || controlLimits === void 0 ? void 0 : controlLimits.ul99;
              const speclimits_upper = controlLimits === null || controlLimits === void 0 ? void 0 : controlLimits.speclimits_upper;
              const ll99 = controlLimits === null || controlLimits === void 0 ? void 0 : controlLimits.ll99;
              const speclimits_lower = controlLimits === null || controlLimits === void 0 ? void 0 : controlLimits.speclimits_lower;
              const alt_targets = controlLimits.alt_targets;
              const maxValue = max(values);
              const maxValueOrLimit = max(values.concat(ul99).concat(speclimits_upper).concat(alt_targets));
              const minValueOrLimit = min(values.concat(ll99).concat(speclimits_lower).concat(alt_targets));
              const maxTarget = max(controlLimits.targets);
              const minTarget = min(controlLimits.targets);
              const upperLimitRaw = maxTarget + (maxValueOrLimit - maxTarget) * limitMultiplier;
              const lowerLimitRaw = minTarget - (minTarget - minValueOrLimit) * limitMultiplier;
              const multiplier = derivedSettings.multiplier;
              yUpperLimit !== null && yUpperLimit !== void 0 ? yUpperLimit : (yUpperLimit = (derivedSettings.percentLabels && !(maxValue > (1 * multiplier)))
                  ? truncate(upperLimitRaw, { upper: 1 * multiplier })
                  : upperLimitRaw);
              yLowerLimit !== null && yLowerLimit !== void 0 ? yLowerLimit : (yLowerLimit = derivedSettings.percentLabels
                  ? truncate(lowerLimitRaw, { lower: 0 * multiplier })
                  : lowerLimitRaw);
              const keysToPlot = controlLimits.keys.map(d => d.x);
              xLowerLimit = !isNullOrUndefined(xLowerLimit)
                  ? xLowerLimit
                  : min(keysToPlot);
              xUpperLimit = !isNullOrUndefined(xUpperLimit)
                  ? xUpperLimit
                  : max(keysToPlot);
          }
          const xTickSize = inputSettings.x_axis.xlimit_tick_size;
          const yTickSize = inputSettings.y_axis.ylimit_tick_size;
          const leftLabelPadding = inputSettings.y_axis.ylimit_label
              ? inputSettings.y_axis.ylimit_label_size
              : 0;
          const lowerLabelPadding = inputSettings.x_axis.xlimit_label
              ? inputSettings.x_axis.xlimit_label_size
              : 0;
          this.xAxis = {
              lower: !isNullOrUndefined(xLowerLimit) ? xLowerLimit : 0,
              upper: xUpperLimit,
              start_padding: inputSettings.canvas.left_padding + leftLabelPadding,
              end_padding: inputSettings.canvas.right_padding,
              colour: colorPalette.isHighContrast ? colorPalette.foregroundColour : inputSettings.x_axis.xlimit_colour,
              ticks: inputSettings.x_axis.xlimit_ticks,
              tick_size: `${xTickSize}px`,
              tick_font: inputSettings.x_axis.xlimit_tick_font,
              tick_colour: colorPalette.isHighContrast ? colorPalette.foregroundColour : inputSettings.x_axis.xlimit_tick_colour,
              tick_rotation: inputSettings.x_axis.xlimit_tick_rotation,
              tick_count: inputSettings.x_axis.xlimit_tick_count,
              label: inputSettings.x_axis.xlimit_label,
              label_size: `${inputSettings.x_axis.xlimit_label_size}px`,
              label_font: inputSettings.x_axis.xlimit_label_font,
              label_colour: colorPalette.isHighContrast ? colorPalette.foregroundColour : inputSettings.x_axis.xlimit_label_colour
          };
          this.yAxis = {
              lower: yLowerLimit,
              upper: yUpperLimit,
              start_padding: inputSettings.canvas.lower_padding + lowerLabelPadding,
              end_padding: inputSettings.canvas.upper_padding,
              colour: colorPalette.isHighContrast ? colorPalette.foregroundColour : inputSettings.y_axis.ylimit_colour,
              ticks: inputSettings.y_axis.ylimit_ticks,
              tick_size: `${yTickSize}px`,
              tick_font: inputSettings.y_axis.ylimit_tick_font,
              tick_colour: colorPalette.isHighContrast ? colorPalette.foregroundColour : inputSettings.y_axis.ylimit_tick_colour,
              tick_rotation: inputSettings.y_axis.ylimit_tick_rotation,
              tick_count: inputSettings.y_axis.ylimit_tick_count,
              label: inputSettings.y_axis.ylimit_label,
              label_size: `${inputSettings.y_axis.ylimit_label_size}px`,
              label_font: inputSettings.y_axis.ylimit_label_font,
              label_colour: colorPalette.isHighContrast ? colorPalette.foregroundColour : inputSettings.y_axis.ylimit_label_colour
          };
          this.initialiseScale(options.viewport.width, options.viewport.height);
      }
  }

  var powerbiVisualsApi = {};

  var re = {exports: {}};

  var constants;
  var hasRequiredConstants;

  function requireConstants () {
  	if (hasRequiredConstants) return constants;
  	hasRequiredConstants = 1;
  	// Note: this is the semver.org version of the spec that it implements
  	// Not necessarily the package version of this code.
  	const SEMVER_SPEC_VERSION = '2.0.0';

  	const MAX_LENGTH = 256;
  	const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
  	/* istanbul ignore next */ 9007199254740991;

  	// Max safe segment length for coercion.
  	const MAX_SAFE_COMPONENT_LENGTH = 16;

  	// Max safe length for a build identifier. The max length minus 6 characters for
  	// the shortest version with a build 0.0.0+BUILD.
  	const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;

  	const RELEASE_TYPES = [
  	  'major',
  	  'premajor',
  	  'minor',
  	  'preminor',
  	  'patch',
  	  'prepatch',
  	  'prerelease',
  	];

  	constants = {
  	  MAX_LENGTH,
  	  MAX_SAFE_COMPONENT_LENGTH,
  	  MAX_SAFE_BUILD_LENGTH,
  	  MAX_SAFE_INTEGER,
  	  RELEASE_TYPES,
  	  SEMVER_SPEC_VERSION,
  	  FLAG_INCLUDE_PRERELEASE: 0b001,
  	  FLAG_LOOSE: 0b010,
  	};
  	return constants;
  }

  var debug_1;
  var hasRequiredDebug;

  function requireDebug () {
  	if (hasRequiredDebug) return debug_1;
  	hasRequiredDebug = 1;
  	const debug = (
  	  typeof process === 'object' &&
  	  process.env &&
  	  process.env.NODE_DEBUG &&
  	  /\bsemver\b/i.test(process.env.NODE_DEBUG)
  	) ? (...args) => console.error('SEMVER', ...args)
  	  : () => {};

  	debug_1 = debug;
  	return debug_1;
  }

  var hasRequiredRe;

  function requireRe () {
  	if (hasRequiredRe) return re.exports;
  	hasRequiredRe = 1;
  	(function (module, exports) {
  		const {
  		  MAX_SAFE_COMPONENT_LENGTH,
  		  MAX_SAFE_BUILD_LENGTH,
  		  MAX_LENGTH,
  		} = requireConstants();
  		const debug = requireDebug();
  		exports = module.exports = {};

  		// The actual regexps go on exports.re
  		const re = exports.re = [];
  		const safeRe = exports.safeRe = [];
  		const src = exports.src = [];
  		const t = exports.t = {};
  		let R = 0;

  		const LETTERDASHNUMBER = '[a-zA-Z0-9-]';

  		// Replace some greedy regex tokens to prevent regex dos issues. These regex are
  		// used internally via the safeRe object since all inputs in this library get
  		// normalized first to trim and collapse all extra whitespace. The original
  		// regexes are exported for userland consumption and lower level usage. A
  		// future breaking change could export the safer regex only with a note that
  		// all input should have extra whitespace removed.
  		const safeRegexReplacements = [
  		  ['\\s', 1],
  		  ['\\d', MAX_LENGTH],
  		  [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],
  		];

  		const makeSafeRegex = (value) => {
  		  for (const [token, max] of safeRegexReplacements) {
  		    value = value
  		      .split(`${token}*`).join(`${token}{0,${max}}`)
  		      .split(`${token}+`).join(`${token}{1,${max}}`);
  		  }
  		  return value
  		};

  		const createToken = (name, value, isGlobal) => {
  		  const safe = makeSafeRegex(value);
  		  const index = R++;
  		  debug(name, index, value);
  		  t[name] = index;
  		  src[index] = value;
  		  re[index] = new RegExp(value, isGlobal ? 'g' : undefined);
  		  safeRe[index] = new RegExp(safe, isGlobal ? 'g' : undefined);
  		};

  		// The following Regular Expressions can be used for tokenizing,
  		// validating, and parsing SemVer version strings.

  		// ## Numeric Identifier
  		// A single `0`, or a non-zero digit followed by zero or more digits.

  		createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
  		createToken('NUMERICIDENTIFIERLOOSE', '\\d+');

  		// ## Non-numeric Identifier
  		// Zero or more digits, followed by a letter or hyphen, and then zero or
  		// more letters, digits, or hyphens.

  		createToken('NONNUMERICIDENTIFIER', `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);

  		// ## Main Version
  		// Three dot-separated numeric identifiers.

  		createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
  		                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
  		                   `(${src[t.NUMERICIDENTIFIER]})`);

  		createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
  		                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
  		                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`);

  		// ## Pre-release Version Identifier
  		// A numeric identifier, or a non-numeric identifier.

  		createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
		}|${src[t.NONNUMERICIDENTIFIER]})`);

  		createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
		}|${src[t.NONNUMERICIDENTIFIER]})`);

  		// ## Pre-release Version
  		// Hyphen, followed by one or more dot-separated pre-release version
  		// identifiers.

  		createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
		}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);

  		createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
		}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);

  		// ## Build Metadata Identifier
  		// Any combination of digits, letters, or hyphens.

  		createToken('BUILDIDENTIFIER', `${LETTERDASHNUMBER}+`);

  		// ## Build Metadata
  		// Plus sign, followed by one or more period-separated build metadata
  		// identifiers.

  		createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
		}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);

  		// ## Full Version String
  		// A main version, followed optionally by a pre-release version and
  		// build metadata.

  		// Note that the only major, minor, patch, and pre-release sections of
  		// the version string are capturing groups.  The build metadata is not a
  		// capturing group, because it should not ever be used in version
  		// comparison.

  		createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
		}${src[t.PRERELEASE]}?${
		  src[t.BUILD]}?`);

  		createToken('FULL', `^${src[t.FULLPLAIN]}$`);

  		// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
  		// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
  		// common in the npm registry.
  		createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
		}${src[t.PRERELEASELOOSE]}?${
		  src[t.BUILD]}?`);

  		createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);

  		createToken('GTLT', '((?:<|>)?=?)');

  		// Something like "2.*" or "1.2.x".
  		// Note that "x.x" is a valid xRange identifer, meaning "any version"
  		// Only the first item is strictly required.
  		createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
  		createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);

  		createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
  		                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
  		                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
  		                   `(?:${src[t.PRERELEASE]})?${
		                     src[t.BUILD]}?` +
  		                   `)?)?`);

  		createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
  		                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
  		                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
  		                        `(?:${src[t.PRERELEASELOOSE]})?${
		                          src[t.BUILD]}?` +
  		                        `)?)?`);

  		createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
  		createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);

  		// Coercion.
  		// Extract anything that could conceivably be a part of a valid semver
  		createToken('COERCEPLAIN', `${'(^|[^\\d])' +
		              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
  		              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
  		              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
  		createToken('COERCE', `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
  		createToken('COERCEFULL', src[t.COERCEPLAIN] +
  		              `(?:${src[t.PRERELEASE]})?` +
  		              `(?:${src[t.BUILD]})?` +
  		              `(?:$|[^\\d])`);
  		createToken('COERCERTL', src[t.COERCE], true);
  		createToken('COERCERTLFULL', src[t.COERCEFULL], true);

  		// Tilde ranges.
  		// Meaning is "reasonably at or greater than"
  		createToken('LONETILDE', '(?:~>?)');

  		createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
  		exports.tildeTrimReplace = '$1~';

  		createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
  		createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);

  		// Caret ranges.
  		// Meaning is "at least and backwards compatible with"
  		createToken('LONECARET', '(?:\\^)');

  		createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
  		exports.caretTrimReplace = '$1^';

  		createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
  		createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);

  		// A simple gt/lt/eq thing, or just "" to indicate "any version"
  		createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
  		createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);

  		// An expression to strip any whitespace between the gtlt and the thing
  		// it modifies, so that `> 1.2.3` ==> `>1.2.3`
  		createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
		}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
  		exports.comparatorTrimReplace = '$1$2$3';

  		// Something like `1.2.3 - 1.2.4`
  		// Note that these all use the loose form, because they'll be
  		// checked against either the strict or loose comparator form
  		// later.
  		createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
  		                   `\\s+-\\s+` +
  		                   `(${src[t.XRANGEPLAIN]})` +
  		                   `\\s*$`);

  		createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
  		                        `\\s+-\\s+` +
  		                        `(${src[t.XRANGEPLAINLOOSE]})` +
  		                        `\\s*$`);

  		// Star ranges basically just allow anything at all.
  		createToken('STAR', '(<|>)?=?\\s*\\*');
  		// >=0.0.0 is like a star
  		createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$');
  		createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$'); 
  	} (re, re.exports));
  	return re.exports;
  }

  var parseOptions_1;
  var hasRequiredParseOptions;

  function requireParseOptions () {
  	if (hasRequiredParseOptions) return parseOptions_1;
  	hasRequiredParseOptions = 1;
  	// parse out just the options we care about
  	const looseOption = Object.freeze({ loose: true });
  	const emptyOpts = Object.freeze({ });
  	const parseOptions = options => {
  	  if (!options) {
  	    return emptyOpts
  	  }

  	  if (typeof options !== 'object') {
  	    return looseOption
  	  }

  	  return options
  	};
  	parseOptions_1 = parseOptions;
  	return parseOptions_1;
  }

  var identifiers;
  var hasRequiredIdentifiers;

  function requireIdentifiers () {
  	if (hasRequiredIdentifiers) return identifiers;
  	hasRequiredIdentifiers = 1;
  	const numeric = /^[0-9]+$/;
  	const compareIdentifiers = (a, b) => {
  	  const anum = numeric.test(a);
  	  const bnum = numeric.test(b);

  	  if (anum && bnum) {
  	    a = +a;
  	    b = +b;
  	  }

  	  return a === b ? 0
  	    : (anum && !bnum) ? -1
  	    : (bnum && !anum) ? 1
  	    : a < b ? -1
  	    : 1
  	};

  	const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);

  	identifiers = {
  	  compareIdentifiers,
  	  rcompareIdentifiers,
  	};
  	return identifiers;
  }

  var semver$1;
  var hasRequiredSemver$1;

  function requireSemver$1 () {
  	if (hasRequiredSemver$1) return semver$1;
  	hasRequiredSemver$1 = 1;
  	const debug = requireDebug();
  	const { MAX_LENGTH, MAX_SAFE_INTEGER } = requireConstants();
  	const { safeRe: re, t } = requireRe();

  	const parseOptions = requireParseOptions();
  	const { compareIdentifiers } = requireIdentifiers();
  	class SemVer {
  	  constructor (version, options) {
  	    options = parseOptions(options);

  	    if (version instanceof SemVer) {
  	      if (version.loose === !!options.loose &&
  	          version.includePrerelease === !!options.includePrerelease) {
  	        return version
  	      } else {
  	        version = version.version;
  	      }
  	    } else if (typeof version !== 'string') {
  	      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`)
  	    }

  	    if (version.length > MAX_LENGTH) {
  	      throw new TypeError(
  	        `version is longer than ${MAX_LENGTH} characters`
  	      )
  	    }

  	    debug('SemVer', version, options);
  	    this.options = options;
  	    this.loose = !!options.loose;
  	    // this isn't actually relevant for versions, but keep it so that we
  	    // don't run into trouble passing this.options around.
  	    this.includePrerelease = !!options.includePrerelease;

  	    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);

  	    if (!m) {
  	      throw new TypeError(`Invalid Version: ${version}`)
  	    }

  	    this.raw = version;

  	    // these are actually numbers
  	    this.major = +m[1];
  	    this.minor = +m[2];
  	    this.patch = +m[3];

  	    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
  	      throw new TypeError('Invalid major version')
  	    }

  	    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
  	      throw new TypeError('Invalid minor version')
  	    }

  	    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
  	      throw new TypeError('Invalid patch version')
  	    }

  	    // numberify any prerelease numeric ids
  	    if (!m[4]) {
  	      this.prerelease = [];
  	    } else {
  	      this.prerelease = m[4].split('.').map((id) => {
  	        if (/^[0-9]+$/.test(id)) {
  	          const num = +id;
  	          if (num >= 0 && num < MAX_SAFE_INTEGER) {
  	            return num
  	          }
  	        }
  	        return id
  	      });
  	    }

  	    this.build = m[5] ? m[5].split('.') : [];
  	    this.format();
  	  }

  	  format () {
  	    this.version = `${this.major}.${this.minor}.${this.patch}`;
  	    if (this.prerelease.length) {
  	      this.version += `-${this.prerelease.join('.')}`;
  	    }
  	    return this.version
  	  }

  	  toString () {
  	    return this.version
  	  }

  	  compare (other) {
  	    debug('SemVer.compare', this.version, this.options, other);
  	    if (!(other instanceof SemVer)) {
  	      if (typeof other === 'string' && other === this.version) {
  	        return 0
  	      }
  	      other = new SemVer(other, this.options);
  	    }

  	    if (other.version === this.version) {
  	      return 0
  	    }

  	    return this.compareMain(other) || this.comparePre(other)
  	  }

  	  compareMain (other) {
  	    if (!(other instanceof SemVer)) {
  	      other = new SemVer(other, this.options);
  	    }

  	    return (
  	      compareIdentifiers(this.major, other.major) ||
  	      compareIdentifiers(this.minor, other.minor) ||
  	      compareIdentifiers(this.patch, other.patch)
  	    )
  	  }

  	  comparePre (other) {
  	    if (!(other instanceof SemVer)) {
  	      other = new SemVer(other, this.options);
  	    }

  	    // NOT having a prerelease is > having one
  	    if (this.prerelease.length && !other.prerelease.length) {
  	      return -1
  	    } else if (!this.prerelease.length && other.prerelease.length) {
  	      return 1
  	    } else if (!this.prerelease.length && !other.prerelease.length) {
  	      return 0
  	    }

  	    let i = 0;
  	    do {
  	      const a = this.prerelease[i];
  	      const b = other.prerelease[i];
  	      debug('prerelease compare', i, a, b);
  	      if (a === undefined && b === undefined) {
  	        return 0
  	      } else if (b === undefined) {
  	        return 1
  	      } else if (a === undefined) {
  	        return -1
  	      } else if (a === b) {
  	        continue
  	      } else {
  	        return compareIdentifiers(a, b)
  	      }
  	    } while (++i)
  	  }

  	  compareBuild (other) {
  	    if (!(other instanceof SemVer)) {
  	      other = new SemVer(other, this.options);
  	    }

  	    let i = 0;
  	    do {
  	      const a = this.build[i];
  	      const b = other.build[i];
  	      debug('build compare', i, a, b);
  	      if (a === undefined && b === undefined) {
  	        return 0
  	      } else if (b === undefined) {
  	        return 1
  	      } else if (a === undefined) {
  	        return -1
  	      } else if (a === b) {
  	        continue
  	      } else {
  	        return compareIdentifiers(a, b)
  	      }
  	    } while (++i)
  	  }

  	  // preminor will bump the version up to the next minor release, and immediately
  	  // down to pre-release. premajor and prepatch work the same way.
  	  inc (release, identifier, identifierBase) {
  	    switch (release) {
  	      case 'premajor':
  	        this.prerelease.length = 0;
  	        this.patch = 0;
  	        this.minor = 0;
  	        this.major++;
  	        this.inc('pre', identifier, identifierBase);
  	        break
  	      case 'preminor':
  	        this.prerelease.length = 0;
  	        this.patch = 0;
  	        this.minor++;
  	        this.inc('pre', identifier, identifierBase);
  	        break
  	      case 'prepatch':
  	        // If this is already a prerelease, it will bump to the next version
  	        // drop any prereleases that might already exist, since they are not
  	        // relevant at this point.
  	        this.prerelease.length = 0;
  	        this.inc('patch', identifier, identifierBase);
  	        this.inc('pre', identifier, identifierBase);
  	        break
  	      // If the input is a non-prerelease version, this acts the same as
  	      // prepatch.
  	      case 'prerelease':
  	        if (this.prerelease.length === 0) {
  	          this.inc('patch', identifier, identifierBase);
  	        }
  	        this.inc('pre', identifier, identifierBase);
  	        break

  	      case 'major':
  	        // If this is a pre-major version, bump up to the same major version.
  	        // Otherwise increment major.
  	        // 1.0.0-5 bumps to 1.0.0
  	        // 1.1.0 bumps to 2.0.0
  	        if (
  	          this.minor !== 0 ||
  	          this.patch !== 0 ||
  	          this.prerelease.length === 0
  	        ) {
  	          this.major++;
  	        }
  	        this.minor = 0;
  	        this.patch = 0;
  	        this.prerelease = [];
  	        break
  	      case 'minor':
  	        // If this is a pre-minor version, bump up to the same minor version.
  	        // Otherwise increment minor.
  	        // 1.2.0-5 bumps to 1.2.0
  	        // 1.2.1 bumps to 1.3.0
  	        if (this.patch !== 0 || this.prerelease.length === 0) {
  	          this.minor++;
  	        }
  	        this.patch = 0;
  	        this.prerelease = [];
  	        break
  	      case 'patch':
  	        // If this is not a pre-release version, it will increment the patch.
  	        // If it is a pre-release it will bump up to the same patch version.
  	        // 1.2.0-5 patches to 1.2.0
  	        // 1.2.0 patches to 1.2.1
  	        if (this.prerelease.length === 0) {
  	          this.patch++;
  	        }
  	        this.prerelease = [];
  	        break
  	      // This probably shouldn't be used publicly.
  	      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
  	      case 'pre': {
  	        const base = Number(identifierBase) ? 1 : 0;

  	        if (!identifier && identifierBase === false) {
  	          throw new Error('invalid increment argument: identifier is empty')
  	        }

  	        if (this.prerelease.length === 0) {
  	          this.prerelease = [base];
  	        } else {
  	          let i = this.prerelease.length;
  	          while (--i >= 0) {
  	            if (typeof this.prerelease[i] === 'number') {
  	              this.prerelease[i]++;
  	              i = -2;
  	            }
  	          }
  	          if (i === -1) {
  	            // didn't increment anything
  	            if (identifier === this.prerelease.join('.') && identifierBase === false) {
  	              throw new Error('invalid increment argument: identifier already exists')
  	            }
  	            this.prerelease.push(base);
  	          }
  	        }
  	        if (identifier) {
  	          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
  	          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
  	          let prerelease = [identifier, base];
  	          if (identifierBase === false) {
  	            prerelease = [identifier];
  	          }
  	          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
  	            if (isNaN(this.prerelease[1])) {
  	              this.prerelease = prerelease;
  	            }
  	          } else {
  	            this.prerelease = prerelease;
  	          }
  	        }
  	        break
  	      }
  	      default:
  	        throw new Error(`invalid increment argument: ${release}`)
  	    }
  	    this.raw = this.format();
  	    if (this.build.length) {
  	      this.raw += `+${this.build.join('.')}`;
  	    }
  	    return this
  	  }
  	}

  	semver$1 = SemVer;
  	return semver$1;
  }

  var parse_1;
  var hasRequiredParse;

  function requireParse () {
  	if (hasRequiredParse) return parse_1;
  	hasRequiredParse = 1;
  	const SemVer = requireSemver$1();
  	const parse = (version, options, throwErrors = false) => {
  	  if (version instanceof SemVer) {
  	    return version
  	  }
  	  try {
  	    return new SemVer(version, options)
  	  } catch (er) {
  	    if (!throwErrors) {
  	      return null
  	    }
  	    throw er
  	  }
  	};

  	parse_1 = parse;
  	return parse_1;
  }

  var valid_1;
  var hasRequiredValid$1;

  function requireValid$1 () {
  	if (hasRequiredValid$1) return valid_1;
  	hasRequiredValid$1 = 1;
  	const parse = requireParse();
  	const valid = (version, options) => {
  	  const v = parse(version, options);
  	  return v ? v.version : null
  	};
  	valid_1 = valid;
  	return valid_1;
  }

  var clean_1;
  var hasRequiredClean;

  function requireClean () {
  	if (hasRequiredClean) return clean_1;
  	hasRequiredClean = 1;
  	const parse = requireParse();
  	const clean = (version, options) => {
  	  const s = parse(version.trim().replace(/^[=v]+/, ''), options);
  	  return s ? s.version : null
  	};
  	clean_1 = clean;
  	return clean_1;
  }

  var inc_1;
  var hasRequiredInc;

  function requireInc () {
  	if (hasRequiredInc) return inc_1;
  	hasRequiredInc = 1;
  	const SemVer = requireSemver$1();

  	const inc = (version, release, options, identifier, identifierBase) => {
  	  if (typeof (options) === 'string') {
  	    identifierBase = identifier;
  	    identifier = options;
  	    options = undefined;
  	  }

  	  try {
  	    return new SemVer(
  	      version instanceof SemVer ? version.version : version,
  	      options
  	    ).inc(release, identifier, identifierBase).version
  	  } catch (er) {
  	    return null
  	  }
  	};
  	inc_1 = inc;
  	return inc_1;
  }

  var diff_1;
  var hasRequiredDiff;

  function requireDiff () {
  	if (hasRequiredDiff) return diff_1;
  	hasRequiredDiff = 1;
  	const parse = requireParse();

  	const diff = (version1, version2) => {
  	  const v1 = parse(version1, null, true);
  	  const v2 = parse(version2, null, true);
  	  const comparison = v1.compare(v2);

  	  if (comparison === 0) {
  	    return null
  	  }

  	  const v1Higher = comparison > 0;
  	  const highVersion = v1Higher ? v1 : v2;
  	  const lowVersion = v1Higher ? v2 : v1;
  	  const highHasPre = !!highVersion.prerelease.length;
  	  const lowHasPre = !!lowVersion.prerelease.length;

  	  if (lowHasPre && !highHasPre) {
  	    // Going from prerelease -> no prerelease requires some special casing

  	    // If the low version has only a major, then it will always be a major
  	    // Some examples:
  	    // 1.0.0-1 -> 1.0.0
  	    // 1.0.0-1 -> 1.1.1
  	    // 1.0.0-1 -> 2.0.0
  	    if (!lowVersion.patch && !lowVersion.minor) {
  	      return 'major'
  	    }

  	    // Otherwise it can be determined by checking the high version

  	    if (highVersion.patch) {
  	      // anything higher than a patch bump would result in the wrong version
  	      return 'patch'
  	    }

  	    if (highVersion.minor) {
  	      // anything higher than a minor bump would result in the wrong version
  	      return 'minor'
  	    }

  	    // bumping major/minor/patch all have same result
  	    return 'major'
  	  }

  	  // add the `pre` prefix if we are going to a prerelease version
  	  const prefix = highHasPre ? 'pre' : '';

  	  if (v1.major !== v2.major) {
  	    return prefix + 'major'
  	  }

  	  if (v1.minor !== v2.minor) {
  	    return prefix + 'minor'
  	  }

  	  if (v1.patch !== v2.patch) {
  	    return prefix + 'patch'
  	  }

  	  // high and low are preleases
  	  return 'prerelease'
  	};

  	diff_1 = diff;
  	return diff_1;
  }

  var major_1;
  var hasRequiredMajor;

  function requireMajor () {
  	if (hasRequiredMajor) return major_1;
  	hasRequiredMajor = 1;
  	const SemVer = requireSemver$1();
  	const major = (a, loose) => new SemVer(a, loose).major;
  	major_1 = major;
  	return major_1;
  }

  var minor_1;
  var hasRequiredMinor;

  function requireMinor () {
  	if (hasRequiredMinor) return minor_1;
  	hasRequiredMinor = 1;
  	const SemVer = requireSemver$1();
  	const minor = (a, loose) => new SemVer(a, loose).minor;
  	minor_1 = minor;
  	return minor_1;
  }

  var patch_1;
  var hasRequiredPatch;

  function requirePatch () {
  	if (hasRequiredPatch) return patch_1;
  	hasRequiredPatch = 1;
  	const SemVer = requireSemver$1();
  	const patch = (a, loose) => new SemVer(a, loose).patch;
  	patch_1 = patch;
  	return patch_1;
  }

  var prerelease_1;
  var hasRequiredPrerelease;

  function requirePrerelease () {
  	if (hasRequiredPrerelease) return prerelease_1;
  	hasRequiredPrerelease = 1;
  	const parse = requireParse();
  	const prerelease = (version, options) => {
  	  const parsed = parse(version, options);
  	  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
  	};
  	prerelease_1 = prerelease;
  	return prerelease_1;
  }

  var compare_1;
  var hasRequiredCompare;

  function requireCompare () {
  	if (hasRequiredCompare) return compare_1;
  	hasRequiredCompare = 1;
  	const SemVer = requireSemver$1();
  	const compare = (a, b, loose) =>
  	  new SemVer(a, loose).compare(new SemVer(b, loose));

  	compare_1 = compare;
  	return compare_1;
  }

  var rcompare_1;
  var hasRequiredRcompare;

  function requireRcompare () {
  	if (hasRequiredRcompare) return rcompare_1;
  	hasRequiredRcompare = 1;
  	const compare = requireCompare();
  	const rcompare = (a, b, loose) => compare(b, a, loose);
  	rcompare_1 = rcompare;
  	return rcompare_1;
  }

  var compareLoose_1;
  var hasRequiredCompareLoose;

  function requireCompareLoose () {
  	if (hasRequiredCompareLoose) return compareLoose_1;
  	hasRequiredCompareLoose = 1;
  	const compare = requireCompare();
  	const compareLoose = (a, b) => compare(a, b, true);
  	compareLoose_1 = compareLoose;
  	return compareLoose_1;
  }

  var compareBuild_1;
  var hasRequiredCompareBuild;

  function requireCompareBuild () {
  	if (hasRequiredCompareBuild) return compareBuild_1;
  	hasRequiredCompareBuild = 1;
  	const SemVer = requireSemver$1();
  	const compareBuild = (a, b, loose) => {
  	  const versionA = new SemVer(a, loose);
  	  const versionB = new SemVer(b, loose);
  	  return versionA.compare(versionB) || versionA.compareBuild(versionB)
  	};
  	compareBuild_1 = compareBuild;
  	return compareBuild_1;
  }

  var sort_1;
  var hasRequiredSort;

  function requireSort () {
  	if (hasRequiredSort) return sort_1;
  	hasRequiredSort = 1;
  	const compareBuild = requireCompareBuild();
  	const sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
  	sort_1 = sort;
  	return sort_1;
  }

  var rsort_1;
  var hasRequiredRsort;

  function requireRsort () {
  	if (hasRequiredRsort) return rsort_1;
  	hasRequiredRsort = 1;
  	const compareBuild = requireCompareBuild();
  	const rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
  	rsort_1 = rsort;
  	return rsort_1;
  }

  var gt_1;
  var hasRequiredGt;

  function requireGt () {
  	if (hasRequiredGt) return gt_1;
  	hasRequiredGt = 1;
  	const compare = requireCompare();
  	const gt = (a, b, loose) => compare(a, b, loose) > 0;
  	gt_1 = gt;
  	return gt_1;
  }

  var lt_1;
  var hasRequiredLt;

  function requireLt () {
  	if (hasRequiredLt) return lt_1;
  	hasRequiredLt = 1;
  	const compare = requireCompare();
  	const lt = (a, b, loose) => compare(a, b, loose) < 0;
  	lt_1 = lt;
  	return lt_1;
  }

  var eq_1;
  var hasRequiredEq;

  function requireEq () {
  	if (hasRequiredEq) return eq_1;
  	hasRequiredEq = 1;
  	const compare = requireCompare();
  	const eq = (a, b, loose) => compare(a, b, loose) === 0;
  	eq_1 = eq;
  	return eq_1;
  }

  var neq_1;
  var hasRequiredNeq;

  function requireNeq () {
  	if (hasRequiredNeq) return neq_1;
  	hasRequiredNeq = 1;
  	const compare = requireCompare();
  	const neq = (a, b, loose) => compare(a, b, loose) !== 0;
  	neq_1 = neq;
  	return neq_1;
  }

  var gte_1;
  var hasRequiredGte;

  function requireGte () {
  	if (hasRequiredGte) return gte_1;
  	hasRequiredGte = 1;
  	const compare = requireCompare();
  	const gte = (a, b, loose) => compare(a, b, loose) >= 0;
  	gte_1 = gte;
  	return gte_1;
  }

  var lte_1;
  var hasRequiredLte;

  function requireLte () {
  	if (hasRequiredLte) return lte_1;
  	hasRequiredLte = 1;
  	const compare = requireCompare();
  	const lte = (a, b, loose) => compare(a, b, loose) <= 0;
  	lte_1 = lte;
  	return lte_1;
  }

  var cmp_1;
  var hasRequiredCmp;

  function requireCmp () {
  	if (hasRequiredCmp) return cmp_1;
  	hasRequiredCmp = 1;
  	const eq = requireEq();
  	const neq = requireNeq();
  	const gt = requireGt();
  	const gte = requireGte();
  	const lt = requireLt();
  	const lte = requireLte();

  	const cmp = (a, op, b, loose) => {
  	  switch (op) {
  	    case '===':
  	      if (typeof a === 'object') {
  	        a = a.version;
  	      }
  	      if (typeof b === 'object') {
  	        b = b.version;
  	      }
  	      return a === b

  	    case '!==':
  	      if (typeof a === 'object') {
  	        a = a.version;
  	      }
  	      if (typeof b === 'object') {
  	        b = b.version;
  	      }
  	      return a !== b

  	    case '':
  	    case '=':
  	    case '==':
  	      return eq(a, b, loose)

  	    case '!=':
  	      return neq(a, b, loose)

  	    case '>':
  	      return gt(a, b, loose)

  	    case '>=':
  	      return gte(a, b, loose)

  	    case '<':
  	      return lt(a, b, loose)

  	    case '<=':
  	      return lte(a, b, loose)

  	    default:
  	      throw new TypeError(`Invalid operator: ${op}`)
  	  }
  	};
  	cmp_1 = cmp;
  	return cmp_1;
  }

  var coerce_1;
  var hasRequiredCoerce;

  function requireCoerce () {
  	if (hasRequiredCoerce) return coerce_1;
  	hasRequiredCoerce = 1;
  	const SemVer = requireSemver$1();
  	const parse = requireParse();
  	const { safeRe: re, t } = requireRe();

  	const coerce = (version, options) => {
  	  if (version instanceof SemVer) {
  	    return version
  	  }

  	  if (typeof version === 'number') {
  	    version = String(version);
  	  }

  	  if (typeof version !== 'string') {
  	    return null
  	  }

  	  options = options || {};

  	  let match = null;
  	  if (!options.rtl) {
  	    match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
  	  } else {
  	    // Find the right-most coercible string that does not share
  	    // a terminus with a more left-ward coercible string.
  	    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
  	    // With includePrerelease option set, '1.2.3.4-rc' wants to coerce '2.3.4-rc', not '2.3.4'
  	    //
  	    // Walk through the string checking with a /g regexp
  	    // Manually set the index so as to pick up overlapping matches.
  	    // Stop when we get a match that ends at the string end, since no
  	    // coercible string can be more right-ward without the same terminus.
  	    const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
  	    let next;
  	    while ((next = coerceRtlRegex.exec(version)) &&
  	        (!match || match.index + match[0].length !== version.length)
  	    ) {
  	      if (!match ||
  	            next.index + next[0].length !== match.index + match[0].length) {
  	        match = next;
  	      }
  	      coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
  	    }
  	    // leave it in a clean state
  	    coerceRtlRegex.lastIndex = -1;
  	  }

  	  if (match === null) {
  	    return null
  	  }

  	  const major = match[2];
  	  const minor = match[3] || '0';
  	  const patch = match[4] || '0';
  	  const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : '';
  	  const build = options.includePrerelease && match[6] ? `+${match[6]}` : '';

  	  return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options)
  	};
  	coerce_1 = coerce;
  	return coerce_1;
  }

  var lrucache;
  var hasRequiredLrucache;

  function requireLrucache () {
  	if (hasRequiredLrucache) return lrucache;
  	hasRequiredLrucache = 1;
  	class LRUCache {
  	  constructor () {
  	    this.max = 1000;
  	    this.map = new Map();
  	  }

  	  get (key) {
  	    const value = this.map.get(key);
  	    if (value === undefined) {
  	      return undefined
  	    } else {
  	      // Remove the key from the map and add it to the end
  	      this.map.delete(key);
  	      this.map.set(key, value);
  	      return value
  	    }
  	  }

  	  delete (key) {
  	    return this.map.delete(key)
  	  }

  	  set (key, value) {
  	    const deleted = this.delete(key);

  	    if (!deleted && value !== undefined) {
  	      // If cache is full, delete the least recently used item
  	      if (this.map.size >= this.max) {
  	        const firstKey = this.map.keys().next().value;
  	        this.delete(firstKey);
  	      }

  	      this.map.set(key, value);
  	    }

  	    return this
  	  }
  	}

  	lrucache = LRUCache;
  	return lrucache;
  }

  var range;
  var hasRequiredRange;

  function requireRange () {
  	if (hasRequiredRange) return range;
  	hasRequiredRange = 1;
  	const SPACE_CHARACTERS = /\s+/g;

  	// hoisted class for cyclic dependency
  	class Range {
  	  constructor (range, options) {
  	    options = parseOptions(options);

  	    if (range instanceof Range) {
  	      if (
  	        range.loose === !!options.loose &&
  	        range.includePrerelease === !!options.includePrerelease
  	      ) {
  	        return range
  	      } else {
  	        return new Range(range.raw, options)
  	      }
  	    }

  	    if (range instanceof Comparator) {
  	      // just put it in the set and return
  	      this.raw = range.value;
  	      this.set = [[range]];
  	      this.formatted = undefined;
  	      return this
  	    }

  	    this.options = options;
  	    this.loose = !!options.loose;
  	    this.includePrerelease = !!options.includePrerelease;

  	    // First reduce all whitespace as much as possible so we do not have to rely
  	    // on potentially slow regexes like \s*. This is then stored and used for
  	    // future error messages as well.
  	    this.raw = range.trim().replace(SPACE_CHARACTERS, ' ');

  	    // First, split on ||
  	    this.set = this.raw
  	      .split('||')
  	      // map the range to a 2d array of comparators
  	      .map(r => this.parseRange(r.trim()))
  	      // throw out any comparator lists that are empty
  	      // this generally means that it was not a valid range, which is allowed
  	      // in loose mode, but will still throw if the WHOLE range is invalid.
  	      .filter(c => c.length);

  	    if (!this.set.length) {
  	      throw new TypeError(`Invalid SemVer Range: ${this.raw}`)
  	    }

  	    // if we have any that are not the null set, throw out null sets.
  	    if (this.set.length > 1) {
  	      // keep the first one, in case they're all null sets
  	      const first = this.set[0];
  	      this.set = this.set.filter(c => !isNullSet(c[0]));
  	      if (this.set.length === 0) {
  	        this.set = [first];
  	      } else if (this.set.length > 1) {
  	        // if we have any that are *, then the range is just *
  	        for (const c of this.set) {
  	          if (c.length === 1 && isAny(c[0])) {
  	            this.set = [c];
  	            break
  	          }
  	        }
  	      }
  	    }

  	    this.formatted = undefined;
  	  }

  	  get range () {
  	    if (this.formatted === undefined) {
  	      this.formatted = '';
  	      for (let i = 0; i < this.set.length; i++) {
  	        if (i > 0) {
  	          this.formatted += '||';
  	        }
  	        const comps = this.set[i];
  	        for (let k = 0; k < comps.length; k++) {
  	          if (k > 0) {
  	            this.formatted += ' ';
  	          }
  	          this.formatted += comps[k].toString().trim();
  	        }
  	      }
  	    }
  	    return this.formatted
  	  }

  	  format () {
  	    return this.range
  	  }

  	  toString () {
  	    return this.range
  	  }

  	  parseRange (range) {
  	    // memoize range parsing for performance.
  	    // this is a very hot path, and fully deterministic.
  	    const memoOpts =
  	      (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) |
  	      (this.options.loose && FLAG_LOOSE);
  	    const memoKey = memoOpts + ':' + range;
  	    const cached = cache.get(memoKey);
  	    if (cached) {
  	      return cached
  	    }

  	    const loose = this.options.loose;
  	    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  	    const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
  	    range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
  	    debug('hyphen replace', range);

  	    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  	    range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
  	    debug('comparator trim', range);

  	    // `~ 1.2.3` => `~1.2.3`
  	    range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
  	    debug('tilde trim', range);

  	    // `^ 1.2.3` => `^1.2.3`
  	    range = range.replace(re[t.CARETTRIM], caretTrimReplace);
  	    debug('caret trim', range);

  	    // At this point, the range is completely trimmed and
  	    // ready to be split into comparators.

  	    let rangeList = range
  	      .split(' ')
  	      .map(comp => parseComparator(comp, this.options))
  	      .join(' ')
  	      .split(/\s+/)
  	      // >=0.0.0 is equivalent to *
  	      .map(comp => replaceGTE0(comp, this.options));

  	    if (loose) {
  	      // in loose mode, throw out any that are not valid comparators
  	      rangeList = rangeList.filter(comp => {
  	        debug('loose invalid filter', comp, this.options);
  	        return !!comp.match(re[t.COMPARATORLOOSE])
  	      });
  	    }
  	    debug('range list', rangeList);

  	    // if any comparators are the null set, then replace with JUST null set
  	    // if more than one comparator, remove any * comparators
  	    // also, don't include the same comparator more than once
  	    const rangeMap = new Map();
  	    const comparators = rangeList.map(comp => new Comparator(comp, this.options));
  	    for (const comp of comparators) {
  	      if (isNullSet(comp)) {
  	        return [comp]
  	      }
  	      rangeMap.set(comp.value, comp);
  	    }
  	    if (rangeMap.size > 1 && rangeMap.has('')) {
  	      rangeMap.delete('');
  	    }

  	    const result = [...rangeMap.values()];
  	    cache.set(memoKey, result);
  	    return result
  	  }

  	  intersects (range, options) {
  	    if (!(range instanceof Range)) {
  	      throw new TypeError('a Range is required')
  	    }

  	    return this.set.some((thisComparators) => {
  	      return (
  	        isSatisfiable(thisComparators, options) &&
  	        range.set.some((rangeComparators) => {
  	          return (
  	            isSatisfiable(rangeComparators, options) &&
  	            thisComparators.every((thisComparator) => {
  	              return rangeComparators.every((rangeComparator) => {
  	                return thisComparator.intersects(rangeComparator, options)
  	              })
  	            })
  	          )
  	        })
  	      )
  	    })
  	  }

  	  // if ANY of the sets match ALL of its comparators, then pass
  	  test (version) {
  	    if (!version) {
  	      return false
  	    }

  	    if (typeof version === 'string') {
  	      try {
  	        version = new SemVer(version, this.options);
  	      } catch (er) {
  	        return false
  	      }
  	    }

  	    for (let i = 0; i < this.set.length; i++) {
  	      if (testSet(this.set[i], version, this.options)) {
  	        return true
  	      }
  	    }
  	    return false
  	  }
  	}

  	range = Range;

  	const LRU = requireLrucache();
  	const cache = new LRU();

  	const parseOptions = requireParseOptions();
  	const Comparator = requireComparator();
  	const debug = requireDebug();
  	const SemVer = requireSemver$1();
  	const {
  	  safeRe: re,
  	  t,
  	  comparatorTrimReplace,
  	  tildeTrimReplace,
  	  caretTrimReplace,
  	} = requireRe();
  	const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = requireConstants();

  	const isNullSet = c => c.value === '<0.0.0-0';
  	const isAny = c => c.value === '';

  	// take a set of comparators and determine whether there
  	// exists a version which can satisfy it
  	const isSatisfiable = (comparators, options) => {
  	  let result = true;
  	  const remainingComparators = comparators.slice();
  	  let testComparator = remainingComparators.pop();

  	  while (result && remainingComparators.length) {
  	    result = remainingComparators.every((otherComparator) => {
  	      return testComparator.intersects(otherComparator, options)
  	    });

  	    testComparator = remainingComparators.pop();
  	  }

  	  return result
  	};

  	// comprised of xranges, tildes, stars, and gtlt's at this point.
  	// already replaced the hyphen ranges
  	// turn into a set of JUST comparators.
  	const parseComparator = (comp, options) => {
  	  debug('comp', comp, options);
  	  comp = replaceCarets(comp, options);
  	  debug('caret', comp);
  	  comp = replaceTildes(comp, options);
  	  debug('tildes', comp);
  	  comp = replaceXRanges(comp, options);
  	  debug('xrange', comp);
  	  comp = replaceStars(comp, options);
  	  debug('stars', comp);
  	  return comp
  	};

  	const isX = id => !id || id.toLowerCase() === 'x' || id === '*';

  	// ~, ~> --> * (any, kinda silly)
  	// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
  	// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
  	// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
  	// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
  	// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
  	// ~0.0.1 --> >=0.0.1 <0.1.0-0
  	const replaceTildes = (comp, options) => {
  	  return comp
  	    .trim()
  	    .split(/\s+/)
  	    .map((c) => replaceTilde(c, options))
  	    .join(' ')
  	};

  	const replaceTilde = (comp, options) => {
  	  const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
  	  return comp.replace(r, (_, M, m, p, pr) => {
  	    debug('tilde', comp, _, M, m, p, pr);
  	    let ret;

  	    if (isX(M)) {
  	      ret = '';
  	    } else if (isX(m)) {
  	      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
  	    } else if (isX(p)) {
  	      // ~1.2 == >=1.2.0 <1.3.0-0
  	      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
  	    } else if (pr) {
  	      debug('replaceTilde pr', pr);
  	      ret = `>=${M}.${m}.${p}-${pr
	      } <${M}.${+m + 1}.0-0`;
  	    } else {
  	      // ~1.2.3 == >=1.2.3 <1.3.0-0
  	      ret = `>=${M}.${m}.${p
	      } <${M}.${+m + 1}.0-0`;
  	    }

  	    debug('tilde return', ret);
  	    return ret
  	  })
  	};

  	// ^ --> * (any, kinda silly)
  	// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
  	// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
  	// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
  	// ^1.2.3 --> >=1.2.3 <2.0.0-0
  	// ^1.2.0 --> >=1.2.0 <2.0.0-0
  	// ^0.0.1 --> >=0.0.1 <0.0.2-0
  	// ^0.1.0 --> >=0.1.0 <0.2.0-0
  	const replaceCarets = (comp, options) => {
  	  return comp
  	    .trim()
  	    .split(/\s+/)
  	    .map((c) => replaceCaret(c, options))
  	    .join(' ')
  	};

  	const replaceCaret = (comp, options) => {
  	  debug('caret', comp, options);
  	  const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
  	  const z = options.includePrerelease ? '-0' : '';
  	  return comp.replace(r, (_, M, m, p, pr) => {
  	    debug('caret', comp, _, M, m, p, pr);
  	    let ret;

  	    if (isX(M)) {
  	      ret = '';
  	    } else if (isX(m)) {
  	      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
  	    } else if (isX(p)) {
  	      if (M === '0') {
  	        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
  	      } else {
  	        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
  	      }
  	    } else if (pr) {
  	      debug('replaceCaret pr', pr);
  	      if (M === '0') {
  	        if (m === '0') {
  	          ret = `>=${M}.${m}.${p}-${pr
	          } <${M}.${m}.${+p + 1}-0`;
  	        } else {
  	          ret = `>=${M}.${m}.${p}-${pr
	          } <${M}.${+m + 1}.0-0`;
  	        }
  	      } else {
  	        ret = `>=${M}.${m}.${p}-${pr
	        } <${+M + 1}.0.0-0`;
  	      }
  	    } else {
  	      debug('no pr');
  	      if (M === '0') {
  	        if (m === '0') {
  	          ret = `>=${M}.${m}.${p
	          }${z} <${M}.${m}.${+p + 1}-0`;
  	        } else {
  	          ret = `>=${M}.${m}.${p
	          }${z} <${M}.${+m + 1}.0-0`;
  	        }
  	      } else {
  	        ret = `>=${M}.${m}.${p
	        } <${+M + 1}.0.0-0`;
  	      }
  	    }

  	    debug('caret return', ret);
  	    return ret
  	  })
  	};

  	const replaceXRanges = (comp, options) => {
  	  debug('replaceXRanges', comp, options);
  	  return comp
  	    .split(/\s+/)
  	    .map((c) => replaceXRange(c, options))
  	    .join(' ')
  	};

  	const replaceXRange = (comp, options) => {
  	  comp = comp.trim();
  	  const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
  	  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
  	    debug('xRange', comp, ret, gtlt, M, m, p, pr);
  	    const xM = isX(M);
  	    const xm = xM || isX(m);
  	    const xp = xm || isX(p);
  	    const anyX = xp;

  	    if (gtlt === '=' && anyX) {
  	      gtlt = '';
  	    }

  	    // if we're including prereleases in the match, then we need
  	    // to fix this to -0, the lowest possible prerelease value
  	    pr = options.includePrerelease ? '-0' : '';

  	    if (xM) {
  	      if (gtlt === '>' || gtlt === '<') {
  	        // nothing is allowed
  	        ret = '<0.0.0-0';
  	      } else {
  	        // nothing is forbidden
  	        ret = '*';
  	      }
  	    } else if (gtlt && anyX) {
  	      // we know patch is an x, because we have any x at all.
  	      // replace X with 0
  	      if (xm) {
  	        m = 0;
  	      }
  	      p = 0;

  	      if (gtlt === '>') {
  	        // >1 => >=2.0.0
  	        // >1.2 => >=1.3.0
  	        gtlt = '>=';
  	        if (xm) {
  	          M = +M + 1;
  	          m = 0;
  	          p = 0;
  	        } else {
  	          m = +m + 1;
  	          p = 0;
  	        }
  	      } else if (gtlt === '<=') {
  	        // <=0.7.x is actually <0.8.0, since any 0.7.x should
  	        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
  	        gtlt = '<';
  	        if (xm) {
  	          M = +M + 1;
  	        } else {
  	          m = +m + 1;
  	        }
  	      }

  	      if (gtlt === '<') {
  	        pr = '-0';
  	      }

  	      ret = `${gtlt + M}.${m}.${p}${pr}`;
  	    } else if (xm) {
  	      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
  	    } else if (xp) {
  	      ret = `>=${M}.${m}.0${pr
	      } <${M}.${+m + 1}.0-0`;
  	    }

  	    debug('xRange return', ret);

  	    return ret
  	  })
  	};

  	// Because * is AND-ed with everything else in the comparator,
  	// and '' means "any version", just remove the *s entirely.
  	const replaceStars = (comp, options) => {
  	  debug('replaceStars', comp, options);
  	  // Looseness is ignored here.  star is always as loose as it gets!
  	  return comp
  	    .trim()
  	    .replace(re[t.STAR], '')
  	};

  	const replaceGTE0 = (comp, options) => {
  	  debug('replaceGTE0', comp, options);
  	  return comp
  	    .trim()
  	    .replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '')
  	};

  	// This function is passed to string.replace(re[t.HYPHENRANGE])
  	// M, m, patch, prerelease, build
  	// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
  	// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
  	// 1.2 - 3.4 => >=1.2.0 <3.5.0-0
  	// TODO build?
  	const hyphenReplace = incPr => ($0,
  	  from, fM, fm, fp, fpr, fb,
  	  to, tM, tm, tp, tpr) => {
  	  if (isX(fM)) {
  	    from = '';
  	  } else if (isX(fm)) {
  	    from = `>=${fM}.0.0${incPr ? '-0' : ''}`;
  	  } else if (isX(fp)) {
  	    from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`;
  	  } else if (fpr) {
  	    from = `>=${from}`;
  	  } else {
  	    from = `>=${from}${incPr ? '-0' : ''}`;
  	  }

  	  if (isX(tM)) {
  	    to = '';
  	  } else if (isX(tm)) {
  	    to = `<${+tM + 1}.0.0-0`;
  	  } else if (isX(tp)) {
  	    to = `<${tM}.${+tm + 1}.0-0`;
  	  } else if (tpr) {
  	    to = `<=${tM}.${tm}.${tp}-${tpr}`;
  	  } else if (incPr) {
  	    to = `<${tM}.${tm}.${+tp + 1}-0`;
  	  } else {
  	    to = `<=${to}`;
  	  }

  	  return `${from} ${to}`.trim()
  	};

  	const testSet = (set, version, options) => {
  	  for (let i = 0; i < set.length; i++) {
  	    if (!set[i].test(version)) {
  	      return false
  	    }
  	  }

  	  if (version.prerelease.length && !options.includePrerelease) {
  	    // Find the set of versions that are allowed to have prereleases
  	    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
  	    // That should allow `1.2.3-pr.2` to pass.
  	    // However, `1.2.4-alpha.notready` should NOT be allowed,
  	    // even though it's within the range set by the comparators.
  	    for (let i = 0; i < set.length; i++) {
  	      debug(set[i].semver);
  	      if (set[i].semver === Comparator.ANY) {
  	        continue
  	      }

  	      if (set[i].semver.prerelease.length > 0) {
  	        const allowed = set[i].semver;
  	        if (allowed.major === version.major &&
  	            allowed.minor === version.minor &&
  	            allowed.patch === version.patch) {
  	          return true
  	        }
  	      }
  	    }

  	    // Version has a -pre, but it's not one of the ones we like.
  	    return false
  	  }

  	  return true
  	};
  	return range;
  }

  var comparator;
  var hasRequiredComparator;

  function requireComparator () {
  	if (hasRequiredComparator) return comparator;
  	hasRequiredComparator = 1;
  	const ANY = Symbol('SemVer ANY');
  	// hoisted class for cyclic dependency
  	class Comparator {
  	  static get ANY () {
  	    return ANY
  	  }

  	  constructor (comp, options) {
  	    options = parseOptions(options);

  	    if (comp instanceof Comparator) {
  	      if (comp.loose === !!options.loose) {
  	        return comp
  	      } else {
  	        comp = comp.value;
  	      }
  	    }

  	    comp = comp.trim().split(/\s+/).join(' ');
  	    debug('comparator', comp, options);
  	    this.options = options;
  	    this.loose = !!options.loose;
  	    this.parse(comp);

  	    if (this.semver === ANY) {
  	      this.value = '';
  	    } else {
  	      this.value = this.operator + this.semver.version;
  	    }

  	    debug('comp', this);
  	  }

  	  parse (comp) {
  	    const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
  	    const m = comp.match(r);

  	    if (!m) {
  	      throw new TypeError(`Invalid comparator: ${comp}`)
  	    }

  	    this.operator = m[1] !== undefined ? m[1] : '';
  	    if (this.operator === '=') {
  	      this.operator = '';
  	    }

  	    // if it literally is just '>' or '' then allow anything.
  	    if (!m[2]) {
  	      this.semver = ANY;
  	    } else {
  	      this.semver = new SemVer(m[2], this.options.loose);
  	    }
  	  }

  	  toString () {
  	    return this.value
  	  }

  	  test (version) {
  	    debug('Comparator.test', version, this.options.loose);

  	    if (this.semver === ANY || version === ANY) {
  	      return true
  	    }

  	    if (typeof version === 'string') {
  	      try {
  	        version = new SemVer(version, this.options);
  	      } catch (er) {
  	        return false
  	      }
  	    }

  	    return cmp(version, this.operator, this.semver, this.options)
  	  }

  	  intersects (comp, options) {
  	    if (!(comp instanceof Comparator)) {
  	      throw new TypeError('a Comparator is required')
  	    }

  	    if (this.operator === '') {
  	      if (this.value === '') {
  	        return true
  	      }
  	      return new Range(comp.value, options).test(this.value)
  	    } else if (comp.operator === '') {
  	      if (comp.value === '') {
  	        return true
  	      }
  	      return new Range(this.value, options).test(comp.semver)
  	    }

  	    options = parseOptions(options);

  	    // Special cases where nothing can possibly be lower
  	    if (options.includePrerelease &&
  	      (this.value === '<0.0.0-0' || comp.value === '<0.0.0-0')) {
  	      return false
  	    }
  	    if (!options.includePrerelease &&
  	      (this.value.startsWith('<0.0.0') || comp.value.startsWith('<0.0.0'))) {
  	      return false
  	    }

  	    // Same direction increasing (> or >=)
  	    if (this.operator.startsWith('>') && comp.operator.startsWith('>')) {
  	      return true
  	    }
  	    // Same direction decreasing (< or <=)
  	    if (this.operator.startsWith('<') && comp.operator.startsWith('<')) {
  	      return true
  	    }
  	    // same SemVer and both sides are inclusive (<= or >=)
  	    if (
  	      (this.semver.version === comp.semver.version) &&
  	      this.operator.includes('=') && comp.operator.includes('=')) {
  	      return true
  	    }
  	    // opposite directions less than
  	    if (cmp(this.semver, '<', comp.semver, options) &&
  	      this.operator.startsWith('>') && comp.operator.startsWith('<')) {
  	      return true
  	    }
  	    // opposite directions greater than
  	    if (cmp(this.semver, '>', comp.semver, options) &&
  	      this.operator.startsWith('<') && comp.operator.startsWith('>')) {
  	      return true
  	    }
  	    return false
  	  }
  	}

  	comparator = Comparator;

  	const parseOptions = requireParseOptions();
  	const { safeRe: re, t } = requireRe();
  	const cmp = requireCmp();
  	const debug = requireDebug();
  	const SemVer = requireSemver$1();
  	const Range = requireRange();
  	return comparator;
  }

  var satisfies_1;
  var hasRequiredSatisfies;

  function requireSatisfies () {
  	if (hasRequiredSatisfies) return satisfies_1;
  	hasRequiredSatisfies = 1;
  	const Range = requireRange();
  	const satisfies = (version, range, options) => {
  	  try {
  	    range = new Range(range, options);
  	  } catch (er) {
  	    return false
  	  }
  	  return range.test(version)
  	};
  	satisfies_1 = satisfies;
  	return satisfies_1;
  }

  var toComparators_1;
  var hasRequiredToComparators;

  function requireToComparators () {
  	if (hasRequiredToComparators) return toComparators_1;
  	hasRequiredToComparators = 1;
  	const Range = requireRange();

  	// Mostly just for testing and legacy API reasons
  	const toComparators = (range, options) =>
  	  new Range(range, options).set
  	    .map(comp => comp.map(c => c.value).join(' ').trim().split(' '));

  	toComparators_1 = toComparators;
  	return toComparators_1;
  }

  var maxSatisfying_1;
  var hasRequiredMaxSatisfying;

  function requireMaxSatisfying () {
  	if (hasRequiredMaxSatisfying) return maxSatisfying_1;
  	hasRequiredMaxSatisfying = 1;
  	const SemVer = requireSemver$1();
  	const Range = requireRange();

  	const maxSatisfying = (versions, range, options) => {
  	  let max = null;
  	  let maxSV = null;
  	  let rangeObj = null;
  	  try {
  	    rangeObj = new Range(range, options);
  	  } catch (er) {
  	    return null
  	  }
  	  versions.forEach((v) => {
  	    if (rangeObj.test(v)) {
  	      // satisfies(v, range, options)
  	      if (!max || maxSV.compare(v) === -1) {
  	        // compare(max, v, true)
  	        max = v;
  	        maxSV = new SemVer(max, options);
  	      }
  	    }
  	  });
  	  return max
  	};
  	maxSatisfying_1 = maxSatisfying;
  	return maxSatisfying_1;
  }

  var minSatisfying_1;
  var hasRequiredMinSatisfying;

  function requireMinSatisfying () {
  	if (hasRequiredMinSatisfying) return minSatisfying_1;
  	hasRequiredMinSatisfying = 1;
  	const SemVer = requireSemver$1();
  	const Range = requireRange();
  	const minSatisfying = (versions, range, options) => {
  	  let min = null;
  	  let minSV = null;
  	  let rangeObj = null;
  	  try {
  	    rangeObj = new Range(range, options);
  	  } catch (er) {
  	    return null
  	  }
  	  versions.forEach((v) => {
  	    if (rangeObj.test(v)) {
  	      // satisfies(v, range, options)
  	      if (!min || minSV.compare(v) === 1) {
  	        // compare(min, v, true)
  	        min = v;
  	        minSV = new SemVer(min, options);
  	      }
  	    }
  	  });
  	  return min
  	};
  	minSatisfying_1 = minSatisfying;
  	return minSatisfying_1;
  }

  var minVersion_1;
  var hasRequiredMinVersion;

  function requireMinVersion () {
  	if (hasRequiredMinVersion) return minVersion_1;
  	hasRequiredMinVersion = 1;
  	const SemVer = requireSemver$1();
  	const Range = requireRange();
  	const gt = requireGt();

  	const minVersion = (range, loose) => {
  	  range = new Range(range, loose);

  	  let minver = new SemVer('0.0.0');
  	  if (range.test(minver)) {
  	    return minver
  	  }

  	  minver = new SemVer('0.0.0-0');
  	  if (range.test(minver)) {
  	    return minver
  	  }

  	  minver = null;
  	  for (let i = 0; i < range.set.length; ++i) {
  	    const comparators = range.set[i];

  	    let setMin = null;
  	    comparators.forEach((comparator) => {
  	      // Clone to avoid manipulating the comparator's semver object.
  	      const compver = new SemVer(comparator.semver.version);
  	      switch (comparator.operator) {
  	        case '>':
  	          if (compver.prerelease.length === 0) {
  	            compver.patch++;
  	          } else {
  	            compver.prerelease.push(0);
  	          }
  	          compver.raw = compver.format();
  	          /* fallthrough */
  	        case '':
  	        case '>=':
  	          if (!setMin || gt(compver, setMin)) {
  	            setMin = compver;
  	          }
  	          break
  	        case '<':
  	        case '<=':
  	          /* Ignore maximum versions */
  	          break
  	        /* istanbul ignore next */
  	        default:
  	          throw new Error(`Unexpected operation: ${comparator.operator}`)
  	      }
  	    });
  	    if (setMin && (!minver || gt(minver, setMin))) {
  	      minver = setMin;
  	    }
  	  }

  	  if (minver && range.test(minver)) {
  	    return minver
  	  }

  	  return null
  	};
  	minVersion_1 = minVersion;
  	return minVersion_1;
  }

  var valid;
  var hasRequiredValid;

  function requireValid () {
  	if (hasRequiredValid) return valid;
  	hasRequiredValid = 1;
  	const Range = requireRange();
  	const validRange = (range, options) => {
  	  try {
  	    // Return '*' instead of '' so that truthiness works.
  	    // This will throw if it's invalid anyway
  	    return new Range(range, options).range || '*'
  	  } catch (er) {
  	    return null
  	  }
  	};
  	valid = validRange;
  	return valid;
  }

  var outside_1;
  var hasRequiredOutside;

  function requireOutside () {
  	if (hasRequiredOutside) return outside_1;
  	hasRequiredOutside = 1;
  	const SemVer = requireSemver$1();
  	const Comparator = requireComparator();
  	const { ANY } = Comparator;
  	const Range = requireRange();
  	const satisfies = requireSatisfies();
  	const gt = requireGt();
  	const lt = requireLt();
  	const lte = requireLte();
  	const gte = requireGte();

  	const outside = (version, range, hilo, options) => {
  	  version = new SemVer(version, options);
  	  range = new Range(range, options);

  	  let gtfn, ltefn, ltfn, comp, ecomp;
  	  switch (hilo) {
  	    case '>':
  	      gtfn = gt;
  	      ltefn = lte;
  	      ltfn = lt;
  	      comp = '>';
  	      ecomp = '>=';
  	      break
  	    case '<':
  	      gtfn = lt;
  	      ltefn = gte;
  	      ltfn = gt;
  	      comp = '<';
  	      ecomp = '<=';
  	      break
  	    default:
  	      throw new TypeError('Must provide a hilo val of "<" or ">"')
  	  }

  	  // If it satisfies the range it is not outside
  	  if (satisfies(version, range, options)) {
  	    return false
  	  }

  	  // From now on, variable terms are as if we're in "gtr" mode.
  	  // but note that everything is flipped for the "ltr" function.

  	  for (let i = 0; i < range.set.length; ++i) {
  	    const comparators = range.set[i];

  	    let high = null;
  	    let low = null;

  	    comparators.forEach((comparator) => {
  	      if (comparator.semver === ANY) {
  	        comparator = new Comparator('>=0.0.0');
  	      }
  	      high = high || comparator;
  	      low = low || comparator;
  	      if (gtfn(comparator.semver, high.semver, options)) {
  	        high = comparator;
  	      } else if (ltfn(comparator.semver, low.semver, options)) {
  	        low = comparator;
  	      }
  	    });

  	    // If the edge version comparator has a operator then our version
  	    // isn't outside it
  	    if (high.operator === comp || high.operator === ecomp) {
  	      return false
  	    }

  	    // If the lowest version comparator has an operator and our version
  	    // is less than it then it isn't higher than the range
  	    if ((!low.operator || low.operator === comp) &&
  	        ltefn(version, low.semver)) {
  	      return false
  	    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
  	      return false
  	    }
  	  }
  	  return true
  	};

  	outside_1 = outside;
  	return outside_1;
  }

  var gtr_1;
  var hasRequiredGtr;

  function requireGtr () {
  	if (hasRequiredGtr) return gtr_1;
  	hasRequiredGtr = 1;
  	// Determine if version is greater than all the versions possible in the range.
  	const outside = requireOutside();
  	const gtr = (version, range, options) => outside(version, range, '>', options);
  	gtr_1 = gtr;
  	return gtr_1;
  }

  var ltr_1;
  var hasRequiredLtr;

  function requireLtr () {
  	if (hasRequiredLtr) return ltr_1;
  	hasRequiredLtr = 1;
  	const outside = requireOutside();
  	// Determine if version is less than all the versions possible in the range
  	const ltr = (version, range, options) => outside(version, range, '<', options);
  	ltr_1 = ltr;
  	return ltr_1;
  }

  var intersects_1;
  var hasRequiredIntersects;

  function requireIntersects () {
  	if (hasRequiredIntersects) return intersects_1;
  	hasRequiredIntersects = 1;
  	const Range = requireRange();
  	const intersects = (r1, r2, options) => {
  	  r1 = new Range(r1, options);
  	  r2 = new Range(r2, options);
  	  return r1.intersects(r2, options)
  	};
  	intersects_1 = intersects;
  	return intersects_1;
  }

  var simplify;
  var hasRequiredSimplify;

  function requireSimplify () {
  	if (hasRequiredSimplify) return simplify;
  	hasRequiredSimplify = 1;
  	// given a set of versions and a range, create a "simplified" range
  	// that includes the same versions that the original range does
  	// If the original range is shorter than the simplified one, return that.
  	const satisfies = requireSatisfies();
  	const compare = requireCompare();
  	simplify = (versions, range, options) => {
  	  const set = [];
  	  let first = null;
  	  let prev = null;
  	  const v = versions.sort((a, b) => compare(a, b, options));
  	  for (const version of v) {
  	    const included = satisfies(version, range, options);
  	    if (included) {
  	      prev = version;
  	      if (!first) {
  	        first = version;
  	      }
  	    } else {
  	      if (prev) {
  	        set.push([first, prev]);
  	      }
  	      prev = null;
  	      first = null;
  	    }
  	  }
  	  if (first) {
  	    set.push([first, null]);
  	  }

  	  const ranges = [];
  	  for (const [min, max] of set) {
  	    if (min === max) {
  	      ranges.push(min);
  	    } else if (!max && min === v[0]) {
  	      ranges.push('*');
  	    } else if (!max) {
  	      ranges.push(`>=${min}`);
  	    } else if (min === v[0]) {
  	      ranges.push(`<=${max}`);
  	    } else {
  	      ranges.push(`${min} - ${max}`);
  	    }
  	  }
  	  const simplified = ranges.join(' || ');
  	  const original = typeof range.raw === 'string' ? range.raw : String(range);
  	  return simplified.length < original.length ? simplified : range
  	};
  	return simplify;
  }

  var subset_1;
  var hasRequiredSubset;

  function requireSubset () {
  	if (hasRequiredSubset) return subset_1;
  	hasRequiredSubset = 1;
  	const Range = requireRange();
  	const Comparator = requireComparator();
  	const { ANY } = Comparator;
  	const satisfies = requireSatisfies();
  	const compare = requireCompare();

  	// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
  	// - Every simple range `r1, r2, ...` is a null set, OR
  	// - Every simple range `r1, r2, ...` which is not a null set is a subset of
  	//   some `R1, R2, ...`
  	//
  	// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
  	// - If c is only the ANY comparator
  	//   - If C is only the ANY comparator, return true
  	//   - Else if in prerelease mode, return false
  	//   - else replace c with `[>=0.0.0]`
  	// - If C is only the ANY comparator
  	//   - if in prerelease mode, return true
  	//   - else replace C with `[>=0.0.0]`
  	// - Let EQ be the set of = comparators in c
  	// - If EQ is more than one, return true (null set)
  	// - Let GT be the highest > or >= comparator in c
  	// - Let LT be the lowest < or <= comparator in c
  	// - If GT and LT, and GT.semver > LT.semver, return true (null set)
  	// - If any C is a = range, and GT or LT are set, return false
  	// - If EQ
  	//   - If GT, and EQ does not satisfy GT, return true (null set)
  	//   - If LT, and EQ does not satisfy LT, return true (null set)
  	//   - If EQ satisfies every C, return true
  	//   - Else return false
  	// - If GT
  	//   - If GT.semver is lower than any > or >= comp in C, return false
  	//   - If GT is >=, and GT.semver does not satisfy every C, return false
  	//   - If GT.semver has a prerelease, and not in prerelease mode
  	//     - If no C has a prerelease and the GT.semver tuple, return false
  	// - If LT
  	//   - If LT.semver is greater than any < or <= comp in C, return false
  	//   - If LT is <=, and LT.semver does not satisfy every C, return false
  	//   - If GT.semver has a prerelease, and not in prerelease mode
  	//     - If no C has a prerelease and the LT.semver tuple, return false
  	// - Else return true

  	const subset = (sub, dom, options = {}) => {
  	  if (sub === dom) {
  	    return true
  	  }

  	  sub = new Range(sub, options);
  	  dom = new Range(dom, options);
  	  let sawNonNull = false;

  	  OUTER: for (const simpleSub of sub.set) {
  	    for (const simpleDom of dom.set) {
  	      const isSub = simpleSubset(simpleSub, simpleDom, options);
  	      sawNonNull = sawNonNull || isSub !== null;
  	      if (isSub) {
  	        continue OUTER
  	      }
  	    }
  	    // the null set is a subset of everything, but null simple ranges in
  	    // a complex range should be ignored.  so if we saw a non-null range,
  	    // then we know this isn't a subset, but if EVERY simple range was null,
  	    // then it is a subset.
  	    if (sawNonNull) {
  	      return false
  	    }
  	  }
  	  return true
  	};

  	const minimumVersionWithPreRelease = [new Comparator('>=0.0.0-0')];
  	const minimumVersion = [new Comparator('>=0.0.0')];

  	const simpleSubset = (sub, dom, options) => {
  	  if (sub === dom) {
  	    return true
  	  }

  	  if (sub.length === 1 && sub[0].semver === ANY) {
  	    if (dom.length === 1 && dom[0].semver === ANY) {
  	      return true
  	    } else if (options.includePrerelease) {
  	      sub = minimumVersionWithPreRelease;
  	    } else {
  	      sub = minimumVersion;
  	    }
  	  }

  	  if (dom.length === 1 && dom[0].semver === ANY) {
  	    if (options.includePrerelease) {
  	      return true
  	    } else {
  	      dom = minimumVersion;
  	    }
  	  }

  	  const eqSet = new Set();
  	  let gt, lt;
  	  for (const c of sub) {
  	    if (c.operator === '>' || c.operator === '>=') {
  	      gt = higherGT(gt, c, options);
  	    } else if (c.operator === '<' || c.operator === '<=') {
  	      lt = lowerLT(lt, c, options);
  	    } else {
  	      eqSet.add(c.semver);
  	    }
  	  }

  	  if (eqSet.size > 1) {
  	    return null
  	  }

  	  let gtltComp;
  	  if (gt && lt) {
  	    gtltComp = compare(gt.semver, lt.semver, options);
  	    if (gtltComp > 0) {
  	      return null
  	    } else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) {
  	      return null
  	    }
  	  }

  	  // will iterate one or zero times
  	  for (const eq of eqSet) {
  	    if (gt && !satisfies(eq, String(gt), options)) {
  	      return null
  	    }

  	    if (lt && !satisfies(eq, String(lt), options)) {
  	      return null
  	    }

  	    for (const c of dom) {
  	      if (!satisfies(eq, String(c), options)) {
  	        return false
  	      }
  	    }

  	    return true
  	  }

  	  let higher, lower;
  	  let hasDomLT, hasDomGT;
  	  // if the subset has a prerelease, we need a comparator in the superset
  	  // with the same tuple and a prerelease, or it's not a subset
  	  let needDomLTPre = lt &&
  	    !options.includePrerelease &&
  	    lt.semver.prerelease.length ? lt.semver : false;
  	  let needDomGTPre = gt &&
  	    !options.includePrerelease &&
  	    gt.semver.prerelease.length ? gt.semver : false;
  	  // exception: <1.2.3-0 is the same as <1.2.3
  	  if (needDomLTPre && needDomLTPre.prerelease.length === 1 &&
  	      lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {
  	    needDomLTPre = false;
  	  }

  	  for (const c of dom) {
  	    hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>=';
  	    hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<=';
  	    if (gt) {
  	      if (needDomGTPre) {
  	        if (c.semver.prerelease && c.semver.prerelease.length &&
  	            c.semver.major === needDomGTPre.major &&
  	            c.semver.minor === needDomGTPre.minor &&
  	            c.semver.patch === needDomGTPre.patch) {
  	          needDomGTPre = false;
  	        }
  	      }
  	      if (c.operator === '>' || c.operator === '>=') {
  	        higher = higherGT(gt, c, options);
  	        if (higher === c && higher !== gt) {
  	          return false
  	        }
  	      } else if (gt.operator === '>=' && !satisfies(gt.semver, String(c), options)) {
  	        return false
  	      }
  	    }
  	    if (lt) {
  	      if (needDomLTPre) {
  	        if (c.semver.prerelease && c.semver.prerelease.length &&
  	            c.semver.major === needDomLTPre.major &&
  	            c.semver.minor === needDomLTPre.minor &&
  	            c.semver.patch === needDomLTPre.patch) {
  	          needDomLTPre = false;
  	        }
  	      }
  	      if (c.operator === '<' || c.operator === '<=') {
  	        lower = lowerLT(lt, c, options);
  	        if (lower === c && lower !== lt) {
  	          return false
  	        }
  	      } else if (lt.operator === '<=' && !satisfies(lt.semver, String(c), options)) {
  	        return false
  	      }
  	    }
  	    if (!c.operator && (lt || gt) && gtltComp !== 0) {
  	      return false
  	    }
  	  }

  	  // if there was a < or >, and nothing in the dom, then must be false
  	  // UNLESS it was limited by another range in the other direction.
  	  // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
  	  if (gt && hasDomLT && !lt && gtltComp !== 0) {
  	    return false
  	  }

  	  if (lt && hasDomGT && !gt && gtltComp !== 0) {
  	    return false
  	  }

  	  // we needed a prerelease range in a specific tuple, but didn't get one
  	  // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,
  	  // because it includes prereleases in the 1.2.3 tuple
  	  if (needDomGTPre || needDomLTPre) {
  	    return false
  	  }

  	  return true
  	};

  	// >=1.2.3 is lower than >1.2.3
  	const higherGT = (a, b, options) => {
  	  if (!a) {
  	    return b
  	  }
  	  const comp = compare(a.semver, b.semver, options);
  	  return comp > 0 ? a
  	    : comp < 0 ? b
  	    : b.operator === '>' && a.operator === '>=' ? b
  	    : a
  	};

  	// <=1.2.3 is higher than <1.2.3
  	const lowerLT = (a, b, options) => {
  	  if (!a) {
  	    return b
  	  }
  	  const comp = compare(a.semver, b.semver, options);
  	  return comp < 0 ? a
  	    : comp > 0 ? b
  	    : b.operator === '<' && a.operator === '<=' ? b
  	    : a
  	};

  	subset_1 = subset;
  	return subset_1;
  }

  var semver;
  var hasRequiredSemver;

  function requireSemver () {
  	if (hasRequiredSemver) return semver;
  	hasRequiredSemver = 1;
  	// just pre-load all the stuff that index.js lazily exports
  	const internalRe = requireRe();
  	const constants = requireConstants();
  	const SemVer = requireSemver$1();
  	const identifiers = requireIdentifiers();
  	const parse = requireParse();
  	const valid = requireValid$1();
  	const clean = requireClean();
  	const inc = requireInc();
  	const diff = requireDiff();
  	const major = requireMajor();
  	const minor = requireMinor();
  	const patch = requirePatch();
  	const prerelease = requirePrerelease();
  	const compare = requireCompare();
  	const rcompare = requireRcompare();
  	const compareLoose = requireCompareLoose();
  	const compareBuild = requireCompareBuild();
  	const sort = requireSort();
  	const rsort = requireRsort();
  	const gt = requireGt();
  	const lt = requireLt();
  	const eq = requireEq();
  	const neq = requireNeq();
  	const gte = requireGte();
  	const lte = requireLte();
  	const cmp = requireCmp();
  	const coerce = requireCoerce();
  	const Comparator = requireComparator();
  	const Range = requireRange();
  	const satisfies = requireSatisfies();
  	const toComparators = requireToComparators();
  	const maxSatisfying = requireMaxSatisfying();
  	const minSatisfying = requireMinSatisfying();
  	const minVersion = requireMinVersion();
  	const validRange = requireValid();
  	const outside = requireOutside();
  	const gtr = requireGtr();
  	const ltr = requireLtr();
  	const intersects = requireIntersects();
  	const simplifyRange = requireSimplify();
  	const subset = requireSubset();
  	semver = {
  	  parse,
  	  valid,
  	  clean,
  	  inc,
  	  diff,
  	  major,
  	  minor,
  	  patch,
  	  prerelease,
  	  compare,
  	  rcompare,
  	  compareLoose,
  	  compareBuild,
  	  sort,
  	  rsort,
  	  gt,
  	  lt,
  	  eq,
  	  neq,
  	  gte,
  	  lte,
  	  cmp,
  	  coerce,
  	  Comparator,
  	  Range,
  	  satisfies,
  	  toComparators,
  	  maxSatisfying,
  	  minSatisfying,
  	  minVersion,
  	  validRange,
  	  outside,
  	  gtr,
  	  ltr,
  	  intersects,
  	  simplifyRange,
  	  subset,
  	  SemVer,
  	  re: internalRe.re,
  	  src: internalRe.src,
  	  tokens: internalRe.t,
  	  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
  	  RELEASE_TYPES: constants.RELEASE_TYPES,
  	  compareIdentifiers: identifiers.compareIdentifiers,
  	  rcompareIdentifiers: identifiers.rcompareIdentifiers,
  	};
  	return semver;
  }

  var version = "4.7.0";
  var require$$1 = {
  	version: version};

  var type$3 = "object";
  var properties$3 = {
  	privileges: {
  		type: "array",
  		description: "Defines required privileges for the visual",
  		items: {
  			$ref: "#/definitions/privilege"
  		}
  	},
  	dataRoles: {
  		type: "array",
  		description: "Defines data roles for the visual",
  		items: {
  			$ref: "#/definitions/dataRole"
  		}
  	},
  	dataViewMappings: {
  		type: "array",
  		description: "Defines data mappings for the visual",
  		items: {
  			$ref: "#/definitions/dataViewMapping"
  		}
  	},
  	objects: {
  		$ref: "#/definitions/objects"
  	},
  	tooltips: {
  		$ref: "#/definitions/tooltips"
  	},
  	sorting: {
  		$ref: "#/definitions/sorting"
  	},
  	drilldown: {
  		$ref: "#/definitions/drilldown"
  	},
  	expandCollapse: {
  		$ref: "#/definitions/expandCollapse"
  	},
  	suppressDefaultTitle: {
  		type: "boolean",
  		description: "Indicates whether the visual should show a default title"
  	},
  	supportsKeyboardFocus: {
  		type: "boolean",
  		description: "Allows the visual to receive focus through keyboard navigation"
  	},
  	supportsHighlight: {
  		type: "boolean",
  		description: "Tells the host to include highlight data"
  	},
  	supportsSynchronizingFilterState: {
  		type: "boolean",
  		description: "Indicates whether the visual supports synchronization across report pages (for slicer visuals only)"
  	},
  	advancedEditModeSupport: {
  		type: "number",
  		description: "Indicates the action requested from the host when this visual enters Advanced Edit mode."
  	},
  	supportsLandingPage: {
  		type: "boolean",
  		description: "Indicates whether the visual supports a landing page"
  	},
  	supportsEmptyDataView: {
  		type: "boolean",
  		description: "Indicates whether the visual can receive formatting pane properties when it has no dataroles"
  	},
  	supportsMultiVisualSelection: {
  		type: "boolean",
  		description: "Indicates whether the visual supports multi selection"
  	},
  	subtotals: {
  		description: "Specifies the subtotal customizations applied in the customizeQuery method",
  		$ref: "#/definitions/subtotals"
  	}
  };
  var required$1 = [
  	"privileges"
  ];
  var additionalProperties = false;
  var definitions$2 = {
  	privilege: {
  		type: "object",
  		description: "privilege - Defines the name, essentiality, and optional parameters for a privilege",
  		properties: {
  			name: {
  				type: "string",
  				description: "The internal name of the privilege",
  				"enum": [
  					"WebAccess",
  					"LocalStorage",
  					"ExportContent"
  				]
  			},
  			essential: {
  				type: "boolean",
  				description: "Determines if the privilege is essential for the visual. Default value is false"
  			},
  			parameters: {
  				type: "array",
  				description: "Determines a list of privilege parameters if any",
  				items: {
  					type: "string",
  					description: "The privilege parameter"
  				}
  			}
  		},
  		required: [
  			"name"
  		]
  	},
  	dataRole: {
  		type: "object",
  		description: "dataRole - Defines the name, displayName, and kind of a data role",
  		properties: {
  			name: {
  				type: "string",
  				description: "The internal name for this data role used for all references to this role"
  			},
  			displayName: {
  				type: "string",
  				description: "The name of this data role that is shown to the user"
  			},
  			displayNameKey: {
  				type: "string",
  				description: "The localization key for the displayed name in the stringResourced file"
  			},
  			kind: {
  				description: "The kind of data that can be bound do this role",
  				$ref: "#/definitions/dataRole.kind"
  			},
  			description: {
  				type: "string",
  				description: "A description of this role shown to the user as a tooltip"
  			},
  			descriptionKey: {
  				type: "string",
  				description: "The localization key for the description in the stringResourced file"
  			},
  			preferredTypes: {
  				type: "array",
  				description: "Defines the preferred type of data for this data role",
  				items: {
  					$ref: "#/definitions/valueType"
  				}
  			},
  			requiredTypes: {
  				type: "array",
  				description: "Defines the required type of data for this data role. Any values that do not match will be set to null",
  				items: {
  					$ref: "#/definitions/valueType"
  				}
  			}
  		},
  		required: [
  			"name",
  			"displayName",
  			"kind"
  		],
  		additionalProperties: false
  	},
  	dataViewMapping: {
  		type: "object",
  		description: "dataMapping - Defines how data is mapped to data roles",
  		properties: {
  			conditions: {
  				type: "array",
  				description: "List of conditions that must be met for this data mapping",
  				items: {
  					type: "object",
  					description: "condition - Defines conditions for a data mapping (each key needs to be a valid data role)",
  					patternProperties: {
  						"^[\\w\\s-]+$": {
  							description: "Specifies the number of values that can be assigned to this data role in this mapping",
  							$ref: "#/definitions/dataViewMapping.numberRangeWithKind"
  						}
  					},
  					additionalProperties: false
  				}
  			},
  			single: {
  				$ref: "#/definitions/dataViewMapping.single"
  			},
  			categorical: {
  				$ref: "#/definitions/dataViewMapping.categorical"
  			},
  			table: {
  				$ref: "#/definitions/dataViewMapping.table"
  			},
  			matrix: {
  				$ref: "#/definitions/dataViewMapping.matrix"
  			},
  			scriptResult: {
  				$ref: "#/definitions/dataViewMapping.scriptResult"
  			}
  		},
  		anyOf: [
  			{
  				required: [
  					"single"
  				]
  			},
  			{
  				required: [
  					"categorical"
  				]
  			},
  			{
  				required: [
  					"table"
  				]
  			},
  			{
  				required: [
  					"matrix"
  				]
  			},
  			{
  				required: [
  					"scriptResult"
  				]
  			}
  		],
  		additionalProperties: false
  	},
  	"dataViewMapping.single": {
  		type: "object",
  		description: "single - Defines a single data mapping",
  		properties: {
  			role: {
  				type: "string",
  				description: "The data role to bind to this mapping"
  			}
  		},
  		required: [
  			"role"
  		],
  		additionalProperties: false
  	},
  	"dataViewMapping.categorical": {
  		type: "object",
  		description: "categorical - Defines a categorical data mapping",
  		properties: {
  			categories: {
  				type: "object",
  				description: "Defines data roles to be used as categories",
  				properties: {
  					bind: {
  						$ref: "#/definitions/dataViewMapping.bindTo"
  					},
  					"for": {
  						$ref: "#/definitions/dataViewMapping.forIn"
  					},
  					select: {
  						$ref: "#/definitions/dataViewMapping.select"
  					},
  					dataReductionAlgorithm: {
  						$ref: "#/definitions/dataViewMapping.dataReductionAlgorithm"
  					}
  				},
  				oneOf: [
  					{
  						required: [
  							"for"
  						]
  					},
  					{
  						required: [
  							"bind"
  						]
  					},
  					{
  						required: [
  							"select"
  						]
  					}
  				]
  			},
  			values: {
  				type: "object",
  				description: "Defines data roles to be used as values",
  				properties: {
  					bind: {
  						$ref: "#/definitions/dataViewMapping.bindTo"
  					},
  					"for": {
  						$ref: "#/definitions/dataViewMapping.forIn"
  					},
  					select: {
  						$ref: "#/definitions/dataViewMapping.select"
  					},
  					group: {
  						type: "object",
  						description: "Groups on a a specific data role",
  						properties: {
  							by: {
  								description: "Specifies a data role to use for grouping",
  								type: "string"
  							},
  							select: {
  								$ref: "#/definitions/dataViewMapping.select"
  							},
  							dataReductionAlgorithm: {
  								$ref: "#/definitions/dataViewMapping.dataReductionAlgorithm"
  							}
  						},
  						required: [
  							"by",
  							"select"
  						]
  					}
  				},
  				oneOf: [
  					{
  						required: [
  							"for"
  						]
  					},
  					{
  						required: [
  							"bind"
  						]
  					},
  					{
  						required: [
  							"select"
  						]
  					},
  					{
  						required: [
  							"group"
  						]
  					}
  				]
  			},
  			dataVolume: {
  				$ref: "#/definitions/dataViewMapping.dataVolume"
  			}
  		},
  		additionalProperties: false
  	},
  	"dataViewMapping.table": {
  		type: "object",
  		description: "table - Defines a table data mapping",
  		properties: {
  			rows: {
  				type: "object",
  				description: "Rows to use for the table",
  				properties: {
  					bind: {
  						$ref: "#/definitions/dataViewMapping.bindTo"
  					},
  					"for": {
  						$ref: "#/definitions/dataViewMapping.forIn"
  					},
  					select: {
  						$ref: "#/definitions/dataViewMapping.select"
  					},
  					dataReductionAlgorithm: {
  						$ref: "#/definitions/dataViewMapping.dataReductionAlgorithm"
  					}
  				},
  				oneOf: [
  					{
  						required: [
  							"for"
  						]
  					},
  					{
  						required: [
  							"bind"
  						]
  					},
  					{
  						required: [
  							"select"
  						]
  					}
  				]
  			},
  			rowCount: {
  				type: "object",
  				description: "Specifies a constraint on the number of data rows supported by the visual",
  				properties: {
  					preferred: {
  						description: "Specifies a preferred range of values for the constraint",
  						$ref: "#/definitions/dataViewMapping.numberRange"
  					},
  					supported: {
  						description: "Specifies a supported range of values for the constraint. Defaults to preferred if not specified.",
  						$ref: "#/definitions/dataViewMapping.numberRange"
  					}
  				}
  			},
  			dataVolume: {
  				$ref: "#/definitions/dataViewMapping.dataVolume"
  			}
  		},
  		requires: [
  			"rows"
  		]
  	},
  	"dataViewMapping.matrix": {
  		type: "object",
  		description: "matrix - Defines a matrix data mapping",
  		properties: {
  			rows: {
  				type: "object",
  				description: "Defines the rows used for the matrix",
  				properties: {
  					"for": {
  						$ref: "#/definitions/dataViewMapping.forIn"
  					},
  					select: {
  						$ref: "#/definitions/dataViewMapping.select"
  					},
  					dataReductionAlgorithm: {
  						$ref: "#/definitions/dataViewMapping.dataReductionAlgorithm"
  					}
  				},
  				oneOf: [
  					{
  						required: [
  							"for"
  						]
  					},
  					{
  						required: [
  							"select"
  						]
  					}
  				]
  			},
  			columns: {
  				type: "object",
  				description: "Defines the columns used for the matrix",
  				properties: {
  					"for": {
  						$ref: "#/definitions/dataViewMapping.forIn"
  					},
  					dataReductionAlgorithm: {
  						$ref: "#/definitions/dataViewMapping.dataReductionAlgorithm"
  					}
  				},
  				required: [
  					"for"
  				]
  			},
  			values: {
  				type: "object",
  				description: "Defines the values used for the matrix",
  				properties: {
  					"for": {
  						$ref: "#/definitions/dataViewMapping.forIn"
  					},
  					select: {
  						$ref: "#/definitions/dataViewMapping.select"
  					}
  				},
  				oneOf: [
  					{
  						required: [
  							"for"
  						]
  					},
  					{
  						required: [
  							"select"
  						]
  					}
  				]
  			},
  			dataVolume: {
  				$ref: "#/definitions/dataViewMapping.dataVolume"
  			}
  		}
  	},
  	"dataViewMapping.scriptResult": {
  		type: "object",
  		description: "scriptResult - Defines a scriptResult data mapping",
  		properties: {
  			dataInput: {
  				type: "object",
  				description: "dataInput - Defines how data is mapped to data roles",
  				properties: {
  					table: {
  						$ref: "#/definitions/dataViewMapping.table"
  					}
  				}
  			},
  			script: {
  				type: "object",
  				description: "script - Defines where the script text and provider are stored",
  				properties: {
  					scriptSourceDefault: {
  						type: "string",
  						description: "scriptSourceDefault - Defines the default script source value to be used when no script object is defined"
  					},
  					scriptProviderDefault: {
  						type: "string",
  						description: "scriptProviderDefault - Defines the default script provider value to be used when no provider object is defined"
  					},
  					scriptOutputType: {
  						type: "string",
  						description: "scriptOutputType - Defines the output type that the R script will generate"
  					},
  					source: {
  						$ref: "#/definitions/dataViewObjectPropertyIdentifier"
  					},
  					provider: {
  						$ref: "#/definitions/dataViewObjectPropertyIdentifier"
  					}
  				}
  			}
  		}
  	},
  	dataViewObjectPropertyIdentifier: {
  		type: "object",
  		description: "Points to an object property",
  		properties: {
  			objectName: {
  				type: "string",
  				description: "The name of a object"
  			},
  			propertyName: {
  				type: "string",
  				description: "The name of a property inside the object"
  			}
  		}
  	},
  	"dataViewMapping.bindTo": {
  		type: "object",
  		description: "Binds this data mapping to a single value",
  		properties: {
  			to: {
  				type: "string",
  				description: "The name of a data role to bind to"
  			}
  		},
  		additionalProperties: false,
  		required: [
  			"to"
  		]
  	},
  	"dataViewMapping.numberRange": {
  		type: "object",
  		description: "A number range from min to max",
  		properties: {
  			min: {
  				type: "number",
  				description: "Minimum value supported"
  			},
  			max: {
  				type: "number",
  				description: "Maximum value supported"
  			}
  		}
  	},
  	"dataViewMapping.numberRangeWithKind": {
  		allOf: [
  			{
  				$ref: "#/definitions/dataViewMapping.numberRange"
  			},
  			{
  				properties: {
  					kind: {
  						$ref: "#/definitions/dataRole.kind"
  					}
  				}
  			}
  		]
  	},
  	"dataRole.kind": {
  		type: "string",
  		"enum": [
  			"Grouping",
  			"Measure",
  			"GroupingOrMeasure"
  		]
  	},
  	"dataViewMapping.select": {
  		type: "array",
  		description: "Defines a list of properties to bind",
  		items: {
  			type: "object",
  			properties: {
  				bind: {
  					$ref: "#/definitions/dataViewMapping.bindTo"
  				},
  				"for": {
  					$ref: "#/definitions/dataViewMapping.forIn"
  				}
  			},
  			oneOf: [
  				{
  					required: [
  						"for"
  					]
  				},
  				{
  					required: [
  						"bind"
  					]
  				}
  			]
  		}
  	},
  	"dataViewMapping.dataReductionAlgorithm": {
  		type: "object",
  		description: "Describes how to reduce the amount of data exposed to the visual",
  		properties: {
  			top: {
  				type: "object",
  				description: "Reduce the data to the Top count items",
  				properties: {
  					count: {
  						type: "number"
  					}
  				}
  			},
  			bottom: {
  				type: "object",
  				description: "Reduce the data to the Bottom count items",
  				properties: {
  					count: {
  						type: "number"
  					}
  				}
  			},
  			sample: {
  				type: "object",
  				description: "Reduce the data using a simple Sample of count items",
  				properties: {
  					count: {
  						type: "number"
  					}
  				}
  			},
  			window: {
  				type: "object",
  				description: "Allow the data to be loaded one window, containing count items, at a time",
  				properties: {
  					count: {
  						type: "number"
  					}
  				}
  			}
  		},
  		additionalProperties: false,
  		oneOf: [
  			{
  				required: [
  					"top"
  				]
  			},
  			{
  				required: [
  					"bottom"
  				]
  			},
  			{
  				required: [
  					"sample"
  				]
  			},
  			{
  				required: [
  					"window"
  				]
  			}
  		]
  	},
  	"dataViewMapping.dataVolume": {
  		description: "Specifies the volume of data the query should return (1-6)",
  		type: "number",
  		"enum": [
  			1,
  			2,
  			3,
  			4,
  			5,
  			6
  		]
  	},
  	"dataViewMapping.forIn": {
  		type: "object",
  		description: "Binds this data mapping for all items in a collection",
  		properties: {
  			"in": {
  				type: "string",
  				description: "The name of a data role to iterate over"
  			}
  		},
  		additionalProperties: false,
  		required: [
  			"in"
  		]
  	},
  	objects: {
  		type: "object",
  		description: "A list of unique property groups",
  		patternProperties: {
  			"^[\\w\\s-]+$": {
  				type: "object",
  				description: "Settings for a group of properties",
  				properties: {
  					displayName: {
  						type: "string",
  						description: "The name shown to the user to describe this group of properties"
  					},
  					displayNameKey: {
  						type: "string",
  						description: "The localization key for the displayed name in the stringResourced file"
  					},
  					objectCategory: {
  						type: "number",
  						description: "What aspect of the visual this object controlls (1 = Formatting, 2 = Analytics). Formatting: look & feel, colors, axes, labels etc. Analytics: forcasts, trendlines, reference lines and shapes etc."
  					},
  					description: {
  						type: "string",
  						description: "A description of this object shown to the user as a tooltip"
  					},
  					descriptionKey: {
  						type: "string",
  						description: "The localization key for the description in the stringResourced file"
  					},
  					properties: {
  						type: "object",
  						description: "A list of unique properties contained in this group",
  						patternProperties: {
  							"^[\\w\\s-]+$": {
  								$ref: "#/definitions/object.propertySettings"
  							}
  						},
  						additionalProperties: false
  					}
  				},
  				additionalProperties: false
  			}
  		},
  		additionalProperties: false
  	},
  	tooltips: {
  		type: "object",
  		description: "Instructs the host to include tooltips ability",
  		properties: {
  			supportedTypes: {
  				type: "object",
  				description: "Instructs the host what tooltip types to support",
  				properties: {
  					"default": {
  						type: "boolean",
  						description: "Instructs the host to support showing default tooltips"
  					},
  					canvas: {
  						type: "boolean",
  						description: "Instructs the host to support showing canvas tooltips"
  					}
  				}
  			},
  			roles: {
  				type: "array",
  				items: {
  					type: "string",
  					description: "The name of the data role to bind the tooltips selected info to"
  				}
  			},
  			supportEnhancedTooltips: {
  				type: "boolean",
  				description: "Indicates whether the visual support modern tooltip feature"
  			}
  		}
  	},
  	"object.propertySettings": {
  		type: "object",
  		description: "Settings for a property",
  		properties: {
  			displayName: {
  				type: "string",
  				description: "The name shown to the user to describe this property"
  			},
  			displayNameKey: {
  				type: "string",
  				description: "The localization key for the displayed name in the stringResourced file"
  			},
  			description: {
  				type: "string",
  				description: "A description of this property shown to the user as a tooltip"
  			},
  			descriptionKey: {
  				type: "string",
  				description: "The localization key for the description in the stringResourced file"
  			},
  			placeHolderText: {
  				type: "string",
  				description: "Text to display if the field is empty"
  			},
  			placeHolderTextKey: {
  				type: "string",
  				description: "The localization key for the placeHolderText in the stringResources file"
  			},
  			suppressFormatPainterCopy: {
  				type: "boolean",
  				description: "Indicates whether the Format Painter should ignore this property"
  			},
  			type: {
  				description: "Describes what type of property this is and how it should be displayed to the user",
  				$ref: "#/definitions/valueType"
  			},
  			rule: {
  				type: "object",
  				description: "Describes substitution rule that replaces property object, described inside the rule, to current property object that contains this rule",
  				$ref: "#/definitions/substitutionRule"
  			},
  			filterState: {
  				type: "boolean",
  				description: "Indicates whether the property is a part of filtration information"
  			}
  		},
  		additionalProperties: false
  	},
  	substitutionRule: {
  		type: "object",
  		description: "Describes substitution rule that replaces property object, described inside the rule, to current property object that contains this rule",
  		properties: {
  			inputRole: {
  				type: "string",
  				description: "The name of role. If this role is set, the substitution will be applied"
  			},
  			output: {
  				type: "object",
  				description: "Describes what exactly is necessary to replace",
  				properties: {
  					property: {
  						type: "string",
  						description: "The name of property object that will be replaced"
  					},
  					selector: {
  						type: "array",
  						description: "The array of selector names. Usually, it contains only one selector -- 'Category'",
  						items: {
  							type: "string",
  							description: "The name of selector"
  						}
  					}
  				}
  			}
  		}
  	},
  	sorting: {
  		type: "object",
  		description: "Specifies the default sorting behavior for the visual",
  		properties: {
  			"default": {
  				type: "object",
  				additionalProperties: false
  			},
  			custom: {
  				type: "object",
  				additionalProperties: false
  			},
  			implicit: {
  				type: "object",
  				description: "implicit sort",
  				properties: {
  					clauses: {
  						type: "array",
  						items: {
  							type: "object",
  							properties: {
  								role: {
  									type: "string"
  								},
  								direction: {
  									type: "number",
  									description: "Determines sort direction (1 = Ascending, 2 = Descending)",
  									"enum": [
  										1,
  										2
  									]
  								}
  							},
  							additionalProperties: false
  						}
  					}
  				},
  				additionalProperties: false
  			}
  		},
  		additionalProperties: false,
  		oneOf: [
  			{
  				required: [
  					"default"
  				]
  			},
  			{
  				required: [
  					"custom"
  				]
  			},
  			{
  				required: [
  					"implicit"
  				]
  			}
  		]
  	},
  	drilldown: {
  		type: "object",
  		description: "Defines the visual's drill capability",
  		properties: {
  			roles: {
  				type: "array",
  				description: "The drillable role names for this visual",
  				items: {
  					type: "string",
  					description: "The name of the role"
  				}
  			}
  		}
  	},
  	expandCollapse: {
  		type: "object",
  		description: "Defines the visual's expandCollapse capability",
  		properties: {
  			roles: {
  				type: "array",
  				description: "The expandCollapsed role names for this visual",
  				items: {
  					type: "string",
  					description: "The name of the role"
  				}
  			},
  			addDataViewFlags: {
  				type: "object",
  				description: "The data view flags",
  				defaultValue: {
  					type: "boolean",
  					description: "Indicates if the DataViewTreeNode will contain the isCollapsed flag by default"
  				}
  			},
  			supportsMerge: {
  				type: "boolean",
  				description: "Indicates that the expansion state should be updated when query projections change, instead of being reset."
  			},
  			restoreProjectionsOrderFromBookmark: {
  				type: "boolean",
  				description: "Indicates that the bookmarked expansion state should be restored even if the query projections order no longer matches the expansion state levels."
  			}
  		}
  	},
  	valueType: {
  		type: "object",
  		properties: {
  			bool: {
  				type: "boolean",
  				description: "A boolean value that will be displayed to the user as a toggle switch"
  			},
  			enumeration: {
  				type: "array",
  				description: "A list of values that will be displayed as a drop down list",
  				items: {
  					type: "object",
  					description: "Describes an item in the enumeration list",
  					properties: {
  						displayName: {
  							type: "string",
  							description: "The name shown to the user to describe this item"
  						},
  						displayNameKey: {
  							type: "string",
  							description: "The localization key for the displayed name in the stringResourced file"
  						},
  						value: {
  							type: "string",
  							description: "The internal value of this property when this item is selected"
  						}
  					}
  				}
  			},
  			fill: {
  				type: "object",
  				description: "A color value that will be displayed to the user as a color picker",
  				properties: {
  					solid: {
  						type: "object",
  						description: "A solid color value that will be displayed to the user as a color picker",
  						properties: {
  							color: {
  								oneOf: [
  									{
  										type: "boolean"
  									},
  									{
  										type: "object",
  										properties: {
  											nullable: {
  												description: "Allows the user to select 'no fill' for the color",
  												type: "boolean"
  											}
  										}
  									}
  								]
  							}
  						}
  					}
  				}
  			},
  			fillRule: {
  				type: "object",
  				description: "A color gradient that will be dispalyed to the user as a minimum (,medium) and maximum color pickers",
  				properties: {
  					linearGradient2: {
  						type: "object",
  						description: "Two color gradient",
  						properties: {
  							max: {
  								type: "object",
  								description: "Maximum color for gradient",
  								properties: {
  									color: {
  										type: "string"
  									},
  									value: {
  										type: "number"
  									}
  								}
  							},
  							min: {
  								type: "object",
  								description: "Minimum color for gradient",
  								properties: {
  									color: {
  										type: "string"
  									},
  									value: {
  										type: "number"
  									}
  								}
  							},
  							nullColoringStrategy: {
  								type: "object",
  								description: "Null color strategy"
  							}
  						}
  					},
  					linearGradient3: {
  						type: "object",
  						description: "Three color gradient",
  						properties: {
  							max: {
  								type: "object",
  								description: "Maximum color for gradient",
  								properties: {
  									color: {
  										type: "string"
  									},
  									value: {
  										type: "number"
  									}
  								}
  							},
  							min: {
  								type: "object",
  								description: "Minimum color for gradient",
  								properties: {
  									color: {
  										type: "string"
  									},
  									value: {
  										type: "number"
  									}
  								}
  							},
  							mid: {
  								type: "object",
  								description: "Middle color for gradient",
  								properties: {
  									color: {
  										type: "string"
  									},
  									value: {
  										type: "number"
  									}
  								}
  							},
  							nullColoringStrategy: {
  								type: "object",
  								description: "Null color strategy"
  							}
  						}
  					}
  				}
  			},
  			formatting: {
  				type: "object",
  				description: "A numeric value that will be displayed to the user as a text input",
  				properties: {
  					labelDisplayUnits: {
  						type: "boolean",
  						description: "Displays a dropdown with common display units (Auto, None, Thousands, Millions, Billions, Trillions)"
  					},
  					alignment: {
  						type: "boolean",
  						description: "Displays a selector to allow the user to choose left, center, or right alignment"
  					},
  					fontSize: {
  						type: "boolean",
  						description: "Displays a slider that allows the user to choose a font size in points"
  					},
  					fontFamily: {
  						type: "boolean",
  						description: "Displays a dropdown with font families"
  					},
  					formatString: {
  						type: "boolean",
  						description: "Displays dynamic format string"
  					}
  				},
  				additionalProperties: false,
  				oneOf: [
  					{
  						required: [
  							"labelDisplayUnits"
  						]
  					},
  					{
  						required: [
  							"alignment"
  						]
  					},
  					{
  						required: [
  							"fontSize"
  						]
  					},
  					{
  						required: [
  							"fontFamily"
  						]
  					},
  					{
  						required: [
  							"formatString"
  						]
  					}
  				]
  			},
  			integer: {
  				type: "boolean",
  				description: "An integer (whole number) value that will be displayed to the user as a text input"
  			},
  			numeric: {
  				type: "boolean",
  				description: "A numeric value that will be displayed to the user as a text input"
  			},
  			filter: {
  				oneOf: [
  					{
  						type: "boolean"
  					},
  					{
  						type: "object",
  						properties: {
  							selfFilter: {
  								type: "boolean"
  							}
  						}
  					}
  				],
  				description: "A filter"
  			},
  			operations: {
  				type: "object",
  				description: "A visual operation",
  				properties: {
  					searchEnabled: {
  						type: "boolean",
  						description: "Turns search ability on"
  					}
  				}
  			},
  			text: {
  				type: "boolean",
  				description: "A text value that will be displayed to the user as a text input"
  			},
  			scripting: {
  				type: "object",
  				description: "A text value that will be displayed to the user as a script",
  				properties: {
  					source: {
  						type: "boolean",
  						description: "A source code"
  					}
  				}
  			},
  			geography: {
  				type: "object",
  				description: "Geographical data",
  				properties: {
  					address: {
  						type: "boolean"
  					},
  					city: {
  						type: "boolean"
  					},
  					continent: {
  						type: "boolean"
  					},
  					country: {
  						type: "boolean"
  					},
  					county: {
  						type: "boolean"
  					},
  					region: {
  						type: "boolean"
  					},
  					postalCode: {
  						type: "boolean"
  					},
  					stateOrProvince: {
  						type: "boolean"
  					},
  					place: {
  						type: "boolean"
  					},
  					latitude: {
  						type: "boolean"
  					},
  					longitude: {
  						type: "boolean"
  					}
  				}
  			}
  		},
  		additionalProperties: false,
  		oneOf: [
  			{
  				required: [
  					"bool"
  				]
  			},
  			{
  				required: [
  					"enumeration"
  				]
  			},
  			{
  				required: [
  					"fill"
  				]
  			},
  			{
  				required: [
  					"fillRule"
  				]
  			},
  			{
  				required: [
  					"formatting"
  				]
  			},
  			{
  				required: [
  					"integer"
  				]
  			},
  			{
  				required: [
  					"numeric"
  				]
  			},
  			{
  				required: [
  					"text"
  				]
  			},
  			{
  				required: [
  					"geography"
  				]
  			},
  			{
  				required: [
  					"scripting"
  				]
  			},
  			{
  				required: [
  					"filter"
  				]
  			},
  			{
  				required: [
  					"operations"
  				]
  			}
  		]
  	},
  	subtotals: {
  		type: "object",
  		description: "Specifies the subtotal request customizations applied to the outgoing data query",
  		properties: {
  			matrix: {
  				description: "Defines the subtotal customizations of the outgoing data query of a matrix-dataview visual",
  				$ref: "#/definitions/subtotals.matrix"
  			}
  		},
  		requires: [
  			"matrix"
  		]
  	},
  	"subtotals.matrix": {
  		type: "object",
  		description: "Specifies the subtotal customizations of the outgoing data query of a matrix-dataview visual",
  		properties: {
  			rowSubtotals: {
  				type: "object",
  				description: "Indicates if the subtotal data should be requested for all fields in the rows field well",
  				properties: {
  					propertyIdentifier: {
  						type: "object",
  						properties: {
  							objectName: {
  								type: "string"
  							},
  							propertyName: {
  								type: "string"
  							}
  						}
  					},
  					defaultValue: {
  						type: "boolean"
  					}
  				}
  			},
  			rowSubtotalsPerLevel: {
  				type: "object",
  				description: "Indicates if the subtotal data can be toggled for individual fields in the rows field well",
  				properties: {
  					propertyIdentifier: {
  						type: "object",
  						properties: {
  							objectName: {
  								type: "string"
  							},
  							propertyName: {
  								type: "string"
  							}
  						}
  					},
  					defaultValue: {
  						type: "boolean"
  					}
  				}
  			},
  			columnSubtotals: {
  				type: "object",
  				description: "Indicates if the subtotal data should be requested for all fields in the columns field well",
  				properties: {
  					propertyIdentifier: {
  						type: "object",
  						properties: {
  							objectName: {
  								type: "string"
  							},
  							propertyName: {
  								type: "string"
  							}
  						}
  					},
  					defaultValue: {
  						type: "boolean"
  					}
  				}
  			},
  			columnSubtotalsPerLevel: {
  				type: "object",
  				description: "Indicates if the subtotal data can be toggled for individual fields in the columns field well",
  				properties: {
  					propertyIdentifier: {
  						type: "object",
  						properties: {
  							objectName: {
  								type: "string"
  							},
  							propertyName: {
  								type: "string"
  							}
  						}
  					},
  					defaultValue: {
  						type: "boolean"
  					}
  				}
  			},
  			levelSubtotalEnabled: {
  				type: "object",
  				description: "Unlike all other properites, this property is applied to individual rows/columns. The property indicates if the subtotals are requested for the row/column",
  				properties: {
  					propertyIdentifier: {
  						type: "object",
  						properties: {
  							objectName: {
  								type: "string"
  							},
  							propertyName: {
  								type: "string"
  							}
  						}
  					},
  					defaultValue: {
  						type: "boolean"
  					}
  				}
  			}
  		},
  		requires: [
  			"matrix"
  		]
  	}
  };
  var require$$2 = {
  	type: type$3,
  	properties: properties$3,
  	required: required$1,
  	additionalProperties: additionalProperties,
  	definitions: definitions$2
  };

  var type$2 = "object";
  var properties$2 = {
  	apiVersion: {
  		type: "string",
  		description: "Version of the IVisual API"
  	},
  	author: {
  		type: "object",
  		description: "Information about the author of the visual",
  		properties: {
  			name: {
  				type: "string",
  				description: "Name of the visual author. This is displayed to users."
  			},
  			email: {
  				type: "string",
  				description: "E-mail of the visual author. This is displayed to users for support."
  			}
  		}
  	},
  	assets: {
  		type: "object",
  		description: "Assets used by the visual",
  		properties: {
  			icon: {
  				type: "string",
  				description: "A 20x20 png icon used to represent the visual"
  			}
  		}
  	},
  	externalJS: {
  		type: "array",
  		description: "An array of relative paths to 3rd party javascript libraries to load",
  		items: {
  			type: "string"
  		}
  	},
  	stringResources: {
  		type: "array",
  		description: "An array of relative paths to string resources to load",
  		items: {
  			type: "string"
  		},
  		uniqueItems: true
  	},
  	style: {
  		type: "string",
  		description: "Relative path to the stylesheet (less) for the visual"
  	},
  	capabilities: {
  		type: "string",
  		description: "Relative path to the visual capabilities json file"
  	},
  	visual: {
  		type: "object",
  		description: "Details about this visual",
  		properties: {
  			description: {
  				type: "string",
  				description: "What does this visual do?"
  			},
  			name: {
  				type: "string",
  				description: "Internal visual name"
  			},
  			displayName: {
  				type: "string",
  				description: "A friendly name"
  			},
  			externals: {
  				type: "array",
  				description: "External files (such as JavaScript) that you would like to include"
  			},
  			guid: {
  				type: "string",
  				description: "Unique identifier for the visual"
  			},
  			visualClassName: {
  				type: "string",
  				description: "Class of your IVisual"
  			},
  			icon: {
  				type: "string",
  				description: "Icon path"
  			},
  			version: {
  				type: "string",
  				description: "Visual version"
  			},
  			gitHubUrl: {
  				type: "string",
  				description: "Url to the github repository for this visual"
  			},
  			supportUrl: {
  				type: "string",
  				description: "Url to the support page for this visual"
  			}
  		}
  	}
  };
  var require$$3 = {
  	type: type$2,
  	properties: properties$2
  };

  var type$1 = "object";
  var properties$1 = {
  	cranPackages: {
  		type: "array",
  		description: "An array of the Cran packages required for the custom R visual script to operate",
  		items: {
  			$ref: "#/definitions/cranPackage"
  		}
  	}
  };
  var definitions$1 = {
  	cranPackage: {
  		type: "object",
  		description: "cranPackage - Defines the name and displayName of a required Cran package",
  		properties: {
  			name: {
  				type: "string",
  				description: "The name for this Cran package"
  			},
  			displayName: {
  				type: "string",
  				description: "The name for this Cran package that is shown to the user"
  			},
  			url: {
  				type: "string",
  				description: "A url for package documentation in Cran website"
  			}
  		},
  		required: [
  			"name",
  			"url"
  		],
  		additionalProperties: false
  	}
  };
  var require$$4 = {
  	type: type$1,
  	properties: properties$1,
  	definitions: definitions$1
  };

  var type = "object";
  var properties = {
  	locale: {
  		$ref: "#/definitions/localeOptions"
  	},
  	values: {
  		type: "object",
  		description: "translations for the display name keys in the capabilities",
  		additionalProperties: {
  			type: "string"
  		}
  	}
  };
  var required = [
  	"locale"
  ];
  var definitions = {
  	localeOptions: {
  		description: "Specifies the locale key from a list of supported locales",
  		type: "string",
  		"enum": [
  			"ar-SA",
  			"bg-BG",
  			"ca-ES",
  			"cs-CZ",
  			"da-DK",
  			"de-DE",
  			"el-GR",
  			"en-US",
  			"es-ES",
  			"et-EE",
  			"eu-ES",
  			"fi-FI",
  			"fr-FR",
  			"gl-ES",
  			"he-IL",
  			"hi-IN",
  			"hr-HR",
  			"hu-HU",
  			"id-ID",
  			"it-IT",
  			"ja-JP",
  			"kk-KZ",
  			"ko-KR",
  			"lt-LT",
  			"lv-LV",
  			"ms-MY",
  			"nb-NO",
  			"nl-NL",
  			"pl-PL",
  			"pt-BR",
  			"pt-PT",
  			"ro-RO",
  			"ru-RU",
  			"sk-SK",
  			"sl-SI",
  			"sr-Cyrl-RS",
  			"sr-Latn-RS",
  			"sv-SE",
  			"th-TH",
  			"tr-TR",
  			"uk-UA",
  			"vi-VN",
  			"zh-CN",
  			"zh-TW"
  		]
  	}
  };
  var require$$5 = {
  	type: type,
  	properties: properties,
  	required: required,
  	definitions: definitions
  };

  var hasRequiredPowerbiVisualsApi;

  function requirePowerbiVisualsApi () {
  	if (hasRequiredPowerbiVisualsApi) return powerbiVisualsApi;
  	hasRequiredPowerbiVisualsApi = 1;
  	const semver = requireSemver();

  	let packageVersion = require$$1.version;
  	let apiVersion = `${semver.major(packageVersion)}.${semver.minor(packageVersion)}.0`;

  	powerbiVisualsApi.version = apiVersion;

  	powerbiVisualsApi.schemas = {
  	    capabilities: require$$2,
  	    pbiviz: require$$3,
  	    dependencies: require$$4,
  	    stringResources: require$$5
  	};
  	return powerbiVisualsApi;
  }

  requirePowerbiVisualsApi();

  const valueNames = {
      "i": "Observation",
      "i_m": "Observation",
      "i_mm": "Observation",
      "c": "Count",
      "t": "Time",
      "xbar": "Group Mean",
      "s": "Group SD",
      "g": "Non-Events",
      "run": "Observation",
      "mr": "Moving Range",
      "p": "Proportion",
      "pp": "Proportion",
      "u": "Rate",
      "up": "Rate"
  };
  class derivedSettingsClass {
      update(inputSettingsSpc) {
          const chartType = inputSettingsSpc.chart_type;
          const pChartType = ["p", "pp"].includes(chartType);
          const percentSettingString = inputSettingsSpc.perc_labels;
          let multiplier = inputSettingsSpc.multiplier;
          let percentLabels;
          if (percentSettingString === "Yes") {
              multiplier = 100;
          }
          if (pChartType && percentSettingString !== "No") {
              multiplier = multiplier === 1 ? 100 : multiplier;
          }
          if (percentSettingString === "Automatic") {
              percentLabels = pChartType && multiplier === 100;
          }
          else {
              percentLabels = percentSettingString === "Yes";
          }
          this.chart_type_props = {
              name: chartType,
              needs_denominator: ["p", "pp", "u", "up", "xbar", "s"].includes(chartType),
              denominator_optional: ["i", "i_m", "i_mm", "run", "mr"].includes(chartType),
              numerator_non_negative: ["p", "pp", "u", "up", "s", "c", "g", "t"].includes(chartType),
              numerator_leq_denominator: ["p", "pp", "u", "up"].includes(chartType),
              has_control_limits: !(["run"].includes(chartType)),
              needs_sd: ["xbar"].includes(chartType),
              integer_num_den: ["c", "p", "pp"].includes(chartType),
              value_name: valueNames[chartType]
          };
          this.multiplier = multiplier;
          this.percentLabels = percentLabels;
      }
  }

  class settingsClass {
      update(inputView, groupIdxs) {
          var _a, _b;
          this.validationStatus
              = JSON.parse(JSON.stringify({ status: 0, messages: new Array(), error: "" }));
          const allSettingGroups = Object.keys(this.settings);
          const is_grouped = (_b = (_a = inputView.categorical) === null || _a === void 0 ? void 0 : _a.categories) === null || _b === void 0 ? void 0 : _b.some(d => d.source.roles.indicator);
          this.settingsGrouped = new Array();
          if (is_grouped) {
              groupIdxs.forEach(() => {
                  this.settingsGrouped.push(Object.fromEntries(Object.keys(defaultSettings).map((settingGroupName) => {
                      return [settingGroupName, Object.fromEntries(Object.keys(defaultSettings[settingGroupName]).map((settingName) => {
                              return [settingName, defaultSettings[settingGroupName][settingName]];
                          }))];
                  })));
              });
          }
          const all_idxs = groupIdxs.flat();
          allSettingGroups.forEach((settingGroup) => {
              const condFormatting = extractConditionalFormatting(inputView === null || inputView === void 0 ? void 0 : inputView.categorical, settingGroup, this.settings, all_idxs);
              if (condFormatting.validation.status !== 0) {
                  this.validationStatus.status = condFormatting.validation.status;
                  this.validationStatus.error = condFormatting.validation.error;
              }
              if (this.validationStatus.messages.length === 0) {
                  this.validationStatus.messages = condFormatting.validation.messages;
              }
              else if (!condFormatting.validation.messages.every(d => d.length === 0)) {
                  condFormatting.validation.messages.forEach((message, idx) => {
                      if (message.length > 0) {
                          this.validationStatus.messages[idx] = this.validationStatus.messages[idx].concat(message);
                      }
                  });
              }
              const settingNames = Object.keys(this.settings[settingGroup]);
              settingNames.forEach((settingName) => {
                  this.settings[settingGroup][settingName]
                      = (condFormatting === null || condFormatting === void 0 ? void 0 : condFormatting.values)
                          ? condFormatting === null || condFormatting === void 0 ? void 0 : condFormatting.values[0][settingName]
                          : defaultSettings[settingGroup][settingName]["default"];
                  if (is_grouped) {
                      groupIdxs.forEach((idx, idx_idx) => {
                          this.settingsGrouped[idx_idx][settingGroup][settingName]
                              = (condFormatting === null || condFormatting === void 0 ? void 0 : condFormatting.values)
                                  ? condFormatting === null || condFormatting === void 0 ? void 0 : condFormatting.values[idx[0]][settingName]
                                  : defaultSettings[settingGroup][settingName]["default"];
                      });
                  }
              });
          });
          if (this.settings.nhs_icons.show_variation_icons) {
              const patterns = ["astronomical", "shift", "trend", "two_in_three"];
              const anyOutlierPatterns = patterns.some(d => this.settings.outliers[d]);
              if (!anyOutlierPatterns) {
                  this.validationStatus.status = 1;
                  this.validationStatus.error = "Variation icons require at least one outlier pattern to be selected";
              }
          }
          if (this.settings.nhs_icons.show_assurance_icons) {
              const altTargetPresent = !isNullOrUndefined(this.settings.lines.alt_target);
              const improvementDirection = this.settings.outliers.improvement_direction;
              if (!altTargetPresent || improvementDirection === "neutral") {
                  this.validationStatus.status = 1;
                  this.validationStatus.error = "Assurance icons require an alternative target and a non-neutral improvement direction";
              }
          }
          this.derivedSettings.update(this.settings.spc);
          this.derivedSettingsGrouped = new Array();
          if (is_grouped) {
              this.settingsGrouped.forEach((d) => {
                  const newDerived = new derivedSettingsClass();
                  newDerived.update(d.spc);
                  this.derivedSettingsGrouped.push(newDerived);
              });
          }
      }
      getSettingNames(settingGroupName) {
          const settingsGrouped = Object.keys(settingsPaneGroupings)
              .includes(settingGroupName);
          return settingsGrouped
              ? JSON.parse(JSON.stringify(settingsPaneGroupings[settingGroupName]))
              : { "all": Object.keys(this.settings[settingGroupName]) };
      }
      createSettingsEntry(settingGroupName) {
          const paneGroupings = this.getSettingNames(settingGroupName);
          const rtnInstances = new Array();
          const rtnContainers = new Array();
          Object.keys(paneGroupings).forEach((currKey, idx) => {
              const props = Object.fromEntries(paneGroupings[currKey].map(currSetting => {
                  const settingValue = this.settings[settingGroupName][currSetting];
                  return [currSetting, settingValue];
              }));
              const propertyKinds = new Array();
              (paneGroupings[currKey]).forEach(setting => {
                  if ((typeof this.settings[settingGroupName][setting]) != "boolean") {
                      propertyKinds.push([setting, 3]);
                  }
              });
              rtnInstances.push({
                  objectName: settingGroupName,
                  properties: props,
                  propertyInstanceKind: Object.fromEntries(propertyKinds),
                  selector: { data: [{ dataViewWildcard: { matchingOption: 0 } }] },
                  validValues: Object.fromEntries(Object.keys(defaultSettings[settingGroupName]).map((settingName) => {
                      var _a;
                      return [settingName, (_a = defaultSettings[settingGroupName][settingName]) === null || _a === void 0 ? void 0 : _a["valid"]];
                  }))
              });
              if (currKey !== "all") {
                  rtnInstances[idx].containerIdx = idx;
                  rtnContainers.push({ displayName: currKey });
              }
          });
          return { instances: rtnInstances, containers: rtnContainers };
      }
      constructor() {
          this.settings = Object.fromEntries(Object.keys(defaultSettings).map((settingGroupName) => {
              return [settingGroupName, Object.fromEntries(Object.keys(defaultSettings[settingGroupName]).map((settingName) => {
                      return [settingName, defaultSettings[settingGroupName][settingName]];
                  }))];
          }));
          this.derivedSettings = new derivedSettingsClass();
      }
  }

  function cLimits(args) {
      const cl = mean(extractValues(args.numerators, args.subset_points));
      const sigma = Math.sqrt(cl);
      return {
          keys: args.keys,
          values: args.numerators,
          targets: rep(cl, args.keys.length),
          ll99: rep(truncate(cl - 3 * sigma, { lower: 0 }), args.keys.length),
          ll95: rep(truncate(cl - 2 * sigma, { lower: 0 }), args.keys.length),
          ll68: rep(truncate(cl - 1 * sigma, { lower: 0 }), args.keys.length),
          ul68: rep(cl + 1 * sigma, args.keys.length),
          ul95: rep(cl + 2 * sigma, args.keys.length),
          ul99: rep(cl + 3 * sigma, args.keys.length),
      };
  }

  function gLimits(args) {
      const cl = mean(extractValues(args.numerators, args.subset_points));
      const sigma = sqrt(cl * (cl + 1));
      return {
          keys: args.keys,
          values: args.numerators,
          targets: rep(median(extractValues(args.numerators, args.subset_points)), args.keys.length),
          ll99: rep(0, args.keys.length),
          ll95: rep(0, args.keys.length),
          ll68: rep(0, args.keys.length),
          ul68: rep(cl + 1 * sigma, args.keys.length),
          ul95: rep(cl + 2 * sigma, args.keys.length),
          ul99: rep(cl + 3 * sigma, args.keys.length)
      };
  }

  function iLimits(args) {
      const useRatio = (args.denominators && args.denominators.length > 0);
      const ratio = useRatio
          ? divide(args.numerators, args.denominators)
          : args.numerators;
      const ratio_subset = extractValues(ratio, args.subset_points);
      const cl = mean(ratio_subset);
      const consec_diff = abs(diff(ratio_subset));
      const consec_diff_ulim = mean(consec_diff) * 3.267;
      const outliers_in_limits = args.outliers_in_limits;
      const consec_diff_valid = outliers_in_limits ? consec_diff : consec_diff.filter(d => d < consec_diff_ulim);
      const sigma = mean(consec_diff_valid) / 1.128;
      return {
          keys: args.keys,
          values: ratio.map(d => isNaN(d) ? 0 : d),
          numerators: useRatio ? args.numerators : undefined,
          denominators: useRatio ? args.denominators : undefined,
          targets: rep(cl, args.keys.length),
          ll99: rep(cl - 3 * sigma, args.keys.length),
          ll95: rep(cl - 2 * sigma, args.keys.length),
          ll68: rep(cl - 1 * sigma, args.keys.length),
          ul68: rep(cl + 1 * sigma, args.keys.length),
          ul95: rep(cl + 2 * sigma, args.keys.length),
          ul99: rep(cl + 3 * sigma, args.keys.length)
      };
  }

  function imLimits$1(args) {
      const useRatio = (args.denominators && args.denominators.length > 0);
      const ratio = useRatio
          ? divide(args.numerators, args.denominators)
          : args.numerators;
      const ratio_subset = extractValues(ratio, args.subset_points);
      const cl = median(ratio_subset);
      const consec_diff = abs(diff(ratio_subset));
      const consec_diff_ulim = mean(consec_diff) * 3.267;
      const outliers_in_limits = args.outliers_in_limits;
      const consec_diff_valid = outliers_in_limits ? consec_diff : consec_diff.filter(d => d < consec_diff_ulim);
      const sigma = mean(consec_diff_valid) / 1.128;
      return {
          keys: args.keys,
          values: ratio.map(d => isNaN(d) ? 0 : d),
          numerators: useRatio ? args.numerators : undefined,
          denominators: useRatio ? args.denominators : undefined,
          targets: rep(cl, args.keys.length),
          ll99: rep(cl - 3 * sigma, args.keys.length),
          ll95: rep(cl - 2 * sigma, args.keys.length),
          ll68: rep(cl - 1 * sigma, args.keys.length),
          ul68: rep(cl + 1 * sigma, args.keys.length),
          ul95: rep(cl + 2 * sigma, args.keys.length),
          ul99: rep(cl + 3 * sigma, args.keys.length)
      };
  }

  function imLimits(args) {
      const useRatio = (args.denominators && args.denominators.length > 0);
      const ratio = useRatio
          ? divide(args.numerators, args.denominators)
          : args.numerators;
      const ratio_subset = extractValues(ratio, args.subset_points);
      const cl = median(ratio_subset);
      const consec_diff = abs(diff(ratio_subset));
      const consec_diff_ulim = median(consec_diff) * 3.267;
      const outliers_in_limits = args.outliers_in_limits;
      const consec_diff_valid = outliers_in_limits ? consec_diff : consec_diff.filter(d => d < consec_diff_ulim);
      const sigma = median(consec_diff_valid) / 1.128;
      return {
          keys: args.keys,
          values: ratio.map(d => isNaN(d) ? 0 : d),
          numerators: useRatio ? args.numerators : undefined,
          denominators: useRatio ? args.denominators : undefined,
          targets: rep(cl, args.keys.length),
          ll99: rep(cl - 3 * sigma, args.keys.length),
          ll95: rep(cl - 2 * sigma, args.keys.length),
          ll68: rep(cl - 1 * sigma, args.keys.length),
          ul68: rep(cl + 1 * sigma, args.keys.length),
          ul95: rep(cl + 2 * sigma, args.keys.length),
          ul99: rep(cl + 3 * sigma, args.keys.length)
      };
  }

  function mrLimits(args) {
      const useRatio = (args.denominators && args.denominators.length > 0);
      const ratio = useRatio
          ? divide(args.numerators, args.denominators)
          : args.numerators;
      const consec_diff = abs(diff(ratio));
      const cl = mean(extractValues(consec_diff, args.subset_points));
      return {
          keys: args.keys.slice(1),
          values: consec_diff.slice(1),
          numerators: useRatio ? args.numerators.slice(1) : undefined,
          denominators: useRatio ? args.denominators.slice(1) : undefined,
          targets: rep(cl, args.keys.length - 1),
          ll99: rep(0, args.keys.length - 1),
          ll95: rep(0, args.keys.length - 1),
          ll68: rep(0, args.keys.length - 1),
          ul68: rep((3.267 / 3) * 1 * cl, args.keys.length - 1),
          ul95: rep((3.267 / 3) * 2 * cl, args.keys.length - 1),
          ul99: rep(3.267 * cl, args.keys.length - 1)
      };
  }

  function pLimits(args) {
      const cl = sum(extractValues(args.numerators, args.subset_points))
          / sum(extractValues(args.denominators, args.subset_points));
      const sigma = sqrt(divide(cl * (1 - cl), args.denominators));
      return {
          keys: args.keys,
          values: divide(args.numerators, args.denominators),
          numerators: args.numerators,
          denominators: args.denominators,
          targets: rep(cl, args.keys.length),
          ll99: truncate(subtract(cl, multiply(3, sigma)), { lower: 0 }),
          ll95: truncate(subtract(cl, multiply(2, sigma)), { lower: 0 }),
          ll68: truncate(subtract(cl, multiply(1, sigma)), { lower: 0 }),
          ul68: truncate(add(cl, multiply(1, sigma)), { upper: 1 }),
          ul95: truncate(add(cl, multiply(2, sigma)), { upper: 1 }),
          ul99: truncate(add(cl, multiply(3, sigma)), { upper: 1 })
      };
  }

  function pprimeLimits(args) {
      const val = divide(args.numerators, args.denominators);
      const cl = sum(extractValues(args.numerators, args.subset_points))
          / sum(extractValues(args.denominators, args.subset_points));
      const sd = sqrt(divide(cl * (1 - cl), args.denominators));
      const zscore = extractValues(divide(subtract(val, cl), sd), args.subset_points);
      const consec_diff = abs(diff(zscore));
      const consec_diff_ulim = mean(consec_diff) * 3.267;
      const outliers_in_limits = args.outliers_in_limits;
      const consec_diff_valid = outliers_in_limits ? consec_diff : consec_diff.filter(d => d < consec_diff_ulim);
      const sigma = multiply(sd, mean(consec_diff_valid) / 1.128);
      return {
          keys: args.keys,
          values: val,
          numerators: args.numerators,
          denominators: args.denominators,
          targets: rep(cl, args.keys.length),
          ll99: truncate(subtract(cl, multiply(3, sigma)), { lower: 0 }),
          ll95: truncate(subtract(cl, multiply(2, sigma)), { lower: 0 }),
          ll68: truncate(subtract(cl, multiply(1, sigma)), { lower: 0 }),
          ul68: truncate(add(cl, multiply(1, sigma)), { upper: 1 }),
          ul95: truncate(add(cl, multiply(2, sigma)), { upper: 1 }),
          ul99: truncate(add(cl, multiply(3, sigma)), { upper: 1 })
      };
  }

  function runLimits(args) {
      const useRatio = (args.denominators && args.denominators.length > 0);
      const ratio = useRatio
          ? divide(args.numerators, args.denominators)
          : args.numerators;
      const cl = median(extractValues(ratio, args.subset_points));
      return {
          keys: args.keys,
          values: ratio.map(d => isNaN(d) ? 0 : d),
          numerators: useRatio ? args.numerators : undefined,
          denominators: useRatio ? args.denominators : undefined,
          targets: rep(cl, args.keys.length)
      };
  }

  function sLimits(args) {
      const group_sd = args.numerators;
      const count_per_group = args.denominators;
      const Nm1 = subtract(extractValues(count_per_group, args.subset_points), 1);
      const cl = sqrt(sum(multiply(Nm1, pow(extractValues(group_sd, args.subset_points), 2))) / sum(Nm1));
      return {
          keys: args.keys,
          values: group_sd,
          targets: rep(cl, args.keys.length),
          ll99: multiply(cl, b3(count_per_group, 3)),
          ll95: multiply(cl, b3(count_per_group, 2)),
          ll68: multiply(cl, b3(count_per_group, 1)),
          ul68: multiply(cl, b4(count_per_group, 1)),
          ul95: multiply(cl, b4(count_per_group, 2)),
          ul99: multiply(cl, b4(count_per_group, 3))
      };
  }

  function tLimits(args) {
      const val = pow(args.numerators, 1 / 3.6);
      const inputArgsCopy = JSON.parse(JSON.stringify(args));
      inputArgsCopy.numerators = val;
      inputArgsCopy.denominators = null;
      const limits = iLimits(inputArgsCopy);
      limits.targets = pow(limits.targets, 3.6);
      limits.values = pow(limits.values, 3.6);
      limits.ll99 = truncate(pow(limits.ll99, 3.6), { lower: 0 });
      limits.ll95 = truncate(pow(limits.ll95, 3.6), { lower: 0 });
      limits.ll68 = truncate(pow(limits.ll68, 3.6), { lower: 0 });
      limits.ul68 = pow(limits.ul68, 3.6);
      limits.ul95 = pow(limits.ul95, 3.6);
      limits.ul99 = pow(limits.ul99, 3.6);
      return limits;
  }

  function uLimits(args) {
      const cl = sum(extractValues(args.numerators, args.subset_points))
          / sum(extractValues(args.denominators, args.subset_points));
      const sigma = sqrt(divide(cl, args.denominators));
      return {
          keys: args.keys,
          values: divide(args.numerators, args.denominators),
          numerators: args.numerators,
          denominators: args.denominators,
          targets: rep(cl, args.keys.length),
          ll99: truncate(subtract(cl, multiply(3, sigma)), { lower: 0 }),
          ll95: truncate(subtract(cl, multiply(2, sigma)), { lower: 0 }),
          ll68: truncate(subtract(cl, multiply(1, sigma)), { lower: 0 }),
          ul68: add(cl, multiply(1, sigma)),
          ul95: add(cl, multiply(2, sigma)),
          ul99: add(cl, multiply(3, sigma))
      };
  }

  function uprimeLimits(args) {
      const val = divide(args.numerators, args.denominators);
      const cl = sum(extractValues(args.numerators, args.subset_points))
          / sum(extractValues(args.denominators, args.subset_points));
      const sd = sqrt(divide(cl, args.denominators));
      const zscore = extractValues(divide(subtract(val, cl), sd), args.subset_points);
      const consec_diff = abs(diff(zscore));
      const consec_diff_ulim = mean(consec_diff) * 3.267;
      const outliers_in_limits = args.outliers_in_limits;
      const consec_diff_valid = outliers_in_limits ? consec_diff : consec_diff.filter(d => d < consec_diff_ulim);
      const sigma = multiply(sd, mean(consec_diff_valid) / 1.128);
      return {
          keys: args.keys,
          values: val,
          numerators: args.numerators,
          denominators: args.denominators,
          targets: rep(cl, args.keys.length),
          ll99: truncate(subtract(cl, multiply(3, sigma)), { lower: 0 }),
          ll95: truncate(subtract(cl, multiply(2, sigma)), { lower: 0 }),
          ll68: truncate(subtract(cl, multiply(1, sigma)), { lower: 0 }),
          ul68: add(cl, multiply(1, sigma)),
          ul95: add(cl, multiply(2, sigma)),
          ul99: add(cl, multiply(3, sigma))
      };
  }

  function xbarLimits(args) {
      const count_per_group = args.denominators;
      const count_per_group_sub = extractValues(count_per_group, args.subset_points);
      const group_means = args.numerators;
      const group_means_sub = extractValues(group_means, args.subset_points);
      const group_sd = args.xbar_sds;
      const group_sd_sub = extractValues(group_sd, args.subset_points);
      const Nm1 = subtract(count_per_group_sub, 1);
      const sd = sqrt(sum(multiply(Nm1, square(group_sd_sub))) / sum(Nm1));
      const cl = sum(multiply(count_per_group_sub, group_means_sub)) / sum(count_per_group_sub);
      const A3 = a3(count_per_group);
      return {
          keys: args.keys,
          values: group_means,
          targets: rep(cl, args.keys.length),
          ll99: subtract(cl, multiply(A3, sd)),
          ll95: subtract(cl, multiply(multiply(divide(A3, 3), 2), sd)),
          ll68: subtract(cl, multiply(divide(A3, 3), sd)),
          ul68: add(cl, multiply(divide(A3, 3), sd)),
          ul95: add(cl, multiply(multiply(divide(A3, 3), 2), sd)),
          ul99: add(cl, multiply(A3, sd)),
          count: count_per_group
      };
  }

  var limitFunctions = /*#__PURE__*/Object.freeze({
    __proto__: null,
    c: cLimits,
    g: gLimits,
    i: iLimits,
    i_m: imLimits$1,
    i_mm: imLimits,
    mr: mrLimits,
    p: pLimits,
    pp: pprimeLimits,
    r: runLimits,
    run: runLimits,
    s: sLimits,
    t: tLimits,
    u: uLimits,
    up: uprimeLimits,
    xbar: xbarLimits
  });

  function astronomical(val, ll99, ul99) {
      return val.map((d, i) => {
          if (!between(d, ll99[i], ul99[i])) {
              return d > ul99[i] ? "upper" : "lower";
          }
          else {
              return "none";
          }
      });
  }

  function shift(val, targets, n) {
      const lagged_sign = val.map((d, i) => {
          return Math.sign(d - targets[i]);
      });
      const lagged_sign_sum = lagged_sign.map((_, i) => {
          return sum(lagged_sign.slice(Math.max(0, i - (n - 1)), i + 1));
      });
      const shift_detected = lagged_sign_sum.map(d => {
          if (abs(d) >= n) {
              return d >= n ? "upper" : "lower";
          }
          else {
              return "none";
          }
      });
      for (let i = 0; i < shift_detected.length; i++) {
          if (shift_detected[i] !== "none") {
              for (let j = (i - 1); j >= (i - (n - 1)); j--) {
                  shift_detected[j] = shift_detected[i];
              }
          }
      }
      return shift_detected;
  }

  function trend(val, n) {
      const lagged_sign = val.map((d, i) => {
          return (i == 0) ? i : Math.sign(d - val[i - 1]);
      });
      const lagged_sign_sum = lagged_sign.map((_, i) => {
          return sum(lagged_sign.slice(Math.max(0, i - (n - 2)), i + 1));
      });
      const trend_detected = lagged_sign_sum.map(d => {
          if (abs(d) >= (n - 1)) {
              return d >= (n - 1) ? "upper" : "lower";
          }
          else {
              return "none";
          }
      });
      for (let i = 0; i < trend_detected.length; i++) {
          if (trend_detected[i] !== "none") {
              for (let j = (i - 1); j >= (i - (n - 1)); j--) {
                  trend_detected[j] = trend_detected[i];
              }
          }
      }
      return trend_detected;
  }

  function twoInThree(val, ll95, ul95, highlight_series) {
      const outside95 = val.map((d, i) => {
          return d > ul95[i] ? 1 : (d < ll95[i] ? -1 : 0);
      });
      const lagged_sign_sum = outside95.map((_, i) => {
          return sum(outside95.slice(Math.max(0, i - 2), i + 1));
      });
      const two_in_three_detected = lagged_sign_sum.map(d => {
          if (abs(d) >= 2) {
              return d >= 2 ? "upper" : "lower";
          }
          else {
              return "none";
          }
      });
      for (let i = 0; i < two_in_three_detected.length; i++) {
          if (two_in_three_detected[i] !== "none") {
              for (let j = (i - 1); j >= (i - 2); j--) {
                  if (outside95[j] !== 0 || highlight_series) {
                      two_in_three_detected[j] = two_in_three_detected[i];
                  }
              }
              if (outside95[i] === 0 && !highlight_series) {
                  two_in_three_detected[i] = "none";
              }
          }
      }
      return two_in_three_detected;
  }

  class viewModelClass {
      constructor() {
          this.inputData = null;
          this.inputSettings = new settingsClass();
          this.controlLimits = null;
          this.plotPoints = new Array();
          this.groupedLines = new Array();
          this.plotProperties = new plotPropertiesClass();
          this.firstRun = true;
          this.splitIndexes = new Array();
          this.colourPalette = null;
      }
      update(options, host) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
          const indicator_cols = (_c = (_b = (_a = options.dataViews[0]) === null || _a === void 0 ? void 0 : _a.categorical) === null || _b === void 0 ? void 0 : _b.categories) === null || _c === void 0 ? void 0 : _c.filter(d => d.source.roles.indicator);
          this.indicatorVarNames = (_d = indicator_cols === null || indicator_cols === void 0 ? void 0 : indicator_cols.map(d => d.source.displayName)) !== null && _d !== void 0 ? _d : [];
          const n_indicators = (indicator_cols === null || indicator_cols === void 0 ? void 0 : indicator_cols.length) - 1;
          const n_values = (_k = (_j = (_h = (_g = (_f = (_e = options.dataViews[0]) === null || _e === void 0 ? void 0 : _e.categorical) === null || _f === void 0 ? void 0 : _f.categories) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.values) === null || _j === void 0 ? void 0 : _j.length) !== null && _k !== void 0 ? _k : 1;
          const res = { status: true };
          const idx_per_indicator = new Array();
          idx_per_indicator.push([0]);
          this.groupNames = new Array();
          this.groupNames.push((_l = indicator_cols === null || indicator_cols === void 0 ? void 0 : indicator_cols.map(d => d.values[0])) !== null && _l !== void 0 ? _l : []);
          let curr_grp = 0;
          for (let i = 1; i < n_values; i++) {
              if (((_m = indicator_cols === null || indicator_cols === void 0 ? void 0 : indicator_cols[n_indicators]) === null || _m === void 0 ? void 0 : _m.values[i]) === ((_o = indicator_cols === null || indicator_cols === void 0 ? void 0 : indicator_cols[n_indicators]) === null || _o === void 0 ? void 0 : _o.values[i - 1])) {
                  idx_per_indicator[curr_grp].push(i);
              }
              else {
                  idx_per_indicator.push([i]);
                  this.groupNames.push((_p = indicator_cols === null || indicator_cols === void 0 ? void 0 : indicator_cols.map(d => d.values[i])) !== null && _p !== void 0 ? _p : []);
                  curr_grp += 1;
              }
          }
          if (options.type === 2 || this.firstRun) {
              this.inputSettings.update(options.dataViews[0], idx_per_indicator);
          }
          if (this.inputSettings.validationStatus.error !== "") {
              res.status = false;
              res.error = this.inputSettings.validationStatus.error;
              res.type = "settings";
              return res;
          }
          const checkDV = validateDataView(options.dataViews, this.inputSettings);
          if (checkDV !== "valid") {
              res.status = false;
              res.error = checkDV;
              return res;
          }
          if (isNullOrUndefined(this.colourPalette)) {
              this.colourPalette = {
                  isHighContrast: host.colorPalette.isHighContrast,
                  foregroundColour: host.colorPalette.foreground.value,
                  backgroundColour: host.colorPalette.background.value,
                  foregroundSelectedColour: host.colorPalette.foregroundSelected.value,
                  hyperlinkColour: host.colorPalette.hyperlink.value
              };
          }
          this.svgWidth = options.viewport.width;
          this.svgHeight = options.viewport.height;
          if (options.type === 2 || this.firstRun) {
              if (options.dataViews[0].categorical.categories.some(d => d.source.roles.indicator)) {
                  this.showGrouped = true;
                  this.inputDataGrouped = new Array();
                  this.groupStartEndIndexesGrouped = new Array();
                  this.controlLimitsGrouped = new Array();
                  this.outliersGrouped = new Array();
                  this.identitiesGrouped = new Array();
                  idx_per_indicator.forEach((group_idxs, idx) => {
                      const inpData = extractInputData(options.dataViews[0].categorical, this.inputSettings.settingsGrouped[idx], this.inputSettings.derivedSettingsGrouped[idx], this.inputSettings.validationStatus.messages, group_idxs);
                      const invalidData = inpData.validationStatus.status !== 0;
                      const groupStartEndIndexes = invalidData ? new Array() : this.getGroupingIndexes(inpData);
                      const limits = invalidData ? null : this.calculateLimits(inpData, groupStartEndIndexes, this.inputSettings.settingsGrouped[idx]);
                      const outliers = invalidData ? null : this.flagOutliers(limits, groupStartEndIndexes, this.inputSettings.settingsGrouped[idx], this.inputSettings.derivedSettingsGrouped[idx]);
                      if (!invalidData) {
                          this.scaleAndTruncateLimits(limits, this.inputSettings.settingsGrouped[idx], this.inputSettings.derivedSettingsGrouped[idx]);
                      }
                      const identities = group_idxs.map(i => {
                          return host.createSelectionIdBuilder().withCategory(options.dataViews[0].categorical.categories[0], i).createSelectionId();
                      });
                      this.identitiesGrouped.push(identities);
                      this.inputDataGrouped.push(inpData);
                      this.groupStartEndIndexesGrouped.push(groupStartEndIndexes);
                      this.controlLimitsGrouped.push(limits);
                      this.outliersGrouped.push(outliers);
                  });
                  this.initialisePlotDataGrouped();
              }
              else {
                  this.showGrouped = false;
                  this.groupNames = null;
                  this.inputDataGrouped = null;
                  this.groupStartEndIndexesGrouped = null;
                  this.controlLimitsGrouped = null;
                  const split_indexes_str = (_u = ((_t = (_s = (_r = (_q = options.dataViews[0]) === null || _q === void 0 ? void 0 : _q.metadata) === null || _r === void 0 ? void 0 : _r.objects) === null || _s === void 0 ? void 0 : _s.split_indexes_storage) === null || _t === void 0 ? void 0 : _t.split_indexes)) !== null && _u !== void 0 ? _u : "[]";
                  const split_indexes = JSON.parse(split_indexes_str);
                  this.splitIndexes = split_indexes;
                  this.inputData = extractInputData(options.dataViews[0].categorical, this.inputSettings.settings, this.inputSettings.derivedSettings, this.inputSettings.validationStatus.messages, idx_per_indicator[0]);
                  if (this.inputData.validationStatus.status === 0) {
                      this.groupStartEndIndexes = this.getGroupingIndexes(this.inputData, this.splitIndexes);
                      this.controlLimits = this.calculateLimits(this.inputData, this.groupStartEndIndexes, this.inputSettings.settings);
                      this.scaleAndTruncateLimits(this.controlLimits, this.inputSettings.settings, this.inputSettings.derivedSettings);
                      this.outliers = this.flagOutliers(this.controlLimits, this.groupStartEndIndexes, this.inputSettings.settings, this.inputSettings.derivedSettings);
                      this.initialisePlotData(host);
                      this.initialiseGroupedLines();
                  }
              }
          }
          this.plotProperties.update(options, this.plotPoints, this.controlLimits, this.inputData, this.inputSettings.settings, this.inputSettings.derivedSettings, this.colourPalette);
          this.firstRun = false;
          if (this.showGrouped) {
              if (this.inputDataGrouped.map(d => d.validationStatus.status).some(d => d !== 0)) {
                  res.status = false;
                  res.error = this.inputDataGrouped.map(d => d.validationStatus.error).join("\n");
                  return res;
              }
              if (this.inputDataGrouped.some(d => d.warningMessage !== "")) {
                  res.warning = this.inputDataGrouped.map(d => d.warningMessage).join("\n");
              }
          }
          else {
              if (this.inputData.validationStatus.status !== 0) {
                  res.status = false;
                  res.error = this.inputData.validationStatus.error;
                  return res;
              }
              if (this.inputData.warningMessage !== "") {
                  res.warning = this.inputData.warningMessage;
              }
          }
          return res;
      }
      getGroupingIndexes(inputData, splitIndexes) {
          const allIndexes = (splitIndexes !== null && splitIndexes !== void 0 ? splitIndexes : [])
              .concat([-1])
              .concat(inputData.groupingIndexes)
              .concat([inputData.limitInputArgs.keys.length - 1])
              .filter((d, idx, arr) => arr.indexOf(d) === idx)
              .sort((a, b) => a - b);
          const groupStartEndIndexes = new Array();
          for (let i = 0; i < allIndexes.length - 1; i++) {
              groupStartEndIndexes.push([allIndexes[i] + 1, allIndexes[i + 1] + 1]);
          }
          return groupStartEndIndexes;
      }
      calculateLimits(inputData, groupStartEndIndexes, inputSettings) {
          const limitFunction = limitFunctions[inputSettings.spc.chart_type];
          inputData.limitInputArgs.outliers_in_limits = inputSettings.spc.outliers_in_limits;
          let controlLimits;
          if (groupStartEndIndexes.length > 1) {
              const groupedData = groupStartEndIndexes.map((indexes) => {
                  const data = JSON.parse(JSON.stringify(inputData));
                  data.limitInputArgs.denominators = data.limitInputArgs.denominators.slice(indexes[0], indexes[1]);
                  data.limitInputArgs.numerators = data.limitInputArgs.numerators.slice(indexes[0], indexes[1]);
                  data.limitInputArgs.keys = data.limitInputArgs.keys.slice(indexes[0], indexes[1]);
                  return data;
              });
              const calcLimitsGrouped = groupedData.map(d => limitFunction(d.limitInputArgs));
              controlLimits = calcLimitsGrouped.reduce((all, curr) => {
                  const allInner = all;
                  Object.entries(all).forEach((entry, idx) => {
                      var _a;
                      allInner[entry[0]] = (_a = entry[1]) === null || _a === void 0 ? void 0 : _a.concat(Object.entries(curr)[idx][1]);
                  });
                  return allInner;
              });
          }
          else {
              controlLimits = limitFunction(inputData.limitInputArgs);
          }
          controlLimits.alt_targets = inputData.alt_targets;
          controlLimits.speclimits_lower = inputData.speclimits_lower;
          controlLimits.speclimits_upper = inputData.speclimits_upper;
          return controlLimits;
      }
      initialisePlotDataGrouped() {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
          this.plotPointsGrouped = new Array();
          this.tableColumnsGrouped = new Array();
          this.indicatorVarNames.forEach(indicator_name => {
              this.tableColumnsGrouped.push({ name: indicator_name, label: indicator_name });
          });
          this.tableColumnsGrouped.push({ name: "latest_date", label: "Latest Date" });
          const lineSettings = this.inputSettings.settings.lines;
          if (lineSettings.show_main) {
              this.tableColumnsGrouped.push({ name: "value", label: "Value" });
          }
          if (this.inputSettings.settings.spc.ttip_show_numerator) {
              this.tableColumnsGrouped.push({ name: "numerator", label: "Numerator" });
          }
          if (this.inputSettings.settings.spc.ttip_show_denominator) {
              this.tableColumnsGrouped.push({ name: "denominator", label: "Denominator" });
          }
          if (lineSettings.show_target) {
              this.tableColumnsGrouped.push({ name: "target", label: lineSettings.ttip_label_target });
          }
          if (lineSettings.show_alt_target) {
              this.tableColumnsGrouped.push({ name: "alt_target", label: lineSettings.ttip_label_alt_target });
          }
          ["99", "95", "68"].forEach(limit => {
              if (lineSettings[`show_${limit}`]) {
                  this.tableColumnsGrouped.push({
                      name: `ucl${limit}`,
                      label: `${lineSettings[`ttip_label_${limit}_prefix_upper`]}${lineSettings[`ttip_label_${limit}`]}`
                  });
              }
          });
          ["68", "95", "99"].forEach(limit => {
              if (lineSettings[`show_${limit}`]) {
                  this.tableColumnsGrouped.push({
                      name: `lcl${limit}`,
                      label: `${lineSettings[`ttip_label_${limit}_prefix_lower`]}${lineSettings[`ttip_label_${limit}`]}`
                  });
              }
          });
          const nhsIconSettings = this.inputSettings.settings.nhs_icons;
          if (nhsIconSettings.show_variation_icons) {
              this.tableColumnsGrouped.push({ name: "variation", label: "Variation" });
          }
          if (nhsIconSettings.show_assurance_icons) {
              this.tableColumnsGrouped.push({ name: "assurance", label: "Assurance" });
          }
          const anyTooltips = this.inputDataGrouped.some(d => d.tooltips.length > 0);
          if (anyTooltips) {
              this.inputDataGrouped[0].tooltips[0].forEach(tooltip => {
                  this.tableColumnsGrouped.push({ name: tooltip.displayName, label: tooltip.displayName });
              });
          }
          for (let i = 0; i < this.groupNames.length; i++) {
              const formatValues = valueFormatter(this.inputSettings.settingsGrouped[i], this.inputSettings.derivedSettingsGrouped[i]);
              const varIconFilter = this.inputSettings.settingsGrouped[i].summary_table.table_variation_filter;
              const assIconFilter = this.inputSettings.settingsGrouped[i].summary_table.table_assurance_filter;
              const limits = this.controlLimitsGrouped[i];
              const outliers = this.outliersGrouped[i];
              const lastIndex = limits.keys.length - 1;
              const varIcons = variationIconsToDraw(outliers, this.inputSettings.settingsGrouped[i]);
              if (varIconFilter !== "all") {
                  if (varIconFilter === "improvement" && !(["improvementHigh", "improvementLow"].includes(varIcons[0]))) {
                      continue;
                  }
                  if (varIconFilter === "deterioration" && !(["concernHigh", "concernLow"].includes(varIcons[0]))) {
                      continue;
                  }
                  if (varIconFilter === "neutral" && !(["neutralHigh", "neutralLow"].includes(varIcons[0]))) {
                      continue;
                  }
                  if (varIconFilter === "common" && varIcons[0] !== "commonCause") {
                      continue;
                  }
                  if (varIconFilter === "special" && varIcons[0] === "commonCause") {
                      continue;
                  }
              }
              const assIcon = assuranceIconToDraw(limits, this.inputSettings.settingsGrouped[i], this.inputSettings.derivedSettingsGrouped[i]);
              if (assIconFilter !== "all") {
                  if (assIconFilter === "any" && assIcon === "inconsistent") {
                      continue;
                  }
                  if (assIconFilter === "pass" && assIcon !== "consistentPass") {
                      continue;
                  }
                  if (assIconFilter === "fail" && assIcon !== "consistentFail") {
                      continue;
                  }
                  if (assIconFilter === "inconsistent" && assIcon !== "inconsistent") {
                      continue;
                  }
              }
              const table_row_entries = new Array();
              this.indicatorVarNames.forEach((indicator_name, idx) => {
                  table_row_entries.push([indicator_name, this.groupNames[i][idx]]);
              });
              table_row_entries.push(["latest_date", (_a = limits.keys) === null || _a === void 0 ? void 0 : _a[lastIndex].label]);
              table_row_entries.push(["value", formatValues((_b = limits.values) === null || _b === void 0 ? void 0 : _b[lastIndex], "value")]);
              table_row_entries.push(["numerator", formatValues((_c = limits.numerators) === null || _c === void 0 ? void 0 : _c[lastIndex], "integer")]);
              table_row_entries.push(["denominator", formatValues((_d = limits.denominators) === null || _d === void 0 ? void 0 : _d[lastIndex], "integer")]);
              table_row_entries.push(["target", formatValues((_e = limits.targets) === null || _e === void 0 ? void 0 : _e[lastIndex], "value")]);
              table_row_entries.push(["alt_target", formatValues((_f = limits.alt_targets) === null || _f === void 0 ? void 0 : _f[lastIndex], "value")]);
              table_row_entries.push(["ucl99", formatValues((_g = limits.ul99) === null || _g === void 0 ? void 0 : _g[lastIndex], "value")]);
              table_row_entries.push(["ucl95", formatValues((_h = limits.ul95) === null || _h === void 0 ? void 0 : _h[lastIndex], "value")]);
              table_row_entries.push(["ucl68", formatValues((_j = limits.ul68) === null || _j === void 0 ? void 0 : _j[lastIndex], "value")]);
              table_row_entries.push(["lcl68", formatValues((_k = limits.ll68) === null || _k === void 0 ? void 0 : _k[lastIndex], "value")]);
              table_row_entries.push(["lcl95", formatValues((_l = limits.ll95) === null || _l === void 0 ? void 0 : _l[lastIndex], "value")]);
              table_row_entries.push(["lcl99", formatValues((_m = limits.ll99) === null || _m === void 0 ? void 0 : _m[lastIndex], "value")]);
              table_row_entries.push(["variation", varIcons[0]]);
              table_row_entries.push(["assurance", assIcon]);
              if (anyTooltips) {
                  this.inputDataGrouped[i].tooltips[lastIndex].forEach(tooltip => {
                      table_row_entries.push([tooltip.displayName, tooltip.value]);
                  });
              }
              this.plotPointsGrouped.push({
                  table_row: Object.fromEntries(table_row_entries),
                  identity: this.identitiesGrouped[i],
                  aesthetics: this.inputSettings.settingsGrouped[i].summary_table,
                  highlighted: this.inputDataGrouped[i].anyHighlights
              });
          }
      }
      initialisePlotData(host) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
          this.plotPoints = new Array();
          this.tickLabels = new Array();
          this.tableColumns = new Array();
          this.tableColumns.push({ name: "date", label: "Date" });
          this.tableColumns.push({ name: "value", label: "Value" });
          if (!isNullOrUndefined(this.controlLimits.numerators)) {
              this.tableColumns.push({ name: "numerator", label: "Numerator" });
          }
          if (!isNullOrUndefined(this.controlLimits.denominators)) {
              this.tableColumns.push({ name: "denominator", label: "Denominator" });
          }
          if (this.inputSettings.settings.lines.show_target) {
              this.tableColumns.push({ name: "target", label: "Target" });
          }
          if (this.inputSettings.settings.lines.show_alt_target) {
              this.tableColumns.push({ name: "alt_target", label: "Alt. Target" });
          }
          if (this.inputSettings.settings.lines.show_specification) {
              this.tableColumns.push({ name: "speclimits_lower", label: "Spec. Lower" }, { name: "speclimits_upper", label: "Spec. Upper" });
          }
          if (this.inputSettings.derivedSettings.chart_type_props.has_control_limits) {
              if (this.inputSettings.settings.lines.show_99) {
                  this.tableColumns.push({ name: "ll99", label: "LL 99%" }, { name: "ul99", label: "UL 99%" });
              }
              if (this.inputSettings.settings.lines.show_95) {
                  this.tableColumns.push({ name: "ll95", label: "LL 95%" }, { name: "ul95", label: "UL 95%" });
              }
              if (this.inputSettings.settings.lines.show_68) {
                  this.tableColumns.push({ name: "ll68", label: "LL 68%" }, { name: "ul68", label: "UL 68%" });
              }
          }
          if (this.inputSettings.settings.outliers.astronomical) {
              this.tableColumns.push({ name: "astpoint", label: "Ast. Point" });
          }
          if (this.inputSettings.settings.outliers.trend) {
              this.tableColumns.push({ name: "trend", label: "Trend" });
          }
          if (this.inputSettings.settings.outliers.shift) {
              this.tableColumns.push({ name: "shift", label: "Shift" });
          }
          for (let i = 0; i < this.controlLimits.keys.length; i++) {
              const index = this.controlLimits.keys[i].x;
              const aesthetics = this.inputData.scatter_formatting[i];
              if (this.colourPalette.isHighContrast) {
                  aesthetics.colour = this.colourPalette.foregroundColour;
              }
              if (this.outliers.shift[i] !== "none") {
                  aesthetics.colour = getAesthetic(this.outliers.shift[i], "outliers", "shift_colour", this.inputSettings.settings);
              }
              if (this.outliers.trend[i] !== "none") {
                  aesthetics.colour = getAesthetic(this.outliers.trend[i], "outliers", "trend_colour", this.inputSettings.settings);
              }
              if (this.outliers.two_in_three[i] !== "none") {
                  aesthetics.colour = getAesthetic(this.outliers.two_in_three[i], "outliers", "twointhree_colour", this.inputSettings.settings);
              }
              if (this.outliers.astpoint[i] !== "none") {
                  aesthetics.colour = getAesthetic(this.outliers.astpoint[i], "outliers", "ast_colour", this.inputSettings.settings);
              }
              const table_row = {
                  date: this.controlLimits.keys[i].label,
                  numerator: (_a = this.controlLimits.numerators) === null || _a === void 0 ? void 0 : _a[i],
                  denominator: (_b = this.controlLimits.denominators) === null || _b === void 0 ? void 0 : _b[i],
                  value: this.controlLimits.values[i],
                  target: this.controlLimits.targets[i],
                  alt_target: this.controlLimits.alt_targets[i],
                  ll99: (_d = (_c = this.controlLimits) === null || _c === void 0 ? void 0 : _c.ll99) === null || _d === void 0 ? void 0 : _d[i],
                  ll95: (_f = (_e = this.controlLimits) === null || _e === void 0 ? void 0 : _e.ll95) === null || _f === void 0 ? void 0 : _f[i],
                  ll68: (_h = (_g = this.controlLimits) === null || _g === void 0 ? void 0 : _g.ll68) === null || _h === void 0 ? void 0 : _h[i],
                  ul68: (_k = (_j = this.controlLimits) === null || _j === void 0 ? void 0 : _j.ul68) === null || _k === void 0 ? void 0 : _k[i],
                  ul95: (_m = (_l = this.controlLimits) === null || _l === void 0 ? void 0 : _l.ul95) === null || _m === void 0 ? void 0 : _m[i],
                  ul99: (_p = (_o = this.controlLimits) === null || _o === void 0 ? void 0 : _o.ul99) === null || _p === void 0 ? void 0 : _p[i],
                  speclimits_lower: (_r = (_q = this.controlLimits) === null || _q === void 0 ? void 0 : _q.speclimits_lower) === null || _r === void 0 ? void 0 : _r[i],
                  speclimits_upper: (_t = (_s = this.controlLimits) === null || _s === void 0 ? void 0 : _s.speclimits_upper) === null || _t === void 0 ? void 0 : _t[i],
                  astpoint: this.outliers.astpoint[i],
                  trend: this.outliers.trend[i],
                  shift: this.outliers.shift[i],
                  two_in_three: this.outliers.two_in_three[i]
              };
              this.plotPoints.push({
                  x: index,
                  value: this.controlLimits.values[i],
                  aesthetics: aesthetics,
                  table_row: table_row,
                  identity: host.createSelectionIdBuilder()
                      .withCategory(this.inputData.categories, this.inputData.limitInputArgs.keys[i].id)
                      .createSelectionId(),
                  highlighted: !isNullOrUndefined((_u = this.inputData.highlights) === null || _u === void 0 ? void 0 : _u[index]),
                  tooltip: buildTooltip(table_row, (_w = (_v = this.inputData) === null || _v === void 0 ? void 0 : _v.tooltips) === null || _w === void 0 ? void 0 : _w[index], this.inputSettings.settings, this.inputSettings.derivedSettings),
                  label: {
                      text_value: (_x = this.inputData.labels) === null || _x === void 0 ? void 0 : _x[index],
                      aesthetics: this.inputData.label_formatting[index],
                      angle: null,
                      distance: null,
                      line_offset: null,
                      marker_offset: null
                  }
              });
              this.tickLabels.push({ x: index, label: this.controlLimits.keys[i].label });
          }
      }
      initialiseGroupedLines() {
          const labels = new Array();
          if (this.inputSettings.settings.lines.show_main) {
              labels.push("values");
          }
          if (this.inputSettings.settings.lines.show_target) {
              labels.push("targets");
          }
          if (this.inputSettings.settings.lines.show_alt_target) {
              labels.push("alt_targets");
          }
          if (this.inputSettings.settings.lines.show_specification) {
              labels.push("speclimits_lower", "speclimits_upper");
          }
          if (this.inputSettings.derivedSettings.chart_type_props.has_control_limits) {
              if (this.inputSettings.settings.lines.show_99) {
                  labels.push("ll99", "ul99");
              }
              if (this.inputSettings.settings.lines.show_95) {
                  labels.push("ll95", "ul95");
              }
              if (this.inputSettings.settings.lines.show_68) {
                  labels.push("ll68", "ul68");
              }
          }
          const formattedLines = new Array();
          const nLimits = this.controlLimits.keys.length;
          for (let i = 0; i < nLimits; i++) {
              const isRebaselinePoint = this.splitIndexes.includes(i - 1) || this.inputData.groupingIndexes.includes(i - 1);
              let isNewAltTarget = false;
              if (i > 0 && this.inputSettings.settings.lines.show_alt_target) {
                  isNewAltTarget = this.controlLimits.alt_targets[i] !== this.controlLimits.alt_targets[i - 1];
              }
              labels.forEach(label => {
                  var _a, _b;
                  if (isRebaselinePoint || (label === "alt_targets" && isNewAltTarget)) {
                      formattedLines.push({
                          x: this.controlLimits.keys[i].x,
                          line_value: null,
                          group: label
                      });
                      if (!isRebaselinePoint && (label === "alt_targets" && isNewAltTarget)) {
                          formattedLines.push({
                              x: this.controlLimits.keys[i].x - 1,
                              line_value: (_a = this.controlLimits[label]) === null || _a === void 0 ? void 0 : _a[i],
                              group: label
                          });
                      }
                  }
                  formattedLines.push({
                      x: this.controlLimits.keys[i].x,
                      line_value: (_b = this.controlLimits[label]) === null || _b === void 0 ? void 0 : _b[i],
                      group: label
                  });
              });
          }
          this.groupedLines = groups(formattedLines, d => d.group);
      }
      scaleAndTruncateLimits(controlLimits, inputSettings, derivedSettings) {
          const multiplier = derivedSettings.multiplier;
          let lines_to_scale = ["values", "targets"];
          if (derivedSettings.chart_type_props.has_control_limits) {
              lines_to_scale = lines_to_scale.concat(["ll99", "ll95", "ll68", "ul68", "ul95", "ul99"]);
          }
          let lines_to_truncate = lines_to_scale;
          if (inputSettings.lines.show_alt_target) {
              lines_to_truncate = lines_to_truncate.concat(["alt_targets"]);
              if (inputSettings.lines.multiplier_alt_target) {
                  lines_to_scale = lines_to_scale.concat(["alt_targets"]);
              }
          }
          if (inputSettings.lines.show_specification) {
              lines_to_truncate = lines_to_truncate.concat(["speclimits_lower", "speclimits_upper"]);
              if (inputSettings.lines.multiplier_specification) {
                  lines_to_scale = lines_to_scale.concat(["speclimits_lower", "speclimits_upper"]);
              }
          }
          const limits = {
              lower: inputSettings.spc.ll_truncate,
              upper: inputSettings.spc.ul_truncate
          };
          lines_to_scale.forEach(limit => {
              controlLimits[limit] = multiply(controlLimits[limit], multiplier);
          });
          lines_to_truncate.forEach(limit => {
              controlLimits[limit] = truncate(controlLimits[limit], limits);
          });
      }
      flagOutliers(controlLimits, groupStartEndIndexes, inputSettings, derivedSettings) {
          var _a, _b, _c, _d;
          const process_flag_type = inputSettings.outliers.process_flag_type;
          const improvement_direction = inputSettings.outliers.improvement_direction;
          const trend_n = inputSettings.outliers.trend_n;
          const shift_n = inputSettings.outliers.shift_n;
          const ast_specification = inputSettings.outliers.astronomical_limit === "Specification";
          const two_in_three_specification = inputSettings.outliers.two_in_three_limit === "Specification";
          const outliers = {
              astpoint: rep("none", controlLimits.values.length),
              two_in_three: rep("none", controlLimits.values.length),
              trend: rep("none", controlLimits.values.length),
              shift: rep("none", controlLimits.values.length)
          };
          for (let i = 0; i < groupStartEndIndexes.length; i++) {
              const start = groupStartEndIndexes[i][0];
              const end = groupStartEndIndexes[i][1];
              const group_values = controlLimits.values.slice(start, end);
              const group_targets = controlLimits.targets.slice(start, end);
              if (derivedSettings.chart_type_props.has_control_limits || ast_specification || two_in_three_specification) {
                  const limit_map = {
                      "1 Sigma": "68",
                      "2 Sigma": "95",
                      "3 Sigma": "99",
                      "Specification": "",
                  };
                  if (inputSettings.outliers.astronomical) {
                      const ast_limit = limit_map[inputSettings.outliers.astronomical_limit];
                      const ll_prefix = ast_specification ? "speclimits_lower" : "ll";
                      const ul_prefix = ast_specification ? "speclimits_upper" : "ul";
                      const lower_limits = (_a = controlLimits === null || controlLimits === void 0 ? void 0 : controlLimits[`${ll_prefix}${ast_limit}`]) === null || _a === void 0 ? void 0 : _a.slice(start, end);
                      const upper_limits = (_b = controlLimits === null || controlLimits === void 0 ? void 0 : controlLimits[`${ul_prefix}${ast_limit}`]) === null || _b === void 0 ? void 0 : _b.slice(start, end);
                      astronomical(group_values, lower_limits, upper_limits)
                          .forEach((flag, idx) => outliers.astpoint[start + idx] = flag);
                  }
                  if (inputSettings.outliers.two_in_three) {
                      const highlight_series = inputSettings.outliers.two_in_three_highlight_series;
                      const two_in_three_limit = limit_map[inputSettings.outliers.two_in_three_limit];
                      const ll_prefix = two_in_three_specification ? "speclimits_lower" : "ll";
                      const ul_prefix = two_in_three_specification ? "speclimits_upper" : "ul";
                      const lower_warn_limits = (_c = controlLimits === null || controlLimits === void 0 ? void 0 : controlLimits[`${ll_prefix}${two_in_three_limit}`]) === null || _c === void 0 ? void 0 : _c.slice(start, end);
                      const upper_warn_limits = (_d = controlLimits === null || controlLimits === void 0 ? void 0 : controlLimits[`${ul_prefix}${two_in_three_limit}`]) === null || _d === void 0 ? void 0 : _d.slice(start, end);
                      twoInThree(group_values, lower_warn_limits, upper_warn_limits, highlight_series)
                          .forEach((flag, idx) => outliers.two_in_three[start + idx] = flag);
                  }
              }
              if (inputSettings.outliers.trend) {
                  trend(group_values, trend_n)
                      .forEach((flag, idx) => outliers.trend[start + idx] = flag);
              }
              if (inputSettings.outliers.shift) {
                  shift(group_values, group_targets, shift_n)
                      .forEach((flag, idx) => outliers.shift[start + idx] = flag);
              }
          }
          Object.keys(outliers).forEach(key => {
              outliers[key] = checkFlagDirection(outliers[key], { process_flag_type, improvement_direction });
          });
          return outliers;
      }
  }

  class Visual {
      constructor(options) {
          this.tableDiv = select(options.element).append("div")
              .style("overflow", "auto");
          this.svg = select(options.element).append("svg");
          this.host = options.host;
          this.viewModel = new viewModelClass();
          this.selectionManager = this.host.createSelectionManager();
          this.selectionManager.registerOnSelectCallback(() => this.updateHighlighting());
          this.svg.call(initialiseSVG);
          const table = this.tableDiv.append("table")
              .classed("table-group", true)
              .style("border-collapse", "collapse")
              .style("width", "100%")
              .style("height", "100%");
          table.append("thead").append("tr").classed("table-header", true);
          table.append('tbody').classed("table-body", true);
      }
      update(options) {
          var _a, _b, _c, _d, _e;
          try {
              this.host.eventService.renderingStarted(options);
              this.svg.select(".errormessage").remove();
              const update_status = this.viewModel.update(options, this.host);
              if (!update_status.status) {
                  this.resizeCanvas(options.viewport.width, options.viewport.height);
                  if ((_e = (_d = (_c = (_b = (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.inputSettings) === null || _b === void 0 ? void 0 : _b.settings) === null || _c === void 0 ? void 0 : _c.canvas) === null || _d === void 0 ? void 0 : _d.show_errors) !== null && _e !== void 0 ? _e : true) {
                      this.svg.call(drawErrors, options, update_status === null || update_status === void 0 ? void 0 : update_status.error, update_status === null || update_status === void 0 ? void 0 : update_status.type);
                  }
                  else {
                      this.svg.call(initialiseSVG, true);
                  }
                  this.host.eventService.renderingFailed(options);
                  return;
              }
              if (update_status.warning) {
                  this.host.displayWarningIcon("Invalid inputs or settings ignored.\n", update_status.warning);
              }
              if (this.viewModel.showGrouped || this.viewModel.inputSettings.settings.summary_table.show_table) {
                  this.resizeCanvas(0, 0);
                  this.tableDiv.call(drawSummaryTable, this)
                      .call(addContextMenu, this);
              }
              else {
                  this.resizeCanvas(options.viewport.width, options.viewport.height);
                  this.drawVisual();
                  this.adjustPaddingForOverflow();
              }
              this.updateHighlighting();
              this.host.eventService.renderingFinished(options);
          }
          catch (caught_error) {
              this.resizeCanvas(options.viewport.width, options.viewport.height);
              this.svg.call(drawErrors, options, caught_error.message, "internal");
              console.error(caught_error);
              this.host.eventService.renderingFailed(options);
          }
      }
      drawVisual() {
          this.svg.call(drawXAxis, this)
              .call(drawYAxis, this)
              .call(drawTooltipLine, this)
              .call(drawLines, this)
              .call(drawLineLabels, this)
              .call(drawDots, this)
              .call(drawIcons, this)
              .call(addContextMenu, this)
              .call(drawDownloadButton, this)
              .call(drawLabels, this);
      }
      adjustPaddingForOverflow() {
          let xLeftOverflow = 0;
          let xRightOverflow = 0;
          let yBottomOverflow = 0;
          let yTopOverflow = 0;
          const svgWidth = this.viewModel.svgWidth;
          const svgHeight = this.viewModel.svgHeight;
          this.svg.selectChildren().each(function () {
              const boundRect = this.getBoundingClientRect();
              const bbox = this.getBBox();
              xLeftOverflow = Math.min(xLeftOverflow, bbox.x);
              xRightOverflow = Math.max(xRightOverflow, boundRect.right - svgWidth);
              yBottomOverflow = Math.max(yBottomOverflow, boundRect.bottom - svgHeight);
              yTopOverflow = Math.min(yTopOverflow, boundRect.top);
          });
          xLeftOverflow = Math.abs(xLeftOverflow);
          xRightOverflow = Math.abs(xRightOverflow);
          yBottomOverflow = Math.abs(yBottomOverflow);
          yTopOverflow = Math.abs(yTopOverflow);
          if ((xLeftOverflow + xRightOverflow + yBottomOverflow + yTopOverflow) > 0) {
              this.viewModel.plotProperties.xAxis.start_padding += xLeftOverflow + this.viewModel.plotProperties.xAxis.start_padding;
              this.viewModel.plotProperties.xAxis.end_padding += xRightOverflow + this.viewModel.plotProperties.xAxis.end_padding;
              this.viewModel.plotProperties.yAxis.start_padding += yBottomOverflow + this.viewModel.plotProperties.yAxis.start_padding;
              this.viewModel.plotProperties.yAxis.end_padding += yTopOverflow + this.viewModel.plotProperties.yAxis.end_padding;
              this.viewModel.plotProperties.initialiseScale(svgWidth, svgHeight);
              this.drawVisual();
          }
      }
      resizeCanvas(width, height) {
          this.svg.attr("width", width).attr("height", height);
          if (width === 0 && height === 0) {
              this.tableDiv.style("width", "100%").style("height", "100%");
          }
          else {
              this.tableDiv.style("width", "0%").style("height", "0%");
          }
      }
      updateHighlighting() {
          const anyHighlights = this.viewModel.inputData ? this.viewModel.inputData.anyHighlights : false;
          const anyHighlightsGrouped = this.viewModel.inputDataGrouped ? this.viewModel.inputDataGrouped.some(d => d.anyHighlights) : false;
          const allSelectionIDs = this.selectionManager.getSelectionIds();
          const opacityFull = this.viewModel.inputSettings.settings.scatter.opacity;
          const opacityReduced = this.viewModel.inputSettings.settings.scatter.opacity_unselected;
          const defaultOpacity = (anyHighlights || (allSelectionIDs.length > 0))
              ? opacityReduced
              : opacityFull;
          this.svg.selectAll(".linesgroup").style("stroke-opacity", defaultOpacity);
          const dotsSelection = this.svg.selectAll(".dotsgroup").selectChildren();
          const tableSelection = this.tableDiv.selectAll(".table-body").selectChildren();
          dotsSelection.style("fill-opacity", defaultOpacity);
          tableSelection.style("opacity", defaultOpacity);
          if (anyHighlights || (allSelectionIDs.length > 0) || anyHighlightsGrouped) {
              dotsSelection.nodes().forEach(currentDotNode => {
                  const dot = select(currentDotNode).datum();
                  const currentPointSelected = identitySelected(dot.identity, this.selectionManager);
                  const currentPointHighlighted = dot.highlighted;
                  const newDotOpacity = (currentPointSelected || currentPointHighlighted) ? dot.aesthetics.opacity : dot.aesthetics.opacity_unselected;
                  select(currentDotNode).style("fill-opacity", newDotOpacity);
              });
              tableSelection.nodes().forEach(currentTableNode => {
                  const dot = select(currentTableNode).datum();
                  const currentPointSelected = identitySelected(dot.identity, this.selectionManager);
                  const currentPointHighlighted = dot.highlighted;
                  const newTableOpacity = (currentPointSelected || currentPointHighlighted) ? dot.aesthetics["table_opacity"] : dot.aesthetics["table_opacity_unselected"];
                  select(currentTableNode).style("opacity", newTableOpacity);
              });
          }
      }
      enumerateObjectInstances(options) {
          return this.viewModel.inputSettings.createSettingsEntry(options.objectName);
      }
  }

  exports.Visual = Visual;
  exports.d3 = index;

}));
