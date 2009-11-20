// ==========================================================================
// NodeGraph.animator
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class NodeGraph.animator

  This is the NodeGraph animation engine. This runs every 40 milliseconds.

  @extends SC.Object
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
  @static
*/
NodeGraph.animator = SC.Object.create(
/** @scope NodeGraph.animator.prototype */ {
  
  /**
    The queue of animation subjects.
    
    @property {Array}
  */
  _queue: [],
  
  /**
    A reference to a view's main SVG element. Used to "snap" the element to prevent rendering/display bugs.
    
    @property {DOM Element}
  */
  _svgMain: null,

  /**
    The height of the svg element passed in.
    
    @property {Integer}
  */
  _svgMainHeight: 0,
  
  /**
    Add an array of subjects to be animated. 
    
    Removes all the previous elements and starts the timer if is has been stopped. 
  
    @param arr {Array} The array of animation subjects.
    @param {DOM Element} svgMain  A reference to a view's main SVG element. Used to "snap" the element to prevent rendering/display bugs.
    @param svgMainHeight {Integer} The height of the svg element passed in.
  */
  addSubjects: function(arr, svgMain, svgMainHeight)
  {
    // Save the svg element and height if needed.
    this._svgMain = svgMain;
    this._svgMainHeight = svgMainHeight;
    
    // Add the subjects.
    var arrLen = arr.length;
    for(var i=0; i<arrLen; i++)
    {
      var subject = arr[i];
      this.addSubject(subject.elm, subject.props, subject.duration, subject.isSVG);
    }
  },
  
  /**
    Add a subject to the queue.
  
    @param {DOM Element} elm The subject to be animated.
    @param props {Object}  The properties that are to be animated.
    @param duration {Integer} The duration in milliseconds of the element.
    @param isSVG {boolean} Determines if it is an SVG element or not.
  */
  addSubject: function(elm, props, duration, isSVG)
  {
    
    // Fix the properties so that they are whole numbers.
    var fixed = {};
    for(var key in props)
    {
      if(key.indexOf('opacity') == -1)
      {
         fixed[key] = {start: Math.floor(props[key].start), end: Math.floor(props[key].end)};
      } 
      else
      {
        fixed[key] = {start: props[key].start, end: props[key].end};
      }
    }
    
    // Start time.
    var start = Date.now();
    
    
    var subject = {isCompleted: NO};
    
    // Animation function. Called once during a heart beat.
    subject.animate = function()
    {

      // Calculate the percentage completed.
      var pct = Math.min(100,parseInt((100*(Date.now()-start)/duration),0));
      var done = NO;
      if(pct >= 100)
      {
        done = YES;
        this.isCompleted = YES;
      }
      
      // Loop through the properties and then based on the percentage, set the props.
      for(var propertyName in props)
      {
        var s = fixed[propertyName].start;
        var e = fixed[propertyName].end;
        var attrVal = (done) ? e : Math.floor(s + (e - s)*pct/100);
        
        if(isSVG)
        {
          elm.setAttributeNS(null, propertyName, attrVal);
        }
        else
        {
          if(propertyName == 'opacity')
          {
            elm.style.opacity = attrVal;
          }
          else
          {
            elm.style[propertyName] = attrVal + "px";
          }
        }
      }
    };

    // Push the subject on the queue.
    this._queue.push(subject);
    
  },
  
  /**
    Runs the animation one frame, this is called by the SC Timer object.
    
    @returns {Boolean} Returns NO if the queue is null.
  */
  runAnimation: function()
  {
    var q = this._queue;
    if(!q) return NO;
    var qLen = q.length;
    if(qLen == 0) return NO;
    
    var newQ = [];
    var delQ = [];
    
    // Iterate through each element and if it is completed, add it to be deleted.
    for(var i=0; i<qLen; i++)
    {
      q[i].animate();
      
      if(!q[i].isCompleted)
      {
        newQ.push(q[i]);
      }
      else
      {
        delQ.push(q[i]);
      }
    }
    
    // Delete what needs to be deleted.
    qLen = delQ.length; 
    for(var i=0; i<qLen; i++)
    {
      delete delQ[i];
    }
    
    // Snap the SVG element.
    if(this._svgMain)
    {
      this._svgMain.setAttributeNS(null, 'height', this._svgMainHeight+1);
      this._svgMain.setAttributeNS(null, 'height', this._svgMainHeight);
    }
    
    // Set the new queue.
    this._queue =  newQ;
  },
  
  init: function() {
    sc_super();
    
    setInterval('NodeGraph.animator.runAnimation()', 50);
    
  }
});


