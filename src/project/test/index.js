const fs = require('fs');
const path = require('path');
const test = require('test');
test.setup();

let oneCase;
if (argv.length > 2) {
    oneCase = argv[2];
}

const config = require('../conf/config.json');

[
    "./tmp/test.db",
    "./tmp/test.db-shm",
    "./tmp/test.db-wal"
].forEach((f) => {
    try {
        fs.unlink(f);
    } catch (e) { };
})

run('../');

global.host = "127.0.0.1:" + config.port;
require("./util");

if (oneCase) { //跑单个用例
    run(`./case/${oneCase}.js`);
} else { //所有用例
    fs.readdir(path.join(__dirname, "./case"))
        .filter(f => f.slice(-3) == ".js")
        .shuffle()
        .forEach(f => run(`./case/${f}`));
}

test.run(console.INFO);
process.exit();