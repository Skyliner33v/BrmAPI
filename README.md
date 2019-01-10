# BrmAPI
WSDOT Bridge Management (BRM) API Data Exchange Portal

Webpage that runs locally to be able to interact with the BrM API.  

Works best in Chrome.  
Must disable chrome web security due to running the api against a localhost and CORS issues.  

This can be done by opening up a CMD prompt and navigating to the chrome.exe location
  Typically this can be found at "program files (x86)/google/chrome/application"
  
Then run "chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security" to disable chrome security.  
  A new chrome window will open with disable web security settings and will allow the website to load and interact with the API correctly.  
