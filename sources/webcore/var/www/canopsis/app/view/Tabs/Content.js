//Ext.require([
//    'Ext.direct.*',
//]);

Ext.define('canopsis.view.Tabs.Content' ,{
    extend: 'Ext.container.Container',
    alias : 'widget.TabsContent', 
    
    style: {borderWidth:'0px'},

    layout: 'column',
    
    initComponent: function() {
		var tabId = this.id
		log.debug("Create container '"+tabId+"'")
		var me = this;

		var nb_column = this.view.get('column')
		var lines = this.view.get('lines')
		var hunit = this.view.get('hunit')

		if (! hunit) { hunit = 200 }
		if (! nb_column) { nb_column = 1 }

		log.debug('Create '+nb_column+' column(s)..')

		if (lines.length == 1 && nb_column == 1) {
			log.debug(' + Use full mode ...')
			item = lines[0]
			item['height'] = '100%'
			item['width'] = '100%'
			item['title'] = ''
			//item['baseCls'] = 'x-plain'
			item['mytab'] = this

			this.items = [ item ]
		}else{

			var ext_items = []
			for(var i= 0; i < lines.length; i++) {
				log.debug(' - Item '+i+':')
				var item = lines[i]

				item['mytab'] = this

				var colspan = 1
				var rowspan = 1
	
				if (item['colspan']) { colspan = item['colspan'] }
				if (item['rowspan']) { rowspan = item['rowspan'] }
				
				item['height'] = rowspan * hunit
	
				item = {
			    	 columnWidth: colspan/nb_column,
			   	 baseCls:'x-plain',
			   	 bodyStyle: {padding: '5px'},
			   	 items:[ item ]
				}
	
				ext_items.push(item)
	
			}

			//log.dump(items)
			this.items = ext_items

		}
		this.on('beforeclose', this.beforeclose)
		this.callParent(arguments);
    },
    
    beforeclose: function(tab, object){
	old_tab = Ext.getCmp('main-tabs').old_tab;
	if (old_tab) {
		Ext.getCmp('main-tabs').setActiveTab(old_tab);
	}
    },

    beforeDestroy : function() {
	log.debug("Destroy items ...")
	canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
        log.debug(this.id + " Destroyed.")
    }
});
