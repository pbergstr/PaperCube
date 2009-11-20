// ==========================================================================
// Papercube.AuthorPaperController
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  Controls the sliders used for the author papers.

  @extends NodeGraph.NodeGraphDelegate
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
  @static
*/
Papercube.authorPaperController = NodeGraph.NodeGraphDelegate.create(
/** @scope Papercube.authorPaperController.prototype */ {

  /**
    The increment value for the refThreshold slider. 
    
    @property {Integer}
    @default 1
  */
  refThresholdStep: 1,

  /**
    The max value for the refThreshold slider. 
    
    @property {Integer}
    @default 30
  */
  refThresholdValueMax: 30,

  /**
    The min value for the refThreshold slider. 

    @property {Integer}
    @default 0
  */
  refThresholdValueMin: 0,

  /**
    The value for the refThreshold slider. 
    
    @property {Integer}
    @default 30
  */
  refThreshold: 0,

  /**
    The default refThreshold value. 
    
    @property {Integer}
    @default 0
  */
  defaultRefThreshold: 0,


  /**
    The increment value for the citeThreshold slider. 
    
    @property {Integer}
    @default 1
  */
  citeThresholdStep: 1,

  /**
    The max value for the citeThreshold slider. 
    
    @property {Integer}
    @default 1
  */
  citeThresholdValueMax: 30,

  /**
    The min value for the citeThreshold slider. 
    
    @property {Integer}
    @default 0
  */
  citeThresholdValueMin: 0,

  /**
    The value for the citeThreshold slider. 
    
    @property {Integer}
    @default 0
  */
  citeThreshold: 0,

  /**
    The default citeThreshold value. 
    
    @property {Integer}
    @default 0
  */
  defaultCiteThreshold: 0,

  /**
    The increment value for the startYearThreshold slider. 

    @property {Integer}
    @default 1
  */
  startYearThresholdStep: 1,

  /**
    The max value for the startYearThreshold slider. 

    @property {Integer}
    @default new Date().getFullYear()
  */
  startYearThresholdValueMax: (new Date().getFullYear()-1960),

  /**
    The min value for the startYearThreshold slider. 

    @property {Integer}
    @default 0
  */
  startYearThresholdValueMin: 0,

  /**
    The value for the startYearThreshold slider. 

    @property {Integer}
    @default 1960
  */
  startYearThreshold: 1960,

  /**
    The value for the startYearThreshold slider. 

    @property {Integer}
    @default 0
  */
  startYearThresholdValue: 0,

  /**
    The default startYearThreshold value. 

    @property {Integer}
    @default 0
  */
  defaultStartYearThreshold: 0,

  /**
    The increment value for the endYearThreshold slider. 

    @property {Integer}
    @default 1
  */
  endYearThresholdStep: 1,

  /**
    The max value for the endYearThreshold slider. 

    @property {Integer}
    @default 100
  */
  endYearThresholdValueMax: (new Date().getFullYear()-1960),

  /**
    The min value for the endYearThreshold slider. 

    @property {Integer}
    @default 0
  */
  endYearThresholdValueMin: 0,

  /**
    The value for the endYearThreshold slider. 

    @property {Integer}
    @default 100
  */
  endYearThresholdValue: (new Date().getFullYear()-1960),

  /**
    The value for the endYearThreshold slider. 

    @property {Integer}
    @default new Date().getFullYear()
  */
  endYearThreshold: new Date().getFullYear(),

  /**
    The default endYearThreshold value. 

    @property {Integer}
    @default 0
  */
  defaultEndYearThreshold: (new Date().getFullYear()-1960),
  
  /**
    Called by the NodeGraph instance when a mouseDown is triggered.
    
    @param {DOM Event} evt The mouseDown event.
    @param {NodeGraph.NodeGraphView} The NodeGraph view.
    @param guid {String} The guid of the node.
  */
  nodeGraphDidMouseDown: function(evt, view, guid) {
    var type = evt.target.getAttribute('type');
    if(guid && type)
    {
      Papercube.canvasController.showFan(Event.pointerX(evt), 
                                         Event.pointerY(evt), 
                                         view.viewName, (type+"Fan"));
      return YES;
    }
    return NO;
  },

  /**
    Allow for additional customized setup of the NodeGraph view.
    
    @param {NodeGraph.NodeGraphView} nodeGraph The NodeGraph instance.
  */
  finishInitForGraph: function(nodeGraph) {
    Papercube.canvasController.fanForNodeGraph(nodeGraph);
  },
  
  /**
    Route to the appropriate max strength action.
  
    @param opt {boolean} If YES, ref, ff NO, cite.
  */
  maxStrength: function(opt)
  {
    if(opt===YES)
    {
      this.maxRefStrength();
    }
    else if(opt === 2)
    {
      this.maxEndYearStrength();
    }
    else if(opt === 3)
    {
      this.maxStartYearStrength();
    } else {
      this.maxCiteStrength();
    }
  },

  /**
    Route to the appropriate min strength action.
  
    @param opt {boolean} If YES, ref, if NO, cite.
  */
  minStrength: function(opt)  
  {
    if(opt === YES)
    {
      this.minRefStrength();
    }
    else if(opt === 2)
    {
      this.minEndYearStrength();
    }
    else if(opt === 3)
    {
      this.minStartYearStrength();
    } else {
      this.minCiteStrength();
    }
  },
  
  /**
    Increment the ref strength towards the maximum.
  */
  maxRefStrength: function()
  {
    if(this.get('refThreshold') < this.get('refThresholdValueMax'))
      this.set('refThreshold', this.get('refThreshold')+1);
  },

  /**
    Increment the ref strength towards the minimum.
  */
  minRefStrength: function()
  {
    if(this.get('refThreshold') > this.get('refThresholdValueMin'))
      this.set('refThreshold', this.get('refThreshold')-1);
  },

  /**
    Increment cite ref strength towards the maximum.
  */
  maxCiteStrength: function()
  {
    if(this.get('citeThreshold') < this.get('citeThresholdValueMax'))
      this.set('citeThreshold', this.get('citeThreshold')+1);
  },

  /**
    Increment cite ref strength towards the miniumum.
  */
  minCiteStrength: function()
  {
    if(this.get('citeThreshold') > this.get('citeThresholdValueMin'))
      this.set('citeThreshold', this.get('citeThreshold')-1);
  },


  /**
    Increment the startYear strength towards the maximum.
  */
  maxStartYearStrength: function()
  {
    if(this.get('startYearThresholdValue') < this.get('startYearThresholdValueMax'))
      this.set('startYearThresholdValue', this.get('startYearThresholdValue')+1);
  },

  /**
    Increment the startYear strength towards the minimum.
  */
  minStartYearStrength: function()
  {
    if(this.get('startYearThresholdValue') > this.get('startYearThresholdValueMin'))
      this.set('startYearThresholdValue', this.get('startYearThresholdValue')-1);
  },

  /**
    Increment the endYear strength towards the maximum.
  */
  maxEndYearStrength: function()
  {
    if(this.get('endYearThresholdValue') < this.get('endYearThresholdValueMax'))
      this.set('endYearThresholdValue', this.get('endYearThresholdValue')+1);
  },

  /**
    Increment the endYear strength towards the minimum.
  */
  minEndYearStrength: function()
  {
    if(this.get('endYearThresholdValue') > this.get('endYearThresholdValueMin'))
      this.set('endYearThresholdValue', this.get('endYearThresholdValue')-1);
  },

  /**
    Set the default values for the controller.
  */
  setDefaults: function()
  {
    this.set('refThreshold', this.get('defaultRefThreshold'));
    this.set('citeThreshold', this.get('defaultCiteThreshold'));
    this.set('startYearThresholdValue', this.get('defaultStartYearThreshold'));
    this.set('endYearThresholdValue', this.get('defaultEndYearThreshold'));
  },
  
  /**
    Set the startYearThreshold
  
    @observes startYearThresholdValue
  */
  startYearThresholdValueDidChange: function() {
    this.set('startYearThreshold', 
      1960+this.get('startYearThresholdValue'));
  }.observes('startYearThresholdValue'),

  /**
    Set the endYearThreshold
  
    @observes endYearThresholdValue
  */
  endYearThresholdValueDidChange: function() {
    this.set('endYearThreshold', 
      1960+this.get('endYearThresholdValue'));
  }.observes('endYearThresholdValue')
  
  

}) ;
