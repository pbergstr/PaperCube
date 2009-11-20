// ==========================================================================
// Papercube.CiteRefView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');
require('controllers/cite_ref');
require('controllers/canvas');

/** @class

  This is the author cite/ref view. It will show all the authors who reference or
  are cited by the author. Strong relationships will be shown with thicker and 
  darker lines. This view uses SVG.

  @extendsNodeGraph.NodeGraphView
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/

Papercube.CiteRefView = NodeGraph.NodeGraphView.extend(
/** @scope Papercube.CiteRefView.prototype */ {

  /**
    The delegate is the citeRefController
  */
  delegate: Papercube.citeRefController,

  /**
    Bind the display properties from the canvasController.

    @property {Array}
    @binding "Papercube.canvasController.displayProperties"
  */
  displayPropertiesBinding: "Papercube.canvasController.displayProperties",

  /**
    The value for the depth slider.

    @property {Integer}
    @default 1
  */
  depth: 1,
  
  /**
    Bind the link threshold binding. Don't show items with less links. 

    @property {Integer}
    @binding "Papercube.citeRefController.linkThreshold"
  */
  linkThresholdBinding: "Papercube.citeRefController.linkThreshold",

  /**
    Bind the view direction from the viewController.

    @property {String}
    @binding "Papercube.viewController.viewDirection"
  */
  viewDirectionBinding: "Papercube.viewController.viewDirection",
  
  /**
    The name of the view. 
    
    Overridden value is 'citeref'

    @property {String}
    @config
    @default 'citeref'
  */
  viewName: 'citeref',
  
  /**
    The type of content being displayed.
    
    Overridden value is 'Author'

    @property {String}
    @config
    @default 'Author'
  */
  contentTypeViewing: 'Author',
  
  /** 
    The key for the default title display.

    Overridden value is 'name'

    @property {String}
    @config
    @default 'name'
  */
  defaultTitleKey: 'name',
  
  /**
    Meta data box small height. 
    
    Overridden value is 100px.
    
    @property {Integer}
    @config
    @default 100px
  */  
  metaDataBoxHeightSmall: 100,

  /**
    Meta data box small width. 
    
    Overridden value is  200px. 
    
    @property {Integer}
    @config
    @default 100px
  */  
  metaDataBoxWidthSmall: 200,

  /** 
    Class name for meta data DIV.
    
    Overridden value is 'author'
    
    @property {String}
    @config
    @default 'author'
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
    if(object) 
    {
      if(this._displayRefs)
        return object._attributes.refAuthors;
      return object._attributes.citeAuthors;
    }
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
    Papercube.citeRefController.setDefaults();
  },

  /**
    Redraw if viewDirection changes.

    @observes viewDirection
  */
  viewDirectionDidChange: function()
  {
    var content = this.get('content');
    // If there is no content or if you're not visible, bail.

    Papercube.citeRefController.setPrompt();

    if(!this.get("isVisible") || !content) return;
    
    var direction = this.get('viewDirection');
    
    // Render if needed.
    if(direction != this._cached_viewDirection)
    {
      this._hideExistingLines();
      this._cached_viewDirection = direction;
      this._displayRefs = (direction == "References");
      
      this._render();
    }
  }.observes('viewDirection')
}) ;
