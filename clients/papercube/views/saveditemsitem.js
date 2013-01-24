// ==========================================================================
// Papercube.SavedItemsItemView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  This view is the saved items. It is rendered not using SC views in
  order to make things faster.

  @extends SC.View
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.SavedItemsItemView = SC.View.extend(
/** @scope Papercube.SavedItemsItemView.prototype */ {

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
  
  _contentIsPaper: NO,

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
   if(content._type == "Papercube.Author")
   {
     this._contentIsPaper = NO;
     var statsstring = Papercube.pluralizeString(" paper", content.get("paperCount")) + " published, " +
     Papercube.pluralizeString(" collaboration", content.get("collaborators").length) + " with others, references " +
     Papercube.pluralizeString(" author", content.get("refAuthors").length) + ", cited by " +
     Papercube.pluralizeString(" author", content.get("citeAuthors").length) ;
     
     
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
    this._contentIsPaper = YES;
    // Get the author list.
    var authorstring = content.get('authorNames').join(', ');
    if(authorstring.length > 100)
    {
      authorstring = authorstring.substr(0, 99) + "&hellip;";
    }
    var title = titleStr = content.get('title');
    if(title.length > 70)
    {
      title = title.substr(0,69) + "&hellip;";
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
    
 }.observes('content'),
 
 /** 
   Show the paper or author in the last view.
   
   @param {DOM Event} evt The mouseDown event.
 */
 mouseDown: function(evt)
 {
   var content = this.get('content');
   Papercube.viewController.set('savedPanelShowing', NO);
   if(!this._contentIsPaper && content)
   {
     Papercube.viewController.viewAuthor(content.get('guid'));
   }
   if(this._contentIsPaper && content)
   {
     Papercube.viewController.viewPaper(content.get('guid'));
   }
 }

}) ;
