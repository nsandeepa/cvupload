var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

app.use(express.static(path.join(__dirname, 'public')));

//var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = __dirname + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

var credentials = JSON.parse(fs.readFileSync('client_secret.json'));
var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(credentials.installed.client_id, credentials.installed.client_secret, credentials.installed.redirect_uris[0]);
var token = JSON.parse(fs.readFileSync(TOKEN_PATH));
oauth2Client.setCredentials(token);
console.log(oauth2Client);

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){
    var fileName = "";
    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads');

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        fileName = file.name;
        fs.rename(file.path, path.join(form.uploadDir, file.name));
    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        var service = google.drive('v3');
        service.files.create({
            auth: oauth2Client,
            resource: {
                'name': fileName,
                parents: ['0B_TQUFcEHhsYZ0lXTE9XY1lmZVk']
            },
            media: {
                body: fs.createReadStream(__dirname + '/uploads/' + fileName)
            },
            fields: 'id'
        }, function(err, file) {
            if(err) {
                // Handle error
                res.end('error');
                console.log(err);
            } else {
                res.end('success');
                console.log('File Id: ', file.id);
            }
        });
    });

    // parse the incoming request containing the form data
    form.parse(req);

});

app.listen(3000, function(){
    console.log('Server listening on port 3000');
});