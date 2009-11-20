// ==========================================================================
// Papercube.Author
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  Author model.

  @extends SC.Record
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.Author = SC.Record.extend(
/** @scope Papercube.Author.prototype */ {

  /**
    Cached paper count.
  
    @property {Integer}
  */
  _cached_paperCount: null,

  /**
    Computed property returning paper count.
  
    @property {Integer}
    @isReadOnly
  */
  paperCount: function()
  {
    if(!this._cached_paperCount)
    {
      var papers = this.get('papers');
      if(papers && papers.length)
      {
        this._cached_paperCount = papers.length;
      }
      else
      {
        this._cached_paperCount = 0;
      }
    }
    return this._cached_paperCount;
  }.property(),
  
  /**
    Computed property returning a author's name as different property, 'label'
  
    @property {String}
    @isReadOnly
  */  
  label: function()
  {
    return this.get('name');
  }.property()
  

}) ;
