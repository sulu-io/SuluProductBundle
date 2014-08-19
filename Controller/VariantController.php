<?php
/*
 * This file is part of the Sulu CMF.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\ProductBundle\Controller;

use FOS\RestBundle\Routing\ClassResourceInterface;
use Hateoas\Representation\CollectionRepresentation;
use Sulu\Bundle\ProductBundle\Product\ProductManagerInterface;
use Sulu\Component\Rest\ListBuilder\Doctrine\DoctrineListBuilderFactory;
use Sulu\Component\Rest\ListBuilder\ListRepresentation;
use Sulu\Component\Rest\RestController;
use Sulu\Component\Rest\RestHelperInterface;
use Symfony\Component\HttpFoundation\Request;

class VariantController extends RestController implements ClassResourceInterface
{
    protected static $entityName = 'SuluProductBundle:Product';

    protected static $entityKey = 'products';

    /**
     * Returns the manager for products
     *
     * @return ProductManagerInterface
     */
    private function getManager()
    {
        return $this->get('sulu_product.product_manager');
    }

    public function cgetAction(Request $request, $parentId)
    {
        if ($request->get('flat') == 'true') {
            /** @var RestHelperInterface $restHelper */
            $restHelper = $this->get('sulu_core.doctrine_rest_helper');

            /** @var DoctrineListBuilderFactory $factory */
            $factory = $this->get('sulu_core.doctrine_list_builder_factory');

            $listBuilder = $factory->create(self::$entityName);

            $fieldDescriptors = $this->getManager()->getFieldDescriptors($this->getLocale($request));

            $restHelper->initializeListBuilder(
                $listBuilder,
                $fieldDescriptors
            );

            $listBuilder->where($fieldDescriptors['parent'], $parentId);

            $list = new ListRepresentation(
                $listBuilder->execute(),
                self::$entityKey,
                'get_products',
                $request->query->all(),
                $listBuilder->getCurrentPage(),
                $listBuilder->getLimit(),
                $listBuilder->count()
            );
        } else {
            $list = new CollectionRepresentation(
                $this->getManager()->findAllByLocale($this->getLocale($request)),
                self::$entityKey
            );
        }

        $view = $this->view($list, 200);

        return $this->handleView($view);
    }
} 
