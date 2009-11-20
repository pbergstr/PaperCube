// ==========================================================================
// Papercube.LeftView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  This is the left view that contains the search form and search results.

  @extends SC.View
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.LeftView = SC.View.extend(
/** @scope Papercube.LeftView.prototype */ {

  /** 
    When the mouse is moved add the class name to make it visible.
    
    @param {DOM Event} evt The mouseMoved event.
  */
  mouseMoved: function(evt)
  {
    Papercube.canvasController.leftViewShowing = YES;
    this.addClassName('left-view-visible');
  },
  
  /** 
    When the mouse is moved out of the view, remove the class name that makes it visible.
    
    @param {DOM Event} evt The mouseExited event.
  */
  mouseExited: function(evt)
  {
    Papercube.canvasController.leftViewShowing = NO;
    this.removeClassName('left-view-visible');
  }

}) ;
