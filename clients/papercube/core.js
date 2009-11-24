// ==========================================================================
// Papercube
//
// License:  PaperCube is open source software released under 
//           the MIT License (see license.js)
// ==========================================================================

/**
 @namespace
 
 The Papercube namespace.
 */
Papercube = SC.Object.create({

  // This will create the server for your application.  Add any namespaces
  // your model objects are defined in to the prefix array.
  server: SC.Server.create({ prefix: ['Papercube'] }),

  // When you are in development mode, this array will be populated with
  // any fixtures you create for testing and loaded automatically in your
  // main method.  When in production, this will be an empty array.
  FIXTURES: []

}) ;

/** 
  Pluralize string function.
*/
Papercube.pluralizeString = function(string, count)
{
  return (count) + string + ((count != 1) ? 's' : '');
};

/*
  CONSTANTS FOR NODE GRAPH VIEW
*/
var NODE = 0;
var EDGE = 1;
var TEXT = 2;
var EDGETEXT = 4;
var REL = 3;
var NODEGRAPH_DEFAULT_SCALE = 10;
var NODEGRAPH_USE_CHILDREN_OFFSET = YES;
var NODEGRAPH_OFFSET_PERCENT = .40;


/*
  CONSTANTS FOR PAPERS PER YEAR VIEW
*/
var YEARLINE = 5;
var YEARTEXT = 6;
var PERYEAR_DEFAULT_SCALE = 20;
