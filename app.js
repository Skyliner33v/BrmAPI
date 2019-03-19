
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
        "method": "GET",
    });

    //Return the response
    return await amResponse.json();
};


/******** Generic AssetManagment POST Request ***********/
//Send POST request to Asset Management API and return results
async function amPostRequest(bodyData) {

    //Setup AssetManagement POST request URL
    const amURL = "http://localhost:8081/api/transactions"

    //Send POST Request
    const amResponse = await fetch(amURL, {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },        
        "body": JSON.stringify(bodyData)
    });

    //Return the response
    const result =  await amResponse.text();

    //If status is 200, alert the user to a successful POST otherwise 
    if (amResponse.status === 200) {
        alert("AssetManagment POST Success!")
    } else {
        alert("AssetManagment POST Failure.\n Check console for error log")
        console.error(result.body)
    }
        
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
};


//Create headers to be used in any BrM Request
async function headerBuilderBRM() {
    //Get authorization token //Add this to the header instead
    const authToken = await getAuth();
    let headers = {
        "Accept": "application/JSON",
        "content-type": "application/JSON",
        "auth_token": authToken
    };
    return headers;
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
        case "structureUnit":
            restURL = "StructureUnit";
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
}; 


/******** Generic BrM POST Request ***********/
//Send POST request to BrM API and return results
async function brmPostRequest(controllerName, body) {

    //Get URL for BrM Requests
    const brmURL = urlBuilderBRM(controllerName);

    //Get Headers for BrM Requests
    const headers = await headerBuilderBRM();

    //Check if the headers value is correctly formed.  If not, a database was not selected from the list. 
    try {
        //Send GET Request
        let brmResponse = await fetch(brmURL, {
            "method": "POST",
            "headers": headers,
            "body": JSON.stringify(body)
        });

        //If return status is ok, return a promise of the guid of the record that was updated
        /**This is necessary because a normal 200 or 204 response returns back no data
        * This way allows for the guid and other data that was updated to be captured and logged**/
        if (brmResponse.status === 200 || brmResponse.status === 204) {
            if (controllerName ==='bridges') {
                let passedRequest = {
                    "status": "Pass",
                    "BRIDGE_GD": body.BRIDGE_GD,
                    "error" : "none"
                }
                return Promise.resolve(passedRequest);
            } else if (controllerName = 'roadway') {
                let passedRequest = {
                    "status": "Pass",
                    "ROADWAY_GD": body.ROADWAY_GD,
                    "error" : "none"
                }
                return Promise.resolve(passedRequest);
            } else if (controllerName = 'structureUnit') {
                let passedRequest = {
                    "status": "Pass",
                    "STRUCTURE_UNIT_GD": body.STRUCTURE_UNIT_GD,
                    "error" : "none"
                }
                return Promise.resolve(passedRequest);
            } else {
                return Promise.resolve("none");
            }

        //Handle failed responses to the BRIDGE table
        //Returns promise containing bridge guid and the error message
        } else if (controllerName = 'bridges') {
            let failedRequest = {
                "status": "Fail",
                "BRIDGE_GD": body.BRIDGE_GD, 
                "BRIDGE_ID": body.BRIDGE_ID,
                "STRUCT_NUM": body.STRUCT_NUM,
                "error": await brmResponse.json()}
            return Promise.resolve(failedRequest);

        //Handle failed responses to the ROADWAY table
        //Returns promise containing roadway guid and the error message
        } else if (controllerName = 'roadway') {
            let failedRequest = {
                "status": "Fail",
                "ROADWAY_GD": body.BRIDGE_GD, 
                "BRIDGE_GD": body.BRIDGE_GD,
                "ROADWAY_NAME": body.ROADWAY_NAME,
                "error": await brmResponse.json()}
            return Promise.resolve(failedRequest);  

        } else if (controllerName = 'structureUnit') {
            let failedRequest = {
                "status": "Fail",
                "STRUCTURE_UNIT_GD": body.STRUCTURE_UNIT_GD, 
                "BRIDGE_GD": body.BRIDGE_GD,
                "error": await brmResponse.json()}
            return Promise.resolve(failedRequest);  

        } Else {
            return Promise.resolve("none");
        };
    }
    catch(error) {
        console.log("Error sending POST request to " + controllerName);
    };
};



