const assert = require('assert');
const App = require('fib-app');
const config = require("../conf/config.json");
const connstr = config[config.type];
const process = require('process');
const Target = process.env.npm_lifecycle_event;
let app = new App(connstr, {});
app.db.use(require('../defs'));

app.db(db => {
    const User = db.models.user;

    try {
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
            fullname: '管理员',
            mobile: '13913913910',
            password: 'a123456',
            role: 'admin',
        });
        assert.equal(u.id, 1, "管理员初始化错误！");

        console.notice(`    √ 系统初始化成功！`);

        if (Target === 'init') {
            process.exit();
        }
    } catch (e) {
        console.error("初始化错误 :", e.message);
        return false;
    }
});