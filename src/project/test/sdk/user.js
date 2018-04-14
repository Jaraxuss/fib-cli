const assert = require('assert');
const gd = require('gd');
const http = require('http');

function postRequest(d, method) {
    let res = httpclient.post(`http://${global.host}/1.0/app/user/${method}`, {
        json: d.requestBody
    });
    check_result(res.statusCode, d.statusCode);
    check_result(res.json(), d.responseBody);
}

module.exports = {
    // 获取用户信息
    get: (id) => {
        let res = graphql(
            `{
                user(id:"${id}"){
                    id
                    status
                    role
                    fullname
                    mobile
                }
            }`
        );
        assert.equal(res.statusCode, 200);
        return res.json().data.user;
    },
    // 登录
    login: (mobile, password, type) => {
        let res = httpclient.post(`http://${global.host}/1.0/app/user/login`, {
            json: {
                mobile: mobile,
                password: password,
            }
        });

        assert.equal(res.statusCode, 200);
        return res.json();
    },
    // 登出
    logout: () => {
        let res = httpclient.post(`http://${global.host}/1.0/app/user/logout`, {
            json: {}
        });
        assert.equal(res.statusCode, 200);
    },
    // 修改密码
    updatePassword: (d) => {
        let res = httpclient.post(`http://${global.host}/1.0/app/user/updatePassword`, {
            json: d
        });

        assert.equal(res.statusCode, 200);
        return res.json();
    },
    // 用户注册
    register: d => {
        let res = httpclient.post(`http://${global.host}/1.0/app/user/register`, {
            json: d
        });

        assert.equal(res.statusCode, 200);
        return res.json();
    },
    //账号管理 筛选用户
    find: (condition = "{}") => {
        let res = graphql(
            `{
                find_user(
                    where: ${condition}
                ){
                    id
                    status
                    role
                    fullname
                    mobile
                }
            }`
        );

        assert.equal(res.statusCode, 200);
        return res.json();
    },
    // 管理员登录/登出/更新
    admin: {
        login: () => {
            return module.exports.login("13913913910", "a123456");
        },
        logout: () => {
            return module.exports.logout();
        },
    },
};