<?php
/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\ProductBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader;
use Sulu\Bundle\PersistenceBundle\DependencyInjection\PersistenceExtensionTrait;

class SuluProductExtension extends Extension
{
    use PersistenceExtensionTrait;

    /**
     * {@inheritDoc}
     */
    public function load(array $configs, ContainerBuilder $container)
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);
        $container->setParameter('sulu_product.template', $config['template']);
        $container->setParameter('sulu_product.default_currency', $config['default_currency']);
        $container->setParameter('sulu_product.fallback_locale', $config['fallback_locale']);
        $container->setParameter('sulu_product.locales', $config['locales']);

        $loader = new Loader\XmlFileLoader($container, new FileLocator(__DIR__.'/../Resources/config'));
        $loader->load('services.xml');

        $this->configurePersistence($config['objects'], $container);
    }
}
