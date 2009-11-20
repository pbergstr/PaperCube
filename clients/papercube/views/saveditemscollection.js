// ==========================================================================
// Papercube.SavedItemsCollectionView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  This is the basic saved items collection view.

  @extends SC.CollectionView
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.SavedItemsCollectionView = SC.CollectionView.extend(
/** @scope Papercube.SavedItemsCollectionView.prototype */ {

  /**
    Resize based on the window height.
  
    @param oldSize {Integer} The old size.
  */
  resizeWithOldParentSize: function(oldSize)
  {
    this.set('frame', {height: 420});
  },
  
  /** 
    Initialization function. 
    
    Call resizeWithOldParentSize.
  */
  init: function()
  {
    sc_super();

    // Set the frame height on init.
    this.resizeWithOldParentSize();
  }

}) ;
