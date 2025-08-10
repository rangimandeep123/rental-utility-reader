console.log('Script loaded');
window.gapiReady = false;

const script = document.createElement('script');
script.src = "https://apis.google.com/js/api.js";
script.onload = () => {
  console.log('Google API script loaded');
  window.gapiReady = true;
  handleClientLoad();
};
script.onerror = () => {
  console.error('Failed to load Google API script');
};
document.body.appendChild(script);


const CLIENT_ID = '782665665648-lfegea941i066mqr21iog7qukoi4fv0p.apps.googleusercontent.com';
const API_KEY = ''; // No API key needed for this example

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const emailsTableBody = document.querySelector('#emails-table tbody');

function updateSigninStatus(isSignedIn) {
  console.log('Sign-in status changed:', isSignedIn);
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'inline-block';
    content.style.display = 'block';
    listUtilityEmails();
  } else {
    authorizeButton.style.display = 'inline-block';
    signoutButton.style.display = 'none';
    content.style.display = 'none';
  }
}

function handleClientLoad() {
  console.log('Loading gapi client');
  gapi.load('client:auth2', initClient);
}

function initClient() {
  console.log('Initializing gapi client');
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(() => {
    const authInstance = gapi.auth2.getAuthInstance();

    // Listen for sign-in state changes.
    authInstance.isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(authInstance.isSignedIn.get());

    // Button click handlers
    if (authorizeButton) {
      authorizeButton.onclick = () => {
        console.log('Authorize button clicked');
        authInstance.signIn().catch(err => {
          console.error('Sign-in error:', err);
        });
      };
    } else {
      console.warn('Authorize button not found');
    }

    if (signoutButton) {
      signoutButton.onclick = () => {
        console.log('Signout button clicked');
        authInstance.signOut();
      };
    } else {
      console.warn('Signout button not found');
    }

  }, (error) => {
    console.error('gapi.client.init error:', JSON.stringify(error, null, 2));
  });
}

function listUtilityEmails() {
  emailsTableBody.innerHTML = '<tr><td colspan="3">Loading emails...</td></tr>';
  gapi.client.gmail.users.messages.list({
    userId: 'me',
    q: 'subject:"utility bill" newer_than:90d',
    maxResults: 20
  }).then(response => {
    const messages = response.result.messages || [];
    if (messages.length === 0) {
      emailsTableBody.innerHTML = '<tr><td colspan="3">No utility bill emails found.</td></tr>';
      return;
    }

    emailsTableBody.innerHTML = '';
    messages.forEach(msg => {
      gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'Date']
      }).then(msgResp => {
        const headers = msgResp.result.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const date = headers.find(h => h.name === 'Date')?.value || '';
        const snippet = msgResp.result.snippet || '';

        const row = document.createElement('tr');
        row.innerHTML = `<td>${new Date(date).toLocaleDateString()}</td><td>${subject}</td><td>${snippet}</td>`;
        emailsTableBody.appendChild(row);
      });
    });
  }, error => {
    emailsTableBody.innerHTML = `<tr><td colspan="3">Error loading emails: ${error.result.error.message}</td></tr>`;
  });
}

// Load the Google API script dynamically and then initialize client
console.log('Adding Google API script to page');
const script = document.createElement('script');
script.src = "https://apis.google.com/js/api.js";
script.onload = () => {
  console.log('Google API script loaded');
  handleClientLoad();
};
script.onerror = () => {
  console.error('Failed to load Google API script');
};
document.body.appendChild(script);
