module.exports = db => {
    var TestModel = db.define('testModel', {
        id: {
            type: "serial",
            size: "8",
            key: true
        },
    }, {
        hooks: {
            beforeCreate: function() {
            },
            afterCreate: function(ifcreate) {
            }
        },
        methods: {
        },
        validations: {
        },
        functions: {
        },
        ACL: function(session) {
            return {
                '*': true
            };
        },
        OACL: function(session) {
        }
    });
    return TestModel;
};