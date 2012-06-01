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
	
	account: undefined,
	
	accountCtrl: undefined,
	curvesCtrl: undefined,
	
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
		//level: 5,
		level: 3,
		buffer: 50
	},

	notify: false,

	pageSize: 20,

	default_locale: 'en',
	locale: 'en',

	default_colors:[
		'4572A7', 'AA4643', '89A54E', '80699B',
		'3D96AE', 'DB843D', '92A8CD', 'A47D7C',
		'B0CC99', '677E52', 'B7CA79', 'F6E8B1',
		'89725B', 'E6E2AF', 'A7A37E', 'EFECCA',
		'046380', '002F2F', 'B9121B', '4C1B1B',
		'F6E497', 'FCFAE1', 'BD8D46', 'EEEEC6',
		'320E15', 'E70739', 'B09F91', '5EB6DD',
		'C79F4B', 'A67E2E', '663E10', '570906',
		'3B0405', 'E1E6FA', 'C4D7ED', 'ABC8E2',
		'375D81', '183152', '556627', 'FFF168',
		'DB0B32', '5C0515', '8FCF3C', 'C44C51',
		'FFB6B8', 'FFEFB6', 'A2B5BF', '5F8CA3',
		'FF5B2B', 'B1221C', '34393E', '8CC6D7',
		'FFDA8C', '52251C', '795344', '9E8479',
		'B78178', '895959', '729179', '2F574D',
		'4C767A', '6B979C', 'EFFBFF', '006D80',
		'BDA44D', '3C2000', '84CECC', '78A419',
		'D9EFF5', '040317', '1F2A36', '667882',
		'C3D9E0', '310000', 'FF0000', 'FF5900',
		'FF9300', '7D0000', '85C630', '53872A'
	],
	
	gen_id: function(){
			var timestamp = new Date().getTime();
			return timestamp + '-' + Math.floor(Math.random()*10)
	},
	
	commonTs:{
		hours: 3600,
		threeHours: 10800,
		day: 86400,
		week: 604800,
		month : 2629800,
		year : 31557600
	},
	
	numberToMonth:{
		1: _('January'),
		2: _('February'),
		3: _('March'),
		4: _('April'),
		5: _('May'),
		6: _('June'),
		7: _('July'),
		8: _('August'),
		9: _('September'),
		10: _('October'),
		11: _('November'),
		12: _('December'),
	},
	
	untranslated : [],
}
