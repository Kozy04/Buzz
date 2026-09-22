<?php
/**
 * Buzz Outreach Engine - cPanel Direct Email Bridge (v2.0)
 * 
 * Upload this file to your cPanel public_html directory (e.g. https://yourdomain.com/buzz-send.php)
 * 
 * Features:
 * - Browser Health Dashboard (GET request shows status, server specs & connection tester)
 * - Authenticated SMTP Engine (Port 465 SSL / 587 TLS for 100% DKIM & Primary Inbox deliverability)
 * - Automatic Fallback to Native PHP mail()
 * - RFC 2045 Multipart MIME support with high-res visual mockup attachments
 * - CORS enabled for Buzz PWA
 */

// -----------------------------------------------------------------------------
// OPTIONAL DEFAULT CONFIGURATION (You can configure credentials here or in Buzz Settings)
// -----------------------------------------------------------------------------
$defaultSmtpHost = 'localhost'; // Usually 'localhost' or 'mail.' . $_SERVER['HTTP_HOST']
$defaultSmtpPort = 465;         // 465 for SSL, 587 for TLS
$defaultSmtpSecure = 'ssl';     // 'ssl' or 'tls'
$defaultSmtpUser = '';          // e.g. 'contact@yourdomain.com'
$defaultSmtpPass = '';          // Your cPanel email account password
$expectedSecret  = '';          // Optional: security token (e.g. 'buzz_secret_123')

// 1. CORS Headers - Allow requests from Buzz PWA
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Buzz-Secret, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(200);
    echo json_encode(["status" => "ready"]);
    exit;
}

// -----------------------------------------------------------------------------
// 2. GET Request: Friendly Browser Diagnostic Dashboard
// -----------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $host = $_SERVER['HTTP_HOST'] ?? 'yourdomain.com';
    $phpVersion = phpversion();
    $hasOpenSSL = extension_loaded('openssl');
    $hasSockets = function_exists('stream_socket_client');
    $mailFunction = function_exists('mail');

    header("Content-Type: text/html; charset=UTF-8");
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Buzz Outreach Bridge — <?php echo htmlspecialchars($host); ?></title>
        <style>
            :root {
                --bg: #090A0F;
                --card-bg: #12141D;
                --accent-cyan: #00F0FF;
                --accent-purple: #8B5CF6;
                --text-primary: #FFFFFF;
                --text-secondary: #94A3B8;
                --border: rgba(255, 255, 255, 0.1);
                --emerald: #10B981;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background: var(--bg);
                color: var(--text-primary);
                margin: 0;
                padding: 40px 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                box-sizing: border-box;
            }
            .card {
                background: var(--card-bg);
                border: 1px solid var(--border);
                border-radius: 20px;
                width: 100%;
                max-width: 640px;
                padding: 32px;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
            }
            .header {
                display: flex;
                align-items: center;
                gap: 14px;
                margin-bottom: 24px;
            }
            .badge-live {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(16, 185, 129, 0.15);
                color: var(--emerald);
                font-size: 12px;
                font-weight: 700;
                padding: 4px 10px;
                border-radius: 20px;
                border: 1px solid rgba(16, 185, 129, 0.3);
            }
            .pulse {
                width: 8px;
                height: 8px;
                background: var(--emerald);
                border-radius: 50%;
                box-shadow: 0 0 8px var(--emerald);
            }
            h1 {
                font-size: 20px;
                margin: 0;
            }
            p {
                color: var(--text-secondary);
                font-size: 13.5px;
                line-height: 1.6;
            }
            .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin: 20px 0;
            }
            .spec-box {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid var(--border);
                border-radius: 12px;
                padding: 12px 14px;
            }
            .spec-label {
                font-size: 11px;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .spec-val {
                font-size: 14px;
                font-weight: 600;
                margin-top: 4px;
                color: var(--text-primary);
            }
            .instructions {
                background: rgba(0, 240, 255, 0.04);
                border: 1px solid rgba(0, 240, 255, 0.2);
                border-radius: 12px;
                padding: 16px;
                margin-top: 20px;
                font-size: 12.5px;
                line-height: 1.6;
                color: #CBD5E1;
            }
            code {
                background: rgba(255, 255, 255, 0.08);
                color: var(--accent-cyan);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <div>
                    <span class="badge-live"><span class="pulse"></span> ONLINE &amp; READY</span>
                    <h1 style="margin-top: 6px;">Buzz Outreach Email Bridge (v2.0)</h1>
                </div>
            </div>

            <p>This script is active on <strong><?php echo htmlspecialchars($host); ?></strong> and ready to receive cold email dispatches with attached visual mockups from your <strong>Buzz Outreach PWA</strong>.</p>

            <div class="grid">
                <div class="spec-box">
                    <div class="spec-label">Server Domain</div>
                    <div class="spec-val"><?php echo htmlspecialchars($host); ?></div>
                </div>
                <div class="spec-box">
                    <div class="spec-label">PHP Engine</div>
                    <div class="spec-val">PHP <?php echo htmlspecialchars($phpVersion); ?></div>
                </div>
                <div class="spec-box">
                    <div class="spec-label">SSL / Sockets</div>
                    <div class="spec-val"><?php echo ($hasOpenSSL && $hasSockets) ? '✅ Enabled (Port 465 Ready)' : '⚠️ OpenSSL Unavailable'; ?></div>
                </div>
                <div class="spec-box">
                    <div class="spec-label">Dispatch Modes</div>
                    <div class="spec-val">Authenticated SMTP &amp; mail()</div>
                </div>
            </div>

            <div class="instructions">
                <strong style="color: var(--accent-cyan);">🚀 How to use this bridge in Buzz:</strong><br/>
                1. Open your <strong>Buzz Outreach App</strong>.<br/>
                2. Go to <strong>Settings (⚙️) ➔ Method 1: cPanel PHP Bridge</strong>.<br/>
                3. Set <strong>cPanel Bridge URL</strong> to: <code><?php echo "https://" . htmlspecialchars($host) . $_SERVER['REQUEST_URI']; ?></code><br/>
                4. Set <strong>From Email</strong> to your cPanel email (e.g. <code>info@<?php echo htmlspecialchars(preg_replace('/^www\./', '', $host)); ?></code>).<br/>
                5. Tap <strong>"🧪 Test Direct Dispatch"</strong> to test!
            </div>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// -----------------------------------------------------------------------------
// 3. POST Request: Email Dispatching (SMTP / Native mail)
// -----------------------------------------------------------------------------
header("Content-Type: application/json; charset=UTF-8");

$rawInput = file_get_contents("php://input");
if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Empty request body. Send JSON via POST."]);
    exit;
}

$payload = json_decode($rawInput, true);
if (!$payload) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON payload."]);
    exit;
}

