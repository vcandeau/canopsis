Ext.define('canopsis.lib.view.cwidget' ,{
	extend: 'Ext.panel.Panel',

	border: false,
	layout : 'fit',
	nodeId_refresh: true,
	nodeData: {},

	defaultHtml: '<center><span class="icon icon-loading" /></center>',

	refreshInterval: 0,
	baseUrl: '/rest/inventory/event/',
	
	logAuthor: '[view][cwidget]',

	initComponent: function() {
		log.debug('InitComponent '+this.id, this.logAuthor)

		if (this.title == ''){
			this.title = false;
		}

		this.divHeight = this.height
		if (this.title) {
			this.divHeight = this.height - 30
		}

		this.divId = this.id+"-content"
		this.items = [{html: "<div id='"+this.divId+"'>" + this.defaultHtml + "</div>", border: false}]

		this.callParent(arguments);


		if (this.refreshInterval > 0){

			log.debug('Set refresh Interval to ' + this.refreshInterval + ' seconds', this.logAuthor)

			this.task = {
				run: this.doRefresh,
				scope: this,
				interval: this.refreshInterval * 1000
			}
			Ext.TaskManager.start(this.task);

			if (this.mytab){
				this.mytab.on('show', function(){
					Ext.TaskManager.start(this.task);
				}, this);
				this.mytab.on('hide', function(){
					Ext.TaskManager.stop(this.task);
				}, this);
			}

		}else{
			this.doRefresh()
		}
			
	},

	doRefresh: function (){
		log.debug('doRefresh', this.logAuthor)
		if (this.nodeId) {
			if (this.nodeId_refresh){
				//this.setLoading(true)
				log.debug('doRefresh: get informations of ' + this.nodeId, this.logAuthor)
				Ext.Ajax.request({
					url: this.baseUrl + this.nodeId,
					scope: this,
					success: function(response){
						var data = Ext.JSON.decode(response.responseText)
						data = data.data[0]
						//this.setLoading(false)
						this.nodeData = data
						this.onRefresh(data)
					},
					failure: function ( result, request) {
						log.debug('Ajax request failed', this.logAuthor)
						//this.setLoading(false)
					} 
				})
			}else{
				this.onRefresh(this.nodeData)
			}
		}else{
			this.on('render', this.onRefresh(), this);
		}

	},

	onRefresh: function(data){},

	setHtml: function(html){
		log.debug('setHtml in widget', this.logAuthor)
		this.removeAll()
		this.add({html: html, border: false})
		this.doLayout();
	},

	setHtmlTpl: function(tpl, data){
		log.debug('setHtmlTpl in div '+this.divId, this.logAuthor)
		tpl.overwrite(this.divId, data)
	},
});
