// ==========================================================================
// Papercube.ViewController
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  This controller controls what view is currently being shown. There are 
  two dimensions, the type of object being visualized (ie. Authors or Papers) and 
  the type of view that we're showing (ie. CircleView or TreeView).

  @extends SC.Object
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
  @static
*/
Papercube.viewController = SC.Object.create(
/** @scope Papercube.viewController */ {

  /**
    Available viewing modes.
    
    Values ["Papers", "Authors"]
    
    @property {Array}
  */
  viewingModes: ["Papers", "Authors"],

  /**
    Available views for viewing modes.
    
    Values
    
    {
    	"Authors": ["Author Detail", "Papers", "Collaborators", "Author's Cites"],
    	"Papers": ["Paper Detail", "Circle View", "Tree Map", "Per Year", "Paper Graph"]
    },
    
    @property {Object}
  */
  viewChoices: 
  {
  	"Authors": ["Author Detail", "Papers", "Collaborators", "Author's Cites"],
  	"Papers": ["Paper Detail", "Circle View", "Tree Map", "Per Year", "Paper Graph"]
  },

  /**
    Default viewing mode is Papers.
    
    @property {String}
    @default 'Papers'
  */
  viewingMode: "Papers",
  
  /**
    Default viewChoice is 'Paper Detail'.
        
    @property {String}
    @default 'Paper Detail'
  */
  viewChoice: "Paper Detail",

  /**
    Default paperViewChoice is 'Paper Detail'.
        
    @property {String}
    @default 'Paper Detail'
  */
  paperViewChoice: 'Paper Detail',

  /**
    Default authorViewChoice is 'Author Detail'.
        
    @property {String}
    @default 'Author Detail'
  */
  authorViewChoice: 'Author Detail',
    
  /**
    Visibilty relation hash.
    
    Values 
    
  	{
  	  // Papers
      "Circle View": "circleView",
      "Per Year": "papersPerYearView",
  	  "Paper Detail": "paperStatView", 
  	  "Tree Map": "paperTreeView",
  	  "Paper Graph": "paperGraphView",

      // Authors
  	  "Papers": "authorPaperView", 
  	  "Collaborators": "collaboratorView",
  	  "Author's Cites": "citeRefView",
  	  "Author Detail": "authorStatView"
  	}
  	    
    @property {Object}
  */
  _viewVisibilities:
	{
	  // Papers
    "Circle View": "circleView",
    "Per Year": "papersPerYearView",
	  "Paper Detail": "paperStatView", 
	  "Tree Map": "paperTreeView",
	  "Paper Graph": "paperGraphView",

    // Authors
	  "Papers": "authorPaperView", 
	  "Collaborators": "collaboratorView",
	  "Author's Cites": "citeRefView",
	  "Author Detail": "authorStatView"
	},

  /**
    Available view directions.
    
    Values ["References", "Citations"]
    
    @property {Array}
  */
	viewDirectionChoices: ["References", "Citations"],
	
  /**
    Default view direction.
       
    @property {String}
    @default 'References'
  */
	viewDirection: "References",
	
  /**
    circleView's visibility. 
        
    Paper view.

    @property {Boolean}
    @default NO
  */
  circleViewShowing: NO,

  /**
    paperTreeView's visibility. 
        
    Paper view.

    @property {Boolean}
    @default NO
  */
  paperTreeViewShowing: NO,

  /**
    papersPerYearView's visibility.
        
    Paper view.

    @property {Boolean}
    @default NO
  */
  papersPerYearViewShowing: NO,

  /**
    paperStatView's visibility.
        
    Paper view.

    @property {Boolean}
    @default NO
  */
  paperStatViewShowing: NO,

  /**
    paperGraphView's visibility.
        
    Paper view.

    @property {Boolean}
    @default NO
  */
  paperGraphViewShowing: NO,
  
  /**
    authorPaperView's visibility.
        
    Author view.

    @property {Boolean}
    @default NO
  */
  authorPaperViewShowing: NO,

  /**
    authorStatView's visibility.
        
    Author view.

    @property {Boolean}
    @default NO
  */
  authorStatViewShowing: NO,

  /**
    collaboratorView's visibility.
        
    Author view.

    @property {Boolean}
    @default NO
  */
  collaboratorViewShowing: NO,
  
  /**
    citeRefView's visibility.

    Author view.

    @property {Boolean}
    @default NO
  */
  citeRefViewShowing: NO,
  
  /**
    The intro view visibility.
     
    @property {Boolean}
    @default NO
  */
  showIntroView: NO,
  
  /**
    Checkbox value. Default YES so that it never is shown again.

    @property {Boolean}
    @default YES
  */
  shouldNotShowAgain: YES,

  /**
    savedPanelView's visibility.
     
    @property {Boolean}
    @default NO
  */
  savedPanelViewShowing: NO,



  /**
    Now showing property for the tab view.

    @property {String}
    @default 'noContent'
  */
  nowShowing: 'noContent',

  /**
    Saved papers or authors. Saved documents are only per session at the moment.
    
    Saved in the format: 

    {type: "Paper", guid: 'PAPER-1233'}
    {type: "Author", guid: 'AUTHOR-1233'}

    @property {Array}
  */
  _saved: [],


  /**
    The guids of the items saved. This is kept around so that things aren't saved more than once.

    @property {Object}
  */
  _savedGuids: {},


  /**
    The content array for the savedPanelView.

    @property {Array}
  */
  savedContent: [],
  
  
  /**
    Show the video if the cookie is not written.
  */
  showVideo: function() {
    
    var nameEQ = 'papercubevideo=';
  	var ca = document.cookie.split(';');
  	var result = '';
  	for(var i=0;i < ca.length;i++) 
  	{
  		var c = ca[i]; 
  		while (c.charAt(0)==' ') c = c.substring(1,c.length);
  		if (c.indexOf(nameEQ) == 0) result = c.substring(nameEQ.length,c.length); 
  	}
  	
  	if(!result) {
      $('video').innerHTML = '<object width="640" height="360"><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="http://vimeo.com/moogaloop.swf?clip_id=5661651&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=eeeeee&amp;fullscreen=1" /><embed src="http://vimeo.com/moogaloop.swf?clip_id=5661651&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=eeeeee&amp;fullscreen=1" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="640" height="360"></embed></object>';
      this.set('showIntroView', YES);
    }
  },

  /**
    Hide the video and write the cookie if needed.
  */
  hideVideo: function() {
    this.set('showIntroView', NO);
    $('video').innerHTML = '';

    if(this.get('shouldNotShowAgain') === YES) {
    	document.cookie = "papercubevideo=1; expires="+(Date.now()+8640000000)+"; path=/";
    }
  }, 
  
  /**
    Show the savedPanelView. Look at the saved item guids and find the content from the store.
  */  
  showSaved: function()
  {
    var saved = this._saved;
    var savedContent = [];

    // Loop through and get the content or collect what guids need to be retrieved from the server.
    var neededAuthors = [];
    var neededPapers = [];

    for(var i=0; i<saved.length; i++)
    {

      var content = null;
      var guid = saved[i].guid;
      if(saved[i].type == 'Author')
      {
        content = Papercube.Author.find(saved[i].guid);
        if(!content && !saved[i].retrieving)
        {
          neededAuthors.push(guid);
          saved[i].retrieving = true;
        }
      }
      else
      {
        content = Papercube.Paper.find(guid);
        if(!content && !saved[i].retrieving)
        {
          neededPapers.push(guid);
          saved[i].retrieving = true;
        }
      }
      
      if(content)
      {
        savedContent.push(content);
      }
    }

    // Call the server to get papers and authors.
    var callBack = function() { this.doneRetrievingSaved(); }.bind(this);
    if(neededPapers.length > 0)
    {
  	  Papercube.searchController.set('showRequestSpinner', YES);
      Papercube.adaptor.getPaperDetails(neededPapers, callBack);
    }

    if(neededAuthors.length > 0)
    {
  	  Papercube.searchController.set('showRequestSpinner', YES);
      Papercube.adaptor.getAuthorDetails(neededAuthors, callBack);
    }

    // Set the content and show the panel.
    this.set('savedContent', savedContent);
    this.set('savedPanelShowing', YES);
  },

  /**
    Hide the savedPanelView. 
  */  
  hideSaved: function()
  {
    this.set('savedPanelShowing', NO);
  },
  
  /**
    Clear the saved items array and cookie.
  */  
  clearSaved: function()
  {
    this._saved = [];
    this._savedGuids = {};
    this.set('savedContent', []);
    this._eraseCookie();
  },
  
  /**
    Given the guid and contnet type of an item, save it.
  
    @param guid {Integer} The item's guid.
    @param type {string} The item's content type.
  */
  saveObject: function(guid, type)
  {
    // If the item hasn't been saved before, save it to the array and the cookie.
    if(!this._savedGuids[guid])
    {
      this._saved.push({type: type, guid: guid});
      this._savedGuids[guid] = 1;
      this._saveCookie();
    }
  },

  /**
    Read the saved items from the 'papercube' cookie. Save the items to the _saved and _savedGuids arrays.
    
    @returns {Boolean} Returns NO if there is an error.
  */
  readSavedItemsCookie: function() 
  {
    var nameEQ = 'papercube=';
  	var ca = document.cookie.split(';');
  	var result = '';
  	for(var i=0;i < ca.length;i++) 
  	{
  		var c = ca[i]; 
  		while (c.charAt(0)==' ') c = c.substring(1,c.length);
  		if (c.indexOf(nameEQ) == 0) result = c.substring(nameEQ.length,c.length); 
  	}
  	
  	if(result == '') return NO;
  	
  	var saved = eval(unescape(result));

    this._saved = saved;
  },
  
  /*
    Write the _saved array to the 'papercube' cookie.
  */
  _saveCookie: function() 
  {
  	document.cookie = "papercube="+escape(this._saved.toJSON())+"; expires="+(Date.now()+8640000000)+"; path=/";
  },

  /*
    Erase the 'papercube' cookie.
  */
  _eraseCookie: function() 
  {
  	document.cookie = "papercube=; expires=-1; path=/";
  },
  
  /*
    Call back function when the saved items have been returned from the server. 
    
    If the saved panel is showing, then update it with the new information.
  */
  doneRetrievingSaved: function()
  {
    Papercube.searchController.set('showRequestSpinner', NO);
    if(this.get('savedPanelShowing'))
    {
      this.showSaved();
    }
  },
  
  /**
    History array.

    Each item is saved in the following format:
    
    {
      guid: guid, 
      type: type, 
      label: label, 
      viewChoice: this.get('viewChoice'), 
      viewDirection: this.get('viewDirection'), 
      viewingMode: this.get('viewingMode') 
    }
    
    @property {Array}
  */
  _history: [],

  /**
    The current index into the history array.
    
    @property {Integer}
  */
  _historyIdx: -1,

  /**
  
    The timer for the back button.

    @property
    @type {SC.Timer}
  */
  _timer: null,

  /**
    Add to the history.
  
    @param guid {Integer} The item's guid.
    @param type {string} The item's content type.
    @param label {string} The label of the item.
  */
  addToHistory: function(guid, type, label)
  {
    var history =  this._history.splice(0, this._historyIdx+1);

    var thisHistory = 
      {
        guid: guid, 
        type: type, 
        label: label, 
        viewChoice: this.get('viewChoice'), 
        viewDirection: this.get('viewDirection'), 
        viewingMode: this.get('viewingMode') 
      };
      
      history.push(thisHistory);
      this._history = history;
      this._historyIdx++;
      this._setHistoryLocation();
  },
    
  /** 
    Show an item in the history based on the index passed in. Read in the
    history item and set back all the parameters saved.
    
    @param idx {Integer} The index to go to.
  */
  _showHistoryItem: function(idx)
  {
    var thisHistory = this._history[idx];
    this.setViewingMode(thisHistory.viewingMode, YES);
    this.setViewChoice(thisHistory.viewChoice, YES);
    this.setViewDirection(thisHistory.viewDirection, YES);
    this.setContentToViewFromGUID(thisHistory.guid, thisHistory.type, YES);
    this._setHistoryLocation();
  },

  _lastHash: '',
  
  parseHash: function() {
    var ret = NO;
    if(window.location.hash !== '') {
      var components = window.location.hash.substr(1).split('/');

      if(components.length === 5) {
        
        var isAuthor = components[0] == 'Authors';
        var isPaper = components[0] == 'Papers';
        
        if(isAuthor) {
          this.setViewingMode(components[0]);
        }
        
        var viewChoice = components[1].replace('_', ' ');
        if(isAuthor && 
                this.viewChoices.Authors.indexOf(viewChoice)) {
          this.setViewChoice(viewChoice);
        } else if(isPaper && 
                this.viewChoices.Papers.indexOf(viewChoice)) {
          this.setViewChoice(viewChoice);
        }
        
        if(components[2] == '1') {
          this.setViewDirection('Citations');
        }
        
        var guid = (isPaper) ? 'PAPER-%@'.fmt(components[3]) 
                             : 'AUTHOR-%@'.fmt(components[3]);

        this._lastHash = window.location.hash;
        if(isPaper) {
          Papercube.adaptor.getPaperDetails(guid, 
              function(guid) { 
                this.viewPaper(guid); 
              }.bind(this, guid));
        } else if(isAuthor) {
          Papercube.adaptor.getAuthorDetails(guid, 
              function(guid) { 
                this.viewAuthor(guid); 
              }.bind(this, guid));
        }
        ret = YES;
      } else {
        window.location.hash = '';
      }
    }
    setInterval('Papercube.viewController.checkLocation()', 1000);
    return ret;
  },
  
  /** Set the location. */
  _setHistoryLocation: function() {
    var idx = this._historyIdx;
    var item = this._history[idx];

    window.location.hash = this._lastHash = 
          "%@/%@/%@/%@/%@".fmt(
                  item.viewingMode, 
                  item.viewChoice.replace(' ', '_'), 
                  (item.viewDirection == 'References') ? '0' : '1', 
                  (item.type == 'Paper') 
                      ? item.guid.substr(6) : item.guid.substr(7), 
                  idx
                );

    if(item) {
      document.title = 'PaperCube - ' +  
              item.label.substr(0, 40) +' - '+ 
              item.viewChoice + ' - ' + item.viewingMode;
    }
  },
  
  /** Check for location change and then chang it.*/
  checkLocation: function() {
    if(this._lastHash != window.location.hash) {
      var hash = window.location.hash.split('/');
      var idx = parseInt(hash[hash.length-1],10);
      if(idx !== this._historyIdx) {
        this._historyIdx = idx;
        this._showHistoryItem(idx);
      }
    }
  },
  
  /**
    Load default view.
  */
  showDefaultView: function()
  {
    this.setViewChoice(this.viewChoice, NO);
  },
  
  /** 
    Change viewing direction.

    @param direction {string} the view direction.
    @param fromHistory {boolean} True if the view direction is set from a history action.
  */
  setViewDirection: function(direction, fromHistory)
  {
    if(this.paperForView && !fromHistory)
    {
      this.addToHistory(this.paperForView.get('guid'),this.paperForView.get('type'), this.paperForView.get('label'));
    }
    this.set('viewDirection', direction);
  },
  
  /** 
    Change views.

    @param viewChoice {string} the view choice.
    @param fromHistory {boolean} True if the view direction is set from a history action.
    
    @returns {Boolean} Returns NO if there is a error.
  */
	setViewChoice: function(viewChoice, fromHistory)
	{

	  // You are trying to show a view that does not exist, abort.
    if(this.viewChoices[this.viewingMode].indexOf(viewChoice) == -1) 
    {
      console.log("error: '" + viewChoice +"' is not a valid view choice.");
      return NO; 
    }
    
    // Hide all views except for the one that should be visible.
  	var visibilities = this._viewVisibilities;
    for(var key in visibilities)
    {
      this.setIfChanged(visibilities[key]+"Showing", (key == viewChoice));
      // console.log("hiding " + visibilities[key]);
    }
    // console.log("showing " +viewKey);
    // this.set(viewKey+"Showing", YES);
	  this.set("viewChoice", viewChoice);
	  
	  this.set('nowShowing', this._viewVisibilities[viewChoice]);
	  
	  // Cache the last view depending on type.
    if(this.get('viewingMode') == 'Papers')
    {
      this.set("paperViewChoice", viewChoice);
    }
    if(this.get('viewingMode') == 'Authors')
    {
      this.set("authorViewChoice", viewChoice);
    }
    if(this.contentForView && !fromHistory)
    {
      this.addToHistory(this.contentForView.get('guid'),this.contentForView.get('type'), this.contentForView.get('label'));
    }
	},
	
  /** 
    Set the viewing mode.

    @param viewMode {string} the view mode.
    @param fromHistory {boolean} True if the view direction is set from a history action.

    @returns {Boolean} Returns NO if there is a error.
  */
	setViewingMode: function(viewingMode, fromHistory)
	{
	  // You are trying to show a view that does not exist, abort.
    if(this.viewingModes.indexOf(viewingMode) == -1) 
    {
      console.log("error: '" + viewingMode +"' is not a valid view mode.");
      return NO; 
    }
    
	  this.set("viewingMode", viewingMode);
    if(this.contentForView && !fromHistory)
    {
      this.addToHistory(this.contentForView.get('guid'),this.contentForView.get('type'), this.contentForView.get('label'));
    }
    
    if(this.viewChoices[viewingMode].indexOf(this.get('viewChoice')) == -1) 
    {
      this.setViewChoice(this.viewChoices[viewingMode][0]);
    }
	},
	
	/**
	  This is the content that you set that your views listen to.

    @property {Paper}
	*/
	paperForView: null,

	/**
    This is the content that you set that your views listen to.

    @property {Author}
	*/
	authorForView: null,
	
	/**
    This is the type agnostic param that is used for saving.

    @property {Record}
	*/
  contentForView: null,
	
	/**
    This is the type agnostic param that is used for saving.
    True if there is no content set yet. If YES, the empty view is shown.

    @property {Boolean} 
	*/
	noContentForView: YES,

  /**
    If the contentForView is not null, set noContentForView to YES.

    @observes contentForView
  */
	noContentForViewDidChange: function()
	{
	  this.set('noContentForView', !this.get('contentForView'));
	}.observes('contentForView'),

	/**
    Collect the guids needed to be retrieved for a given view.

    @param rel {string} The paper guid relation array. 
    @param guids {Array} Array of needed guids. 

    @returns {Array} {object} Returns a hash containing papers that exist and guids that need to be retrieved.
	*/
  collectNeededPaperGUIDs: function(rel, guids)
  {
    if(!guids) guids = [];
    var papers = [];
    for(var i=0; i<rel.length; i++)
    {
      var paper = Papercube.Paper.find(rel[i]);
      if(!paper)
      {
        guids.push(rel[i]);
      }
      else
      {
        papers.push(paper);
      }
    }

    return {papers: papers, guids: guids};
  },

  /** 
    Set the content for the view.

    @param content {Record} The content object. Either an Author or Paper.
    @param fromHistory {boolean} True if the view direction is set from a history action.
  */
	setContentToView: function(content, fromHistory)
	{
	  if(content)
    {
  	  // Push on the history stack.
      if(!fromHistory)
      {
        this.addToHistory(content.get('guid'), content.get('type'), content.get('label'));
      }

      this.set("contentForView", content);
      
      if(content.get('type') == 'Author')
      {
        this.set('authorForView', content);
      }
      if(content.get('type') == 'Paper')
      {
        this.set('paperForView', content);
      }
    }
    Papercube.canvasController.hideFan();  
	},

  /** 
    Set the content for the view form a guid.

    @param guid {string} The guid of the content that you want to pass to setContentToView.
    @param type {string} The type of the content. Either 'Author' or 'Paper'.
    @param fromHistory {boolean} True if the view direction is set from a history action.
  */
	setContentToViewFromGUID: function(guid, type, fromHistory)
	{
	  var content = null;

    // Get the content from the appropriate source.
    if(type == "Paper")
    {
      content = Papercube.Paper.find(guid);
    }
    if(type == "Author")
    {
      content = Papercube.Author.find(guid);
    }

    // Set the content!
	  if(content)
	  {
	    this.setContentToView(content, fromHistory);
	  }
    Papercube.canvasController.hideFan();  
	},
	
  /** 
    View an author.

    @param guid {string} The guid of the content that you want to pass to setContentToView.
  */
	viewAuthor: function(guid)
	{
	  var author = Papercube.Author.find(guid);
	  if(author)
	  {
  	  this.set("viewingMode", 'Authors');
	    this.setViewChoice(this.authorViewChoice, NO);
      this.setContentToView(author, NO);
	  }
	},

  /** 
    View an paper.

    @param guid {string} The guid of the content that you want to pass to setContentToView.
  */
	viewPaper: function(guid)
	{
	  var paper = Papercube.Paper.find(guid);
	  if(paper)
	  {
  	  this.set("viewingMode", 'Papers');
	    this.setViewChoice(this.paperViewChoice, NO);
      this.setContentToView(paper, NO);
	  }
	}
	
}) ;
