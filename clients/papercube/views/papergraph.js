// ==========================================================================
// Papercube.PaperGraphView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');
require('controllers/canvas');
require('controllers/papergraph');

/** @class

  This is the paper graph view. It will show all the refs/citations for a paper
  and also show all references/citations for it. Strong relationships will be shown
  with thicker and darker lines. This view uses SVG.

  @extends NodeGraph.NodeGraphView
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/

Papercube.PaperGraphView = NodeGraph.NodeGraphView.extend(
/** @scope Papercube.PaperGraphView.prototype */ {

  /**
    The delegate is the paperGraphController
  */
  delegate: Papercube.paperGraphController,

  /**
    Bind the display properties from the canvasController.

    @property {Array}
    @binding "Papercube.canvasController.displayProperties"
  */
  displayPropertiesBinding: "Papercube.canvasController.displayProperties",

  /**
    Bind the depth. Don't show items beyond this depth.
  
    @property {Integer}
    @binding "Papercube.paperGraphController.depth"
  */
  depthBinding: "Papercube.paperGraphController.depth",
  
  /**
    Bind the ref threshold binding. Don't show papers with less refs. 

    @property {Integer}
    @binding "Papercube.paperGraphController.refThreshold"
  */
  linkThresholdBinding: "Papercube.paperGraphController.refThreshold",

  /**
    Bind the cite threshold binding. Don't show papers with less cites. 
  
    @property {Integer}
    @binding "Papercube.paperGraphController.citeThreshold"
  */
  citeThresholdBinding: "Papercube.paperGraphController.citeThreshold",

  /**
    Bind the view direction from the viewController.

    @property {String}
    @binding "Papercube.viewController.viewDirection"
  */
  viewDirectionBinding: "Papercube.viewController.viewDirection",

  /**
    Cite threshold cached value.  
    
    @property {Integer}
    @default 1
  */
  _cached_citeThreshold: 1,

  /**
    The name of the view. 
    
    'papergraph'

    @property {String}
  */
  viewName: 'papergraph',
  
  /**
    The type of content being displayed.
    
    'Paper'

    @property {String}
  */
  contentTypeViewing: 'Paper',

  // Cached view direction.
  _cached_viewDirection: null,

  /** 
    The key for the default title display.

    'title'

    @property {String}
  */
  defaultTitleKey: 'title',

  /**
    The nodeTextRatio allows the font size for the node to the calculated. The font size is calculated as radius/nodeTextRatio.

    @property {Integer}
    @default is 3
  */
  nodeTextRatio: 3,

  nodeXYRatio: 1.7,

  /**
    A value of 0.1 would puts the edge label close to start node. 0.5 would put it in the middle of the edge. 
    0.9 would put it close to the end node.

    @property {Float}
    @default 0.4
  */
  edgeTextPosOffset: 0.4, 

  /**
    Node background color.
    
    @property {String}
    @config
    @default '#F3D15C'
  */
  nodeColor: '#F3D15C',

  /**
    Selected node background color.
    
    @property {String}
    @config
    @default 'FFF594'
  */
  nodeColorSel: '#FFF594',

  /**
    Node border color.
    
    @property {String}
    @config
    @default '#DF7E05'
  */
  nodeBorderColor: '#DF7E05',

  /**
    Selected node border color.
    
    @property {String}
    @config
    @default '#FFB60B'
  */
  nodeBorderColorSel: '#FFB60B',

  /**
    Node text color.
    
    @property {String}
    @config
    @default '#6D3D03'
  */
  nodeTextColor: '#6D3D03',
  
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

    if(!content) return;

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
    return Papercube.Paper.find(guid);
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
      if(this._displayRefs)
        return object._attributes.references;
      return object._attributes.citations;
    }
    else
    {
      return null;
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
    var paper = Papercube.Paper.find(rel);
    if(paper)
    {
      if(this._displayRefs)
        return paper.get('citeCount');
      return paper.get('refCount');
    }
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
    Papercube.paperGraphController.setDefaults();
  },
  
  // Redraw of view direction change.
  viewDirectionDidChange: function()
  {
    var content = this.get('content');
    // If there is no content or if you're not visible, bail.

    if(!this.get("isVisible") || !content) return;
    
    var direction = this.get('viewDirection');
    
    // Render if needed.
    if(direction != this._cached_viewDirection)
    {
      this._cached_viewDirection = direction;
      this._displayRefs = (direction == "References");
      this._render();
    }
  }.observes('viewDirection'),
    
  /**
    Custom threshold calculation for complex link threshold calculations.

    @param rel {Object} The relation's guid.

    @returns {String} Returns if the item is accepted by the threshold(s). Returns NO otherwise.
  */
  relationMeetsCustomThreshold: function(rel)
  {
    if(this._cached_linkThreshold == 0 && this._cached_citeThreshold == 0) return YES;
    
    var paper = Papercube.Paper.find(rel);
    if(paper)
    {
      return (paper.get('refCount') >= this._cached_linkThreshold &&
              paper.get('citeCount') >= this._cached_citeThreshold);
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
  }.observes('citeThreshold')
}) ;
