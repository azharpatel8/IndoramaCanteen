# Oracle Database Setup Guide

## Complete Oracle Database Configuration for Indorama Canteen

### System Requirements

- Oracle Database 11g Release 2 or higher (12c, 19c, 21c recommended)
- Minimum 2GB RAM
- Minimum 10GB disk space
- Network access to Oracle port (default: 1521)

### Windows Setup

#### 1. Download and Install Oracle Database
1. Download from https://www.oracle.com/database/technologies/xe-downloads.html
2. Run the installer
3. Follow the installation wizard
4. Note the SYS password and service name

#### 2. Verify Installation
```cmd
sqlplus sys/your_password as sysdba
SQL> SELECT * FROM v$version;
```

#### 3. Create Application User
```sql
SQL> CREATE USER canteen_user IDENTIFIED BY canteen_password;
SQL> GRANT CONNECT, RESOURCE TO canteen_user;
SQL> GRANT UNLIMITED TABLESPACE TO canteen_user;
SQL> EXIT;
```

#### 4. Connect as Application User
```cmd
sqlplus canteen_user/canteen_password@XE
```

#### 5. Run Schema Script
```sql
SQL> @C:\path\to\project\server\db\schema.sql
SQL> COMMIT;
SQL> EXIT;
```

### Linux Setup

#### 1. Pre-requisites
```bash
sudo apt-get update
sudo apt-get install -y build-essential libaio1 libaio-dev
```

#### 2. Download and Install Oracle
```bash
# Download from Oracle website
unzip linux.x64_11gR2_database_1of2.zip
unzip linux.x64_11gR2_database_2of2.zip
cd database
./runInstaller
```

#### 3. Create User and Groups
```bash
sudo groupadd oinstall
sudo groupadd dba
sudo useradd -g oinstall -G dba oracle
sudo usermod -aG sudo oracle
```

#### 4. Post-Installation
```bash
sudo /u01/app/oracle/product/11.2.0/db_1/root.sh
```

### macOS Setup

#### Using Homebrew
```bash
brew install oracle-instant-client
```

#### Or Docker Container
```bash
docker pull oracle/database:11.2.0.2-ee
docker run -d -p 1521:1521 --name oracle-db oracle/database:11.2.0.2-ee
```

### Oracle Cloud Setup

#### 1. Create Autonomous Database
1. Log in to Oracle Cloud Console
2. Navigate to Databases > Autonomous Database
3. Create Autonomous Database (ATP or ADW)
4. Wait for provisioning

#### 2. Get Connection Details
1. Download wallet.zip from database console
2. Extract wallet to local directory
3. Update .env with connection string from tnsnames.ora

#### 3. Create Schema
```bash
sqlplus admin/password@database_name_high
@server/db/schema.sql
```

### Connection String Examples

#### Local Installation
```
ORACLE_CONNECT_STRING=localhost:1521/ORCL
ORACLE_CONNECT_STRING=localhost:1521/XE
ORACLE_CONNECT_STRING=127.0.0.1:1521/ORCL
```

#### Remote Server
```
ORACLE_CONNECT_STRING=oracle.example.com:1521/PROD
ORACLE_CONNECT_STRING=192.168.1.100:1521/ORCL
```

#### Oracle Cloud ATP
```
ORACLE_CONNECT_STRING=adb.us-phoenix-1.oraclecloud.com:1522/dbname_high
ORACLE_CONNECT_STRING=adb.ap-singapore-1.oraclecloud.com:1522/service_name
```

#### Using TNS Entry
```
ORACLE_CONNECT_STRING=TNSNAME
```

### Verify Database is Running

#### Windows
```cmd
sqlplus sys/password as sysdba
SQL> SELECT STATUS FROM V$INSTANCE;
```

#### Linux/macOS
```bash
sqlplus sys/password as sysdba
SQL> SELECT STATUS FROM V$INSTANCE;
```

### Test Connection from Node.js

