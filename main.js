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

    //Post response data to page
    document.getElementById('authResponse').innerHTML = JSON.stringify(result, undefined, 2)

    //Set auth_token to global var
    authToken = result.auth_token

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

    //Setup Request URL and headers
    const controllerURL = 'http://localhost:9000/api/DataDict/getTables'
    let headers = {
        auth_token: controllerAuthToken
    }

    //Send GET Request
    let response = await fetch(controllerURL, {
        method: 'GET',
        headers: headers
    })

    //Process response
    let result = await response.text()

    //Remove offending characters from the response and convert it to an actual array
    let controllerArray = result.replace(/['"\[\]]+/g, '')
    controllerArray = controllerArray.split(",")

    //Send response data to the tables datalist on the page
    let datalist = document.getElementById('tablesList')
    for (let i = 0; i < controllerArray.length; i++) {
        let option = document.createElement('option')
        option.value = controllerArray[i]
        datalist.appendChild(option)
    }
};


//Send a GET Request passing in parameters if included
async function getRequest() {

    //Get controller name
    let controllerName = document.getElementById('tablesList').value

    //Get Input values from the form.  Will be used to build the rest of the GET Request URL
    let inputs = document.getElementsByClassName('getInput')
    let formValues = {}

    //Parse inputs and store in the formValues array
    //Will need to add some error handling here for incorrectly formatted input
    for(let i =0; i < inputs.length; i++) {
        formValues[inputs[i].id] = inputs[i].value
    }

    //Setup GET Request URL and header info
    const getURL = 'http://localhost:9000/rest/dynamic/'
    let restURL = controllerName + '?'
    let headers = {
        auth_token: authToken
    }

    //Append the values from the formValues array and build 2nd half of the URL string
    for(let i in formValues) {
        if (formValues.hasOwnProperty(i)){
            if (formValues[i] === '') {continue;}
                restURL += i + '=' + formValues[i] +'&'
        }
    }

    restURL = restURL.slice(0, -1)  //Needed to remove the last '&' from the string
    console.log(getURL + restURL)


    //Send the GET request
    let response = await fetch(getURL + restURL, {
        method: 'GET',
        headers: headers
    })

    //Process response
    let result = await response.json()

    //Post response data to page
    document.getElementById('getResponse').innerHTML = JSON.stringify(result, undefined, 2)
    console.log(result)
    
};
