// ==========================================================================
// Papercube.Paper
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  Paper model

  @extends SC.Record
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.Paper = SC.Record.extend(
/** @scope Papercube.Paper.prototype */ {

  /**
    The max level explored for refs.
  
    @property {Integer}
    @default 0
  */
  maxRefLevel: 0,
  
  /**
    The max level explored for citations.
  
    @property {Integer}
    @default 0
  */
  maxCiteLevel: 0,
 
  /**
    Flag that shows that all data has been retrieved from the server.
  
    @property {Boolean}
    @default NO
  */
//  allDataRetrieved: NO,


  /**
    Cached citation count.
  
    @property {Integer}
  */
  _cached_citeCount: null,

  /**
    Computed property returning citation count.
  
    @property {Integer}
    @isReadOnly
  */
  citeCount: function()
  {
    if(!this._cached_citeCount)
    {
      var cites = this.get('citations');
      if(cites && cites.length)
      {
        this._cached_citeCount = cites.length;
      }
      else
      {
        this._cached_citeCount = 0;
      }
    }
    return this._cached_citeCount;
  }.property(),

  /**
    Cached reference count.
  
    @property {Integer}
  */
  _cached_refCount: null,

  /**
    Computed property returning reference count.
  
    @property {Integer}
    @isReadOnly
  */
  refCount: function()
  {
    if(!this._cached_refCount)
    {
      var refs = this.get('references');
      if(refs && refs.length)
      {
        this._cached_refCount = refs.length;
      }
      else
      {
        this._cached_refCount = 0;
      }
    }
    return this._cached_refCount;
  }.property(),

  /**
    Cached author count.
  
    @property {Integer}
  */
  _cached_authorCount: null,

  /**
    Computed property returning author count.
  
    @property {Integer}
    @isReadOnly
  */
  authorCount: function()
  {
    if(!this._cached_authorCount)
    {
      var a = this.get('authors');
      if(a && a.length)
      {
        this._cached_authorCount = a.length;
      }
      else
      {
        this._cached_authorCount = 0;
      }
    }
    return this._cached_authorCount;
  }.property(),
  
  /**
    Cached formatted reference count string.
  
    @property {String}
  */
  _cached_formattedReferenceCount: null,

  /**
    Computed property returning formatted reference count string.
  
    @property {String}
    @isReadOnly
  */
  formattedReferenceCount: function()
  {
    if(!this._cached_formattedReferenceCount)
    {
      this._cached_formattedReferenceCount = "[" + Papercube.pluralizeString(" ref", this.get('refCount'))+"]";
    }
    return this._cached_formattedReferenceCount;
  }.property(),

  /**
    Cached formatted citation count string.
  
    @property {String}
  */
  _cached_formattedCitationCount: null,

  /**
    Computed property returning formatted citation count string.
  
    @property {String}
    @isReadOnly
  */
  formattedCitationCount: function()
  {
    if(!this._cached_formattedCitationCount)
    {
      this._cached_formattedCitationCount = "[" + Papercube.pluralizeString(" cite", this.get('citeCount'))+"]";
    }
    return this._cached_formattedCitationCount;
  }.property(),
  
  /**
    Cached author names array.
  
    @property {Array}
  */
  _cached_authorNames: null,

  /**
    Computed property returning a paper's authors names in an array.
  
    @property {String}
    @isReadOnly
  */
  authorNames: function()
  {
    if(!this._cached_authorNames)
    {
      var authors = [];
      var auths = this.get("authors");

      for(var i=0; i<auths.length; i++)
      {
        authors.push(auths[i].name);
      }
      if(authors.length == 0)
      {
        authors = ["unknown"];
      }
      this._cached_authorNames = authors;
    }
    return this._cached_authorNames;
  }.property(),
  
  /**
    Computed property returning a paper's title as different property, 'label'
  
    @property {String}
    @isReadOnly
  */  
  label: function()
  {
    return this.get('title');
  }.property(),
  
  /**
    Computed property generating the CiteSeer URL.
  
    @property {String}
    @isReadOnly
  */  
  url: function()
  {
    return 'http://citeseer.ist.psu.edu/'+this.get('guid').split('-')[1]+'.html';
  }.property()

}) ;
