<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://test.hostbisonapp.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

// Only handle POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
    exit;
}

// Validate required fields
$required = ['name', 'email', 'company', 'password', 'confirmPassword'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "All fields are required"]);
        exit;
    }
}

// Extract and sanitize data
$name = trim($input['name']);
$email = trim($input['email']);
$company = trim($input['company']);
$password = $input['password'];
$confirmPassword = $input['confirmPassword'];

// Validation errors array
$errors = [];

// Name validation (letters and spaces only)
if (!preg_match('/^[A-Za-z\s\'-]+$/', $name)) {
    $errors[] = 'Name can only contain letters, spaces, apostrophes, and hyphens';
}

if (strlen($name) < 2 || strlen($name) > 100) {
    $errors[] = 'Name must be between 2 and 100 characters';
}

// Email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please provide a valid email address';
}

if (strlen($email) > 255) {
    $errors[] = 'Email address is too long';
}

// Company validation
if (empty($company) || strlen($company) > 100) {
    $errors[] = 'Company name must be between 1 and 100 characters';
}

// Password validation
if (!preg_match('/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]{6,}$/', $password)) {
    $errors[] = 'Password must be at least 6 characters and include letters, numbers, and symbols';
}

// Confirm password
if ($password !== $confirmPassword) {
    $errors[] = 'Passwords do not match';
}

// If validation errors, return them
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => implode(', ', $errors)]);
    exit;
}

try {
    $db = Config::getConnection();
    
    // Check if email already exists
    $stmt = $db->prepare('SELECT id FROM users WHERE email = :email');
    $stmt->bindValue(':email', $email);
    $stmt->execute();
    
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email already registered']);
        exit;
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert user
    $stmt = $db->prepare('
        INSERT INTO users (name, email, company, password) 
        VALUES (:name, :email, :company, :password)
    ');
    
    $stmt->bindValue(':name', $name);
    $stmt->bindValue(':email', $email);
    $stmt->bindValue(':company', $company);
    $stmt->bindValue(':password', $hashedPassword);
    
    if ($stmt->execute()) {
        $userId = $db->lastInsertId();
        
        // Log successful registration (for security)
        error_log("User registered: $email");
        
        echo json_encode([
            'success' => true, 
            'message' => 'User registered successfully',
            'userId' => $userId
        ]);
    } else {
        throw new Exception('Failed to create user');
    }
    
} catch (PDOException $e) {
    error_log("Database error during registration: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Registration failed. Please try again.']);
} catch (Exception $e) {
    error_log("General error during registration: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'An unexpected error occurred.']);
}
?>