<?php
declare(strict_types=1);

require __DIR__ . '/lib/totp.php';
require __DIR__ . '/lib/news-store.php';

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    http_response_code(503);
    echo 'Upload-Bereich ist noch nicht konfiguriert (config.php fehlt).';
    exit;
}

/** @var array<string, mixed> $config */
$config = require $configFile;
session_name((string) ($config['session_name'] ?? 'kc3k_upload'));
session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
    'cookie_secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
]);

$users = $config['users'] ?? [];
$siteRoot = (string) ($config['site_root'] ?? dirname(__DIR__));
$issuer = (string) ($config['issuer'] ?? 'KC3K Upload');
$step = 'login';
$error = '';
$message = '';

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
    }
    return $_SESSION['csrf'];
}

function csrf_check(): void
{
    $token = $_POST['csrf'] ?? '';
    if (!is_string($token) || empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $token)) {
        throw new RuntimeException('Sitzung abgelaufen. Bitte erneut anmelden.');
    }
}

function normalize_email(string $email): string
{
    return strtolower(trim($email));
}

if (isset($_GET['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: ./');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        csrf_check();
        $action = $_POST['action'] ?? '';
        if ($action === 'login') {
            $email = normalize_email((string) ($_POST['email'] ?? ''));
            $password = (string) ($_POST['password'] ?? '');
            if (!isset($users[$email])) {
                throw new RuntimeException('E-Mail oder Passwort ungültig.');
            }
            $hash = $users[$email]['password_hash'] ?? '';
            if (!is_string($hash) || !password_verify($password, $hash)) {
                throw new RuntimeException('E-Mail oder Passwort ungültig.');
            }
            $_SESSION['email'] = $email;
            $_SESSION['totp_ok'] = false;
        } elseif ($action === 'totp') {
            $email = $_SESSION['email'] ?? '';
            if (!is_string($email) || !isset($users[$email])) {
                throw new RuntimeException('Bitte zuerst anmelden.');
            }
            $secret = $users[$email]['totp_secret'] ?? '';
            $code = (string) ($_POST['code'] ?? '');
            if (!is_string($secret) || !totp_verify($secret, $code)) {
                throw new RuntimeException('Der 2FA-Code ist ungültig oder abgelaufen.');
            }
            $_SESSION['totp_ok'] = true;
            $message = '2FA bestätigt. Du kannst eine Ausgabe hochladen.';
        } elseif ($action === 'upload') {
            if (empty($_SESSION['email']) || empty($_SESSION['totp_ok'])) {
                throw new RuntimeException('Bitte anmelden und 2FA bestätigen.');
            }
            $title = trim((string) ($_POST['title'] ?? ''));
            $dateLabel = trim((string) ($_POST['date_label'] ?? ''));
            $sortDate = trim((string) ($_POST['sort_date'] ?? ''));
            $excerpt = trim((string) ($_POST['excerpt'] ?? ''));
            if ($title === '' || $dateLabel === '' || $sortDate === '' || $excerpt === '') {
                throw new RuntimeException('Bitte alle Felder ausfüllen.');
            }
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $sortDate)) {
                throw new RuntimeException('Sortierdatum muss im Format JJJJ-MM-TT sein.');
            }
            if (empty($_FILES['pdf']) || !is_array($_FILES['pdf'])) {
                throw new RuntimeException('Bitte eine PDF-Datei wählen.');
            }
            $file = $_FILES['pdf'];
            if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
                throw new RuntimeException('Upload fehlgeschlagen.');
            }
            $maxBytes = 20 * 1024 * 1024;
            if (($file['size'] ?? 0) > $maxBytes) {
                throw new RuntimeException('PDF ist grösser als 20 MB.');
            }
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->file($file['tmp_name']);
            if ($mime !== 'application/pdf') {
                throw new RuntimeException('Nur PDF-Dateien sind erlaubt.');
            }
            $result = news_add_issue(
                $siteRoot,
                $title,
                $dateLabel,
                $sortDate,
                $excerpt,
                (string) $file['tmp_name'],
                (string) ($file['name'] ?? 'news.pdf'),
            );
            $message = 'Ausgabe hochgeladen: ' . $result['filename'] . ' (insgesamt ' . $result['count'] . ' Einträge).';
        }
    } catch (Throwable $e) {
        $error = $e->getMessage();
    }
}

