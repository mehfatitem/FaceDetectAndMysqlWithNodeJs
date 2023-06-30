const { Connection, Request } = require('tedious');

const config = {
  user: 'MEHFATITEMPC\\mehfatitem',
  password: '',
  server: 'MEHFATITEMPC\\SQLEXPRESS01',
  database: 'facedetect',
  port: 1433,
  options: {
    trustedConnection: true,
    trustServerCertificate: true, // Set to false when using the imported certificate
    enableArithAbort: true,
    encrypt: true // Enable encryption
  },
};

const connectionString = "data source=MEHFATITEMPC\\SQLEXPRESS01;initial catalog=facedetect;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=True;App=EntityFramework";


class MSSQL {
  constructor() {
    this.config = config;
    this.connection = new Connection(config);
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.connection.on('connect', err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

      this.connection.on('error', err => {
        reject(err);
      });

      this.connection.connect();
    });
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      const request = new Request(sql, (err, rowCount, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });

      params.forEach(param => {
        request.addParameter(param.name, param.type, param.value);
      });

      this.connection.execSql(request);
    });
  }

  close() {
    this.connection.close();
  }
}
module.exports = MSSQL;