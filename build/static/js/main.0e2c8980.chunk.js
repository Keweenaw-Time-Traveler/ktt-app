(this.webpackJsonpktt=this.webpackJsonpktt||[]).push([[0],{11:function(e,t,a){e.exports={bar:"NavBar_bar__25Gi7",link:"NavBar_link__2Iixg",selected:"NavBar_selected__5ZUgm"}},13:function(e,t,a){e.exports={wrapper:"Map_wrapper__2W8sI",map:"Map_map__2bGnQ",clusterWidget:"Map_clusterWidget__3yDnq",clusterButton:"Map_clusterButton__2CG4g",legend:"Map_legend__3AoGH"}},32:function(e,t,a){e.exports={text:"login_text__3nYhP"}},33:function(e,t,a){e.exports={text:"signup_text__2U_xm"}},35:function(e,t,a){e.exports=a(66)},40:function(e,t,a){},41:function(e,t,a){},47:function(e,t,a){e.exports={text:"home_text__37_tL"}},66:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),i=a(30),l=a.n(i),c=(a(40),a(14)),o=a(1),s=(a(41),a(7)),u=a(8),m=a(10),p=a(9),d=a(11),f=a.n(d),v=function(e){Object(m.a)(a,e);var t=Object(p.a)(a);function a(){return Object(s.a)(this,a),t.apply(this,arguments)}return Object(u.a)(a,[{key:"render",value:function(){return r.a.createElement("nav",{className:f.a.bar},r.a.createElement(c.b,{exact:!0,className:f.a.link,activeClassName:f.a.selected,to:"/"},"Home"),r.a.createElement(c.b,{exact:!0,className:f.a.link,activeClassName:f.a.selected,to:"/login"},"Login"),r.a.createElement(c.b,{exact:!0,className:f.a.link,activeClassName:f.a.selected,to:"/signup"},"Signup"))}}]),a}(n.Component),g=(a(47),a(34)),h=a(19),b=(a(48),a(13)),E=a.n(b),y=function(){return r.a.createElement("div",{id:"infoDiv",className:"esri-widget ".concat(E.a.clusterWidget)},r.a.createElement("select",{id:"filter",className:"esri-select"},r.a.createElement("option",{value:""},"All"),r.a.createElement("option",{value:"1888"},"1888"),r.a.createElement("option",{value:"1900"},"1900"),r.a.createElement("option",{value:"1908"},"1908"),r.a.createElement("option",{value:"1917"},"1917"),r.a.createElement("option",{value:"1928"},"1928"),r.a.createElement("option",{value:"1942"},"1942"),r.a.createElement("option",{value:"1949"},"1949")),r.a.createElement("button",{id:"toggle-cluster",className:"esri-button ".concat(E.a.clusterButton)},"Disable Clustering"),r.a.createElement("div",{id:"legendDiv",className:E.a.legend}))},w=function(){var e=Object(n.useRef)();return Object(n.useEffect)((function(){Object(h.loadCss)("https://js.arcgis.com/4.17/esri/themes/dark-blue/main.css"),Object(h.loadModules)(["esri/Map","esri/layers/FeatureLayer","esri/views/MapView","esri/Basemap","esri/layers/VectorTileLayer","esri/widgets/Legend","esri/widgets/Expand","esri/smartMapping/labels/clusters","esri/smartMapping/popup/clusters","esri/core/promiseUtils","esri/tasks/QueryTask","esri/tasks/support/Query"],{css:!0}).then((function(t){var a=Object(g.a)(t,12),n=a[0],r=a[1],i=a[2],l=a[3],c=a[4],o=a[5],s=a[6],u=a[7],m=a[8],p=a[9],d=a[10],f=a[11],v="https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_CityDir/MapServer/0",h=new d({url:v}),b=new f;b.returnGeometry=!0,b.outFields=["*"],b.where="1 = 1",h.execute(b).then((function(e){console.log(e.features)})),h.executeForCount(b).then((function(e){console.log(e)}));var E=new r({title:"People",url:v,outFields:["*"],popupTemplate:{title:"{firstname} {lastname}",content:[{type:"fields",fieldInfos:[{fieldName:"year"},{fieldName:"occupation"},{fieldName:"street_nam"}]}]},renderer:{type:"simple",symbol:{type:"simple-marker",size:4,color:"#69dcff",outline:{color:"rgba(0, 139, 174, 0.5)",width:5}}}}),y=new n({basemap:new l({baseLayers:[new c({portalItem:{id:"c11ce4f7801740b2905eb03ddc963ac8"}})]}),layers:[E]}),w=new i({container:e.current,map:y,center:[-88.453743,47.246247],zoom:15}),_=(new o({view:w,container:"legendDiv"}),document.getElementById("infoDiv"));function x(){return w.scale>4e3}return w.ui.add(new s({view:w,content:_,expandIconClass:"esri-icon-layer-list",expanded:!1}),"top-left"),E.when().then((function(e){var t=m.getTemplates({layer:e}).then((function(e){return e.primaryTemplate.value})),a=u.getLabelSchemes({layer:e,view:w}).then((function(e){return e.primaryScheme}));return p.eachAlways([t,a]).then((function(e){var t=e[0].value,a=e[1].value;return{type:"cluster",popupTemplate:t,labelingInfo:a.labelingInfo,clusterMinSize:a.clusterMinSize}})).catch((function(e){console.error(e)}))})).then((function(e){E.featureReduction=e;var t=document.getElementById("toggle-cluster");t.addEventListener("click",(function(){if(x()){var a=E.featureReduction;E.featureReduction=a&&"cluster"===a.type?null:e}t.innerText="Enable Clustering"===t.innerText?"Disable Clustering":"Enable Clustering"})),w.whenLayerView(E).then((function(e){document.getElementById("filter").addEventListener("change",(function(t){var a=t.target.value,n=a?"year = "+a:null;e.filter={where:n},w.popup.close()}))})),w.watch("scale",(function(a){"Disable Clustering"===t.innerText&&(E.featureReduction=x()?e:null)}))})).catch((function(e){console.error(e)})),function(){w&&w.destroy()}}))})),r.a.createElement("div",{className:E.a.wrapper},r.a.createElement("div",{className:"webmap ".concat(E.a.map),ref:e}),r.a.createElement(y,null))},_=function(e){Object(m.a)(a,e);var t=Object(p.a)(a);function a(){return Object(s.a)(this,a),t.apply(this,arguments)}return Object(u.a)(a,[{key:"render",value:function(){return r.a.createElement(w,null)}}]),a}(n.Component),x=a(32),N=a.n(x),j=function(e){Object(m.a)(a,e);var t=Object(p.a)(a);function a(){return Object(s.a)(this,a),t.apply(this,arguments)}return Object(u.a)(a,[{key:"render",value:function(){return r.a.createElement("div",null,r.a.createElement("h1",null,"Login"),r.a.createElement("p",{className:N.a.text},"Lorem ipsum dolor sit amet, melius torquatos an eos. Commodo adipisci ad ius. Has delectus insolens disputando eu, aeque elitr sed at, eos ei legere eleifend. Eos ei hinc vide, his elit erant at, at ius magna utroque recteque."))}}]),a}(n.Component),k=a(33),O=a.n(k),C=function(e){Object(m.a)(a,e);var t=Object(p.a)(a);function a(){return Object(s.a)(this,a),t.apply(this,arguments)}return Object(u.a)(a,[{key:"render",value:function(){return r.a.createElement("div",null,r.a.createElement("h1",null,"Signup"),r.a.createElement("p",{className:O.a.text},"Lorem ipsum dolor sit amet, melius torquatos an eos. Commodo adipisci ad ius. Has delectus insolens disputando eu, aeque elitr sed at, eos ei legere eleifend. Eos ei hinc vide, his elit erant at, at ius magna utroque recteque."))}}]),a}(n.Component);var M=function(){return r.a.createElement("div",{className:"App"},r.a.createElement(c.a,null,r.a.createElement(v,null),r.a.createElement("div",{className:"container"},r.a.createElement(o.c,null,r.a.createElement(o.a,{exact:!0,path:"/",component:_}),r.a.createElement(o.a,{exact:!0,path:"/login",component:j}),r.a.createElement(o.a,{exact:!0,path:"/signup",component:C})))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(M,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[35,1,2]]]);
//# sourceMappingURL=main.0e2c8980.chunk.js.map