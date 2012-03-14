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

function _(text, context) {
	if (typeof(i18n) != 'undefined') {
		if (context)
			if(i18n[context + '.' + text])
				return i18n[context + '.' + text]

		if(i18n[text])
			return i18n[text]
			
		if(global.locale != 'en' && (global.log.level > 4))
			global.untranslated.push(text)
	}
	
	return text
}
