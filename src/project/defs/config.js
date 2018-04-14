const orm = require('fib-orm');

module.exports = db => {
    var Config = db.define('config', {
        key: {
            type: "text",
            size: 32,
            required: true,
            unique: true
        },
        value: {
            type: "text",
            size: 32
        }
    }, {
        hooks: {
            beforeCreate: function () {
            }
        },
        methods: {
            checkPassword: function () {
            }
        },
        validations: {
            // age: orm.enforce.ranges.number(10, 18, "teenage")
        },
        functions: {
            login: (req, data) => {},
        },
        ACL: function (session) {
            return {
                '*': false
            };
        },
    });
    return Config;
};