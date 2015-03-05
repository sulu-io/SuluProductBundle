define(["text!suluproduct/components/bulk-price/bulk-price.html"],function(a){"use strict";var b={instanceName:null,data:[],translations:{},currency:null},c={minimumQuantity:0,maxBulkElements:4,bulkPriceIdPrefix:"bulk-price-"},d="sulu.products.bulk-price.",e=function(a){return d+(this.options.instanceName?this.options.instanceName+".":"")+a},f=function(){return e.call(this,"initialized")},g=function(a){var b=null,d=null;return this.sandbox.util.foreach(a,function(a,e){parseFloat(a.minimumQuantity)===c.minimumQuantity&&null===d&&(b=a,d=e),a.minimumQuantity=a.minimumQuantity||0===a.minimumQuantity?this.sandbox.numberFormat(parseFloat(a.minimumQuantity),"n"):"",a.price=a.price||0===a.price?this.sandbox.numberFormat(a.price,"n"):""}.bind(this)),null!==d&&a.splice(d,1),b},h=function(a){var b=a.length;if(b<c.maxBulkElements)for(;b<c.maxBulkElements;b++)a.push({});return a},i=function(){this.sandbox.dom.on(this.$el,"keyup",function(){j.call(this)}.bind(this),"input")},j=function(){var a,b,d,e,f=[],g=this.sandbox.dom.find(".salesprice",this.$el),h=this.sandbox.dom.val(g),i=this.sandbox.dom.data(g,"id"),j=this.sandbox.dom.find(".table tbody tr",this.$el);h&&(a={price:h?this.sandbox.parseFloat(h):null,minimumQuantitiy:c.minimumQuantity,id:i?i:null,currency:this.options.currency},f.push(a)),this.sandbox.util.foreach(j,function(a){e=this.sandbox.dom.data(a,"id"),d=this.sandbox.dom.val(this.sandbox.dom.find("input.minimumQuantity",a)),b=this.sandbox.dom.val(this.sandbox.dom.find("input.price",a)),d&&b&&f.push({minimumQuantity:this.sandbox.parseFloat(d),price:this.sandbox.parseFloat(b),currency:this.options.currency,id:e?e:null})}.bind(this)),this.sandbox.dom.data(this.$el,"items",f),this.sandbox.emit("sulu.products.bulk-price.changed")};return{initialize:function(){var a,c=[];this.options=this.sandbox.util.extend({},b,this.options),this.options.data&&(c=this.sandbox.util.extend([],this.options.data),a=g.call(this,c)),c=h.call(this,c),i.call(this),this.render(c,a),j.call(this),this.sandbox.emit(f.call(this))},render:function(b,d){var e={idPrefix:c.bulkPriceIdPrefix,currency:this.options.currency,salesPrice:d,translate:this.sandbox.translate,prices:b},f=this.sandbox.util.template(a,e);this.sandbox.dom.append(this.options.el,f)}}});