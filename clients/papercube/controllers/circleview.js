// ==========================================================================
// Papercube.CircleViewController
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  This controls some of the aspects of the CircleView display.

  @extends SC.ArrayController
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
  @static
*/
Papercube.circleViewController = SC.Object.create(
/** @scope Papercube.circleViewController */ {
  
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
    Set the default values for the controller.
  */
  setDefaults: function()
  {
    this.set('refThreshold', this.get('defaultRefThreshold'));
    this.set('citeThreshold', this.get('defaultCiteThreshold'));
  }
  
}) ;
