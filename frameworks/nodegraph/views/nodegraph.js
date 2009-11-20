// ==========================================================================
// NodeGraph.NodeGraphView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');
require('mixins/dragpan');
/** @class NodeGraph.NodeGraphView

  This is the node graph view. This will be extended by various views to 
  show a node-edge graph It will show all nodes for an centered object
  and also link between them. Strong relationships will be shown with thicker and 
  darker lines. This view uses SVG.

  Constants defined in core.js:

  var NODE = 0;
  var EDGE = 1;
  var TEXT = 2;
  var EDGETEXT = 4;
  var REL = 3;
  var NODEGRAPH_DEFAULT_SCALE = 10;
  var NODEGRAPH_USE_CHILDREN_OFFSET = YES;
  var NODEGRAPH_OFFSET_PERCENT = .40;

  @extends SC.View
  @extends NodeGraph.DragPanMixin
  @object Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/

NodeGraph.NodeGraphView = SC.View.extend(NodeGraph.DragPanMixin, 
/** @scope NodeGraph.NodeGraphView.prototype */ {


  /**
    @property
    @type {NodeGraph.NodeGraphDelegate}
    
    The controller delegate for the node graph.
  */
  delegate: null,
  
  /************************************************************************************
    Bindings that are customized when extending this object.
  *************************************************************************************/
  
  /**
    The value for the depth slider.
  
    @property {Integer}
  */
  depth: 2,

  /**
    Depth cached value.
  
    @property {Integer}
    @default 2
  */
  _cached_depth: 2,
  
  /**
    Link stregth threshold. Override this.

    @property {Integer}
    @default 0
  */
  linkThreshold: 0,

  /**
    linkThreshold cached value.
  
    @property {Integer}
    @default 0
  */
  _cached_linkThreshold: 0,

  /**
    Display references or citations.

    @property {Boolean}
    @default YES
  */
  _displayRefs: YES,

  /************************************************************************************
    Methods and variables that you should extend to use this view.
  *************************************************************************************/

  /**
    Node background color.
    
    @property {String}
    @config
    @default '#FFCB2F'
  */
  nodeColor: '#FFCB2F',

  /**
    Selected node background color.
    
    @property {String}
    @config
    @default 'yellow'
  */
  nodeColorSel: 'yellow',

  /**
    Node border color.
    
    @property {String}
    @config
    @default '#EAA400'
  */
  nodeBorderColor: '#EAA400',

  /**
    Selected node border color.
    
    @property {String}
    @config
    @default '#FFB60B'
  */
  nodeBorderColorSel: '#FFB60B',

  /**
    Node text color.
    
    @property {String}
    @config
    @default '#666'
  */
  nodeTextColor: '#666',

  /**
    Default node size ratio from the size of the screen.
    
    Default is 25 times smaller than height.
    
    @property {Integer}
    @config
    @default 25
  */
  nodeDefaultRadius: 25,

  /**
    The default width of the node border.
    
    @property {Integer}
    @config
    @default 1px
  */
  nodeBorderWidth: 1,
  
  /**
    Node x-y ratio The default is x radius is 1.5 times y.
    
    @property {Float}
    @config
    @default 1.5
  */
  nodeXYRatio: 1.5,

  /**
    Edge color.
    
    @property {String}
    @config
    @default '#333'
  */
  edgeColor: '#333',

  /**
    Selected edge color.
    
    @property {String}
    @config
    @default 'red'
  */
  edgeColorSel: 'red',

  /**
    Edge text color.
    
    @property {String}
    @config
    @default '#666'
  */
  edgeTextColor: '#666',

  /**
    The minimum width of an edge.
    
    @property {Integer}
    @config
    @default 1px
  */
  edgeMinWidth: 1,
  
  /**
    The nodeTextRatio allows the font size for the node to the calculated. 
    
    The font size is calculated as radius/nodeTextRatio.
    
    @property {Integer}
    @config
    @default 2
  */
  nodeTextRatio: 2,

  /**
    A value of 0.1 would puts the edge label close to start node, 0.5 would put it in the middle of the edge,  
    0.9 would put it close to the end node.

    @property {Float}
    @config
    @default 0.3
  */
  edgeTextPosOffset: 0.3, 

  /**
    Node opacity.
    
    @property {Float}
    @config
    @default 1
  */
  nodeOpacity: 1,

  /**
    Edge opacity.
    
    @property {Float}
    @config
    @default 0.2
  */
  edgeOpacity: 0.2,

  /**
    Selected edge opacity.
    
    @property {Float}
    @config
    @default 0.5
  */
  edgeOpacitySel: 0.5,
  
  /**
    If set to YES, show the edge label, if NO, hide the label.
    
    @property {Boolean}
    @config
    @default YES
    @default YES
  */
  showEdgeLabel: YES,

  /**
    If set to YES, calculate the edge width by looking at the weight of the item, otherwise, skip this operation.
    
    @property {Boolean}
    @config
    @default YES
    @default YES
  */
  useEdgeWeightWidth: YES,

  /**
    If NO, don't show edges.
    
    @property {Boolean}
    @config
    @default YES
    @default YES
  */
  showEdges: YES,

  /** 
    The key for the default title display.

    @property {String}
    @config
    @default 'title'
  */
  defaultTitleKey: 'title',

  /**
    The type of content being displayed.
    
    @property {String}
    @config
    @default 'Paper'
  */
  contentTypeViewing: 'Paper',
  
  /**
    The name of the view. 
    
    @property {String}
    @config
    @default 'none'
  */
  viewName: 'none',

  /**
    Meta data box small height. 
    
    @property {Integer}
    @config
    @default 100px
  */  
  metaDataBoxHeightSmall: 100,

  /**
    Meta data box small width. 
    
    @property {Integer}
    @config
    @default 200px
  */  
  metaDataBoxWidthSmall: 200,

  /** 
    Class name for meta data DIV.
    
    @property {String}
    @config
    @default ''
  */
  metaDataClassName: '',

  /**
    Set the default title for the view.

    @param content {Record} Content object used to get the title.
  */
  setDefaultTitle: function(content)
  {
    var str = '';
    if(content)
    {
      str = content.get(this.defaultTitleKey);
    }
    this.graphTitle.innerHTML = str;
  },
  
  /** 
    Generate custom metadata for item.
    
    @param guid {string} The guid for content object that is found in the SC Store.

    @returns {array|SC.Record} Returns the found content object.
  */
  findCustomObject: function(guid)
  {
    // Add customized code here.
    return null;
  },

  /** 
    Find Custom Object Relation Attribute.

    @param object {Record} The content object.

    @returns {Array} Returns the found relation attribute array.
  */
  findCustomObjectAttr: function(object)
  {
    // Add customized code here.
    return [];
  },

  /**
    Given relation object, return guid for it.
    
    @param rel {Object} The relation object or array.

    @returns {String} Returns the guid for the relation object.
  */
  getGuidForRelation: function(rel)
  {
    // Add customized code here.
    return '';
  },
  
  /**
    Revert bindings to default.
  */
  setBindingDefaults: function()
  {
    // Add customized code here.
  },
  
  /**
    Given an object, return its label.

    @param object {Object} The content object.

    @returns {String} Returns a title string for display.
  */
  findCustomObjectLabel: function()
  {
    // Add customized code here.
  },
  
  /**
    Given relation object, return weight for it.

    @param rel {Object} The relation object or array.

    @returns {Integer} Returns the calculated weight for the relation object.
  */
  calcRelationWeight: function()
  {
    // Add customized code here.
    return 1;
  },
  
  /** 
    Get the details of a given item.
    
    @param guids {Array} The array of guids.
    @param callBack {Function} The callBack function is called when the request is successful.
  */
  performCustomRequest: function(guids, callBack)
  {
    // Add customized code here.
  },
  
  /**
    Custom threshold calculation for complex link threshold calculations.

    @param rel {Object} The relation's guid.

    @returns {String} Returns if the item is accepted by the threshold(s). Returns NO otherwise.
  */
  relationMeetsCustomThreshold: function(rel)
  {
    // Add customized code here.
    return (this.calcRelationWeight(rel)>=this._cached_linkThreshold);
  },


  /************************************************************************************
  *  Default binding.
  *************************************************************************************/

  /**
    This is generally a binding from the delegate.
    
    To set up to the binding, do the following:
    
    displayPropertiesBinding: 'Path.to.delegate.displayProperties'
    
    Values 
    {
      height: 0,
      width: 0,
      left: 0,
      top: 0,
      zoomValue: 0,
      portalWidth: 0,
      portalHeight: 0
    }
    
    @property {Object}
  */
  displayProperties: {
    height: NodeGraph.windowHeight(),
    width: NodeGraph.windowHeight(),
    left: 0,
    top: 0,
    zoomValue: 1,
    portalWidth: NodeGraph.windowWidth(),
    portalHeight: NodeGraph.windowHeight(),
  },

  /************************************************************************************
  *  Only one outlet, for the meta data view.
  *************************************************************************************/

  /**
    Outlets for author stat view.

    ["metaDataView", 'graphTitle']
  */
  outlets: ["metaDataView", 'graphTitle'],

  /**
    The DOM element that contains the meta data for an item. Bound to the '.meta-data?' element.

    @outlet {DOM Element} '.meta-data?'
  */
  metaDataView: ".meta-data?",

  /**
    The title for what is being viewed.

    @outlet {DOM Element} '.graph-data?'
  */
  graphTitle: ".graph-title?",



  /************************************************************************************
    Internal properties that are used for rendering and book keeping.
  *************************************************************************************/

  /**
    Cached width of the view's canvas, set by the displayProperties.

    @property {Integer}
    @default 800px
  */
  _canvasWidth: 800,

  /**
    Cached height of the view's canvas, set by the displayProperties.

    @property {Integer}
    @default 600px
  */
  _canvasHeight: 600,

  /**
    Cached height property from displayProperties.

    @property {Integer}
  */
  _h: 0,

  /**
    Cached width property from displayProperties.

    @property {Integer}
  */
  _w: 0,

  /**
    Cached x-axis offset property from displayProperties.

    @property {Integer}
  */
  _x: 0,

  /**
    Cached y-axis offset property from displayProperties.

    @property {Integer}
  */
  _y: 0,

  /** 
    The found GUID.
  
    @property {String}
  */
  _foundGuid: null,

  /** 
    "canvas" for the svg tag. 
  
    @property {DOM Element}
  */
  svgCanvas: null,

  /** 
    The deepest explored area.
  
    @private 
    @property {Integer}
    @default 0
  */
  _deepest: 0,
  
  /** 
    Option to keep lines pinned if desired.
  
    @private 
    @property {Boolean}
    @default NO
  */
  _linesPinned: NO,
  
  /** 
    Visited nodes.
  
    @private 
    @property {Object}
  */
  _visited: {},
  
  /** 
    Positioned nodes.
  
    @private 
    @property {Object}
  */
  _positioned: {},

  /** 
    Nodes.
  
    @private 
    @property {Object}
  */
  _nodes: {},

  /** 
    SVG Node cache. To prevent needless waste.
  
    @private 
    @property {Object}
  */
  _svgNodesCache: {},

  /** 
    SVG Edges Text cache. To prevent needless waste.
  
    @private 
    @property {Object}
  */
  _svgEdgesTextCache: {},

  /** 
    SVG Edges cache. To prevent needless waste.
  
    @private 
    @property {Object}
  */
  _svgEdgesCache: {},

  /** 
    SVG Text cache. To prevent needless waste.
  
    @private 
    @property {Object}
  */
  _svgTextCache: {},

  /** 
    The left bound of the visualization, used for specifying a bounding box to zoom to.
  
    @private 
    @property {Integer}
    @default 0
  */
  _lBound: 0,

  /** 
    The right bound of the visualization, used for specifying a bounding box to zoom to.
  
    @private 
    @property {Integer}
    @default 0
  */
  _rBound: 0,

  /** 
    The top bound of the visualization, used for specifying a bounding box to zoom to.
  
    @private 
    @property {Integer}
    @default 0
  */
  _tBound: 0,

  /** 
    The bottom bound of the visualization, used for specifying a bounding box to zoom to.
  
    @private 
    @property {Integer}
    @default 0
  */
  _bBound: 0,
  
  /** 
    The length of the edges.
  
    @private 
    @property {Integer}
    @default 0
  */
  _offset: 0,
  
  /** 
    The radius of the circle.
  
    @private 
    @property {Integer}
    @default 0
  */
  _radius: 0,

  /** 
    The last deepest zoom.
  
    @private 
    @property {Integer}
    @default 0
  */
  _lastDeepest: 0,

  /** 
    Node border width style caches.
  
    @private 
    @property {Integer}
    @default 1px
  */
  _last_nodeBorderWidth: 1,
  
  /**
    Hash used to prevent infinite loops during retrieval.

    @private
    @type {Object}
  */
  _retrieved: {},

  /************************************************************************************
    Observers.
  *************************************************************************************/

  /**
    When the displayProperities binding changes, update the view appropriately.

    @observes displayProperties
    @observes depth
    @observes linkThreshold
  
    @param force {boolean} If YES, force a redraw.
    
    @returns {Boolean} Returns NO if there is no guid of if the view is not visible.
  */
  displayPropertiesDidChange: function(force)
  {

    if(!this.get("isVisible") || !this.displayProperties) return NO;

    // Save display properties locally.
    var h = this.displayProperties.height;
    var w = this.displayProperties.width;
    var x = this.displayProperties.left;
    var y = this.displayProperties.top;
    var z = this.displayProperties.zoomValue;
    var pW = this.displayProperties.portalWidth;
    var pH = this.displayProperties.portalHeight;
    var depth = this.depth;
    var linkThreshold = this.linkThreshold;
    
    this._linesPinned = NO;
    var left = top = right = bottom = 0;

    var delegate = this.get('delegate');
    if(delegate) {
      this._left = delegate.get('leftOffset');
      this._top = delegate.get('topOffset');
      this._right = delegate.get('rightOffset');
      this._bottom = delegate.get('bottomOffset');
    }

    // Set the style and frame of the view. This replaces set('frame', {...}) due to performance reasons.
    this.setStyle({top: top+'px', right: right+'px', bottom: bottom+'px', left: left+'px'});
    this._frame = {top: top, right: right, bottom: bottom, left: left};

    // Set the canvas dimensions.
    this.svgCanvas.setAttributeNS(null, 'height', pH);
    this.svgCanvas.setAttributeNS(null, 'width', pW);

    // Invert the display variables here to set the view box.
    // this.svgCanvas.setAttributeNS(null, 'viewBox', (pW+' '+pH+' '+Math.abs(x)+' '+Math.abs(y)));

    // Save the canvas height and width.
    this._canvasHeight = h;
    this._canvasWidth = w;

    // Force redraw when window is resized.
    var forceRedraw = (((this._h != h || this._w != w)) && this._z == z || depth != this._cached_depth || linkThreshold != this._cached_linkThreshold);
    
    if(this._cachedLinkThreshold != linkThreshold)
    {
      this._hideExistingLines();
    }

    // Save the properties as needed.
    this._h = h;
    this._w = w;
    this._x = x;
    this._y = y;
    this._z = z;
    this._zI = z/NODEGRAPH_DEFAULT_SCALE;
    this._pH = pH;
    this._pW = pW;
    this._cached_depth = depth;
    this._cached_linkThreshold = linkThreshold;
    
    // Hide meta data as the coordinates of things may have changed.
    this._hideMetaData();


    if(this.svgGroup)
      this.svgGroup.setAttributeNS(null, 'transform', 'scale('+this._zI+') translate('+ (this._x/this._zI) +',' + (this._y/this._zI)+')');

    // If there is a resize of the window, then you have to redraw to match the new view port.
    if(forceRedraw && typeof force != "boolean" && this._cachedContent)  
    {
      this._foundGuid =  null;
      this._render();
    }
  }.observes('displayProperties', 'depth', 'linkThreshold'),

  /**
    Redraw based on 'content', 'isVisible' binding changes.

    @observes content
    @observes isVisible
  
    @returns {Boolean} Returns NO if there is no guid of if the view is not visible.
  */
  redrawParamsDidChange: function()
  {
    var content = this.get('content');

    // If there is no content or if you're not visible, bail.
    if(!this.get("isVisible") || !content) return NO;

    if(this.get('delegate')) {
      // Set the zoom values to the view defaults.
      this.get('delegate').set("zoomValueMax", NODEGRAPH_DEFAULT_SCALE);
      this.get('delegate').set("zoomStep", 0.5);
    }

    if(this.metaDataClassName != '')
    {
      this.metaDataView.addClassName(this.metaDataClassName);
    }
    
    if(!this._cachedContent || this._cachedContent.get('guid') !== content.get('guid')) 
    {
      // Hide meta data view.
      this._hideMetaData();
      this._svgNodesCache = {};
      this._svgEdgesTextCache = {};
      this._svgEdgesCache = {};
      this._svgTextCache = {};
      this._svgRels = {};
      this._clearSVG();
      if(this.get('delegate')) this.get('delegate').zoomOutFull();
      this._lastDeepest = null;
      
      this.setDefaultTitle(content);
      
    }
    
    if(!this._cachedContent)
    {
      this.setBindingDefaults();
    }
    
    this._foundGuid =  null;
    this._cachedContent = content;
    this.displayPropertiesDidChange(YES);
    this._deepest = 0;
    this._render();

  }.observes('content', 'isVisible'),
  
  
  
  /************************************************************************************
    Mouse handling.
  *************************************************************************************/

  /** 
    If the mouse is moved on top of the view, see if there is any meta data to show.
  
    @param {DOM Event} evt The mouseMoved event.
  */
  mouseMoved: function(evt)
  {
    var guid = evt.target.getAttribute('guid');
    if(guid)
    {
      if(this._foundGuid != guid && !this._linesPinned)
      {

        this._hideExistingLines();

        this._foundGuid = guid;

        var object = this.findCustomObject(guid);
        var elm = (this._svgNodesCache[guid]) ? this._svgNodesCache[guid].elm : null;
        if(elm)
        {
          elm.setAttributeNS(null, 'fill', this.nodeColorSel);    
          elm.setAttributeNS(null, 'stroke', this.nodeBorderColorSel);    
        }
        if(object)
        {
          var relations = this.findCustomObjectAttr(object);
        }
        var relLen = relations.length;
        for(var i=0; i<relLen; i++)
        {
          var g = this.getGuidForRelation(relations[i]);
          var edge = (this._svgEdgesCache[this._foundGuid+g] || this._svgEdgesCache[g+this._foundGuid]);
          if(edge)
          {
            var elmm = edge.elm;
            if(elmm)
            {
              elmm.setAttributeNS(null, 'stroke', this.edgeColorSel);
              elmm.setAttributeNS(null, 'stroke-opacity', this.edgeOpacitySel);
            }
          }
        }
      }

      this._showMetaData({x: Event.pointerX(evt), y: Event.pointerY(evt)}, guid);
    }
    else
    {
      this._hideMetaData();
    }
  },

  /**
    Hide the lines when redrawing happens.
  */
  _hideExistingLines: function()
  {

    if(this._foundGuid && this._svgNodesCache[this._foundGuid])
    {
      var object = this.findCustomObject(this._foundGuid);

      if(object)
      {
        var relations = this.findCustomObjectAttr(object);
      }
      
      var elm = this._svgNodesCache[this._foundGuid].elm;
      if(elm)
      {
        elm.removeAttributeNS(null, 'fill');    
        elm.removeAttributeNS(null, 'stroke');    
      }
      
      var relLen = relations.length;
      for(var i=0; i<relLen; i++)
      {
        var g = this.getGuidForRelation(relations[i]);
        var edge = (this._svgEdgesCache[this._foundGuid+g] || this._svgEdgesCache[g+this._foundGuid]);
        if(edge)
        {
          var elmm = edge.elm;
          if(elmm)
          {
            elmm.removeAttributeNS(null, 'stroke');    
            elmm.removeAttributeNS(null, 'stroke-opacity');    
          }
        }
      }
    }    
    
    this._foundGuid = null;
  },

  /** 
    If the mouse leaves the area, hide the meta-data view.
  
    @param {DOM Event} evt The mouseExited event.
  */
  mouseExited: function(evt)
  {
    this._hideMetaData();
  },

  /** 
    Save the GUID of the element and invoke delegate if possible.
    
    @param {DOM Event} evt The mouseDown event.
  */
  mouseDown: function(evt)
  {
    var guid = evt.target.getAttribute('guid');
    if(guid)
    {
      this._mouseDownGUID = guid;
      if(this.get('delegate')) {
        this.get('delegate').nodeGraphDidMouseDown(evt, this, guid);
      }
      return YES;
    }
    else
    {
      return this.handleMouseDownDrag(evt);
    }
    return NO;

  },

  /**
    Pin the lines for object.
  */
  pinLinesForObj: function()
  {
    this._linesPinned = !this._linesPinned;
  },


  /************************************************************************************
    Internal methods.
  *************************************************************************************/

  /**
    Hide meta data box.
  */
  _hideMetaData: function()
  {
    // Hide meta data view.
    this.metaDataView.removeClassName("show-meta-data-small");
  },

  /**
    Show meta data for item!
    

    @param coordinates {Object} The x,y coordinates of the mouse pointer.
    @param guid {string} The guid of the item.
  
    @returns {Boolean} Returns NO if there are no coordinates or content.
  */
  _showMetaData: function(coordinates, guid)
  {
    if(!coordinates) return NO;

    var x = coordinates.x+10;
    var y = coordinates.y-10;
  
    var topOffset = this._topOffset ? this._topOffset : 0;
    var bottomOffset = this._bottomOffset ? this._bottomOffset : 0;
    var rightOffset = this._rightOffset ? this._rightOffset : 0;
    var leftOffset = this._leftOffset ? this._leftOffset : 0;

    var wHeight = NodeGraph.windowHeight()-topOffset-bottomOffset;
    var wWidth = NodeGraph.windowWidth()-rightOffset-leftOffset;
    
    if(y < topOffset) y = topOffset;
    if(x < leftOffset) x = leftOffset;
    if(y > (wHeight-this.metaDataBoxHeightSmall)) y = (wHeight-this.metaDataBoxHeightSmall)-topOffset-bottomOffset;
    if(x > (wWidth-this.metaDataBoxWidthSmall)) x = (wWidth-this.metaDataBoxWidthSmall)+1;

    this.metaDataView.style.top = y + "px";
    this.metaDataView.style.left = x + "px";

    // Show the meta data view.
    this.metaDataView.addClassName("show-meta-data-small");

    this.generateCustomMetaData(guid);
  },


  /**
    Collect what needs to be rendered.
    
    Then render the view.

  */
  _render: function()
  {
    // Null out variables.
    this._guidsNeeded = [];
    this._nodes = {};
    this._visited = {};
    this._positioned = {};

    // Collect any guids that we need to retrieve from the server.
    this._checkForData(this._cachedContent.get('guid'), 0);
    
    // Get the actually deepest level.
    var deepest = 1;
    for(var g in this._visited)
    {
      if(this._visited[g].level > deepest) deepest = this._visited[g].level;
    }
    
    // Set it for use in other functions.
    this._deepest = deepest;
    
    // Calculate the radius and the edge length offset.
    this._radius = this._h/this.nodeDefaultRadius/deepest*NODEGRAPH_DEFAULT_SCALE/this._z;
    this._offset = (this._h/2-(this._h/2*.2))/this._deepest*NODEGRAPH_DEFAULT_SCALE/this._z;

    var fixedGuid = this._cachedContent.get('guid');
    
    this._lBound = 1000000;
    this._rBound = 0;
    this._tBound = 1000000;
    this._bBound = 0;
    
    // Calculate the local x and y for the center node.
    var lX = this._w/2*NODEGRAPH_DEFAULT_SCALE/this._z;
    var lY = this._h/2*NODEGRAPH_DEFAULT_SCALE/this._z;

    // Set the main node's info.
    this._positioned[fixedGuid] = 1;
    this._nodes[fixedGuid] = {guid: fixedGuid, level: 0, radius: this._radius, sx: lX, sy: lY, ex: lX, ey: lY, isMain: YES, content: this._cachedContent};
    
    // Recursively coordinates for everything else. Start with theta and delta at 360.
    this._generateDataCoords(this._cachedContent.get('guid'), 0, lX, lY, 360, 360);

    // Now retrieve the next level as needed..
    if(this._guidsNeeded.length > 0)
    {
      // console.log("retrieving " +this._guidsNeeded.length + " objects…");
      // Now retrieve the next level as needed..
      var callBack = function() { this.redrawParamsDidChange(); }.bind(this, this.get('content'));
      this.performCustomRequest(this._guidsNeeded, callBack);
    }
    
    // Zoom in to reveal more of the graph it is needed.
    
    var lBound = this._radius*2;
    var rBound = this._w*NODEGRAPH_DEFAULT_SCALE/this._z-this._radius*4;
    var tBound = this._radius;
    var bBound = this._h*NODEGRAPH_DEFAULT_SCALE/this._z-this._radius;
    var height = (bBound-tBound);
    var width = (rBound-lBound);
    
    var iLBound = this._lBound-this._radius;
    var iRBound = this._rBound+this._radius;
    var iTBound = this._tBound-this._radius;
    var iBBound = this._bBound+this._radius;
    var iHeight = (iBBound-iTBound);
    var iWidth = (iRBound-iLBound);
    
    
    if(this._lastDeepest != deepest)
    {
      var zoomValue = Math.min(width/iWidth, height/iHeight);

      zoomValue = zoomValue-zoomValue%.5;
      var pctX =  (1- (width-iWidth/2-iLBound)/width);
      var pctY =  (1- (height-iHeight/2-iTBound)/height);

      if(this.get('delegate')) this.get('delegate').zoomToLocation(pctX, pctY, zoomValue);
    }

      // Render the SVG.
    this._renderGraph();
    
    this._lastDeepest = deepest;
  },
  
  /**
    Render the SVG.

  */
  _renderGraph: function()
  {
    // Get the objects.
    var nodes = this._nodes;
    var subjectArr = []; 
    
    // Calculate the zoom value used.
    var zoomVal = NODEGRAPH_DEFAULT_SCALE/this._deepest;

    // Load custom values.
    var showEdgeLabel = this.showEdgeLabel;
    var edgeMinWidth = this.edgeMinWidth;
    var useEdgeWeightWidth = this.useEdgeWeightWidth;
    var edgeTextPosOffset = this.edgeTextPosOffset;
    var edgeTextPosOffsetI = 1-this.edgeTextPosOffset;
    var nodeTextRatio = this.nodeTextRatio;
    var nodeXYRatio = this.nodeXYRatio;
    var newNodeStartRadius = 4*zoomVal;

    var nodeBorderWidth = this.nodeBorderWidth*zoomVal;
    if(nodeBorderWidth != this._last_nodeBorderWidth)
    {
      
      subjectArr.push({
        elm: this.svgNodes, 
        props: {'stroke-width': {start: this._last_nodeBorderWidth, end: nodeBorderWidth}},
        duration: 250,
        isSVG: YES
       });
      this._last_nodeBorderWidth = nodeBorderWidth;
    }
    
    // Set the temp arrays. Used later to discard unused nodes.
    var t_svgNodes = [];
    var t_svgEdges = [];
    var t_svgEdgesText = [];
    var t_svgText = [];

    // Pull the current nodes from the cache.
    var svgNodes = this._svgNodesCache;
    var svgEdges = this._svgEdgesCache;
    var svgText = this._svgTextCache;
    var svgEdgesText = this._svgEdgesTextCache;

    // For each explored node, render it and the associated edges.
    for(var key in nodes)
    {
      var node1 = nodes[key];
      var object = node1.content;
      if(!object) continue;
      
      // Get the relations for the edges.
      var relations = this.findCustomObjectAttr(object);

      // Calculate things now that will be static.
      var node1sx = node1.sx;
      var node1sy = node1.sy;
      var node1ex = node1.ex;
      var node1ey = node1.ey;
      var ry = node1.radius;
      var rx = ry*nodeXYRatio;
      
      var fontSize = ry/nodeTextRatio;
      var oldFontSize = ry/nodeTextRatio;

      var newNode = (!svgNodes[key]);
      var x = !newNode ? node1ex : node1sx;
      var y = (!newNode ? node1ey : node1sy);
      
      // Set up the defaults for the node and text.
      var params = {cx: x, cy: y, ry: ry, rx: rx, type: 'unfocused', guid: key};
      var txtParams = {x: x, y: y, 'font-size': fontSize, type: 'unfocused', guid: key};
      
      // If the node exists, see if it needs to transition or not.
      if(!newNode)
      {
        var oldParams = svgNodes[key].params;
        var nodeElm = svgNodes[key].elm;
        var textElm = svgText[key].elm;
        
        // animation properties.
        var anim = {};
        var tAnim = {};
        var doAnim = NO;
        // var tLen = svgText[key].tLen;
        
        if(oldParams.cx != x) { anim.cx = {start: oldParams.cx, end: x}; tAnim.x = {start: oldParams.cx, end: x}; doAnim = YES; }
        if(oldParams.cy != y) { oldFontSize = oldParams.ry/2; anim.cy = {start: oldParams.cy, end: y}; tAnim.y = {start: oldParams.cy, end: y}; doAnim = YES; }
        if(oldParams.ry != ry) { 
          anim.rx = {start: oldParams.rx, end: rx}; 
          anim.ry = {start: oldParams.ry, end: ry}; 
          tAnim['font-size'] = {start: oldFontSize, end: fontSize}; 
          doAnim = YES; 
        }
      
        if(doAnim)
        {
          subjectArr.push({
            elm: nodeElm, 
            props: anim,
            duration: 250,
            isSVG: YES
           });
          subjectArr.push({
           elm: textElm, 
           props: tAnim,
           duration: 250,
           isSVG: YES
          });
        }
      }
      
      // If the node doesn't exist, we need to create it.
      else
      {
        // Create the node.
        svgNodes[key] = {elm: this._createSVGElement('ellipse', params,{}, NODE), params: params};

        // Create the text.
        svgText[key] = {elm: this._createSVGElement('text', txtParams, {}, TEXT), params: txtParams};
  
        svgText[key].elm.appendChild(document.createTextNode(this.findCustomObjectLabel(object)));
        
        // Animate it in.
        subjectArr.push({
          elm: svgNodes[key].elm, 
          props:
          {
            cx: {start: x, end: node1ex},
            cy: {start: y, end: node1ey},
            ry: {start: newNodeStartRadius, end: ry},
            rx: {start: newNodeStartRadius, end: rx}
          },
          duration: 250,
          isSVG: YES
         });
        subjectArr.push({
         elm: svgText[key].elm, 
         props:
         {
           x: {start: x, end: node1ex},
           y: {start: y, end: node1ey}
         },
         duration: 250,
         isSVG: YES
        });
      }
      
      // Save back the end params.
      svgNodes[key].params.rx = rx;
      svgNodes[key].params.ry = ry;
      svgText[key].params.x = node1ex-2*zoomVal;
      svgText[key].params.y = node1ey-2*zoomVal;

      // Push it on the temp array so that we keep it.
      t_svgNodes.push(key);
      t_svgText.push(key);

      
      if(this.showEdges)
      {
        
        // For each of the relations, draw the edges if we need to.
        var relLen = relations.length;
        for(var i=0; i<relLen; i++)
        {
          // Get the relation.
          var k = this.getGuidForRelation(relations[i]);
          var node2 = nodes[k];

          var key1 = k+key;
          var key2 = key+k;
        
          // If the relation exists.
          if(node2)
          {
            // Save variables.
            var node2sx = node2.sx;
            var node2sy = node2.sy;
            var node2ex = node2.ex;
            var node2ey = node2.ey;

            if(useEdgeWeightWidth)
            {
              // Calculate edge weight.
              var weight = this.calcRelationWeight(relations[i]); 

              // Set the width of the edge.
              var width = Math.max(edgeMinWidth, Math.min(Math.floor(weight/5+2), 6))*zoomVal;
            }
            else
            {
              var width = edgeMinWidth*zoomVal;
            }

            // Pick the start and end.
            var x1 = (newNode) ? node1sx : node1ex;
            var y1 = (newNode) ? node1sy : node1ey;
            var x2 = (!svgNodes[k]) ? node2sx : node2ex;
            var y2 = (!svgNodes[k]) ? node2sy : node2ey;
          
            if(showEdgeLabel)
            {

              // Mid point label end point.
              var emx = (node1ex*edgeTextPosOffsetI+node2ex*(edgeTextPosOffset));
              var emy = (node1ey*edgeTextPosOffsetI+node2ey*(edgeTextPosOffset))+zoomVal*3;
            }

            var params = {x1: x1, y1: y1, x2: x2, y2: y2, 'stroke-width': width};

            // If there is an edge already that hasn't been processed yet, process it.
            if((svgEdges[key1] || svgEdges[key2]) && t_svgEdges.indexOf(key1) == -1 && t_svgEdges.indexOf(key2) == -1)
            {
            
              // Get the edge info.
              var oldParams = svgEdges[key1].params;
              var edgeElm = svgEdges[key1].elm;

              // animation properties.
              var anim = {};
              var doAnim = NO;
              if(oldParams.x1 != x1) { anim.x1 = {start: oldParams.x1, end: x1}; doAnim = YES; }
              if(oldParams.x2 != x2) { anim.x2 = {start: oldParams.x2, end: x2}; doAnim = YES; }
              if(oldParams.y1 != y1) { anim.y1 = {start: oldParams.y1, end: y1}; doAnim = YES; }
              if(oldParams.y2 != y2) { anim.y2 = {start: oldParams.y2, end: y2}; doAnim = YES; }

              // direct set properities.
              edgeElm.setAttributeNS(null, "stroke-width", width);

              if(doAnim)
              {
                subjectArr.push({
                  elm: edgeElm, 
                  props: anim,
                  duration: 250,
                  isSVG: YES
                 });

                 if(showEdgeLabel)
                 {
                   subjectArr.push({
                    elm: svgEdgesText[key1].elm, 
                    props: {
                      x: {start: (oldParams.x1*edgeTextPosOffsetI+oldParams.x2*(edgeTextPosOffset)), end: emx},
                      y: {start: (oldParams.y1*edgeTextPosOffsetI+oldParams.y2*(edgeTextPosOffset))+3*zoomVal, end: emy},
                      'font-size': {start: oldFontSize, end: fontSize}
                    },
                    duration: 250,
                    isSVG: YES
                   });
                 }
              }
              svgEdges[key1].params.x1 = svgEdges[key2].params.x1 = x1;
              svgEdges[key1].params.y1 = svgEdges[key2].params.y1 = y1;
              svgEdges[key1].params.x2 = svgEdges[key2].params.x2 = x2;
              svgEdges[key1].params.y2 = svgEdges[key2].params.y2 = y2;
            }
          
            // If you need to create a new one, do the following.
            else if(t_svgEdges.indexOf(key1) == -1 && t_svgEdges.indexOf(key2) == -1)
            {
            
              x1 = (newNode) ? node1sx : svgNodes[key].params.cx;
              y1 = (newNode) ? node1sy : svgNodes[key].params.cy;
            
              if(showEdgeLabel)
              {
                var smx = (x1*edgeTextPosOffsetI+x2*(edgeTextPosOffset));
                var smy = (y1*edgeTextPosOffsetI+y2*(edgeTextPosOffset))+3*zoomVal;
                var textParams = {x: smx, y: smy, 'font-size': fontSize};
                svgEdgesText[key1] = svgEdgesText[key2] = {elm: this._createSVGElement('text', textParams, {}, EDGETEXT), params: params};
                svgEdgesText[key1].elm.appendChild(document.createTextNode(weight));
              }

              svgEdges[key1] = svgEdges[key2] = {elm: this._createSVGElement('line', params,{}, EDGE), params: params};

              var anim = {};
              var doAnim = NO;

              if(node1ex != x1) { anim.x1 = {start: x1, end: node1ex}; doAnim = YES; }
              if(node1ey != y1) { anim.y1 = {start: y1, end: node1ey}; doAnim = YES;  }
              if(node2ex != x2) { anim.x2 = {start: x2, end: node2ex}; doAnim = YES;  }
              if(node2ey != y2) { anim.y2 = {start: y2, end: node2ey}; doAnim = YES;  }

              if(doAnim)
              {
              
                subjectArr.push({
                 elm: svgEdges[key1].elm, 
                 props: anim,
                 duration: 250,
                 isSVG: YES
                });
              
                if(showEdgeLabel)
                {
                  subjectArr.push({
                   elm: svgEdgesText[key1].elm, 
                   props: {
                     x: {start: smx, end: emx},
                     y: {start: smy, end: emy},
                     'font-size': {start: oldFontSize, end: fontSize}
                   },
                   duration: 250,
                   isSVG: YES
                  });
                }
              }
              svgEdges[key1].params.x1 = svgEdges[key2].params.x1 = node1ex;
              svgEdges[key1].params.y1 = svgEdges[key2].params.y1 = node1ey;
              svgEdges[key1].params.x2 = svgEdges[key2].params.x2 = node2ex;
              svgEdges[key1].params.y2 = svgEdges[key2].params.y2 = node2ey;
            }
            if(showEdgeLabel)
            {
              svgEdgesText[key1].params.x = svgEdgesText[key2].params.x = emx;
              svgEdgesText[key1].params.y = svgEdgesText[key2].params.y = emy;
            }
            t_svgEdges.push(key2);
            t_svgEdges.push(key1);
            if(showEdgeLabel)
            {
              t_svgEdgesText.push(key2);
              t_svgEdgesText.push(key1);
            }
          }
        }
      }
      svgNodes[key].params.cx = node1ex;
      svgNodes[key].params.cy = node1ey;
    }
    NodeGraph.animator.addSubjects(subjectArr, this.svgCanvas, this._pH);
    
    // Clear elements as needed.
    this._clearSVGElms(svgNodes, t_svgNodes, this.svgNodes);
    this._clearSVGElms(svgEdges, t_svgEdges, this.svgEdges);
    this._clearSVGElms(svgText, t_svgText, this.svgText);
    this._clearSVGElms(svgEdgesText, t_svgEdgesText, this.svgEdgesText);

    // Save back the cache.
    this._svgTextCache = svgText;
    this._svgEdgesTextCache = svgEdgesText;
    this._svgEdgesCache = svgEdges;
    this._svgNodesCache = svgNodes;

  },

  /**
    Check what data needs to be retrieved.
  
  
    @param guid {string} The guid of the item.
    @param level {Integer} The current level.
  */
  _checkForData: function(guid, level)
  {
    // Get the object.
    var object = this.findCustomObject(guid);
    
    // If the object exists, then get its relations.  Also enter if you are at a lower level.
    if(object && (!this._visited[guid] || this._visited[guid].level > level))
    {
      var rels = this.findCustomObjectAttr(object);
      var childCount = rels.length;
      var nextLvl = level+1;
      if(!this._visited[guid])
      {
        this._visited[guid] = {level: level,  count: 1, childCount: childCount};
      }
      else
      {
        var lLevel = this._visited[guid].level;
        this._visited[guid].level = (level < lLevel) ? level : lLevel;
        this._visited[guid].count++;
      }
      
      // If you need to explore deeper, do so.
      if(nextLvl <= this._cached_depth)
      {
        for(var i=0; i<childCount; i++)
        {
          if(this.relationMeetsCustomThreshold(rels[i]))
          {
            this._checkForData(this.getGuidForRelation(rels[i]), nextLvl);   
          }
        }
      }
    }
    else if(this._visited[guid])
    {
      this._visited[guid].count++;
    }
    else
    {
      if(!this._retrieved[guid])
      {
        this._guidsNeeded.push(guid);
        this._retrieved[guid] = 1;
      }
    }
  },
  
  /**
    Generate the coordinates needed.
  
  
    @param guid {string} The guid of the item.
    @param level {Integer} The current level.
    @param x {Integer} The x coordinate in pixels.
    @param y {Integer} The y coordinate in pixels.
    @param delta {Integer} The delta in degrees.
    @param theta {Integer} The delta in theta.
  */
  _generateDataCoords: function(guid, level, x, y, delta, theta)
  {
    // Get the object.
    var object = this.findCustomObject(guid);
    var n = this._nodes[guid];
    if(object && n)
    {
      n.content = object;
      var nextLvl = level+1;
      var r = this.findCustomObjectAttr(object);
      var rels = [];
      var pos = [];
      var max = 0;
      var maxChildren = 0;
      var rLen = r.length;
      
      // Look through the relation array and find the items have been visited but not positioned. 
      // Save the max values for the number of children and weight.
      for(var i=0; i<rLen; i++)
      {
        var rel = r[i];
        var g = this.getGuidForRelation(rel);
        if(this._visited[g] &&  !this._positioned[g]) 
        {
          if(this._visited[g].childCount > maxChildren) 
          {
            maxChildren = this._visited[g].childCount;
          }
          var w = this.calcRelationWeight(rel);
          if(w > max) 
          {
            max = w;
          }
          rels.push([g, w]);
        }
      }

      // If there are children, render them.
      var childCount = rels.length;
      if(childCount > 0)
      {
        var dl = (level == 0) ? delta/childCount : delta/(childCount-1);
        var th = (level == 0 || childCount == 1) ? theta : theta-delta/2;
        var sTh = th;
        var offset = this._offset;
        var radius = Math.min(this._radius,(2*Math.PI*offset)*(delta/360)/childCount/4);
        var PI180 = Math.PI/180;
        var deepest = this._deepest;
        var lOffset = (offset*NODEGRAPH_OFFSET_PERCENT);

        // For each child, calculate the position information.
        for(var i=0; i<childCount; i++)
        {
          pos[i] = [];
          var g = rels[i][0];
          var visitLvl = this._visited[g].level;
          if(visitLvl == nextLvl && !this._positioned[g])
          {
            var o = (visitLvl != deepest) ? lOffset*(1-this._visited[g].childCount/maxChildren) : 0;
            var locOffset = (NODEGRAPH_USE_CHILDREN_OFFSET) ? (offset-o) : offset;

            var angle = th*PI180;
            var lx = x + locOffset*Math.cos(angle);
            var ly = y + locOffset*Math.sin(angle);
            if(lx < this._lBound) this._lBound = lx;
            if(lx > this._rBound) this._rBound = lx;
            if(ly < this._tBound) this._tBound = ly;
            if(ly > this._bBound) this._bBound = ly;
            
            this._nodes[g] = {guid: g, level: visitLvl, ex: lx, ey: ly, sx: x, sy: y, radius: radius};
            this._positioned[g] = YES;
            pos[i] = [lx, ly];
            th+=dl;
          }
        }
        
        // If you should render the next, level iterate over the children again and go deeper.
        if(nextLvl <= this._cached_depth)
        {
          for(var i=0; i<childCount; i++)
          {
            this._generateDataCoords(rels[i][0], nextLvl, pos[i][0], pos[i][1], Math.min(dl%360*1.5, 90), sTh%360);  
            sTh+=dl;
          }
        }
      }
    }
  },
  
  /**
    Clear all SVG elements.
  
  */
  _clearSVG: function()
  {
    var svg = this.svgNodes;
    while (svg.firstChild) 
    {
      svg.removeChild(svg.firstChild);
    }
    var svg = this.svgEdges;
    while (svg.firstChild) 
    {
      svg.removeChild(svg.firstChild);
    }
    var svg = this.svgText;
    while (svg.firstChild) 
    {
      svg.removeChild(svg.firstChild);
    }
    var svg = this.svgEdgesText;
    while (svg.firstChild) 
    {
      svg.removeChild(svg.firstChild);
    }
  },

  /**
    Create a new SVG element.
  
    @param type {string} The node type.
    @param attributes {Object} The attributes hash.
    @param events {Object} The events hash.
    @param kind {Integer} Flag that specifies what SVG element to attach the element to.
    
    @returns {Array} {DOM Element} The SVG element that was created.
  */
  _createSVGElement: function(type, attributes, events, kind)
  {
    var elm = document.createElementNS("http://www.w3.org/2000/svg", type);
    if(attributes)
    {
      for(var key in attributes)
      {
        if(isNaN(attributes[key]) || key.indexOf('opacity') != -1)
        {
           elm.setAttributeNS(null, key, attributes[key]);
        }
        else
        {
           elm.setAttributeNS(null, key, Math.floor(attributes[key]));
        }
      }
    }
    
    switch(kind)
    {
      case NODE:
        this.svgNodes.appendChild(elm);
        break;
      case EDGE:
        this.svgEdges.appendChild(elm);
        break;
      case TEXT:
        this.svgText.appendChild(elm);
        break;
      case EDGETEXT:
        this.svgEdgesText.appendChild(elm);
        break;
      default:
        break;
    }
     return elm;
  },
  
  /**
    Clear SVG elements selectively.
  
    @param has {Object} The old DOM node cache.
    @param array {Array} The array of currently rendered DOM nodes.
    @param {DOM Element} svg The DOM element to attach to.
  */
  _clearSVGElms: function(hash, array, svg)
  {
    for(var key in hash)
    {
      if(array.indexOf(key) == -1)
      {
        try
        {
          svg.removeChild(hash[key].elm);
          delete hash[key].elm;
          delete hash[key].params;
          delete hash[key];
        }
        catch(e)
        {
          try
          {
            delete hash[key];
          }
          catch(e){}
        }
      }
    }
  },
  
  /**
     Initalization function.

     Set up the SVG DOM Nodes.

  */
  init: function()
  {
    sc_super();
    
    if(!this.get('delegate')) console.log("NodeGraph: Delegate not specified. Certain functionality like complex zooming is NOT supported without using a delegate.");

    // Set up svg canvas.
    this.svgCanvas = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    this.rootElement.appendChild(this.svgCanvas);

    this.svgFitGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.svgCanvas.appendChild(this.svgFitGroup);

    this.svgGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.svgFitGroup.appendChild(this.svgGroup);

    this.svgEdges = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.svgGroup.appendChild(this.svgEdges);

    // Set up the edge default styling.
    this.svgEdges.setAttributeNS(null, "stroke", this.edgeColor);
   
    if(this.edgeOpacity != 1)
    {
      this.svgEdges.setAttributeNS(null, 'stroke-opacity', this.edgeOpacity);
    }

    this.svgEdgesText = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.svgGroup.appendChild(this.svgEdgesText);

    // Set up edge text default styles.

    this.svgEdgesText.setAttributeNS(null, 'fill', this.edgeTextColor);
    this.svgEdgesText.setAttributeNS(null, 'text-anchor', 'middle');
    this.svgEdgesText.setAttributeNS(null, 'style', "cursor: default");

    this.svgNodes = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.svgGroup.appendChild(this.svgNodes);
    
    // Set up node default styling.
    this.svgNodes.setAttributeNS(null, 'fill', this.nodeColor);
    this.svgNodes.setAttributeNS(null, 'stroke', this.nodeBorderColor);
    this._last_nodeBorderWidth = this.nodeBorderWidth*NODEGRAPH_DEFAULT_SCALE;
    this.svgNodes.setAttributeNS(null, 'stroke-width', this._last_nodeBorderWidth);


    if(this.nodeOpacity != 1)
    {
      this.svgNodes.setAttributeNS(null, 'opacity', this.nodeOpacity);
    }

    this.svgText = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.svgGroup.appendChild(this.svgText);
    
    // Set up the text default styling.
    this.svgText.setAttributeNS(null, 'fill', this.nodeTextColor);
    this.svgText.setAttributeNS(null, 'text-anchor', 'middle');
    this.svgText.setAttributeNS(null, 'style', "cursor: default");

    // If there is a delegate, then notify it that the init is completed.
    if(this.get('delegate')) this.get('delegate').finishInitForGraph(this);
  }
  
}) ;

