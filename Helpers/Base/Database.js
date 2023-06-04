class Database {
  constructor(connection) {
    this.connection = connection;
  }

  async connect() {
    try {
      await this.connection.connect();
      console.log('Connected to the database');
    } catch (error) {
      console.error('Failed to connect to the database:', error);
    }
  }

  async disconnect() {
    try {
      await this.connection.end();
      console.log('Disconnected from the database');
    } catch (error) {
      console.error('Failed to disconnect from the database:', error);
    }
  }

  async query(queryString) {
    try {
      const results = await this.connection.query(queryString);
      console.log('Query executed successfully');
      return results;
    } catch (error) {
      console.error('Failed to execute query:', error);
      throw error;
    }
  }
}

module.exports = Database;