$email = $_SESSION['email'] ?? '';
$loggedIn = is_string($email) && $email !== '' && isset($users[$email]);
$totpOk = !empty($_SESSION['totp_ok']);
if ($loggedIn && !$totpOk) {
    $step = 'totp';
} elseif ($loggedIn && $totpOk) {
    $step = 'upload';
} else {
    $step = 'login';
}

$totpUri = '';
if ($step === 'totp' && $loggedIn) {
    $secret = $users[$email]['totp_secret'] ?? '';
    if (is_string($secret) && $secret !== '') {
        $totpUri = totp_provisioning_uri($email, $secret, $issuer);
    }
}

?><!DOCTYPE html>
<html lang="de-CH">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>3K-News Upload | Karate-Club 3K</title>
    <link rel="stylesheet" href="./upload.css" />
  </head>
  <body>
    <main class="upload-shell">
      <header class="upload-header">
        <p class="kicker">Redaktion</p>
        <h1>3K-News hochladen</h1>
        <p class="lede">Anmeldung für autorisierte Adressen. Nach Passwort und 2FA kannst du PDF-Ausgaben veröffentlichen.</p>
      </header>

      <?php if ($error !== ''): ?>
        <p class="flash flash-error" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
      <?php endif; ?>
      <?php if ($message !== ''): ?>
        <p class="flash flash-ok" role="status"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></p>
      <?php endif; ?>

      <?php if ($step === 'login'): ?>
        <form class="panel" method="post" action="./">
          <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>" />
          <input type="hidden" name="action" value="login" />
          <label>
            E-Mail
            <input type="email" name="email" autocomplete="username" required />
          </label>
          <label>
            Passwort
            <input type="password" name="password" autocomplete="current-password" required />
          </label>
          <button type="submit">Anmelden</button>
        </form>
      <?php elseif ($step === 'totp'): ?>
        <form class="panel" method="post" action="./">
          <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>" />
          <input type="hidden" name="action" value="totp" />
          <p>Angemeldet als <strong><?= htmlspecialchars($email, ENT_QUOTES, 'UTF-8') ?></strong></p>
          <?php if ($totpUri !== ''): ?>
            <p class="fine">
              Authenticator neu einrichten:
              <a href="<?= htmlspecialchars($totpUri, ENT_QUOTES, 'UTF-8') ?>">TOTP in der App hinzufügen</a>
            </p>
          <?php endif; ?>
          <label>
            2FA-Code (6 Stellen)
            <input type="text" name="code" inputmode="numeric" pattern="[0-9]{6}" autocomplete="one-time-code" required />
          </label>
          <button type="submit">Bestätigen</button>
          <p class="fine"><a href="?logout=1">Abmelden</a></p>
        </form>
      <?php else: ?>
        <form class="panel" method="post" action="./" enctype="multipart/form-data">
          <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>" />
          <input type="hidden" name="action" value="upload" />
          <p>Angemeldet als <strong><?= htmlspecialchars($email, ENT_QUOTES, 'UTF-8') ?></strong></p>
          <label>
            Titel (z.&nbsp;B. «3K-News Nr. 93»)
            <input type="text" name="title" required />
          </label>
          <label>
            Anzeige-Datum (z.&nbsp;B. «15. Juni 2026»)
            <input type="text" name="date_label" required />
          </label>
          <label>
            Sortierdatum (JJJJ-MM-TT)
            <input type="date" name="sort_date" required />
          </label>
          <label>
            Kurztext
            <textarea name="excerpt" rows="3" required></textarea>
          </label>
          <label>
            PDF-Ausgabe
            <input type="file" name="pdf" accept="application/pdf,.pdf" required />
          </label>
          <button type="submit">Ausgabe veröffentlichen</button>
          <p class="fine">
            Neue Ausgaben erscheinen auf <a href="../news.html">News</a> automatisch in absteigender Reihenfolge.
            <a href="?logout=1">Abmelden</a>
          </p>
        </form>
      <?php endif; ?>

      <p class="fine back"><a href="../index.html">← Zur Website</a></p>
    </main>
  </body>
</html>
