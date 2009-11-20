// ==========================================================================
// Papercube
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

// This is the function that starts Papercube.  
function main() 
{
  
  // Block IE for now.
  if (SC.isIE())
  {
    alert("Papercube is currently not compatible with Internet Explorer.\n\nPlease use Firefox 3+, Safari 3+, Webkit, or Google Chrome.");
    return;
  }
  
  // Block Firefox 2 or below.
  if (SC.isFireFox() && SC.Platform.Firefox < 3)
  {
    alert("To get the best user experience possible, please upgrade your browser.\n\nPlease use Firefox 3+, Safari 3+, Webkit, or Google Chrome.");
  }
  
  if(navigator.userAgent.indexOf('Chrome') != -1)
  {

    SC.isChrome = YES;
  }
  
  
  // Awake the app.
  SC.page.awake() ;

  // Fade out the loading div.
  if(!Papercube.viewController.parseHash())
    setTimeout("fadeLoadingDiv()", 1000);
  else {
    Papercube.set("stillLoading", NO);
    $('bottom').addClassName('bottom-view-visible');
    SC.page.topView.addClassName('top-view-visible');
    SC.page.leftView.removeClassName('left-view-hidden');
  }
  
  // Read the saved items cookie.
  Papercube.viewController.readSavedItemsCookie();

  document.title = "PaperCube - Peter Bergström";

  document.body.oncontextmenu = function(){ return false; };
  
  // For some reason I have to loop through the class names. If I just use replace it doesn't work.
  if(navigator.userAgent.indexOf('Chrome') != -1)
  {
    var className = '';
    var c = document.body.className.split(' ');
    
    for(var i=0; i<c.length; i++)
    {
      if(c[i] === 'webkit')
      {
        className +='chrome ';
      }
      else
      {
        className += c[i]+' ';
      }
    }
    document.body.className = className;
    SC.isChrome = YES;
  }
} 


/**
  Loading div animation step 1.
*/
function fadeLoadingDiv()
{
  SC.page.loadingView.addClassName('faded');
  $('bottom').addClassName('bottom-view-visible');
  SC.page.topView.addClassName('top-view-visible');
  SC.page.leftView.removeClassName('left-view-hidden');
  SC.page.leftView.addClassName('left-view-visible');
  setTimeout("hideLoadingDiv()", 1200);
} 

/**
  Loading div animation step 2.
*/
function hideLoadingDiv()
{
  SC.page.canvas.removeClassName('faded');
  SC.page.canvas.noContent.addClassName('show');
  Papercube.set("stillLoading", NO);
  Papercube.viewController.showDefaultView();
  
  Papercube.viewController.showVideo();
}

