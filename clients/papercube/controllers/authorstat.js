// ==========================================================================
// Papercube.AuthorStatController
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
Papercube.authorStatController = SC.Object.create(
/** @scope Papercube.authorStatController */ {
    
  /**
    The default sort order for papers list. 
    
    @property {String}
    @default 'Title'
  */
  paperSortOrder: 'Title',

  /**
    The sort order choices for papers.
    
    Values ['Title', 'Date', 'Num Refs', 'Num Cites', 'Num Authors']

    @property {Array}
  */
  paperSortOrderChoices:
  [
    'Title', 'Date', 'Num Refs', 'Num Cites', 'Num Authors'
  ],

  /**
    The default sort order for collaborator list. 
    
    @property {String}
    @default 'Name'
  */
  collaboratorSortOrder: 'Name',

  /**
    The default sort order for ref authors list. 
    
    @property {String}
    @default 'Name'
  */
  refAuthorSortOrder: 'Name',

  /**
    The default sort order for cite authors list. 
    
    @property {String}
    @default 'Name'
  */
  citeAuthorSortOrder: 'Name',

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