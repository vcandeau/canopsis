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
		/*
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
		*/
		
		//-------------------page height-----------------------
		
		var docHeight = Math.ceil(items.length / nbColumns) * 200 +100
	/*	if(docHeight < 1200){
			document.body.style.height = 1200
		}else{*/
			document.body.style.height = docHeight
		//}
		//this.height = docHeight
		//this.width = 840
		
		/*
		var page_height = 900;
		var widget_per_page = 12;
		var nb_page = items.length / 12
		
		if(nb_page > 1){
			nb_page = Math.ceil(nb_page)
			document.body.style.height = Math.ceil(items.length / nbColumns) * 200 
		} 
		
		/*
		//var widget_per_page= Math.round(page_height / rowHeight);
		this.height = 8000
		//this.height = Math.ceil(items.length / nbColumns) * 200
		log.debug('----------------------------------------------------------------------')
		log.dump(this.height)
		log.debug('----------------------------------------------------------------------')
		*/
		
		//-----------------populating with widgets--------------
		//fixing layout (table goes wild without it)
	/*	for (i; i<nbColumns; i++){
			this.add({ html: '', border: 0, height: 0, padding:0})
		}*/
		

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
			item['exportMode'] = true;
			
			//log.debug('start timestamp is : ' + export_from, this.logAuthor)
			//log.debug('stop timestamp is : ' + export_to, this.logAuthor)
			
			item.export_from = export_from
			item.export_to = export_to

			//Set default options
			if (! item.nodeId) { item.nodeId=nodeId}
			if (! item.refreshInterval) { item.refreshInterval=refreshInterval}
			if (! item.rowHeight) { item.height=rowHeight }else{ item.height=item.rowHeight }
			if (item.title){ item.border = true }

			this.add(item);
			//log.debug(item);
		}
	},
		
});
