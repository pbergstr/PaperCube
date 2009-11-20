// ==========================================================================
// NodeGraph.NodeGraphDelegate
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class NodeGraph.animator

  This is the NodeGraph delegate controller. Extend this to customize
  functionality for your NodeGraph. 
  
  @extends SC.Object
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
  @static
*/

NodeGraph.NodeGraphDelegate = SC.Object.extend(
/** @scope NodeGraph.NodeGraphDelegate */ {

  /**
    Called by the NodeGraph instance when a mouseDown is triggered.
    
    @param {DOM Event} evt The mouseDown event.
    @param {NodeGraph.NodeGraphView} The NodeGraph view.
    @param guid {String} The guid of the node.
  */
  nodeGraphDidMouseDown: function(evt, view, guid) {
    // Add customized code here.
  },

  /**
    Allow for additional customized setup of the NodeGraph view.
    
    @param {NodeGraph.NodeGraphView} nodeGraph The NodeGraph instance.
  */
  finishInitForGraph: function(nodeGraph) {
    // Add customized code here.
  },
  
  /**
    This left pixel offset for the view.

    @property {Integer}
    @default 0
  */
  leftOffset: 0,
  
  /**
    This top pixel offset for the view.

    @property {Integer}
    @default 0
  */
  topOffset: 0,

  /**
    This bottom pixel offset for the view.

    @property {Integer}
    @default 0
  */
  bottomOffset: 0,

  /**
    This right pixel offset for the view.

    @property {Integer}
    @default 0
  */
  rightOffset: 0,

  /**
    This is the default zoom value, 1 means that it is 1x zoom

    @property {Integer}
    @default 1
  */
  zoomValue: 1,

  /**
    This is the zoom step value of the slider.

    @property {Integer}
    @default 1
  */
  zoomStep: 1,

  /** 
    Min zoom value.

    @property {Integer}
    @default 1
  */
  zoomValueMin: 1,

  /**
    Max zoom value.

    @property {Integer}
    @default 30
  */
  zoomValueMax: 30,

  /**
    boolean signifying that one is zoomed in. 

    @property {Boolean}
    @default NO
  */
  isZooming: NO,

  /**
    Canvas dimension height, the canvas is the underlying view.

    @property {Integer}
    @default 0px
  */
  canvasHeight: 0,

  /**
    Canvas dimension width, the canvas is the underlying view.

    @property {Integer}
    @default 0px
  */
  canvasWidth: 0,

  /**
    Canvas dimension top, the canvas is the underlying view.

    @property {Integer}
    @default 0px
  */
  canvasTop: 0,

  /**
    Canvas dimension left, the canvas is the underlying view.

    @property {Integer}
    @default 0px
  */
  canvasLeft: 0,

  /**
    Portal dimension height, the portal is the "mask" of the canvas. 

    @property {Integer}
    @default 0px
  */
  portalHeight: 0,

  /**
    Portal dimension width, the portal is the "mask" of the canvas. 

    @property {Integer}
    @default 0px
  */
  portalWidth: 0,

  /**
    x-axis offet percentage, this is used to position the canvas inside the portal.

    @property {Integer}
    @default 0.5
  */
  percentageX: 0.5,

  /**
    y-axis offet percentage, this is used to position the canvas inside the portal.

    @property {Integer}
    @default 0.5
  */
  percentageY: 0.5,

  /**
    Properties that are bound to the views.

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
    height: 0,
    width: 0,
    left: 0,
    top: 0,
    zoomValue: 0,
    portalWidth: 0,
    portalHeight: 0
  },

  /**
    The scroll zoom cool off. Record scroll time to compare
    with the _scrollCoolDownAmount.

    @property {Integer}
  */
  _scrollCoolDown: 0,

  /**
    The amount to wait between scroll zoom events. 

    @property {Integer}
    @default 200 milliseconds
  */
  _scrollCoolDownAmount: 200,

  /**
    Zoom out to the min value.
  */
  zoomOutFull: function()
  {
    this.set("zoomValue", this.get('zoomValueMin'));
  },

  /** 
    Zoom out towards the min value.
  */
  zoomOut: function()
  {
    this.set('zoomValue', Math.max(this.get('zoomValueMin'), (this.get('zoomValue')-this.get('zoomStep'))));
  },

  /** 
    Zoom in towards the max value.
  */
  zoomIn: function()
  {
    this.set('zoomValue', Math.min(this.get('zoomValueMax'), (this.get('zoomValue')+this.get('zoomStep'))));
  },

  /** 
    When scolling, call this function to zoom in or out.

    If there was a scroll event within the time period specified by the _scrollCoolDownAmount variable, then
    don't do anything.

    @param {DOM Event} evt The scroll event.
  */
  scrollZoom: function(evt)
  {
    // Check if the scroll event is within the cool down time, return.
    if((Date.now()-this._scrollCoolDown) < this._scrollCoolDownAmount) return;

    // Save a new cool down time.
    this._scrollCoolDown = Date.now();

    // Zoom in or out to the pointer location.
    this.setZoomToPointerLocation(Event.pointerX(evt), Event.pointerY(evt), ((evt.detail ? evt.detail * -1 : evt.wheelDelta) > 0));
  },

  /**
    Zoom in or out to center around where the pointer location.

    @param xPos {Integer} The x position of the mouse pointer.
    @param yPos {Integer} The y position of the mouse pointer.
    @param zoomIn {boolean} If YES, zoom in, otherwise, zoom out.

    @returns {Boolean} Returns NO if there is an error.
  */
  setZoomToPointerLocation: function(xPos,yPos, zoomIn)
  {
    // Calculate the direction (-/+) the zoom step.
    var zoomStep = zoomIn ? this.zoomStep : -this.zoomStep;

    // Calculate the desired zoomValue.
    var zoomValue = this.zoomValue+zoomStep;

    // If the zoomValue is smaller or larger then the limits or the left view is visible, bail. 
    if(zoomValue < this.zoomValueMin || zoomValue > this.zoomValueMax || this.leftViewShowing)
    {
      return NO;
    }

    this.set("zoomValue", zoomValue);
  },

  /**
    Zoom to a set of coordinates.

    @param xDiff {Integer} The x position of the mouse pointer.
    @param yDiff {Integer} The y position of the mouse pointer.

    @returns {Boolean} Returns NO if there is an error.
  */
  panToCoordinates: function(xDiff, yDiff)
  {

    var zoomValue  = this.get('zoomValue');

    // If the zoomValue is equal to the zoomValueMin, bail. 
    if(zoomValue === this.zoomValueMin)
    {
      return NO;
    }

    // Calculate the x and y offsets and set it back to the zoomView.
    var xPos = this.percentageX*this.canvasWidth-xDiff;
    var yPos = this.percentageY*this.canvasHeight-yDiff;

    var pctX =  Math.max(1- (this.canvasWidth-xPos)/this.canvasWidth,0);
    var pctY =  Math.max(1- (this.canvasHeight-yPos)/this.canvasHeight,0);

    this.set("percentageX", pctX);
    this.set("percentageY", pctY);
  },

  /**
    Zoom in or out to center around a desired x and y percentage.

    @param pctX {Integer} The x position percentage.
    @param pctY {Integer} The y position percentage.
    @param zoomValue {Integer} The desired zoomValue.

    @returns {Boolean} Returns NO if there is an error.
  */
  zoomToLocation: function(pctX, pctY, zoomValue)
  {
    // If the zoomValue is smaller or larger then the limits, bail. 
    if(zoomValue < this.zoomValueMin || zoomValue > this.zoomValueMax)
    {
      return NO;
    }

    this.beginPropertyChanges();
    this.set("zoomValue", zoomValue);
    this.set("percentageX", pctX/2);
    this.set("percentageY", pctY/2);
    this.endPropertyChanges();

  },

  /**
    Get window properties and set the portal dimensions then reposition the canvas.
  */
  getWindowProperties: function()
  {
    var wH = NodeGraph.windowHeight();
    var wW = NodeGraph.windowWidth();
    
    this.set("portalHeight", (wH-this.get('topOffset')-this.get('bottomOffset')));
    this.set("portalWidth", wW-this.get('leftOffset')-this.get('rightOffset'));
    this.repositionCanvasDidChange();
  },

  /**
    Reposition the canvas inside the portal if needed, This is triggered if the percentages or the zoom value changes.

    @observes percentageX
    @observes percentageY
    @observes zoomValue
  */
  repositionCanvasDidChange: function()
  {
    // Calculate the canvas dimensions based on the portal dimensions and zoom value.
    this.canvasHeight = parseInt(this.portalHeight*this.zoomValue, 0);
    this.canvasWidth = parseInt(this.portalWidth*this.zoomValue, 0);

    // Default the top and left to 0.
    var cTop = 0;
    var cLeft = 0;

    if(this.zoomValue != this.zoomValueMin)
    {
      // Calculate the pixel value of the top and left of the views if the zoom value is not equal to the minimum.
      var cTop = -(this.percentageY*this.canvasHeight);
      var cLeft = -(this.percentageX*this.canvasWidth);

    }

    // Set the canvasTop and canvasLeft properties to the calculated values.
    this.canvasTop = cTop;
    this.canvasLeft = cLeft;

    // Set the displayProperities that the views will monitor to the newly calculated values.
    this.set('displayProperties', {height: this.canvasHeight, width: this.canvasWidth, top: this.canvasTop, left: this.canvasLeft, zoomValue: this.zoomValue, portalWidth: this.portalWidth, portalHeight: this.portalHeight});

    this.set('isZooming', this.get('zoomValue') != 1);

  }.observes('percentageX', 'percentageY', 'zoomValue'),

  /**
    Initalization function. Create the SVG elements for the fan.
  */
  init: function()
  {
    // Set up a resize observer on the window.
    Event.observe(window, 'resize', this.getWindowProperties.bind(this));

    // Set up te scroll observer.
    if(SC.isFireFox())
    {
      Element.observe(document.body, 'DOMMouseScroll', this.scrollZoom.bind(this));
    }
    else
    {
      Element.observe(document.body, 'mousewheel', this.scrollZoom.bind(this));
    }

    // Set up the basic window properties.
    this.getWindowProperties();
    sc_super();
  }  
});