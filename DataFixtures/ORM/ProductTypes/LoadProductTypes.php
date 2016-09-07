<?php

/*
 * This file is part of Sulu.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\ProductBundle\DataFixtures\ORM\ProductTypes;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\ORM\Mapping\ClassMetadata;
use Sulu\Bundle\ProductBundle\Entity\Type;

class LoadProductTypes implements FixtureInterface, OrderedFixtureInterface
{
    /**
     * {@inheritdoc}
     */
    public function load(ObjectManager $manager)
    {
        // Force id.
        $metadata = $manager->getClassMetaData(Type::class);
        $metadata->setIdGeneratorType(ClassMetadata::GENERATOR_TYPE_NONE);

        $file = dirname(__FILE__) . '/../../product-types.xml';
        $doc = new \DOMDocument();
        $doc->load($file);

        $xpath = new \DOMXpath($doc);
        $elements = $xpath->query('/product-types/product-type');

        if (!is_null($elements)) {
            /** @var \DOMNode $element */
            foreach ($elements as $element) {
                $type = new Type();
                $type->setId($element->getAttribute('id'));
                $type->setTranslationKey($element->getAttribute('translation-key'));
                $manager->persist($type);
            }
        }
        $manager->flush();
    }

    /**
     * {@inheritdoc}
     */
    public function getOrder()
    {
        return 1;
    }
}
