function handleClientLoad() {
  alert("handleClientLoad called");
  gapi.load('client:auth2', initClient);
}

function initClient() {
  alert("initClient called");
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(() => {
    alert("gapi.client.init successful");

    gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
      alert("Sign-in status changed: " + isSignedIn);
      updateSigninStatus(isSignedIn);
    });

    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

    authorizeButton.onclick = () => {
      alert("Sign-in button clicked");
      gapi.auth2.getAuthInstance().signIn();
    };
    signoutButton.onclick = () => {
      alert("Sign-out button clicked");
      gapi.auth2.getAuthInstance().signOut();
    };
  }, (error) => {
    alert("Error in gapi.client.init: " + JSON.stringify(error, null, 2));
  });
}
