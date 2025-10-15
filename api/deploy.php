<?php
// /api/deploy.php - GitHub Webhook Handler
$secret = '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';

// Get the payload from GitHub
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Verify the signature
$hash = 'sha256=' . hash_hmac('sha256', $payload, $secret);
if (hash_equals($hash, $signature)) {
    // Execute deployment commands
    $output = [];
    $return_code = 0;
    
    // Pull latest changes from GitHub
    exec('cd /path/to/your/project && git pull origin main 2>&1', $output, $return_code);
    
    // Log the deployment
    file_put_contents('/path/to/deploy.log', 
        date('Y-m-d H:i:s') . " - Deployment triggered\n" . 
        "Output: " . implode("\n", $output) . "\n\n", 
        FILE_APPEND
    );
    
    http_response_code(200);
    echo "Deployment successful";
} else {
    http_response_code(403);
    echo "Invalid signature";
}
?>