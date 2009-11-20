// ==========================================================================
// NodeGraph.DragPanMixin
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');


/** @class

  This the drag pan mixin for the views. It will be used in multiple places to allow for drag panning.

  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
NodeGraph.DragPanMixin = {
  /** @scope NodeGraph.DragPanMixin.prototype */ 

  /**
    This is the xPos for the drag-pan.
    
    @property {Integer}
  */
  _xPos: 0,

  /**
    This is the yPos for the drag-pan.
    
    @property {Integer}
  */
  _yPos: 0,

  /**
    This is the mouseDragTime. Registered as things are dragged to determine the wait time.
    
    @property {Integer}
  */
  _mouseDragTime: 0,
  
  /**
    Can the view drag-pan or not. NO if it can't.
    
    @property {Integer}
    @default NO
  */
  _canDrag: NO,

  /** 
    End a drag pan operation if the view is being dragged.
    
    @param {DOM Event} evt The mouseUp event.
  */
  mouseUp: function(evt)
  {
    if(this._canDrag)
    {
      if(this.get('delegate')) {
        this.get('delegate').panToCoordinates((Event.pointerX(evt)-this._xPos), (Event.pointerY(evt)-this._yPos), YES);
      }
      this._yPos = 0;
      this._xPos = 0;
      this.removeClassName('is-dragging');
      this.removeClassName('can-drag');
    }
    this._canDrag = NO;
  },

  /** 
    Update the view if the view is being dragged. Don't do anything if 200 ms has not passed.
    
    @param {DOM Event} evt The mouseDragged event.
  */
  mouseDragged: function(evt)
  {
    if(this._canDrag)
    {
      this.removeClassName('can-drag');
      this.addClassName('is-dragging');

      var x = Event.pointerX(evt);
      var y = Event.pointerY(evt);

      if((Date.now()-this._mouseDragTime) > 200)
      {
        if(this.get('delegate')) {
          this.get('delegate').panToCoordinates((x-this._xPos), (y-this._yPos));
        }
        this._xPos = x; //Event.pointerX(evt);
        this._yPos = y; //Event.pointerY(evt);
        this._mouseDragTime = Date.now();
      }

    }
  },
  
  /** 
    Handle a mouse down where there is no guid. Enable a drag.
    
    @param {DOM Event} evt The mouseDown event.
  */
  handleMouseDownDrag: function(evt)
  {
    this.addClassName('can-drag');
    this._yPos = Event.pointerY(evt);
    this._xPos = Event.pointerX(evt);
    this._canDrag = YES;
    this._mouseDragTime = Date.now();
    return YES;
  }
};