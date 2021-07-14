const express = require('express');
const request = require('request');
const app = express();
const port = process.env.PORT || 3000;
const maxConcurrentRequests = 3;

let currentComputeQueue = 0;

const waitTillRequestIsValid = () => {
    return new Promise((resolve, reject) => {
        if(currentComputeQueue <= maxConcurrentRequests) return resolve();
        setTimeout(() => {  resolve(waitTillRequestIsValid()) } ,1000);
    })
}

const proxyComputeQueueMiddleware = async (req, res, next) => {
    currentComputeQueue = currentComputeQueue + 1;
    if (currentComputeQueue > maxConcurrentRequests) {
        await waitTillRequestIsValid();
    }
    next();
}

function getFromServer(query) {
    return new Promise(async (resolve, reject) => {
        request.post(`https://screeningtest.vdocipher.com/do-long-compute/?query=${query}`, (e, r, body) => {
            resolve(JSON.parse(body));
        });
    });
}

app.post('/proxy-compute', proxyComputeQueueMiddleware, (req, res) => {
    let query = req.query.query;
    getFromServer(query)
        .then((result) => {
            currentComputeQueue = currentComputeQueue - 1;
            res.json(result)
        });
});

app.listen(port, () => console.log(`listening on ${port}`));