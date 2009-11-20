<?php
/* 
  This PHP script interfaces the PaperCube client application with the MySQL
  database. It constructs the JSON to be returned to the client.

  PAPERS
  searchPapers // summary info only
  getPaperDetails // returns {Array} paper details with authors
  getAllDataForPaper // reutnrs {Array} full paper details.

  AUTHORS:
  searchAuthors // summary info only
  getAuthorDetails // returns {Array} author details
  
  
  All but the 'getAllDataForPaper' action queries the database for GUIDs then
  looks up cached JSON to return to the client.

  @author Peter Bergstrom
  @copyright 2008-2009 Peter Bergström.

  License:  PaperCube is open source software released under   
            the MIT License (see license.js)

*/

// If not debug, then return JSON header.
if(!isset($_GET["debug"]))
{
  header("Content-Type: text/x-json, X-JSON: X-JSON");
}

// Get the action.
$action = (isset($_GET['action'])) ? $_GET['action'] : '';

// Grab the GUID(s)
$guid = '0';
if(isset($_GET['guid']))
{
  $guid = $_GET['guid'];
}
else if(isset($_POST['guid']))
{
  $guid = $_POST['guid'];
}

// Determine the action to execute.
switch($action)
{
  /****************************
    Paper actions.
  ****************************/

  // Search for papers.
  case "searchPapers":
    searchPapers();
    break;
    
  // Get the CACHED details for papers.
  case "getPaperDetails":
    $guids = explode(',', $guid);
    getPapers($guids);
    break;
    
  // Get all the details for papers. NOT cached.
  case "getAllDataForPaper":
    $guids = explode(',', $guid);
    getAllDataForPaper($guids);
    break;
    

  /****************************
    Author actions.
  ****************************/

  // Search for authors.
  case "searchAuthors":
    searchAuthors();
    break;

  // Get the CACHED details for authors.
  case "getAuthorDetails":
    $guids = explode(',', $guid);
    getAuthors($guids);
    break;

  // Return error if no matching action is found.
  default:
    $result = array("status" => 0,  "error" => array("1", 
                    "No action specified!"));
    packageResponse($result);
    break;
}

/*
  Based on the search parameters, find papers.
*/
function searchPapers()
{
  
  $result = array();
  
  // Get the search parameters.
  $key = $_GET["searchKey"];
  $value = $_GET['searchValue'];
  $start = (isset($_GET['queryStart'])) ? $_GET['queryStart'] : '0';
  $limit = (isset($_GET['queryLimit'])) ? $_GET['queryLimit'] : '5';

  
  // If no key or value is specified, return error.
  if(!isset($key) || !isset($value))
  {
    $result = array("status" => 0,  "error" => array("2", "Key or value NOT specified!"));
    packageResponse($result);
    return;
  }
  
  // Construct the query based on the key and value.
  if($key == 'name')
  {
    // Get papers with a non-exact match of an author.
    $query = "SELECT ar.pguid AS guid FROM author_rel ar JOIN authors a ON".      
             "a.guid=ar.aguid WHERE MATCH(a.name) AGAINST('".
              mysql_escape_string($value)."') LIMIT ".$start.", ".$limit;
  }
  else if($key == 'date')
  {
    // Get papers with an exact match of pubyear.
    $query = "SELECT guid FROM `papers` WHERE pubyear='".mysql_escape_string($value)."' LIMIT ".$start.", ".$limit;  
  }
  else
  {
    // Get papers with a non-exact match of any key.
    $query = "SELECT guid FROM `papers` WHERE MATCH(".mysql_escape_string($key).") AGAINST ('".mysql_escape_string($value)."' IN BOOLEAN MODE) LIMIT ".$start.", ".$limit;    
  }

  // Query for the GUIDs.
  $papers = performQuery($query);
  
  // Compile the guids.
  $guids = array();
  while ($row = mysql_fetch_assoc($papers))
  {
    array_push($guids, $row['guid']);
  }
  
  // Get the paper JSON.
  getPapers($guids);
}

/*
  Based on an array of GUIDs, return the cached JSON for papers to the client.
*/
function getPapers($guids)
{
  // Construct the SQL query string.
  $whereClause = "guid='" . implode( "' OR guid='" , $guids) ."'";

  $query = "
  SELECT json
  FROM papercache
  WHERE ".$whereClause;

  // Perform the query.
  $res = performQuery($query);

  // Construct the JSON.
  $jsonResult = array();
  while ($row = mysql_fetch_assoc($res))
  {
    $jsonResult[] = $row['json'];
  }

  // Return the JSON to the client.
  packageJSONResponse(array("data" => $jsonResult, "status" => 1));
}

/*
  Given an array of GUIDs, return non-cached data.
*/
function getAllDataForPaper($guids)
{
  // Construct the query.
  $whereClause = "guid='" . implode( "' OR guid='" , $guids) ."'";

  $query = "SELECT title, type, abstract, language, source, format, ".
           "pubyear as year, guid, fixedyear FROM papers WHERE ".$whereClause;

// Perform the query.
  $res = performQuery($query);

  // Construct the JSON.
  $result = array();
  while ($row = mysql_fetch_assoc($res))
  {
    $row['allDataRetrieved'] = true;
    $result[] = $row;
  }
  
  // Encode the arrays into JSON.
  echo json_encode(array("data" => $result, "status" => 1));
}

