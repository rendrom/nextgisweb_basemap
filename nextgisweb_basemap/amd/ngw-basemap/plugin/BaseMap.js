define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/json",
    "ngw-webmap/plugin/_PluginBase",
    "dojo/dom-construct",
    "ngw-pyramid/i18n!basemap",
    "openlayers/ol",
    "../resource/proj4"
], function (
    declare,
    array,
    lang,
    json,
    _PluginBase,
    domConstruct,
    i18n,
    ol,
    proj4
) {
    return declare([_PluginBase], {

        constructor: function () {
            var wmplugin = this.display.config.webmapPlugin[this.identity];
            var settings = this.display.clientSettings;

            ol.proj.setProj4(proj4);

            // Yandex.Maps
            proj4.defs("EPSG:3395","+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs");
            ol.proj.get('EPSG:3395').setExtent([-20037508.342789244,
                                                -20037508.342789244,
                                                 20037508.342789244,
                                                 20037508.342789244]);

            if (wmplugin.basemaps.length) {
                settings.basemaps = [];

                array.forEach(wmplugin.basemaps, function (bm, idx) {
                    var opts = { "base": {}, "layer": {}, "source": {} },
                        qms;

                    opts.base.mid = "ngw/openlayers/layer/XYZ";
                    opts.base.keyname = bm.keyname;
                    opts.layer.title = bm.display_name;

                    if (!bm.qms) {
                        opts.source.url = bm.url;
                    } else {
                        qms = json.parse(bm.qms);

                        if (qms.epsg !== 3857 && qms.epsg !== 3395) {
                            console.warn(lang.replace("CRS {epsg} is not supported, {name} layer.", {
                                epsg: qms.epsg,
                                name: bm.display_name
                            }));
                            return;
                        }
                        
                        opts.source = {
                            "url": qms.url,
                            "minZoom": qms.z_min ? qms.z_min : undefined,
                            "maxZoom": qms.z_max ? qms.z_max : undefined,
                            "attributions": qms.copyright_text,
                            "projection": "EPSG:" + qms.epsg
                        };

                        if (!qms.y_origin_top) {
                            opts.source.url = lang.replace(opts.source.url, {"x": "{x}", "y": "{-y}", "z": "{z}"});
                        }
                    }

                    opts.layer.opacity = bm.opacity ? bm.opacity : undefined;
                    opts.layer.visible = (idx === 0) ? true : false;
                    opts.source.wrapX = false;

                    if (bm.enabled) {
                        settings.basemaps.push(opts);
                    }
                });

                settings.basemaps.push({
                    "base": {
                        "keyname": "blank",
                        "mid": "ngw/openlayers/layer/XYZ"
                    },
                    "layer": {
                        "title": "None",
                        "visible": settings.basemaps.length ? false : true
                    },
                    source: {}
                });
            }
        }
    });
});
