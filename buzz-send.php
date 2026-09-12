<?php
/**
 * Buzz Outreach Engine - cPanel Direct Email Bridge
 * Upload this file to your cPanel public_html directory (e.g. https://yourdomain.com/buzz-send.php)
 * This allows Buzz to dispatch personalized cold outreach emails directly from your cPanel domain
 * with attached high-resolution visual mockups (.jpg), in both single-send and automated bulk mode.
 */

// 1. CORS Headers - Allow requests from Buzz PWA (GitHub Pages / local / custom domain)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Buzz-Secret, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["status" => "ready"]);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed. Use POST."]);
    exit;
}

// 2. Read and decode JSON input payload
$rawInput = file_get_contents("php://input");
if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Empty request body."]);
    exit;
}

$payload = json_decode($rawInput, true);
if (!$payload) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON payload."]);
    exit;
}

// Optional security token verification (if configured in Buzz Settings)
$expectedSecret = ""; // Optional: Enter a secret string here (e.g. "my_buzz_secret_123") if desired
if (!empty($expectedSecret)) {
    $providedSecret = $payload['secretKey'] ?? ($_SERVER['HTTP_X_BUZZ_SECRET'] ?? '');
    if ($providedSecret !== $expectedSecret) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Unauthorized: Invalid secret key."]);
        exit;
    }
}

// 3. Extract required email fields
$to = filter_var(trim($payload['to'] ?? ''), FILTER_VALIDATE_EMAIL);
$subject = trim($payload['subject'] ?? 'Hello from SmartRename AI');
$body = trim($payload['body'] ?? '');
$fromEmail = filter_var(trim($payload['fromEmail'] ?? ''), FILTER_VALIDATE_EMAIL);
$fromName = trim($payload['fromName'] ?? 'Outreach Team');
$attachmentBase64 = $payload['attachmentBase64'] ?? '';
$attachmentName = trim($payload['attachmentName'] ?? 'workflow_mockup.jpg');

// Default fallback for sender if none provided
if (!$fromEmail) {
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $fromEmail = "noreply@" . preg_replace('/^www\./', '', $host);
}

if (!$to) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing or invalid recipient email ('to')."]);
    exit;
}

if (empty($body)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email body cannot be empty."]);
    exit;
}

// 4. Construct RFC 2045 Multipart MIME Email with Attachment
$boundary = "==Multipart_Boundary_x" . md5(time() . rand(1000, 9999)) . "x";

// Base Headers
$headers = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <{$fromEmail}>\r\n";
$headers .= "Reply-To: {$fromEmail}\r\n";
$headers .= "Return-Path: {$fromEmail}\r\n";
$headers .= "X-Mailer: Buzz Outreach Engine / PHP " . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";

// Multipart Body
$multipartMessage = "--{$boundary}\r\n";
$multipartMessage .= "Content-Type: text/plain; charset=UTF-8\r\n";
$multipartMessage .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$multipartMessage .= $body . "\r\n\r\n";

// Process Base64 Attachment if provided (e.g. data:image/jpeg;base64,...)
if (!empty($attachmentBase64)) {
    // Strip data URL scheme prefix if present
    $cleanBase64 = preg_replace('/^data:image\/\w+;base64,/', '', $attachmentBase64);
    $binaryData = base64_decode($cleanBase64);

    if ($binaryData !== false && strlen($binaryData) > 0) {
        $encodedAttachment = chunk_split(base64_encode($binaryData));
        $cleanFileName = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $attachmentName);
        
        $multipartMessage .= "--{$boundary}\r\n";
        $multipartMessage .= "Content-Type: image/jpeg; name=\"{$cleanFileName}\"\r\n";
        $multipartMessage .= "Content-Description: {$cleanFileName}\r\n";
        $multipartMessage .= "Content-Disposition: attachment; filename=\"{$cleanFileName}\"\r\n";
        $multipartMessage .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $multipartMessage .= $encodedAttachment . "\r\n\r\n";
    }
}

$multipartMessage .= "--{$boundary}--";

// 5. Send via native PHP mail() on cPanel
$encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
$sent = @mail($to, $encodedSubject, $multipartMessage, $headers, "-f" . $fromEmail);

if ($sent) {
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Email dispatched successfully to {$to}",
        "recipient" => $to,
        "timestamp" => date("c")
    ]);
} else {
    // If native mail failed, return helpful error
    http_response_code(500);
    $lastError = error_get_last();
    echo json_encode([
        "status" => "error",
        "message" => "Server mail delivery failed: " . ($lastError['message'] ?? 'Check cPanel email routing / SPF settings.'),
        "hint" => "Verify that your cPanel account has active email service enabled."
    ]);
}
