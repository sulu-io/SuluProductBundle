define([],function(){"use strict";return{update:function(a){this.sandbox=a;var b=this.sandbox.data.deferred();return this.sandbox.on("sulu.products.product-update",function(a){b.resolve(a)}.bind(this)),this.sandbox.emit("sulu.products.get-product-update"),b.promise()}}});