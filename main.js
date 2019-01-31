"use strict";

//Initialize authorization token in a global context to be used in all requests.
var authToken = "";

//Initialize list of Controllers
const controllerList = ["Dynamic"
,"ActionTypeDefinition"
,"AdvancedFormulaCategories"
,"AdvancedFormulaParameters"
,"AdvancedFormulas"
,"AssessmentDefs"
,"Assessment"
,"AttributeDisplay"
,"BenefitElements"
,"BenefitFields"
,"BenefitGroups"
,"BenefitRisks"
,"BridgeAnalysisGroup"
,"BridgeAnalysisRoad"
,"Bridge"
,"Caption"
,"Cicocntl"
,"Cicoxcpt"
,"CommonList"
,"DataExchangeOption"
,"ElementCategoryDefinition"
,"ElementDeterioration"
,"ElementStateDefinitions"
,"ElemInsp"
,"ExchangeOptionDetail"
,"ExchangeOption"
,"ExportStatus"
,"FlexBenefit"
,"FlexElem"
,"InspectionStatus"
,"MRRActionDefinition"
,"NavigationTab"
,"NavigationTask"
,"NbiExportDef"
,"NbiExportOption"
,"NbiItem"
,"Permissions"
,"Report"
,"ReportSecurity"
,"RolesPermissions"
,"SessionBatch"
,"UserFilterLayout"
,"EnvironmentDefinitions"
,"Filter"
,"GroupAccessFilters"
,"Groups"
,"ElementMaterialsDefs"
,"Context"
,"ContextTable"
,"ControlGroupSecurity"
,"Control"
,"ControlSecurity"
,"Group"
,"ElementInspectionLegacy"
,"ElementStateDefinition"
,"Funding"
,"FundingTargets"
,"ElementChild"
,"LanguageCaption"
,"MetricEnglish"
,"NavigationControlGroup"
,"NavigationControl"
,"Options"
,"OptionsLookup"
,"LayoutField"
,"Layout"
,"DataDict"
,"ElementDefinitions"
,"ElementInspection"
,"ElementTypeDefs"
,"FlexActionSet"
,"HealthIndex"
,"Inspection"
,"MaintActivity"
,"MaintEvent"
,"Multimedia"
,"Parameters"
,"ProgramFunding"
,"Program"
,"ProjectBridge"
,"ProjectCategoryaActions"
,"ProjectCategory"
,"ProjectFunding"
,"ProjectMilestone"
,"Project"
,"ProjectPerformance"
,"ProjectProgram"
,"ProjectWorkItem"
,"Roadway"
,"Roles"
,"StructureUnit"
,"TabSecurity"
,"TaskSecurity"
,"UserGroups"
,"User"
,"UserPermissions"
,"UserRoles"
,"UtilityCriteriaCategory"
,"UtilityCriteriaPoints"
,"WorkCandidate"]


//Fetch list of available databases and populate the dropdown
async function getDB() {

    //Setup dropdown stuff
    let dropdown = document.getElementById("dbDropdown");
    dropdown.length = 0;
    let defaultOption = document.createElement("option");
    defaultOption.text = "Select a Database";
    dropdown.add(defaultOption);
    dropdown.selectedIndex = 0;

    //Setup Request URL
    const dbURL = "http://localhost:9000/api/auth/GetDatabases";

    //Send request to get list of available databases and get back json data
    let response = await fetch(dbURL, {
        method: "GET"
    });
    let result = await response.json();

    // Set response data to create and populate a dropdown list on the page
    let option;
    for (let i = 0; i < result.length; i++) {
        option = document.createElement("option")
        option.text = "db ID: " + result[i].ID + " " + result[i].Name
        option.value = result[i].ID
        dropdown.add(option)
    };
};


//Get list of Databases on page load to be used for the Authorization Request
getDB();


