const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/subscribe', (req, res) => {
    let { topic, timeout } = req.query;
    req.app.on(topic, (data) => {
        res.write(data + '\n')
    });
    setTimeout(() => {
        res.write('timeout. connect again.\n');
        res.end();
    }, timeout * 1000);
})

app.post('/publish', (req, res) => {
    let { topic, message } = req.query;
    req.app.emit(topic, message);
    res.send('message sent');
})

app.listen(port, () => {
    console.log('server on port: ', port);
})