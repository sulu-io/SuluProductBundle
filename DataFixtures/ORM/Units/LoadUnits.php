<?php
/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Sulu\Bundle\ProductBundle\Entity\Unit;
use Sulu\Bundle\ProductBundle\Entity\UnitTranslation;

class LoadUnits implements FixtureInterface, OrderedFixtureInterface
{

    private static $translations = ['de', 'en'];
    /**
     * {@inheritDoc}
     */
    public function load(ObjectManager $manager)
    {
        // force id = 1
        $metadata = $manager->getClassMetaData(get_class(new Unit()));
        $metadata->setIdGeneratorType(\Doctrine\ORM\Mapping\ClassMetadata::GENERATOR_TYPE_NONE);

        $i = 1;
        $file = dirname(__FILE__) . '/../../units.xml';
        $doc = new DOMDocument();
        $doc->load($file);

        $xpath = new DOMXpath($doc);
        $elements = $xpath->query('/units/unit');

        if (!is_null($elements)) {
            /** @var $element DOMNode */
            foreach ($elements as $element) {
                $unit = new Unit();
                $unit->setId($i);
                $children = $element->childNodes;
                /** @var $child DOMNode */
                foreach ($children as $child) {
                    if (isset($child->nodeName) && (in_array($child->nodeName, self::$translations))) {
                        $translation = new UnitTranslation();
                        $translation->setLocale($child->nodeName);
                        $translation->setName($child->nodeValue);
                        $translation->setUnit($unit);
                        $manager->persist($translation);
                    }
                }
                $manager->persist($unit);
                $i++;
            }
        }
        $manager->flush();
    }

    /**
     * {@inheritDoc}
     */
    public function getOrder()
    {
        return 1;
    }
}
