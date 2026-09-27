<?php
declare(strict_types=1);

/**
 * Kopie als config.php ablegen. Beim Deploy auf kc3k.ch wird config.php nicht überschrieben.
 */
return [
    'session_name' => 'kc3k_upload',
    'site_root' => dirname(__DIR__),
    'issuer' => 'KC3K Upload',
    'users' => [
        'beispiel@example.com' => [
            'password_hash' => '$2y$10$ersetzenMitPasswordHash',
            'totp_secret' => 'JBSWY3DPEHPK3PXP',
        ],
    ],
];
