define(["type/default","form/util"],function(a){"use strict";return function(b,c){var d={id:"id",label:"value",required:!1,formId:"#prices-form"},e={setValue:function(a){void 0!==a&&""!==a&&null!==a&&"object"==typeof a&&App.dom.data(this.$el,"prices",a)},getValue:function(){return App.dom.data(this.$el,"prices")},needsValidation:function(){var a=this.getValue();return!!a},validate:function(){return!0}};return new a(b,d,c,"price-list",e)}});