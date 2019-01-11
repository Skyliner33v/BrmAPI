"use strict";

//Initialize authorization token in a global context to be used in all requests.
var authToken = ''


//Fetches list of available databases
function getDB() {
    const dbURL = 'http://localhost:9000/api/auth/GetDatabases'
    let dropdown = document.getElementById('locality-dropdown')
    dropdown.length = 0

    let defaultOption = document.createElement('option')
    defaultOption.text = 'Select a Database'

    dropdown.add(defaultOption)
    dropdown.selectedIndex = 0

    //Send request to get list of available databases
    fetch(dbURL, {
            method: 'GET'
        })
        .then(
            function (response) {

                // Set response data to create and populate a dropdown list on the page
                response.json().then(function (data) {
                    let option;

                    for (let i = 0; i < data.length; i++) {
                        option = document.createElement('option');
                        option.text = 'db ID: ' + data[i].ID + ' ' + data[i].Name;
                        option.value = data[i].ID;
                        dropdown.add(option);
                    }
                });
            }
        )
        .catch(function (err) {
            console.error('Fetch Error -', err);
        });
};

//Get list of Databases on page load to be used for the Authorization Request
getDB();



//Request Authorization token
async function getAuth() {

    //Get database id value from page
    let dbOption = document.getElementById('locality-dropdown')
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

    //Start the 1200 sec timer
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
    

};


//Send GET Request passing in parameters if included
function getRequest() {


    //console.log('getRequest authToken variable = ' + authToken)

    
    
};
