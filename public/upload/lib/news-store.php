<?php
declare(strict_types=1);

function news_paths(string $root): array
{
    return [
        'json' => $root . '/data/news.json',
        'pdfDir' => $root . '/documents/news',
    ];
}

function news_read(string $jsonPath): array
{
    if (!is_file($jsonPath)) {
        return [];
    }
    $raw = file_get_contents($jsonPath);
    if ($raw === false) {
        throw new RuntimeException('news.json konnte nicht gelesen werden.');
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new RuntimeException('news.json ist ungültig.');
    }
    return $data;
}

function news_write(string $jsonPath, array $items): void
{
    usort($items, static function (array $a, array $b): int {
        $da = $a['sortDate'] ?? '';
        $db = $b['sortDate'] ?? '';
        if ($da !== $db) {
            return strcmp($db, $da);
        }
        return strcmp($b['title'] ?? '', $a['title'] ?? '');
    });
    $json = json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        throw new RuntimeException('News konnten nicht serialisiert werden.');
    }
    $json .= "\n";
    if (file_put_contents($jsonPath, $json, LOCK_EX) === false) {
        throw new RuntimeException('news.json konnte nicht gespeichert werden.');
    }
}

function news_add_issue(
    string $root,
    string $title,
    string $dateLabel,
    string $sortDate,
    string $excerpt,
    string $section,
    string $tmpPdfPath,
    string $originalName,
): array {
    $paths = news_paths($root);
    if (!is_dir($paths['pdfDir']) && !mkdir($paths['pdfDir'], 0755, true) && !is_dir($paths['pdfDir'])) {
        throw new RuntimeException('PDF-Ordner konnte nicht erstellt werden.');
    }
    $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($title));
    $slug = trim($slug ?? 'ausgabe', '-');
    $filename = $slug . '-' . $sortDate . '.pdf';
    $dest = $paths['pdfDir'] . '/' . $filename;
    if (!move_uploaded_file($tmpPdfPath, $dest)) {
        throw new RuntimeException('PDF konnte nicht gespeichert werden.');
    }
    $items = news_read($paths['json']);
    $allowed = ['news', 'journal', 'turnier'];
    if (!in_array($section, $allowed, true)) {
        $section = 'journal';
    }
    array_unshift($items, [
        'title' => $title,
        'date' => $dateLabel,
        'sortDate' => $sortDate,
        'excerpt' => $excerpt,
        'url' => './documents/news/' . $filename,
        'external' => false,
        'section' => $section,
    ]);
    news_write($paths['json'], $items);
    return ['filename' => $filename, 'count' => count($items)];
}
