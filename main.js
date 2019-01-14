"use strict";

//Initialize authorization token in a global context to be used in all requests.
var authToken = ''


//Fetch list of available databases
async function getDB() {

    //Setup dropdown stuff
    let dropdown = document.getElementById('dbDropdown')
    dropdown.length = 0
    let defaultOption = document.createElement('option')
    defaultOption.text = 'Select a Database'
    dropdown.add(defaultOption)
    dropdown.selectedIndex = 0

    //Setup Request URL
    const dbURL = 'http://localhost:9000/api/auth/GetDatabases'

    //Send request to get list of available databases and get back json data
    let response = await fetch(dbURL, {method: 'GET'})
    let result = await response.json()

    // Set response data to create and populate a dropdown list on the page
    let option
    for (let i = 0; i < result.length; i++) {
        option = document.createElement('option')
        option.text = 'db ID: ' + result[i].ID + ' ' + result[i].Name
        option.value = result[i].ID
        dropdown.add(option)
    }
};

//Get list of Databases on page load to be used for the Authorization Request
getDB();



//Request Authorization token
async function getAuth() {

    //Get database id value from page
    let dbOption = document.getElementById('dbDropdown')
    let dbValue = dbOption.options[dbOption.selectedIndex].value

    //Setup request url and header info
    const authURL = 'http://localhost:9000/api/auth/APILogin'
    let headers = {
        Accept: 'application/JSON',
        Authorization: 'Basic cG9udGlzOnBvbnRpcw==', //Base64 encoding of the string 'pontis:pontis'
        database_id: "'" + dbValue + "'"
    }

    //Set Get Request
    let response = await fetch(authURL, {
        method: 'GET',
        headers: headers
    })

    //Process response from the request
    let result = await response.json()

    //Set auth_token to global var
    authToken = result.auth_token

    //Post response data to page
    document.getElementById('authResponse').innerHTML = JSON.stringify(result)

    //Reset and start the 1200 sec timer
    /*TODO:  Need to add way to reset timer from here. 
    Issue when getting a new auth token and the timer doesnt reset.  
    Currently when pressing the button before the timer ends it doesn't stop the function and reset the timer
    */
    authTimer()

    //Get list of controllers available in the selected database
    await getControllers(result.auth_token)
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
            alert('Authorization Token has expired.  Please request a new token')
            document.getElementById("countdown").textContent = 1200
            document.getElementById("authResponse").textContent = ""
        }
    }, 1000);
};



//Get list of available controllers and populate a dropdown list for the GET requests
async function getControllers(controllerAuthToken) {

    //Setup dropdown stuff
    let dropdown = document.getElementById('controllerDropdown')
    dropdown.length = 0
    let defaultOption = document.createElement('option')
    defaultOption.text = 'Select a Controller'
    dropdown.add(defaultOption)
    dropdown.selectedIndex = 0

    //Setup Request
    const controllerURL = 'http://localhost:9000/api/DataDict/getTables'
    let headers = {
        auth_token: controllerAuthToken
    }

    //GET Request
    let response = await fetch(controllerURL, {
        method: 'GET',
        headers: headers
    })

    //Process response
    let result = await response.text()

    //Remove offending characters from the response and convert it to an actual array
    let controllerArray = result.replace(/['"\[\]]+/g, '')
    controllerArray = controllerArray.split(",")

    //Send response data to the controller dropdown on the page
    let option    
    for (let i = 0; i < controllerArray.length; i++) {
        option = document.createElement('option')
        option.text = controllerArray[i]
        option.value = controllerArray[i]
        dropdown.add(option)
    }
};


//Send GET Request passing in parameters if included
function getRequest() {


    //console.log('getRequest authToken variable = ' + authToken)

    
    
};
