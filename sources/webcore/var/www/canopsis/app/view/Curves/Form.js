/*
#--------------------------------
# Copyright (c) 2011 "Capensis" [http://www.capensis.com]
#
# This file is part of Canopsis.
#
# Canopsis is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Canopsis is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Canopsis.  If not, see <http://www.gnu.org/licenses/>.
# ---------------------------------
*/
Ext.define('canopsis.view.Curves.Form', {
	extend: 'canopsis.lib.view.cform',

	alias: 'widget.CurvesForm',

	logAuthor: "[view][Curves][form]",

	items: [{
				name: 'id',
				hidden: true,
			},{
				fieldLabel: _('Metric'),
				name: 'metric',
				allowBlank : false
			}, {
				xtype: 'colorfield',
				colors: global.default_colors,
				fieldLabel: _('Line Color'),
				name: 'line_color',
				allowBlank : false
			},{
				xtype: 'colorfield',
				colors: global.default_colors,
				fieldLabel: _('Area Color'),
				name: 'area_color',
				allowBlank : true
			},{
				xtype : 'numberfield',
				name : "area_opacity",
				fieldLabel: "Area Opacity (%)",
				minValue: 1,
				maxValue: 100,
				value: 75
			}],
    
});
