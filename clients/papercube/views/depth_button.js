// ==========================================================================
// Papercube.DepthButtonView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  DepthButton is used as part of the collaborator View. Allows 
  quick access to the max and min values.

  @extends SC.View
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.DepthButtonView = SC.View.extend(
/** @scope Papercube.DepthButtonView.prototype */ {
  
  /**
    Empty element is an empty DIV.

    @property {String}
    @default "<div></div>"
  */
  emptyElement: "<div></div>",
  
  /** 
    Boolean value specifying if the action is adding depth or not.
    
    @property {Boolean}
    @config
    @default YES
  */
  maxDepth: YES,
  
  /** 
    The controller that needs to be called.
  
    @property {ObjectController}
    @config
  */
  controller: null,
  
  /** 
    Mouse down action that either increases or decreases the depth.
  */
  mouseDown: function()
  {
    var controller = this.get('controller');
    if(controller)
    {
      if(this.get("maxDepth"))
        controller.maxDepth();
      else
        controller.minDepth();
    }
  }
  
}) ;
