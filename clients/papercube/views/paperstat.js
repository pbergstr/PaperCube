// ==========================================================================
// Papercube.PaperstatView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');
require('views/paperstatlist');

/** @class

  This is a more classical web-based view on a paper's citation and references.

  @extends SC.View
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.PaperstatView = SC.View.extend(
/** @scope Papercube.PaperstatView.prototype */ {

  /**
    Author sort order binding.
  
    @property {String}
    @binding 'Papercube.paperStatController.authorSortOrder'
  */
  authorSortOrderBinding: 'Papercube.paperStatController.authorSortOrder',

  /**
    Paper references sort order binding.
  
    @property {String}
    @binding 'Papercube.paperStatController.referenceSortOrder'
  */
  referenceSortOrderBinding: 'Papercube.paperStatController.referenceSortOrder',

  /**
    Paper citations sort order binding.
  
    @property {String}
    @binding 'Papercube.paperStatController.citationSortOrder'
  */
  citationSortOrderBinding: 'Papercube.paperStatController.citationSortOrder',


  /**
    The guid of the last clicked paper or author.
    
    @property {String}
  */
  _mouseDownGUID: null,

  /**
    Display references or citations graph, if 0, show references, if 1 show citations.

    @property {Integer}
    @default 0
  */
  _direction: 0,
  
  /**
    Outlets for paper stat view.
   
    [
      'titleLabel', 
      'abstractTxt', 
      'sourceURL', 
      'citeseerURL', 
      'sourceType',
      'refCount', 
      'citeCount', 
      'citeList', 
      'refList', 
      'papersPerYear', 
      'graph', 
      'refButton', 
      'citeButton', 
      'stats', 
      'authorCount', 
      'authorList'
    ],
  */
  outlets: [
              'titleLabel', 
              'abstractTxt', 
              'sourceURL', 
              'citeseerURL', 
              'sourceType',
              'refCount', 
              'citeCount', 
              'citeList', 
              'refList', 
              'papersPerYear', 
              'graph', 
              'refButton', 
              'citeButton', 
              'stats', 
              'authorCount', 
              'authorList'
            ],
  
  /**
    Title label. Bound to the '.title?' element.

    @outlet {DOM Element} '.title?' 
  */
  titleLabel: '.title?',

  /**
    Abstract Text. Bound to the '.abstract?' element.

    @outlet {DOM Element} '.abstract?' 
  */
  abstractTxt: '.abstract?',

  /**
    The source URL label. Bound to the '.source-url?' element.

    @outlet {DOM Element} '.source-url?' 
  */
  sourceURL: '.source-url?',

  /**
    The source type label. Bound to the '.source-type?' element.

    @outlet {DOM Element} '.source-type?' 
  */
  sourceType: '.source-type?',

  /**
    The CiteSeer URL. Bound to the '.citeseer-url?' element.

    @outlet {DOM Element} '.citeseer-url?' 
  */
  citeseerURL: '.citeseer-url?',

  /**
    Reference count. Bound to the '.ref-count?' element.

    @outlet {DOM Element} '.ref-count?'
  */
  refCount: '.ref-count?',

  /**
    Citation count. Bound to the '.cite-count?' element.

    @outlet {DOM Element} '.cite-count?'
  */
  citeCount: '.cite-count?',

  /**
    Author count. Bound to the '.author-count?' element.

    @outlet {DOM Element} '.author-count?'
  */
  authorCount: '.author-count?',

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
    This button shows the refs graph.

    @outlet {SC.ButtonView} '.refs-button?'
  */
  refButton: SC.ButtonView.extend({
    /**
      Show the ref graph.
    */
    action: function()
    {
      this.owner._direction = 0;
      this.rootElement.className = 'refs-button sel';
      this.owner.citeButton.rootElement.className = 'refs-button';
      this.owner._renderGraph();
    }
  }).outletFor('.refs-button?'),

  /**
    This button shows the cite graph.

    @outlet {SC.ButtonView} '.cite-button?'
  */
  citeButton: SC.ButtonView.extend({
    /**
      Show the cite graph.
    */
    action: function()
    {
      this.owner._direction = 1;
      this.rootElement.className = 'cites-button sel';
      this.owner.refButton.rootElement.className = 'cites-button';
      this.owner._renderGraph();
    }
  }).outletFor('.cites-button?'),
  
  /**
    refList view. Shows the paper's references. Bound to the '.references-list?' element.

    @outlet {Papercube.PaperstatListView} '.references-list?'
  */
  refList: Papercube.PaperstatListView.outletFor('.references-list?'),

  /**
    citeList view. Shows the paper's citations. Bound to the '.citations-list?' element.

    @outlet {Papercube.PaperstatListView} '.citations-list?'
  */
  citeList: Papercube.PaperstatListView.outletFor('.citations-list?'),

  /**
    authorList view. Shows the paper's authors. Bound to the '.author-list?' element.

    @outlet {Papercube.PaperstatListView} '.author-list?'
  */
  authorList: Papercube.PaperstatListView.extend({isAuthorList: YES}).outletFor('.author-list?'),

  /**
    Re-render the view when the content, sort order changes, or view is set to be visible.

    @observes content
    @observes isVisible
    @observes referenceSortOrder
    @observes citationSortOrder
    @observes authorSortOrder
  */
  contentDidChange: function()
  {
    
    var content = this.get('content');

    // If there is no content or if you're not visible, bail.
    if(!this.get("isVisible") || !content) return NO;
    
    this.stats.style.display = '';
    
    if(!this._cachedContent || this._cachedContent.get('guid') != content.get('guid'))
    {
      this.papersPerYear.className = 'papersperyear';
      this.papersPerYear.className = 'papersperyear show';
      this.abstractTxt.className = 'abstract';
      this.abstractTxt.className = 'abstract show';
      this._cachedContent = content;
      this._clearGraph();
    }

    var callBack = function() { this.contentDidChange(); }.bind(this);

    // If there are guids that need to be retrieved, retrieve them now.
    if(!content.get('allDataRetrieved'))
    {
      Papercube.adaptor.getAllDataForPaper(content.get('guid'), callBack);
      
      
      var neededGuids = Papercube.viewController.collectNeededPaperGUIDs([].concat(content.get('references'), content.get('citations')), []);
      if(neededGuids.guids.length > 0)
      {
        // Call the server if needed.
        Papercube.adaptor.getPaperDetails(neededGuids.guids, callBack);
        this._renderList('refs', YES);
        this._renderList('cites', YES);
        this._clearGraph();
      }
    }
    else
    {
      this._renderList('refs', NO);
      this._renderList('cites', NO);
      this.refButton.action();
      
    }
    
    var authGuids = [];
    var auths = content.get('authors');
    for(var i=0; i<auths.length; i++)
    {
      var a = Papercube.Author.find(auths[i].guid);
      if(!a)
      {
        authGuids.push(auths[i].guid);
      }
    }
    
    if(authGuids.length > 0)
    {
      Papercube.adaptor.getAuthorDetails(authGuids, callBack);
      this._renderList('authors', YES);
    }
    else
    {
      this._renderList('authors', NO);
    }

    
    Papercube.canvasController.set("zoomValueMax", 1);
    Papercube.canvasController.set("zoomStep", 1);
    
    // Set the title and year.
    this.titleLabel.innerHTML = content.get('title').escapeHTML() + ' ('+content.get('year')+')';

    // Set the abstract.
    this.abstractTxt.innerHTML = content.get('abstract').escapeHTML();
    
    // Set the source.
    var source = content.get('source');
    if(source)
    {
      this.sourceURL.innerHTML = source;
      this.sourceURL.onmousedown = function() { window.open(source) ;};
    }
    else
    {
      this.sourceURL.innerHTML = '';
      this.sourceURL.onmousedown = null;
    }

    // Set the source format.
    var format = content.get('format');
    if(format)
    {
      this.sourceType.innerHTML = format;
    }
    else
    {
      this.sourceType.innerHTML = '';
    }
    
    // Set CiteSeer URL.
    var url = content.get('url');
    if(url)
    {
      this.citeseerURL.innerHTML = url;
      this.citeseerURL.onmousedown = function() { window.open(url) ; };
    }
    else
    {
      this.citeseerURL.innerHTML = '';
      this.citeseerURL.onmousedown = null;
    }
    
  }.observes('content', 'isVisible', 'referenceSortOrder', 'citationSortOrder', 'authorSortOrder'),

  _renderList: function(type, isLoading)
  {
    var content = this.get('content');
    if(!content)
    {
      if(type == 'refs')
      {
         this.refList.set("content", []);
      }
      else if(type == "cites")
      {
        this.citeList.set("content", []);
      }
      else if(type == "authors")
      {
        this.authorList.set("content", []);
      }
      return;
    }
    
    if(type != 'authors')
    {
      
      var rel = (type == 'refs') ? content.get('references') : content.get('citations');
    
      var papers = [];
      for(var i=0; i<rel.length; i++)
      {
        var paper = Papercube.Paper.find(rel[i]);
        if(paper)
        {
          papers.push(paper);
        }
      }
      
      var sortType = (type == "refs") ? this.get('referenceSortOrder') : this.get('citationSortOrder');

      //Title', 'Year', 'References', 'Citations', 'Num Authors'
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
          papers.sort(function(a, b) 
          { 
            var aCnt = a.get('refCount');
            var bCnt = b.get('refCount');
            if(aCnt == bCnt) return 0;
            if(aCnt > bCnt) return -1;
            return 1;
          });
          break;
        case 'Num Cites':
          papers.sort(function(a, b) 
          { 
            var aCnt = a.get('citeCount');
            var bCnt = b.get('citeCount');
            if(aCnt == bCnt) return 0;
            if(aCnt > bCnt) return -1;
            return 1;
          });
          break;
        case 'Num Authors':
          papers.sort(function(a, b) 
          { 
            var aCnt = a.get('authorCount');
            var bCnt = b.get('authorCount');
            if(aCnt == bCnt) return 0;
            if(aCnt > bCnt) return -1;
            return 1;
          });
          break;
      }
 
      if(type == 'refs')
      {
        this.refCount.innerHTML = ' (' + papers.length+')';
        this.refList.set("content", papers);
        this.refList.setClassName('show', (papers.length != 0));
      }
      else
      {
        this.citeCount.innerHTML = ' (' + papers.length+')';
        this.citeList.set("content", papers);
        this.citeList.setClassName('show', (papers.length != 0));
      }
    }
    else
    {
      
      var auths = content.get('authors');
    
      var authors = [];
      for(var i=0; i<auths.length; i++)
      {
        var author = Papercube.Author.find(auths[i].guid);
        if(author)
        {
          authors.push(author);
        }
      }
      
      var sortType = this.get('authorSortOrder');
      
      //Title', 'Year', 'References', 'Citations', 'Num Authors'
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
          authors.sort(function(a, b) 
          { 
            var aCnt = a.get('collaborators').length;
            var bCnt = b.get('collaborators').length;
            if(aCnt == bCnt) return 0;
            if(aCnt > bCnt) return -1;
            return 1;
          });
          break;
        case 'Cite Count':
          authors.sort(function(a, b) 
          { 
            var aCnt = a.get('citeAuthors').length;
            var bCnt = b.get('citeAuthors').length;
            if(aCnt == bCnt) return 0;
            if(aCnt > bCnt) return -1;
            return 1;
          });
          break;
      }
      

      this.authorCount.innerHTML = ' (' + authors.length+')';
      this.authorList.set("content", authors);
      this.authorList.setClassName('show', (authors.length != 0));
    }
  },
  
  /**
    Render the graph.
  
  */
  _renderGraph: function()
  {
    this._clearGraph();
    var rel = (this._direction) ? this._cachedContent.get('citations') : this._cachedContent.get('references');
    
    var height = 135;
    var width = 300;
    var perYearCountHash = {};
    var numYears = 0;
    var maxPapers = 0;
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
    
    var years = [];
    
    for(var key in perYearCountHash)
    {
      years.push([key, perYearCountHash[key]]);
    }
    
    years.sort(function(a,b){ if(a[0]<b[0]) return 1; return -1;});
    
    var html = '';
    
    var rowHeight = height/numYears;
    var rowWidth = width/maxPapers;
    
    var barHeight = (rowHeight-2*rowHeight/3);
    var halfBarHeight = ((barHeight/2)-12/2);
    for(var i=0; i<years.length; i++)
    {
      var count = years[i][1];
      var str = (count*rowWidth > 50) ? Papercube.pluralizeString(' Paper', count)+'&nbsp;' : '';
      html+= '<div class="row" style="height:'+rowHeight+'px;"><div class="year" style="margin-top:'+((rowHeight/2)-11/2)+'px; height:'+(rowHeight-2*rowHeight/3)+'px;">'+years[i][0]+
             '</div><div class="bar" style="padding-top: '+halfBarHeight+'px; margin-top:'+(rowHeight-2*rowHeight/3)+'px; width:'+(count*rowWidth)+'px; height:'+barHeight+'px;">'+str+'</div></div>';
    }
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

    Papercube.canvasController.registerFans('paperstat',
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
