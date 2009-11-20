// ==========================================================================
// Papercube.ZoomButtonView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  ZoomButton is used as part of the zoomView. Allows 
  quick access to the max and min values.

  @extends SC.View
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.ZoomButtonView = SC.View.extend(
/** @scope Papercube.ZoomButtonView.prototype */ {

  /**
    Empty element is an empty DIV.

    @property {String}
    @default "<div></div>"
  */
  emptyElement: "<div></div>",
  
  /** 
    Boolean value specifying if it is a zoom out or zoom in button.
    
    @property {Boolean}
    @config
    @default YES
    @default YES
  */
  zoomOut: YES,
  
  /** 
    Mouse down action that either zooms in or out.
  */
  mouseDown: function()
  {
    if(this.get("zoomOut"))
      Papercube.canvasController.zoomOut();
    else
      Papercube.canvasController.zoomIn();
  }
  
}) ;