/*
  Based on the search parameters, find authors.
*/
function searchAuthors()
{

  $result = array();

  // Get the search parameters.
  $key = $_GET["searchKey"];
  $value = $_GET['searchValue'];
  $start = (isset($_GET['queryStart'])) ? $_GET['queryStart'] : '0';
  $limit = (isset($_GET['queryLimit'])) ? $_GET['queryLimit'] : '5';

  
  // If no key or value is specified, return error.
  if(!isset($key) || !isset($value))
  {
    $result = array("status" => 0,  "error" => array("2", 
                    "Key or value NOT specified!"));
    packageResponse($result);
    return;
  }
  
  // Construct the query based on the key and value.
  if($key == 'title')
  {
    // Get authors with a non-exact match of a title.
    $query = "SELECT DISTINCT ar.aguid AS guid FROM author_rel ar JOIN ".     
             "papers p ON p.guid=ar.pguid WHERE MATCH(p.title) AGAINST('".
             mysql_escape_string($value)."' IN BOOLEAN MODE) LIMIT ".
             $start.", ".$limit;
  }
  else if($key == 'date')
  {
    // Get authors with an exact match of a pubyear.
    $query = "SELECT DISTINCT ar.aguid AS guid FROM author_rel ar JOIN ".   
             "papers p ON p.guid=ar.pguid WHERE p.pubyear = '".
             mysql_escape_string($value)."' LIMIT ".$start.", ".$limit;
  }
  else if($key == 'abstract' || $key == 'subject')
  {
    // Get author with a non-exact match of an abstract or subject.
    $query = "SELECT DISTINCT ar.aguid AS guid FROM author_rel ar JOIN ".     
             "papers p ON p.guid=ar.pguid WHERE MATCH(p.".$key.") AGAINST('".
             mysql_escape_string($value)."') LIMIT ".$start.", ".$limit;
  }
  else
  {
    // Get authors bassed on the author name.
    $query = "SELECT guid FROM `authors` WHERE MATCH(". 
             mysql_escape_string($key).") AGAINST ('".
             mysql_escape_string($value)."' IN BOOLEAN MODE) LIMIT ".
             $start.", ".$limit;    
  }
  

  // Get the authors.
  $authors = performQuery($query);
  
  // Get the GUIDs.
  $guids = array();
  while ($row = mysql_fetch_assoc($authors))
  {
    array_push($guids, $row['guid']);
  }

  // Compile the author JSON.
  getAuthors($guids);
}


/*
  Based on an array of GUIDs, return the cached JSON for authors to the
  client.
*/
function getAuthors($guids)
{
  // Construct the query.
  $whereClause = "guid='" . implode( "' OR guid='" , $guids) ."'";
  $query = "
  SELECT *
  FROM authorcachefull
  WHERE ".$whereClause;

  // Get the JSON based on the GUIDs.
  $res = performQuery($query);
  
  // Compile the JSON.
  $jsonResult = array();
  while ($row = mysql_fetch_assoc($res))
  {
    $jsonResult[] = $row['json'];
  }
  
  // Return the JSON result to the client.
  packageJSONResponse(array("data" => $jsonResult, "status" => 1));
}

/*
  Given a string query, retrieve data from the database.
*/
function performQuery($query)
{
  // Open the database.
  $db = openDB();
  
  // Query the database.
  $queryResult = mysql_query($query, $db);

  // If there is an error, return the error.
  if(!$queryResult)
  {
    $result = array("status" => 0,  "error" => array("6", 
                    "Database query error: " . mysql_error()));
    packageResponse($result);
    exit();
  }

  // Close the database and return the result.
  closeDB($db);
  return $queryResult;
}

/*
  Given a result array, build the cached JSON object and return it.
*/
function packageJSONResponse($result)
{
  
  // Display error.
  if($result['status'] == 0)
  {
    $statString = '"status": "'.$result['status'].'", "error":[\''.
                  $result['error'][0]."', '".$result['error'][1]."']";
  }
  // Display success.
  else
  {
    $statString = '"status":"'.$result['status'].'"';
  }
  
  // Echo the result.
  echo '{'.$statString.', "data":['.implode(',', $result['data'])."]}";
}


/*
  Given non-cached JSON, encode the data and return it.
*/
function packageResponse($result)
{
  echo json_encode($result);
}

/*
  Connect to the database.
*/
function openDB()
{
  //$link = mysql_connect('mysql.peterbergstrom.com', 'citeseer', '123456');
  $link = mysql_connect('localhost', 'thesis', '');
  if (!$link) {
    $result = array("status" => 0,  "error" => array("5", 
                    "Unable to connect to database."));
    packageResponse($result);
    exit();
}
  mysql_select_db("citeseer", $link);
  return $link;
}

/*
  Disconnect form the database.
*/
function closeDB($link)
{
  mysql_close($link);
}

?>