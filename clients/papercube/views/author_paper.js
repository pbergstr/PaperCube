// ==========================================================================
// Papercube.AuthorPaperView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');
require('controllers/canvas');
require('controllers/authorpaper');

/** @class

  This view shows the author's papers.
  
  @extendsNodeGraph.NodeGraphView
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.AuthorPaperView = NodeGraph.NodeGraphView.extend(
/** @scope Papercube.AuthorPaperView.prototype */ {
  
  /**
    The delegate is the authorPaperController
  */
  delegate: Papercube.authorPaperController,

  /**
    Bind the display properties from the canvasController.

    @property {Array}
    @binding "Papercube.canvasController.displayProperties"
  */
  displayPropertiesBinding: "Papercube.canvasController.displayProperties",

  /**
    @property
    @default {Current year}
    @type {Number}
  */
  _year: new Date().getFullYear(),
  
  /**
    The value for the depth slider. 
    
    @property {Integer}
    @default 1
  */
  depth: 1,
  
  /**
    Collab ref threshold binding.Don't show papers with less refs. 
  
    @property {Integer}
    @binding "Papercube.authorPaperController.refThreshold"
  */
  linkThresholdBinding: "Papercube.authorPaperController.refThreshold",

  /**
    Collab ref threshold cached value.
  
    @property {Integer}
    @default 1
  */
  _cached_linkThreshold: 1, 

  /**
    Bind the cite threshold binding. Don't show papers with less cites. 
  
    @property {Integer}
    @binding "Papercube.authorPaperController.citeThreshold"
  */
  citeThresholdBinding: "Papercube.authorPaperController.citeThreshold",

  /**
    Collab cite threshold cached value.
  
    @property {Integer}
    @default 1
  */
  _cached_citeThreshold: 1,

  /**
    Bind the start year threshold binding. Don't show papers published before 
    this date. 
  
    @property {Integer}
    @binding "Papercube.authorPaperController.startYearThreshold"
  */
  startYearThresholdBinding: "Papercube.authorPaperController.startYearThreshold",

  /**
    The start year threshold cached value.
  
    @property {Integer}
    @default 1
  */
  _cached_startYearThreshold: 1960,

  /**
    Bind the end year threshold binding. Don't show papers published after 
    this date. 
  
    @property {Integer}
    @binding "Papercube.authorPaperController.endYearThreshold"
  */
  endYearThresholdBinding: "Papercube.authorPaperController.endYearThreshold",

  /**
    The end year threshold cached value.
  
    @property {Integer}
    @default 1
  */
  _cached_endYearThreshold: new Date().getFullYear(),

  /**
    Node background color.
    
    @property {String}
    @config
    @default '#C3D2DB'
  */
  nodeColor: '#B0BDC5',

  /**
    Selected node background color.
    
    @property {String}
    @config
    @default '#D2E2EC'
  */
  nodeColorSel: '#D2E2EC',

  /**
    Node border color.
    
    @property {String}
    @config
    @default '#727C81'
  */
  nodeBorderColor: '#727C81',

  /**
    Selected node border color.
    
    @property {String}
    @config
    @default '#727C81'
  */
  nodeBorderColorSel: '#727C81',

  /**
    Node text color.
    
    @property {String}
    @config
    @default '#111'
  */
  nodeTextColor: '#111',
  
  /**
    The name of the view.
    
    Overridden value is "authorpaper"

    @property {String}
    @config 
    @default "authorpaper"
  */
  viewName: 'authorpaper',
  
  /**
    The type of content being displayed. 
    
    Overridden value is "Paper"

    @property {String}
    @config 
    @default "Paper"
  */
  contentTypeViewing: 'Paper',

  /** 
    The key for the default title display.

    Overridden value is "Name"

    @property {String}
    @config 
    @default "Name"
  */
  defaultTitleKey: 'name',

  /**
    The nodeTextRatio allows the font size for the node to the calculated. The font size is calculated as radius/nodeTextRatio.

    @property {Integer}
    @config 
    @default 3
  */
  nodeTextRatio: 3,

  /**
    If set to YES, show the edge label. If NO, hide the label.
    
    @property {Boolean}
    @config 
    @default NO
  */
  showEdgeLabel: NO,

  /**
    If set to YES, calculate the edge width by looking at the weight of the item. Otherwise, skip this operation.
    
    Overridden value is NO

    @property {Boolean}
    @config 
    @default NO
  */
  useEdgeWeightWidth: NO,

  /**
    If NO, don't show edges.
    
    Overridden value is NO.

    @property {Boolean}
    @config 
    @default NO
  */
  showEdges: NO,
 
  /**
    A value of 0.1 would puts the edge label close to start node. 0.5 would put it in the middle of the edge. 
    0.9 would put it close to the end node.

    Overridden value is 0.4.
    
    @property {Float}
    @config 
    @default 0.4
  */
  edgeTextPosOffset: 0.4, 

  /** 
    Get the details of a given item.
    
    @param guids {Array} The array of guids.
    @param callBack {Function} The callBack function is called when the request is successful.
  */
  performCustomRequest: function(guids, callBack)
  {
    Papercube.adaptor.getPaperDetails(guids, callBack);
  },
  
  /** 
    Generate custom metadata for item.
    
    @param guid {string} The guid for content object to be shown in the meta data view.

    @returns {Boolean} Returns NO if there is an error.
  */
  generateCustomMetaData: function(guid)
  {
    // Get the uathor content.
    var content = Papercube.Paper.find(guid);

    if(!content)
    {
      var content = Papercube.Author.find(guid);
    
      if(!content)
        return NO;

      // Set the title
      this.metaDataView.childNodes[0].innerHTML = content.get("name");
      this.metaDataView.childNodes[1].innerHTML = "<strong>Number of Collaborators:</strong> " +Papercube.pluralizeString(" author",content.get('collaborators').length);
      this.metaDataView.childNodes[2].innerHTML = "<strong>Author references:</strong> " +Papercube.pluralizeString(" other author",content.get('refAuthors').length);
      this.metaDataView.childNodes[3].innerHTML = "<strong>Author is cited by:</strong> " +Papercube.pluralizeString(" other author",content.get('citeAuthors').length);
      this.metaDataView.childNodes[4].innerHTML = "<strong>Papers Published:</strong> " +Papercube.pluralizeString(" paper", content.get('paperCount'));
      this.metaDataView.childNodes[5].innerHTML = '';
      return NO;
    } 

    // Set the title
    this.metaDataView.childNodes[0].innerHTML = content.get("title");

    // Set the authors
    var authors = content.get('authorNames').join(', ');
    var authLen = authors.length;
    this.metaDataView.childNodes[1].innerHTML = (authLen > 150) ? (authors.substr(0,150)+"&hellip;") : authors;
    this.metaDataView.childNodes[2].innerHTML = (content.get('publisher')) ? content.get('publisher') : '';

    // Set the date
    this.metaDataView.childNodes[3].innerHTML = "<strong>Publication Date: </strong> " + content.get("year");

    this.metaDataView.childNodes[4].innerHTML = Papercube.pluralizeString(" reference", content.get('refCount'));
    this.metaDataView.childNodes[5].innerHTML = Papercube.pluralizeString(" citation", content.get('citeCount'));
  },
  
  /** 
    Generate custom metadata for item.
    
    @param guid {string} The guid for content object that is found in the SC Store.

    @returns {array|SC.Record} Returns the found content object.
  */
  findCustomObject: function(guid)
  {
    var obj = Papercube.Paper.find(guid);
    if(!obj)
    {
      obj = Papercube.Author.find(guid); 
    }
    return obj;
  },

  /** 
    Find Custom Object Relation Attribute.
    
    @param object {Record} The content object.

    @returns {Array} Returns the found relation attribute array.
  */
  findCustomObjectAttr: function(object)
  {
    if(object) 
    {
      if(object._type == "Papercube.Author")
        return object._attributes.papers;
      return [];
    }
    else
    {
      return [];
    }
  },

  /**
    Given relation object, return guid for it.
    
    @param rel {Object} The relation object or array.

    @returns {String} Returns the guid for the relation object.
  */
  getGuidForRelation: function(rel)
  {
    if(rel) return rel;
  },
  
  /**
    Given relation object, return weight for it.

    @param rel {Object} The relation object or array.

    @returns {Integer} Returns the calculated weight for the relation object.
  */
  calcRelationWeight: function(rel)
  {
    return 1;
  },

  /**
    Given an object, return its label.

    @param object {Object} The content object.

    @returns {String} Returns a title string for display.
  */
  findCustomObjectLabel: function(object)
  {
    if(object)
    {
      if(object._type == "Papercube.Author")
      {
        var name = '';
        var n = object._attributes.name.split(' ');
        var authLen = n.length;
        for(var i=0; i<authLen; i++)
        {
          if(i<authLen-1)
          {
            name += n[i].substr(0,1).toUpperCase() + ' ';
          }
          else
          {
            name += n[i].substr(0,6);
          }
        }          
        return name;
      }
      return object._attributes.title.substr(0,20);
      // var title = object.get('title');
      // if(title.length > 40)
      // {
      //   return [title.substr(0,20), title.substr(20, 40)];
      // }
      // return title.substr(0,20);
    }
    return '?';
  },
  
  /**
    Revert bindings to default.
  */
  setBindingDefaults: function()
  {
    Papercube.authorPaperController.setDefaults();
  },
  
  /**
    Custom threshold calculation for complex link threshold calculations.

    @param rel {Object} The relation's guid.

    @returns {String} Returns if the item is accepted by the threshold(s). Returns NO otherwise.
  */
  relationMeetsCustomThreshold: function(rel)
  {
    if(this._cached_linkThreshold === 0 && 
       this._cached_citeThreshold === 0 &&
       this._cached_startYearThreshold === 1960 && 
       this._cached_endYearThreshold === this._year
       ) return YES;
       
    var paper = Papercube.Paper.find(rel);

    if(paper)
    {
      return (paper.get('refCount') >= this._cached_linkThreshold &&
              paper.get('citeCount') >= this._cached_citeThreshold && 
              paper.get('year') >= this._cached_startYearThreshold &&
              paper.get('year') <= this._cached_endYearThreshold);
    }
    return NO;
  },
  
  /**
    Redraw if citeThreshold change.

    @observes citeThreshold
  */
  citeThresholdDidChange: function()
  {
    var content = this.get('content');
    // If there is no content or if you're not visible, bail.

    if(!this.get("isVisible") || !content) return;
    
    var threshold = this.get('citeThreshold');
    
    // Render if needed.
    if(threshold != this._cached_citeThreshold)
    {
      this._hideExistingLines();
      this._cached_citeThreshold = threshold;
      this._render();
    }
  }.observes('citeThreshold'),
  
  /**
    Redraw if startYearThreshold change.

    @observes startYearThreshold
  */
  startYearThresholdDidChange: function()
  {
    var content = this.get('content');
    // If there is no content or if you're not visible, bail.
    if(!this.get("isVisible") || !content) return;
    
    var threshold = this.get('startYearThreshold');
    
    // Render if needed.
    if(threshold != this._cached_startYearThreshold)
    {
      this._hideExistingLines();
      this._cached_startYearThreshold = threshold;
      this._render();
    }
  }.observes('startYearThreshold'),

  /**
    Redraw if endYearThreshold change.

    @observes endYearThreshold
  */
  endYearThresholdDidChange: function()
  {
    var content = this.get('content');
    // If there is no content or if you're not visible, bail.
    if(!this.get("isVisible") || !content) return;
    
    var threshold = this.get('endYearThreshold');
    
    // Render if needed.
    if(threshold != this._cached_endYearThreshold)
    {
      this._hideExistingLines();
      this._cached_endYearThreshold = threshold;
      this._render();
    }
  }.observes('endYearThreshold')
  
}) ;