// Security secret validation if set
if (!empty($expectedSecret)) {
    $providedSecret = $payload['secretKey'] ?? ($_SERVER['HTTP_X_BUZZ_SECRET'] ?? '');
    if ($providedSecret !== $expectedSecret) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Unauthorized: Invalid secret key."]);
        exit;
    }
}

// Extract email parameters
$to = filter_var(trim($payload['to'] ?? ''), FILTER_VALIDATE_EMAIL);
$subject = trim($payload['subject'] ?? 'Hello from Buzz');
$body = trim($payload['body'] ?? '');
$fromEmail = filter_var(trim($payload['fromEmail'] ?? ''), FILTER_VALIDATE_EMAIL);
$fromName = trim($payload['fromName'] ?? 'Outreach Team');
$attachmentBase64 = $payload['attachmentBase64'] ?? '';
$attachmentName = trim($payload['attachmentName'] ?? 'workflow_mockup.jpg');

// Optional SMTP credentials passed from Buzz or falling back to top config
$smtpHost = !empty($payload['smtpHost']) ? trim($payload['smtpHost']) : $defaultSmtpHost;
$smtpPort = !empty($payload['smtpPort']) ? (int)$payload['smtpPort'] : $defaultSmtpPort;
$smtpSecure = !empty($payload['smtpSecure']) ? trim($payload['smtpSecure']) : $defaultSmtpSecure;
$smtpUser = !empty($payload['smtpUser']) ? trim($payload['smtpUser']) : (!empty($defaultSmtpUser) ? $defaultSmtpUser : $fromEmail);
$smtpPass = !empty($payload['smtpPass']) ? trim($payload['smtpPass']) : $defaultSmtpPass;

// Fallback sender if empty
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

