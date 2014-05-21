<?php

namespace Oro\Bundle\SegmentBundle\Grid;

use Oro\Bundle\EntityBundle\Provider\VirtualFieldProviderInterface;
use Symfony\Bridge\Doctrine\ManagerRegistry;

use Oro\Bundle\DataGridBundle\Datagrid\Common\DatagridConfiguration;
use Oro\Bundle\DataGridBundle\Provider\ConfigurationProviderInterface;
use Oro\Bundle\QueryDesignerBundle\Exception\InvalidConfigurationException;
use Oro\Bundle\QueryDesignerBundle\QueryDesigner\FunctionProviderInterface;

use Oro\Bundle\EntityConfigBundle\Config\ConfigManager;

class ConfigurationProvider implements ConfigurationProviderInterface
{
    const GRID_PREFIX = 'oro_segment_grid_';

    /** @var FunctionProviderInterface */
    protected $functionProvider;

    /** @var VirtualFieldProviderInterface */
    protected $virtualFieldProvider;

    /** @var ManagerRegistry */
    protected $doctrine;

    /** @var ConfigManager */
    protected $configManager;

    /** @var DatagridConfiguration */
    private $configuration = null;

    /**
     * Constructor
     *
     * @param FunctionProviderInterface     $functionProvider
     * @param VirtualFieldProviderInterface $virtualFieldProvider
     * @param ManagerRegistry               $doctrine
     * @param ConfigManager                 $configManager
     */
    public function __construct(
        FunctionProviderInterface $functionProvider,
        VirtualFieldProviderInterface $virtualFieldProvider,
        ManagerRegistry $doctrine,
        ConfigManager $configManager
    ) {
        $this->functionProvider     = $functionProvider;
        $this->virtualFieldProvider = $virtualFieldProvider;
        $this->doctrine             = $doctrine;
        $this->configManager        = $configManager;
    }

    /**
     * {@inheritdoc}
     */
    public function isApplicable($gridName)
    {
        return (strpos($gridName, self::GRID_PREFIX) === 0);
    }

    /**
     * {@inheritdoc}
     */
    public function getConfiguration($gridName)
    {
        if (null === $this->configuration) {
            $id                = intval(substr($gridName, strlen(self::GRID_PREFIX)));
            $segmentRepository = $this->doctrine->getRepository('OroSegmentBundle:Segment');
            $segment           = $segmentRepository->find($id);
            $builder           = new SegmentDatagridConfigurationBuilder(
                $gridName,
                $segment,
                $this->functionProvider,
                $this->virtualFieldProvider,
                $this->doctrine,
                $this->configManager
            );

            $this->configuration = $builder->getConfiguration();
        }

        return $this->configuration;
    }

    /**
     * Check whether a segment grid ready for displaying
     *
     * @param string $gridName
     *
     * @return bool
     */
    public function isConfigurationValid($gridName)
    {
        try {
            $this->getConfiguration($gridName);
        } catch (InvalidConfigurationException $invalidConfigEx) {
            return false;
        }

        return true;
    }
}
