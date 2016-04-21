/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

define([
    'suluproduct/models/product',
    'sulucategory/model/category',
    'app-config',
    'suluproduct/util/header',
    'suluproduct/util/product-delete-dialog',
    'config'
], function(Product, Category, AppConfig, HeaderUtil, DeleteDialog, Config) {
    'use strict';

    var types = {
            1: 'product',
            2: 'product-with-variants',
            3: 'product-addon',
            4: 'product-set'
        },
        eventNamespace = 'sulu.products.',

        /**
         * @event sulu.products.new
         * @description Opens the form for a new product
         */
        PRODUCT_NEW = eventNamespace + 'new',

        /**
         * @event sulu.products.save
         * @description Saves a given product
         */
        PRODUCT_SAVE = eventNamespace + 'save',

        /**
         * @event sulu.products.delete
         * @description Deletes the given products
         */
        PRODUCT_DELETE = eventNamespace + 'delete',

        /**
         * @description Opens the form for importing products
         */
        PRODUCT_IMPORT = eventNamespace + 'import',

        /**
         * @event sulu.products.list
         * @description Shows the list for products
         */
        PRODUCT_LIST = eventNamespace + 'list',

        /**
         * @event sulu.products.load
         * @description Shows the list for products
         */
        PRODUCT_LOAD = eventNamespace + 'load',

        /**
         * @event sulu.products.variants.delete
         * @description Deletes the given variants from the current product
         */
        PRODUCT_VARIANT_DELETE = eventNamespace + 'variants.delete';

    /**
     * Function returns the locale that should be used by default for current user.
     * If users locale matches any of the given product locales, that one is taken
     * as default.
     * If locale does not match exactly, the users language is compared as well.
     * If there are no matches at all, the default-locale as defined in the config
     * is returned.
     *
     * @returns {*}
     */
    var retrieveDefaultLocale = function() {
        var user = this.sandbox.sulu.user;
        var productConfig = Config.get('sulu-product');
        var defaultLocale = productConfig['fallback_locale'];
        var locales = productConfig['locales'];
        var languageMatch = null;

        // Check if users locale contains localization.
        var userLanguage = user.locale.split('_');

        for (var i = -1, len = locales.length; ++i <len;) {
            var current = locales[i];

            // If locale matches users locale, the exact matching was found.
            if (user.locale == current) {
                return current;
            }

            // Check if users language (without locale) matches.
            if (userLanguage == current) {
                languageMatch = current;
            }
        }

        // If language matches.
        if (languageMatch) {
            return languageMatch;
        }

        // Return default locale if no match was found.
        return defaultLocale;
    };

    return {
        initialize: function() {
            this.product = null;

            this.bindCustomEvents();
            if (this.options.display === 'list') {
                this.renderList();
            } else if (this.options.display === 'tab') {
                this.renderTabs().then(function() {
                    if (this.options.content !== 'variants') {
                        HeaderUtil.initToolbar(
                            this.sandbox,
                            this.product.get('status')
                        );
                    }
                }.bind(this));
            } else if (this.options.display === 'import') {
                this.renderImport();
            }
        },

        bindCustomEvents: function() {
            this.sandbox.on(PRODUCT_NEW, function(type) {
                this.sandbox.emit(
                    'sulu.router.navigate',
                    'pim/products/' + AppConfig.getUser().locale + '/add/type:' + type
                );
            }.bind(this));

            this.sandbox.on(PRODUCT_SAVE, function(data, doPatch) {
                this.save(data, doPatch);
            }.bind(this));

            this.sandbox.on(PRODUCT_DELETE, function(ids) {
                this.del(ids);
            }, this);

            this.sandbox.on('sulu.product.delete', function(id) {
                this.deleteProduct(id);
            }, this);

            this.sandbox.on(PRODUCT_IMPORT, function() {
                this.sandbox.emit('sulu.router.navigate', 'pim/products/import');
            }.bind(this));

            this.sandbox.on(PRODUCT_LIST, function() {
                this.sandbox.emit('sulu.router.navigate', 'pim/products');
            }.bind(this));

            this.sandbox.on('sulu.header.language-changed', function(data) {
                this.load(this.options.id, data.title);
            }, this);

            this.sandbox.on('sulu.products.products-overlay.variants.add', function(id, callback) {
                this.addVariant(id, callback);
            }, this);

            this.sandbox.on(PRODUCT_VARIANT_DELETE, function(ids) {
                this.deleteVariants(ids);
            }, this);

            // handling media
            this.sandbox.on('sulu.products.media.save', this.saveMedia.bind(this));

            // workflow
            this.sandbox.on('sulu.products.workflow.triggered', this.triggerWorkflowAction.bind(this));

            this.sandbox.on(PRODUCT_LOAD, function(id) {
                this.load(id, retrieveDefaultLocale.call(this));
            }, this);

            // back to list
            this.sandbox.on('sulu.header.back', function() {
                this.sandbox.emit('sulu.products.list');
            }, this);

            // handles save-errors for products
            this.sandbox.on('sulu.products.save-error', function(response) {
                if (response && response.responseJSON && response.responseJSON.code) {
                    // response code 1 == ProductException::PRODUCT_NOT_VALID
                    if(response.responseJSON.code == 1) {
                        this.sandbox.emit(
                            'sulu.labels.error.show',
                            'labels.error.product-not-valid',
                            'labels.error'
                        );

                        // set status to inactive!
                        this.sandbox.emit('product.state.change', Config.get('product.status.inactive'));
                    }
                    else {
                        // error code not defined -> show default product save error
                        this.sandbox.emit('sulu.labels.error.show', 'labels.error.product-save', 'labels.error');
                    }
                } else {
                    // no valid response -> show default product save error
                    this.sandbox.emit('sulu.labels.error.show', 'labels.error.product-save', 'labels.error');
                }
            }, this);
        },

        triggerWorkflowAction: function(data) {
            if (!!data && !!data.ids && !!data.status) {
                var url = '/admin/api/products?action=changeState&ids=' + data.ids + '&statusId=' + data.status;
                this.sandbox.util.save(url, 'POST')
                    .then(function() {
                        if (!!data.updateTable) {
                            this.sandbox.emit('sulu.product.workflow.completed');
                        }
                    }.bind(this))
                    .fail(function(error) {
                        this.sandbox.emit('sulu.labels.error.show',
                            this.sandbox.translate('product.workflow.state.changed.error'),
                            'labels.error',
                            ''
                        );
                        this.sandbox.logger.error('error while changing state of products', error);
                    }.bind(this));
            }
        },

        saveMedia: function(productId, newMediaIds, removedMediaIds) {
            this.sandbox.emit('sulu.header.toolbar.item.loading', 'save');

            this.processAjaxForMedia(newMediaIds, productId, 'POST');
            this.processAjaxForMedia(removedMediaIds, productId, 'DELETE');

            var mediaIds = this.sandbox.util.arrayGetColumn(this.product.attributes.media, 'id');
            var i, len, id;

            // add new media to backbone model
            for (i = -1, len = newMediaIds.length; ++i < len;) {
                id = newMediaIds[i];

                if (mediaIds.indexOf(id) === -1) {
                    this.product.set({
                       'media': this.product.get('media').concat({'id': id})
                    });
                    mediaIds.push(id);
                }
            }

            // remove deleted media from backbone model
            for (i = -1, len = removedMediaIds.length; ++i < len;) {
                id = removedMediaIds[i];

                var mediaIndex = mediaIds.indexOf(id);

                if (mediaIndex > -1) {
                    this.product.get('media').splice(mediaIndex, 1);
                    mediaIds.splice(mediaIndex, 1);
                }
            }

        },

        // TODO make only one request
        processAjaxForMedia: function(mediaIds, productId, type) {
            var requests = [],
                medias = [],
                url;

            if (mediaIds.length > 0) {
                this.sandbox.util.each(mediaIds, function(index, id) {

                    if (type === 'DELETE') {
                        url = '/admin/api/products/' + productId + '/media/' + id;
                    } else if (type === 'POST') {
                        url = '/admin/api/products/' + productId + '/media';
                    }

                    requests.push(
                        this.sandbox.util.ajax({
                            url: url,
                            data: {mediaId: id},
                            type: type
                        }).fail(function() {
                            this.sandbox.logger.error("Error while saving media!");
                        }.bind(this))
                    );
                    medias.push(id);
                }.bind(this));

                this.sandbox.util.when.apply(null, requests).then(function() {
                    if (type === 'DELETE') {
                        this.sandbox.emit('sulu.products.media.removed', medias);
                    } else if (type === 'POST') {
                        this.sandbox.emit('sulu.products.media.saved', medias);
                    }
                }.bind(this));
            }
        },

        save: function(data, doPatch) {
            this.sandbox.emit('sulu.header.toolbar.item.loading', 'save');
            this.product.set(data);

            // FIXME the categories should already be loaded correctly here
            if (!!data.categories) {
                this.product.get('categories').reset();
                this.sandbox.util.foreach(data.categories, function(id) {
                    var category = Category.findOrCreate({id: id});
                    this.product.get('categories').add(category);
                }.bind(this));
            }

            if (!doPatch) {
                doPatch = false;
            }

            this.product.saveLocale(this.options.locale, {
                patch: doPatch,
                success: function(response) {
                    var model = response.toJSON();
                    if (!!data.id) {
                        this.sandbox.emit('sulu.products.saved', model);
                    } else {
                        this.load(model.id, this.options.locale);
                    }
                }.bind(this),
                error: function(model, response) {
                    this.sandbox.logger.log("error while saving product");
                    this.sandbox.emit('sulu.header.toolbar.item.enable', 'save');
                    this.sandbox.emit('sulu.products.save-error', response);
                }.bind(this)
            });
        },

        load: function(id, localization) {
            this.sandbox.emit('sulu.router.navigate', 'pim/products/' + localization + '/edit:' + id + '/details');
        },

        del: function(ids) {
            this.confirmDeleteDialog(function(wasConfirmed) {
                if (wasConfirmed) {
                    this.sandbox.util.each(ids, function(key, id) {
                        var product = Product.findOrCreate({id: id});
                        product.destroy({
                            success: function() {
                                this.sandbox.emit('husky.datagrid.products.record.remove', id);
                            }.bind(this)
                        });
                    }.bind(this));
                }
            }.bind(this));
        },

        deleteProduct: function(id) {
            DeleteDialog.show(this.sandbox, Product.findOrCreate({id: id}));
        },

        addVariant: function(id) {
            this.product.get('variants').fetch(
                {
                    data: {
                        id: id
                    },
                    type: 'POST',
                    success: function(collection, response) {
                        delete response.parent; // FIXME this is necessary because of husky datagrid
                        this.sandbox.emit('husky.datagrid.variants-datagrid.record.remove', id);
                        this.sandbox.emit('husky.datagrid.record.add', response);
                    }.bind(this)
                }
            );
        },

        deleteVariants: function(ids) {
            this.confirmDeleteDialog(function(wasConfirmed) {
                if (wasConfirmed) {
                    this.product.get('variants').fetch({
                        success: function(collection) {
                            this.sandbox.util.each(ids, function(key, id) {
                                var product = collection.get(id);
                                product.urlRoot = collection.url() + '/';

                                product.destroy({
                                    success: function() {
                                        this.sandbox.emit('sulu.products.variant.deleted', id);
                                    }.bind(this)
                                });
                            }.bind(this));
                        }.bind(this)
                    });
                }
            }.bind(this));
        },

        confirmDeleteDialog: function(callbackFunction) {
            this.sandbox.emit(
                'sulu.overlay.show-warning',
                'sulu.overlay.be-careful',
                'sulu.overlay.delete-desc',
                callbackFunction.bind(this, false),
                callbackFunction.bind(this, true)
            );
        },

        renderTabs: function() {
            this.product = new Product();

            var $tabContainer = this.sandbox.dom.createElement('<div/>'),
                component = {
                    name: 'products/components/content@suluproduct',
                    options: {
                        el: $tabContainer,
                        locale: this.options.locale
                        //locale: retrieveDefaultLocale.call(this)
                    }
                },
                dfd = this.sandbox.data.deferred();

            this.html($tabContainer);

            if (!!this.options.id) {
                component.options.content = this.options.content;
                component.options.id = this.options.id;
                this.product.set({id: this.options.id});
                this.product.fetchLocale(this.options.locale, {
                    success: function(model) {
                        // pass data as backbone model
                        component.options.data = this.product;
                        component.options.productType = types[model.get('type').id];
                        this.sandbox.start([component]);
                        dfd.resolve();
                    }.bind(this),
                    error: function() {
                        this.sandbox.logger.error("error while fetching product");
                        dfd.reject();
                    }.bind(this)
                });
            } else {
                this.sandbox.emit('sulu.header.toolbar.item.change', 'workflow', 'inactive');
                component.options.productType = this.options.productType;
                this.sandbox.start([component]);
                dfd.resolve();
            }

            return dfd.promise();
        },

        /**
         * Creates the view for the flat product list
         */
        renderList: function() {
            var $list = this.sandbox.dom.createElement('<div id="products-list-container"/>');
            this.html($list);
            this.sandbox.start([
                {name: 'products/components/list@suluproduct', options: {el: $list}}
            ]);
        },

        /**
         * Creates the view for the product import
         */
        renderImport: function() {
            var $container = this.sandbox.dom.createElement('<div id="products-import"/>');
            this.html($container);
            this.sandbox.start([
                {name: 'products/components/import@suluproduct', options: {el: $container}}
            ]);
        }
    };
});