Create test file `test-connection.js`:
```javascript
const oracledb = require('oracledb');

async function testConnection() {
  try {
    const connection = await oracledb.getConnection({
      user: 'canteen_user',
      password: 'canteen_password',
      connectString: 'localhost:1521/ORCL'
    });
    const result = await connection.execute('SELECT 1 FROM DUAL');
    console.log('Connection successful:', result);
    await connection.close();
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();
```

Run with:
```bash
node test-connection.js
```

### Create Schema Using SQLPlus

#### Step 1: Connect
```bash
sqlplus canteen_user/canteen_password@localhost:1521/ORCL
```

#### Step 2: Run Schema Script
```sql
@server/db/schema.sql
```

#### Step 3: Verify Tables
```sql
SELECT table_name FROM user_tables;
```

Expected tables:
- USERS
- MENU_ITEMS
- ORDERS
- ORDER_ITEMS
- BILLING
- FEEDBACK

#### Step 4: Verify Sequences
```sql
SELECT sequence_name FROM user_sequences;
```

Expected sequences:
- USERS_SEQ
- MENU_ITEMS_SEQ
- ORDERS_SEQ
- ORDER_ITEMS_SEQ
- BILLING_SEQ
- FEEDBACK_SEQ

### Seed Sample Data

```sql
-- Add sample menu items
INSERT INTO menu_items VALUES (
  menu_items_seq.NEXTVAL,
  'Paneer Tikka',
  'Grilled paneer with yogurt marinade',
  'Main Course',
  250.00,
  50,
  1,
  'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg',
  SYSTIMESTAMP,
  SYSTIMESTAMP
);

INSERT INTO menu_items VALUES (
  menu_items_seq.NEXTVAL,
  'Butter Chicken',
  'Creamy chicken curry with aromatic spices',
  'Main Course',
  300.00,
  50,
  1,
  'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
  SYSTIMESTAMP,
  SYSTIMESTAMP
);

INSERT INTO menu_items VALUES (
  menu_items_seq.NEXTVAL,
  'Masala Chai',
  'Traditional Indian spiced tea',
  'Beverages',
  50.00,
  100,
  1,
  'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg',
  SYSTIMESTAMP,
  SYSTIMESTAMP
);

INSERT INTO menu_items VALUES (
  menu_items_seq.NEXTVAL,
  'Garlic Naan',
  'Freshly baked Indian bread with garlic butter',
  'Snacks',
  80.00,
  50,
  1,
  NULL,
  SYSTIMESTAMP,
  SYSTIMESTAMP
);

INSERT INTO menu_items VALUES (
  menu_items_seq.NEXTVAL,
  'Gulab Jamun',
  'Sweet milk solids in sugar syrup',
  'Desserts',
  100.00,
  30,
  1,
  NULL,
  SYSTIMESTAMP,
  SYSTIMESTAMP
);

COMMIT;
```

### Troubleshooting

#### Connection Refused
```
ORA-12514: TNS:listener does not currently know of service requested in connect descriptor
```

**Solution:**
1. Check Oracle listener is running: `lsnrctl status`
2. Start listener: `lsnrctl start`
3. Verify service name: `lsnrctl services`
4. Verify ORACLE_CONNECT_STRING format

#### Invalid Username/Password
```
ORA-01017: invalid username/password; logon denied
```

**Solution:**
1. Verify credentials are correct
2. Check user exists: `SELECT USERNAME FROM DBA_USERS;`
3. Reset password: `ALTER USER canteen_user IDENTIFIED BY new_password;`

#### Table Does Not Exist
```
ORA-00942: table or view does not exist
```

**Solution:**
1. Check if schema was created: `SELECT TABLE_NAME FROM USER_TABLES;`
2. Ensure logged in as correct user
3. Re-run schema script: `@server/db/schema.sql`

#### No Tablespace Error
```
ORA-01652: unable to extend temp segment by 256 in tablespace TEMP
```

