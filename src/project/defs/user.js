const orm = require('fib-orm');
const util = require('util');
const crypto = require('crypto');

module.exports = db => {
    const User = db.define('user', {
        password: {
            type: "text",
            size: 128,
        },
        salt: {
            type: "text",
            size: 128,
        },
        status: {
            type: "enum",
            values: ["normal", "freezed"],
            defaultValue: "normal"
        },
        role: {
            required: true,
            type: "enum",
            values: ["user", "admin"],
            defaultValue: "user"
        },
        fullname: {
            type: "text",
            size: 32,
        },
        mobile: {
            required: true,
            unique: true,
            type: "text",
            size: 32,
        },
    }, {
            hooks: {
                beforeCreate: function () {
                    var salt = crypto.pseudoRandomBytes(64);
                    this.salt = salt.hex();
                    this.password = crypto.pbkdf2(this.password, salt, 256, 64, 'sha1').hex();
                },
                afterSave: function () {
                },
            },
            methods: {
                checkPassword: function (password) {
                    return this.password == crypto.pbkdf2(password, new Buffer(this.salt, 'hex'), 256, 64, 'sha1').hex();
                },
            },
            validations: {
                mobile: orm.enforce.unique("该手机号已存在！"),
            },
            functions: {
                sync: (req, data) => {
                    /**
                     * @api {POST} /1.0/app/user/sync 判断用户是否登入
                     * @apiDescription 判断用户是否登入
                     * @apiGroup User
                     * @apiSuccessExample {json} Success-Response:
                     * {
                     *     id: 2,
                     *     name: 张三,
                     *     roles: ['user']
                     * }
                     * @apiSuccessExample {json} Success-Response:
                     * {
                     *     id: null,
                     *     name: null,
                     *     roles: []
                     * }
                     */
                    if (!req.session.id) {
                        return User.initSession(req, {});
                    }

                    let u = User.getSync(req.session.id);
                    if (u) {
                        return User.initSession(req, u);
                    }
                },
                login: (req, data) => {
                    /**
                     * @api {POST} /1.0/app/user/login 登录
                     * @apiDescription 登录
                     * @apiGroup User
                     * @apiParam {String} mobile 手机号码
                     * @apiParam {String} password 密码
                     * @apiParam {String} type 角色类型 ['user', 'admin']
                     * @apiParamExample {json} Request-Example:
                     * {
                     *     mobile: '13913913911',
                     *     password: '123456'
                     *     type: 'user'
                     * }
                     * @apiSuccessExample {json} Success-Response:
                     * {
                     *     id: 2,
                     *     fullname: 张三,
                     *     roles: [user],
                     *     mobile: '13913913911'
                     * }
                     * @apiErrorExample {json} Error-Response:
                     * {
                     *    code: 4040002,
                     *    message: "该用户不存在"
                     * }
                     * @apiErrorExample {json} Error-Response:
                     * {
                     *     code: 4040003,
                     *     message: "用户名或密码错误"
                     * }
                     * @apiErrorExample {json} Error-Response:
                     * {
                     *     code: 4040005,
                     *     message: "该账号已被冻结"
                     * }
                     * @apiErrorExample {json} Error-Response:
                     * {
                     *     code: 4040001,
                     *     message: "required mobile and password"
                     * }
                     */
                    if (!data.mobile || !data.password) return {
                        error: {
                            code: 4040001,
                            message: 'required mobile and password'
                        }
                    }

                    let user = User.oneSync({
                        mobile: data.mobile
                    });

                    if (!user) {
                        return {
                            error: {
                                code: 4040002,
                                message: `该用户不存在`
                            }
                        }
                    }

                    if (user.status === "freezed") { //locked
                        return {
                            error: {
                                code: 4040005,
                                message: `该账号已被冻结`
                            }
                        }
                    }
                    if (!user.checkPassword(data.password)) {
                        return {
                            error: {
                                code: 4000003,
                                message: `用户名或密码错误`
                            }
                        }
                    }

                    return User.initSession(req, user);
                },
                logout: (req, data) => {
                    /**
                     * @api {POST} /1.0/app/user/logout 注销用户
                     * @apiDescription 注销用户
                     * @apiGroup User
                     * @apiParamExample {json} Request-Example:
                     * {}
                     * @apiSuccessExample {json} Success-Response:
                     * {}
                     */
                    req.session.id = 0;
                    req.session.name = "";
                    req.session.roles = [];
                    return {
                        success: {}
                    }
                },
                updatePassword: (req, data) => {
                    /**
                     * @api {POST} /1.0/app/user/updatePassword 用户修改自己密码
                     * @apiVersion 1.0.0
                     * @apiGroup User
                     * @apiName updatePassword
                     * @apiDescription 用户自己修改密码
                     *
                     * @apiParam {String{..32}} oldpassword 原密码
                     * @apiParam {String{..32}} newpassword 新密码
                     *
                     * @apiParamExample {json} Request-Example:
                     *     {
                     *         oldpassword: 'abcdefg',
                     *         newpassword： '123456'
                     *     }
                     *
                     * @apiSuccessExample {json} Success-Response:
                     *     HTTP/1.1 200 OK
                     *     {
                     *        message : "修改成功"
                     *     }
                     *
                     * @apiErrorExample {json} Error-Response:
                     *     {
                     *         code: 4030501,
                     *         message: '原密码错误'
                     *     }
                     * @apiErrorExample {json} Error-Response:
                     *     {
                     *         code: 4040001,
                     *         message: 'required oldpassword and newpassword'
                     *     }
                     */
                    if (!data.oldpassword || !data.newpassword) return {
                        error: {
                            code: 4040001,
                            message: 'required oldpassword and newpassword'
                        }
                    }

                    let u = User.getSync(req.session.id);
                    data.oldpassword = crypto.pbkdf2(data.oldpassword, new Buffer(u.salt, 'hex'), 256, 64, 'sha1').hex();
                    data.newpassword = crypto.pbkdf2(data.newpassword, new Buffer(u.salt, 'hex'), 256, 64, 'sha1').hex();

                    if (u.password === data.oldpassword) {
                        u.password = data.newpassword;
                        u.saveSync();
                        return {
                            success: {
                                message: "修改成功"
                            }
                        }
                    } else {
                        return {
                            error: {
                                code: 4030501,
                                message: "原密码错误"
                            }
                        }
                    }
                },
                register: (req, data) => {
                    /**
                     * @api {POST} /1.0/app/user/register 用户注册
                     * @apiDescription 用户注册
                     * @apiGroup User
                     * @apiParam {String} mobile 手机号码
                     * @apiParam {String} password 密码
                     * @apiParamExample {json} Request-Example:
                     * {
                     *     password: '123456',
                     *     mobile: '13913913913',
                     * }
                     * @apiSuccessExample {json} Success-Response:
                     * {
                     *     id: 2,
                     *     message: '注册成功'
                     * }
                     * @apiErrorExample {json} Error-Response:
                     * {
                     *     code: 4000104,
                     *     message: '注册用户失败'
                     * }
                     * @apiErrorExample {json} Error-Response:
                     * {
                     *     code: 4040105,
                     *     message: '该手机号已被注册'
                     * }
                     */
                    if (User.existsSync({ mobile: data.mobile })) return {
                        error: {
                            code: 4040105,
                            message: '该手机号已被注册'
                        }
                    }

                    try {
                        let id = User.createSync({
                            password: data.password,
                            mobile: data.mobile,
                        }).id;

                        if (id) {
                            return {
                                success: {
                                    id: id,
                                    message: '注册成功',
                                }
                            }
                        } else {
                            return {
                                success: {
                                    code: 4000104,
                                    message: '注册用户失败'
                                }
                            }
                        }
                    } catch (error) {
                        return {
                            error: {
                                code: 4000104,
                                message: error
                            }
                        }
                    }
                },
            },
            ACL: function (session) {
                return {
                    'roles': {
                        'admin': {
                            'find': true,
                            'read': true,
                            'write': true,
                            'extends': {
                                'createdBy': {
                                    'read': true,
                                    'find': true,
                                },
                            }
                        },
                        'user': {
                            'updatePassword': true,
                        },
                    },
                    '*': {
                        'login': true,
                        'logout': true,
                        'sync': true,
                        'register': true,
                    },
                };
            },
            OACL: function (session) {
                let _acl = {};

                if (session.id === this.id && session.roles.includes('user'))
                    _acl[session.id] = {
                        'read': ['id', 'role', 'status', 'mobile', 'fullname'],
                    };

                return _acl;
            }
        }
    );

    User.initSession = (req, user) => {
        let roles = [];
        if (user.role) {
            roles = [user.role];
        }
        req.session.id = user.id;
        req.session.roles = roles;
        return {
            success: {
                id: user.id,
                roles: roles,
                mobile: user.mobile
            }
        }
    }

    return User;
};