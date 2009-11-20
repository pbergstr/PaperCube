// ==========================================================================
// Papercube.SearchResultsItemView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  This view is the search result item. It is rendered not using SC views in
  order to make things faster.

  @extends SC.View
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.SearchResultsItemView = SC.View.extend(
/** @scope Papercube.SearchResultsItemView.prototype */ {

  /**
    Empty element is an empty DIV.

    @property {String}
    @default "<div></div>"
  */
  emptyElement: '<div></div>',

  /**
    By default, it is not selected.
    
    @property {Boolean}
    @default NO
  */
  isSelected: NO,

  /**
    Add a selected class if it is selected.
    
    @observes isSelected
  */
  isSelectedDidChange: function() 
  {
    this.setClassName('sel',this.get('isSelected')) ;
  }.observes('isSelected'),

  /**
    Observe the content and render the item's contents.
    
    @observes content
  */
  contentDidChange: function()
  {
   
     var content = this.get('content');
 
     // Bail if there is no content.
     if(!content) return;
 
     // innerHTML is an array that will be joined at the end of the function.
     var innerHTML = [];

     // Set up the HTML for Authors.
     if(Papercube.viewController.get('viewingMode') == 'Authors')
     {
       var statsstring = Papercube.pluralizeString(" paper", content.get("paperCount")) + ", " +
       Papercube.pluralizeString(" collab", content.get("collaborators").length) + ", references " +
       content.get("refAuthors").length + ", cited by " + content.get("citeAuthors").length ;

      innerHTML = [
        '<div class="title">',
            content.get('name'),
        '</div>',
        '<div class="num">', 
          content.get('affiliation'),
        '</div>',
        '<div class="subtitle">', 
          statsstring,
        '</div>'
        ];

    }

    // Set up the HTML for Papers.
    else
    {
      // Get the author list.
      var authorstring = content.get('authorNames').join(', ');
      if(authorstring.length > 50)
      {
        authorstring = authorstring.substr(0, 50) + "&hellip;";
      }
      
      var title = titleStr = (content.get('title')) ? content.get('title') : 'Untitled';
      if(title.length > 35)
      {
        title = title.substr(0,33) + "&hellip";
      }
      innerHTML = [
       '<div class="title" title="'+titleStr+'">',
        title,
       '</div>',
       '<div class="num">', 
         Papercube.pluralizeString(" ref", content.get('refCount')) + ", " + Papercube.pluralizeString(" cite", content.get('citeCount')), 
       '</div>',
       '<div class="subtitle">', 
          authorstring,
       '</div>'
       ];
     }
 
     // Set the innerHTML of the view of the HTML that was just generated.
     this.set('innerHTML', innerHTML.join(''));
  
 }.observes('content')
}) ;