// -----------------------------------------------------------------------------
// Pure-PHP SMTP Client Class (Zero Dependencies)
// -----------------------------------------------------------------------------
class BuzzSmtpClient {
    private $socket;
    private $debug = [];

    private function log($msg) {
        $this->debug[] = $msg;
    }

    public function getLogs() {
        return $this->debug;
    }

    private function getResponse() {
        $response = "";
        while (!feof($this->socket)) {
            $line = fgets($this->socket, 512);
            if ($line === false) break;
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        $this->log("< " . trim($response));
        return $response;
    }

    private function sendCommand($cmd, $expectedCode = 250) {
        $this->log("> " . (strpos($cmd, 'AUTH') === 0 ? 'AUTH [hidden]' : substr($cmd, 0, 80)));
        fwrite($this->socket, $cmd . "\r\n");
        $resp = $this->getResponse();
        $code = (int)substr($resp, 0, 3);
        if ($expectedCode && $code !== $expectedCode) {
            throw new Exception("SMTP Error: Expected {$expectedCode}, got {$code}: {$resp}");
        }
        return $resp;
    }

    public function send($host, $port, $secure, $user, $pass, $fromEmail, $fromName, $to, $subject, $body, $attachmentBase64 = null, $attachmentName = null) {
        $isSsl = ($secure === 'ssl' || $port == 465);
        $protocol = $isSsl ? 'ssl://' : 'tcp://';
        
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ]);

        $this->log("Connecting to {$protocol}{$host}:{$port}...");
        $this->socket = @stream_socket_client("{$protocol}{$host}:{$port}", $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $context);

        if (!$this->socket) {
            throw new Exception("Connection to {$host}:{$port} failed: {$errstr} ({$errno})");
        }

        stream_set_timeout($this->socket, 15);
        $this->getResponse(); // Read 220 banner

        $clientHost = !empty($_SERVER['HTTP_HOST']) ? preg_replace('/^www\./', '', $_SERVER['HTTP_HOST']) : 'localhost';
        $this->sendCommand("EHLO {$clientHost}", 250);

        if ($secure === 'tls' || ($port == 587 && !$isSsl)) {
            $this->sendCommand("STARTTLS", 220);
            if (!stream_socket_enable_crypto($this->socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new Exception("STARTTLS encryption negotiation failed.");
            }
            $this->sendCommand("EHLO {$clientHost}", 250);
        }

        // Authenticate if password provided
        if (!empty($pass)) {
            $this->sendCommand("AUTH LOGIN", 334);
            $this->sendCommand(base64_encode($user), 334);
            $this->sendCommand(base64_encode($pass), 235);
        }

        $this->sendCommand("MAIL FROM:<{$fromEmail}>", 250);
        $this->sendCommand("RCPT TO:<{$to}>", 250);
        $this->sendCommand("DATA", 354);

        $boundary = "==Multipart_Boundary_x" . md5(time() . rand(1000, 9999)) . "x";
        $encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
        $encodedFromName = "=?UTF-8?B?" . base64_encode($fromName) . "?=";
        $msgId = "<" . time() . "." . md5($to . $fromEmail . rand()) . "@" . preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'localhost') . ">";

        $headers = [];
        $headers[] = "From: {$encodedFromName} <{$fromEmail}>";
        $headers[] = "Reply-To: <{$fromEmail}>";
        $headers[] = "Return-Path: <{$fromEmail}>";
        $headers[] = "To: <{$to}>";
        $headers[] = "Subject: {$encodedSubject}";
        $headers[] = "Date: " . date("r");
        $headers[] = "Message-ID: {$msgId}";
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-Type: multipart/mixed; boundary=\"{$boundary}\"";
        $headers[] = "X-Mailer: Buzz Outreach Engine / Pure-SMTP";

        $msgBody = implode("\r\n", $headers) . "\r\n\r\n";
        $msgBody .= "--{$boundary}\r\n";
        $msgBody .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $msgBody .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
        $msgBody .= $body . "\r\n\r\n";

