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
Ext.define('canopsis.controller.View', {
    extend: 'canopsis.lib.controller.ctree',

    views: ['View.TreePanel'],
    stores: ['Views', 'TreeStoreViews'],
    model: ['View'],

    logAuthor: '[controller][View]',

    init: function() {
		log.debug('Initialize ...', this.logAuthor);

		//this.formXtype = 'GroupForm'
		this.listXtype = 'ViewTreePanel';

		this.modelId = 'View';

		log.debug(' + Load treeStore ...', this.logAuthor);
		this.treeStore = Ext.data.StoreManager.lookup('TreeStoreViews');

		if (!this.treeStore.isLoading()) {
			this.treeStore.load();
		}

		this.store = Ext.data.StoreManager.lookup('Views');

		this.store.proxy.on('exception', function(proxy, response) {
			console.log(response);
			log.error('Error in request', this.logAuthor);
			var message = Ext.String.format(
				'{0}<br>{1}: {2}',
				 _('Error in request:'),
				 response.status,
				 response.statusText
			);

			global.notify.notify(_('View'), message, 'error');
		}, this);

		this.callParent(arguments);

		//binding view export pdf

    },

    bindTreeEvent: function() {
		this.tree.on('exportPdf', function(view) {
				this.getController('Reporting').launchReport(view);
			},this);

		//reload treeStore if view store is update (means that someone have save a
		//view, you need to sync those two stores
		var viewStore = Ext.data.StoreManager.lookup('Views');
		viewStore.on('write', function() {
			if (!this.treeStore.isLoading()) {
				this.treeStore.load();
			}

		},this);
	},

	check_right_on_drop: function(node,data,overModel) {
		log.debug('checking right on record before drop', this.logAuthor);
		var ctrl = this.getController('Account');
		var src_record = data.records[0];
		var dest_record = overModel;

		//check if right to right, if not, stop event + display notif
		if (!(ctrl.check_record_right(src_record, 'w') && ctrl.check_record_right(dest_record, 'w'))) {
			global.notify.notify(_('Access denied'), _('You don\'t have the rights to modify this object'), 'error');
			return true;
		}

	},

    addLeafButton: function() {
		this.create_new_view();
	},

    addDirectoryButton: function() {
		this.create_new_directory();
	},

	itemDoubleClick: function() {
		var tree = this.tree;

		var selection = tree.getSelectionModel().getSelection()[0];
		if (selection.get('leaf')) {
			view_id = selection.get('id');
			view_name = selection.get('crecord_name');
			this.getController('Tabs').open_view({ view_id: view_id, title: view_name });
		}
	},

	_duplicateButton: function() {
		log.debug('duplicate', this.logAuthor);
		//get selected views
		var tree = this.tree;
		var selection = tree.getSelectionModel().getSelection();
		//for each selected view
		for (var i in selection) {
			if (selection[i].isLeaf()) {
				var view_id = 'view.' + global.account.user + '.' + global.gen_id();
				var new_record = selection[i].copy(view_id);
				new_record.set('_id', view_id);
				new_record.set('id', view_id);
				this.add_to_home(new_record, false);
			}
		}
	},

	exportButton: function(item) {
		log.debug('Export view', this.logAuthor);
		this.getController('Schedule').scheduleWizard(item, this.tree.id);
	},

	/////////////////

	create_new_directory: function() {
		Ext.Msg.prompt(_('Directory name'), _('Please enter directory name:'), function(btn, directoryName) {
			if (btn == 'ok') {

				var record = Ext.create('canopsis.model.View');

				var directory_id = 'directory.' + global.account.user + '.' + global.gen_id();

				record.set('crecord_name', directoryName);

				record.set('_id', directory_id);
				record.set('id', directory_id);
				//need to set the empty array , otherwise treepanel send request
				//to fetch inside
				record.set('children', []);

				this.add_to_home(record, false);

			} else {
				log.debug('cancel new view', this.logAuthor);
			}
		}, this);
	},

	create_new_view: function() {
		Ext.Msg.prompt(_('View name'), _('Please enter view name:'), function(btn, viewName) {
			if (btn == 'ok') {

				Ext.Ajax.request({
					url: '/ui/view/exist/' + viewName,
					method: 'GET',
					scope: this,
					success: function(response) {
						var text = Ext.decode(response.responseText);
						if (text.data.exist == true) {
							Ext.Msg.alert(_('this view already exist'), _("you can't add the same view twice"));
						} else {
							// Create view
							var view_id = 'view.' + global.account.user + '.' + global.gen_id();

							//building record
							var record = Ext.create('canopsis.model.View');
							record.set('_id', view_id);
							record.set('id', view_id);
							record.set('crecord_name', viewName);
							record.set('leaf', true);

							this.add_to_home(record, true);
						}
					},
					failure: function(response) {
						if (response.status == 403) {
							global.notify.notify(_('Access denied'), _('You don\'t have the rights to modify this object'), 'error');
							log.error(_('Access denied'));
						}
					}
				});

			} else {
				log.debug('cancel new view', this.logAuthor);
			}
		}, this);
	},

	add_to_home: function(record,open_after_put) {
		//append child
		var rootDir = 'directory.root.' + global.account.user;

		log.debug('Add view: ', this.logAuthor);
		log.debug(' + root dir: ' + rootDir, this.logAuthor);
		log.debug(' + name: ' + record.get('crecord_name'), this.logAuthor);
		log.debug(' + id: ' + record.get('_id'), this.logAuthor);

		var parentNode = this.treeStore.getNodeById(rootDir);
		var rootNode = this.treeStore.getRootNode();
		if (parentNode) {
			parentNode.appendChild(record);

			//this is a hack
			rootNode.dirty = false;

			this.treeStore.sync();

			if (!this.treeStore.isLoading()) {
				this.treeStore.load();
			}

			//open view for edition
			if (open_after_put == true) {
				var tab = this.getController('Tabs').open_view({ view_id: record.get('_id'), title: record.get('crecord_name') });
				tab.editMode();
				tab.doRedraw();

				//Hack
				Ext.getCmp('dashboardSelector').store.load();
			}
		}else {
			log.debug('Impossible to add view, root directory not found ....', this.logAuthor);
		}
	},

    checkOpen: function(view_id) {
		var maintabs = Ext.getCmp('main-tabs');
		var tab = Ext.getCmp(view_id + '.tab');

		if (tab) {
			global.notify.notify(_('Warning'), 'You must close view before renaming', 'error');
			return true;
		}else {
			return false;
		}
	}

});
