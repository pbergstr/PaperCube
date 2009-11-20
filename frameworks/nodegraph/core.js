// ==========================================================================
// NodeGraph
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

NodeGraph = SC.Object.create({
  
  /**
    Calculate the window height.

    @returns {Integer} Returns the width of the window.
  */
  windowHeight: function() 
  {
    var w = window;
    return w.innerHeight || (w.document.documentElement.clientHeight || w.document.body.clientHeight) || 0;
  },

  /** 
    Calculate the window width.

    @returns {Integer} Returns the height of the window.
  */
  windowWidth: function() 
  {
    var w = window;
    return w.innerWidth || (w.document.documentElement.clientWidth || w.document.body.clientWidth) || 0;
  }
  
}) ;

/*
  CONSTANTS FOR NODE GRAPH VIEW
*/
var NODE = 0;
var EDGE = 1;
var TEXT = 2;
var EDGETEXT = 4;
var REL = 3;
var NODEGRAPH_DEFAULT_SCALE = 10;
var NODEGRAPH_USE_CHILDREN_OFFSET = YES;
var NODEGRAPH_OFFSET_PERCENT = .40;

