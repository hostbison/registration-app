<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://test.hostbisonapp.com');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $db = Config::getConnection();
    
    $stmt = $db->query('
        SELECT id, name, email, company, created_at 
        FROM users 
        ORDER BY created_at DESC
        LIMIT 100
    ');
    
    $users = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'data' => $users,
        'count' => count($users)
    ]);
    
} catch (Exception $e) {
    error_log("Error fetching users: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Failed to fetch users'
    ]);
}
?>