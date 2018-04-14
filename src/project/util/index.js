const db = require('db');
const Config = require("../conf/config.json");

module.exports = {
    cleanData: function () {
        let rs;
        let connType = Config.type;
        let conn = db.open(Config[connType]);

        if (connType === "sqlite") {
            rs = conn.execute(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;`);

            rs.forEach((record) => {
                conn.execute(`DELETE FROM ${record.name}`);
            });
        } else {
            rs = conn.execute(`SELECT table_name name FROM information_schema.tables WHERE table_schema = "${Config.DataBaseName}"`);

            rs.forEach((record) => {
                if (!["fib_storage", "session"].includes(record.name)) {
                    conn.execute(`DROP TABLE ${record.name}`);
                }
            });
        }
    },
}