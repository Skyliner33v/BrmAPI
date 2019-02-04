
/*Update tables in BrM using the AssetManagement Tables
New data will be posted to the AssetManagement Tables
Functions below will send a GET request to the AssetManagement
Will then pass that data to a function for either a POST/PUT/DELETE request and send it to the BrM tables
Will also send a POST request to a separate table on AssetManagement to record the */

async function getAuth() {
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

    //Process response from the request and return the authorization token
    let result = await response.json();
    return result.auth_token
};

