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
		
		to = Date.now() / 1000
		from = to - global.commonTs.day
		
		global.notify.notify(_('Please Wait'),_('Your document is rendering, a popup will ask you where to save in few seconds'))

		Ext.Ajax.request({
			url: '/reporting/'+ from * 1000 + '/' + to * 1000 + '/' + view_id,
			scope: this,
			success: function(response){
				var data = Ext.JSON.decode(response.responseText)
				data = data.data.url
				global.notify.notify(
					_('Export ready'),
					_('You can get your document') + ' <a href="' + location.protocol + '//' + location.host + data + '"  target="_blank">' + _('here') + '</a>',
					undefined,
					undefined,
					false
				)
			},
			failure: function (result, request) {
				log.error("Report generation have failed", this.logAuthor)
			} 
		});
	},
	
	
})
