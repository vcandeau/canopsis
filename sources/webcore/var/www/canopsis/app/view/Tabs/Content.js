//Ext.require([
//    'Ext.direct.*',
//]);

Ext.define('canopsis.view.Tabs.Content' ,{
    extend: 'Ext.Panel',
    alias : 'widget.TabsContent', 
    
    style: {borderWidth:'0px'},

	autoScroll: true,

	layout: {
		type: 'table',
		// The total column count must be specified here
		columns: 1,
		/*tableAttrs: {
			style: {
				width: '100%',
            		}
		},*/
	},

	defaults: {
		border: false,
		/*style: {
	            padding: '3px',
	        }*/
	},

	border: false,

	items: [],
    
    initComponent: function() {
		this.on('beforeclose', this.beforeclose)
		this.callParent(arguments);
		log.dump("Get view '"+this.view_id+"' ...")
		Ext.Ajax.request({
			url: '/rest/object/view/'+this.view_id,
			scope: this,
			success: function(response){
				data = Ext.JSON.decode(response.responseText)
				this.view = data.data[0]
				this.setContent()
			},
			failure: function (result, request) {
					log.error("Ajax request failed ... ("+request.url+")")
			} 
		});		
    },

    setContent: function(){
		
		var items = this.view.items
		var totalWidth = this.getWidth() - 20

		//General options
		var nodeId = this.view.nodeId
		var refreshInterval = this.view.refreshInterval
		var nbColumns = this.view.nbColumns
		var rowHeight = this.view.rowHeight

		if (! rowHeight) { rowHeight = 200 }
		if (! refreshInterval) { refreshInterval = 0 }
		if (! nbColumns) { nbColumns = 1 }

		this.layout.columns = nbColumns

		log.debug('Create '+nbColumns+' column(s)..')

		if (items.length == 1 && nbColumns == 1) {
			log.debug(' + Use full mode ...')
			this.layout = 'fit'
			item = items[0]
			//item['height'] = '10'
			item['width'] = '100%'
			item['title'] = ''
			
			//item['baseCls'] = 'x-plain'
			item['mytab'] = this

			//Set default options
			if (! item.nodeId) { item.nodeId=nodeId}
			if (! item.refreshInterval) { item.refreshInterval=refreshInterval}

			this.add(item)
		}else{

			this.removeAll();

			//fixing layout (table goes wild without it)
			for (i; i<nbColumns; i++){
				this.add({ html: '', border: 0, height: 0, padding:0})
			}
	
			var ext_items = []
			for(var i= 0; i < items.length; i++) {
				log.debug(' - Item '+i+':')
				var item = items[i]

				item['mytab'] = this

				var colspan = 1
				var rowspan = 1

				if (item['colspan']) { colspan = item['colspan'] }
				if (item['rowspan']) { rowspan = item['rowspan'] }
				
				item['width'] = (totalWidth / nbColumns) * colspan

				item['style'] = {padding: '3px'}

				//Set default options
				if (! item.nodeId) { item.nodeId=nodeId}
				if (! item.refreshInterval) { item.refreshInterval=refreshInterval}
				if (! item.rowHeight) { item.height=rowHeight }else{ item.height=item.rowHeight }

				this.add(item)
	
			}
		}
    },
    
    beforeclose: function(tab, object){
	console.log('[view][tabs][content] - Active previous tab');
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
