const TestModel = require('../sdk/testModel');
const test = require('test');
test.setup();


describe("testModel", () => {
    let id;

    before(() => {
        global.ResetCaseEnv();
    })

    it("create testModel", () => {
        let res = TestModel.create({
            //
        })
        assert.property(res, "id");
        id = res.id;
        check_result(res, {
            //
        })
    });

    it("get testModel", () => {
        let res = TestModel.get(id);
        check_result(res, {
            //
        })
    });

    it("find testModels", () => {
        let r = TestModel.find(`{
            
        }`);
        check_result(r, [])
    });

    it("update testModel", () => {
        let r = TestModel.update(id, {
            //
        });
        check_result(r, {})
    });

    it("delete testModel", () => {
        let r = TestModel.delete(id);
        check_result(r, {})
    });
});