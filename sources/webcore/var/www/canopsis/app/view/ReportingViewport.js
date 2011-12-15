Ext.define('canopsis.view.ReportingViewport', {
	extend: 'Ext.container.Viewport',

	requires: [
		'Ext.layout.container.Border',
		'Ext.tab.Panel'
	],

	layout: 'fit',
	
	id : 'Reporting',

	items: [],
	
	width : 500,
	
	initComponent: function() {
		
		log.debug("Render reporting viewport ...", 'Reporting Viewport');
		this.on('afterrender', this.afterrender, this)
		this.callParent(arguments);
		
		//Ext.getCmp('Reporting').on('afterrender',this.doReport('view.root.test'))
		
		this.logAuthor = 'Reporting Viewport'
		
		//---------set content of Reporting-------
		this.content = this.add({
			style: {borderWidth:'0px'},
			layout: {
				type: 'table',
				columns: 1,
			},
			defaults: {
				border: false,
			},
			border: false,
			displayed: false,
			items: [],
			
		})
		
		this.widgets = []
		
		//this.view_id = parseUri(window.location).viewName
		
		if(reporting_view_id){
			this.view_id = reporting_view_id
		
		
			//-------------------get view---------------
			Ext.Ajax.request({
				url: '/rest/object/view/'+this.view_id,
				scope: this,
				success: function(response){
					data = Ext.JSON.decode(response.responseText)
					this.view = data.data[0]
					this.setContent()
				},
				failure: function (result, request) {
						log.error("Ajax request failed ... ("+request.url+")", this.logAuthor)
				}
			})
		} else {
			log.debug('no view id for reporting specified (set variable reporting_view_id with wkhtmltopdf)', this.logAuthor)
		}
	},
	
	setContent : function(content){
		//----------------Setting globals options----------------
		var items = this.view.items;
		var totalWidth = this.getWidth() - 20;
		var nodeId = this.view.nodeId;
		var refreshInterval = this.view.refreshInterval
		var nbColumns = this.view.nbColumns
		var rowHeight = this.view.rowHeight
		
		if (! rowHeight) { rowHeight = 200 }
		if (! refreshInterval) { refreshInterval = 0 }
		if (! nbColumns || items.length == 1) { nbColumns = 1 }
		
		this.content.layout.columns = nbColumns

		//-----------------populating with widgets--------------
		if (items.length == 1 ) {
			//one widget, so full mode
			log.debug(' + Use full mode ...', this.logAuthor)
			this.layout = 'fit'
			item = items[0]

			log.debug('   + Add: '+item.xtype, this.logAuthor)

			//item['height'] = '10'
			item['width'] = '100%'
			item['title'] = ''
			item['fullmode'] = true
			
			//item['baseCls'] = 'x-plain'
			item['mytab'] = this

			item['reportMode'] = true;
				
			//Set default options
			if (! item.nodeId) { item.nodeId=nodeId}
			if (! item.refreshInterval) { item.refreshInterval=refreshInterval}
			
			var widget = this.content.add(item);
			this.widgets.push(widget)

		}else{
			//many widgets
			//this.removeAll();

			//fixing layout (table goes wild without it)
			for (i; i<nbColumns; i++){
				this.add({ html: '', border: 0, height: 0, padding:0})
			}
	
			var ext_items = []
			for(var i= 0; i < items.length; i++) {
				log.debug(' - Item '+i+':', this.logAuthor)
				var item = items[i]

				log.debug('   + Add: '+item.xtype, this.logAuthor)

				item['mytab'] = this
				item['fullmode'] = false

				var colspan = 1
				var rowspan = 1

				if (item['colspan']) { colspan = item['colspan'] }
				if (item['rowspan']) { rowspan = item['rowspan'] }
				
				item['width'] = (totalWidth / nbColumns) * colspan

				item['style'] = {padding: '3px'}
				
				item['reportMode'] = true;

				//Set default options
				if (! item.nodeId) { item.nodeId=nodeId}
				if (! item.refreshInterval) { item.refreshInterval=refreshInterval}
				if (! item.rowHeight) { item.height=rowHeight }else{ item.height=item.rowHeight }
				if (item.title){ item.border = true }

				var widget = this.content.add(item);
				this.widgets.push(widget)
			}
		}
		log.debug('------------------------------all is done----------------------')
	},

	doReport : function(view_id){
		//-------------------get view---------------
		Ext.Ajax.request({
			url: '/rest/object/view/'+view_id,
			scope: this,
			success: function(response){
				data = Ext.JSON.decode(response.responseText)
				this.view = data.data[0]
				this.setContent()
			},
			failure: function (result, request) {
					log.error("Ajax request failed ... ("+request.url+")", this.logAuthor)
			}
		})
	},

	afterrender: function(){
		log.debug("Reporting Viewport rendered", this.author);
		//this.doReport('view.root.test')
	}
		
});
