<?php
declare(strict_types=1);

return [
    'session_name' => 'kc3k_upload',
    'site_root' => dirname(__DIR__),
    'issuer' => 'KC3K Upload',
    'users' => [
        'thomas.giger@cloud-7.net' => [
            'password_hash' => '$2b$10$H/e3BzzhTFwOJfZl0PKvTOoJC41eZgBOCyxXbzWXaQuKyoxLWttHy',
            'totp_secret' => 'GC7K3M2X9Q4R8T6W',
        ],
        'nicole.straehl@cloud-7.net' => [
            'password_hash' => '$2b$10$H/e3BzzhTFwOJfZl0PKvTOoJC41eZgBOCyxXbzWXaQuKyoxLWttHy',
            'totp_secret' => 'PL8N5V3H6J2K9M4X',
        ],
    ],
];
