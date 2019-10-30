const fs = require('fs');
const request = require('superagent');
const yaml = require('yaml');

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

const {token, appId, apiVersion, outputFileName, branch} = config;

const draft = true;

function getBasePath() {
    return `https://build.journeyapps.com/api/${apiVersion}/apps/${appId}`;
}

/**
 * Get the testing environment, taking chosen branch into account.
 * @returns {string}
 */
function getTestingEnvironment() {
    const baseEnvironment = 'testing';
    if (!branch) {
        return baseEnvironment;
    }
    return `${baseEnvironment}-${branch}`;
}

function putRequest(params, content) {
    const url = getBasePath() + params;
    console.log('Performing PUT request for:', url);
    return request
        .put(url)
        .set('content-length', content.byteLength)
        .set('Authorization', 'Bearer ' + token)
        .send(content);
}

function postRequest(params, content) {
    const url = getBasePath() + params;
    console.log('Performing POST request for:', url);
    return request
        .post(url)
        .set('Authorization', 'Bearer ' + token)
        .send(content);
}

const fileData = fs.readFileSync('dist/' + outputFileName);

// only relevant for branching
const uploadQueryString = branch ? `?branch=${branch}&draft=${draft ? 'true' : 'false'}` : '';

console.log(branch ? `Uploading to branch '${branch}'` : 'Uploading to master');
const uploadRequest = putRequest('/files/mobile/html/' + outputFileName + uploadQueryString, fileData);

uploadRequest.end(function(err, res) {
    if (err || !res.ok) {
        console.log('failure uploading\n', err.response.error);
    } else {
        console.log('finished uploading ' + outputFileName);
        const deployEnvironment = getTestingEnvironment();
        deploy(deployEnvironment);
    }
});

function deploy(environment) {
    console.log(`Deploying to environment '${environment}'...`);
    const deployRequest =  postRequest(`/deploy/${environment}`,'');
    deployRequest.end(function(err, res) {
        if (err || !res.ok) {
            console.log('failure deploying\n', err.response.error);
        } else {
            console.log('finished deploying to ' + environment);
        }
    });
}
