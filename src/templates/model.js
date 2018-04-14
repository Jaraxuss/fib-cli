module.exports = db => {
    let TestModel = db.define('testModel', {
        id: {
            type: "serial",
            size: "8",
            key: true
        },
    }, {
        hooks: {
            beforeValidation: function () {

            },
            beforeCreate: function () {

            },
            beforeSave: function () {

            },
            afterSave: function (isSaved) {

            },
            afterCreate: function (isCreated) {

            },
            afterLoad: function () {

            },
            afterAutoFetch: function () {

            },
            beforeRemove: function () {

            },
            afterRemove: function (isRemoved) {

            },
        },
        methods: {

        },
        validations: {
            
        },
        functions: {

        },
        ACL: function(session) {
            return {
                'roles': {
                    'admin': {
                        'find': true,
                        'read': true,
                    }
                },
                '*': false
            };
        },
        OACL: function (session) {
            let _acl = {};

            if (session.id === this.id && session.roles.includes('user'))
                _acl[session.id] = {
                    'find': true,
                    'read': true,
                };

            return _acl;
        }
    });
    
    return TestModel;
};