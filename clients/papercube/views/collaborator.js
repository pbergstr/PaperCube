// ==========================================================================
// Papercube.CollaboratorView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');
require('controllers/collaborator');
require('controllers/canvas');

/** @class

  This is the collaborator view. It will show all the collaborators for an author
  and also link between them. Strong relationships will be shown with thicker and 
  darker lines. This view uses SVG.

  @extendsNodeGraph.NodeGraphView
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/

Papercube.CollaboratorView = NodeGraph.NodeGraphView.extend(
/** @scope Papercube.CollaboratorView.prototype */ {

  /**
    The delegate is the collaboratorController
  */
  delegate: Papercube.collaboratorController,

  /**
    Bind the display properties from the canvasController.

    @property {Array}
    @binding "Papercube.canvasController.displayProperties"
  */
  displayPropertiesBinding: "Papercube.canvasController.displayProperties",

  /**
    Bind the depth. Don't show items beyond this depth.
  
    @property {Integer}
    @binding "Papercube.collaboratorController.depth"
  */
  depthBinding: "Papercube.collaboratorController.depth",
  
  /**
    Bind the collaborator threshold binding. Don't show collaborators with less collaborators. 

    @property {Integer}
    @binding  "Papercube.collaboratorController.collabThreshold"
  */
  linkThresholdBinding: "Papercube.collaboratorController.collabThreshold",

  /**
    Paper link strength threshold binding. Don't show collaborators with less papers. 

    @property {Integer}
    @binding  "Papercube.collaboratorController.paperThreshold"
  */
  paperThresholdBinding: "Papercube.collaboratorController.paperThreshold",

  /**
    Cache.
    
    @property {Integer}
  */
  _cached_paperThreshold: 0,

  /**
    Node background color.
    
    @property {String}
    @config
    @default '#BCE510'
  */
  nodeColor: '#BCE510',

  /**
    Selected node background color.
    
    @property {String}
    @config
    @default '#E7F738'
  */
  nodeColorSel: '#E7F738',

  /**
    Node border color.
    
    @property {String}
    @config
    @default '#ACD20E'
  */
  nodeBorderColor: '#ACD20E',

  /**
    Selected node border color.
    
    @property {String}
    @config
    @default '#727C81'
  */
  nodeBorderColorSel: '#CCDA31',

  /**
    Node text color.
    
    @property {String}
    @config
    @default '#7E6C53'
  */
  nodeTextColor: '#7E6C53',

  /**
    The name of the view. 
    
    'collaborator'

    @property {String}
  */
  viewName: 'collaborator',
  
  /**
    The type of content being displayed.
    
    'Author'

    @property {String}
  */
  contentTypeViewing: 'Author',

  /** 
    The key for the default title display.

    'name'

    @property {String}
  */
  defaultTitleKey: 'name',

  /**
    A value of 0.1 would puts the edge label close to start node. 0.5 would put it in the middle of the edge. 
    0.9 would put it close to the end node.

    @property {Float}
    @default 0.4
  */
  edgeTextPosOffset: 0.4, 

  /**
    Meta data box small height. 
    
    @property {Integer}
    @default 100px 
  */  
  metaDataBoxHeightSmall: 100,

  /**
    Meta data box small width. 

    @property {Integer}
    @default 100px 
  */  
  metaDataBoxWidthSmall: 100,

  /** 
    Class name for meta data DIV.
    
    'author'
    
    @property {String}
  */
  metaDataClassName: 'author',

  /** 
    Get the details of a given item.
    
    @param guids {Array} The array of guids.
    @param callBack {Function} The callBack function is called when the request is successful.
  */
  performCustomRequest: function(guids, callBack)
  {
    Papercube.adaptor.getAuthorDetails(guids, callBack);
  },
    
  /** 
    Generate custom metadata for item.
    
    @param guid {string} The guid for content object to be shown in the meta data view.

    @returns {Boolean} Returns NO if there is an error.
  */
  generateCustomMetaData: function(guid)
    {
      // Get the author content.
      var content = Papercube.Author.find(guid);

      if(!content) return;

      // Set the title
      this.metaDataView.childNodes[0].innerHTML = content.get("name");
      this.metaDataView.childNodes[1].innerHTML = "<strong>Papers Published:</strong> " +Papercube.pluralizeString(" paper", content.get('paperCount'));
      this.metaDataView.childNodes[2].innerHTML = "<strong>Number of Collaborators:</strong> " +Papercube.pluralizeString(" author",content.get('collaborators').length);
      this.metaDataView.childNodes[3].innerHTML = "<strong>Author references:</strong> " +Papercube.pluralizeString(" other author",content.get('refAuthors').length);
      this.metaDataView.childNodes[4].innerHTML = "<strong>Author is cited by:</strong> " +Papercube.pluralizeString(" other author",content.get('citeAuthors').length);
    },

  /** 
    Generate custom metadata for item.
    
    @param guid {string} The guid for content object that is found in the SC Store.

    @returns {array|SC.Record} Returns the found content object.
  */
  findCustomObject: function(guid)
  {
    return Papercube.Author.find(guid);
  },

  /** 
    Find Custom Object Relation Attribute.

    @param object {Record} The content object.

    @returns {Array} Returns the found relation attribute array.
  */
  findCustomObjectAttr: function(object)
  {
    if(object) return object._attributes.collaborators;
  },

  /**
    Given relation object, return guid for it.

    @param rel {Object} The relation object or array.

    @returns {String} Returns the guid for the relation object.
  */
  getGuidForRelation: function(rel)
  {
    if(rel) return rel[0];
  },
    
  /**
    Given relation object, return weight for it.

    @param rel {Object} The relation object or array.

    @returns {Integer} Returns the calculated weight for the relation object.
  */
  calcRelationWeight: function(rel)
  {
    return rel[1];
  },

  /**
    Given an object, return its label.

    @param object {Object} The content object.

    @returns {String} Returns a title string for display.
  */
  findCustomObjectLabel: function(object)
  {
    var name = '';
    if(object)
    {
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
    }
    return name;
  },
    
  /**
    Revert bindings to default.
  */
  setBindingDefaults: function()
  {
    Papercube.collaboratorController.setDefaults();
  },

  /**
    Custom threshold calculation for complex link threshold calculations.

    @param rel {Object} The relation's guid.

    @returns {String} Returns if the item is accepted by the threshold(s). Returns NO otherwise.
  */
  relationMeetsCustomThreshold: function(rel)
  {
    if(rel[1] >=this._cached_linkThreshold)
    {
      if(this._cached_paperThreshold !=0)
      {
        var p = Papercube.Author.find(rel[0]);
        if(p) return (p._attributes.papers.length >= this._cached_paperThreshold);
      }
      return YES;
    }
    return NO;
  },
  
  /**
    Redraw if paperThreshold changes.

    @observes paperThreshold
  */
  paperThresholdDidChange: function()
  {
    var content = this.get('content');
    // If there is no content or if you're not visible, bail.

    if(!this.get("isVisible") || !content) return;
    
    var threshold = this.get('paperThreshold');
    
    // Render if needed.
    if(threshold != this._cached_paperThreshold)
    {
      this._hideExistingLines();
      this._cached_paperThreshold = threshold;
      this._render();
    }
  }.observes('paperThreshold')
}) ;
