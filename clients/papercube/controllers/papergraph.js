// ==========================================================================
// Papercube.PaperGraphController
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  Controls the sliders used for the paper graph.

  @extends NodeGraph.NodeGraphDelegate
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
  @static
*/
Papercube.paperGraphController = NodeGraph.NodeGraphDelegate.create(
/** @scope Papercube.paperGraphController */ {

  
  /**
    The increment value for the depth slider. 
    
    @property {Integer}
    @default 1
  */
  depthStep: 1,
  
  /**
    The max value for the depth slider. 
    
    @property {Integer}
    @default 15
  */
  depthValueMax: 15,
  
  /**
    The min value for the depth slider. 
    
    @property {Integer}
    @default 1
  */
  depthValueMin: 1,
  
  /**
    The value for the depth slider. 
    
    @property {Integer}
    @default 1
  */
  depth: 1,

  /**
    The default depth value. 
    
    @property {Integer}
    @default 1
  */
  defaultDepth: 1,
  
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
    @default 0
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
    @default 30
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
  
    @param opt {boolean} If YES, ref, if NO, cite.
  */
  maxStrength: function(opt)
  {
    if(opt)
    {
      this.maxRefStrength();
    }
    else
    {
      this.maxCiteStrength();
    }
  },

  /**
    Route to the appropriate min strength action.
  
    @param opt {boolean} If YES, ref, if NO, cite.
  */
  minStrength: function(opt)  
  {

    if(opt)
    {
      this.minRefStrength();
    }
    else
    {
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
    Increment the depth towards the maximum.
    Take her down!
  */
  maxDepth: function()
  {
    if(this.get('depth') < this.get('depthValueMax'))
      this.set('depth',this.get('depth')+1);
  },

  /**
    Increment the depth towards the maximum.
    
    Rig for surface!
  */
  minDepth: function()
  {
    if(this.get('depth') > this.get('depthValueMin'))
      this.set('depth',this.get('depth')-1);
  },
    
  /**
    Set the default values for the controller.
  */
  setDefaults: function()
  {
    this.set('refThreshold', this.get('defaultRefThreshold'));
    this.set('citeThreshold', this.get('defaultCiteThreshold'));
    this.set('depth', this.get('defaultDepth'));
  }
  

}) ;
