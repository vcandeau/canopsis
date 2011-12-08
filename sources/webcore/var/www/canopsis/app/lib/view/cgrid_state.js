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
Ext.define('canopsis.lib.view.cgrid_state' ,{
	extend: 'canopsis.lib.view.cgrid',

	store: false,
	filter: false,
	autoload: false,
	remoteSort: false,

	opt_paging: false,
	opt_bar: false,

	opt_show_state_type: true,
	opt_show_component: false,
	opt_show_ressource: true,
	opt_show_row_background: true,

	opt_bar_delete: false,
	opt_bar_add: false,
	
	border: true,

	namespace: 'events',

	pageSize: 100,

	sorters: [{
			property : 'state',
			direction: 'DESC'
		}],

	columns: [],

	initComponent: function() {
		this.columns = []

		//set columns
		this.columns.push({
			header: '',
			width: 25,
			sortable: false,
			dataIndex: 'source_type',
			renderer: rdr_source_type
	       	});
	
		if(this.opt_show_state_type){
			this.columns.push({
				header: '',
				sortable: false,
				width: 25,
				dataIndex: 'state_type',
				renderer: rdr_state_type
			});
		}

		this.columns.push({
			header: 'State',
			sortable: false,
			width: 50,
			dataIndex: 'state',
			renderer: rdr_status
		});

		this.columns.push({
			header: 'Last check',
			sortable: false,
			width: 130,
			dataIndex: 'timestamp',
			renderer: rdr_tstodate
		});

		if(this.opt_show_component){
			this.columns.push({
				header: 'Component',
				flex: 1,
				sortable: false,
				dataIndex: 'component',
			});
		}

		if(this.opt_show_ressource){
			this.columns.push({
				header: 'Ressource',
				flex: 1,
				sortable: false,
				dataIndex: 'ressource',
			});
		}

		this.columns.push({
			header: 'Output',
			flex: 4,
			sortable: false,
			dataIndex: 'output',
		});				

		//store
		if (! this.store){
			this.store = Ext.create('canopsis.lib.store.cstore', {
				//extend: 'canopsis.lib.store.cstore',
				model: 'canopsis.model.event',

				pageSize: this.pageSize,

				sorters: this.sorters,

				remoteSort: this.remoteSort,

				proxy: {
					type: 'rest',
					url: '/rest/'+this.namespace+'/event',
					reader: {
						type: 'json',
						root: 'data',
						totalProperty  : 'total',
						successProperty: 'success'
					},
				}
			});

			if (this.filter) {
				this.store.setFilter(this.filter);
			}

			if (this.autoload) {
				this.store.load();
			}
		}

		this.viewConfig = {
			stripeRows: false,
		}

		if (this.opt_show_row_background){
			this.viewConfig.getRowClass = this.coloringRow;
		}
			
		this.callParent(arguments);
	},
	
	coloringRow : function(record,index,rowParams,store){
		state = record.get('state');
		if (state == 0){
			return 'row-background-ok'
		} else if (state == 1){
			return 'row-background-warning'
		} else {
			return 'row-background-error'
		}
	},

	load_services_of_host: function(hostname){
		this.store.proxy.extraParams = {"filter": '{"component":"'+ hostname +'", "source_type": "ressource"}'};
		this.store.load();
	},

	load_host: function(hostname){
		this.store.proxy.extraParams = {"filter": '{"component":"'+ hostname +'"}'};
		this.store.load();
	}

});
