const assert = require('assert');
const http = require('http');

module.exports = {
    // 创建
    create: (obj) => {
        let rep = httpclient.post(`http://${global.host}/1.0/app/testModel`, {
            json: obj
        });
        assert.equal(rep.statusCode, 201);
        assert.property(rep.json(), "id");
        return rep.json().id;
    },
    // 获取
    get: (id) => {
        let res = graphql(
            `{
                testModel(id:"${id}"){
                    id
                }
            }`
        );
        assert.equal(res.statusCode, 200);
        return res.json().data.testModel;
    },
    // 筛选
    find: (condition = "{}") => {
        let res = graphql(
            `{
                find_testModel(
                    where: ${condition}
                ){
                    id
                }
            }`
        );

        assert.equal(res.statusCode, 200);
        return res.json();
    },
    // 更新
    update: (id, obj) => {
        let rep = httpclient.put(`http://${global.host}/1.0/app/testModel/${id}`, {
            json: obj
        });
        assert.equal(rep.statusCode, 200);
        assert.property(rep.json(), "id");
        return rep.json();
    },
    // 删除
    delete: (id) => {
        let rep = httpclient.del(`http://${global.host}/1.0/app/testModel/${id}`);
        assert.equal(rep.statusCode, 200);
        assert.property(rep.json(), "id");
        return rep.json();
    },
};