// ==========================================================================
// Papercube.SearchController
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  Controls the search of data. Interfaces with the server.

  @extends SC.Object
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
  @static
*/
Papercube.searchController = SC.Object.create(
/** @scope Papercube.searchController */ {

  /**
    The current viewing mode is specified in the viewController.

    @property {String}
    @binding "Papercube.viewController.viewingMode"
  */
  viewingModeBinding: "Papercube.viewController.viewingMode",

  /**
    boolean that is bound to show the request spinner. 

    @property {Boolean}
    @default NO
  */
  showRequestSpinner: NO,
  
  /**
    These are the valid search headings. 
    
    Depending on the view mode, you switch the heading.

    Values
    
    {
      "Authors": "Search for authors",
      "Papers": "Search for papers"
    }

    @property {Object}
  */
  _searchHeadings: 
  {
    "Authors": "Search for authors",
    "Papers": "Search for papers"
  },
  
  /**
    Currently selected search heading. 
    
    Defaults to Papers.

    @property {String}
    @default ''
  */
  searchHeading: "",
  
  /**
    These are the search keys.

    Values 
    [
      {order: 1, name: "Paper Title", key: "title"},
      {order: 2, name: "Paper Abstract", key: "abstract"},
      {order: 3, name: "Paper Publication Year", key: "year"}, 
      {order: 4, name: "Paper Publisher", key: "publisher"}, 
      {order: 5, name: "Author Name", key: "name"}, 
      {order: 6, name: "Author Affiliation", key: "affiliation"}, 
      {order: 7, name: "Author Address", key: "address"}
    ]
    
    @property {Array}
  */
  searchKeys: 
  [
    {order: 1, name: "Paper Title", key: "title"},
    {order: 2, name: "Paper Abstract", key: "abstract"},
    {order: 2, name: "Paper Subject", key: "subject"},
    {order: 3, name: "Paper Publication Year", key: "pubyear"}, 
    {order: 4, name: "Author Name", key: "name"}, 
  ],
  
  /**
    Internal search count for synchronization.

    @property {Integer}
    @default 0
  */
  _sc: 0,

  /**
    Start for paging. 
    
    @property {Integer}
    @default 0
  */
  _searchStart: 0,
  
  /**
    Limit for paging. 
    
    @property {Integer}
    @default 50
  */
  _searchLimit: 50,
  
  /**
    Show more button visiblity. Only visible when there are results. 
    
    @property {Boolean}
    @default NO
  */
  showMoreAllowed: NO,

  /**
    The current searchKey.

    @property {String}
    @default ''
  */  
  searchKey: '',

  /**
    The current searchValue.

    @property {String}
    @default ''
  */  
  searchValue: '',
  
  /**
    The search count is a string that is displayed at the bottom of the search window.

    @property {String}
    @default ''
  */  
  searchCount: '',
  
  /**
    The data retrieved from a search. This property is used by the searchResultsCollectionView.

    @property {String}
  */  
  searchResults: null,
  
  /**
    Observes the viewingMode from the viewingController and switches search options based on it.

    @observes viewingMode
  */
  viewingModeDidChange: function()
  {
    var viewingMode = this.get('viewingMode');
    
    // Set the desired search heading.
    switch(viewingMode)
    {
      case "Authors":
        this.set('searchHeading', this._searchHeadings["Authors"]);
        break;
      default:
        this.set('searchHeading', this._searchHeadings["Papers"]);
        break;
    }
    
    this.set("searchResults", []);
    this.set("searchCounnt", 0);
    this.performSearch();
    
  }.observes('viewingMode'),
	
  /**
    Observe the selection of the search results. Call the viewController when it changes.

    @observes selection
  */
	selectionDidChange: function()
	{
	  var sel = this.get("selection");
	  if(sel && sel[0])
	  {
	    Papercube.viewController.setContentToView(sel[0]);
	  }
	}.observes('selection'),
  
  /**
    Perform the search operation.
  */
	performSearch: function()
	{
    
	  // Get the searchKey and searchValue specified in the search form.
	  var searchKey = this.get("searchKey");
	  var searchValue = this.get("searchValue");
    
    // Bail if there is no value.
    if(searchValue == '') return;
    
    // Hide the fan and show the request spinner.
    Papercube.canvasController.hideFan();  
	  Papercube.searchController.set('showRequestSpinner', YES);

    // Increment the search count to allow for easy search result synchronization.
	  this._sc++;
	  
	  // Set the viewController's content to null since a new search is being processed.
	  Papercube.viewController.setContentToView(null);
	  
	  // Make sure that there is a search key.
    if(!searchKey)
    {
      searchKey = 'title';
    }
    this._searchStart = 0;
    
    // Branch the search on the viewingMode.
	  if(Papercube.viewController.get('viewingMode') == 'Papers')
	  {
	    Papercube.adaptor.searchPapers(searchKey, searchValue, this._sc, 0, this._searchLimit);
	  }
	  else
	  {
	    Papercube.adaptor.searchAuthors(searchKey, searchValue, this._sc, 0, this._searchLimit);
	  }
	},

  /**
    Without starting a new search, increment the start index and get more search results. 
  */
	showMoreFromSearch: function()
	{
    Papercube.canvasController.hideFan();  

	  Papercube.searchController.set('showRequestSpinner', YES);
    
	  // Get the searchKey and searchValue specified in the search form.
	  var searchKey = this.get("searchKey");
	  var searchValue = this.get("searchValue");
	  
	  // Make sure that there is a search key.
    if(!searchKey)
    {
      searchKey = 'title';
    }
    
    this._searchStart += this._searchLimit;
    
    // Branch the search on the viewingMode.
	  if(Papercube.viewController.get('viewingMode') == 'Papers')
	  {
	    Papercube.adaptor.searchPapers(searchKey, searchValue, this._sc, this._searchStart, this._searchLimit);
	  }
	  else
	  {
	    Papercube.adaptor.searchAuthors(searchKey, searchValue, this._sc, this._searchStart, this._searchLimit);
	  }
	},
  
  /** 
    Display the results from the server.
	*/
	displayResults: function()
	{
    // Set the number of items returned in the search.
	  if(Papercube.viewController.get('viewingMode') == 'Papers')
	  {
	    var results = Papercube.Paper.findAll({sc: this._sc});
	    this.set("searchCount", Papercube.pluralizeString(' Paper', results.length));
	  }
	  else
	  {
	    var results = Papercube.Author.findAll({sc: this._sc});
	    this.set("searchCount", Papercube.pluralizeString(' Author', results.length));
	  }
	  
	  // Set the results to the searchResults property. 
    this.set('showMoreAllowed', (results.length != 0));
	  this.set("searchResults", results);
    Papercube.searchController.set('showRequestSpinner', NO);
	},
	
	

  /**
    Initialiation function.
  */
  init: function()
  {
    sc_super();
    
    // Set papers as the default heading.
    this.set('searchHeading', this._searchHeadings["Papers"]);
  }

}) ;
