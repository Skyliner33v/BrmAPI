"use strict";

//Initialize authorization token in a global context to be used in all requests.
var authToken = ''

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

                // Set response database data to populate the dropdown list 
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

getDB();

//Request Authorization token
function getAuth() {

    //Define API URL and get database ID that was entered
    const authURL = 'http://localhost:9000/api/auth/APILogin'
    let dbOption = document.getElementById('locality-dropdown')
    let dbValue = dbOption.options[dbOption.selectedIndex].value

    let headers = {
        Accept: 'application/JSON',
        Authorization: 'Basic cG9udGlzOnBvbnRpcw==', //Base64 encoding of the string 'pontis:pontis'
        database_id: "'" + dbValue + "'"
    }

    //Check to make sure a database id was entered.  
    //Need to add way to check against valid databases or provide a dropdown list
    if (dbValue==null || dbValue=="")
        alert("Enter a database id number")

    //If valid database number was entered, send the Authorization GET Request
    //Need to add way to encode  user:pass on the fly.  Maybe add headers to a separate variable.
    else fetch(authURL, {
        method: 'GET', 
        headers: headers
    })

    //Process returned Promise
    .then(response => {
        return response.json()
    })

    //Process Response Object.  Pass token to global variable.  Start 1200 sec timer
    .then(response => {
        authToken = response.auth_token
        document.getElementById('authResponse').innerHTML = JSON.stringify(response)
        authTimer()
    })
    
    //Handle any errors
    .catch(function(error) {
        console.log('Looks like there was a problem: \n', error)
    })
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


//Send GET Request passing in parameters if included
function getRequest() {


    //console.log('getRequest authToken variable = ' + authToken)

    
    
};
