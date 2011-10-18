Ext.define('canopsis.view.Config.treeOrdering' ,{
	extend: 'Ext.tree.Panel',
	alias : 'widget.treeOrdering',
	
	//store: store,
	
	viewConfig: {
		plugins: {
			ptype: 'treeviewdragdrop'
		}
	},
	//renderTo: 'tree-div',
	//height: 300,
	//width: 250,
	title: 'User config panel',
	//useArrows: true,
	
	/*bbar : [{
			text: 'Expand All',
			handler: function(){
				this.expandAll();
			}
		}, {
			text: 'Collapse All',
			handler: function(){
				this.collapseAll();
			}
	}]*/
	
	columns: [{
		xtype: 'treecolumn', //this is so we know which column will show the tree
		text: 'Option name',
		flex: 1,
		sortable: true,
		dataIndex: 'task'
	},{
		//we must use the templateheader component so we can use a custom tpl
		//xtype: 'templatecolumn',
		text: 'title',
		flex: 1,
		sortable: true,
		//dataIndex: 'duration',
		align: 'center',
		//add in the custom tpl for the rows
		/*tpl: Ext.create('Ext.XTemplate', '{duration:this.formatHours}', {
			formatHours: function(v) {
				if (v < 1) {
					return Math.round(v * 60) + ' mins';
				} else if (Math.floor(v) !== v) {
					var min = v - Math.floor(v);
					return Math.floor(v) + 'h ' + Math.round(min * 60) + 'm';
				} else {
					return v + ' hour' + (v === 1 ? '' : 's');
				}
			}
		})*/
	},{
		text: 'colspan',
		flex: 1,
		//dataIndex: 'user',
	},{
		text: '_id',
		flex: 1,
		//dataIndex: 'user',
	},{
		text: 'refresh interval',
		flex: 1,
		//dataIndex: 'user',
	}]
	
	
});
