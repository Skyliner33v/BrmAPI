
/*Update tables in BrM using the AssetManagement Tables
New data will be posted to the AssetManagement Tables
Functions below will send a GET request to the AssetManagement
Will then pass that data to a function for either a POST or PUT request and send it to the BrM tables
Will also send a POST request to a separate table on AssetManagement to record transaction data*/


/******** Generic AssetManagment GET Request ***********/
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
            "content-type": "application/JSON",
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



/******** Generic BrM GET Request ***********/
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


/*********************TODO************************/
//This needs work to get the body portion fixed.  Currently does not recognize the object.
//Need to possibly remove the keys [0,1,2,3,4 etc] first.  IE remove the top level keys.  
//Or issue might be that the BrM API cannot accept more than one key as a POST request but this seems unlikely. 
//Error is more likely on my end in correctly forming up the body of the request. 

/******** Generic BrM POST Request ***********/
//Send POST request to BrM API and return results
async function brmPostRequest(controllerName, body) {

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
                "data": JSON.stringify(body)
            });

            //Return the response
            return await brmResponse.json();
        }
        catch(error) {
            console.log("Error sending POST request to " + controllerName);
        };

    } else {
        alert("Please select a database first")
    };
};



/*********************TODO************************/
//This needs work to get the body portion fixed.  Currently does not recognize the object.
//Need to possibly remove the keys [0,1,2,3,4 etc] first.  IE remove the top level keys.  
//Or issue might be that the BrM API cannot accept more than one key as a PUT request but this seems unlikely. 
//Error is more likely on my end in correctly forming up the body of the request. 

/******** Generic BrM PUT Request ***********/
//Send PUT request to BrM API and return results
async function brmPutRequest(controllerName, body) {

    //Get URL for BrM Requests
    const brmURL = urlBuilderBRM(controllerName);

    //Get Headers for BrM Requests
    const headers = await headerBuilderBRM();
    console.log(JSON.stringify(body));
    console.log(brmURL + "/" + body[0].BRIDGE_GD);

    //Check if the headers value is correctly formed.  If not, a database was not selected from the list. 
    if (headers != false) {
        try {
            //Send GET Request
            let brmResponse = await fetch(brmURL, {
                "method": "PUT",
                "headers": headers,
                "data": body
            });

            //Return the response
            return await brmResponse.json();
        }
        catch(error) {
            console.log("Error sending PUT request to " + controllerName);
        };

    } else {
        alert("Please select a database first")
    };
};



//Analyze list of PUT bridges.  Set the "Obsolete" flag if the structure is obsolete, otherwise leave alone.  Also strips out obsolete date after analyzing.  
//This can easily be extended to include other flags in the future.
// 0 = Unknown
// 1 = Inactive
// 2 = Closed
// 3 = Active
// 4 = Proposed
// 5 = Obsolete
function flagInactiveBridges(putData) {

    //Loop through each bridge and check the obsolete_date value
    for (let i = 0; i < putData.length; i++) {

        //If the obsolete_date value is anything else but null or undefined, then mark the bridge as "Inactive"
        let obsDate = putData[i].obsolete_date;
        if(!(obsDate == null || obsDate == undefined)) {
            putData[i].BRIDGE_STATUS = 5;
        };
    };

    //Return the list of PUT bridges after analyzing
    return putData;
};



//Compare data in Brm and AssetManagement Tables
function compareData(controllerName, brmData, amData) {

    //Evaluate which controller first
    if(controllerName == "bridges") {
        //Create list of matching bridges to be used as a PUT request
        var putData = amData.filter(({BRIDGE_GD}) => 
            brmData.some(brm => brm.BRIDGE_GD == BRIDGE_GD));

            //Create list of non-matching bridges to be used as a POST request
        var postData = amData.filter(({BRIDGE_GD}) => 
            brmData.every(brm => brm.BRIDGE_GD != BRIDGE_GD));
    } 
    else if (controllerName == "roadway") {
        //Create list of matching roadways to be used as a PUT request
        var putData = amData.filter(({ROADWAY_GD}) => 
            brmData.some(brm => brm.BRIDGE_GD == ROADWAY_GD));

        //Create list of non-matching roadways to be used as a POST request
        var putData = amData.filter(({ROADWAY_GD}) => 
            brmData.some(brm => brm.BRIDGE_GD != ROADWAY_GD));
    }
    else {
        alert("Error comparing BrM and AssetManagement Data");
    }; 

    //If is "BRIDGES" data, then send the PUT list off to check for valid obsolete_dates and return the modified list
    if (controllerName == "bridges"){
        flagInactiveBridges(putData);
    };

    //Return the separated data as an object
    return {postData, putData};

};




/******** Inpsect and separate the new data before updating the BRIDGE or ROADWAY tables in BrM ***********/
//This function will inspect the new data and compare it to the data already in BrM to determine if the new data should be a POST or PUT request
async function updateBrgRdwy(controllerName) {
    try {
        //First Send a GET Request to the BrM API to fetch the existing data
        const brmResult = await brmGetRequest(controllerName);

        //Then send a GET Request to the AssetManagement API to fetch the new data to compare against the existing
        const amResult = await amGetRequest(controllerName);

        //Next send off the above results and build a list of matching bridges by looping through each AssetManagement BRIDGE_GD and see if it already exists in BrM.
        //Returns 2 lists of separated data.  One for POST requests.  Other for PUT requests.  
        const separatedValues =  compareData(controllerName, brmResult, amResult);

        //Send POST request for new Data to be added to the database
        if (Object.keys(separatedValues.postData).length >= 1) {
            //const postedData = await brmPostRequest(controllerName, separatedValues.postData);
            console.log("postData: ", separatedValues.postData);
        }

        //Send PUT request for new Data to update the existing records in the database
        if (Object.keys(separatedValues.putData).length >= 1) {
            //const puttedData = await brmPutRequest(controllerName, separatedValues.putData);
            console.log("putData: ", separatedValues.putData);
        };

    }
    catch(error){
        console.log(error);
    };
};




/******** Update BrM Tables with AssetManagement Data ***********/
//Update Table in BrM from data in AssetManagement depending on which button(controller) was clicked.
async function updateTable(controllerName) {
    try {
        //Run different checks depending on which controller is selected before inserting data
        switch(controllerName) {

            //If updating bridges or roadway, run through checks first
            case "bridges":
            case "roadway":
                updateBrgRdwy(controllerName);                
                break;

            //If updating Inspections or Element Data, ok to just send the POST request immediately
            case "inspections":
            case "elementData":
                const amResult = await amGetRequest(controllerName);
                const brmResult = await brmPostRequest(controllerName, amResult);
                break;
        };

        //Update AssetManagement Tables with data relating to how many records were Inserted or Updated into BrM


    }
    catch(error) {
        console.log(error);
    }
};