/*Request Authorization token, start the timer, populate list of Controllers in the dropdown
Unhide other Request option containers, and send a request for list of available tables for the Dynamic Controller*/
//TODO: Break this up into smaller functions
async function getAuth() {

    //Get database id value from page
    let dbOption = document.getElementById("dbDropdown");
    let dbValue = dbOption.options[dbOption.selectedIndex].value;

    //Alert if no database is selected
    if (dbValue === "" | dbValue === "Null" | dbValue === "Select a Database") {
        return alert("Please Select a Database First")
    };

    //Setup request url and header info
    const authURL = "http://localhost:9000/api/auth/APILogin";
    let headers = {
        Accept: "application/JSON",
        Authorization: "Basic cG9udGlzOnBvbnRpcw==", //Base64 encoding of the string "pontis:pontis"
        database_id: "'" + dbValue + "'"
    };

    //Set Get Request
    let response = await fetch(authURL, {
        method: "GET",
        headers: headers
    });

    //Process response from the request
    let result = await response.json();

    //Post response data to page
    document.getElementById("authResponse").innerHTML = JSON.stringify(result, undefined, 2);

    //Set auth_token to global var
    authToken = result.auth_token;

    //Reset and start the 1200 sec timer
    /*TODO:  Need to add way to reset timer from here. 
    Issue when getting a new auth token and the timer doesnt reset.  
    Currently when pressing the button before the timer ends it doesn"t stop the function and reset the timer
    */
    authTimer();

    //Populate list of controllers using controllerList List
    let datalist = document.getElementById("controllersList");
    for (let i = 0; i < controllerList.length; i++) {
        let option = document.createElement("option")
        option.value = controllerList[i]
        datalist.appendChild(option)
    };

    //Pass auth token and get list of tables available in the selected database
    await getTables(result.auth_token);

    let hideGetNav = document.getElementById("hideGetDiv");
    let hidePostDiv = document.getElementById("hidePostDiv");
    let hidePutDiv = document.getElementById("hidePutDiv");
    let hideDeleteDiv = document.getElementById("hideDeleteDiv");
    hideGetNav.style.display = "block";
    hidePostDiv.style.display = "block";
    hidePutDiv.style.display = "block";
    hideDeleteDiv.style.display = "block";
};


//1200 second countdown timer to keep track of the authorization window.  Alert user and reset at end of timer. 
function authTimer() {
    let seconds = document.getElementById("countdown").textContent;
    let countdown = setInterval(function () {
        seconds--
        (seconds == 1) ? document.getElementById("plural").textContent = "": document.getElementById("plural").textContent = "s"
        document.getElementById("countdown").textContent = seconds
        if (seconds <= 0) {
            clearInterval(countdown)
            alert("Authorization Token has expired.  Please request a new token")
            document.getElementById("countdown").textContent = 1200
            document.getElementById("authResponse").textContent = ""
        }
    }, 1000);
};



//Get list of available tables and populate a dropdown list for the GET requests
async function getTables(controllerAuthToken) {

    //Setup Request URL and headers
    const tablesURL = "http://localhost:9000/api/DataDict/getTables";
    let headers = {
        Accept: "application/JSON",
        auth_token: controllerAuthToken
    };

    //Send GET Request
    let response = await fetch(tablesURL, {
        method: "GET",
        headers: headers
    });

    //Process response
    let result = await response.text();
    

    //Remove offending characters from the response and convert it to an actual array
    let tableArray = result.replace(/[""\[\]]+/g, "");
    tableArray = tableArray.split(",");

    //Send response data to the tables datalist on the page
    let datalist = document.getElementById("tablesList");
    for (let i = 0; i < tableArray.length; i++) {
        let option = document.createElement("option")
        option.value = tableArray[i]
        datalist.appendChild(option)
    };
};


//TODO: Rewrite this section as a single function
//Toggle GET Request Table Dropdown.  Display only if the "Dynamic" controller is selected and hide otherwise
let getControllersList = document.getElementById("getControllers");
getControllersList.onchange = function () {
    let getHiddenDiv = document.getElementById("getTableDiv");
    if (getControllersList.value === "Dynamic") {
        getHiddenDiv.style.display = "block"
    } else {
        getHiddenDiv.style.display = "none"
    };
};

//Toggle POST Request Table Dropdown.  Display only if the "Dynamic" controller is selected and hide otherwise
let postControllersList = document.getElementById("postControllers");
postControllersList.onchange = function () {
    let postHiddenDiv = document.getElementById("postTableDiv");
    if (postControllersList.value === "Dynamic") {
        postHiddenDiv.style.display = "block"
    } else {
        postHiddenDiv.style.display = "none"
    };
};

//Toggle PUT Request Table Dropdown.  Display only if the "Dynamic" controller is selected and hide otherwise
let putControllersList = document.getElementById("putControllers");
putControllersList.onchange = function () {
    let putHiddenDiv = document.getElementById("putTableDiv");
    if (putControllersList.value === "Dynamic") {
        putHiddenDiv.style.display = "block"
    } else {
        putHiddenDiv.style.display = "none"
    };
};

//Toggle DELETE Request Table Dropdown.  Display only if the "Dynamic" controller is selected and hide otherwise
let deleteControllersList = document.getElementById("deleteControllers");
deleteControllersList.onchange = function () {
    let deleteHiddenDiv = document.getElementById("deleteTableDiv");
    if (deleteControllersList.value === "Dynamic") {
        deleteHiddenDiv.style.display = "block"
    } else {
        deleteHiddenDiv.style.display = "none"
    };
};



