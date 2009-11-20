// ==========================================================================
// Papercube.CanvasController
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  This controls the canvas, the canvas is a viewport that allows views to 
  be resolution independent. This is done by keeping track of various zooming
  parameters and communicating this to the zoomView (preview pane) and the core
  view that is being used.

  @extends SC.Object
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
  @static
*/
Papercube.canvasController = NodeGraph.NodeGraphDelegate.create(
/** @scope Papercube.canvasController.prototype */ {
 
  /**
    boolean signifying that the app should be showing the canvas.

    @property {Boolean}
    @default NO
  */
  shouldShowCanvas: NO,

  /**
    Fan menu div container.

    @property {DOM Element}
  */
  fanDiv: null,

  /**
    Fan menu SVG root.

    @property {DOM Element}
  */
  fanSVGRoot: null,

  /**
    Fan menu SVG.

    @property {DOM Element}
  */
  fanSVG: null,

  /**
    Fan menu properties.

    @property {Object}
  */
  fans: {},
  
  /**
    Set to YES when the left view is visible.

    @property {Boolean}
    @default NO
  */
  leftViewShowing: NO,
  
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

    // Calculate the x and y offsets and set it back to the zoomView.
    var x = xPos-this.canvasLeft+30*zoomValue;
    var y = yPos-30-this.canvasTop;
    var pctX =  1- (this.canvasWidth-x)/this.canvasWidth;
    var pctY =  1- (this.canvasHeight-y)/this.canvasHeight;
    SC.page.canvas.zoomView.setParams(pctX, pctY);
  },

  /**
    Zoom to a set of coordinates.
    
    @param xDiff {Integer} The x position of the mouse pointer.
    @param yDiff {Integer} The y position of the mouse pointer.
    @param updateZoomPreview {Boolean} If YES, update the zoom preview pane.

    @returns {Boolean} Returns NO if there is an error.
  */
  panToCoordinates: function(xDiff, yDiff, updateZoomPreview)
  {

    var zoomValue  = this.get('zoomValue');
    
    // If the zoomValue is equal to the zoomValueMin, bail. 
    if(zoomValue === this.zoomValueMin || this.leftViewShowing)
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
    if(updateZoomPreview)
    {
      SC.page.canvas.zoomView._zoomDirty = YES;
      SC.page.canvas.zoomView.updatePreviewBox(pctX, pctY);
    }
  
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
    // If the zoomValue is smaller or larger then the limits or the left view is visible, bail. 
    if(zoomValue < this.zoomValueMin || zoomValue > this.zoomValueMax || this.leftViewShowing)
    {
      return NO;
    }

    SC.page.canvas.zoomView._zoomDirty = YES;

    this.beginPropertyChanges();
    this.set("zoomValue", zoomValue);
    this.set("percentageX", pctX/2);
    this.set("percentageY", pctY/2);
    this.endPropertyChanges();

    // Set the percentages and the zoom value.
    // SC.page.canvas.zoomView.updatePreviewBox(pctX, pctY);
    
  },
  
  /**
    Get window properties and set the portal dimensions then reposition the canvas.
  */
  getWindowProperties: function()
  {
    var wH = NodeGraph.windowHeight();
    var wW = NodeGraph.windowWidth();
    
    this.fanSVGRoot.setAttributeNS(null, "height", wH);
    this.fanSVGRoot.setAttributeNS(null, "width", wW);

    this.set("portalHeight", (wH-30));
    this.set("portalWidth", wW);
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
    sc_super();
    
    this.hideFan();  
  
  }.observes('percentageX', 'percentageY', 'zoomValue'),
  
  /** 
    Show a fan menu.

    @param x {Integer} The x position.
    @param y {Integer} The y position.
    @param name {string} The view's name.
    @param fanType {string} The type of fan.

    @returns {Boolean} Returns the NO if the fan name is not registered.
  */
  showFan: function(x,y, name, fanType)
  {
    // Hide if there are any fans visible.
    if(this.fanSVG.childNodes.length != 0)
    {
      this.hideFan();
    }
    
    // If there is no name registered, then bail. 
    if(!this.fans[name])
    {
      console.log("Fan Error: You need to register your fan views!");
      return NO;
    }
    
    // If there is no fan for this name and fan type, then create it lazily.
    else if(!this.fans[name].svg[fanType])
    {
      console.log("Fan Notice: Fan "+name+"-"+fanType+" has not been created, creating now.");
      this.createFan(name, fanType);
    }
    
    // Append to the DOM.
    this.fanSVG.appendChild(this.fans[name].svg[fanType]);
    this.fanSVG.setAttributeNS(null, 'x', x-37);
    this.fanSVG.setAttributeNS(null, 'y', y-157);
    this.fanSVGRoot.style.cssText = "position: relative; z-index: 1001;";
  },

  /**
    Hide the currently visible fan.
  */
  hideFan: function()
  {
    // If there is a fan visible, remove it from the DOM.
    if(this.fanSVG && this.fanSVGRoot && this.fanSVG.firstChild)
    {
      this.fanSVG.removeChild(this.fanSVG.firstChild);
      this.fanSVGRoot.style.cssText = "";
    }
  },
  
  /** 
    SVG mouse over.
    
    If the event contains a wedge or fan DOM element, highlight it, otherwise hide the fan.
    
    @param {DOM Event} evt The mouseOver event.
  */
  svgMouseOver: function(evt)
  {
    this._highlightFan(evt, '#555');
  },

  /** 
    SVG mouse over.
    
    If the event contains a wedge or fan DOM element, remove its highlight, otherwise hide the fan.
    
    @param {DOM Event} evt The mouseOut event.
  */
  svgMouseOut: function(evt)
  {
    this._highlightFan(evt, '#222');
  },

  /** 
    SVG mouse down.
    
    If the event contains a wedge or fan DOM element, remove its highlight, otherwise hide the fan.
    
    @param {DOM Event} evt The mouseDown event.
  */
  svgMouseDown: function(evt)
  {
    this._highlightFan(evt, '#222');
  },
    
  /** 
    SVG mouse up.
    
    Call back to the parent view.
    
    @param {DOM Event} evt The mouseUp event.
  */
  svgMouseUp: function(evt)
  {

    // If it is a path, then set the fill to #222.
    if(evt.target.nodeName == 'path')
    {
      evt.target.setAttributeNS(null, 'fill', '#222');
    }

    // Hide the fan.
    this.hideFan();

    // Excute action.
    var params = this._getSVGParams(evt);
    if(params)
    {
      this.fans[params.name].opts[params.fanType][params.action](evt);
    }
  },

  /** 
    Mouse up event on the center circle of the fan. Then, just hide the fan.
    
    @param {DOM Event} evt The mouseUp event.
  */
  circleMouseUp: function(evt)
  {
    this.hideFan();
  },

  /** 
    Registed the fans for a view.

    @param name {string} The view's name.
    @param fans {string} The fan's options.
  */
  registerFans: function(name, fans)
  {
    this.fans[name] = {
      name: name,
      opts: fans,
      svg: {},
      slices: {}
    };
  },
  
  /**
    For NodeGraphs, register using this generic function.
    
    @param view {NodeGraph.NodeGraphView}
  */
  fanForNodeGraph: function(view) {

    var refocusFunc = function(evt)
    { 
      Papercube.viewController.setContentToViewFromGUID(view._mouseDownGUID, view.contentTypeViewing, NO);
    }.bind(view); 

    var citeseerFunc = function(evt)
    { 
      window.open(Papercube.Paper.find(view._mouseDownGUID).get('url'));
    }.bind(view); 

    var saveFunc = function(evt)
    { 
      Papercube.viewController.saveObject(view._mouseDownGUID, view.contentTypeViewing);
    }.bind(view); 

    var zoomOutFunc = function(evt)
    { 
      Papercube.canvasController.setZoomToPointerLocation(Event.pointerX(evt), Event.pointerY(evt), NO);
    }.bind(view); 
    
    var zoomInFunc = function(evt)
    { 
      Papercube.canvasController.setZoomToPointerLocation(Event.pointerX(evt), Event.pointerY(evt), YES);
    }.bind(view); 

    var pinLinesFunc = function(evt)
    { 
      view.pinLinesForObj();
    }.bind(view); 

    if(view.get('showEdges')) {
      Papercube.canvasController.registerFans(view.viewName,
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
    } else {
      Papercube.canvasController.registerFans(view.viewName,
      {
          focusedFan: {
            CiteSeer: citeseerFunc,
            Save: saveFunc,
            "Zoom +": zoomInFunc,
            "Zoom -": zoomOutFunc
          }, 
          unfocusedFan: {
            CiteSeer: citeseerFunc,
            Save: saveFunc,
            Refocus: refocusFunc,
            "Zoom +": zoomInFunc,
            "Zoom -": zoomOutFunc
          }     
      });      
    }
  },

  /** 
    Based on the name and the fan type, look for the registered fan and create it.
    
    Fans are lazily created only when they are requested.
    
    @param name {string} The view's name.
    @param fanType {string} The type of fan.
  */
  createFan: function(name, fanType)
  {
    var g = this._createSVGElement('g', {}, {}); 
        
    var opts = this.fans[name].opts[fanType];

    var slices = [];
    
    var options = [];
    for(var key in opts)
    {
      options.push(key);
    }
    
    var sr = 25;
    var cx = 11;
    var cy = 150;
    var r = 150;

    var len = options.length;
    var delta = (Math.PI/2)/len;
    var start = (Math.PI/4);

    // This element is created to be the mouse-exited catcher to hide the fan when you mouse out.
    this._createSVGElement('circle', {cx: cx+20, cy:cy, r:r*2, opacity: '0.0'}, {mouseover: this.circleMouseUp.bind(this)}, g);
    
    for(var i=0; i<len; i++)
    {
      var end = start + delta;
      
      var sx1 = cx+20 + sr * Math.sin(start);
      var sy1 = cy - sr * Math.cos(start);
      var sx2 = cx+20 + sr * Math.sin(end);
      var sy2 = cy - sr * Math.cos(end);
      
      var x1 = cx + (r-sr) * Math.sin(start);
      var y1 = cy - (r-sr) * Math.cos(start);
      var x2 = cx + (r-sr) * Math.sin(end);
      var y2 = cy - (r-sr) * Math.cos(end);

      var pathCmd = "M " + sx2 + "," + sy2 +  // Start at circle center
          " A " + sr + "," + sr +       // Draw an arc of radius sr
          " 0 0 0 " +       // Arc details...
          sx1 + "," + sy1 +             // Arc goes to to (x2,y2)
          " L " + x1 + "," + y1 +     // Draw line to (x1,y1)
          " A " + r + "," + r +       // Draw an arc of radius r
          " 0 0 1 " +       // Arc details...
          x2 + "," + y2 +             // Arc goes to to (x2,y2)
          " Z";                       // Close path back to (cx,cy)

      slices.push(this._createSVGElement('path', {d: pathCmd, fill: '#222', stroke: '#555', 'stroke-width': 1, opacity: '0.8', fanType: fanType, name: name, action: options[i], index: i}, {
        mouseout: this.svgMouseOut.bind(this), mousemove: this.svgMouseOver.bind(this), mousedown: this.svgMouseDown.bind(this), mouseup: this.svgMouseUp.bind(this)
      }, g));
      start=end;
    }

    var delta = 90/len;
    var start = -45;
    for(var i=0; i<len; i++)
    {
      var end = start + delta;
      var text = this._createSVGElement('text', {x: 90, y: cy+5, fill: 'white', 'text-anchor': 'right', 'font-size': 10, transform: "rotate("+(((start+end)/2))+" "+(20)+", 160)", fanType: fanType, name: name, action: options[i], index: i}, {
        mouseout: this.svgMouseOut.bind(this), mousemove: this.svgMouseOver.bind(this), mousedown: this.svgMouseDown.bind(this), mouseup: this.svgMouseUp.bind(this)      }, g);
      var textNode = document.createTextNode(options[i]);
      text.appendChild(textNode);
      start=end;
    }
    this._createSVGElement('circle', {cx: cx+20, cy:cy, r:sr, fill: '#000', stroke: "none", 'stroke-width': 1, opacity: '0.3', index: -1}, {mouseup: this.circleMouseUp.bind(this)}, g);
    
    this.fans[name].svg[fanType] = g;
    this.fans[name].slices[fanType] = slices;
  },

  /**
    Set a fan's highlight or hide the fan.
    
    @param {DOM Event} evt The mouse event.
    @param The {string} desired hex fill color of the fan.
  */
  _highlightFan: function(evt, fill)
  {
    var params = this._getSVGParams(evt);
    if(params)
    {
      this.fans[params.name].slices[params.fanType][params.index].setAttributeNS(null, 'fill', fill);
    }
    else
    {
      this.hideFan();
    }
  },

  /**
    Get the fan slice details based on the event object passed in.

    @param {DOM Event} evt The mouse event.

    @returns {Array} {object} Returns the SVG params.
  */
  _getSVGParams: function(evt)
  {
    var target = evt.target;
    var index = target.getAttribute('index');
    var name = target.getAttribute('name');
    var fanType = target.getAttribute('fanType');
    var action = target.getAttribute('action');
    if(index && name && fanType && action)
    {
      return {index: index, name: name, fanType: fanType, action: action};
    }
    return NO;
  },
  
  /**
    Create a new SVG element.
  
    @param type {string} The node type.
    @param attributes {Object} The attributes hash.
    @param events {Object} The events hash.
    @param {DOM Element} The parentNode to attach to.
    
    @returns {Array} {DOM Element} The SVG element that was created.
  */
  _createSVGElement: function(type, attributes, events, parentNode)
  {
    var elm = document.createElementNS("http://www.w3.org/2000/svg", type);
    if(attributes)
    {
      for(var key in attributes)
      {
       	elm.setAttributeNS(null, key, attributes[key]);
      }
    }
    if(events)
    {
      for(var key in events)
      {
        elm.addEventListener(key, events[key], NO);
      }
    }
    if(parentNode)
      parentNode.appendChild(elm);

    return elm;
  },
    
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

    // Set up the fan div and svg elements.
    this.fanDiv = $('fan-container');

    this.fanSVGRoot = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    this.fanSVGRoot.setAttributeNS(null, "height", 1);
    this.fanSVGRoot.setAttributeNS(null, "width", 1);
    this.fanDiv.appendChild(this.fanSVGRoot);

    this.fanSVG = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    this.fanSVG.setAttributeNS(null, "height", 300);
    this.fanSVG.setAttributeNS(null, "width", 300);
    this.fanSVGRoot.appendChild(this.fanSVG);

    // Set up the basic window properties.
    this.getWindowProperties();
    sc_super();
  }

}) ;