/******** Generic BrM PUT Request ***********/
//Send PUT request to BrM API and return results
async function brmPutRequest(controllerName, body) {

    //Set the "Obsolete" flag if the structure is obsolete, otherwise leave alone.
    if (controllerName === 'bridges') {
        //If the obsolete_date value is anything else but null or undefined, then mark the bridge as "Inactive"
        let obsDate = body.obsolete_date;
        if(!(obsDate == null || obsDate == undefined)) {
            body.BRIDGE_STATUS = 5;
        };
    };

    //Get URL for BrM Requests
    const brmURL = urlBuilderBRM(controllerName) + "/" + body.BRIDGE_GD;

    //Get Headers for BrM Requests
    const headers = await headerBuilderBRM();

    //Check if the headers value is correctly formed.  If not, a database was not selected from the list. 
    try {
        //Send GET Request
        let brmResponse = await fetch(brmURL, {
            "method": "PUT",
            "headers": headers,
            "body": JSON.stringify(body)
        });

        //If return status is ok, return a promise of the guid of the record that was updated
        /**This is necessary because a normal 200 or 204 response returns back no data
        * This way allows for the guid and other data that was updated to be captured and logged**/
        if (brmResponse.status === 200 || brmResponse.status === 204) {
            if (controllerName ==='bridges') {
                let passedRequest = {
                    "status": "Pass",
                    "BRIDGE_GD": body.BRIDGE_GD,
                    "error" : "none"
                }
                return Promise.resolve(passedRequest);
            } else if (controllerName = 'roadway') {
                let passedRequest = {
                    "status": "Pass",
                    "ROADWAY_GD": body.ROADWAY_GD,
                    "error" : "none"
                }
                return Promise.resolve(passedRequest);
            } else if (controllerName = 'structureUnit') {
                let passedRequest = {
                    "status": "Pass",
                    "STRUCTURE_UNIT_GD": body.STRUCTURE_UNIT_GD,
                    "error" : "none"
                }
                return Promise.resolve(passedRequest);
            
            } else {
                return Promise.resolve("none");
            }

        //Handle failed responses to the BRIDGE table
        //Returns promise containing bridge data and error message
        } else if (controllerName = 'bridges') {
            let failedRequest = {
                "status": "Fail",
                "BRIDGE_GD": body.BRIDGE_GD, 
                "BRIDGE_ID": body.BRIDGE_ID,
                "STRUCT_NUM": body.STRUCT_NUM,
                "error": await brmResponse.json()}
            return Promise.resolve(failedRequest); 

        //Handle failed responses to the ROADWAY table
        //Returns promise containing roadway data and error message
        } else if (controllerName = 'roadway') {
            let failedRequest = {
                "status": "Fail",
                "ROADWAY_GD": body.BRIDGE_GD, 
                "BRIDGE_GD": body.BRIDGE_GD,
                "ROADWAY_NAME": body.ROADWAY_NAME,
                "error": await brmResponse.json()}
            return Promise.resolve(failedRequest); 

        } else if (controllerName = 'structureUnit') {
            let failedRequest = {
                "status": "Fail",
                "STRUCTURE_UNIT_GD": body.BRIDGE_GD, 
                "BRIDGE_GD": body.BRIDGE_GD,
                "error": await brmResponse.json()}
            return Promise.resolve(failedRequest);

        } else {
            return Promise.resolve("none");
        };

    }
    catch(error) {
        console.log("Error sending PUT request to " + controllerName);
    };
};



