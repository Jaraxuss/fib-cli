const assert = require('assert');
const App = require('fib-app');
const fs = require('fs');
const http = require('http');
const path = require('path');
const process = require('process');
const db = require('db');
const Config = require("../conf/config.json");
const connstr = Config[Config.type];
const utils = require('../util/index');

if (!fs.exists('tmp')) {
    fs.mkdir('tmp');
}

let app = new App(connstr);
app.db.use(require('../defs'));
utils.cleanData();

try {
    app.db(db => {
        const User = db.models.user;

        console.log('  mock系统数据: \r');

        let c = db.models.config.oneSync({
            key: "version"
        });
        assert.equal(c, null, "系统已经初始化，请勿重复初始化！");

        c = db.models.config.createSync({
            key: "version",
            value: "0.1.0"
        });
        assert.equal(c.id, 1, "系统配置初始化错误！");

        let u = User.createSync({
            fullname: "管理员",
            password: "a123456",
            mobile: "13913913910",
            role: "admin",
        });
        console.notice(`    √ 管理员创建完毕`);
        assert.equal(u.id, 1, "管理员初始化错误！");

        u = User.createSync({
            fullname: "Jack",
            password: "a123456",
            mobile: "13913913911",
            role: "user",
        });
        console.notice(`    √ 用户 Jack 创建完毕`);
        assert.equal(u.id, 2);

        u = User.createSync({
            fullname: "Rose",
            password: "a123456",
            mobile: "13913913912",
            role: "user",
        });
        console.notice(`    √ 用户 Rose 创建完毕`);
        assert.equal(u.id, 3);

        console.notice(`  √ mock数据完毕`);
    });
} catch (e) {
    console.error('error', e);
} finally {
    process.exit();
}
