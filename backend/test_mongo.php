<?php
// Test 1: With tlsAllowInvalidCertificates
echo "Test 1: With tlsAllowInvalidCertificates=true\n";
$dsn = 'mongodb+srv://niteshkumar231_db_user:WisdomPharma@cluster0.yct6bng.mongodb.net/?retryWrites=true&w=majority&appName=WisdomPharma';

try {
    $client = new MongoDB\Driver\Manager($dsn, [
        'tls' => true,
        'tlsAllowInvalidCertificates' => true,
    ]);
    $cmd = new MongoDB\Driver\Command(['ping' => 1]);
    $result = $client->executeCommand('admin', $cmd);
    echo "SUCCESS!\n";
    echo "Response: " . json_encode(current($result->toArray())) . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Test 2: With serverSelectionTimeoutMS increased
echo "\nTest 2: With longer timeout + tlsInsecure\n";
try {
    $client = new MongoDB\Driver\Manager($dsn, [
        'tls' => true,
        'tlsInsecure' => true,
        'serverSelectionTimeoutMS' => 10000,
    ]);
    $cmd = new MongoDB\Driver\Command(['ping' => 1]);
    $result = $client->executeCommand('admin', $cmd);
    echo "SUCCESS!\n";
    echo "Response: " . json_encode(current($result->toArray())) . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
