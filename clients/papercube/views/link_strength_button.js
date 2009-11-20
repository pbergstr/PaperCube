// ==========================================================================
// Papercube.LinkStrengthButtonView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  LinkStrengthButtonView is used as part of the collaborator View. Allows 
  quick access to the max and min values.

  @extends SC.View
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.LinkStrengthButtonView = SC.View.extend(
/** @scope Papercube.LinkStrengthButtonView.prototype */ {

  /**
    Empty element is an empty DIV.

    @property {String}
    @default "<div></div>"
  */
  emptyElement: "<div></div>",
  
  /** 
    Boolean value specifying if the action is go to max strength requirements or not.
    
    @property {Boolean}
    @config
    @default YES
    @default YES
  */
  maxStrength: YES,
    
  /** 
    The controller that needs to be called.
  
    @property {ObjectController}
    @config
  */
  controller: null,
  
  /** 
    Option param allows you to pass in multi action information. 
    
    Default NO but can be set to any action.
    
    @property {Boolean}
    @config
    @default YES
    @default NO
  */
  option: NO,
  
  /** 
    Mouse down action that either increases or decreases the depth.
  */
  mouseDown: function()
  {
    var controller = this.get('controller');
    if(controller)
    {
      if(this.get("maxStrength"))
        controller.maxStrength(this.get('option'));
      else
        controller.minStrength(this.get('option'));
    }
  }
  
}) ;
