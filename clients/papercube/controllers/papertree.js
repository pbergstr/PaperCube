// ==========================================================================
// Papercube.PaperTreeController
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  This controller is used to control the paper tree view.

  @extends SC.Object
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
  @static
*/
Papercube.paperTreeController = SC.Object.create(
/** @scope Papercube.paperTreeController.prototype */ {

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
    @default 8
  */
  depth: 8,

  /**
    The default depth value. 
    
    @property {Integer}
    @default 8
  */
  defaultDepth: 8,
  
  /**
    The increment value for the refThreshold slider. 
    
    @property {Integer}
    @default 1
  */
  refThresholdStep: 1,

  /**
    The max value for the refThreshold slider.Default 15.

    @property {Integer}
  */
  refThresholdValueMax: 15,

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
    @default 15
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
    @default 0
  */
  citeThresholdValueMax: 15,

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
