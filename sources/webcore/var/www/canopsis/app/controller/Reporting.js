Ext.define('canopsis.controller.Reporting', {
	extend: 'Ext.app.Controller',
	
	views: [],
	
	logAuthor : '[controller][Reporting]',
	
	init: function() {
		log.debug('Initialize ...', this.logAuthor);
		this.callParent(arguments);
	},
		
	launchReport: function(view_id, from, to){
		log.debug('Launch Report on view '+ view_id , this.logAuthor);
		
		//if no date given
		if(to == undefined){
			to = Date.now() 
			from = (to - global.commonTs.day)
		}
		
		global.notify.notify(_('Please Wait'),_('Your document is rendering, a popup will ask you where to save in few seconds'))

		Ext.Ajax.request({
			url: '/reporting/'+ from  + '/' + to  + '/' + view_id,
			scope: this,
			success: function(response){
				var data = Ext.JSON.decode(response.responseText)
				log.dump(data)
				if(data.success == true){
					data = data.data.url
					global.notify.notify(
						_('Export ready'),
						_('You can get your document') + ' <a href="' + location.protocol + '//' + location.host + data + '"  target="_blank">' + _('here') + '</a>',
						undefined,
						undefined,
						false
					)
				}else{
					global.notify.notify('Failed','The report generation have failed','error')
					log.error("Report generation have failed", this.logAuthor)
				}
			},
			failure: function (result, request) {
				global.notify.notify('Failed','The report generation have failed','error')
				log.error("Report generation have failed", this.logAuthor)
			} 
		});
	},
	
	openHtmlReport : function(view, from, to){
		log.debug('Open html report : '+ view , this.logAuthor);
		var url = Ext.String.format('reporting.html?view={0}&from={1}&to={2}',
		view,
		from,
		to)
		log.debug('url is : ' + url)
		window.open(url,'_newtab')
	}
})
