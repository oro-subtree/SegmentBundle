<?php

namespace Oro\Bundle\SegmentBundle\Grid;

use Symfony\Bridge\Doctrine\ManagerRegistry;

use Oro\Bundle\ReportBundle\Grid\BaseReportConfigurationBuilder;
use Oro\Bundle\SegmentBundle\Entity\Segment;
use Oro\Bundle\SegmentBundle\Model\DatagridSourceSegmentProxy;
use Oro\Bundle\DataGridBundle\Extension\Export\ExportExtension;
use Oro\Bundle\QueryDesignerBundle\QueryDesigner\FunctionProviderInterface;
use Oro\Bundle\QueryDesignerBundle\QueryDesigner\VirtualFieldProviderInterface;
use Oro\Bundle\EntityConfigBundle\Config\ConfigManager;

class SegmentDatagridConfigurationBuilder extends BaseReportConfigurationBuilder
{
    /**
     * Constructor
     *
     * @param string                        $gridName
     * @param Segment                       $segment
     * @param FunctionProviderInterface     $functionProvider
     * @param VirtualFieldProviderInterface $virtualFieldProvider
     * @param ManagerRegistry               $doctrine
     * @param ConfigManager                 $configManager
     */
    public function __construct(
        $gridName,
        Segment $segment,
        FunctionProviderInterface $functionProvider,
        VirtualFieldProviderInterface $virtualFieldProvider,
        ManagerRegistry $doctrine,
        ConfigManager $configManager
    ) {
        $em = $doctrine->getManagerForClass($segment->getEntity());
        parent::__construct(
            $gridName,
            new DatagridSourceSegmentProxy($segment, $em),
            $functionProvider,
            $virtualFieldProvider,
            $doctrine,
            $configManager
        );

        $this->config->offsetSetByPath('[source][acl_resource]', 'oro_segment_view');
        $this->config->offsetSetByPath(ExportExtension::EXPORT_OPTION_PATH, true);
    }
}
