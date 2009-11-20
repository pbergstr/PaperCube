// ==========================================================================
// Papercube.DropdownView
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core');

/** @class

  This is a generic drop down. It is custom and not based on any SC drop down.

  @extends SC.View
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
*/
Papercube.DropDownView = SC.View.extend(
/** @scope Papercube.DropDownView.prototype */ {

  /**
    Empty element is an empty DIV.

    @property {String}
    @default "[
                    '<div class="button">',
                    '</div>',
                    '<div class="list">',
                    '<div>'
                 ]"
  */

  // The empty element contains a button div and list div. You click on the button to reveal the list.
  emptyElement: [
                  '<div class="button">',
                  '</div>',
                  '<div class="list">',
                  '<div>'
               ].join(''),

  /**
   Outlets for author stat view.

    ["button", "list"]
 */
  outlets: ["button", "list"],

  /**
    This is the DIV element that forms the drop down.

    @outlet {DOM Element} '.list?'
  */
  list: ".list?",

  /**
    This is the DIV element that forms the button.

    @outlet {DOM Element} '.button?'
  */
  button: ".button?",

  /** 
    Showing list boolean.
    
    @property {Boolean}
    @default NO
  */
  showingList: NO,
  
  /** 
    If it is a button drop down, it will act as a button unless depressed for 4/5ths of a second.
    
    @property {Boolean}
    @config
    @default YES
    @default NO
  */
  isButton: NO,
  
  /** 
    The label of the button as displayed in the HTML.
    
    @property {String}
    @config
    @default 'Button'
  */
  buttonLabel: 'Button',

  /** 
    The action of the button.
    
    @property {Function}
    @config
  */
  buttonAction: null,
  
  /** 
    The action of the selection.
    
    @property {Function}
    @config
  */
  selectionAction: null,
  
  /** 
    This is a function that generates your list on the fly. Used instead of a binding to choices if present.
    
    @property {Function}
    @config
  */
  lazyListGenFuncFunc: null,
  
  /** 
    The scope of the function calls, can be set to a controller, or something else.
    
    @property {Function}
    @config
    @default this
  */
  funcScope: this,
  
  /** 
    Selected value, bind to this.
    
    @property {String}
    @config
    @default 'generic'
  */
  value: "generic",
  
  /** 
    Orientation can either be up or down. Default is down.
    
    @property {Boolean}
    @config
    @default YES
    @default YES
  */
  orientationDown: YES,

  /** 
    Sets if the button is enabled or not, if it is disabled, it will be grayed out.
    
    @property {Boolean}
    @default YES
  */
  isEnabled: YES,

  /** 
    Indication that the mousedown event has happened. Used for the isButton variation.
    
    @property {Boolean}
    @default NO
  */
  _mouseDownHappened: NO,

  /** 
    Choices, bind to this.
    
    @property {Array}
    @config
    @default ["default1", "default2"]
  */
  choices: ["default1", "default2"],

  /**
    Observe value and set the innerHTML of the button.

    @observes isEnabled
  */
  isEnabledDidChange: function()
  {
    this.setClassName('disabled', !this.get('isEnabled'));
  }.observes('isEnabled'),

  /**
    Observe value and set the innerHTML of the button.

    @observes value
  */
  valueDidChange: function()
  {
    if(!this.isButton)
    {
      this.button.innerHTML = this.get("value");
    }
  }.observes('value'),

  /** 
    Handle the mouseDown event. 
    
    If the button has been clicked before show the list. If it is clicked again but it has the active class, hide the list.
    
    @param {DOM Event} evt The mouseDown event.
  */
  mouseDown: function(evt)
  {
    // If the button is not enabled, don't do anything.
    if(!this.get('isEnabled')) return;

    if(!this.isButton)
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
    }
    else
    {

      this.button.addClassName('active');
      this._mouseDownHappened = YES;
      setTimeout(this._showList.bind(this), 800);
    }
  },
  
  /** 
    Select an item if the mouseUp event is on the list.
    
    @param {DOM Event} evt The mouseUp event.
  */
  mouseUp: function(evt)
  {
    // If the button is not enabled, don't do anything.
    if(!this.get('isEnabled')) return;

    if(!this.isButton)
    {
      // If it is a normal drop down. Select the item.
      if(evt.target.hasClassName('list-item'))
      {
        this.selectItem(evt.target.innerHTML);
      }
    }
    else
    {
      // If you click the button, do the action for the button.
      if(evt.target.hasClassName('button') && !this._showingList)
      {
        this._mouseDownHappened = NO;
        if(this.buttonAction)
        {
          this.buttonAction.bind(this.funcScope)();
        }
      }
      
      // If it is a list click, do the select action.
      else if(evt.target.hasClassName('list-item'))
      {
        this.selectItem(evt.target.innerHTML);
        this._mouseDownHappened = NO;
      }
    }
  },

  /** 
    Hide the list and remove the active class.
    
    @param {DOM Event} evt The mouseExited event.
  */
  mouseExited: function(evt)
  {
    this.list.style.display = "none";
    this._showingList = NO;
    this.button.removeClassName('active');
    this._mouseDownHappened = NO;
  },

  /** 
    Show list if delayed enough.
  */
  _showList: function()
  {
    if(this._mouseDownHappened)
    {
      this._showingList = YES;
      this.showList();
    }
  },
  
  /** 
    Select the value, then hide the list.
    
    @param str {string} The selected item's string.
  */
  selectItem: function(str)
  {
    // If there is a custom select action, execute it.
    if(this.selectAction)
    {
      this.selectAction.bind(this.funcScope, str)();
    }
    
    // If there is NO selectAction, set the value.
    else
    {
      
      this.set("value", str);
    }
    this._showingList = NO;
    this.list.style.display = "none";
  },

  /**
    Show the list. 
    
    Construct the HTML based on the type of list.
  */
  showList: function()
  {
    this.list.innerHTML = '';
    var items = [];
    
    if(this.lazyListGenFunc)
    {
      items = this.lazyListGenFunc.bind(this.funcScope)();
    }
    else
    {
      items = this.get('choices');
    }
    
    var innerHTML = [];
    for(var i=0; i < items.length; i++)
    {
      innerHTML.push('<div class="list-item">'+items[i]+'</div>');
    }
    this.list.innerHTML = innerHTML.join('');
    if(!this.get("orientationDown"))
    {
      this.list.style.top = -((items.length+1)*18)+'px';
    }
    this._showingList = YES;
    if(items.length > 0)
    {
      this.list.style.display = "block";
    }
  },

  /** 
    Initialization function. 
    
    Set the innerHTML to the emptyElement. This is done to get around
    a SC bug that uses default HTML in the Ruby helper instead of the 
    emptyElement like it should.
  */
  init: function()
  {
    this.set("innerHTML", this.emptyElement);
    this.addClassName("drop-down");
    this.setClassName("down-orientation", this.get("orientationDown") && !this.get('isButton'));
    this.setClassName("up-orientation", !this.get("orientationDown") && !this.get('isButton'));
    

    sc_super();
    this.list.style.display = "none";

    // If the drop down is a button, then set the label since it won't ever change.
    if(this.isButton)
    {
      this.button.innerHTML = this.buttonLabel;
    }
  }
}) ;
