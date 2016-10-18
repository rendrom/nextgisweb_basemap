define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/json",
    "ngw-webmap/plugin/_PluginBase",
    "dojo/dom-construct",
    "ngw-pyramid/i18n!basemap"
], function (
    declare,
    array,
    lang,
    json,
    _PluginBase,
    domConstruct,
    i18n
) {
    return declare([_PluginBase], {

        constructor: function () {
            var wmplugin = this.display.config.webmapPlugin[this.identity];
            var settings = this.display.clientSettings;

            var basemaps = array.filter(wmplugin.basemaps, function (bm) {
                return bm.enabled;
            });

            if (basemaps.length) {
                settings.basemaps = [];

                array.forEach(basemaps, function (bm, idx) {
                    var opts = { "base": {}, "layer": {}, "source": {} },
                        qms;

                    if (!bm.qms) {
                        opts.base.mid = "ngw/openlayers/layer/XYZ";
                        opts.layer.title = bm.display_name;
                    } else {
                        qms = json.parse(bm.qms);

                        if (qms.epsg !== 3857) {
                            console.warn(lang.replace("CRS {epsg} is not supported, {name} layer.", {
                                epsg: qms.epsg,
                                name: bm.display_name
                            }));
                            return;
                        }
                        
                        opts.base.mid = "ngw/openlayers/layer/XYZ";
                        opts.layer.title = bm.display_name;
                        opts.source = {
                            "url": qms.url,
                            "minZoom": qms.z_min ? qms.z_min : undefined,
                            "maxZoom": qms.z_max ? qms.z_max : undefined,
                            "attributions": qms.copyright_text,
                            "projection": "EPSG:" + qms.epsg
                        };

                        if (!qms.y_origin_top) {
                            lang.replace(opts.source.url, {"y": "{-y}"});
                        }
                    }

                    opts.layer.opacity = bm.opacity ? bm.opacity : undefined;
                    opts.layer.visible = (idx == 0) ? true : false;

                    settings.basemaps.push(opts);
                });

                settings.basemaps.push({
                    "base": {
                        "keyname": "blank",
                        "mid": "ngw/openlayers/layer/XYZ"
                    },
                    "layer": {
                        "title": "None",
                        "visible": false
                    },
                    source: {}
                });
            }
        }
    });
});
