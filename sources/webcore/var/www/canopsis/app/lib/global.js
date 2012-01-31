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
var global = {
	state_colors: {
		up: '#50b432',
		down: '#ed241b',
		unreachable: '#f0f0ff',
		ok : '#50b432',
		warning: '#ed941b',
		critical: '#ed241b',
		unknown: '#f0f0ff' 
	},
	log: {
		/* 0: none, 1: info, 2: error, 3: error + warning, 4: error + warning + debug, 5: error + warning + debug + dump */
		level: 0,
		buffer: 50
	},

	notify: false,

	pageSize: 20,

	default_locale: 'en',
	locale: 'en',

	default_colors:[
		'#4572A7',
		'#AA4643',
		'#89A54E',
		'#80699B',
		'#3D96AE',
		'#DB843D',
		'#92A8CD',
		'#A47D7C',
		'#B5CA92',
		'SeaGreen',
		'LightBlue',
		'CornflowerBlue',
		'OrangeRed',
		'DarkRed',
		'Gold',
		'Green',
		'Indigo',
		'grey',
		'LightSlateGrey',
		'MediumPurple',
		'DarkBlue',
		'Orchid',
		'purple',
		'Orange',
		'BurlyWood',
		'Chartreuse',
		'Fuchsia',
		'Grey',
		'Navy',
		'Peru'
	],
	
	commonTs:{
		hours: 3600,
		threeHours: 10800,
		day: 86400,
		week: 604800,
		month : 2629800,
		year : 31557600
	}
}
