// ==========================================================================
// Papercube.AuthorStatView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');
require('views/paperstatlist');

/** @class

  This is a more classical web-based view on an author's citation and references.

  @extends SC.View
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.AuthorStatView = SC.View.extend(
/** @scope Papercube.AuthorStatView.prototype */ {

  /**
    Collaborator sort order binding.
  
    @property {String}
    @binding 'Papercube.authorStatController.collaboratorSortOrder'
  */
  collaboratorSortOrderBinding: 'Papercube.authorStatController.collaboratorSortOrder',

  /**
    Paper sort order binding.
  
    @property {String}
    @binding 'Papercube.authorStatController.paperSortOrder'
  */
  paperSortOrderBinding: 'Papercube.authorStatController.paperSortOrder',

  /**
    Reference author sort order binding.
  
    @property {String}
    @binding 'Papercube.authorStatController.refAuthorSortOrder'
  */
  refAuthorSortOrderBinding: 'Papercube.authorStatController.refAuthorSortOrder',

  /**
    Citation author sort order binding.
  
    @property {String}
    @binding 'Papercube.authorStatController.citeAuthorSortOrder'
  */
  citeAuthorSortOrderBinding: 'Papercube.authorStatController.citeAuthorSortOrder',


  /**
    Outlets for author stat view.
  
    [
      'nameLabel',
      'collaboratorCount', 
      'paperCount', 
      'refAuthorCount', 
      'citeAuthorCount',
      'collaboratorList', 
      'paperList',
      'refAuthorList', 
      'citeAuthorList',
      'papersPerYear', 
      'graph', 
      'stats'
    ]

  */
  outlets:  [
              'nameLabel',
              'collaboratorCount', 
              'paperCount', 
              'refAuthorCount', 
              'citeAuthorCount',
              'collaboratorList', 
              'paperList',
              'refAuthorList', 
              'citeAuthorList',
              'papersPerYear', 
              'graph', 
              'stats'
            ],

  /**
    Name label. Bound to the '.name?' element.

    @outlet {DOM Element} '.name?'
  */
  nameLabel: '.name?',

  /**
    Collaborator count. Bound to the '.collaborator-count?' element.

    @outlet {DOM Element} '.collaborator-count?' 
  */
  collaboratorCount: '.collaborator-count?',

  /**
    Paper count. Bound to the '.paper-count?' element.

    @outlet {DOM Element} '.paper-count?'
  */
  paperCount: '.paper-count?',

  /**
    refAuthor count. Bound to the '.refauthor-count?' element.

    @outlet {DOM Element} '.refauthor-count?'
  */
  refAuthorCount: '.refauthor-count?',

  /**
    refAuthor count. Bound to the '.citeauthor-count?' element.

    @outlet {DOM Element} '.citeauthor-count?'
  */
  citeAuthorCount: '.citeauthor-count?',

  /**
    papersPerYear graph box. Bound to the '.papersperyear?' element.

    @outlet {DOM Element} '.papersperyear?'
  */
  papersPerYear: '.papersperyear?',

  /**
    papersPerYear graph itself. Bound to the '.data?' element.

    @outlet {DOM Element} '.data?'
  */
  graph: '.data?',

  /**
    The container for the stat view boxes. Is set to display none by default so that the boxes don't show when there isn't any content. 
    Bound to the '.stats?' element.

    @outlet {DOM Element} '.stats?'
  */
  stats: '.stats?',
  
  /**
    paperList view. Shows the author's papers. Bound to the '.paper-list?' element.

    @outlet {Papercube.PaperstatListView} '.paper-list?'
  */
  paperList: Papercube.PaperstatListView.outletFor('.paper-list?'),

  /**
    collaboratorList view. Shows the author's collaborators. Bound to the '.collaborator-list?' element.

    @outlet {Papercube.PaperstatListView} '.collaborator-list?'
  */
  collaboratorList: Papercube.PaperstatListView.extend({isAuthorList: YES}).outletFor('.collaborator-list?'),

  /**
    refAuthorList view. Shows the authors that the author has referenced. Bound to the '.refauthor-list?' element.

    @outlet {Papercube.PaperstatListView} '.refauthor-list?'
  */
  refAuthorList: Papercube.PaperstatListView.extend({isAuthorList: YES}).outletFor('.refauthor-list?'),

  /**
    citeAuthorList view. Shows the authors that have cited the author. Bound to the '.refauthor-list?' element.

    @outlet {Papercube.PaperstatListView} '.citeauthor-list?'
  */
  citeAuthorList: Papercube.PaperstatListView.extend({isAuthorList: YES}).outletFor('.citeauthor-list?'),
  
  /**
    The guid of the last clicked paper or author.
    
    @property {String}
  */
  _mouseDownGUID: null,


  /**
    Reset when new content is set. Is set to YES once the call for the server for additional author data is initiated.
    
    @property {Boolean}
    @default NO
  */
  _calledForAuthors: NO,

  /**
    Reset when new content is set. Is set to YES once the call for the server for additional paper data is initiated.
        
    @property {Boolean}
    @default NO
  */
  _calledForPapers: NO,
  
  /**
    Re-render the view when the content, sort order changes, or view is set to be visible.

    @observes content
    @observes isVisible
    @observes paperSortOrder
    @observes collaboratorSortOrder
    @observes refAuthorSortOrder
    @observes citeAuthorSortOrder
  */
  contentDidChange: function()
  {
    
    var content = this.get('content');

    // If there is no content or if you're not visible, bail.
    if(!this.get("isVisible") || !content) return;
        
    // Show the stats div.    
    this.stats.style.display = '';

    // If there is a new content, reset the server call variables, cache the content, and clear the graph.
    if(!this._cachedContent || this._cachedContent.get('guid') != content.get('guid'))
    {
      this.papersPerYear.className = 'papersperyear';
      this.papersPerYear.className = 'papersperyear show';
      this._cachedContent = content;
      this._calledForAuthors = NO;
      this._calledForPapers = NO;
      this._clearGraph();
    }
    
    var callBack = function() { this.contentDidChange(); }.bind(this);
    
    // Get authors for collabs, refs, and cites.
    if(!this._calledForAuthors)
    {
      var authGuids = [];
      authGuids = authGuids.concat(this._collectAuthors(content.get('collaborators')));
      authGuids = authGuids.concat(this._collectAuthors(content.get('refAuthors')));
      authGuids = authGuids.concat(this._collectAuthors(content.get('citeAuthors')));
    
      if(authGuids.length > 0)
      {
        Papercube.adaptor.getAuthorDetails(authGuids, callBack);
      }
      this._calledForAuthors = YES;
    }
    
    // Render the lists.
    this._renderList('collaborators');
    this._renderList('refAuthors');
    this._renderList('citeAuthors');

    // Get papers for the author.
    var shouldLoadPapers = NO;
    if(!this._calledForPapers)
    {
      //console.log('called for papers');
      
      var paperGuids = [];
      var papers = content.get('papers');
      for(var i=0; i<papers.length; i++)
      {
        var p = Papercube.Paper.find(papers[i]);
        if(!p)
        {
          paperGuids.push(papers[i]);
        }
      }
    
      var shouldLoadPapers = (paperGuids.length > 0);
      
      if(shouldLoadPapers)
      {
        Papercube.adaptor.getPaperDetails(paperGuids, callBack);
      }

      this._calledForPapers = YES;
    }

    if(!shouldLoadPapers)  
      this._renderGraph();
    
    // Render paper list.
    this._renderList('papers');
    
    // Reset zoom value.
    Papercube.canvasController.set("zoomValueMax", 1);
    Papercube.canvasController.set("zoomStep", 1);
    
    // Set the title and year.
    this.nameLabel.innerHTML = content.get('name').escapeHTML();
    
  }.observes('content', 'isVisible', 'paperSortOrder', 'collaboratorSortOrder', 'refAuthorSortOrder', 'citeAuthorSortOrder'),

  /**
    Create the request and call the server. 
  
    @param auths {Array} The author relation array.
    
    @returns {Array} Returns a list of guids that are not in the data store.
  */
  _collectAuthors: function(auths)
  {
    var authGuids = [];
    for(var i=0; i<auths.length; i++)
    {
      var a = Papercube.Author.find(auths[i][0]);
      if(!a)
      {
        authGuids.push(auths[i][0]);
      }
    }
    return authGuids;
  },

  /**
    Render a list of papers or authors.
  
    @param type {string} The type of the list shown. Either 'collaborators', 'papers', 'refAuthors', or 'citeAuthors'.
    
    @returns {Boolean} Returns NO if there is no content.
  */
  _renderList: function(type)
  {
    var content = this.get('content');
    if(!content)
    {
      if(type == 'collaborators')
      {
         this.collaboratorList.set("content", []);
      }
      else if(type == "papers")
      {
        this.paperList.set("content", []);
      }
      else if(type == "refAuthors")
      {
        this.refAuthorList.set("content", []);
      }
      else if(type == "citeAuthors")
      {
        this.citeAuthorList.set("content", []);
      }
      return NO;
    }
    
    // If the type is papers, get the papers, sort them, then set the content.
    if(type == 'papers')
    {
    
      // Get the papers to sort.
      var rel = content.get('papers');
    
      var papers = [];
      for(var i=0; i<rel.length; i++)
      {
        var paper = Papercube.Paper.find(rel[i]);
        if(paper)
        {
          papers.push(paper);
        }
      }
      
      var sortType = this.get('paperSortOrder');

      // Sort the array.
      // 'Title', 'Year', 'References', 'Citations', 'Num Authors'
      switch(sortType)
      {
        case 'Title':
          papers.sort(function(a, b) 
          { 
            var aTitle = a._attributes.title.toLowerCase();
            var bTitle = b._attributes.title.toLowerCase();
            if(aTitle == bTitle) return 0;
            if(aTitle < bTitle) return -1;
            return 1;
          });
          break;
        case 'Date':
          papers.sort(function(a, b) 
          { 
            var aDate = a.get('year'); 
            var bDate = b.get('year');
            if(aDate == bDate) 
              return a._attributes.title.toLowerCase() < b._attributes.title.toLowerCase();        
            if(aDate > bDate) return -1;
            return 1;
          });
          break;
        case 'Num Refs':
        case 'Num Cites':
        case 'Num Authors':
          var sortKey = (sortType == 'Num Refs') ? 'refCount' : (sortType == 'Num Cites') ? 'citeCount' : 'authorCount';
          papers.sort(function(a, b) 
          { 
            var aCnt = a.get(sortKey);
            var bCnt = b.get(sortKey);
            if(aCnt == bCnt) return 0;
            if(aCnt > bCnt) return -1;
            return 1;
          });
          break;
      }
 
      this.paperCount.innerHTML = ' (' + papers.length+')';
      this.paperList.set("content", papers);
      this.paperList.setClassName('show', (papers.length != 0));
    }

    // If the type is authors, get the authors, sort them, then set the content.
    else
    {
      
      // Get the authors to be sorted.
      var auths = content.get(type);
    
      var authors = [];
      for(var i=0; i<auths.length; i++)
      {
        var author = Papercube.Author.find(auths[i][0]);
        if(author)
        {
          authors.push(author);
        }
      }
      
      // Pick the sort type to read from.
      var sortType = (type == "collaborators") ? this.get('collaboratorSortOrder') : (type == "refAuthors") ? this.get('refAuthorSortOrder') : this.get("citeAuthorSortOrder");
      
      // Sort the array.
      // 'Title', 'Year', 'References', 'Citations', 'Num Authors'
      switch(sortType)
      {
        case 'Name':
          authors.sort(function(a, b) 
          { 
            var aName = a._attributes.name.toLowerCase();
            var bName = b._attributes.name.toLowerCase();
            if(aName == bName) return 0;
            if(aName < bName) return -1;
            return 1;
          });
          break;
        case 'Num Papers':
          authors.sort(function(a, b) 
          { 
            var aCnt = a.get('paperCount');
            var bCnt = b.get('paperCount');
            if(aCnt == bCnt) return 0;
            if(aCnt > bCnt) return -1;
            return 1;
          });
          break;
        case 'Num Collabs':
        case 'Cite Count':
          var sortKey = (sortType == 'Num Collabs') ? 'collaborators' : 'citeAuthors';
          authors.sort(function(a, b) 
          { 
            var aCnt = a.get(sortKey).length;
            var bCnt = b.get(sortKey).length;
            if(aCnt == bCnt) return 0;
            if(aCnt > bCnt) return -1;
            return 1;
          });
          break;
      }
      
      // Set the content to the appropriate list and count label.
      if(type == "collaborators")
      {
        this.collaboratorCount.innerHTML = ' (' + authors.length+')';
        this.collaboratorList.set("content", authors);
        this.collaboratorList.setClassName('show', (authors.length != 0));
        
      }
      else if(type == "refAuthors")
      {
        this.refAuthorCount.innerHTML = ' (' + authors.length+')';
        this.refAuthorList.set("content", authors);
        this.refAuthorList.setClassName('show', (authors.length != 0));
        
      }
      else
      {
        this.citeAuthorCount.innerHTML = ' (' + authors.length+')';
        this.citeAuthorList.set("content", authors);
        this.citeAuthorList.setClassName('show', (authors.length != 0));
      }
    }
  },
  
  /**
    Render the graph.
  
  */
  _renderGraph: function()
  {
    // Clear the graph.
    this._clearGraph();
    var rel = this._cachedContent.get('papers');
    var perYearCountHash = {};
    var numYears = 0;
    var maxPapers = 0;

    // Loop through the relations and collect the items by year.
    for(var i=0; i<rel.length; i++)
    {
      var paper = Papercube.Paper.find(rel[i]);
      var yr = '?';
      if(paper)
        yr = paper.get('year');
        
      if(!perYearCountHash[yr])
      {
        numYears ++;
        perYearCountHash[yr] = 0;
      }
      perYearCountHash[yr]++;
      if(perYearCountHash[yr] > maxPapers)
      {
        maxPapers = perYearCountHash[yr];
      }
    }

    // Flatten to an array.
    var years = [];
    for(var key in perYearCountHash)
    {
      years.push([key, perYearCountHash[key]]);
    }
    
    // Sort the years.
    years.sort(function(a,b){ if(a[0]<b[0]) return 1; return -1;});
    
    var html = '';

    // Calculate the graph dimensions.
    var height = 135;
    var width = 500;
    var rowHeight = height/numYears;
    var rowWidth = width/maxPapers;
    var barHeight = (rowHeight-2*rowHeight/3);
    var halfBarHeight = ((barHeight/2)-12/2);

    // Loop through the year array and render the HTML.
    for(var i=0; i<years.length; i++)
    {
      var count = years[i][1];
      var str = (count*rowWidth > 50) ? Papercube.pluralizeString(' Paper', count)+'&nbsp;' : '';
      html+= '<div class="row" style="height:'+rowHeight+'px;"><div class="year" style="margin-top:'+((rowHeight/2)-11/2)+'px; height:'+(rowHeight-2*rowHeight/3)+'px;">'+years[i][0]+
             '</div><div class="bar" style="padding-top: '+halfBarHeight+'px; margin-top:'+(rowHeight-2*rowHeight/3)+'px; width:'+(count*rowWidth)+'px; height:'+barHeight+'px;">'+str+'</div></div>';
    }
    
    // Set the HTML.
    this.graph.innerHTML = html;
  },
  
  /**
    Clear the graph innerHTML.

  */
  _clearGraph: function()
  {
    this.graph.innerHTML = '';
  },
  
  /** 
    Save the GUID of the element and then show the fan.
    
    @param {DOM Event} evt The mouseDown event.
  */
  mouseDown: function(evt)
  {
    var guid = evt.target.getAttribute('guid');
    var type = evt.target.getAttribute('fanType');
    if(guid)
    {
      this._mouseDownGUID = guid;
      Papercube.canvasController.showFan(Event.pointerX(evt), Event.pointerY(evt), 'paperstat', (type+"Fan"));
      return YES;
    }
    return NO;
  }, 

  /**
    Initalization function.
    
    Set up the fan menu actions:
      
    authorFan: {
      Save: saveFuncAuth,
      Refocus: refocusFuncAuth
    }, 
    paperFan: {
      CiteSeer: citeseerFunc,
      Save: saveFunc,
      Refocus: refocusFunc
    }     

  */
  init: function()
  {
    sc_super();
    
    var refocusFunc = function(evt)
    { 
      Papercube.viewController.setContentToViewFromGUID(this._mouseDownGUID, 'Paper', NO);
    }.bind(this); 

    var refocusFuncAuth = function(evt)
    { 
      Papercube.viewController.viewAuthor(this._mouseDownGUID);
    }.bind(this); 

    var citeseerFunc = function(evt)
    { 
      window.open(Papercube.Paper.find(this._mouseDownGUID).get('url'));
    }.bind(this); 

    var saveFunc = function(evt)
    { 
      Papercube.viewController.saveObject(this._mouseDownGUID, 'Paper');
    }.bind(this); 


    var saveFuncAuth = function(evt)
    { 
      Papercube.viewController.saveObject(this._mouseDownGUID, 'Author');
    }.bind(this);


    // Register two fans: authors and papers.
    Papercube.canvasController.registerFans('authorstat',
    {
        authorFan: {
          Save: saveFuncAuth,
          Refocus: refocusFuncAuth
        }, 
        paperFan: {
          CiteSeer: citeseerFunc,
          Save: saveFunc,
          Refocus: refocusFunc
        }     
    });
  }
}) ;
