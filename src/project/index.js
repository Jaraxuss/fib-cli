require("fib-log").setup();
const http = require('http');
const fs = require('fs');
const path = require('path');
const FibSession = require('fib-session');
const App = require('fib-app');
const coroutine = require('coroutine');
const Kv = require('fib-kv');
const pool = require('fib-pool');
const db = require('db')
const Target = process.env.npm_lifecycle_event;

if (!fs.exists('tmp')) {
    fs.mkdir('tmp');
}

const config = require("./conf/config.json");
let frontendPath = config.frontendPath;
const connstr = config[config.type];
console.log(connstr);
let app = new App(connstr, {
    // uuid: true
});
app.db.use(require('./defs'));

let conn = pool(() => db.open(connstr), 10, 1 * 1000);
let sessionopts = {
    table_name: 'session',
    session_cache_timeout: 30 * 60 * 1000,
};
let kv_db = new Kv(conn, sessionopts);
kv_db.setup();

let fibSession = new FibSession(conn, sessionopts);
global.fibSession = fibSession;

process.on('SIGINT', () => {
    coroutine.fibers.forEach(f => console.error("Fiber %d:\n%s", f.id, f.stack));
    process.exit();
});

process.on('SIGTERM', () => {
    coroutine.fibers.forEach(f => console.error("Fiber %d:\n%s", f.id, f.stack));
    process.exit();
});

fs.writeTextFile(path.join(__dirname, 'diagram.svg'), app.diagram());

let proxyer = function (ip, port) {
    let net = require("net");
    let io = require("io");

    return function proxyer(v) {
        let _bs,
            _u = new net.Url(v.address),
            _s = new net.Socket();
        _s.connect(ip, port);
        v.address = _u.path;
        // v.setHeader('Host', u.host);

        v.sendTo(_s);

        _bs = new io.BufferedStream(_s);
        _bs.EOL = "\r\n";
        v.response.readFrom(_bs);

        _bs.close();
        _s.close();
        // _s.dispose();
    };
};

function getRouter(port) {
    return [
        fibSession.cookie_filter,
        function (req) {
            if (req.session.ip != req.socket.remoteAddress) {
                req.session.ip = req.socket.remoteAddress;
            }
            req.starttime = new Date();
        }, {
            '/1.0/app': app,
            '/ping': req => {
                req.response.statusCode = 200;
                req.response.write("pong");
            },
            "*": [
                Target === "dev" ? proxyer("127.0.0.1", 3000) : http.fileHandler(frontendPath),
                function (v) {
                    if (v.response.statusCode === 404) {
                        v.response.setHeader('content-type', 'text/html;charset=utf-8');
                        if (fs.exists(frontendPath + config.index)) {
                            let s = fs.readTextFile(frontendPath + config.index);
                            v.response.body.write(s);
                            v.response.statusCode = 200;
                        }
                    }
                }
            ]
        },
        function (req) {
            let t = new Date();
            if (Target !== "test") {
                console.info("%s %d - %s:%s %s %s %s?%s %s %s -> %d %d",
                    t.toISOString(),
                    t - req.starttime,
                    req.socket.remoteAddress,
                    req.socket.remotePort,
                    req.method,
                    req.protocol,
                    req.address,
                    req.queryString,
                    req.headers["User-Agent"],
                    req.headers["Content-Type"],
                    req.response.statusCode,
                    req.response.length);
            }
        }
    ];
}

let svr = new http.Server(config.port, getRouter(config.port));
svr.run(() => { });
console.notice(`App listening on port ${config.port} ...`);
