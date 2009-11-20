// ==========================================================================
// Papercube.adaptor
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

require('core'); 

/** @class Papercube.adaptor

  The adaptor object controls the interaction between Papercube and the server
  back end.

  Desired Actions:

  PAPERS
  searchPapers // summary info only
  getPaperDetails // returns {Array} paper details with authors
  getAllDataForPaper // reutnrs {Array} full paper details.
  
  AUTHORS:
  searchAuthors // summary info only
  getAuthorDetails // returns {Array} author details

  This list of actions will probably be modified, expanded, and reduced as the project develops.

  @extends SC.Server
  @author Peter Bergstrom
  @version 1.0
  @copyright 2008-2009 Peter Bergström.
  @static
*/

Papercube.adaptor = SC.Server.create(
/** @scope Papercube.adaptor */{
  
  /**
    The base API path is specified here and it will be automatically added to requests.
    
    @property {String}
    @default '/api/request.php'
  */
  base: '/api/request.php',

  /**
    This is the application prefix. It is used when loading data into the SC Store.
    
    @property {Array}
    @default ['Papercube']
  */
  prefix: ["Papercube"],
  
  /**
    This allows the tracking of which query result should be loaded from the SC Store. Many 
    requests could be in flight and you may want to match the latest request easily.
    
    @property {Integer}
    @default 0
  */
  requestIndex: 0,
  
  /**
    List of requests. 
    
    @property {Object}
  */
  requests: 
  {
     searchPapers: // summary info only
     {
 	 	   action: 'searchPapers',
 			 onSuccess: 'Papercube.adaptor.searchPapersSuccess', onError: 'Papercube.adaptor.handleError', onFailure: 'Papercube.adaptor.handleFailure'	
     },
     getPaperDetails: // returns {Array} paper details with authors
     {
 	 	   action: 'getPaperDetails',
 			 onSuccess: 'Papercube.adaptor.getPaperDetailsSuccess', onError: 'Papercube.adaptor.handleError', onFailure: 'Papercube.adaptor.handleFailure'	
     },
     getAllDataForPaper: // returns {Array} paper details with authors
     {
 	 	   action: 'getAllDataForPaper',
 			 onSuccess: 'Papercube.adaptor.getPaperDetailsSuccess', onError: 'Papercube.adaptor.handleError', onFailure: 'Papercube.adaptor.handleFailure'	
     },
     searchAuthors: // summary info only
     {
 	 	   action: 'searchAuthors', 
 			 onSuccess: 'Papercube.adaptor.searchAuthorsSuccess', onError: 'Papercube.adaptor.handleError', onFailure: 'Papercube.adaptor.handleFailure'	
     },
     getAuthorDetails: // returns {Array} author details
     {
 	 	   action: 'getAuthorDetails', 
 			 onSuccess: 'Papercube.adaptor.getAuthorDetailsSuccess', onError: 'Papercube.adaptor.handleError', onFailure: 'Papercube.adaptor.handleFailure'	
     }
  },

  /**
    Searches against a key and value in the database for papers. 
  
    @param searchKey {string} The field key that is searched against.
    @param searchValue {string} The field value that is search against.
    @param sc {Integer} The searchCount parameter, it is used for determining what is shown in search list.
    @param start {Integer} The start index.
    @param limit {Integer} The limit.
    
    @returns {Boolean} Returns NO if there is an error.
  */
  searchPapers: function(searchKey, searchValue, sc, start, limit)
  {
    console.log("searchPapers@Papercube.adaptor");

    if(searchKey == null)
    {
      console.log("No searchKey specified, aborting!");
      return NO;
    }
    var requestURL = "searchKey=" + encodeURIComponent(searchKey)  + "&searchValue="+ encodeURIComponent(searchValue)+"&queryStart="+start+"&queryLimit="+limit+"&sc="+sc;
    this.request(this.requests.searchPapers, requestURL);
  },

  
  /** 
    When the searchPapers action is successful, you want to display the results in the search list.
    
    @param response {Object} The response object from the AJAX request.
  */
  searchPapersSuccess: function(response)
  {
    console.log("searchPapersSuccess@Papercube.adaptor");
    Papercube.searchController.displayResults();
  },

  /**
    Call back function for getPaperDetails.
    @property {Function}
  */
  _getPaperDetailsCallback: null,

  /** 
    Get the details of a given paper.
    
    @param guid {string} The guid parameter could also be an array of guids if desired.
    @param callBack {Function} The callBack function is called when the request is successful.
  */
  getPaperDetails: function(guid, callBack)
  {
    console.log("getPaperDetails@Papercube.adaptor");
    Papercube.adaptor._getPaperDetailsCallback = callBack;
    
    // If there are multiple requests, flatten the guids to be easily consumed by the server.
    guid = this._handleMult(guid);

    this.request(this.requests.getPaperDetails, '', {guid: guid});
  },
  
  /** 
    Get the ALL details of a given paper.
    
    @param guid {string} The guid parameter could also be an array of guids if desired.
    @param callBack {Function} The callBack function is called when the request is successful.
  */
  getAllDataForPaper: function(guid, callBack)
  {
    console.log("getAllDataForPaper@Papercube.adaptor");
    Papercube.adaptor._getPaperDetailsCallback = callBack;
    
    // If there are multiple requests, flatten the guids to be easily consumed by the server.
    guid = this._handleMult(guid);

    this.request(this.requests.getAllDataForPaper, '', {guid: guid});
  },
  
  /** 
    When the getPaperDetails action is successful, you want to display the results in the search list.
    
    @param response {Object} The response object from the AJAX request.
  */
  getPaperDetailsSuccess: function(response)
  {
    if(Papercube.adaptor._getPaperDetailsCallback)
    {
      Papercube.adaptor._getPaperDetailsCallback();
    }
  },

  /**
    Searches against a key and value in the database for authors. 
  
    @param searchKey {string} The field key that is searched against.
    @param searchValue {string} The field value that is search against.
    @param sc {Integer} The searchCount parameter. Used for determining what is shown in search list.
    @param start {Integer} The start index.
    @param limit {Integer} The limit.

    @returns {Boolean} Returns NO if there is an error.
  */
  searchAuthors: function(searchKey, searchValue, sc, start, limit)
  {
    console.log("searchAuthors@Papercube.adaptor");

    var requestURL = '';

    if(searchKey == null)
    {
      console.log("No searchKey specified, aborting!");
      return NO;
    }
    requestURL = "searchKey=" + encodeURIComponent(searchKey) +"&searchValue=" + encodeURIComponent(searchValue)+"&queryStart="+start+"&queryLimit="+limit+"&sc="+sc;
    this.request(this.requests.searchAuthors, requestURL);
  },
  
  /** 
    When the searchAuthors action is successful, you want to display the results in the search list.
    
    @param response {Object} The response object from the AJAX request.
  */
  searchAuthorsSuccess: function(response)
  {
    console.log("searchAuthorsSuccess@Papercube.adaptor");
    Papercube.searchController.displayResults();
  },

  /**
    Call back function for getAuthorDetails.
    @property {Function}
  */
  _getAuthorDetailsCallBack: null,
  
  /** 
    Get the details of a given author.
    
    @param guid {string} The guid parameter could also be an array of guids if desired.
    @param callBack {Function} The callBack function is called when the request is successful.
  */
  getAuthorDetails: function(guid, callBack)
  {
    console.log("getAuthorDetails@Papercube.adaptor");

    // Register callback.
    Papercube.adaptor._getAuthorDetailsCallBack = callBack;

    // If there are multiple requests, flatten the guids to be easily consumed by the server.
    guid = this._handleMult(guid);
    var requestURL = "guid="+guid;
    this.request(this.requests.getAuthorDetails, requestURL);
  },
  
  /** 
    When the getAuthorDetails action is successful, you want to display the results in the search list.
    
    @param response {Object} The response object from the AJAX request.
  */
  getAuthorDetailsSuccess: function(response)
  {
    // Nothing to do here yet.
    if(Papercube.adaptor._getAuthorDetailsCallBack)
    {
      Papercube.adaptor._getAuthorDetailsCallBack();
    }
  },

  /** 
    Converts an array of guids to a comma separated string of guids, if it is not an array, it is just return as is.
    
    @param {Object|String} object The potential array of guids. 
    
    @returns {String} The guids string.
  */
  _handleMult: function(object)
  {
    if(typeof object == 'object')
    {
      object = object.join(',');
    }
    return object;
  },
  
  /**
    Create the request and call the server. 
  
    @param requestHash {Object} The request parameters.
    @param url {string} The url for the request.
    @param params {Object} The parameters for the request.
  */
  request: function(requestHash, url, params)
  {
    // Augment the URL with the base parameter.
    var actionURL = this.base+"?action="+requestHash.action+"&"+url;
	  console.log(actionURL);

    // Call the server using Prototype. At this point, all requests are POSTs.
    new Ajax.Request(actionURL,
      {
        parameters: params,
        method:'post',
        onSuccess: Papercube.adaptor.requestSuccess.bind(Papercube.adaptor, requestHash),
        onError: Papercube.adaptor.requestError.bind(Papercube.adaptor, requestHash),
        onFailure: Papercube.adaptor.requestFailure.bind(Papercube.adaptor, requestHash)
      });
  },
  
  /**
    Generic success, parse the JSON and insert it into the SC Store, then pass it along to the custom success handler for the request.
  
    @param requestHash {Object} The request parameters.
    @param transport {Object} The AJAX request object.

    @returns {Boolean} Returns NO if there is an error.
  */
  requestSuccess: function(requestHash, transport)
  {
    // Get the result and eval it. Then check the status of the response.
    var resultText = transport.responseText;
    var s = new Date().getTime();
    
    var json = eval('(' + resultText.replace(/[\n\r\t]/g) + ')'); // remove newlines and other baddies.
    console.log("eval time: " + (new Date().getTime()-s));

    // Check the status of the response.
    if(!this.evaluateStatus(json))
    {
      return NO;
    }

    if(requestHash.action == "searchPapers" || requestHash.action == "searchAuthors")
    {
      var dLen = json.data.length;
      var sc = Papercube.searchController._sc;
      for(var i=0; i<dLen; i++)
      {
        json.data[i].sc = sc;
      }
    }
    
    // Import the records into SC Store.
    var s = new Date().getTime();
    this.importRecords(json.data);
    console.log("import time: " + (new Date().getTime()-s));
    
    // Call the action's success handler.
    eval(requestHash.onSuccess)(json.data);
    
    // Hide the request spinner.
    // Papercube.searchController.set('showRequestSpinner', NO);
  },

  /**
    Generic error, then pass it along to the generic error handler for the request.
  
    @param requestHash {Object} The request parameters.
    @param transport {Object} The AJAX request object.

    @returns {Boolean} Returns NO if there is an error.
  */
  requestError: function(transport, requestHash)
  {
    var resultText = transport.responseText;
    var json = eval('(' + string.replace(/[\n\r\t]/g) + ')'); // remove newlines and other baddies.

    // Check the status of the response.
    if(!this.evaluateStatus(json))
    {
      return NO;
    }

    // Call the action's error handler.
    eval(requestHash.onError)(json);

    // Hide request spinner.
    Papercube.searchController.set('showRequestSpinner', NO);
  },

  /**
    Generic error handler.
  
    @param response {Object} The request response.
    @param transport {Object} The AJAX request object.
  */
  handleError: function(response, result)
  {
    console.log("Server ERROR");
  },

  /**
    Generic failure, then pass it along to the generic failure handler for the request.
  
    @param requestHash {Object} The request parameters.
    @param transport {Object} The AJAX request object.

    @returns {Boolean} Returns NO if there is an error.
  */
  requestFailure: function(requestHash, transport)
  {
    var resultText = transport.responseText;
    var json = eval('(' + string.replace(/[\n\r\t]/g) + ')'); // remove newlines and other baddies.
    // Check the status of the response.
    if(!this.evaluateStatus(json))
    {
      return NO;
    }

    // Call the action's failure handler.
    eval(requestHash.onFailure)(json);

    // Hide request spinner.
    // Papercube.searchController.set('showRequestSpinner', NO);
  },
  
  /**
    Generic failure handler.
  
    @param response {Object} The request response.
    @param transport {Object} The AJAX request object.
  */
  handleFailure: function(response, result)
  {
    console.log("Server FAILURE");
  },
  
  /**
    Evaluate status of the response.
  
    @param json {Object} The request response JSON object.
    
    @returns {Boolean} Returns YES if NO error or returns NO if there is an error.
  */
  evaluateStatus: function(json)
  {
    switch(json.status)
    {
	    case 0: 
		    console.log("API request error: " + json.error[0] + " - " + json.error[1]);
		    return NO;
      default:
        console.log("Success: " + json.status);
        break;
    }
    return YES;
  },

  /**
    Import records into the SC Store.
  
    @param clientData {Object} Data that can be imported to the store.
  */
  importRecords: function(clientData)
  {
    // If there is client data, import it.
    if(clientData && clientData.length > 0)
    {
      console.log("Importing " + clientData.length + " records");
      this.refreshRecordsWithData(clientData,SC.Record,null,NO);
    }
  }
});
