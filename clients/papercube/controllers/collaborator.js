// ==========================================================================
// Papercube.CollaboratorController
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  Controls the sliders used for the author view.

  @extends NodeGraph.NodeGraphDelegate
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
  @static
*/
Papercube.collaboratorController = NodeGraph.NodeGraphDelegate.create(
/** @scope Papercube.collaboratorController */ {

  
  /**
    The increment value for the depth slider. 
    
    @property {Integer}
    @default 1
  */
  depthStep: 1,
  
  /**
    The max value for the depth slider. 
    
    @property {Integer}
    @default 5
  */
  depthValueMax: 5,
  
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
    The increment value for the collabThreshold slider. 
    
    @property {Integer}
    @default 1
  */
  collabThresholdStep: 1,

  /**
    The max value for the collabThreshold slider. 
    
    @property {Integer}
    @default 30
  */
  collabThresholdValueMax: 30,

  /**
    The min value for the collabThreshold slider. 
    
    @property {Integer}
    @default 1
  */
  collabThresholdValueMin: 1,

  /**
    The value for the collabThreshold slider. 
    
    @property {Integer}
    @default 30
  */
  collabThreshold: 30,

  /**
    The default collabThreshold value. 
    
    @property {Integer}
    @default 1
  */
  defaultCollabThreshold: 1,

  /**
    The increment value for the paperThreshold slider. 
    
    @property {Integer}
    @default 1
  */
  paperThresholdStep: 1,

  /**
    The max value for the paperThreshold slider. 
    
    @property {Integer}
    @default 30
  */
  paperThresholdValueMax: 30,

  /**
    The min value for the paperThreshold slider. 
    
    @property {Integer}
    @default 1
  */
  paperThresholdValueMin: 1,

  /**
    The value for the paperThreshold slider. 
    
    @property {Integer}
    @default 30
  */
  paperThreshold: 30,

  /**
    The default paperThreshold value. 
    
    @property {Integer}
    @default 1
  */
  defaultPaperThreshold: 1,
    
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
      this.maxPaperStrength();
    }
    else
    {
      this.maxCollabStrength();
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
      this.minPaperStrength();
    }
    else
    {
      this.minCollabStrength();
    }
  },
    
  /**
    Increment the collaborator strength towards the maximum.
  */
  maxCollabStrength: function()
  {
    if(this.get('collabThreshold') < this.get('collabThresholdValueMax'))
      this.set('collabThreshold', this.get('collabThreshold')+1);
  },

  /**
    Increment the collaborator strength towards the minimum.
  */
  minCollabStrength: function()
  {
    if(this.get('collabThreshold') > this.get('collabThresholdValueMin'))
      this.set('collabThreshold', this.get('collabThreshold')-1);
  },

  /**
    Increment the paper strength towards the maximum.
  */
  maxPaperStrength: function()
  {
    if(this.get('paperThreshold') < this.get('paperThresholdValueMax'))
      this.set('paperThreshold', this.get('paperThreshold')+1);
  },

  /**
    Increment the paper strength towards the minimum.
  */
  minPaperStrength: function()
  {
    if(this.get('paperThreshold') > this.get('paperThresholdValueMin'))
      this.set('paperThreshold', this.get('paperThreshold')-1);
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
    this.set('depth', this.get('defaultDepth'));
    this.set('collabThreshold', this.get('defaultCollabThreshold'));
    this.set('paperThreshold', this.get('defaultPaperThreshold'));
  }
  
}) ;
