define(["text!suluproduct/components/bulk-price/bulk-price.html"],function(a){"use strict";var b={instanceName:null,data:[],translations:{},currency:null},c={maxBulkElements:4,bulkPriceIdPrefix:"bulk-price-"},d="sulu.products.bulk-price.",e=function(a){return d+(this.options.instanceName?this.options.instanceName+".":"")+a},f=function(){return e.call(this,"initialized")},g=function(a){var b=null,c=null;return this.sandbox.util.foreach(a,function(a,d){0===parseFloat(a.minimumQuantity)&&null===c&&(b=a,c=d),a.minimumQuantity=a.minimumQuantity||0===a.minimumQuantity?this.sandbox.numberFormat(parseFloat(a.minimumQuantity),"n"):"",a.price=a.price||0===a.price?this.sandbox.numberFormat(a.price,"n"):""}.bind(this)),null!==c&&a.splice(c,1),b},h=function(a){var b=a.length;if(b<c.maxBulkElements)for(;b<c.maxBulkElements;b++)a.push({});return a},i=function(){this.sandbox.on("sulu.products.bulk-price.get-data",function(){},this)},j=function(){this.sandbox.dom.on(this.$el,"keyup",function(){k.call(this)}.bind(this),"input")},k=function(){var a,b,c,d,e=[],f=this.sandbox.dom.find(".salesprice",this.$el),g=this.sandbox.dom.val(f),h=this.sandbox.dom.data(f,"id"),i=this.sandbox.dom.find(".table tbody tr",this.$el);g&&(a={price:g?this.sandbox.parseFloat(g):null,minimumQuantitiy:0,id:h?h:null,currency:this.options.currency},e.push(a)),this.sandbox.util.foreach(i,function(a){d=this.sandbox.dom.data(a,"id"),c=this.sandbox.dom.val(this.sandbox.dom.find("input.minimumQuantity",a)),b=this.sandbox.dom.val(this.sandbox.dom.find("input.price",a)),c&&b&&e.push({minimumQuantity:c?this.sandbox.parseFloat(c):null,price:b?this.sandbox.parseFloat(b):null,currency:this.options.currency,id:d?d:null})}.bind(this)),this.sandbox.dom.data(this.$el,"items",e),this.sandbox.emit("sulu.products.bulk-price.changed")};return{initialize:function(){var a,c=[];this.options=this.sandbox.util.extend({},b,this.options),this.options.data&&(c=this.sandbox.util.extend([],this.options.data),a=g.call(this,c)),c=h.call(this,c),i.call(this),j.call(this),this.render(c,a),k.call(this),this.sandbox.emit(f.call(this))},render:function(b,d){var e={idPrefix:c.bulkPriceIdPrefix,currency:this.options.currency,salesPrice:d,translate:this.sandbox.translate,prices:b},f=this.sandbox.util.template(a,e);this.sandbox.dom.append(this.options.el,f)}}});