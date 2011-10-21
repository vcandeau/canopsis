Ext.define('canopsis.view.Menu.View' ,{
	extend: 'Ext.tree.Panel',
	alias : 'widget.MenuView',

	//cls: 'x-main-menu',
	//collapsedCls: 'x-main-menu',

	hideHeaders: true,
	rootVisible: false,
	title: 'Menu',
	animCollapse: false,
	collapsible: true,
	//collapsed: false,

	store: 'Menu',

	initComponent: function() {
		this.callParent(arguments);
	}
});
