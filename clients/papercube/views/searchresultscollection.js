// ==========================================================================
// Papercube.SearchResultsCollectionView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  This is the basic search results collection view.

  @extends SC.View
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.SearchResultsCollectionView = SC.CollectionView.extend(
/** @scope Papercube.SearchResultsCollectionView.prototype */ {

  /**
    Resize based on the window height.
  
    @param oldSize {Integer} The old size.
  */
  resizeWithOldParentSize: function(oldSize)
  {
    this.set('frame', {height: NodeGraph.windowHeight()-194});
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
