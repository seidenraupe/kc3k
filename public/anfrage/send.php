<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Ungültige Anfrage.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!empty($_POST['website'] ?? '')) {
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

function field(string $key): string
{
    return trim(strip_tags((string) ($_POST[$key] ?? '')));
}

function isEmail(string $email): bool
{
    return $email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

$type = field('type');
$name = field('name');
$email = field('email');
$phone = field('phone');
$participant = field('participant');
$ageRaw = field('age');
$preferred = field('preferred');
$message = field('message');

if (!in_array($type, ['schnupper', 'goenner'], true)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Bitte Anliegen wählen.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($name === '' || !isEmail($email)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Bitte Name und gültige E-Mail angeben.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$lines = [];
$subject = '';

if ($type === 'schnupper') {
    $subject = 'Schnuppertraining KC3K';
    if ($participant === '' || !in_array($participant, ['Kind', 'Jugendliche/r', 'Erwachsene/r'], true)) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'Bitte angeben, für wen das Schnuppertraining ist.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if ($ageRaw === '' || !ctype_digit($ageRaw)) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'Bitte das Alter in Jahren angeben.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $age = (int) $ageRaw;
    if ($age < 6) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'Das Mindestalter für das Training beträgt 6 Jahre.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $lines[] = 'Anfrage: Schnuppertraining';
    $lines[] = '';
    $lines[] = "Name (Kontakt): {$name}";
    $lines[] = "E-Mail: {$email}";
    if ($phone !== '') {
        $lines[] = "Telefon: {$phone}";
    }
    $lines[] = "Für wen: {$participant}";
    $lines[] = "Alter: {$age} Jahre";
    if ($preferred !== '') {
        $lines[] = "Bevorzugter Trainingstag: {$preferred}";
    }
    $lines[] = '';
    $lines[] = $message !== '' ? $message : 'Ich möchte unverbindlich ein Schnuppertraining besuchen.';
} else {
    $subject = 'Gönner-Mitgliedschaft KC3K';
    $lines[] = 'Anfrage: Gönner-Mitgliedschaft (Fr. 100.– / Jahr)';
    $lines[] = '';
    $lines[] = "Name: {$name}";
    $lines[] = "E-Mail: {$email}";
    if ($phone !== '') {
        $lines[] = "Telefon: {$phone}";
    }
    $lines[] = '';
    $lines[] = $message !== '' ? $message : 'Ich möchte Gönner beim Karate-Club 3K werden.';
}

$body = implode("\n", $lines);
$to = 'info@kc3k.ch';
$headers = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: Karate-Club 3K <info@kc3k.ch>',
    'Reply-To: ' . $email,
]);

$sent = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);

if (!$sent) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'error' => 'Versand momentan nicht möglich.'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
