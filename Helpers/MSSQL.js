const sql = require('mssql');

const config = {
  user: '',
  password: '',
  server: 'MEHFATITEMPC\\SQLEXPRESS01',
  database: 'facedetect',
  options: {
    trustedConnection: true,
    trustServerCertificate: false, // Set to false when using the imported certificate
    enableArithAbort: true,
    encrypt: true // Enable encryption
  },
};

const connectionString = "metadata=res://*/FaceDetectModel.csdl|res://*/FaceDetectModel.ssdl|res://*/FaceDetectModel.msl;provider=System.Data.SqlClient;provider connection string=&quot;data source=MEHFATITEMPC\SQLEXPRESS01;initial catalog=facedetect;integrated security=True;MultipleActiveResultSets=True;App=EntityFramework&quot;"

class MSSQL {
  async connect() {
    try {
      await sql.connect(connectionString);
      console.log('Connected to the MSSQL server');
    } catch (error) {
      console.error('Error connecting to the MSSQL server:', error);
    }
  }

  async disconnect() {
    try {
      await sql.close();
      console.log('Disconnected from the MSSQL server');
    } catch (error) {
      console.error('Error disconnecting from the MSSQL server:', error);
    }
  }

  async executeQuery(query) {
    try {
      const result = await sql.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error executing the query:', error);
      throw error;
    }
  }
}

module.exports = MSSQL;