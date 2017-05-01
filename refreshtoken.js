/**
 * Created by nilupul on 5/1/17.
 */

var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var TOKEN_DIR = __dirname + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

var credentials = JSON.parse(fs.readFileSync('client_secret.json'));
var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(credentials.installed.client_id, credentials.installed.client_secret, credentials.installed.redirect_uris[0]);
var token = JSON.parse(fs.readFileSync(TOKEN_PATH));
oauth2Client.setCredentials(token);
console.log(oauth2Client);

function refresh() {
    oauth2Client.refreshAccessToken(function(err, tokens) {
        console.log(tokens);
        fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
    });
    setTimeout(refresh, 100000);
}
refresh();