// ==========================================================================
// Papercube.PaperTreeView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  This is a tree map-like view of papers.

  @extends SC.View
  @extends NodeGraph.DragPanMixin
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.PaperTreeView = SC.View.extend(NodeGraph.DragPanMixin, 
/** @scope Papercube.PaperTreeView.prototype */ {

  /**
    Bind the display properties from the canvasController.

    @property {Array}
    @binding "Papercube.canvasController.displayProperties"
  */
  displayPropertiesBinding: "Papercube.canvasController.displayProperties",

  /**
    Bind the view direction from the viewController.

    @property {String}
    @binding "Papercube.viewController.viewDirection"
  */
  viewDirectionBinding: "Papercube.viewController.viewDirection",

  /**
    Bind the cite threshold binding. Don't show papers with less cites. 
  
    @property {Integer}
    @binding "Papercube.paperTreeController.citeThreshold"
  */
  citeThresholdBinding: "Papercube.paperTreeController.citeThreshold",
  
  /**
    Cite threshold cached value.
  
    @property {Integer}
    @default 1
  */
  _cached_citeThreshold: 1,

  /**
    Bind the ref threshold binding. Don't show papers with less refs. 
  
    @property {Integer}
    @binding "Papercube.paperTreeController.refThreshold",
  */
  refThresholdBinding: "Papercube.paperTreeController.refThreshold",

  /**
    Ref threshold cached value.
  
    @property {Integer}
    @default 1
  */
  _cached_refThreshold: 1,

  /**
    Bind the depth. Don't show items beyond this depth.
  
    @property {Integer}
    @binding "Papercube.paperTreeController.depth"
  */
  depthBinding: "Papercube.paperTreeController.depth",

  /**
    Depth cached value.
  
    @property {Integer}
    @default 15
  */
  _cached_depth: 15,

  /**
    Display references or citations.

    @property {Boolean}
    @default YES
  */
  _displayRefs: YES,
  
  /**
    Cached width of the view's canvas, set by the displayProperties.

    @property {Integer}
    @default 800px
  */
  _canvasWidth: 800,

  /**
    Cached height of the view's canvas, set by the displayProperties. Default 600px.

    @property {Integer}
  */
  _canvasHeight: 600,
  
  /**
    Cached height property from displayProperties.

    @property {Integer}
  */
  _h: 0,
  
  /**
    Cached width property from displayProperties.

    @property {Integer}
  */
  _w: 0,
  
  /**
    Cached x-axis offset property from displayProperties.

    @property {Integer}
  */
  _x: 0,

  /**
    Cached y-axis offset property from displayProperties.

    @property {Integer}
  */
  _y: 0, 
  
  /**
    The height of a row in the visualization.

    @property {Integer}
    @default 1px
  */
  _rowHeight: 1,

  /** 
    The deepest explored area.
  
    @private 
    @property {Integer}
    @default 1
  */
  _deepestLevel: 1,
  
  /**
    Keep track of the things that are already rendered to avoid cycles.

    @private 
    @property {Object}
  */
  _renderTree: {},

  /**
    Paper-DOM map

    @private 
    @property {Object}
  */
  _paperDOMMap: {},


  /** 
    The found GUID.
  
    @property {String}
  */
  _foundGuid: null,

  /**
    Meta data box small width. 
    
    @property {Integer}
    @default 400
  */  
  _metaDataBoxWidthSmall: 400,

  /**
    Meta data box small height. 
    
    @property {Integer}
    @default 120
  */  
  _metaDataBoxHeightSmall: 120,
  
  /**
    Cached stylesheet reference.
    
    @property {DOM Element}
  */
  _styleSheet: null,

  /** 
    The deepest explored area.
  
    @private 
    @property {Integer}
    @default 0
  */
  _deepest: 0,

  /** 
    The needed guids, call the server to get them.
  
    @private 
    @property {Object}
  */
  _guidsNeeded: {},

  /**
    The node element that is cloned over and over during the construction of the tree.

    @property {DOM Element}
  */
  _node: null,

  /**
    The text node element that is cloned over and over during the construction of the tree.

    @property {DOM Element}
  */
  _textNode: null,
  
  /**
    Outlets for author stat view.

     ["canvas", "metaDataView"]
  */
  outlets: ["canvas", "metaDataView"],
  
  /**
    The canvas element, not Canvas Tag, just DIVs.

    @outlet {DOM Element} '.canvas?'
  */
  canvas: ".canvas?",

  /**
    The DOM element that contains the meta data for an item. Bound to the '.meta-data?' element.

    @outlet {DOM Element} '.meta-data?'
  */
  metaDataView: ".meta-data?",

  /**
    Hide meta data box.
  */
  _hideMetaData: function()
  {
    // Hide meta data view.
    this.metaDataView.removeClassName("show-meta-data-small");
    
    this.removeHighlight();
  },
  
  /**
    Show meta data for paper!
    

    @param {DOM Element} evt The mouse event.
    @param guid {string} The guid of the item.
  
    @returns {Boolean} Returns NO if there is no content.
  */
  _showMetaData: function(evt, guid)
  {
    var x = Event.pointerX(evt)+10;
    var y = Event.pointerY(evt)-20;
    
    var wHeight = NodeGraph.windowHeight();
    var wWidth = NodeGraph.windowWidth();
    
    if(y < 30) y = 30;
    if(x < 20) x = 20;
    if(y > (wHeight-this._metaDataBoxHeightSmall)) y = (wHeight-this._metaDataBoxHeightSmall)-30;
    if(x > (wWidth-this._metaDataBoxWidthSmall)) x = (wWidth-this._metaDataBoxWidthSmall)+1;

    this.metaDataView.style.top = y + "px";
    this.metaDataView.style.left = x + "px";


    this.metaDataView.addClassName("show-meta-data-small");

    if(guid.indexOf('--1') == -1)
    {
      // Get the paper content.
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

    }
  },
  
  // Mouse over, show meta-data.
  mouseMoved: function(evt)
  {
    if(evt && evt.target && evt.target.id  && Element.hasClassName(evt.target, 'item') || Element.hasClassName(evt.target, 'item-text'))
    {
      var guid =  evt.target.id;
      if(guid.substr(0,2) != '-1')
      {
        
        if(guid != this._foundGuid)
        {
          this.removeHighlight();
        }
        
        this._showMetaData(evt, guid);
        this._foundGuid = guid;

        var nodes = this._paperDOMMap[this._foundGuid];
        
        if(nodes)
        { 
          for(var i=0; i<nodes.length; i++)
          {
            nodes[i].addClassName('highlight');
          }
        }
      }
      else
      {
        this._hideMetaData();
      }
    }
    else
    {
      this._hideMetaData();
    }
  },
  
  
  /**
    Remove the highlight of redundant nodes.
  */
  removeHighlight: function()
  {
    var nodes = this._paperDOMMap[this._foundGuid];
    
    if(!nodes) return;
    
    for(var i=0; i<nodes.length; i++)
    {
      nodes[i].removeClassName('highlight');
    }
  },
  
  /** 
    When the mouse is moved out of the view, remove the class name that makes it visible.
    
    @param {DOM Event} evt The mouseExited event.
  */
  mouseExited: function(evt)
  {
    this._hideMetaData();
  },

  /** 
    Save the GUID of the element and then show the fan.
    
    @param {DOM Event} evt The mouseDown event.
  */
  mouseDown: function(evt)
  {
    if(evt && evt.target && evt.target.id)
    {
      var guid = evt.target.id;
      if(guid.substr(0,2) == '--1')
      {
        Papercube.viewController.setContentToViewFromGUID(guid.substr(3,guid.length-3), "Paper");
      }
      else
      {
        this._mouseDownGUID = guid;
        
        var type = (Element.hasClassName(evt.target, 'level0') || (Element.hasClassName(evt.target, 'item-text') && Element.hasClassName(evt.target.parentNode, 'level0'))) ? 'focused' : 'unfocused';

        Papercube.canvasController.showFan(Event.pointerX(evt), Event.pointerY(evt), 'papertree', (type+"Fan"));
        return YES;
      }
    }
    else
    {
      return this.handleMouseDownDrag(evt);      
    }
    return NO;
  },
    
  /**
    Redraw based on 'content', 'isVisible', 'viewDirection', 'refThreshold', 'depth', 'citeThreshold' binding changes.

    @observes content
    @observes isVisible
    @observes viewDirection
    @observes refThreshold
    @observes depth
    @observes citeThreshold
  
    @returns {Boolean} Returns NO if there is no guid of if the view is not visible.
  */
  redrawParamsDidChange: function()
  {
    
    var content = this.get('content');

    // If there is no content or if you're not visible, bail.
    if(!this.get("isVisible") || !content) return NO;
    
    Papercube.canvasController.set("zoomValueMax", 5);
    Papercube.canvasController.set("zoomStep", .5);
        
    

    this._hideMetaData();

    if(!this._cachedContent || this._cachedContent.get('guid') !== content.get('guid')) 
    {
      // Hide meta data view.
      this._deepest = 1;
      Papercube.canvasController.zoomOut();
      Papercube.paperTreeController.setDefaults();
    }
    
    // Set the view direction.
    this._displayRefs = (this.get("viewDirection") == "References");
    
    this.setClassName('citations', !this._displayRefs);
    this.setClassName('references', this._displayRefs);

    // Grab the cite/ref threshold.
    var citeThreshold = this.get('citeThreshold');
    var refThreshold = this.get('refThreshold');
    
    this._cached_citeThreshold = citeThreshold;
    this._cached_refThreshold = refThreshold;
    this._cached_depth = this.get('depth');

    this._cachedContent = content;
    
    this.displayPropertiesDidChange();

  }.observes('content', 'isVisible', 'viewDirection', 'refThreshold', 'depth', 'citeThreshold'),


  /**
    When the displayProperities binding changes, update the view appropriately.

    @observes displayProperties
  
    @param force {boolean} If YES, force a redraw.
    
    @returns {Boolean} Returns NO if there is no guid of if the view is not visible.
  */
  displayPropertiesDidChange: function()
  {
    
    if(!this.get("isVisible") || !this._cachedContent) return NO;

    // Save display properties locally.
    var h = this.displayProperties.height-20;
    var w = this.displayProperties.width-20;
    var x = this.displayProperties.left+20;
    var y = this.displayProperties.top;
    var z = this.displayProperties.zoomValue;
    
    // Set the style and frame of the view. This replaces set('frame', {...}) due to performance reasons.
    this.setStyle({height: h+"px", width: w+'px', left: x+'px', top: y+'px'});
    this._frame = {height: h, width: w, x: x, y: y};
    
    // Set the canvas dimensions.
    this.canvas.style.height = h +"px";
    this.canvas.style.width = w+"px";
    this.canvas.style.left = x+'px';
    this.canvas.style.top = y+'px';
    
    // Save the canvas height and width.
    this._canvasHeight = h;
    this._canvasWidth = w;
    
    // Save the properties as needed.
    this._h = h;
    this._w = w;
    this._x = x;
    this._y = y;
    this._z = z;

    this._render();
    
  }.observes('displayProperties'),
  
  /**
    Collect what needs to be rendered.
    
    Then render the view.

  */
  _render: function()
  {
    this._guidsNeeded = {};
    this._renderTree = {};
    this._deepest = 0;
    this._paperDOMMap = {};
    
    var node = this._buildLevel(this._cachedContent.get('guid'), 0, this._w, 0, 0);
    
    // Now modify the class.
    this._rowHeight = Math.floor(this._h/((Math.min(this._deepest+1, this.get('depth')))));
    
    var styleSheet = this._styleSheet;

    if(this._displayRefs)
    {
      styleSheet.cssRules[0].style.top = this._rowHeight +"px";
      styleSheet.cssRules[0].style.bottom = '';
    }
    else
    {
      styleSheet.cssRules[0].style.top = '';
      styleSheet.cssRules[0].style.bottom = this._rowHeight +"px";
    }
    styleSheet.cssRules[0].style.height = this._rowHeight +"px";
    styleSheet.cssRules[1].style.height = (this._rowHeight-10) +"px";
    
    if(this.canvas.childNodes.length)
      this.canvas.removeChild(this.canvas.childNodes[0]);

    if(node)
    {
      this.canvas.appendChild(node);
    }
    
    // Collect any guids that we need to retrieve from the server.
    var guids = [];
    for(var key in this._guidsNeeded)
    {
      if(guids.indexOf(key) == -1)
      {
        guids.push(key);
      }
    }
    
    if(guids.length > 0)
    {
      Papercube.searchController.set('showRequestSpinner', YES);
      // Now retrieve the next level as needed..
      var callBack = function() { this.redrawParamsDidChange(); }.bind(this, this.get('content'));
      Papercube.adaptor.getPaperDetails(guids, callBack);
      this._cachedContent.set((this._displayRefs ? "maxRefLevel" : "maxCiteLevel"), this._deepest);
    }
    else
    {
      Papercube.searchController.set('showRequestSpinner', NO);
    }
  },
    
  /**
    Recursively draw the tree.
  
    @param guid {string} The guid of the item.
    @param level {Integer} The current level.
    @param parentWidth {Integer} The width of the parent element.
    @param masterLeft {Integer} The left position.
    @param idx {Integer} The position of the relation.
    
    @returns {Array} {DOM Element} Returns the contstructed node to be appended to the parent.
  */
  _buildLevel: function(guid, level, parentWidth, masterLeft, idx)
  {
    // If we have hit the end of what we want to show, bail bail bail.
    if(this._cached_depth < level)
    {
      return null;
    }

    // Get the paper.
    var paper = Papercube.Paper.find(guid);
    var rels = [];
    var displayRefs = this._displayRefs;

    // If the paper exists, then get its references or citations.
    if(paper)
    {
      rels = (displayRefs) ? paper._attributes.references : paper._attributes.citations;
    }
    
    // Log the deepest level so we know what height to apply to all elements.
    if(this._deepest < level) this._deepest = level;

    // If the paper has not been printed before and there is at least 1 pixels for each paper, draw it.
    if(paper)
    {
      var refCount = paper.get('refCount');
      var citeCount = paper.get('citeCount');

      var node = this._node.cloneNode(YES);
      node.className = 'item level'+level;
      node.id = guid;
      if(level !== 0)
        node.style.left = (masterLeft-1)+'px';
      
      node.style.width = (parentWidth-1)+'px';
      
      if(!this._paperDOMMap[guid]) this._paperDOMMap[guid] = [];
      
      this._paperDOMMap[guid].push(node);

      // If the parentWidth is at least 20 px, then output some info.
      if(parentWidth > 20 && paper)
      {
        var textNode = this._textNode.cloneNode(YES);
        textNode.id = guid;
        textNode.innerHTML = paper._attributes.title + '<br/><br/> ['+
        Papercube.pluralizeString(" ref", refCount) + '] [' + 
        Papercube.pluralizeString(" cite", citeCount) + ']';
        node.appendChild(textNode);
      }

      if(!this._renderTree[guid]) this._renderTree[guid] = 0;
      
      this._renderTree[guid]++;
      
      var childCount = rels.length;
      var newRels = [];
      for(var i=0; i<childCount; i++)
      {
        var relGuid = rels[i];
        var child = Papercube.Paper.find(relGuid);
        if(child)
        {
          if(this._cached_citeThreshold <= child.get('citeCount') && 
             this._cached_refThreshold <= child.get('refCount'))
          {
            newRels.push(relGuid);
          }
        }
        else
        {
            this._guidsNeeded[relGuid] = 1;
        }
      }
      
      childCount = newRels.length;
      rels = newRels;
      
      // Calculate the parameters needed for the next level.
      var myWidth = Math.floor(parentWidth/childCount);   
      
      if(myWidth >= 1 && this._renderTree[guid] == 1)
      {
        var diff = parentWidth-(myWidth*childCount);
        var left = 0;
        var nextLvl = level+1;

        for(var i=0; i<childCount; i++)
        {
          var rel = rels[i];
          var w = myWidth;
          if(diff != 0 && i < diff)
          {
            w = myWidth+1;
          }
          var nodeLevel = this._buildLevel(rel, nextLvl, w, left, i);
          if(nodeLevel)
            node.appendChild(nodeLevel);   
          this._renderTree[rel] = 1;
          left += w;
        }
      } 
      // Not sure how to deal with the threshold.. Currently, don't render it just don't show the inspector and a click will refocus to parent.
      else if(this._renderTree[guid] != 1 && myWidth <= 1)
      {
        var node = this._node.cloneNode(YES);
        node.className = 'item stub level'+level;
        node.id = '--1_'+guid;
        node.style.width = (parentWidth-1)+'px';
      }
    }
    // Not sure how to deal with the threshold.. Currently, don't render it just don't show the inspector and a click will refocus to parent.
    else if(this._renderTree[guid] != 1 && myWidth <= 1)
    {
      var node = this._node.cloneNode(YES);
      node.className = 'item stub level'+level;
      node.id = '--1_'+guid;
      node.style.width = (parentWidth-1)+'px';
    }
    
    return node;
  },
  
  /**
     Initalization function.

     Set up DOM nodes to be cloned for the tree. 
     
     Grab the stylesheet.

     Set up the fan menu actions:

     focusedFan: {
       CiteSeer: citeseerFunc,
       Save: saveFunc,
       "Zoom +": zoomInFunc,
       "Zoom -": zoomOutFunc
     }, 
     unfocusedFan: {
       CiteSeer: citeseerFunc,
       Save: saveFunc,
       Refocus: refocusFunc,
       "Zoom +": zoomInFunc,
       "Zoom -": zoomOutFunc
     }     
  */
  init: function()
  {
    
    var refocusFunc = function(evt)
    { 
      Papercube.viewController.setContentToViewFromGUID(this._mouseDownGUID, 'Paper', NO);
    }.bind(this); 

    var citeseerFunc = function(evt)
    { 
      window.open(Papercube.Paper.find(this._mouseDownGUID).get('url'));
    }.bind(this); 

    var saveFunc = function(evt)
    { 
      Papercube.viewController.saveObject(this._mouseDownGUID, 'Paper');
    }.bind(this); 

    var zoomOutFunc = function(evt)
    { 
      Papercube.canvasController.setZoomToPointerLocation(Event.pointerX(evt), Event.pointerY(evt), NO);
    }.bind(this); 
    var zoomInFunc = function(evt)
    { 
      Papercube.canvasController.setZoomToPointerLocation(Event.pointerX(evt), Event.pointerY(evt), YES);
    }.bind(this); 

    Papercube.canvasController.registerFans('papertree',
    {
        focusedFan: {
          CiteSeer: citeseerFunc,
          Save: saveFunc,
          "Zoom +": zoomInFunc,
          "Zoom -": zoomOutFunc
        }, 
        unfocusedFan: {
          CiteSeer: citeseerFunc,
          Save: saveFunc,
          Refocus: refocusFunc,
          "Zoom +": zoomInFunc,
          "Zoom -": zoomOutFunc
        }     
    });

    this._node = document.createElement('div');
    this._textNode = document.createElement('div');
    this._textNode.className = 'item-text';

    // make a new stylesheet
    var ns = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(ns);

    // Safari does not see the new stylesheet unless you append something.
    // However!  IE will blow chunks, so ... filter it thusly:
    if (!window.createPopup) {
       ns.appendChild(document.createTextNode(''));
    }
    var s = this._styleSheet = document.styleSheets[document.styleSheets.length - 1];

    var rules = {
      ".paper_tree_view_tab .item": "{  line-height:10px;  position: absolute;  border:1px solid #666;  cursor:default;} ",
      ".paper_tree_view_tab .item-text": "{  text-align:center;  padding-top:10px;  font-size: 9px;  cursor:default;  overflow: hidden;} "
    };
    
    // loop through and insert
    for (selector in rules) {
       if (s.insertRule) {
          // it's an IE browser
          try { 
             s.insertRule(selector + rules[selector], s.cssRules.length); 
          } catch(e) {}
       } else {
          // it's a W3C browser
          try { 
             s.addRule(selector, rules[selector]); 
          } catch(e) {}
       }               
    }

    sc_super();
    
  }
}) ;
