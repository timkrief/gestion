<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInita47088ca7f30e6fc6f26806d91e1e7f0
{
    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->classMap = ComposerStaticInita47088ca7f30e6fc6f26806d91e1e7f0::$classMap;

        }, null, ClassLoader::class);
    }
}