//Send a GET Request passing in parameters if included
async function getRequest() {

    //Get table and controller names
    let tableName = document.getElementById("getTables").value;
    let controllerName = document.getElementById("getControllers").value;

    //Build the middle of the URL string depending on if just a controller is selected, or the Dynamic controller is selected
    let restURL

    if (controllerName === "Dynamic") {
        restURL = "Dynamic/" + tableName + "/?"
    } else {
        restURL = controllerName + "?"
    };

    //Get Input values from the form.  Will be used to build the rest of the GET Request URL
    let inputs = document.getElementsByClassName("getInput");
    let formValues = {};

    //Parse the query options inputs and store in the formValues array
    //Will need to add some error handling here for incorrectly formatted input
    for (let i = 0; i < inputs.length; i++) {
        formValues[inputs[i].id] = inputs[i].value
    };

    //Append the values from the formValues array if a value has been entered
    for (let i in formValues) {
        if (formValues.hasOwnProperty(i)) {
            if (formValues[i] === "") {
                continue;
            }
            restURL += i + "=" + formValues[i] + "&"
        }
    };

    restURL = restURL.slice(0, -1) //Needed to remove the last "&" from the string
    
    //Setup GET Request URL and header info
    const getURL = "http://localhost:9000/rest/";
    let headers = {
        Accept: "application/JSON",
        auth_token: authToken
    };

    //Send the GET request
    let response = await fetch(getURL + restURL, {
        method: "GET",
        headers: headers
    });

    //Process response
    let result = await response.json();

    //Post response data to page
    //document.getElementById("getResponse").innerHTML = JSON.stringify(result, undefined, 2);


    //Post response data to page as a Table
    //TODO: Separate this into a separate function

    //Build List of Column Headings
    let col = [];
    for (let i =0; i < result.length; i++) {
        for (let key in result[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        };
    };

    //Build the table using the Column Headings
    let table = document.createElement("table");
    let tr = table.insertRow(-1);

    for (let i = 0; i < col.length; i++) {
        let th = document.createElement("th");
        th.innerHTML = col[i];
        tr.appendChild(th);
    }

    //Add the values to the rows
    for (let i = 0; i < result.length; i++) {

        tr = table.insertRow(-1);

        for (let j = 0; j < col.length; j++) {
            let tabCell = tr.insertCell(-1);
            tabCell.innerHTML = result[i][col[j]];
        }
    }

    //Display table on the page
    let divContainer = document.getElementById("showGetData");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);
};


//Send Post Request
async function postRequest() {

    //Get table and controller names
    let tableName = document.getElementById("postTables").value;
    let controllerName = document.getElementById("postControllers").value;

    //Build the middle of the URL string depending on if just a controller is selected, or the Dynamic controller is selected
    let restURL;

    if (controllerName === "Dynamic") {
        restURL = "Dynamic/" + tableName + "/"
    } else {
        restURL = controllerName + "/"
    };

    //Setup GET Request URL and header info
    const postURL = "http://localhost:9000/rest/";
    let headers = {
        "Accept": "application/JSON",
        "Content-Type": "application/JSON",
        "auth_token": authToken
    };

    //Get JSON formatted input from page
    let postInput = document.getElementById("postInput").value
    //let body = JSON.stringify(postInput);    

    //Send the GET request
    let response = await fetch(postURL + restURL, {
        "method": "POST",
        "headers": headers,
        "body": postInput
    });

    //Process response
    let result = await response.json();

    //Post response data to page
    document.getElementById("postResponse").innerHTML = JSON.stringify(result, undefined, 2);
};





/**********Asset Management Section*************/

//Define list of controllers
const amControllerList = ["bridges", "inspections", "elementDefinitions"]

//Populate list of controllers using amControllerList List
let datalist = document.getElementById("amControllersList");
for (let i = 0; i < amControllerList.length; i++) {
    let option = document.createElement("option")
    option.value = amControllerList[i]
    datalist.appendChild(option)
};


//Setup Get Request
async function getAmRequest() {
    let controllerName = document.getElementById("getAmControllers").value;

    //Setup GET Request URL and header info
    const getURL = "http://localhost:8081/api/" + controllerName;

    let response = await fetch(getURL, {
        method: "GET",
    });

    //Process response
    let result = await response.json();

    //Post response data to page
    document.getElementById("assetManagementResponse").innerHTML = JSON.stringify(result, undefined, 2);
};






/* Hold for future use to compare JSON objects

var compareJSON = function(obj1, obj2) {
var ret = {};
for(var i in obj2) {
    if(!obj1.hasOwnProperty(i) || obj2[i] !== obj1[i]) {
        ret[i] = obj2[i];
    }
}
return ret;
};

var a = { 
"Field A":"1", 
"Field B":"2", 
"Field D":"Something", 
"Field E":"6" 
};

var b = { 
"Field A":"1", 
"Field B":"2", 
"Field C":"3", 
"Field D":"Different" 
};
*/