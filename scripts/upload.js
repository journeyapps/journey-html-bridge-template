const fs = require('fs');
const request = require('superagent');
const yaml = require('yaml');

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

const {token, appId, apiVersion, outputFileName} = config;

function getBasePath() {
return (
        'https://build.journeyapps.com/api/' +
        apiVersion +
        '/apps/' +
        appId
    );
}

// borrowed shamelessly from milk
function putRequest(params, content) {
    let path = getBasePath() + params;
    return request
        .put(path)
        .set('content-length', content.byteLength)
        .set('Authorization', 'Bearer ' + token)
        .send(content);
}

function postRequest(params, content) {
    return request
        .post(getBasePath() + params)
        .set('Authorization', 'Bearer ' + token)
        .send(content);
}

const fileData = fs.readFileSync('dist/' + outputFileName);

const uploadRequest = putRequest('/files/mobile/html/' + outputFileName, fileData);

uploadRequest.end(function(err, res) {
    if (err || !res.ok) {
        console.log('failure uploading\n', err.response.error);
    } else {
        console.log('finished uploading ' + outputFileName);
        deploy('testing');
    }
});

function deploy(environment) {
    const deployRequest =  postRequest(`/deploy/${environment}`,'');
    deployRequest.end(function(err, res) {
        if (err || !res.ok) {
            console.log('failure deploying\n', err.response.error);
        } else {
            console.log('finished deploying to ' + environment);
        }
    });
}
