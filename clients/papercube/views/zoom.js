// ==========================================================================
// Papercube.ZoomView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');
require('controllers/canvas');

/** @class

  ZoomView is the preview view and control view for the portal/canvas paradigm 
  that allows for resolution independence.

  @extends SC.View
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.ZoomView = SC.View.extend(
/** @scope Papercube.ZoomView.prototype */ {

  /**
    The portal height, set by the canvasController.
  
    @property {Integer}
    @binding "Papercube.canvasController.portalHeight"
  */
  heightBinding: "Papercube.canvasController.portalHeight",

  /**
    The portal width, set by the canvasController.
  
    @property {Integer}
    @binding "Papercube.canvasController.portalWidth"
  */
  widthBinding: "Papercube.canvasController.portalWidth",

  /**
    The zoom value, set by the canvasController.
  
    @property {Integer}
    @binding "Papercube.canvasController.zoomValue"
  */
  zoomValueBinding: "Papercube.canvasController.zoomValue",

  /**
    Zooming or not, set by the canvasController.
  
    @property {Boolean}
    @binding "Papercube.canvasController.isZooming"
  */
  isZoomingBinding: "Papercube.canvasController.isZooming",

  /**
    The x percentage, set by the canvasController.
  
    @property {Float}
    @binding "Papercube.canvasController.percentageX"
  */
  percentageXBinding: "Papercube.canvasController.percentageX",

  /**
    The y percentage, set by the canvasController.
  
    @property {Float}
    @binding "Papercube.canvasController.percentageY"
  */
  percentageYBinding: "Papercube.canvasController.percentageY",
  
  /**
    Is the view visible?
    
    @property {Boolean}
    @default NO
  */
  isVisible: NO,
  
  /**
    Internal boolean that specifies if the zoom has been touched or not. 
    
    @property {Boolean}
    @default NO
  */
  _zoomDirty: NO,
  
  /**
    The bounds that are used for rendering the zoomView.
    
    @property {Array}
  */
  _bounds: {
    x: 0,
    y: 0,
    height: 0,
    width: 0
  },

  /**
    Action type is either drag or click. The positioning behavior changes depending on what this parameter is.
    
    @property {String}
    @default ''
  */
  _actionType: '', 
  
  /**
    Used to offset your mouse pointer's x inside the preview portal view so that it doesn't jump.
    
    @property {Integer}
    @default 0
  */
  _ptrXOffset: 0, 

  /**
    Used to offset your mouse pointer's y inside the preview portal view so that it doesn't jump.
    
    @property {Integer}
    @default 0
  */
  _ptrYOffset: 0, 
  
  /**
    The x-axis percentage.
    
    @property {Float}
    @default 0.5
  */
  percentageX: 0.5,
  
  /**
    The y-axis percentage.
    
    @property {Float}
    @default 0.5
  */
  percentageY: 0.5,

  /**
    The zoom view has two outlets, the canvas and portal, the portal is the visible window.

    ["canvasPreview", "portalPreview"]
  */
  outlets: ["canvasPreview", "portalPreview"],

  /**
    This is the DIV element for the preview canvas.

    @outlet {DOM Element} '.canvas-preview?'
  */
  canvasPreview: ".canvas-preview?",

  /**
    This is the DIV element for the preview portal.

    @outlet {DOM Element} '.portal-preview?'
  */
  portalPreview: ".portal-preview?",
  
  /**
    Observes isZooming and shows the view it is needed.

    @observes isZooming
  */
  isZoomingDidChange: function()
  {
    this.set('isVisible', this.get('isZooming'));
    setTimeout(this.applyZoomTransition.bind(this), 5);
    
    // If you're not zooming, reset the dirty parameter to NO.
    if(!this.get("isZooming"))
    {
      this._zoomDirty = NO;
    }
  }.observes('isZooming'),

  /**
    Redraw the zoomView as needed based on 'height', 'width', 'zoomValue'.

    @observes height
    @observes width
    @observes zoomValue
  
    @returns {Boolean} Returns NO if there is no guid of if the view is not visible.
  */
  redrawParamsDidChange: function()
  {
    // Only redraw if it is visible.
    if(!this.get('isVisible')) return NO;

    // Get height and width parameters.
    var height = this.get('height');
    var width = this.get('width');
    
    // These are the max values for the view.
    var lheight = 140;
    var lwidth = 140;
    
    // Grab the zoom value.
    var zoomValue = this.get('zoomValue');

    // Set the min length depending on the aspect ratio.
    if(height > width)
    {
      lwidth = parseInt(lheight*(width/height),0);
    }
    else
    {
      lheight = parseInt(lwidth*(height/width),0);
    }
    
    // Calculate the frame of the zoomView.
    var h = (lheight+10);
    var w = (lwidth+20);
    this.setStyle({height: h+"px", width: w+"px"});
    this._frame = null;
    this.get("frame");
    this._frame.height = h;
    this._frame.width = w;

    // Set the position of the canvasPreview.
    this.canvasPreview.style.right = "10px";
    this.canvasPreview.style.width = lwidth + "px";
    this.canvasPreview.style.height = lheight+ "px";
    
    // Set the portal bounds.
    var pWidth = (lwidth/zoomValue);
    var pHeight = (lheight/zoomValue);
    var bounds =  {
      x: (this._frame.x+8),
      y: 30,
      height: lheight,
      width: lwidth,
      previewWidth: pWidth,
      previewHeight: pHeight
    };
    
    this._bounds = bounds;
    
    // Calculate the preview x and y coordinates.
    var recalcPercent = NO;
    if(this._zoomDirty && (this._lastHeight != height || this._lastWidth != width))
    {
      var prevX = bounds.x+this.get('percentageX')*lwidth+pWidth/2;
      var prevY = bounds.y+this.get('percentageY')*lheight+pHeight/2;
    }
    else if(this._zoomDirty && this._lastZoomValue != zoomValue)
    {
      var prevX = this._lastPrevX;
      var prevY = this._lastPrevY;
      recalcPercent = YES;
    }
    else
    {
      var prevX = bounds.x+lwidth/2;
      var prevY = bounds.y+lheight/2;
      recalcPercent = YES;
    }

    // Based on the calculated preview values, set the position.
    this._setPreviewPosition(prevX, prevY);
    
    // If you need to recalculate the percentage, then set it back to the controller.
    if(recalcPercent)
    {
      this._setPercentage();
    }
    // this.positionPreviewBox((this.get('percentageX')*lwidth-w/2), (this.get('percentageY')*lheight-h/2), lheight, lwidth, zoomValue);
    
    // Set last height, width, and zoom value so that you can see if it needs be changed next time.
    this._lastHeight = height;
    this._lastWidth = width;
    this._lastZoomValue = zoomValue;
    
  }.observes('height', 'width', 'zoomValue'),

  /**
    Add the zoom class so it animates.
  */
  applyZoomTransition: function()
  {
    this.setClassName('zoom-view-visible', this.get('isZooming'));
  },

  /**
    Set the preview box position and percentages.
    
    @param pctX {Integer} The x percentage.
    @param pctY {Integer} The y percentage.
  */
  setParams: function(pctX, pctY)
  {
    var bounds = this._bounds;
    this._setPreviewPosition((bounds.x+bounds.width*pctX), (bounds.y+bounds.height*pctY));
    this._setPercentage();
  },

  /**
    Update preview box postion.
    
    @param pctX {Integer} The x percentage.
    @param pctY {Integer} The y percentage.
  */
  updatePreviewBox: function(pctX, pctY)
  {
    var bounds = this._bounds;
    this._setPreviewPosition(parseInt((bounds.x+bounds.width*pctX+bounds.previewWidth/2),0), parseInt((bounds.y+bounds.height*pctY+bounds.previewHeight/2),0));
  },

  /**
    Set the position and dimensions of the portalPreview.
    
    @param x {Integer} The x-position.
    @param y {Integer} The y-position.
    @param height {Integer} The box height
    @param height {Integer} The box width
  */
  positionPreviewBox: function(x, y, height, width)
  {
    this.portalPreview.style.top = y + "px";
    this.portalPreview.style.left = x + "px";
    this.portalPreview.style.width = width + "px";
    this.portalPreview.style.height = height + "px";
    this._bounds.previewX = x;
    this._bounds.previewY = y;
  },
  
  /**
    Set the preview box position as you're dragging. Make sure it does not leave the bounds of the canvas.
    
    
    @param x {Integer} The x-position.
    @param y {Integer} The y-position.
  */
  _setPreviewPosition: function(x,y)
  {
    this._lastPrevX = x;
    this._lastPrevY = y;
    var bounds = this._bounds;
    x = x-bounds.previewWidth/2;
    y = y-bounds.previewHeight/2;
    if(y < bounds.y) y = bounds.y;
    if(y > ((bounds.y+bounds.height)-bounds.previewHeight)) y = ((bounds.y+bounds.height)-bounds.previewHeight);

    if(x < bounds.x) x = bounds.x;
    if(x > ((bounds.x+bounds.width)-bounds.previewWidth)) x = ((bounds.x+bounds.width)-bounds.previewWidth)+1;

    var ly = y-bounds.y;
    var lx = x-bounds.x;

    this._bounds.previewX = Math.min(lx+1, bounds.width-bounds.previewWidth+1);
    this._bounds.previewY = ly+1;
    this._bounds.ly = ly;
    this._bounds.lx = lx;
    
    // Set the review box position.
    this.positionPreviewBox(this._bounds.previewX, this._bounds.previewY, bounds.previewHeight, bounds.previewWidth);
  },
  
  /**
    Set the percentage back to the controller.
    
  */
  _setPercentage: function()
  {
    var bounds = this._bounds;
    this.set('percentageX', 1- (bounds.width-bounds.lx)/bounds.width);
    this.set('percentageY', 1- (bounds.height-bounds.ly)/bounds.height);
  },

  /** 
    Handle the mouseDown action.

    @param {DOM Event} evt The mouseDown event.
  */
  mouseDown: function(evt)
  {
    // If you clicked the canvas, the action is click.
    if(Element.hasClassName(evt.target, 'canvas-preview')) 
    {
      this._actionType = 'click';
    }

    // If you clicked the portal, then the action is drag.
    else if(Element.hasClassName(evt.target, 'portal-preview'))
    {

      // In order to prevent annoying jumping set the offset of the pointer x and y so that you can click and drag anywhere in the box.
      this._ptrXOffset = parseInt(Event.pointerX(evt)-(this._bounds.x+this._bounds.previewX+this._bounds.previewWidth/2),0);
      this._ptrYOffset = parseInt(Event.pointerY(evt)-(this._bounds.y+this._bounds.previewY+this._bounds.previewHeight/2),0);
      this._actionType = 'drag';
      this.portalPreview.className = "portal-preview grabbing";
    }
    else 
    {
      this._actionType = '';
      return NO;
    }

    return YES;
  },

  /** 
    When it is dragged, handle it.

    @param {DOM Event} evt The mouseDragged event.
  */
  mouseDragged: function(evt)
  {
    // We don't do a drag if it is a noop or a click.
    if(this._actionType == '' || this._actionType == 'click') return NO; 

    // First position box, then translate into correct coordinates for the actual view.
    this._setPreviewPosition(Event.pointerX(evt)-this._ptrXOffset, Event.pointerY(evt)-this._ptrYOffset);

    return YES;
  },

  /** 
    This will end a drag or position after a click.
    
    @param {DOM Event} evt The mouseUp event.
  */
  mouseUp: function(evt)
  {
    this._zoomDirty = YES;
    this.portalPreview.className = "portal-preview";

    // If it is a drag, set the final position with the proper click offset.
    if(this._actionType == 'drag')
    {
      this._setPreviewPosition(Event.pointerX(evt)-this._ptrXOffset, Event.pointerY(evt)-this._ptrYOffset);
    }
    
    // If it is a click, then just set it right away.
    else
    {
      this._setPreviewPosition(Event.pointerX(evt), Event.pointerY(evt));
    }
    
    // Since we're done, set the percentage back to the controller.
    this._setPercentage();
    
    this._actionType = '';
    
    return YES;
  }

}) ;
