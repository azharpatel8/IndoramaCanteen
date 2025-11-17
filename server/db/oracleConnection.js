import oracledb from 'oracledb';

const pool = {};

export async function initializeConnectionPool() {
  try {
    if (Object.keys(pool).length === 0) {
      const poolConfig = {
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: process.env.ORACLE_CONNECT_STRING,
        poolMin: parseInt(process.env.ORACLE_POOL_MIN || 2),
        poolMax: parseInt(process.env.ORACLE_POOL_MAX || 10),
        poolIncrement: 1,
      };

      if (!poolConfig.user || !poolConfig.password || !poolConfig.connectString) {
        throw new Error('Oracle credentials not configured in environment variables');
      }

      const createdPool = await oracledb.createPool(poolConfig);
      Object.assign(pool, createdPool);
      console.log('Oracle connection pool created successfully');
    }
    return pool;
  } catch (error) {
    console.error('Error creating connection pool:', error);
    throw error;
  }
}

export async function getConnection() {
  try {
    if (Object.keys(pool).length === 0) {
      throw new Error('Connection pool not initialized');
    }
    return await pool.getConnection();
  } catch (error) {
    console.error('Error getting connection from pool:', error);
    throw error;
  }
}

export async function closePool() {
  try {
    if (Object.keys(pool).length > 0) {
      await pool.close();
      console.log('Connection pool closed');
    }
  } catch (error) {
    console.error('Error closing connection pool:', error);
    throw error;
  }
}