//Compare data in Brm and AssetManagement Tables
function compareData(controllerName, brmData, amData) {

        //Evaluate which controller first
        if(controllerName == "bridges") {
            //Create list of matching bridges to be used as a PUT request
            var putData = amData.filter(amGuid => 
                brmData.some(bmGuid => (bmGuid.BRIDGE_GD === amGuid.BRIDGE_GD)));

            //Create list of non-matching bridges to be used as a POST request
            var postData = amData.filter(amGuid => 
                !brmData.some(bmGuid => (bmGuid.BRIDGE_GD === amGuid.BRIDGE_GD)));
        } 
        else if (controllerName == "roadway") {
            //Create list of matching roadways to be used as a PUT request
            var putData = amData.filter(amGuid => 
                brmData.some(bmGuid => (bmGuid.ROADWAY_GD === amGuid.ROADWAY_GD)));

            //Create list of non-matching roadways to be used as a POST request
            var postData = amData.filter(amGuid => 
                !brmData.some(bmGuid => (bmGuid.ROADWAY_GD === amGuid.ROADWAY_GD)));
        }
        else if (controllerName == "structureUnit") {
            //Create list of matching roadways to be used as a PUT request
            var putData = amData.filter(amGuid => 
                brmData.some(bmGuid => (bmGuid.STRUCTURE_UNIT_GD === amGuid.STRUCTURE_UNIT_GD)));

            //Create list of non-matching roadways to be used as a POST request
            var postData = amData.filter(amGuid => 
                !brmData.some(bmGuid => (bmGuid.STRUCTURE_UNIT_GD === amGuid.STRUCTURE_UNIT_GD)));
        }
        else {
            alert("Error comparing BrM and AssetManagement Data");
        }; 

    //Return the separated data as an object
    return {postData, putData};

};


function amPostDataBuilder (apiRequestType, controllerName, amPostData) {
    let tempPassed = [];
    let tempFailed = [];

    //Check for pass/fail status and move them to a temporary array
    for(let i = 0; i < amPostData.length; i++) {
        if (amPostData[i].status === "Pass") {
            tempPassed.push(amPostData[i]);
        } else if (amPostData[i].status === 'Fail') {
            tempFailed.push(amPostData[i]);
        } else {
            console.log("ERROR in amPostDataBuilder")
        }
    }; 

    //Create timestamp
    let today = new Date();
    let datetime = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + " " + today.getHours() + ':' + today.getMinutes() + ":" + today.getSeconds() + " UTC";

    //Create data that contains data about successful requests that will be used in the POST request to the AssetManagement Database
    let passResults = {
        "tableName": controllerName,
        "apiRequestType": apiRequestType,
        "numRows": tempPassed.length,
        "datePosted": datetime
    };

    //Create data that contains data about failed requests that will be used in the POST request to the AssetManagement Database
    let failResults = {
        "tableName": controllerName,
        "apiRequestType": apiRequestType,
        "numRows": tempFailed.length,
        "datePosted": datetime
    };

    return {passResults, failResults, tempPassed, tempFailed};
}


/******** Inpsect and separate the new data before updating the BRIDGE or ROADWAY tables in BrM ***********/
/*This method using promise.all is ideal because it will only resolve after all the requests have been completed.
* It will also capture any errors within the array to be processed after resolving.  An error will not cause the process to fail
* Any error found will removed from the array and sent to another function for logging*/

//This function will inspect the new data and compare it to the data already in BrM to determine if the new data should be a POST or PUT request
async function updateBrgRdwyStrUnit(controllerName) {
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

            //Initialize array to hold promises before resolving
            let promiseArray = [];

            //Loop through each record and send as a POST request
            for (let i = 0; i < separatedValues.postData.length; i++) {
                promiseArray.push(await brmPostRequest(controllerName, separatedValues.postData[i]));
            };

            //Resolve promise Array to a new array for future processing
            const postResults = await Promise.all(promiseArray);
            
            //Build separate lists for passed and failed post requests.  Will be sent to the database for tracking purposes
            const separatedPostResults = amPostDataBuilder("POST", controllerName, postResults);

            //If contains data, then send POST requests
            if (separatedPostResults.passResults.numRows >= 1) {
                amPostRequest(separatedPostResults.passResults);
            } 
            if (separatedPostResults.failResults.numRows >= 1) {
                alert("Failed Transfers! Check console."); 
                console.dir(separatedPostResults.tempFailed); //need to process this further to another database maybe?
            };
        };

        //Send PUT request for new Data to update the existing records in the database
        if (Object.keys(separatedValues.putData).length >= 1) {

            //Initialize array to hold promises before resolving
            let promiseArray = [];

            //Loop through each record and send as a PUT request
            for (let i = 0; i < separatedValues.putData.length; i++) {
                promiseArray.push(await brmPutRequest(controllerName, separatedValues.putData[i]));
            };

            //Resolve promise Array to a new variable for future processing
            var putResults = await Promise.all(promiseArray);

            //Build separate lists for passed and failed post requests.  Will be sent to the database for tracking purposes
            const separatedPutResults = amPostDataBuilder("PUT", controllerName, putResults);

            //If contains data, then send POST requests
            if (separatedPutResults.passResults.numRows >= 1) {
                amPostRequest(separatedPutResults.passResults);
            } 
            if (separatedPutResults.failResults.numRows >= 1) {
                alert("Failed Transfers! Check console."); 
                console.dir(separatedPutResults.tempFailed);
            };
        };

        //Enable next available button if postResults and putResults return OK
        enableNextButton(controllerName);  

    }
    catch(error){
        console.log(error);
    };
};

