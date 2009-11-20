// ==========================================================================
// Papercube.CircleViewHTML
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  This is CircleView, a view for navigating a paper's references.

  @extends SC.View
  @extends NodeGraph.DragPanMixin
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/

Papercube.CircleViewHTML = SC.View.extend(
/** @scope Papercube.CircleViewHTML.prototype */ NodeGraph.DragPanMixin, {
  
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
    @binding "Papercube.circleViewController.citeThreshold"
  */
  citeThresholdBinding: "Papercube.circleViewController.citeThreshold",
  
  /**
    Cite threshold cached value.
  
    @property {Integer}
    @default 1
  */
  _cached_citeThreshold: 1,

  /**
    Bind the ref threshold binding. Don't show papers with less refs. 
  
    @property {Integer}
    @binding "Papercube.circleViewController.refThreshold"
  */
  refThresholdBinding: "Papercube.circleViewController.refThreshold",

  /**
    Ref threshold cached value.
  
    @property {Integer}
    @default 1
  */
  _cached_refThreshold: 1,

  /**
    Display references or citations.

    @property {Boolean}
    @default YES
  */
  _displayRefs: YES,
  
  /**
    boolean that determines if the meta data box is showing or not.

    @property {Boolean}
    @default NO
  */
  _showingMetaData: NO,
  
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
    @default 0px
  */
  _h: 0,
  
  /**
    Cached width property from displayProperties.

    @property {Integer}
    @default 0px
  */
  _w: 0,
  
  /**
    Cached x-axis offset property from displayProperties.

    @property {Integer}
    @default 0px
  */
  _x: 0,

  /**
    Cached y-axis offset property from displayProperties.

    @property {Integer}
    @default 0px
  */
  _y: 0,

  /**
    Stored value of the number of first level references.

    @property {Integer}
    @default 0
  */
  _numberOfFirstRefs: 0,
  
  /**
    Stored value of the number of first level citations.

    @property {Integer}
    @default 0
  */
  _numberOfFirstCites: 0,
  
  /**
    Stored value of the number of first level circles to be displayed.

    @property {Integer}
    @default 0
  */
  _numberOfFirstCircles: 0,
  
  /**
    boolean specifying that the visualization is rotating left.

    @property {Boolean}
    @default NO
  */
  _rotatingLeft: NO, 

  /**
    boolean specifying that the visualization is rotating right.

    @property {Boolean}
    @default NO
  */
  _rotatingRight: NO,
  
  /**
    The local x-axis center of the view.

    @property {Integer}
    @default 0px
  */
  _xC: 0,
  
  /**
    The local y-axis center of the view.

    @property {Integer}
    @default 0px
  */
  _yC: 0,
  
  /**
    The angle of the detail paper. 

    @property {Integer}
    @default -25 degrees
  */
  _sAngle: -25,
  
  /**
    The rotation speed. 
    
    Default is 1x depending on the angle. It slows down when it is about to stop.
    
    @property {Integer}
    @default 1px
  */
  _rotationSpeed: 1,
  
  /**
    The number of degrees per frame.
    
    @property {Integer}
  */
  _tAIncr: null,

  /**
    boolean specifying if the view is animating. 
    
    @property {Boolean}
    @default NO
  */
  _isAnimating: NO,
  
  /**
    The guid of the detail paper.
    
    @property {String}
  */
  _detailGUID: null,
  
  /**
    Destination guid during rotation.
    
    @property {String}
  */
  _rotateToGUID: null,
  
  /**
    Departure guid during rotation.
    
    @property {String}
  */
  _rotateFromGUID: null,

  /**
    The minimum number of references in the visualization.
    
    @property {Integer}
    @default 0
  */
  _minRefs: 0,
  
  /**
    The minimum number of citations in the visualization.
  
    @property {Integer}
    @default 0
  */
  _minCites: 0,
  
  /**
    The maximum number of references in the visualization.
    
    @property {Integer}
    @default 0
  */
  _maxRefs: 0,
  
  /**
    The maximum number of citations in the visualization.
    
    @property {Integer}
    @default 0
  */
  _maxCites: 0,
  
  /**
    The guid of the last center paper, to avoid unnecessary loading of data.
    
    @property {String}
  */
  _lastContentGUID: null,
  
  /**
    The cached content object.
    
    @property {Paper}
  */
  _cachedContent: null,

  /**
    Is YES when you're animating to the middle.
    
    @property {Boolean}
    @default NO
  */
  _isAnimatingToMiddle: NO,

  /**
    Source circle diameter for animating a paper to the middle.
    
    @property {Integer}
    @default 0px
  */
  _animateSrcD: 0,

  /**
    Source x position for animating a paper to the middle.
    
    @property {Integer}
    @default 0px
  */
  _animateSrcX: 0,

  /**
    Source y position for animating a paper to the middle.
    
    @property {Integer}
    @default 0px
  */
  _animateSrcY: 0,

  /**
    Source circle diameter frame delta for animating a paper to the middle.
    
    @property {Integer}
    @default 0px
  */
  _animatePosDeltaD: 0,

  /**
    Source x position frame delta for animating a paper to the middle.
    
    @property {Integer}
    @default 0px
  */
  _animatePosDeltaX: 0,

  /**
    Source y position frame delta for animating a paper to the middle.
    
    @property {Integer}
    @default 0px
  */
  _animatePosDeltaY: 0,

  /**
    The element that is being animated to the the middle.
    
    @property {DOM Element}
  */
  _animateElm: null,

  /**
    The opacity of the rest of the visualization while animating a paper to the middle. 
    
    @property {Integer}
    @default 100
  */
  _animateOpacity: 100,

  /**
    2*PI saved so that we don't have to do it all over the place.
    
    @property {Integer}
  */
  _twoPI: Math.PI*2,
    
  /**
    The guid of the last clicked paper or author.
    
    @property {String}
  */
  _mouseDownGUID: null,
  
  /**
    The DOM element of the last clicked paper.
    
    @property {DOM Element}
  */
  _mouseDownCircle: null,
  
  /**
    The cache of guids.
    
    @property {Object}
  */
  _guidCache: {},
  
  /**
    The cache of HTML.
    
    @property {Object}
  */
  _htmlCache: {},
  
  /**
    Color cache for the top level lines.
    
    @property {Object}
  */
  _lineColorCache: {},

  /**
    The currently selected guid.
    
    @property {String}
  */
  _selection: null,
  
  /**
    Filtered reference relations.
    
    @property {Object}
  */
  _filteredRefs: {},

  /**
    Filtered citation relations.
    
    @property {Object}
  */
  _filteredCites: {},

  /**
    Cached stylesheet reference.
    
    @property {DOM Element}
  */
  _styleSheet: null,

  /** 
    Outlets for CircleView.
  
    [
      "canvas", 
      "divCanvas", 
      "fan", 
      "rotateLeftButton", 
      "rotateRightButton", 
      "metaDataView"
    ]
  */ 
  outlets: ["canvas", "divCanvas", "fan", "rotateLeftButton", "rotateRightButton", "metaDataView"],
  
  /**
    Canvas tag DOM element. Contains the lines. Bound to the '.canvas?' element.

    @outlet {DOM Element} '.canvas?'
  */
  canvas: ".canvas?",

  /**
    HTML canvas DOM element. Contains the text and circles. Bound to the '.div-canvas?' element.

    @outlet {DOM Element} '.div-canvas?'
  */
  divCanvas: ".div-canvas?",

  /**
    The DOM element that contains the meta data for an item. Bound to the '.meta-data?' element.

    @outlet {DOM Element} '.meta-data?'
  */
  metaDataView: ".meta-data?",

  /**
    "rotateLeftButton" for button to initiate rotation to the left.

    @outlet {SC.ButtonView} '.rotate-left?'
  */
  rotateLeftButton: SC.ButtonView.extend({

    /**
      Rotate to the left.
    */
    action: function()
    {
      this.owner._rotateFromGUID = this.owner._detailGUID;

      // Calc the rotation speed.
      this.owner._cRotationSpeed();
      this.owner.rotateLeft(NO);
    }
  }).outletFor('.rotate-left?'),

  /**
    "rotateRightButton" for button to initiate rotation to the left.

    @outlet {SC.ButtonView} '.rotate-right?'
  */
  rotateRightButton: SC.ButtonView.extend({
    
    /**
      Rotate to the right.
    */
    action: function()
    {
      this.owner._rotateFromGUID = this.owner._detailGUID;
      
      // Calc the rotation speed.
      this.owner._cRotationSpeed();
      this.owner.rotateRight(NO);
    }
  }).outletFor('.rotate-right?'),

  /**
    Determine the speed of the rotation depending on the distance from paper A to paper B if passed in.
    
    @param dist {Integer} If specified, it is the distance from A to B.
  */
  _cRotationSpeed: function(dist)
  {
    var rel = (this._displayRefs) ? this._numberOfFirstRefs : this._numberOfFirstCites;
    var a = 360/rel;
    if(dist)
      a = a*(dist/2);

    // Set the rotation parameters.
    this._stopRotation = NO;
    this._rotationSpeed = Math.max(2,Math.min(4,a/20));
  },

  /**
    Initiate an animation to the middle. Basically move from detail paper to main paper.
    
    @param guid {string} The guid of the paper to animate.

    @returns {Boolean} Returns NO if there is no element.
  */
  animateToMiddle: function(guid)
  {
    var elm = this._mouseDownCircle;
    if(!elm) return NO;

    // Get the x and y parameters.
    var x = parseInt(elm.style.left,0);
    var y = parseInt(elm.style.top,0);
    
    // Get the radius.
    var r = 0;
    this._animateElm = elm;
    if(Element.hasClassName(elm, 'small') || Element.hasClassName(elm, 's'))
    {
      r = this._smallCRadius;
    }
    else if(Element.hasClassName(elm, 'detail') || Element.hasClassName(elm, 'd'))
    {
      r = this._detailCRadius;
    }
    else if(Element.hasClassName(elm, 'medium') || Element.hasClassName(elm, 'm'))
    {
      r = this._mediumCRadius;
    }
    
    // Clear the lines.
    this._ctx.clearRect(0,0,this._canvasWidth, this._canvasHeight); // Second option, just clear it.
    
    // Set the source x, y, and diameter.
    this._animateSrcX = x;
    this._animateSrcY = y;
    this._animateSrcD = r*2;

    // Calculate the deltas.
    this._animatePosDeltaD = (this._largeCRadius*2-r*2)/30;
    var lx = (this._xC-this._largeCRadius);
    var ly = (this._yC-this._largeCRadius);
    this._animatePosDeltaX = (lx-x)/30;
    this._animatePosDeltaY = (ly-y)/30;
    
    // Reset the opacity. Will fade to 0.
    this._animateOpacity = 100;

    elm.innerHTML = '';

    // Start the animation.
    setTimeout(this.doAnimateToMiddle.bind(this,0),100);
  },
    
  /**
    Perform the animation from detail paper to main paper.
    
    @param frame {Integer} The current frame.
  */
  doAnimateToMiddle: function(frame)
  {
    // If you're at the last frame, then set the new content and start form a clean slate.
    if(frame == 31) 
    {
      this.divCanvas.innerHTML = '';
      var content = Papercube.Paper.find(this._selection);
      Papercube.viewController.setContentToView(content);
      this._isAnimatingToMiddle = NO;
      this._render();
      return;
    }
    
    
    // If there is opacity to subtract, subtract it.
    if(this._animateOpacity > 5)
    {
      this._animateOpacity -= 15;
    }

    // Set the opacity of all the circles.
    var opacity = parseFloat(this._animateOpacity/100, 0);
    for(var key in this._htmlCache)
    {
      if(key != this._mouseDownGUID)
      {
        this._htmlCache[key].style.opacity = opacity;
      }
    }
    this._animateElm.style.opacity = '1.0';
    
    
    // Change the circle that is being animated.
    this._animateSrcX += this._animatePosDeltaX;
    this._animateSrcY += this._animatePosDeltaY;
    this._animateSrcD += this._animatePosDeltaD;
    this._animateElm.style.left = this._animateSrcX + "px";
    this._animateElm.style.top = this._animateSrcY + "px";
    this._animateElm.style.width = this._animateSrcD + "px";
    this._animateElm.style.height = this._animateSrcD + "px";
    this._animateElm.style['-webkit-border-radius'] = (Math.floor(this._animateSrcD/2))+"px";
    this._animateElm.className = 'large sel';

    // One more frame.
    frame++;

    // Animate anothe frame in 15 milliseconds.
    setTimeout(this.doAnimateToMiddle.bind(this,frame), 15);
  },
  
  /** 
    There are various operations that happend on mouseDown. If it is a detail paper, 
    then animate it to the middle. If it is a first level reference, make it the detail paper. 
    If it is a second level reference, refocus to that immediately.
  
    @param {DOM Event} evt The mouseDown event.

    @returns {Boolean} Returns NO if the view is not visible.
  */
  mouseDown: function(evt)
  {
    if(!this.get('isVisible')) return NO;
    
    // If there is no guid, capture info for panning.
    var guid = evt.target.getAttribute('objguid');
    if(!guid)
    {
      return this.handleMouseDownDrag(evt);
    }

    
    // Get the guid.
    this._mouseDownGUID = guid;

    // Check for the type.
    var type = 'large';
    if(Element.hasClassName(evt.target, 'small') || Element.hasClassName(evt.target, 's'))
    {
      type = 'small';
    }
    else if(Element.hasClassName(evt.target, 'detail') || Element.hasClassName(evt.target, 'd') || (Element.hasClassName(evt.target, 'm') && (Element.hasClassName(evt.target.parentNode, 'detail') ||Element.hasClassName(evt.target.parentNode.parentNode, 'detail'))) )
    {
      type = 'detail';
    }
    else if(Element.hasClassName(evt.target, 'medium') || Element.hasClassName(evt.target, 'm') ||  (Element.hasClassName(evt.target, 'm') && Element.hasClassName(evt.target.parentNode, 'medium')) )
    {
      type = 'medium';
    }
    
    if(Element.hasClassName(evt.target, 'd') || Element.hasClassName(evt.target, 's') || Element.hasClassName(evt.target, 'm'))
    {
      if(Element.hasClassName(evt.target, 'title') || Element.hasClassName(evt.target, 'authors') || Element.hasClassName(evt.target, 'rels'))
      {
        this._mouseDownCircle = evt.target.parentNode.parentNode;
      }
      else
      {
        this._mouseDownCircle = evt.target.parentNode;
      }
    }
    else
    {
      this._mouseDownCircle = evt.target;
    }
    
    // Show the fan.
    Papercube.canvasController.showFan(Event.pointerX(evt), Event.pointerY(evt), 'circleview', (type+"Fan"));
    return YES;
  },


  /** 
    If the mouse is moved on top of the view, see if there is any meta data to show.
  
    @param {DOM Event} evt The mouseMoved event.

    @returns {Boolean} Returns NO if there is no guid of if the view is not visible.
  */
  mouseMoved: function(evt)
  {
    if(!this.get('isVisible')) return;
    
    // If there is no guid, don't do anything.
    var guid = evt.target.getAttribute('objguid');
    if(!guid) return NO;
    
    if(guid == this._selection) return;
    
    // Get rid of current selection.
    var cache = this._htmlCache[this._selection];
    if(cache)
    {
      var cacheLen = cache.length;
      for(var i=0; i<cacheLen; i++)
      {
        Element.removeClassName(cache[i], 'sel');
      }
    }

    // Add new selection.
    var cache = this._htmlCache[guid];
    if(cache)
    {
      var cacheLen = cache.length;
      for(var i=0; i<cacheLen; i++)
      {
        Element.addClassName(cache[i], 'sel');
      }
    }
    this._selection = guid;

    // Update the UI.
    this._render();
    
    // Show the meta data!
    this._showMetaData();
  },
  
  /**
    Hide meta data box.

  */
  _hideMetaData: function()
  {
    this._showingMetaData = NO;

    // Hide meta data view.
    this.metaDataView.removeClassName("show-meta-data");
  },
  
  /**
    Show meta data for paper!
  
    @returns {Boolean} Returns NO if there is no content.
  */
  _showMetaData: function()
  {
    
    this._showingMetaData = YES;

    // Get the paper content.
    var content = Papercube.Paper.find(this._selection);

    if(!content) return NO;

    // Set the title
    this.metaDataView.childNodes[0].innerHTML = content.get("title");

    // Set the authors
    var authors = content.get('authorNames');
    
    var authorstring = authors.join(', ');
    this.metaDataView.childNodes[1].innerHTML = authorstring;

    // Set the abstract
    this.metaDataView.childNodes[2].innerHTML = "<em>"+content.get("abstract").substring(0,200)+"</em>";

    // Set the date
    this.metaDataView.childNodes[3].innerHTML =  "<strong>Publication Date: </strong> " + content.get("year");

    this.metaDataView.childNodes[4].innerHTML = Papercube.pluralizeString(" reference", content.get('refCount'));
    this.metaDataView.childNodes[5].innerHTML = Papercube.pluralizeString(" citation", content.get('citeCount'));


    // Show the meta data view.
    this.metaDataView.addClassName("show-meta-data");
  },
  
  /**
    This is the rendering driver.
  
    
    @returns {Boolean} Returns NO if there the view is not visible.
  */
  _render: function()
  {
    if(!this.get('isVisible')) return NO;
    
    this._ctx.lineWidth = this._lineWidth;

    // Clear the rect. Mostly important when animating. Now drawing white with 95% opacity for some trails.  
    this._ctx.clearRect(0,0,this._canvasWidth, this._canvasHeight); // Second option, just clear it.

    // Render first and second level references.
    this._renderOneDepth();
    
    // Render the main paper.
    this._renderZeroDepth();
  },
  
  /**
    Pick a line color. This is a gradient.
  
  
    @param count {Integer} The relation count.
    @param isRef {boolean} True if it is a reference, NO if it is a citation.
    
    @returns {Integer} Returns the calculated hex color.
  */
  _lineColor: function(count, isRef)
  {
    var colorNumber = Math.min(255,parseInt(((count/(isRef ? this._maxRefs : this._maxCites))*180 +75), 0)).toString(16);
    return "#"+ ((colorNumber.length == 1) ? "0" : "") + colorNumber +"2d2d";
  },
  
  /**
    Generate a circle DIV element. 
  
  
    @param {DOM Element} childNode A child node to append to the circle. This is usually a text element.
    @param guid {string} The guid of the paper.
    @param cacheStr {string} The guid cache string.
    @param lineColor {string} The line color
    
    @returns {Array} {DOM Element} Returns the newly generated circle DIV element.
  */
  _genCircle: function(childNode, guid, cacheStr, lineColor)
  {
    var div = document.createElement('div');
    div.setAttribute('objGuid', guid);
    div.style.borderColor = lineColor;
    
    if(childNode)
    {
      div.appendChild(childNode);
    }
    this.divCanvas.appendChild(div);

    // Add to the cache.
    if(!this._guidCache[guid])
      this._guidCache[guid] = [];
    this._guidCache[guid].push(div);
    this._htmlCache[cacheStr] = div;

    return div;
  },
  
  /**
    Set the class name and style attributes for a circle DIV element. 
  
  
    @param x {Integer} x-position in pixels.
    @param y {Integer} y-position in pixels.
    @param r {Integer} radius in pixels.
    @param className {string} The class name for the div.
    @param lineWidth {Integer} The width of the border line.
    @param guid {string} The guid of the paper.
  */
  _setProperties: function(x,y,r,className, lineWidth, obj)
  {
    obj.className = className;
    obj.style.top = (y-r)+'px';
    obj.style.left = (x-r)+'px';
    obj.style.borderWidth = (lineWidth*this._z) + "px";
    obj.style.borderStyle= "solid";
  },
    
  /**
    Render the main paper.

    @returns {Boolean} Returns NO if there is no content.
  */
  _renderZeroDepth: function()
  {
    var content = this._cachedContent;
    if(!content) return NO;
    
    var guid =  content.get('guid');
    
    var cacheStr = guid+guid;
    
    // Generate the main circle.
    if(!this._htmlCache[cacheStr])
    {
      if(this._displayRefs)
      {
        var lineColor = this._lineColor(content.get("references").length, YES);
      }
      else
      {
        var lineColor = this._lineColor(content.get("citations").length, NO);
      }
      this._genCircle(this._createLargeText(content, 'large'), guid, cacheStr, lineColor);
    }
    this._setProperties(this._xC, this._yC, this._largeCRadius, ((this._selection == guid) ? 'large sel' : 'large'), 1,this._htmlCache[cacheStr]);
  },
  
  /**
    Filters based on the cite and ref threshold and then caches the values. Cache is invalidated when thresholds change.  

  
    @param content {Paper} The content object.
    @param forceCites {boolean} If YES, always return citations no matter of the value of the _displayRefs.

    @returns {Array} Returns an array containing relations for a given content object.
  */
  _filterByRels: function(content, forceCites)
  {
    if(!content) return [];
    
    var guid = content._attributes.guid;
    var filterRefs = (this._displayRefs && !forceCites);

    // If the thresholds are above 0, then calculate what relations to return.
    if(this._cached_citeThreshold > 0 || this._cached_refThreshold > 0)
    {

      // If there is a cache hit, return from cache.
      if(filterRefs && this._filteredRefs[guid])
      {
        return this._filteredRefs[guid];
      }
      else if(this._filteredCites[guid])
      {
        return this._filteredCites[guid];
      }
    
      // If not, filter to get the relations based on the thresholds.
      var rels = (filterRefs) ? content._attributes.references : content._attributes.citations; 
      var childCount = rels.length;
      var newRels = [];
      for(var i=0; i<childCount; i++)
      {
        var relGuid = rels[i];
        var child = Papercube.Paper.find(relGuid);
        if(child)
        {
          if(this._cached_citeThreshold <= child.get('citeCount') && 
             this._cached_refThreshold <= child.get('refCount'))
          {
            newRels.push(relGuid);
          }
        }
      }
      if(filterRefs)
      {
        this._filteredRefs[guid] = newRels;
      }
      else
      {
        this._filteredCites[guid] = newRels;
      }
      return newRels;
    }
    return (filterRefs) ? content._attributes.references : content._attributes.citations; 
  },
  
  /**
    Render the first and second level papers.
  
    @returns {Boolean} Returns NO if there is no content.
  */
  _renderOneDepth: function()
  {
    
    var content = this._cachedContent;
    if(!content) return NO;
    var guid= content._attributes.guid;
    var displayRefs = this._displayRefs;
    
    var rel = this._filterByRels(content);

    // Get the angle between references.
    var aIncr = (1/rel.length);
    this._tAIncr = aIncr;
    
    // Commonly used values.
    var mr35 = this._mR*3.5;
    
    // Get the angle...
    var tA = this._sAngle/360;

    // Draw references.
    var rLen = rel.length;
    for(var i=0; i<rLen; i++)
    {
      // Defaults.
      var isDetail = NO;
      var inDetailArea = NO;
      var lx = 0;
      var ly = 0;
      var rGuid = rel[i];
      var th = this._twoPI*tA;
      // Calculate the current angle.
      var a = parseInt((tA*360)%360);

      // Detail paper hot zone to hard stop.
      var drawCase = 0;
      if((a <= -24 && a >= -26) || 
             (a >= 334 && a <= 336) && (!this._rotateTo || (this._rotateTo && rGuid == this._rotateToGUID))) 
      {
        isDetail = YES;
        inDetailArea =YES;
        this._detailGUID = rGuid;
        drawCase = 1;
      }

      var className = (this._selection == rGuid) ?  'sel ' : '';
      
       // Detail paper hot zone to hard stop.
      if(drawCase == 1)
      {
        this._stopRotation = YES;
        className += 'detail';
        lx = this._xC + (mr35)*Math.cos(th);
        ly = this._yC + (mr35)*Math.sin(th);  
      }

      // Otherwise, you're in the normal case. No slow down or stop.
      else
      {
        className += 'medium';

        if(rLen <= 30)
        {
         var extra = 0;
        }
        else if(rLen > 30 &&rLen < 50)
        {
         var extra = (i%2 == 0) ? this._mR/4 : 0;
        }
        else if(rLen > 50 && rLen < 70)
        {
         var extra = (i%4 == 0) ? this._mR/2 : (i%4 == 1 || i%4 == 3) ?  this._mR/4  : 0;
        }
        else
        {
         var extra = (i%6 == 0) ? this._mR/3 : (i%6 == 1 || i%6 == 5) ? this._mR/6 : (i%6 == 2 || i%6 == 4) ? this._mR/9 : 0;
        }
        var offsetLen = this._mR+this._mR+extra;
        lx = this._xC + (offsetLen)*Math.cos(th);
        ly = this._yC + (offsetLen)*Math.sin(th);        
      }
      
      
      // Get the papers references OR citations.
      var relPaper = Papercube.Paper.find(rGuid);

      if(!relPaper)
      {
        var relPaperRefs = [];
        var relPaperCites = [];
      }
      else
      {
        var relPaperRefs = relPaper._attributes.references;
        var relPaperCites = relPaper._attributes.citations;
      }
    
      // Draw the line to the circle based on the number of citations.
      
      if(!this._lineColorCache[rGuid])
      {
        if(displayRefs)
        {
          this._lineColorCache[rGuid] = this._lineColor(relPaperCites.length, NO);
        }
        else
        {
          this._lineColorCache[rGuid] = this._lineColor(relPaperRefs.length, YES);
        }
      }
      this._ctx.strokeStyle = this._lineColorCache[rGuid];
      this._ctx.beginPath();
      this._ctx.moveTo(this._xC,this._yC);
      this._ctx.lineTo(lx,ly);
      this._ctx.stroke();
    
      var cacheStr = guid+rGuid;
      
      if(!this._htmlCache[cacheStr])
      {
        var lineWidth = 1;
        if(displayRefs)
        {
          // if(relPaperRefs.length > 10) lineWidth = 4;
          var lineColor = this._lineColor(relPaperRefs.length, YES);
        }
        else
        {
          // if(relPaperCites.length > 10) lineWidth = 4;
          var lineColor = this._lineColor(relPaperCites.length, NO);
        }

        this._genCircle(this._createLargeText(relPaper, ((isDetail) ? 'detail' : 'medium')), rGuid, cacheStr, lineColor);
      }
      this._setProperties(lx,ly, ((isDetail) ? this._detailCRadius : this._mediumCRadius), className, lineWidth, this._htmlCache[cacheStr]);
        
      
      var parentRad = (isDetail) ? this._detailCRadius : this._mediumCRadius;
      parentRad += (this._z*7);
      
      // Draw the second level references or cites if you are not animating.
      var rels = this._filterByRels(relPaper);
  
      if(rels && (rel.length < 20 || isDetail && !this._isAnimating)  && (!this._isAnimating || (rels.length < 20 && !isDetail && !this._isAnimating) || isDetail))
      {
        var rel_aIncr = (1/rels.length);
        var rel_tA = tA;
        var relsLength = rels.length;
      
        // Iterate through the references or citations for the first level paper and draw circles for the second level.
        for(var j=0; j<relsLength; j++)
        {      
          // If there are references or citations, then get the details.
          var theta = this._twoPI*rel_tA;
          var rel_lx = lx + parentRad*Math.cos(theta);
          var rel_ly = ly + parentRad*Math.sin(theta);  
          rel_tA += rel_aIncr;
          var rrGuid = rels[j];

          var cacheStr = rGuid+rrGuid;

          if(!this._htmlCache[cacheStr])
          {
            var lineWidth = 1;
            if(displayRefs)
            {
              // if(relPaperRefs.length > 10) lineWidth = 4;
              var lineColor = this._lineColor(relPaperRefs.length, YES);
            }
            else
            {
              // if(relPaperCites.length > 10) lineWidth = 4;
              var lineColor = this._lineColor(relPaperCites.length, NO);
            }
            this._genCircle(this._createSmallText(Papercube.Paper.find(rrGuid)), rrGuid, cacheStr, lineColor);
          }
          
          var className = (this._selection == rrGuid) ?  'small sel ' : 'small';
          this._setProperties(rel_lx,rel_ly,this._smallCRadius, className, lineWidth, this._htmlCache[cacheStr]);

        }
      }
      else
      {
        this._setPaperRefVisibilty(NO, rGuid);
      }
      
      // Increment the angle for the next one.
      tA += aIncr;
      
    }
  },
  
  /**
    Given a record, create the text DIV for a small circle.
    
    @param record {Paper} The content object.

    @returns {Boolean} Returns NO if there is no content.
  */
  _createSmallText: function(record)
  {
    if(!record) return;


    // Print the authors in the standard abbreviated form.
    var authors = record.get('authorNames');
    var string = '';
    var aLen = authors.length;
    for(var i=0; i<aLen;i++)
    {
      var authorArray = authors[i].split(' ');
      string += authorArray[authorArray.length-1].substr(0,1);
    }
    if(string.length > 2)
    {
      string = string.substr(0,2)+"+";
    }
    var div = document.createElement('div');
    div.setAttribute('objGuid', record._attributes.guid);
    div.className = 's';
    div.innerHTML = string;
    return div;
  },

  /**
    Given a record, create the text DIV for a large circle. Prints Title, authors, references, and citations.
    
    @param record {Paper} The content object.
    @param type {string} The type of circle. Can be 'large', 'detail', or 'medium'.

    @returns {Boolean} Returns NO if there is no content.
  */
  _createLargeText: function(record, type)
  {
    if(!record) return NO;
   
    var guid = record._attributes.guid; 
    
    var div = document.createElement('div');
    div.setAttribute('objGuid', guid);
    div.className = type.substr(0,1);
   
    var titleDiv = document.createElement('div');
    titleDiv.setAttribute('objGuid', guid);
    titleDiv.setAttribute('type', type);
    titleDiv.className = 'title ' + type.substr(0,1);
    titleDiv.innerHTML = record.get("title");

    var authorsDiv = document.createElement('div');
    authorsDiv.setAttribute('objGuid', guid);
    authorsDiv.className = 'authors ' + type.substr(0,1);
    
    var authors = record.get("authorNames");
    var aLen = authors.length;
    for(var i=0; i<aLen;i++)
    {
      authorsDiv.innerHTML +=authors[i]+'<br/>';
    }

    var relDiv = document.createElement('div');
    relDiv.setAttribute('objGuid', guid);
    relDiv.className = 'rels ' + type.substr(0,1);
    relDiv.innerHTML =record.get("formattedReferenceCount") + '<br/>'+ record.get("formattedCitationCount");
    
    div.appendChild(titleDiv);
    div.appendChild(authorsDiv);
    div.appendChild(relDiv);
    return div;
  },

  /**
    Given a guid, find the shortest path and rotate the circle to it in that direction.
  
    @param guid {string} The guid to rotate to.
  */
  rotateTo: function(guid)
  {
    this._setSecondLevelVisibility(NO);
    this._rotateTo = YES;
    this._isAnimating = YES;
    this._rotateToGUID = guid;
    var rel = this._filterByRels(this._cachedContent);
    var relLen = rel.length;
    var detailIdX = rel.indexOf(this._detailGUID);
    var guidIdX = rel.indexOf(guid); 
        
    // Pick the closest direction to rotate. You don't want to waste too much time.
    var left = NO;
    var right = NO;
    var dist = 0;
    if(guidIdX > detailIdX)
    {
    	if(guidIdX-detailIdX >= (relLen-guidIdX)+detailIdX)
    	{
    	  dist = (relLen-guidIdX)+detailIdX;
    		right = YES;
    	}
    	else
    	{
    	  dist = guidIdX-detailIdX;
    		left = YES;
    	}
    }
    else
    {
    	if(detailIdX-guidIdX >= (relLen-detailIdX)+guidIdX)
    	{
    	  dist =(relLen-detailIdX)+guidIdX;
    		left = YES;
    	}
    	else
    	{
    	  dist = detailIdX-guidIdX;
    		right = YES;
    	}
    }

    // Set the rotation speed.
    this._cRotationSpeed(dist);

    // Rotate!
    if(left)
    {
      this.rotateLeft(YES);
    }
    else
    {
      this.rotateRight(YES);
    }
  },
  
  /**
    Hide or show the second level circles.
  
    @param show {boolean} If YES, show circles, otherwise hide.

    @returns {Boolean} Returns NO if there is no content.
  */
  _setSecondLevelVisibility: function(show)
  {
    if(!this._cachedContent) return;
    var rel = this._filterByRels(this._cachedContent);
    var relLen = rel.length;
    for(var i=0; i<relLen; i++)
    {
      var paper = Papercube.Paper.find(rel[i]);
      if(paper)
      {
        var relGuid = rel[i];
        var rels = this._filterByRels(paper); //(this._displayRefs) ? paper._attributes.references : paper._attributes.citations;
        var relsLen = rels.length;
        for(var j=0; j<relsLen; j++)
        {
          var cacheStr = relGuid+rels[j];
          if(this._htmlCache[cacheStr])
          {
            this._htmlCache[cacheStr].style.display = (show) ? '' : 'none';
          }
        }
      }
    }
  },

  /**
    Given a paper guid, show or hide it.
  
    @param show {boolean} If YES, show circle, otherwise hide.
    @param guid {string} The guid of the paper.

    @returns {Boolean} Returns NO if there is no content.
  */
  _setPaperRefVisibilty: function(show, guid)
  {
    var paper = Papercube.Paper.find(guid);
    if(!paper) return;
    var rel = this._filterByRels(paper); //(this._displayRefs) ? paper._attributes.references : paper._attributes.citations;
    var relLen = rel.length;
    for(var i=0; i<relLen; i++)
    {
      var cacheStr = guid+rel[i];
      if(this._htmlCache[cacheStr])
      {
        this._htmlCache[cacheStr].style.display = (show) ? '' : 'none';
      }
    }
  },
  
  /**
    Rotate to the left. If the hasGUID property is YES, rotate to a destination guid. Otherwise, rotate to the next one.
    
    @param hasGUID {boolean} If YES, that means that there is a guid to rotate to.
  */
  rotateLeft: function(hasGUID)
  {
    if(!this._stopRotation)
    {
      if(!hasGUID)
      {
        var rel =this._filterByRels(this._cachedContent); //(this._displayRefs) ? this._cachedContent._attributes.references : this._cachedContent._attributes.citations;
        var idx = rel.indexOf(this._detailGUID);
        var guid = '';
        if(idx == rel.length-1)
        {
          guid = rel[0];
        }
        else
        {
          guid = rel[idx+1];
        }
        
        this.rotateTo(guid);
      }
      else
      {
        if(this._rotatingRight)
        {
         this.stopRotation(); 
        }
        this._rotatingLeft = YES;
        this._isAnimating = YES;
        this._sAngle-=this._rotationSpeed;
        this._sAngle=this._sAngle%360;
        this._render();
        this._rotationTimeout = setTimeout(this.rotateLeft.bind(this, YES), 30);
      }
    }
    else
    {
      this.stopRotation();
      this._stopRotation = NO;
      this._rotateTo = NO;
      this._isAnimating = NO;
    }
  },

  /**
    Rotate to the right. If the hasGUID property is YES, rotate to a destination guid. Otherwise, rotate to the next one.
    
    @param hasGUID {boolean} If YES, that means that there is a guid to rotate to.
  */
  rotateRight: function(hasGUID)
  {
    if(!this._stopRotation)
    {
      if(!hasGUID)
      {
        var rel = this._filterByRels(this._cachedContent);
        var idx = rel.indexOf(this._detailGUID);
        var guid = '';
        if(idx == 0)
        {
          guid = rel[rel.length-1];
        }
        else
        {
          guid = rel[idx-1];
        }
        this.rotateTo(guid);
      }
      else
      {
        if(this._rotatingLeft)
        {
         this.stopRotation(); 
        }
        this._rotatingRight = YES;
        this._isAnimating = YES;

        this._sAngle+=(this._slowRotation == YES) ? this._slowRotationSpeed : this._rotationSpeed;
        this._sAngle=this._sAngle%360;
        this._render();
        this._rotationTimeout = setTimeout(this.rotateRight.bind(this, YES), 30);
      }
    }
    else
    {
      this.stopRotation();
      this._stopRotation = NO;
      this._rotateTo = NO;
      this._isAnimating = NO;
    }
  },
  
  /**
    Stop the rotation. Then, if desired, render the view.
    
    @param doNotRender {boolean} If YES, do not re-render the visualization.
  */
  stopRotation: function(doNotRender)
  {
    this._setSecondLevelVisibility(YES);
    this._rotatingLeft = NO;
    this._rotatingRight = NO;
    this._isAnimating = NO;
    clearTimeout(this._rotationTimeout);
    if(!doNotRender) this._render();
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

    // Save display properties locally.
    var h = this.displayProperties.height;
    var w = this.displayProperties.width;
    var x = this.displayProperties.left;
    var y = this.displayProperties.top;
    var z = this.displayProperties.zoomValue;
    
    var bail = NO;
    if(h == this._h && w == this._w && this._z == z)
    {
      if((x != this._x || y != this._y))
      {
        bail = YES;
      }
    }
    
    if(force) bail = NO;
    
    this._h = h;
    this._w = w;
    this._x = x;
    this._y = y;
    this._z = z;

    // Set the style and frame of the view. This replaces set('frame', {...}) due to performance reasons.
    this.setStyle({height: h+"px", width: w+'px', left: x+'px', top: y+'px'});
    this._frame = {height: h, width: w, x: x, y: y};
    
    // Set the canvas dimensions.
    this.canvas.style.left = x+'px';
    this.canvas.style.top = y+'px';
    this.divCanvas.style.left = x+'px';
    this.divCanvas.style.top = y+'px';    

    // Save the properties as needed.
    //this.resizeWithOldParentSize();

    // Stop any rotation.
    this.stopRotation(YES);

    if(bail) return;
    
    // console.log(this._z +" and " + z);
    this.divCanvas.style.height = h+'px';
    this.divCanvas.style.width = w+'px';
    this.canvas.height = h;
    this.canvas.width = w;
    this._canvasHeight = h;
    this._canvasWidth = w;
    this._lineColorCache = {};

    var styleSheet = this._styleSheet;

    // Set the default angle back.
    this._sAngle = -25;

    // Calculate defaults for the positioning of the circle.
    this._xC = (this._canvasWidth/2)-(this._canvasWidth/8);
    this._yC = (this._canvasHeight/2);//*this._z;
    this._mR = Math.min((this._canvasWidth/9)/*this._z*/, (this._canvasHeight/6));
    
    
    this._largeCRadius = this._mR*1.2;
    this._detailCRadius = this._mR*1.1;
    this._mediumCRadius = this._mR/(2+.08*this._numberOfFirstCircles);
    this._smallCRadius = this._mR/(8+.12*this._numberOfFirstCircles);
    this._lineWidth = 3*this._z;


    if(!SC.isChrome && SC.isSafari())
    {
      // Set shadow.
      var shadow1 = (2*this._z);
      var shadow2 = (2*this._z);  
      var shadowStr = shadow1+'px '+shadow1+'px '+shadow2+'px #222';
      // this._styleSheet.cssRules[0].style['-webkit-box-shadow'] = shadowStr;
      styleSheet.cssRules[1].style['-webkit-box-shadow'] = shadowStr;
      styleSheet.cssRules[2].style['-webkit-box-shadow'] = shadowStr;
      styleSheet.cssRules[3].style['-webkit-box-shadow'] = shadowStr;
    }

    // Calculate the diameter.
    var smallDiameter = (this._smallCRadius*2)+"px";
    var mediumDiameter = (this._mediumCRadius*2)+"px";
    var largeDiameter = (this._largeCRadius*2)+"px";
    var detailDiameter = (this._detailCRadius*2)+"px";

    // For the large circles.
    var fontSize = (10*this._z)+"px";

    styleSheet.cssRules[10].style.fontSize = fontSize;
    styleSheet.cssRules[10].style.lineHeight = fontSize;

    // Set diameters and border radius.
    styleSheet.cssRules[0].style.width = smallDiameter;
    styleSheet.cssRules[0].style.height = smallDiameter;
    styleSheet.cssRules[0].style['-webkit-border-radius'] = (this._smallCRadius)+"px";
    
    styleSheet.cssRules[1].style.width = mediumDiameter;
    styleSheet.cssRules[1].style.height = mediumDiameter;
    styleSheet.cssRules[1].style['-webkit-border-radius'] = (this._mediumCRadius)+"px";
    
    styleSheet.cssRules[2].style.width = largeDiameter;
    styleSheet.cssRules[2].style.height = largeDiameter;
    styleSheet.cssRules[2].style['-webkit-border-radius'] = (this._largeCRadius)+"px";
    
    styleSheet.cssRules[3].style.width = detailDiameter;
    styleSheet.cssRules[3].style.height = detailDiameter;
    styleSheet.cssRules[3].style['-webkit-border-radius'] =(this._detailCRadius)+"px";
    

    var fontSize = this._smallCRadius-(4*this._z)+"px";

    // Set font size for the smaller circles.
    styleSheet.cssRules[4].style.fontSize = fontSize;
    styleSheet.cssRules[4].style.lineHeight = fontSize;

    // Set small circle offset.
    styleSheet.cssRules[5].style.marginTop = (this._smallCRadius/2)+(2*this._z)+"px";

    // Set medium margins for title.
    styleSheet.cssRules[6].style.marginTop = (this._mediumCRadius-15*this._z)+"px";
    styleSheet.cssRules[6].style.marginLeft = (5*this._z)+"px";
    styleSheet.cssRules[6].style.marginRight = (5*this._z)+"px";

    // Set margin for all rels.
    styleSheet.cssRules[7].style.marginTop = (10*this._z)+"px";

    // Set large margins for title.
    styleSheet.cssRules[8].style.marginTop = (this._detailCRadius*.7)+"px";
    styleSheet.cssRules[8].style.marginLeft = (5*this._z)+"px";
    styleSheet.cssRules[8].style.marginRight = (5*this._z)+"px";

    // Set large margins for authors.
    styleSheet.cssRules[9].style.marginTop = (20*this._z)+"px";
    styleSheet.cssRules[9].style.marginLeft = (5*this._z)+"px";
    styleSheet.cssRules[9].style.marginRight = (5*this._z)+"px";
    styleSheet.cssRules[9].style.fontSize = fontSize;

    // Position the buttons.
    var dYC = this._yC + (this._mR*3)*Math.sin(this._twoPI*(-25/360));  
    this.rotateLeftButton.setStyle({left:(this._xC+this._mR*4.5) +"px", top: (dYC-20-this._mR)+"px"});
    this.rotateRightButton.setStyle({left:(this._xC+this._mR*4.5) +"px", top: (dYC-20+this._mR/2)+"px"});
    
    // Render if you're not animating.
    if(!this._isAnimatingToMiddle)
    {
      this._render();
    }
    
  }.observes('displayProperties'),
  
  /**
    Redraw based on 'content', 'isVisible', 'viewDirection', 'refThreshold', 'citeThreshold' binding changes.

    @observes content
    @observes isVisible
    @observes viewDirection
    @observes refThreshold
    @observes citeThreshold
  
    @returns {Boolean} Returns NO if there is no guid of if the view is not visible.
  */
  redrawParamsDidChange: function()
  {
    var content = this.get('content');

    // If there is no content or if you're not visible, bail.
    if(!this.get("isVisible") || !content) return NO;
   
    // Set the view direction.
    var displayRefChange = (this._displayRefs != (this.get("viewDirection") == "References"));
    this._displayRefs = (this.get("viewDirection") == "References");

    // Grab the cite/ref threshold.
    var citeThreshold = this.get('citeThreshold');
    var refThreshold = this.get('refThreshold');

    if(this._cached_citeThreshold != citeThreshold || this._cached_refThreshold != refThreshold || displayRefChange)
    {
      this._filteredRefs = {};
      this._filteredCites = {};
      this._selection = [];
    }

    this._cached_citeThreshold = citeThreshold;
    this._cached_refThreshold = refThreshold;

    Papercube.canvasController.set("zoomValueMax", 2);
    Papercube.canvasController.set("zoomStep", .5);
   
    
    // Hide meta data view.
    this._hideMetaData();
    
    this.divCanvas.innerHTML = '';
    this._guidCache = {};
    this._htmlCache = {};
    
    
    // Retrieve papers if needed.
    var rel = this._filterByRels(content);
    
    if((this._displayRefs && content.get("maxRefLevel") < 2) || (!this._displayRefs && content.get("maxCiteLevel") < 2))
    {
      Papercube.searchController.set('showRequestSpinner', YES);
      this._retrieveRecords(content, rel);
    }
    else
    {
      Papercube.searchController.set('showRequestSpinner', NO);
    }
     
    this._minRefs = 0;
    this._minCites = 0;
    this._maxRefs = 0;
    this._maxCites = 0;
    this._lastContentGUID = content.get('guid');    

    
    var len = rel.length;
    for(var i=0; i<len; i++)
    {
      var c = Papercube.Paper.find(rel[i]);
      if(c)
      {
        var refs = this._filterByRels(c).length;
        var cites = this._filterByRels(c, YES).length;
        if(refs < this._minRefs) this._minRefs = refs;
        if(refs > this._maxRefs) this._maxRefs = refs;
        if(cites < this._minCites) this._minCites = cites;
        if(cites > this._maxCites) this._maxCites = cites;
      }
    }
    
    // Save the number of references.
    this._numberOfFirstRefs = this._filterByRels(content).length; 
    this._numberOfFirstCites = this._filterByRels(content, YES).length; 
    
    this._numberOfFirstCircles = (this._displayRefs) ? this._numberOfFirstRefs : this._numberOfFirstCites;

    // Show the left of right button if there are references.
    if((this._displayRefs && this._numberOfFirstRefs > 0) || (!this._displayRefs && this._numberOfFirstCites > 0))
    {
      this.rotateLeftButton.set("isVisible", YES);
      this.rotateRightButton.set("isVisible", YES);
    }
    if(!this._cachedContent || this._cachedContent.get('guid') != content.get('guid'))
    {
      Papercube.circleViewController.setDefaults();
      this._cachedContent = content;
    }

    // Stop any rotation.
    this.stopRotation(YES);
    
    // Set the default angle back.
    this._sAngle = -25;
    
    this.displayPropertiesDidChange(YES);

  }.observes('content', 'isVisible', 'viewDirection', 'refThreshold', 'citeThreshold'),
   
  /**
    When a level is retrieved from the server, redraw the view.
        
    @returns {Boolean} Returns NO if there is no content.
  */
  retrieveLevelDone: function()
  {
    var content = this.get('content');
    if(!content) return NO;
    var level =  content.get((this._displayRefs ? "maxRefLevel" : "maxCiteLevel"));
    content.set((this._displayRefs ? "maxRefLevel" : "maxCiteLevel"), level++);
    this.redrawParamsDidChange();
    Papercube.searchController.set('showRequestSpinner', NO);
  },
  
  /**
    Retrieve the records for the view. Only load what is needed. 
    
    @private 
    
    @param content {Paper} The content object.
    @param rel {Array} Array of relation guids.
  */
  _retrieveRecords: function(content, rel)
  {
    var firstLvl = Papercube.viewController.collectNeededPaperGUIDs(rel, []);
    var callBack = function() { this.retrieveLevelDone(); }.bind(this);

    // If there are guids that need to be retrieved, retrieve them now.
    if(firstLvl.guids.length > 0)
    {
      // Call the server if needed.
      Papercube.adaptor.getPaperDetails(firstLvl.guids, callBack);
    }

    // Otherwise iterate through the references that exist can get those papers.
    else
    {
      var papers = firstLvl.papers;
      var guids = [];

      // Go through all papers and retrieve them.
      for(var i=0; i<papers.length; i++)
      {
        var secondLvl = Papercube.viewController.collectNeededPaperGUIDs((this._displayRefs) ? papers[i].get('references') : papers[i].get('citations'), guids);
        guids = secondLvl.guids;
      }  

      // If there are guids that need to be retrieved, retrieve them now.
      if(guids.length > 0)
      {
        // Call the server if needed.
        Papercube.adaptor.getPaperDetails(guids, callBack);
      }
    }
  },
   
  /**
    Initalization function.
    
    Set up the canvas and rotation buttons.
    
    Set up the fan menu actions:
      
    smallFan: {
      CiteSeer: citeseerFunc,
      Save: saveFunc,
      Refocus: refocusFunc,
      "Zoom +": zoomInFunc,
      "Zoom -": zoomOutFunc
    }, 
    mediumFan: {
      CiteSeer: citeseerFunc,
      Save: saveFunc,
      Refocus: refocusFunc,
      Detail: detailFunc,
      "Zoom +": zoomInFunc,
      "Zoom -": zoomOutFunc
    },
    largeFan: {
      CiteSeer: citeseerFunc,
      Save: saveFunc,
      "Zoom +": zoomInFunc,
      "Zoom -": zoomOutFunc
    },
    detailFan: {
      CiteSeer: citeseerFunc,
      Save: saveFunc,
      Refocus: refocusDetailFunc,
      "Zoom +": zoomInFunc,
      "Zoom -": zoomOutFunc
    }

  */
  init: function()
  {
    arguments.callee.base.apply(this,arguments);

    // Get the default canvas context.
    this._ctx = this.canvas.getContext('2d');
    
    // Hide the rotation buttons until they are needed.
    this.rotateLeftButton.set("isVisible", NO);
    this.rotateRightButton.set("isVisible", NO);
    
    var refocusDetailFunc = function(evt)
    { 
      this.animateToMiddle(this._mouseDownGUID);
    }.bind(this); 

    var refocusFunc = function(evt)
    { 
      this.animateToMiddle(this._mouseDownGUID);
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

    var detailFunc = function(evt)
    { 
      this._rotateFromGUID = this._detailGUID;
      this.rotateTo(this._mouseDownGUID);
    }.bind(this); 

    Papercube.canvasController.registerFans('circleview',
    {
        smallFan: {
          CiteSeer: citeseerFunc,
          Save: saveFunc,
          Refocus: refocusFunc,
          "Zoom +": zoomInFunc,
          "Zoom -": zoomOutFunc
        }, 
        mediumFan: {
          CiteSeer: citeseerFunc,
          Save: saveFunc,
          Refocus: refocusFunc,
          Detail: detailFunc,
          "Zoom +": zoomInFunc,
          "Zoom -": zoomOutFunc
        },
        largeFan: {
          CiteSeer: citeseerFunc,
          Save: saveFunc,
          "Zoom +": zoomInFunc,
          "Zoom -": zoomOutFunc
        },
        detailFan: {
          CiteSeer: citeseerFunc,
          Save: saveFunc,
          Refocus: refocusDetailFunc,
          "Zoom +": zoomInFunc,
          "Zoom -": zoomOutFunc
        }     
    });
    
    // make a new stylesheet
    var ns = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(ns);

    // Safari does not see the new stylesheet unless you append something.
    // However!  IE will blow chunks, so ... filter it thusly:
    if (!window.createPopup) {
       ns.appendChild(document.createTextNode(''));
    }
    var s = this._styleSheet = document.styleSheets[document.styleSheets.length - 1];

    var rules = {
      ".circle_view_tab .small":"{position: absolute;background-color: #eee;-moz-border-radius: 100px;overflow: hidden;}",
      ".circle_view_tab .medium":"{position: absolute;background-color: lightgray;-moz-border-radius: 10000px;overflow: hidden;}",
      ".circle_view_tab .large":"{position: absolute;background-color: lightblue;-moz-border-radius: 10000px;overflow: hidden;}",
      ".circle_view_tab .detail":"{position: absolute;background-color: lightgray;-moz-border-radius: 10000px;overflow: hidden;}",
      ".circle_view_tab .div-canvas div":"{text-align: center;cursor: default;}",
      ".circle_view_tab .small div ":"{}",
      ".circle_view_tab .medium div.title ":"{}",
      ".circle_view_tab div.rels ":"{}",
      ".circle_view_tab .large div.title, .circle_view_tab .detail div.title ":"{}",
      ".circle_view_tab .large div.authors, .circle_view_tab .detail div.authors ":"{}",
      ".circle_view_tab .div-canvas .large  div, .circle_view_tab .div-canvas .detail div ":"{}"
    };
    
    // loop through and insert
    for (selector in rules) {
       if (s.insertRule) {
          // it's an IE browser
          try { 
             s.insertRule(selector + rules[selector], s.cssRules.length); 
          } catch(e) {}
       } else {
          // it's a W3C browser
          try { 
             s.addRule(selector, rules[selector]); 
          } catch(e) {}
       }               
    }
  }
});
