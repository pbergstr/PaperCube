// ==========================================================================
// Papercube.PaperStatController
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  Controls the drop downs.

  @extends SC.Object
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
  @static
*/
Papercube.paperStatController = SC.Object.create(
/** @scope Papercube.paperStatController */ {

  /**
    The default sort order for citation list. 
    
    @property {String}
    @default 'Title'
  */
  citationSortOrder: 'Title',

  /**
    The sort order choices for papers.

    Values ['Title', 'Date', 'Num Refs', 'Num Cites', 'Num Authors']

    @property {Array}
  */
  citationSortOrderChoices:
  [
    'Title', 'Date', 'Num Refs', 'Num Cites', 'Num Authors'
  ],
  
  /**
    The default sort order for citation list. 
    
    @property {String}
    @default 'Title'
  */
  referenceSortOrder: 'Title',

  /**
    The sort order choices for papers.

    Values ['Title', 'Date', 'Num Refs', 'Num Cites', 'Num Authors']

    @property {Array}
  */
  referenceSortOrderChoices:
  [
    'Title', 'Date', 'Num Refs', 'Num Cites', 'Num Authors'
  ],

  /**
    The default sort order for authors list. 
    
    @property {String}
    @default 'Name'
  */
  authorSortOrder: 'Name',

  /**
    The sort order choices for authors.

    Values ['Name', 'Num Papers', 'Num Collabs', 'Cite Count']

    @property {Array}
  */
  authorSortOrderChoices:
  [
    'Name', 'Num Papers', 'Num Collabs', 'Cite Count'
  ]
  
});