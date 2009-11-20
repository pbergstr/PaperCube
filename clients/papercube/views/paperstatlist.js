// ==========================================================================
// Papercube.PaperstatListView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  This is a list for the paper stat view.

  @extends SC.CollectionView
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.PaperstatListView = SC.View.extend(
/** @scope Papercube.PaperstatListView.prototype */ {

  /**
    Empty element is an empty DIV.

    @property {String}
    @default "<div></div>"
  */
  emptyElement: '<div></div>',

  /**
    If it is an author list, set to YES, else NO.
    
    @property {Boolean}
    @default NO
  */
  isAuthorList: NO,
  
  /**
    This is the list item for the paper stat list.
  
    @property
  */
  subView: SC.View.extend({
    
    /**
      Empty element is an empty DIV.

      @property {String}
      @default "<div></div>"
    */
    emptyElement: '<div></div>',
    
    /**
      Observe the content and render the item's contents.

      @observes content
    */
    contentDidChange: function()
    {
      
      var content = this.get('content');
      
      // Bail if there is no content.
      if(!content) return;

      var guid = content.get('guid');

      if(this.owner.isAuthorList)
      {
        
        var stat =  "<strong>Papers Published:</strong> " +Papercube.pluralizeString(" paper", content.get('paperCount')) + '<br/>';
        stat += "<strong>Number of Collaborators:</strong> " +Papercube.pluralizeString(" author",content.get('collaborators').length) + '<br/>';
        stat += "<strong>Author references:</strong> " +Papercube.pluralizeString(" other author",content.get('refAuthors').length) + '<br/>';
        stat += "<strong>Author is cited by:</strong> " +Papercube.pluralizeString(" other author",content.get('citeAuthors').length);
        

        // innerHTML is an array that will be joined at the end of the function.
        var innerHTML = [
          '<div class="title" fanType="author" guid="'+guid+'">',
            content.get('name'),
          '</div>',
          '<div class="bottom" fanType="author" guid="'+guid+'">',
            '<div class="stats" fanType="author" guid="'+guid+'">',
              stat,
            '</div>',
          '</div>'
        ];      
        
      }
      else
      {
      
        // innerHTML is an array that will be joined at the end of the function.
        var title = content.get('title');
        title = title.substr(0, 80) + ((title.length > 80) ? "&hellip;" : '') + ' ('+content.get('year')+')';
        var refStr = Papercube.pluralizeString(" ref", content.get("refCount"))+', '+Papercube.pluralizeString(" cite", content.get("citeCount"));
        var innerHTML = [
          '<div class="title" fanType="paper" guid="'+guid+'">',
            title,
          '</div>',
          '<div class="bottom" fanType="paper" guid="'+guid+'">',
            '<div class="authors" fanType="paper" guid="'+guid+'">',
                content.get('authorNames').join(', ').substr(0, 100),
            '</div>',
            '<div class="info" fanType="paper" guid="'+guid+'">',
              '<div class="left" fanType="paper" guid="'+guid+'">',
                refStr,
              '</div>',
            '</div>',
          '</div>'
        ];      
      }

      // Set the innerHTML of the view of the HTML that was just generated.
      this.set('innerHTML', innerHTML.join(''));    
    }.observes('content'),
    
    /** 
      Reset the class names.

      @param {DOM Event} evt The mouseExited event.
    */
    mouseExited: function(evt)
    {
      this.rootElement.childNodes[0].className = 'title';
      this.rootElement.childNodes[1].className = 'bottom';
    },

    /** 
      Add selected class names.

      @param {DOM Event} evt The mouseOver event.
    */
    mouseOver: function(evt)
    {
      this.rootElement.childNodes[0].className = 'title sel';
      this.rootElement.childNodes[1].className = 'bottom show';
    }
    
  }),
  
  /**
    Observe the content array and render the list.

    @observes content
  */
  contentDidChange: function()
  {
    var content = this.get('content');
    var childNodes = this.get('childNodes');

    for(var i=0; i<childNodes.length; i++)
    {
      this.removeChild(childNodes[i]);
    }

    for(var i=0; i<content.length; i++)
    {
      var view = this.subView.create({owner: this}) ; 
      view.set("content", content[i]);
      this.appendChild(view) ; 
    }
  }.observes('content')

});