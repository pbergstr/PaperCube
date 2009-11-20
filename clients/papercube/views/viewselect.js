// ==========================================================================
// Papercube.ViewSelectView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');
require('views/dropdown');

/** @class

  This is the view drop down... it's a bit more complicated than most drop downs.
  
  @extends Papercube.DropDownView
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.ViewSelectView = Papercube.DropDownView.extend(
/** @scope Papercube.ViewSelectView.prototype */ {

  /**
    Specifies what the views pulls its data from. Either viewingMode or viewChoice.
    
    @property {Boolean}
    @default NO
  */
  isViewingModeSelector: NO,

  /**
    Observe viewingMode and set the innerHTML of the button to the viewingMode name if it is that drop down.
    
    @observes viewingMode
  */
  viewingModeDidChange: function()
  {
    if(this.isViewingModeSelector)
    {
      this.button.innerHTML = this.get("viewingMode");
    }
  }.observes('viewingMode'),

  /**
    Observe viewChoice and set the innerHTML of the button to the viewChoice name if it is that drop down.
    
    @observes viewChoice
  */
  viewChoiceDidChange: function()
  {
    if(!this.isViewingModeSelector)
    {
      this.button.innerHTML = this.get("viewChoice");
    }
  }.observes('viewChoice'),
  
  /** 
    If the button has been clicked before show the list, if it is clicked again
    but it has the active class, hide the list.
    
    @param {DOM Event} evt The mouseDown event.
  */
  mouseDown: function(evt)
  {
    if(evt.target.hasClassName('button') && !this.button.hasClassName('active'))
    {
      this.button.addClassName('active');
      this.showList();
    }
    else if(evt.target.hasClassName('button') && this.button.hasClassName('active'))
    {
      this.mouseExited(evt);
    }
  },
  
  /** 
    Depending on the viewing mode, set a viewingChoice or a viewChoice, then hide the list.
    
    @param str {string} The selected item's string.
  */
  selectItem: function(str)
  {
     if(this.isViewingModeSelector)
     {
       Papercube.viewController.setViewingMode(str);
     }
     else
     {
       Papercube.viewController.setViewChoice(str);
     }
     
     // Call super.
     sc_super();
  },
  
  /**
    Show the list. 
    
    Construct the HTML based on the type of list.
  */
  showList: function()
  {
    this.list.innerHTML = '';
    if(this.isViewingModeSelector)
    {
      var items = Papercube.viewController.get('viewingModes');
    }
    else
    {
      var items = Papercube.viewController.get('viewChoices')[Papercube.viewController.get('viewingMode')];  
    }
    this.set('choices', items);
    
    // Call super.
    sc_super();
    
  }  

}) ;
