<?php

namespace Oro\Bundle\SegmentBundle\Form\Type;

use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

use Oro\Bundle\QueryDesignerBundle\Form\Type\AbstractQueryDesignerType;

class SegmentType extends AbstractQueryDesignerType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', 'text', array('required' => true))
            ->add('entity', 'oro_segment_entity_choice', array('required' => true))
            ->add(
                'type',
                'entity',
                array(
                    'class'       => 'OroSegmentBundle:SegmentType',
                    'property'    => 'label',
                    'required'    => true,
                    'empty_value' => 'oro.segment.form.choose_segment_type'
                )
            )
            ->add('description', 'textarea', array('required' => false));

        parent::buildForm($builder, $options);
    }

    /**
     * {@inheritdoc}
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $options = array_merge(
            $this->getDefaultOptions(),
            array(
                'data_class'                  => 'Oro\Bundle\SegmentBundle\Entity\Segment',
                'intention'                   => 'segment',
                'cascade_validation'          => true
            )
        );

        $resolver->setDefaults($options);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'oro_segment';
    }
}