        if (!empty($attachmentBase64)) {
            $cleanBase64 = preg_replace('/^data:image\/\w+;base64,/', '', $attachmentBase64);
            $binaryData = base64_decode($cleanBase64);
            if ($binaryData !== false && strlen($binaryData) > 0) {
                $cleanFileName = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $attachmentName ?: 'workflow_mockup.jpg');
                $encodedAttachment = chunk_split(base64_encode($binaryData));
                $msgBody .= "--{$boundary}\r\n";
                $msgBody .= "Content-Type: image/jpeg; name=\"{$cleanFileName}\"\r\n";
                $msgBody .= "Content-Disposition: attachment; filename=\"{$cleanFileName}\"\r\n";
                $msgBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
                $msgBody .= $encodedAttachment . "\r\n\r\n";
            }
        }

        $msgBody .= "--{$boundary}--\r\n.";

        $this->sendCommand($msgBody, 250);
        $this->sendCommand("QUIT", 221);

        @fclose($this->socket);
        return true;
    }
}

// -----------------------------------------------------------------------------
// 4. Execution: Try Authenticated SMTP First, Fallback to PHP mail()
// -----------------------------------------------------------------------------
$smtpSuccess = false;
$smtpError = null;

// If SMTP credentials or host available, attempt Authenticated SMTP
if (!empty($smtpPass) || (!empty($smtpHost) && $smtpHost !== 'localhost')) {
    try {
        $client = new BuzzSmtpClient();
        $targetHost = ($smtpHost === 'localhost' || empty($smtpHost)) ? ('mail.' . preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'localhost')) : $smtpHost;
        $client->send(
            $targetHost,
            $smtpPort,
            $smtpSecure,
            $smtpUser,
            $smtpPass,
            $fromEmail,
            $fromName,
            $to,
            $subject,
            $body,
            $attachmentBase64,
            $attachmentName
        );
        $smtpSuccess = true;
    } catch (Exception $e) {
        $smtpError = $e->getMessage();
    }
}

if ($smtpSuccess) {
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "method" => "smtp",
        "message" => "Email dispatched successfully via Authenticated SMTP to {$to}",
        "recipient" => $to,
        "timestamp" => date("c")
    ]);
    exit;
}

// Fallback to Native PHP mail()
$boundary = "==Multipart_Boundary_x" . md5(time() . rand(1000, 9999)) . "x";
$headers = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <{$fromEmail}>\r\n";
$headers .= "Reply-To: {$fromEmail}\r\n";
$headers .= "Return-Path: {$fromEmail}\r\n";
$headers .= "X-Mailer: Buzz Outreach Engine / PHP " . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";

$multipartMessage = "--{$boundary}\r\n";
$multipartMessage .= "Content-Type: text/plain; charset=UTF-8\r\n";
$multipartMessage .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$multipartMessage .= $body . "\r\n\r\n";

if (!empty($attachmentBase64)) {
    $cleanBase64 = preg_replace('/^data:image\/\w+;base64,/', '', $attachmentBase64);
    $binaryData = base64_decode($cleanBase64);
    if ($binaryData !== false && strlen($binaryData) > 0) {
        $encodedAttachment = chunk_split(base64_encode($binaryData));
        $cleanFileName = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $attachmentName);
        $multipartMessage .= "--{$boundary}\r\n";
        $multipartMessage .= "Content-Type: image/jpeg; name=\"{$cleanFileName}\"\r\n";
        $multipartMessage .= "Content-Disposition: attachment; filename=\"{$cleanFileName}\"\r\n";
        $multipartMessage .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $multipartMessage .= $encodedAttachment . "\r\n\r\n";
    }
}
$multipartMessage .= "--{$boundary}--";

$encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
$sent = @mail($to, $encodedSubject, $multipartMessage, $headers, "-f" . $fromEmail);

if ($sent) {
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "method" => "mail",
        "message" => "Email dispatched successfully via cPanel mail() to {$to}",
        "recipient" => $to,
        "smtpFallbackNotice" => $smtpError ? "SMTP attempt failed ({$smtpError}), sent via native mail." : null,
        "timestamp" => date("c")
    ]);
} else {
    http_response_code(500);
    $lastError = error_get_last();
    echo json_encode([
        "status" => "error",
        "message" => "Email delivery failed. " . ($smtpError ? "SMTP error: {$smtpError}. " : "") . "Native mail error: " . ($lastError['message'] ?? 'Check cPanel email routing.'),
        "hint" => "To ensure delivery, configure your cPanel email password in Settings to use Authenticated SMTP."
    ]);
}