/****************** Enable next buttons **********************/
//Update button availablity depending on which controller was last updated
function enableNextButton (controllerName) {

    switch (controllerName) {
        case "bridges":
            document.getElementById("importStrUnitBtn").removeAttribute("disabled");
            break;
        case "structureUnit":
            document.getElementById("importRoadwayBtn").removeAttribute("disabled");
            break;
        case "roadway":
            document.getElementById("importInspectionsBtn").removeAttribute("disabled");
            break;
        case "inspections":
            document.getElementById("importElemDataBtn").removeAttribute("disabled");
            break;
        //If last button is selected, reset the button order.  
        case "elementData":
            document.getElementById("importBridgesBtn").removeAttribute("disabled");
            document.getElementById("importRoadwayBtn").setAttribute("disabled", true);
            document.getElementById("importStrUnitBtn").setAttribute("disabled", true);
            document.getElementById("importInspectionsBtn").setAttribute("disabled", true);
            document.getElementById("importElemDataBtn").setAttribute("disabled", true);
            break;
    };

}


/******** Update BrM Tables with AssetManagement Data ***********/
//Update Table in BrM from data in AssetManagement depending on which button(controller) was clicked.
async function updateTable(controllerName) {

    //First get controller name
    let dropdownValue = document.getElementById("dbDropdown").value;

    //If no controller selected, alert the user and end the process
    if (dropdownValue === 'default') {
        alert ("Select a database first")

    //Otherwise proceed
    } else {

        //Run different checks depending on which controller is selected before inserting data
        switch(controllerName) {

            //If updating bridges or roadway, run through checks first
            case "bridges":
            case "roadway":
            case "structureUnit":
                updateBrgRdwyStrUnit(controllerName);
                break;

            //If updating Inspections or Element Data, ok to just send the POST request immediately
            case "inspections":
            case "elementData":

                //First send GET request to AssetManagement Database to retrieve new data
                const amResult = await amGetRequest(controllerName);

                //If there is new data, send POST requests for new data to be added to the database
                if (Object.keys(amResult).length >= 1) {

                    //Initialize array to hold promises before resolving
                    let promiseArray = [];

                    //Loop through each record and send as a POST request.  Returns an array of promises that need to be resolved
                    for (let i = 0; i < amResult.length; i++) {
                        promiseArray.push(await brmPostRequest(controllerName, amResult[i]));
                    };

                    //Resolve promise Array to a new variable for future processing
                    var postResults = await Promise.all(promiseArray); 

                    //Build separate lists for passed and failed post requests.  Will be sent to the database for tracking purposes
                    const separatedPostResults = amPostDataBuilder("POST", controllerName, postResults);

                    //If contains data, then send POST requests
                    if (separatedPostResults.passResults.numRows >= 1) {
                        amPostRequest(separatedPostResults.passResults);
                    } 
                    if (separatedPostResults.failResults.numRows >= 1) {
                        alert("Failed Transfers! Check console."); 
                        console.dir(separatedPostResults.tempFailed); //need to process this further to another database maybe?
                    };
                } else if (Object.keys(amResult).length === 0) {
                    alert("No new records to insert")
                }

                break;
        };
    };
};










