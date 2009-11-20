// ==========================================================================
// Papercube.CiteRefController
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  Controls the sliders used for the author view ref/cite view.

  @extends NodeGraph.NodeGraphDelegate
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
  @static
*/
Papercube.citeRefController = NodeGraph.NodeGraphDelegate.create(
/** @scope Papercube.citeRefController */ {
  
  /**
    The increment value for the linkThreshold slider. 
    
    @property {Integer}
    @default 1
  */
  linkThresholdStep: 1,

  /**
    The max value for the linkThreshold slider. 
    
    @property {Integer}
    @default 30
  */
  linkThresholdValueMax: 30,

  /**
    The min value for the linkThreshold slider. 
    
    @property {Integer}
    @default 1
  */
  linkThresholdValueMin: 1,

  /**
    The value for the linkThreshold slider. 
    
    @property {Integer}
    @default 1
  */
  linkThreshold: 1,

  /**
    The default linkThreshold value. 
    
    @property {Integer}
    @default 1
  */
  defaultLinkThreshold: 1,
    
  /**
    The search prompt value. This value is bound in the view.

    @property {String}
  */
  strengthPrompt: '',

  /**
    The reference prompt value.

    'Hide authors who were referenced by focused author less than '
    
    @property {String}
  */
  refPrompt: 'Hide authors who were referenced by focused author less than ',

  /**
    The citation prompt value.

    'Hide authors who referenced the focused author less than '
    
    @property {String}
  */
  citePrompt: 'Hide authors who referenced the focused author less than ',
  
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
    Based on the view direction, set the appropriate search prompt.
  */
  setPrompt: function()
  {
    if(Papercube.viewController.get('viewDirection') == 'References')
    {
      Papercube.citeRefController.set('strengthPrompt', this.get('refPrompt'));
    }
    else
    {
      Papercube.citeRefController.set('strengthPrompt', this.get('citePrompt'));
    }
  },

  /**
    Increment the strength towards the maximum.
  */
  maxStrength: function()
  {
    if(this.get('linkThreshold') < this.get('linkThresholdValueMax'))
      this.set('linkThreshold', this.get('linkThreshold')+1);
  },

  /**
    Increment the strength towards the minimum.
  */
  minStrength: function()
  {
    if(this.get('linkThreshold') > this.get('linkThresholdValueMin'))
      this.set('linkThreshold', this.get('linkThreshold')-1);
  },
  
  /**
    Set the default values for the controller.
  */
  setDefaults: function()
  {
    this.set('linkThreshold', this.get('defaultLinkThreshold'));
    this.setPrompt();
  }
  
  
}) ;
