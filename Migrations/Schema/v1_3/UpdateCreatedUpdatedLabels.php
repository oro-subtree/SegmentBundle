<?php

namespace Oro\Bundle\SegmentBundle\Migrations\Schema\v1_3;

use Doctrine\DBAL\Schema\Schema;
use Oro\Bundle\EntityConfigBundle\Migration\UpdateEntityConfigFieldValueQuery;
use Oro\Bundle\EntityConfigBundle\Migration\UpdateEntityConfigIndexFieldValueQuery;
use Oro\Bundle\MigrationBundle\Migration\Migration;
use Oro\Bundle\MigrationBundle\Migration\QueryBag;

class UpdateCreatedUpdatedLabels implements Migration
{
    /**
     * {@inheritdoc}
     */
    public function up(Schema $schema, QueryBag $queries)
    {
        $fields = [
            [
                'entityName' => 'Oro\Bundle\SegmentBundle\Entity\Segment',
                'field' => 'createdAt',
                'value' => 'oro.ui.created_at'
            ],
            [
                'entityName' => 'Oro\Bundle\SegmentBundle\Entity\Segment',
                'field' => 'updatedAt',
                'value' => 'oro.ui.updated_at'
            ]
        ];

        foreach ($fields as $field) {
            $queries->addQuery(
                new UpdateEntityConfigFieldValueQuery(
                    $field['entityName'],
                    $field['field'],
                    'entity',
                    'label',
                    $field['value']
                )
            );
            $queries->addQuery(
                new UpdateEntityConfigIndexFieldValueQuery(
                    $field['entityName'],
                    $field['field'],
                    'entity',
                    'label',
                    $field['value']
                )
            );
        }
    }
}
