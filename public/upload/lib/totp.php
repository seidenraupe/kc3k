<?php
declare(strict_types=1);

function totp_base32_decode(string $secret): string
{
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $secret = strtoupper(preg_replace('/\s+/', '', $secret));
    $bits = '';
    $len = strlen($secret);
    for ($i = 0; $i < $len; $i++) {
        $val = strpos($alphabet, $secret[$i]);
        if ($val === false) {
            throw new InvalidArgumentException('Ungültiges TOTP-Secret.');
        }
        $bits .= str_pad(decbin($val), 5, '0', STR_PAD_LEFT);
    }
    $output = '';
    for ($i = 0; $i + 8 <= strlen($bits); $i += 8) {
        $output .= chr((int) bindec(substr($bits, $i, 8)));
    }
    return $output;
}

function totp_code(string $secret, ?int $timeSlice = null): string
{
    $timeSlice = $timeSlice ?? time();
    $time = pack('N*', 0, (int) floor($timeSlice / 30));
    $key = totp_base32_decode($secret);
    $hash = hash_hmac('sha1', $time, $key, true);
    $offset = ord(substr($hash, -1)) & 0x0f;
    $truncated =
        ((ord($hash[$offset]) & 0x7f) << 24) |
        ((ord($hash[$offset + 1]) & 0xff) << 16) |
        ((ord($hash[$offset + 2]) & 0xff) << 8) |
        (ord($hash[$offset + 3]) & 0xff);
    return str_pad((string) ($truncated % 1000000), 6, '0', STR_PAD_LEFT);
}

function totp_verify(string $secret, string $code, int $window = 1): bool
{
    $code = preg_replace('/\D+/', '', $code);
    if ($code === null || strlen($code) !== 6) {
        return false;
    }
    $now = time();
    for ($i = -$window; $i <= $window; $i++) {
        if (hash_equals(totp_code($secret, $now + $i * 30), $code)) {
            return true;
        }
    }
    return false;
}

function totp_provisioning_uri(string $email, string $secret, string $issuer = 'KC3K Upload'): string
{
    $label = rawurlencode($issuer . ':' . $email);
    $issuerEnc = rawurlencode($issuer);
    $secretEnc = rawurlencode($secret);
    return "otpauth://totp/{$label}?secret={$secretEnc}&issuer={$issuerEnc}&algorithm=SHA1&digits=6&period=30";
}
