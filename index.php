<?php

declare(strict_types=1);

// Normalize subdirectory hosting so Laravel sees internal paths like /api/v1/...,
// not /DMSRBNB/api/v1/... .
$basePath = '/DMSRBNB';
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';

if (str_starts_with($requestUri, $basePath)) {
    $normalizedUri = substr($requestUri, strlen($basePath));
    if ($normalizedUri === '' || $normalizedUri === false) {
        $normalizedUri = '/';
    }

    $_SERVER['REQUEST_URI'] = $normalizedUri;
}

$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/public_html/public/index.php';

// Front controller shim so Apache can serve the app from /DMSRBNB.
require __DIR__ . '/public_html/public/index.php';
