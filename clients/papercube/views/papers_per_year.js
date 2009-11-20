// ==========================================================================
// Papercube.PapersPerYearView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class Papercube.PapersPerYearView

  This view shows the references or citations of a paper in chronological order,
  from it's publication year, into the past or the future. It uses nodes and
  edges to show the relationships. A paper only occurs once and there can be multiple
  edges going into a paper. This makes it almost the reverse of Circle View.

  Constants defined in core.js:
  
  var YEARLINE = 5;
  var YEARTEXT = 6;
  var PERYEAR_DEFAULT_SCALE = 20;

  @extends SC.View
  @extends NodeGraph.DragPanMixin
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/

Papercube.PapersPerYearView = SC.View.extend(NodeGraph.DragPanMixin,
/** @scope Papercube.PapersPerYearView.prototype */ {

  /**
    Bind the display properties from the canvasController.

    @property {Array}
    @binding "Papercube.canvasController.displayProperties"
  */
  displayPropertiesBinding: "Papercube.canvasController.displayProperties",

  /**
    Bind the view direction from the viewController.

    @property {String}
    @binding "Papercube.viewController.viewDirection"
  */
  viewDirectionBinding: "Papercube.viewController.viewDirection",

  /**
    Bind the cite threshold binding. Don't show papers with less cites. 
  
    @property {Integer}
    @binding "Papercube.papersPerYearController.citeThreshold"
  */
  citeThresholdBinding: "Papercube.papersPerYearController.citeThreshold",
  
  /**
    Cite threshold cached value. 
    
    @property {Integer}
    @default 1
  */
  _cached_citeThreshold: 1,

  /**
    Bind the ref threshold binding. Don't show papers with less refs. 
  
    @property {Integer}
    @binding "Papercube.papersPerYearController.refThreshold"
  */
  refThresholdBinding: "Papercube.papersPerYearController.refThreshold",

  /**
    Ref threshold cached value.
  
    @property {Integer}
    @default 0
  */
  _cached_refThreshold: 1,

  /**
    Bind the depth. Don't show items beyond this depth.
  
    @property {Integer}
    @binding "Papercube.papersPerYearController.depth"
  */
  depthBinding: "Papercube.papersPerYearController.depth",

  /**
    Bind the hide bogus year param. Don't show items that have bogus years.
  
    @property {Boolean}
    @binding "Papercube.papersPerYearController.hideBogusYears"
  */
  hideBogusYearsBinding: "Papercube.papersPerYearController.hideBogusYears",

  /**
    Hide bogus paper years cached value.
  
    @property {Boolean}
    @default false
  */
  _cached_hideBogusYears: false,


  /**
    Depth cached value.
  
    @property {Integer}
    @default 8
  */
  _cached_depth: 8,

  /**
    Display references or citations.

    @property {Boolean}
    @default YES
  */
  _displayRefs: YES,

  /**
    Cached width of the view's canvas, set by the displayProperties.

    @property {Integer}
    @default 800px
  */
  _canvasWidth: 800,

  /**
    Cached height of the view's canvas, set by the displayProperties.

    @property {Integer}
    @defualt 600px
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
  
  // The height of a row in the visualization.
  _rowHeight: 1,

  /** 
    The deepest explored area.
  
    @private 
    @property {Integer}
    @default 0
  */
  _deepest: 0,

  /**
    Keep track of the things that are already rendered to avoid cycles.

    @private 
    @property {Object}
  */
  _renderTree: {},

  /** 
    The found GUID.
  
    @property {String}
  */
  _foundGuid: null,

  /**
    Meta data box small width. 
    
    @property {Integer}
    @default 400
  */  
  _metaDataBoxWidthSmall: 400,

  /**
    Meta data box small height. 
    
    @property {Integer}
    @default 120
  */  
  _metaDataBoxHeightSmall: 120,

  /**
    Outlets for author stat view.

    ["metaDataView"]
  */
  outlets: ["metaDataView"],

  /** 
    "canvas" for the svg tag. 
  
    @property {DOM Element}
  */
  svgCanvas: null,

  /**
    The DOM element that contains the meta data for an item. Bound to the '.meta-data?' element.

    @outlet
  */
  metaDataView: ".meta-data?",

  /**
    The current selection.
    
    @property {String}
  */
  _selection: null,
  
  /** 
    SVG Node cache. To prevent needless waste.
  
    @private 
    @property {Object}
  */
  _svgNodesCache: {},

  /** 
    SVG Year Text cache. To prevent needless waste.
  
    @private 
    @property {Object}
  */
  _svgYearTextCache: {},

  /** 
    SVG Year Line cache. To prevent needless waste.
  
    @private 
    @property {Object}
  */
  _svgYearLinesCache: {},

  /** 
    SVG Text cache. To prevent needless waste.
  
    @private 
    @property {Object}
  */
  _svgTextCache: {},
  
  /** 
    The needed guids, call the server to get them.
  
    @private 
    @property {Object}
  */
  _guidsNeeded: {},

  /** 
    The papers that are to be rendered, organized by year keys.
  
    @private 
    @property {Object}
  */
  _papersPerYear: {},

  /** 
    If YES, animate node transitions, if NO, don't.
    
    This is set dynamically based on paper count.
  
    @private 
    @property {Boolean}
    @default NO
  */
  _shouldAnimate: NO,
  
  /** 
    If YES, animate year line transitions, if NO, don't.
    
    This is set dynamically based on paper count.
  
    @private 
    @property {Boolean}
    @default NO
  */
  _shouldAnimateYears: NO,

  /**
    Hide meta data box.

  */
  _hideMetaData: function()
  {
    // Hide meta data view.
    this.metaDataView.removeClassName("show-meta-data-small");
  },

  /**
    Show meta data for paper!
    

    @param coordinates {Object} The x,y coordinates of the mouse pointer.
    @param guid {string} The guid of the item.
  
    @returns {Boolean} Returns NO if there are no coordinates or content.
  */
  _showMetaData: function(coordinates, guid)
  {
    if(!coordinates) return NO;

    var x = coordinates.x+10;
    var y = coordinates.y-20;
  
    var wHeight = NodeGraph.windowHeight()-30;
    var wWidth = NodeGraph.windowWidth()-10;
    
    if(y < 30) y = 30;
    if(x < 20) x = 20;
    if(y > (wHeight-this._metaDataBoxHeightSmall)) y = (wHeight-this._metaDataBoxHeightSmall)-30;
    if(x > (wWidth-this._metaDataBoxWidthSmall)) x = (wWidth-this._metaDataBoxWidthSmall)+1;

    this.metaDataView.style.top = y + "px";
    this.metaDataView.style.left = x + "px";

    // Show the meta data view.
    this.metaDataView.addClassName("show-meta-data-small");

    // Get the paper content.
    var content = Papercube.Paper.find(guid);

    if(!content) return;

    // Set the title
    this.metaDataView.childNodes[0].innerHTML = content.get("title");

    // Set the authors
    var authors = content.get('authorNames').join(', ');
    var authLen = authors.length;
    this.metaDataView.childNodes[1].innerHTML = (authLen > 150) ? (authors.substr(0,150)+"&hellip;") : authors;
    this.metaDataView.childNodes[2].innerHTML = (content.get('publisher')) ? content.get('publisher') : '';

    // Set the date
    this.metaDataView.childNodes[3].innerHTML = "<strong>Publication Date: </strong> " + content.get("year");

    this.metaDataView.childNodes[4].innerHTML = Papercube.pluralizeString(" reference", content.get('refCount'));
    this.metaDataView.childNodes[5].innerHTML = Papercube.pluralizeString(" citation", content.get('citeCount'));

  },
  
  /** 
    Option to keep lines pinned if desired.
  
    @private 
    @property {Boolean}
    @default NO
  */
  _linesPinned: NO,
  
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
    Selected node opacity.
    
    @property {Float}
    @config
    @default 1.0
  */
  nodeOpacitySel: 1.0,

  /**
    Node opacity.
    
    @property {Float}
    @config
    @default 0.5
  */
  nodeOpacity: 0.5,

  /**
    The default width of the node border.
    
    @property {Integer}
    @config
    @default 1px
  */
  nodeBorderWidth: 1,
  
  /**
    Ref edge color.
    
    @property {String}
    @config
    @default 'blue'
  */
  edgeRefColor: 'blue',

  /**
    Cite edge color.
    
    @property {String}
    @config
    @default 'red'
  */
  edgeCiteColor: 'red',

  /**
    Edge width.
    
    @property {String}
    @config
    @default 1px
  */
  edgeWidth: 1,
  
  /**
    Year line width.
    
    @property {String}
    @config
    @default 1px
  */
  yearLineWidth: 1,
  
  /**
    The nodeTextRatio allows the font size for the node to the calculated. The font size is calculated as radius/nodeTextRatio.

    @property {Integer}
    @default 5
  */
  nodeTextRatio: 5,
  
  /**
    Year line color
    
    @property {String}
    @config
    @default '#666'
  */
  yearLineColor: '#666',

  /**
    Year text color
    
    @property {String}
    @config
    @default '#555'
  */
  yearTextColor: '#555',
  
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

        if(this._foundGuid)
        {
          var paper = Papercube.Paper.find(this._foundGuid);
          if(paper)
          {
            var refs = paper._attributes.references;
            var cites = paper._attributes.citations;
          }
          var elm = this._svgNodesCache[this._foundGuid].elm;
          if(elm)
          {
            elm.removeAttributeNS(null, 'fill-opacity');
            elm.removeAttributeNS(null, 'fill');
            elm.removeAttributeNS(null, 'stroke-width');
            elm.removeAttributeNS(null, 'stroke');
          }

          var relLen = refs.length;
          for(var i=0; i< relLen; i++)
          {
            var elm = (this._svgNodesCache[refs[i]]) ? this._svgNodesCache[refs[i]].elm : null;
            if(elm)
            {
              elm.removeAttributeNS(null, 'fill-opacity');
              elm.removeAttributeNS(null, 'stroke-width');
              elm.removeAttributeNS(null, 'stroke');
            }
          }
          var relLen = cites.length;
          for(var i=0; i< relLen; i++)
          {
            var elm = (this._svgNodesCache[cites[i]]) ? this._svgNodesCache[cites[i]].elm : null;
            if(elm)
            {
              elm.removeAttributeNS(null, 'fill-opacity');
              elm.removeAttributeNS(null, 'stroke-width');
              elm.removeAttributeNS(null, 'stroke');
            }
          }
        }

        this._removeEdges();
        
        this._foundGuid = guid;
        
        var paper = Papercube.Paper.find(guid);
        var cites = [];
        var refs = [];

        // If the paper exists, then get its references or citations.
        if(paper)
        {
         refs = paper._attributes.references;
         cites = paper._attributes.citations;
        }

        var elm = this._svgNodesCache[guid].elm;
        if(elm)
        {
          elm.setAttributeNS(null, 'fill', this.nodeColorSel);          
          elm.setAttributeNS(null, 'fill-opacity', this.nodeOpacitySel);          
          elm.setAttributeNS(null, 'stroke-width', this.nodeBorderWidth*(PERYEAR_DEFAULT_SCALE-this._z));
          elm.setAttributeNS(null, 'stroke', this.nodeBorderColorSel);
        }

        var startX = parseInt(elm.attributes[0].nodeValue,0);
        var rad = parseInt(elm.attributes[2].nodeValue,0);
        var startY = parseInt(elm.attributes[1].nodeValue,0)+ ((this._displayRefs) ? rad : -rad);

        var borderWidth = this.edgeWidth*(PERYEAR_DEFAULT_SCALE-this._z);

        var relLen = refs.length;
        for(var i=0; i<relLen; i++)
        {
          var elm = (this._svgNodesCache[refs[i]]) ? this._svgNodesCache[refs[i]].elm : null;
          if(elm)
          {
            var endX = parseInt(elm.attributes[0].nodeValue,0);
            var endY = parseInt(elm.attributes[1].nodeValue,0)-((this._displayRefs) ? parseInt(elm.attributes[2].nodeValue,0) : -parseInt(elm.attributes[2].nodeValue,0));
            var qX = startX;
            var qY = (startY+endY)/2;
            this._createSVGElement('path', {d: ('M'+startX+' '+startY+' Q '+qX+' '+qY+' '+endX+' '+endY), fill: 'none', stroke: 'blue', 'stroke-width': borderWidth}, {}, EDGE);
            elm.setAttributeNS(null, 'fill-opacity', this.nodeOpacitySel);    
            elm.setAttributeNS(null, 'stroke-width', borderWidth);
            elm.setAttributeNS(null, 'stroke', this.edgeRefColor);
          }
        }
        var relLen = cites.length;
        for(var i=0; i<relLen; i++)
        {
          var elm = (this._svgNodesCache[cites[i]]) ? this._svgNodesCache[cites[i]].elm : null;
          if(elm)
          {
            var endX = parseInt(elm.attributes[0].nodeValue,0);
            var endY = parseInt(elm.attributes[1].nodeValue,0)-((this._displayRefs) ? parseInt(elm.attributes[2].nodeValue,0) : -parseInt(elm.attributes[2].nodeValue,0));
            var qX = startX;
            var qY = (startY+endY)/2;
            this._createSVGElement('path', {d: ('M'+startX+' '+startY+' Q '+qX+' '+qY+' '+endX+' '+endY), fill: 'none', stroke: 'red', 'stroke-width': borderWidth}, {}, EDGE);
            elm.setAttributeNS(null, 'fill-opacity', this.nodeOpacitySel);    
            elm.setAttributeNS(null, 'stroke-width', borderWidth);
            elm.setAttributeNS(null, 'stroke', this.edgeCiteColor);
          }
        }
        if(SC.isSafari())
        {
          this.svgCanvas.setAttributeNS(null, 'width', this._pW+1);
          this.svgCanvas.setAttributeNS(null, 'width', this._pW);
        }
      }
      // else if(this._linesPinned)
      // {
      //   var elm = this._svgMap[guid];
      //   var rad = parseInt(elm.attributes[2].nodeValue,0);
      // }
      
      this._showMetaData({x: Event.pointerX(evt), y: Event.pointerY(evt)}, guid);
    }
    else
    {
      this._hideMetaData();
    }
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
    Save the GUID of the element and then show the fan.
    
    @param {DOM Event} evt The mouseDown event.
  */
  mouseDown: function(evt)
  {
    var guid = evt.target.getAttribute('guid');
    var type = evt.target.getAttribute('fanType');
    if(guid && type)
    {
      this._mouseDownGUID = guid;
      Papercube.canvasController.showFan(Event.pointerX(evt), Event.pointerY(evt), 'papersperyear', (type+"Fan"));
      return YES;
    }
    else
    {
      return this.handleMouseDownDrag(evt);
    }
    return NO;

  },

  /**
    Pin the lines for paper.
  */
  pinLinesForPaper: function()
  {
    this._linesPinned = !this._linesPinned;
  },
  
  /**
    When the displayProperities binding changes, update the view appropriately.

    @observes displayProperties
  
    @param force {boolean} If YES, force a redraw.
    
    @returns {Boolean} Returns NO if there is no guid of if the view is not visible.
  */
  displayPropertiesDidChange: function(force)
  {
    if(!this.get("isVisible")) return NO;
    
    var displayProperties = this.get('displayProperties');
    
    // Save display properties locally.
    var h = displayProperties.height-20;
    var w = displayProperties.width;
    var x = displayProperties.left;
    var y = displayProperties.top;
    var z = displayProperties.zoomValue;
    var pW = displayProperties.portalWidth;
    var pH = displayProperties.portalHeight;
    
    this._linesPinned = NO;
    
    // Set the style and frame of the view. This replaces set('frame', {...}) due to performance reasons.
    this.setStyle({height: (pH-20)+"px", width: pW+'px', left: '20px', top: '20px'});
    this._frame = {height: pH-20, width: pW, x: 20, y: 20};

    // Set the canvas dimensions.
    this.svgCanvas.setAttributeNS(null, 'height', pH);
    this.svgCanvas.setAttributeNS(null, 'width', pW);

    // Invert the display variables here to set the view box.
    // this.svgCanvas.setAttributeNS(null, 'viewBox', (pW+' '+pH+' '+Math.abs(x)+' '+Math.abs(y)));
    
    // Save the canvas height and width.
    this._canvasHeight = h;
    this._canvasWidth = w;

    // Force redraw when window is resized.
    var forceRedraw = (((this._h != h || this._w != w)) && this._z == z);
    // Save the properties as needed.
    this._h = h;
    this._w = w;
    this._x = x;
    this._y = y;
    this._z = z;
    this._pH = pH-20;
    this._pW = pW;
    
    this._zI = z/PERYEAR_DEFAULT_SCALE;



    // Hide meta data as the coordinates of things may have changed.
    this._hideMetaData();
    
    if(this.svgGroup)
      this.svgGroup.setAttributeNS(null, 'transform', 'scale('+this._zI+') translate('+ (this._x/this._zI) +',' + (this._y/this._zI)+')');
    // this.svgGroup.setAttributeNS(null, 'transform', 'scale('+this._zI+') translate('+ (this._x/this._zI) +',' + (this._y/this._zI)+')');

    // If there is a resize of the window, then you have to redraw to match the new view port.
    if(forceRedraw && typeof force != "boolean" && this._cachedContent)  
    {
      Papercube.canvasController.zoomOutFull();
      this._deepest = 1;
      this._foundGuid =  null;
      this._render();
    }
  }.observes('displayProperties'),
  
  /**
    Redraw based on 'content', 'isVisible', 'viewDirection', 'refThreshold', 'depth', 'citeThreshold', 'hideBogusYears' binding changes.

    @observes content
    @observes isVisible
    @observes viewDirection
    @observes refThreshold
    @observes citeThreshold
    @observes depth
    @observes hideBogusYears
  
    @returns {Boolean} Returns NO if there is no guid of if the view is not visible.
  */
  redrawParamsDidChange: function()
  {
    var content = this.get('content');
    // If there is no content or if you're not visible, bail.

    if(!this.get("isVisible") || !content) return NO;

    // Set the zoom values to the view defaults.
    Papercube.canvasController.set("zoomValueMax", 20);
    Papercube.canvasController.set("zoomStep", 1);

    // Set the view direction.
    this._displayRefs = (this.get("viewDirection") == "References");

    this.setClassName('citations', !this._displayRefs);
    this.setClassName('references', this._displayRefs);

    if(!this._cachedContent || this._cachedContent.get('guid') !== content.get('guid')) 
    {
      // Hide meta data view.
      this._hideMetaData();
      Papercube.canvasController.zoomOutFull();
      this._svgNodesCache = {};
      this._svgTextCache = {};
      this._svgYearTextCache = {};
      this._svgYearLinesCache = {};
      this._svgRels = {};
      this._clearSVG();
      Papercube.papersPerYearController.setDefaults();
    }
    this._deepest = 1;
    this._foundGuid =  null;
    this._cachedContent = content;

    var depth = this.get('depth');
    var citeThreshold = this.get('citeThreshold');
    var refThreshold = this.get('refThreshold');
    var hideBogusYears = this.get('hideBogusYears');

    // Grab the cite/ref threshold.
    if((this._cached_citeThreshold != citeThreshold ||  this._cached_citeThreshold != refThreshold || this._cached_hideBogusYears != hideBogusYears ||
      this._cached_depth != depth) && this.get('displayProperties').zoomValue != 1)
      {
        this._cached_citeThreshold = citeThreshold;
        this._cached_refThreshold = refThreshold;
        this._cached_depth = depth;
        this._cached_hideBogusYears = hideBogusYears;
        Papercube.canvasController.zoomOutFull();
        return;
      }

    this._cached_citeThreshold = citeThreshold;
    this._cached_refThreshold = refThreshold;
    this._cached_depth = depth;
    this._cached_hideBogusYears = hideBogusYears;

    this.displayPropertiesDidChange(YES);
    this._render();

  }.observes('content', 'isVisible', 'viewDirection', 'refThreshold', 'depth', 'citeThreshold', 'hideBogusYears'),

  /**
    Collect what needs to be rendered.
    
    Then render the view.

  */
  _render: function()
  {
    this._guidsNeeded = {};
    this._renderTree = {};
    this._papersPerYear = {};
    this._checkForData(this._cachedContent.get('guid'), 0);
    this._removeEdges();

    // Calculate the zoom value used.
    var zoomVal = PERYEAR_DEFAULT_SCALE/this._z;
    
    this.svgYearLines.setAttributeNS(null, 'stroke-width', this.yearLineWidth*zoomVal);
    
    // Set the temp arrays. Used later to discard unused nodes.
    var t_svgYearText = [];
    var t_svgYearLines = [];
    var t_svgNodes = [];
    var t_svgText = [];

    this._subjectArr = [];

    // Pull the current nodes from the cache.
    
//    var nodeXYRatio = this.nodeXYRatio;
    var nodeTextRatio = this.nodeTextRatio;

    if(this._deepest < this._cached_depth)
    {
      // Collect any guids that we need to retrieve from the server.
      var guids = [];
      for(var key in this._guidsNeeded)
      {
        if(guids.indexOf(key) == -1)
        {
          guids.push(key);
        }
      }

      if(guids.length > 0)
      {
        console.log("retrieving " +guids.length + " papers");
        Papercube.searchController.set('showRequestSpinner', YES);
        // Now retrieve the next level as needed..
        var callBack = function() { this.redrawParamsDidChange(); }.bind(this, this.get('content'));
        setTimeout(this._waitToCallServer.bind(this, guids, callBack), 500); 
        this._cachedContent.set((this._displayRefs ? "maxRefLevel" : "maxCiteLevel"), this._deepest);
      }
      else
      {
        Papercube.searchController.set('showRequestSpinner', NO);
      }
    }
    else
    {
      Papercube.searchController.set('showRequestSpinner', NO);
    }
    // else
    // {
      var years = [];

      var numYears = 0;
      var maxPapers = 0;
      var totalPapers = 0;
      for(var key in this._papersPerYear)
      {
        var papers = this._papersPerYear[key];
        papers.sort(function(a, b) 
        { 
          var aDate = a.get('year'); 
          var bDate = b.get('year');
          if(aDate == bDate) 
          {
            return a._attributes.title < b._attributes.title;        
          }
          if(aDate < bDate) return -1;
      
          return 1;
        });
        years.push(papers);
        totalPapers += papers.length;
        if(papers.length > maxPapers) maxPapers = papers.length;
      
        numYears++;
      }
      years.sort(function(a, b) 
      {
        if(!a[0] || !b[0]) return 1;
        var aDate = a[0].get('year'); 
        var bDate = b[0].get('year');
        if(aDate > bDate) return -1;
        return 1;
      });
      var displayRefs = this._displayRefs;


      this._shouldAnimate = (totalPapers < 40);
      this._shouldAnimateYears = (totalPapers < 100);

      var w = (this._w-120)*zoomVal;
      var h = this._h/(numYears+1)*zoomVal;
      // var r = w/(maxPapers*3);
      // var distX = w/maxPapers;
      var y = (displayRefs) ? h/2 : this._h*zoomVal-h/2;
      
      // var group = this._createSVGElement('g', {}, {});

      var guid = this._cachedContent._attributes.guid;
      var len = years.length;
      var year = this._cachedContent.get('year');

      // First, create the center node. it is special.
      // var ry = (h/4);
      // var rx = ry*nodeXYRatio;
      var r = (h/4);

      var x = (w/2)+70*zoomVal;
      // var params = {cx: x, cy: y, ry: ry, rx: rx, fanType: 'focused', guid: guid};
      var params = {cx: x, cy: y, r: r, fanType: 'focused', guid: guid};
      var tParams = {'font-size': (h/4)/nodeTextRatio, x: x, y: y, guid: guid};
      
      var textLeft = 30*PERYEAR_DEFAULT_SCALE;
      var textRight = (this._w-30)*PERYEAR_DEFAULT_SCALE;
      var lineWidth = this._w*PERYEAR_DEFAULT_SCALE;

      var font = 12*zoomVal;
      var lineParams = {x1: textLeft, y1: (y-h/2), x2: lineWidth, y2: (y-h/2)};
      var yearTextLParams = {x: textLeft, y: y, 'text-anchor': 'left', 'font-size': font};
      var yearTextRParams = {x: textRight, y: y, 'text-anchor': 'right', 'font-size': font};
      var title = this._cachedContent._attributes.title.substr(0, 80);

      if(!this._svgNodesCache[guid])
      {
        this._createNode(guid, params, tParams, title);
        this._createYearLine(guid, lineParams);
        this._createYearText(('L'+guid), yearTextLParams, (year+" - '"+ title+"'"));
        this._createYearText(('R'+guid), yearTextRParams, year);
      }
      else
      {
        this._handleLinesTransition(guid, lineParams, yearTextLParams, yearTextRParams);
        this._handleNodeTransition(guid, params, tParams);
      }
      
      t_svgYearText.push(('L'+guid));
      t_svgYearText.push(('R'+guid));
      t_svgYearLines.push(guid);
      t_svgNodes.push(guid);
      t_svgText.push(guid);
     
      y+= (displayRefs) ? h : -h;
      //console.log(len);
      var timesFive = 5*zoomVal;
      var timesFifteen = 15*zoomVal;
      for(var k=0; k<len; k++)
      {
        var papers = years[k];
        var paperLen = papers.length;
        var year = papers[0].get('year');

        var distX = w/(paperLen);
        // var ry = Math.min(h/4, distX/3);
        // var rx = ry*nodeXYRatio;
        var r = Math.min(h/4, distX/3);
        var fontSize = r/nodeTextRatio;
        // var fontSize = ry/nodeTextRatio;
        

        var x = 70*zoomVal+distX/2; //(w-(distX*paperLen))/2;
        // var calc1 = (y-h/2+ry+timesFive);
        // var calc2 = (h/2-ry-timesFive);
        var calc1 = (y-h/2); //+r+timesFive);
       // var calc2 = (h/2-r-timesFive);
        
        var lineParams = {x1: textLeft, y1: calc1, x2: lineWidth, y2: calc1};
        var yearTextLParams = {x: textLeft, y: calc1+timesFifteen, 'text-anchor': 'left', 'font-size': font};
        var yearTextRParams = {x: textRight, y: calc1+timesFifteen, 'text-anchor': 'right', 'font-size': font};

        var yearStr = year.toString();
        if(!this._svgYearLinesCache[yearStr])
        {
          //console.log('creating ' + year);
          this._createYearLine(yearStr, lineParams);
          this._createYearText(('L'+year), yearTextLParams, year);
          this._createYearText(('R'+year), yearTextRParams, year);
        }
        else
        {
         this._handleLinesTransition(yearStr, lineParams, yearTextLParams, yearTextRParams);
        }
        
        t_svgYearText.push(('L'+year));
        t_svgYearText.push(('R'+year));
        t_svgYearLines.push(yearStr);
  
        if(paperLen/300 < 1)
        {
          var locy = y; //calc1 + calc2*2;
          for(var i=0; i < paperLen; i++)
          { 
            var paper = papers[i];
            var lguid = paper._attributes.guid;
            if(lguid != guid)
            {
//              var month = paper.get('cachedMonth');
//              var locy = calc1 + calc2*((month/11))*2;

              var params = {cx: x, cy: locy, r: r, fanType: 'unfocused', guid: lguid};
              // var params = {cx: x, cy: locy, rx: rx, ry: ry, fanType: 'unfocused', guid: lguid};
              var tParams = {'font-size': fontSize, x: x, y: locy, guid: lguid};
              
              if(!this._svgNodesCache[lguid])
              {
                this._createNode(lguid, params, tParams, paper._attributes.title);
              }
              else
              {
                this._handleNodeTransition(lguid, params, tParams);
              }
              t_svgNodes.push(lguid);
              t_svgText.push(lguid);

              x+= distX;
            }
          }
        }
        else
        {
          var key = "ERR_"+year;
          var errParams = {x:(w/2)+70, y: y+5, fill: '#777', 'text-anchor': 'middle', 'font-size': 14};
          this._handleErrorText(key, errParams, svgText);
          t_svgText.push(key);
        }
        y+= (displayRefs) ? h : -h;
        
      }

      // Overload the NodeGraph animation controller and use it here.
      NodeGraph.addSubjects(this._subjectArr, this.svgCanvas, this._pH);

      // Clear elements as needed.
      this._clearSVGElms(this._svgNodesCache, t_svgNodes, this.svgNodes);
      this._clearSVGElms(this._svgTextCache, t_svgText, this.svgText);
      this._clearSVGElms(this._svgYearLinesCache, t_svgYearLines, this.svgYearLines);
      this._clearSVGElms(this._svgYearTextCache, t_svgYearText, this.svgYearText);

  },
  
  /**
    Call the server to retrieve papers after waiting for a while.
  
    @param guids {Array} The array of guids that need to be retrieved.
    @param callBack {Function} The callBack function is called when the request is successful.
  */
  _waitToCallServer: function(guids, callBack)
  {
    Papercube.adaptor.getPaperDetails(guids, callBack);
  },
  
  /**
    Create or update the error message when there are more than 300 papers in a year.
  
    @param key {string} The cache key.
    @param errParams {Object} Position parameters.
  */
  _handleErrorParams: function(key, errParams)
  {
    if(!this._svgTextCache[key])
    {
      this._svgTextCache[key] = {elm: this._createSVGElement('text', errParams, {}, TEXT)};     
      this._svgTextCache[key].elm.appendChild(document.createTextNode("{ There are more than 300 papers for this year! That's too many to display. }"));
    }
    else
    {
      var errElm = this._svgTextCache[key].elm;
      var oldParams = this._svgTextCache[key].params;
      
      var doAnim = NO;
      var anim = {};
      if(oldParams.x != errParams.x)
      {
        doAnim = YES;
        anim.x = {start: oldParams.x, end: errParams.x};
      }
      if(oldParams.y != errParams.y)
      {
        doAnim = YES;
        anim.y = {start: oldParams.y, end: errParams.y};
      }
      if(doAnim)
      {
        this._subjectArr.push({elm: svgText[key].elm, props: anim, duration: 250, isSVG: YES});
      }
    }    
  },

  /**
    Handle the node transition.
  
    @param guid {string} The cache key.
    @param params {Object} Node positioning parameters.
    @param tParams {Object} Text positioning parameters.
  */
  _handleNodeTransition: function(guid, params, tParams)
  {
    var nodeElm = this._svgNodesCache[guid].elm;
    var textElm = this._svgTextCache[guid].elm;
    var oldTextParams = this._svgTextCache[guid].params;
    var oldParams = this._svgNodesCache[guid].params;
    
    nodeElm.removeAttributeNS(null, 'fill-opacity');
    nodeElm.removeAttributeNS(null, 'fill');
    nodeElm.removeAttributeNS(null, 'stroke-width');
    nodeElm.removeAttributeNS(null, 'stroke');

    if(this._shouldAnimate)
    {

      var doAnim = NO;
      var anim = {};
      var tAnim = {};

      if(oldParams.cx != params.cx)
      {
        anim.cx = {start: oldParams.cx, end: params.cx};
        tAnim.x = {start: oldTextParams.x, end: tParams.x};
        doAnim = YES;
      }
      if(oldParams.cy != params.cy)
      {
        anim.cy = {start: oldParams.cy, end: params.cy};
        tAnim.y = {start: oldTextParams.y, end: tParams.y};
        doAnim = YES;
      }
      // if(oldParams.ry != params.ry)
      // {
      //   anim.ry = {start: oldParams.ry, end: params.ry};
      //   anim.rx = {start: oldParams.rx, end: params.rx};
      //   tAnim['font-size'] = {start: oldTextParams['font-size'], end: tParams['font-size']};
      //   doAnim = YES;
      // }
      if(oldParams.r != params.r)
      {
        anim.r = {start: oldParams.r, end: params.r};
        tAnim['font-size'] = {start: oldTextParams['font-size'], end: tParams['font-size']};
        doAnim = YES;
      }
      if(doAnim)
      {
      //  console.log("animateNODE");
        this._subjectArr.push({elm: nodeElm,props: anim, duration: 250, isSVG: YES});
        this._subjectArr.push({elm: textElm, props: tAnim, duration: 250, isSVG: YES});
      }
    }
    else
    {
      if(oldParams.cx != params.cx)
      {
        nodeElm.setAttributeNS(null, 'cx', Math.floor(params.cx));
        textElm.setAttributeNS(null, 'x', Math.floor(params.cx));
      }
      if(oldParams.cy != params.cy)
      {
        nodeElm.setAttributeNS(null, 'cy', Math.floor(params.cy));
        textElm.setAttributeNS(null, 'y', Math.floor(params.cy));
      }
      // if(oldParams.ry != params.ry)
      // {
      //   nodeElm.setAttributeNS(null, 'rx', Math.floor(params.rx));
      //   nodeElm.setAttributeNS(null, 'ry', Math.floor(params.ry));
      //   textElm.setAttributeNS(null, 'font-size', Math.floor(tParams['font-size']));
      // }
      if(oldParams.r != params.r)
      {
        nodeElm.setAttributeNS(null, 'r', Math.floor(params.r));
        textElm.setAttributeNS(null, 'font-size', Math.floor(tParams['font-size']));
      }
    }
    
    this._svgNodesCache[guid].params = params;
    this._svgTextCache[guid].params = tParams;
    
  },

  /**
    Handle the lines and year text transition.
  
    @param guid {string} The cache key.
    @param lineParams {Object} Line positioning parameters.
    @param yearTextLParams {Object} Left year text positioning parameters.
    @param yearTextRParams {Object} Right year text positioning parameters.
  */
  _handleLinesTransition: function(guid, lineParams, yearTextLParams, yearTextRParams)
  {
    var doLAnim = NO;
    var doRAnim = NO;
    var doYAnim = NO;
    var lYearTextAnim = {};
    var rYearTextAnim = {};
    var yearLineAnim = {};

    var lineElm = this._svgYearLinesCache[guid].elm;
    var oldLineParams = this._svgYearLinesCache[guid].params;

    var lYearTextElm = this._svgYearTextCache['L'+guid].elm;
    var oldLYearTextParams = this._svgYearTextCache['L'+guid].params;

    var rYearTextElm = this._svgYearTextCache['R'+guid].elm;
    var oldRYearTextParams = this._svgYearTextCache['R'+guid].params;

    if(this._shouldAnimateYears)
    {
      
      if(oldLineParams.x1 != lineParams.x1)
      {
        yearLineAnim.x1 = {start: oldLineParams.x1, end: lineParams.x1};
        doYAnim = YES;
      }
      if(oldLineParams.x2 != lineParams.x2)
      {
        yearLineAnim.x2 = {start: oldLineParams.x2, end: lineParams.x2};
        doYAnim = YES;
      }
      if(oldLineParams.y1 != lineParams.y1)
      {
        yearLineAnim.y1 = {start: oldLineParams.y1, end: lineParams.y1};
        doYAnim = YES;
      }
      if(oldLineParams.y2 != lineParams.y2)
      {
        yearLineAnim.y2 = {start: oldLineParams.y2, end: lineParams.y2};
        doYAnim = YES;
      }    
      if(oldLYearTextParams.x != yearTextLParams.x)
      {
        lYearTextAnim.x = {start: oldLYearTextParams.x, end: yearTextLParams.x};
        doLAnim = YES;
      }    
      if(oldLYearTextParams.y != yearTextLParams.y)
      {
        lYearTextAnim.y = {start: oldLYearTextParams.y, end: yearTextLParams.y};
        doLAnim = YES;
      }    
      if(oldRYearTextParams.x != yearTextRParams.x)
      {
        rYearTextAnim.x = {start: oldRYearTextParams.x, end: yearTextRParams.x};
        doRAnim = YES;
      }    
      if(oldRYearTextParams.y != yearTextRParams.y)
      {
        rYearTextAnim.y = {start: oldRYearTextParams.y, end: yearTextRParams.y};
        doRAnim = YES;
      } 
      if(doYAnim)
      {
        this._subjectArr.push({elm: lineElm, props: yearLineAnim, duration: 250, isSVG: YES});
      }   
      if(doLAnim)
      {
        this._subjectArr.push({elm: lYearTextElm, props: lYearTextAnim, duration: 250, isSVG: YES});
      }   
      if(doRAnim)
      {
        this._subjectArr.push({elm: rYearTextElm, props: rYearTextAnim, duration: 250, isSVG: YES});
      }   
    }
    else
    {
      if(oldLineParams.x1 != lineParams.x1)
      {
        lineElm.setAttributeNS(null, 'x1', Math.floor(lineParams.x1));
      }
      if(oldLineParams.x2 != lineParams.x2)
      {
        lineElm.setAttributeNS(null, 'x2', Math.floor(lineParams.x2));
      }
      if(oldLineParams.y1 != lineParams.y1)
      {
        lineElm.setAttributeNS(null, 'y1', Math.floor(lineParams.y1));
      }
      if(oldLineParams.y2 != lineParams.y2)
      {
        lineElm.setAttributeNS(null, 'y2', Math.floor(lineParams.y2));
      }    
      if(oldLYearTextParams.x != yearTextLParams.x)
      {
        lYearTextElm.setAttributeNS(null, 'x', Math.floor(yearTextLParams.x));
      }    
      if(oldLYearTextParams.y != yearTextLParams.y)
      {
        lYearTextElm.setAttributeNS(null, 'y', Math.floor(yearTextLParams.y));
      }    
      if(oldRYearTextParams.x != yearTextRParams.x)
      {
        rYearTextElm.setAttributeNS(null, 'x', Math.floor(yearTextRParams.x));
      }    
      if(oldRYearTextParams.y != yearTextRParams.y)
      {
        rYearTextElm.setAttributeNS(null, 'y', Math.floor(yearTextRParams.y));
      } 
      
    }
    this._svgYearLinesCache[guid].params = lineParams;
    this._svgYearTextCache['R'+guid].params = yearTextRParams;
    this._svgYearTextCache['L'+guid].params = yearTextLParams;
  },

  /**
    Create a new node element.
  
    @param guid {string} The cache key.
    @param params {Object} Node positioning parameters.
    @param tParams {Object} Text positioning parameters.
    @param title {string} The title string.
  */
  _createNode: function(guid, params, tParams, title)
  {
    this._svgNodesCache[guid] = {elm: this._createSVGElement('circle', params,{}, NODE), params: params};
    this._svgTextCache[guid] = {elm: this._createSVGElement('text', tParams, {}, TEXT), params: tParams};        
    this._svgTextCache[guid].elm.appendChild(document.createTextNode(title.substr(0,20)));
  },
  
  /**
    Create a new year line element.
  
    @param guid {string} The cache key.
    @param params {Object} Year line positioning parameters.
  */
  _createYearLine: function(guid, params)
  {
    this._svgYearLinesCache[guid] = {elm: this._createSVGElement('line',params,{}, YEARLINE), params: params};
  },
  
  /**
    Create a new year text element.
  
    @param guid {string} The cache key.
    @param params {Object} Year text positioning parameters.
  */
  _createYearText: function(guid, params, text)
  {
    this._svgYearTextCache[guid] = {elm: this._createSVGElement('text',params,{}, YEARTEXT), params: params};
    this._svgYearTextCache[guid].elm.appendChild(document.createTextNode(text));
  },
  
  /**
    Check what data needs to be retrieved.
  
  
    @param guid {string} The guid of the item.
    @param level {Integer} The current level.
  */
  _checkForData: function(guid, level)
  {
    // Get the paper.
    var paper = Papercube.Paper.find(guid);
    var rels = [];
    // If the paper exists, then get its references or citations.
    if(paper && this._renderTree[guid] != 1)
    {
      if(!this._renderTree[guid]) this._renderTree[guid] = 0;
      this._renderTree[guid]++;
      
      rels = (this._displayRefs) ? paper._attributes.references : paper._attributes.citations;
      var childCount = rels.length;
      var newRels = [];
      for(var i=0; i<childCount; i++)
      {
        var relGuid = rels[i];
        var child = Papercube.Paper.find(relGuid);
        if(child && (!this._cached_hideBogusYears || (this._cached_hideBogusYears && child._attributes.fixedyear==='1')))
        {
          if(this._cached_citeThreshold <= child.get('citeCount') && 
             this._cached_refThreshold <= child.get('refCount'))
          {
            newRels.push(relGuid);
          }
        }
        else if(!this._cached_hideBogusYears)
        {
            this._guidsNeeded[relGuid] = 1;
        }
      }
      
      var year = paper.get("year");
      if(this._cachedContent._attributes.guid != guid)
      {
        if(!this._papersPerYear[year]) // Will need to alter this at some point.
        {
          this._papersPerYear[year] = [];
        }
       this._papersPerYear[year].push(paper);
      }

      childCount = newRels.length;
      rels = newRels;

    }

    // Log the deepest level.
    if(this._deepest < level) this._deepest = level;

    var childCount = rels.length;
    var nextLvl = level+1;

    // If the paper has not been printed before and there is at least 0.1 pixels for each paper, draw it.
    if(this._renderTree[guid] == 1 && level < this._cached_depth)
    {
      for(var i=0; i<childCount; i++)
      {
        var rel = rels[i];
        this._checkForData(rel, nextLvl);   
      }
    }
  },
  
  /**
    Remove selected edges.
  
  */
  _removeEdges: function()
  {
    var svg = this.svgEdges;
		while (svg.firstChild) 
		{
		  svg.removeChild(svg.firstChild);
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
    var svg = this.svgYearLines;
		while (svg.firstChild) 
		{
		  svg.removeChild(svg.firstChild);
		}
    var svg = this.svgYearText;
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
      case YEARLINE:
        this.svgYearLines.appendChild(elm);
        break;
      case YEARTEXT:
        this.svgYearText.appendChild(elm);
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

     Set up the fan menu actions:

     focusedFan: {
       CiteSeer: citeseerFunc,
       Save: saveFunc,
       "Pin Lines": pinLinesFunc,
       "Zoom +": zoomInFunc,
       "Zoom -": zoomOutFunc
     }, 
     unfocusedFan: {
       CiteSeer: citeseerFunc,
       Save: saveFunc,
       "Pin Lines": pinLinesFunc,
       Refocus: refocusFunc,
       "Zoom +": zoomInFunc,
       "Zoom -": zoomOutFunc
     }     
  */
  init: function()
  {
    sc_super();

    // Set up svg canvas.
    this.svgCanvas = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    this.rootElement.appendChild(this.svgCanvas);
    
    this.svgGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.svgCanvas.appendChild(this.svgGroup);


    this.svgNodes = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.svgGroup.appendChild(this.svgNodes);
    
    this.svgText = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.svgGroup.appendChild(this.svgText);

    // Set up node default styling.
    this.svgText.setAttributeNS(null, 'fill', this.nodeTextColor);
    this.svgText.setAttributeNS(null, 'text-anchor', 'middle');
    this.svgText.setAttributeNS(null, 'style', "cursor: default");

    // Set up node default styling.
    this.svgNodes.setAttributeNS(null, 'fill', this.nodeColor);
    this.svgNodes.setAttributeNS(null, 'fill-opacity', this.nodeOpacity);
    
    this.svgYearText = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.svgGroup.appendChild(this.svgYearText);

    // Set up node default styling.
    this.svgYearText.setAttributeNS(null, 'fill', this.yearTextColor);

    this.svgYearLines = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.svgGroup.appendChild(this.svgYearLines);
    
    this.svgYearLines.setAttributeNS(null, 'stroke', this.yearLineColor);
    
    this.svgEdges = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.svgGroup.appendChild(this.svgEdges);


    var refocusFunc = function(evt)
    { 
      Papercube.viewController.setContentToViewFromGUID(this._mouseDownGUID, 'Paper', NO);
    }.bind(this); 

    var citeseerFunc = function(evt)
    { 
      window.open(Papercube.Paper.find(this._mouseDownGUID).get('url'));
    }.bind(this); 

    var saveFunc = function(evt)
    { 
      Papercube.viewController.saveObject(this._mouseDownGUID, 'Paper');
    }.bind(this); 

    var zoomOutFunc = function(evt)
    { 
      Papercube.canvasController.setZoomToPointerLocation(Event.pointerX(evt), Event.pointerY(evt), NO);
    }.bind(this); 
    var zoomInFunc = function(evt)
    { 
      Papercube.canvasController.setZoomToPointerLocation(Event.pointerX(evt), Event.pointerY(evt), YES);
    }.bind(this); 
    
    var pinLinesFunc = function(evt)
    { 
      this.pinLinesForPaper();
    }.bind(this); 

    Papercube.canvasController.registerFans('papersperyear',
    {
        focusedFan: {
          CiteSeer: citeseerFunc,
          Save: saveFunc,
          "Pin Lines": pinLinesFunc,
          "Zoom +": zoomInFunc,
          "Zoom -": zoomOutFunc
        }, 
        unfocusedFan: {
          CiteSeer: citeseerFunc,
          Save: saveFunc,
          "Pin Lines": pinLinesFunc,
          Refocus: refocusFunc,
          "Zoom +": zoomInFunc,
          "Zoom -": zoomOutFunc
        }     
    });

  }
}) ;
