Ext.define('canopsis.controller.Reporting', {
	extend: 'Ext.app.Controller',
	
	views: [],
	
	logAuthor : '[controller][Reporting]',
	
	init: function() {
		log.debug('Initialize ...', this.logAuthor);
		this.callParent(arguments);
	},
		
	launchReport: function(view_id, from, to,mail){
		log.debug('Launch Report on view '+ view_id , this.logAuthor);
		
		//if no date given
		if(to == undefined){
			to = Date.now() 
			from = to - (global.commonTs.day*1000)
		}
		
		global.notify.notify(_('Please Wait'),_('Your document is rendering, a popup will ask you where to save in few seconds'))
	
		var url = '/reporting/'+ from  + '/' + to  + '/' + view_id
		
		if(mail != undefined){
			url += '/' + mail
		}

		Ext.Ajax.request({
			url: url,
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
				global.notify.notify(_('Failed'),_('The report generation have failed'),'error')
				log.error("Report generation have failed", this.logAuthor)
			} 
		});
	},
	
	downloadReport : function(id){
		url = location.protocol + '//' + location.host + '/getReport/' + id
		window.open(url,'_newtab');
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
