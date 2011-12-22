Ext.define('canopsis.view.ReportView', {
	extend:'canopsis.view.Tabs.Content',
	
	setContent : function(){
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
		
		this.layout.columns = nbColumns
		
		//---------------Adding presentation widget-------------------
		//get information
		var presentationData = [];
		presentationData['name'] = 'Canopsis';
		presentationData['startDate'] = Ext.Date.format(new Date(reportStart),'Y/m/d');
		presentationData['stopDate'] = Ext.Date.format(new Date(reportStop),'Y/m/d');
		
		//create tpl
		var presentationText = '<font size="9" face="verdana">      {name} reporting</font><br><br><center>From {startDate} to {stopDate}</center><br/><br/><br/>'
		var presentationTemplate = new Ext.Template(presentationText, {compiled: true})
		
		//create widget
		var presentationWidget = Ext.create('canopsis.lib.view.cwidget',{
			colspan : nbColumns,
		})
		this.add(presentationWidget);
		
		//setHtml
		presentationWidget.setHtmlTpl(presentationTemplate,presentationData);

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
			item['border'] = false
			
			//item['baseCls'] = 'x-plain'
			item['mytab'] = this

			item['reportMode'] = true;
				
			//Set default options
			if (! item.nodeId) { item.nodeId=nodeId}
			if (! item.refreshInterval) { item.refreshInterval=refreshInterval}
			
			//item.reportStartTs = this.reportStart
			//item.reportStopTs = this.reportStop
			item.reportMode = true

			this.add(item);
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
				item['border'] = false

				item['reportMode'] = true;
				
				log.debug('start timestamp is : ' + reportStart, this.logAuthor)
				log.debug('stop timestamp is : ' + reportStop, this.logAuthor)
				
				item.reportStart = reportStart
				item.reportStop = reportStop
				item.reportMode = true

				//Set default options
				if (! item.nodeId) { item.nodeId=nodeId}
				if (! item.refreshInterval) { item.refreshInterval=refreshInterval}
				if (! item.rowHeight) { item.height=rowHeight }else{ item.height=item.rowHeight }
				if (item.title){ item.border = true }

				this.add(item);
				log.debug(item);
			}
		}
	},
		
});
