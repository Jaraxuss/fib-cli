const db = require('db');
const util = require('util');
const http = require('http');
const utils = require('../util/index');

Array.prototype.shuffle = function () {
    var array = this;
    var m = array.length,
        t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

global.check_result = function (res, data, filters = []) {
    function clen_result(res, filters) {
        filters.push("createdAt");
        filters.push("updatedAt");
        filters.push("id");
        if (util.isObject(res)) {
            if (Array.isArray(res))
                res.forEach(r => clen_result(r, filters));
            else {
                for (let k of filters)
                    delete res[k];

                for (var k in res)
                    clen_result(res[k], filters);
            }
        }
    }
    clen_result(res, filters);
    assert.deepEqual(res, data);
}

global.graphql = function graphql(body) {
    return httpclient.post(`http://${global.host}/1.0/app/`, {
        headers: {
            'Content-Type': 'application/graphql'
        },
        body: body
    });
}

function ResetDatebase() {
    utils.cleanData();
}

global.ResetCaseEnv = () => {
    ResetDatebase();
    run('../bin/init');
    global.httpclient = new http.Client();
}