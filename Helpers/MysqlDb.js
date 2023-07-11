const mysql = require('mysql');

// Veritabanı bağlantı bilgileri
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'facedetect'
};

class MysqlDb {

  runQuery(sql, values, callback) {
    const connection = mysql.createConnection(dbConfig);

    // Veritabanına bağlanma
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        callback(err, null);
        connection.end(); // Close the connection
        return;
      }

      console.log('Connected to the database!');

      connection.query(sql, values, (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          callback(err, null);
          connection.end(); // Close the connection
          return;
        }
        //console.log('Query results:', results);
        callback(null, results);

        // Bağlantıyı kapatma
        connection.end((err) => {
          if (err) {
            console.error('Error disconnecting from the database:', err);
            return;
          }
          console.log('Disconnected from the database!');
        });
      });
    });
  }
}

module.exports = MysqlDb;