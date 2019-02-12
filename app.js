
/*Update tables in BrM using the AssetManagement Tables
New data will be posted to the AssetManagement Tables
Functions below will send a GET request to the AssetManagement
Will then pass that data to a function for either a POST/PUT/DELETE request and send it to the BrM tables
Will also send a POST request to a separate table on AssetManagement to record the */


//Fetch list of available databases and populate the dropdown
async function getDB() {

    //Begin Try block
    try {
        //Setup dropdown stuff
        let dropdown = document.getElementById("dbDropdown");
        dropdown.length = 0;
        let defaultOption = document.createElement("option");
        defaultOption.text = "Select a Database";
        defaultOption.value = "default";
        dropdown.add(defaultOption);
        dropdown.selectedIndex = 0;

        //Setup Request URL
        const dbURL = "http://localhost:9000/api/auth/GetDatabases";

        //Send request to get list of available databases and get back json data
        let response = await fetch(dbURL, {
            "method": "GET"
        });

        //Process the Response
        let result = await response.json();

        // Set response data to create and populate a dropdown list on the page
        let option;
        for (let i = 0; i < result.length; i++) {
            option = document.createElement("option")
            option.text = "db ID: " + result[i].ID + " " + result[i].Name
            option.value = result[i].ID
            dropdown.add(option)
        };
    }
    //Alert if error is encountered
    catch(error) {
        alert("Error connecting to the BrM Database.  Try refreshing the page.");
    };
};

//Get list of Databases on page load to be used for the Authorization Request
getDB();

//Simple function to return database ID value
function getDbValue() {
    const dbOption = document.getElementById("dbDropdown");
    const dbValue = dbOption.options[dbOption.selectedIndex].value;
    return dbValue;
};


//Request authorization token
async function getAuth() {
    
    //Get database value
    const dbValue = getDbValue();

    //Check if a database is selected first.  If not, return a false value
    if (dbValue != "default") {

        //Setup request url and header info
        const authURL = "http://localhost:9000/api/auth/APILogin";
        const headers = {
            "Accept": "application/JSON",
            "Authorization": "Basic cG9udGlzOnBvbnRpcw==", //Base64 encoding of the string "pontis:pontis"
            "database_id": "'" + dbValue + "'"
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
        return false;  
    }
    
};


//Create headers to be used in any BrM Request
async function headerBuilderBRM() {
    //Get authorization token //Add this to the header instead
    const authToken = await getAuth();

    if (authToken != false) {
        let headers = {
            "Accept": "application/JSON",
            "auth_token": authToken
        };
        return headers;

    } else {
        return false;
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

//Send PSOT request to BrM API and return results
async function brmGetRequest(controllerName, body) {

    //Get URL for BrM Requests
    const brmURL = urlBuilderBRM(controllerName);

    //Get Headers for BrM Requests
    const headers = await headerBuilderBRM();

    //Check if the headers value is correctly formed.  If not, a database was not selected from the list. 
    if (headers != false) {
        try {
            //Send GET Request
            let brmResponse = await fetch(brmURL, {
                "method": "POST",
                "headers": headers,
                "body": body
            });

            //Process response
            return await brmResponse.json();
        }
        catch(error) {
            console.log("Error sending GET request to " + controllerName);
        };

    } else {
        alert("Please select a database first")
    };
};



//Send GET request to Asset Management API and return results
async function amGetRequest(controllerName) {

    //Setup AssetManagement GET request URL
    const amURL = "http://localhost:8081/api/" + controllerName;

    //Send GET Request
    const amResponse = await fetch(amURL, {
        method: "GET",
    });

    //Return the response
    return await amResponse.json();
};



//Update Table in BrM from data in AssetManagement depending on which button(controller) was selected.
async function updateTable(controllerName) {

    /**Only new data will be sitting in the AssetManagement tables.  The ETL will truncate the table before populating it 
    * with new data from the BPO databases
    */

    //Get new data from Assetmanagement Tables API
    const amResult = await amGetRequest(controllerName);

    //Send POST request to the BrM tables
    const brmResult = await brmGetRequest(controllerName, amResult);

    console.log(brmResult);





};



//Hold for future use
//Send GET request to BrM API and return results
async function brmGetRequest(controllerName) {

    //Get URL for BrM Requests
    const brmURL = urlBuilderBRM(controllerName);

    //Get Headers for BrM Requests
    const headers = await headerBuilderBRM();

    //Check if the headers value is correctly formed.  If not, a database was not selected from the list. 
    if (headers != false) {
        try {
            //Send GET Request
            let brmResponse = await fetch(brmURL, {
                "method": "GET",
                "headers": headers,
            });

            //Process response
            return await brmResponse.json();
        }
        catch(error) {
            console.log("Error sending GET request to " + controllerName);
        };

    } else {
        alert("Please select a database first")
    };
};