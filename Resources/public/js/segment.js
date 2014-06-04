/*global define*/
/*jslint nomen: true*/
define(function (require) {
    'use strict';
    var defaults, $storage,
        $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        GroupingModel = require('oroquerydesigner/js/items-manager/grouping-model'),
        ColumnModel = require('oroquerydesigner/js/items-manager/column-model'),
        DeleteConfirmation = require('oroui/js/delete-confirmation');
    require('oroentity/js/field-choice');
    require('orosegment/js/segment-choice');
    require('oroui/js/items-manager/editor');
    require('oroui/js/items-manager/table');
    require('oroquerydesigner/js/condition-builder');

    defaults = {
        entityChoice: '',
        valueSource: '',
        filters: {
            criteriaList: '',
            conditionBuilder: ''
        },
        grouping: {
            editor: {},
            form: '',
            itemContainer: '',
            itemTemplate: ''
        },
        column: {
            editor: {},
            form: '',
            itemContainer: '',
            itemTemplate: ''
        },
        select2FieldChoiceTemplate: '',
        select2SegmentChoiceTemplate: '',
        entities: [],
        metadata: {}
    };

    /**
     * Loads data from the input
     *
     * @param {string=} key name of data branch
     */
    function load(key) {
        var json = $storage.val(),
            data = (json && JSON.parse(json)) || {};
        return key ? data[key] : data;
    }

    /**
     * Saves data to the input
     *
     * @param {Object} value data from certain control
     * @param {string=} key name of data branch
     */
    function save(value, key) {
        var data = load();
        if (key) {
            data[key] = value;
        } else {
            data = key;
        }
        $storage.val(JSON.stringify(data));
    }

    function getFieldChoiceOptions(options) {
        return {
            select2: {
                formatSelectionTemplate: $(options.select2FieldChoiceTemplate).text()
            }
        };
    }

    function deleteHandler(collection, model, data) {
        var confirm = new DeleteConfirmation({
            content: data.message
        });
        confirm.on('ok', function () {
            collection.remove(model);
        });
        confirm.open();
    }

    function initGrouping(options, metadata, fieldChoiceOptions) {
        var $editor, $fieldChoice, collection, template;

        $editor = $(options.form);
        $fieldChoice = $editor.find('[data-purpose=column-selector]');
        $fieldChoice.fieldChoice(_.extend({}, fieldChoiceOptions, metadata.grouping, {select2: {}}));

        collection = new (Backbone.Collection)(load('grouping_columns'), {model: GroupingModel});
        collection.on('add remove sort change', function () {
            save(collection.toJSON(), 'grouping_columns');
        });

        $editor.itemsManagerEditor($.extend(options.editor, {
            collection: collection
        }));

        template = _.template(fieldChoiceOptions.select2.formatSelectionTemplate);

        $(options.itemContainer).itemsManagerTable({
            collection: collection,
            itemTemplate: $(options.itemTemplate).html(),
            itemRender: function (tmpl, data) {
                data.name = $fieldChoice.fieldChoice('formatChoice', data.name, template);
                return tmpl(data);
            },
            deleteHandler: _.bind(deleteHandler, null, collection)
        });
    }

    function initColumn(options, metadata, fieldChoiceOptions) {
        var $editor, $fieldChoice, collection, template, sortingLabels;

        $editor = $(options.form);
        $fieldChoice = $editor.find('[data-purpose=column-selector]');
        $fieldChoice.fieldChoice(_.extend({}, fieldChoiceOptions, {select2: {}}));

        $editor.find('[data-purpose=function-selector]').functionChoice({
            converters: metadata.converters,
            aggregates: metadata.aggregates
        });

        collection = new (Backbone.Collection)(load('columns'), {model: ColumnModel});
        collection.on('add remove sort change', function () {
            save(collection.toJSON(), 'columns');
        });

        $editor.itemsManagerEditor($.extend(options.editor, {
            collection: collection,
            setter: function ($el, name, value) {
                if (name === 'func') {
                    value = value.name;
                }
                return value;
            },
            getter: function ($el, name, value) {
                if (name === 'func') {
                    value = value && {
                        name: value,
                        group_type: $el.find(":selected").data('group_type'),
                        group_name: $el.find(":selected").data('group_name')
                    };
                }
                return value;
            }
        }));

        sortingLabels = {};
        $editor.find('select[name*=sorting]').find('option:not([value=""])').each(function () {
            sortingLabels[this.value] = $(this).text();
        });

        template = _.template(fieldChoiceOptions.select2.formatSelectionTemplate);

        $(options.itemContainer).itemsManagerTable({
            collection: collection,
            itemTemplate: $(options.itemTemplate).html(),
            itemRender: function (tmpl, data) {
                var item, itemFunc,
                    func = data.func;

                data.name = $fieldChoice.fieldChoice('formatChoice', data.name, template);
                if (func && func.name) {
                    item = metadata[func.group_type][func.group_name];
                    if (item) {
                        itemFunc = _.findWhere(item.functions, {name: func.name});
                        if (itemFunc) {
                            data.func = itemFunc.label;
                        }
                    }
                } else {
                    data.func = '';
                }
                if (data.sorting && sortingLabels[data.sorting]) {
                    data.sorting = sortingLabels[data.sorting];
                }

                return tmpl(data);
            },
            deleteHandler: _.bind(deleteHandler, null, collection)
        });
    }

    function configureFilters(options, metadata, fieldChoiceOptions, segmentChoiceOptions) {
        var $fieldCondition, $segmentCondition, $builder;

        // mixin extra options to condition-builder's field choice
        $fieldCondition = $(options.criteriaList).find('[data-criteria=condition-item]');
        $.extend(true, $fieldCondition.data('options'), {
            fieldChoice: fieldChoiceOptions,
            filters: metadata.filters,
            hierarchy: metadata.hierarchy
        });

        $segmentCondition = $(options.criteriaList).find('[data-criteria=condition-segment]');
        $.extend(true, $segmentCondition.data('options'), {
            segmentChoice: segmentChoiceOptions,
            filters: metadata.filters
        });

        $builder = $(options.conditionBuilder);
        $builder.conditionBuilder({
            criteriaListSelector: options.criteriaList
        });
        $builder.conditionBuilder('setValue', load('filters'));
        $builder.on('changed', function () {
            save($builder.conditionBuilder('getValue'), 'filters');
        });
    }

    return function (options) {
        var fieldChoiceOptions, segmentChoiceOptions;;
        options = $.extend(true, {}, defaults, options);

        $storage = $(options.valueSource);

        var $groupingContainer = $(options.grouping.itemContainer),
            $groupingForm      = $(options.grouping.form),
            isGrouping         = !(_.isEmpty($groupingContainer) && _.isEmpty($groupingForm));

        // common extra options for all choice inputs
        fieldChoiceOptions   = getFieldChoiceOptions(options);
        segmentChoiceOptions = _.extend(_.clone(fieldChoiceOptions), {
            select2: {
                formatSelectionTemplate: $(options.select2SegmentChoiceTemplate).text()
            }
        });

        if (isGrouping) {
            initGrouping(options.grouping, options.metadata, fieldChoiceOptions);
        }

        var gridFieldChoiceOptions = _.extend(_.clone(fieldChoiceOptions), options.gridFieldChoiceOptions);
        initColumn(options.column, options.metadata, gridFieldChoiceOptions);
        configureFilters(options.filters, options.metadata, fieldChoiceOptions, segmentChoiceOptions);

        $(options.entityChoice)
            .on('fieldsloadercomplete', function () {
                var data = {columns: [], filters: []};
                if (isGrouping) {
                    data.grouping_columns = [];
                }
                save(data);

                if (isGrouping) {
                    $groupingContainer.itemsManagerTable('reset');
                    $groupingForm.itemsManagerEditor('reset');
                }
                $(options.column.itemContainer).itemsManagerTable('reset');
                $(options.column.form).itemsManagerEditor('reset');
                $(options.filters.conditionBuilder).conditionBuilder('setValue', data.filters);
            });

    };
});