**Solution:**
1. Grant unlimited tablespace:
   ```sql
   ALTER USER canteen_user QUOTA UNLIMITED ON SYSTEM;
   ```

#### Sequence Not Found
```
ORA-02289: sequence does not exist
```

**Solution:**
1. Verify sequences exist:
   ```sql
   SELECT SEQUENCE_NAME FROM USER_SEQUENCES;
   ```
2. Re-run schema script to create sequences

### Performance Tuning

#### Connection Pool Settings
```env
# Minimum connections to maintain
ORACLE_POOL_MIN=2

# Maximum connections allowed
ORACLE_POOL_MAX=10

# Connections to create when pool is exhausted
ORACLE_POOL_INCREMENT=1
```

#### Recommended Settings by Usage
- **Development**: MIN=1, MAX=5
- **Small Office**: MIN=2, MAX=10
- **Large Office**: MIN=5, MAX=20
- **Enterprise**: MIN=10, MAX=50

#### Enable Query Caching
```sql
ALTER SESSION SET QUERY_RESULT_CACHE=ON;
```

### Backup and Recovery

#### Full Database Backup
```sql
BACKUP DATABASE PLUS ARCHIVELOG;
```

#### User Data Backup
```sql
EXPDP canteen_user/canteen_password@ORCL DIRECTORY=DATA_PUMP_DIR DUMPFILE=canteen_backup.dmp LOGFILE=canteen_backup.log;
```

#### Restore
```sql
IMPDP canteen_user/canteen_password@ORCL DIRECTORY=DATA_PUMP_DIR DUMPFILE=canteen_backup.dmp LOGFILE=canteen_restore.log;
```

### Monitoring

#### Check Database Status
```sql
SELECT * FROM V$INSTANCE;
```

#### Monitor Connections
```sql
SELECT USERNAME, STATUS, OSUSER FROM V$SESSION;
```

#### Check Tablespace Usage
```sql
SELECT TABLESPACE_NAME, SUM(BYTES) FROM DBA_DATA_FILES GROUP BY TABLESPACE_NAME;
```

### Security Best Practices

1. **Strong Passwords**
   ```sql
   ALTER USER canteen_user IDENTIFIED BY "P@ssw0rd!2024#Secure";
   ```

2. **Restrict User Privileges**
   ```sql
   REVOKE ALL PRIVILEGES FROM canteen_user;
   GRANT CONNECT ON canteen_user TO canteen_user;
   GRANT SELECT, INSERT, UPDATE, DELETE ON canteen_user.* TO canteen_user;
   ```

3. **Enable Audit**
   ```sql
   AUDIT SELECT, INSERT, UPDATE, DELETE ON canteen_user.USERS;
   ```

4. **Use SQL*Net Encryption**
   ```
   SQLNET.ENCRYPTION_SERVER = REQUIRED
   ```

5. **Regular Backups**
   - Daily incremental backups
   - Weekly full backups
   - Monthly archive copies

### Useful SQL Queries

#### Get All Tables
```sql
SELECT TABLE_NAME FROM USER_TABLES;
```

#### Get All Sequences
```sql
SELECT SEQUENCE_NAME FROM USER_SEQUENCES;
```

#### Get All Indexes
```sql
SELECT INDEX_NAME FROM USER_INDEXES;
```

#### Get Column Information
```sql
SELECT COLUMN_NAME, DATA_TYPE, NULLABLE FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'USERS';
```

#### Get Table Row Count
```sql
SELECT COUNT(*) FROM USERS;
```

#### Get Database Size
```sql
SELECT SUM(BYTES)/1024/1024 AS SIZE_MB FROM DBA_DATA_FILES;
```

### Resources

- Oracle Documentation: https://docs.oracle.com/
- Oracle Learning: https://www.oracle.com/database/
- SQL Reference: https://docs.oracle.com/en/database/
- Node-oracledb: https://github.com/oracle/node-oracledb
