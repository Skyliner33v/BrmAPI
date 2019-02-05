
/*Update tables in BrM using the AssetManagement Tables
New data will be posted to the AssetManagement Tables
Functions below will send a GET request to the AssetManagement
Will then pass that data to a function for either a POST/PUT/DELETE request and send it to the BrM tables
Will also send a POST request to a separate table on AssetManagement to record the */


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

//Simple function to return database ID value
function getDbValue() {
    const dbOption = document.getElementById("dbDropdown");
    const dbValue = dbOption.options[dbOption.selectedIndex].value;
    if (dbValue != "bridges" || dbValue != "inspections" || dbValue != "elementInspection" || dbValue != "elementDefinitions") {
        alert("Please select a Database first");
        return false;
    } else {
        return dbValue;
    }
};


//Request authorization token
async function getAuth() {
    
    //Get database value
    const dbValue = getDbValue();

    if (dbValue != false) {    
        //Setup request url and header info
        const authURL = "http://localhost:9000/api/auth/APILogin";
        const headers = {
            Accept: "application/JSON",
            Authorization: "Basic cG9udGlzOnBvbnRpcw==", //Base64 encoding of the string "pontis:pontis"
            database_id: "'" + dbValue + "'"
        };

        //Set Get Request
        let response = await fetch(authURL, {
            method: "GET",
            headers: headers
        });

        //Process response from the request and return the authorization token
        let result = await response.json();
        return result.auth_token;
    } else {
        console.log("Error occured in getAuth()")
    }
    
};


//Build the url for any BrM Request
function urlBuilderBRM(controllerName) {

    //Setup Base URL for all Requests
    const baseURL = "http://localhost:9000/rest/";

    //Build the rest of the URL depending on the controller needed
    let restURL = "";
    switch(controllerName) {
        case "bridges":
            restURL = "Bridge";
            break;
        case "inspections":
            restURL =  "Inspection";
            break;
        case "elementInspection":
            restURL =  "ElementInspection";
            break;
        case "elementDefinitions":
            restURL =  "ElementDefinitions";
            break;
    };
    return baseURL + restURL;
};


