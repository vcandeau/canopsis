//Ext.require([
//    'Ext.direct.*',
//]);

Ext.define('canopsis.view.Tabs.Content' ,{
 //   extend: 'Ext.container.Container',
    extend: 'Ext.Panel',
    //extend: 'Ext.panel.Table',
    alias : 'widget.TabsContent', 
    
    style: {borderWidth:'0px'},

	autoScroll: true,

	layout: {
		type: 'table',
		// The total column count must be specified here
		columns: 0,
		tableAttrs: {
			style: {
				width: '100%',
            		}
		},
		tdAttrs: {
			style: {
	        		//padding: '3px',
				width: 10
       			}
		},
	},


	items: [],
    
    initComponent: function() {
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
		var nb_column = this.view.column
		var lines = this.view.lines
		var hunit = this.view.hunit
		var totalWidth = this.getWidth() - 20

		if (! hunit) { hunit = 200 }
		if (! nb_column) { nb_column = 1 }

		//this.layout.tdAttrs.width = 100/nb_column + '%'
		this.layout.columns = nb_column

		log.debug('Create '+nb_column+' column(s)..')

		if (lines.length == 1 && nb_column == 1) {
			log.debug(' + Use full mode ...')
			item = lines[0]
			item['height'] = '100%'
			item['width'] = '100%'
			item['title'] = ''
			item['border'] = 0

			//item['baseCls'] = 'x-plain'
			item['mytab'] = this

			this.add(item)
		}else{

			this.removeAll();
	
			var ext_items = []
			for(var i= 0; i < lines.length; i++) {
				log.debug(' - Item '+i+':')
				var item = lines[i]

				item['mytab'] = this
				item['tile'] = ''

				var colspan = 1
				var rowspan = 1
				var height = hunit

				if (item['height'])  { height = item['height'] }
				if (item['colspan']) { colspan = item['colspan'] }
				if (item['rowspan']) { rowspan = item['rowspan'] }
				
				//item['height'] = rowspan * hunit
				
				item['height'] = height
				item['width'] = ((100/nb_column) * colspan)/100 * totalWidth
				item['border'] = 0
	
				this.add(item)
	
			}
		}
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
