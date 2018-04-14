const test = require('test');
test.setup();

const User = require('../sdk/user');

describe("user", () => {
    let id;

    before(() => {
        global.ResetCaseEnv();
    })

    it("login by admin", () => {
        let r = User.login("13913913910", "a123456");
        assert.property(r, "id");
        id = r.id;
        check_result(r, {
            "roles": [
                "admin"
            ],
            "mobile": "13913913910"
        })
    });

    it("get admin info", () => {
        let r = User.get(id);
        assert.property(r, "id");
        check_result(r, {
            "status": "normal",
            "role": "admin",
            "fullname": "管理员",
            "mobile": "13913913910",
        });
    });

    it("user register", () => {
        let r = User.register({
            mobile: '13913913913',
            password: 'a123456',
        });
        check_result(r, {
            "message": '注册成功'
        })
    });

    it("login by user", () => {
        let res = httpclient.post(`http://${global.host}/1.0/app/user/login`, {
            json: {
                mobile: '13913913913',
                password: '654321',
            }
        });

        assert.equal(res.statusCode, 400);
        check_result(res.json(), {
            "code": 4000003,
            "message": "用户名或密码错误"
        })
    });

    it("login by user", () => {
        let r = User.login("13913913913", "a123456");
        id = r.id;
        check_result(r, {
            "roles": ["user"],
            "mobile": "13913913913"
        })
    });

    it("get user info", () => {
        let r = User.get(id);

        assert.property(r, "id");
        check_result(r, {
            "status": "normal",
            "role": "user",
            "fullname": null,
            "mobile": "13913913913"
        });
    });

    it("find users", () => {
        User.admin.login();
        let res = User.find(`{
            mobile: "13913913913"
        }`);

        check_result(res.data.find_user, [{
            "status": "normal",
            "role": "user",
            "fullname": null,
            "mobile": "13913913913"
        }]);
    });
});