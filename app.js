
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

    //Check if the headers value is correctly formed.  If not, a database was not selected from the list. 
    if (headers != false) {
        try {
            //Send GET Request
            let brmResponse = await fetch(brmURL, {
                "method": "PUT",
                "headers": headers,
                "data": JSON.stringify(body)
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



//Compare data in Brm and AssetManagement Tables
//If it exists, it will remove it from the list, and push it to a new list of only bridges that match whats already in BrM
//The resultant new list will be passed off as the body of a PUT request to update existing data.  
//The original list will now only contain new bridges that will be used as the body of a POST request. 
function compareBridgeData(brmData, amData) {
    let putBridges = [];
    let postBridges = [];

    for (let i = 0; i < amData.length; i++) {
        for (let j = 0; j < brmData.length; j++) {
            if (amData[i].BRIDGE_GD == brmData[j].BRIDGE_GD) {
                putBridges.push(amData[i]);
                delete amData[i];
                break;
            };
        };
    };

    //After moving the matching bridges to a new list, assign the remaining bridges in the new data to a new variable for clarity
    postBridges = amData;

    //Send off list of PUT bridges to check if any structures are obsolete and 
    /*********TODO**********/


    //Return the separated data as an object
    return {postBridges, putBridges};

    /*This function works almost the same as above, but written in the newer syntax. I just don't understand it very well.*/
    // let matchingBridgeResults = amData.filter(({BRIDGE_GD}) =>
    //     brmData.some(brm => brm.BRIDGE_GD)
    // );
};




/******** Inpsect and separate the new data before updating the ---BRIDGE--- Table in BrM ***********/
//This function will inspect the new data and compare it to the data already in BrM to determine if the new data should be a POST or PUT request
async function updateBrmBridges(controllerName) {
    try {
        //First Send a GET Request to the BrM API to fetch the existing data
        const brmResult = await brmGetRequest(controllerName);

        //Then send a GET Request to the AssetManagement API to fetch the new data to compare against the existing
        const amResult = await amGetRequest(controllerName);

        //Next send off the above results and build a list of matching bridges by looping through each AssetManagement BRIDGE_GD and see if it already exists in BrM.
        //Returns 2 lists of separated bridges.  One for POST requests.  Other for PUT requests.  
        const separatedValues =  compareBridgeData(brmResult, amResult);

        //Send POST request for new Bridges to be added to the database
        if (Object.keys(separatedValues.postBridges).length >= 1) {
            //const postedBridges = brmPostRequest(controllerName, returnedValues.postBridges);
        }

        //Send PUT request for new Bridges to be added to the database
        if (Object.keys(separatedValues.putBridges).length >= 1) {
            //const puttedBridges = brmPutRequest(controllerName, returnedValues.putBridges);
        };

    }
    catch(error){
        console.log(error);
    };
};




/******** Update BrM Tables with AssetManagement Data ***********/
//Update Table in BrM from data in AssetManagement depending on which button(controller) was selected.
async function updateTable(controllerName) {
    try {
        //Run different checks depending on which controller is selected before inserting data
        switch(controllerName) {

            //If updating bridges, run through the bridges check first
            case "bridges":
                updateBrmBridges(controllerName);                
                break;

            //If updating Roadway, run through the roadway checks first
            case "roadway":
                updateBrmRoadways(controllerName);
                break;

            //If updating Inspections or Element Data, ok to just send the POST request immediately
            case "inspections":
            case "elementData":

                /*Uncomment when above TODOs is fixed
                const amResult = await amGetRequest(controllerName);
                const brmResult = await brmPostRequest(controllerName, amResult);
                console.log("brmResult = ", brmResult);
                */
                
                break;
        };

        //Update AssetManagement Tables with data relating to how many records were Inserted or Updated into BrM

    }
    catch(error) {
        console.log(error);
    }
};



//Get new data from Assetmanagement Tables API
//const amResult = await amGetRequest(controllerName);
//console.log(amResult[0].obsolete_date)

//Send POST request to the BrM tables
//const brmResult = await brmPostRequest(controllerName, amResult);
//console.log("brmResult = ", brmResult);





