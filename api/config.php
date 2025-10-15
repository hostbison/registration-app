<?php
class Config {
    const DB_HOST = 'pdb1042.runhosting.com';
    const DB_NAME = '4683622_test';
    const DB_USER = '4683622_test';     // You'll get this from your hosting
    const DB_PASS = 'Host@Bison25';     // You'll get this from your hosting
    const DB_CHARSET = 'utf8mb4';
    
    public static function getConnection() {
        static $connection = null;
        
        if ($connection === null) {
            try {
                $dsn = "mysql:host=" . self::DB_HOST . ";dbname=" . self::DB_NAME . ";charset=" . self::DB_CHARSET;
                $connection = new PDO($dsn, self::DB_USER, self::DB_PASS);
                $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                $connection->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            } catch (PDOException $e) {
                error_log("Database connection failed: " . $e->getMessage());
                throw new Exception('Database connection failed');
            }
        }
        
        return $connection;
    }
    
    public static function initDatabase() {
        try {
            $db = self::getConnection();
            
            // Check if table exists, create if not
            $tableCheck = $db->query("SHOW TABLES LIKE 'users'");
            if ($tableCheck->rowCount() == 0) {
                // Table doesn't exist - you might want to run your SQL file here
                error_log("Users table doesn't exist. Please run the setup.sql file.");
            }
            
        } catch (Exception $e) {
            error_log("Database initialization failed: " . $e->getMessage());
            throw $e;
        }
    }
}

// Initialize database on include
Config::initDatabase();
?>