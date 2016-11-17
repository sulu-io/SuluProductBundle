define(["services/product/product-content-manager","services/product/product-manager","suluproduct/util/header","text!suluproduct/components/products/components/edit/content/content.html"],function(a,b,c,d){"use strict";var e={data:{}},f={form:"#content-form"},g=function(){this.sandbox.on("sulu.toolbar.save",h.bind(this))},h=function(){if(this.sandbox.form.validate(f.form)){this.sandbox.emit("sulu.header.toolbar.item.loading","save");var d=this.sandbox.form.getData(f.form),e=a.save(this.options.data.id,this.options.locale,d),g=!0,h=c.retrieveChangedStatus();h&&(g=b.saveStatus(this.options.data.id,h)),this.sandbox.util.when(e,g).then(i.bind(this))}},i=function(a){c.setSaveButton(!1),this.sandbox.emit("sulu.labels.success.show","labels.success.save-desc","labels.success"),j.call(this,a[0])},j=function(a){var b=$.Deferred();return this.formObject||(this.formObject=this.sandbox.form.create(f.form)),this.formObject.initialized.then(function(){this.sandbox.form.setData(f.form,a).then(function(){b.resolve()})}.bind(this)),b.promise()},k=function(){return this.sandbox.start(f.form),this.sandbox.dom.on(this.$el,"keyup",c.setSaveButton.bind(this,!0)),!0},l=function(){this.isFormStarted||(this.isFormStarted=k.call(this))},m=function(a){this.sandbox.dom.html(this.$el,_.template(d,{translate:this.sandbox.translate})),j.call(this,a).then(l.bind(this))};return{layout:function(){return{extendExisting:!0,content:{width:"fixed",rightSpace:!1,leftSpace:!1}}},initialize:function(){this.isFormStarted=!1,this.formObject=null,this.options=this.sandbox.util.extend(!0,{},e,this.options),this.status=this.options.data.attributes.status,this.sandbox.emit("product.state.change",this.status),a.load(this.options.data.id,this.options.locale).then(m.bind(this)),g.call(this)}}});