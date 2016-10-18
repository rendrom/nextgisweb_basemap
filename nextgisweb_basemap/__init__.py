# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from nextgisweb.component import Component, require

from .model import Base
from .util import COMP_ID


class BasemapComponent(Component):
    identity = COMP_ID
    metadata = Base.metadata

    def initialize(self):
        from . import plugin

    @require('resource', 'webmap')
    def setup_pyramid(self, config):
        from . import view

    def client_settings(self, request):
        return dict(
            qms_geoservices_url=self.settings.get('qms_geoservices_url'),
            qms_icons_url=self.settings.get('qms_icons_url'))

    settings_info = (
        dict(key='qms_geoservices_url', desc="Geo Services QMS API URL"),
        dict(key='qms_icons_url', desc="Icons QMS API URL"),
    )


def pkginfo():
    return dict(components=dict(
        basemap='nextgisweb_basemap'))


def amd_packages():
    return (
        ('ngw-basemap', 'nextgisweb_basemap:amd/ngw-basemap'),
    )
