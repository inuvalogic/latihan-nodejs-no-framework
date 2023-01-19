const server = require('./server');

const messageHandler = (responseData, callback) => {
    let data = {
        "message": "test output dari api"
    };

    callback(200, JSON.stringify(data));
}

const buttonHandler = (responseData, callback) => {
    let data = {
        "message": "tes output dari api via click button"
    };

    callback(200, JSON.stringify(data));
}

const paths = {
    '/api/message': messageHandler,
    '/api/button': buttonHandler,
};

server.setAllowedPaths(paths);
server.init();
