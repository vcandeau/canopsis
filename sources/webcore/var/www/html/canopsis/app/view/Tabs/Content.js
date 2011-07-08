Ext.require([
    'Ext.direct.*',
]);

Ext.define('canopsis.view.Tabs.Content' ,{
	extend: 'Ext.container.Container',

    alias : 'widget.TabsContent', 
    
    //view: 'dashboard',
    
    fullmode: false,
    
    style: {borderWidth:'0px'},
	//height: '300px',
	layout: 'fit',
    
    initComponent: function() {
		log.debug("Create container '"+this.id+"'")
		var me = this;
		
		Ext.direct.Manager.addProvider({
			url: "/webservices/view/rpc",
			type: "remoting",
			actions:{
				view:[{
					name:"get_view",
					params:["view"]
				}]
			}
		});

		log.debug("Get view '"+this.view+"' from remote RPC ...")
		view.get_view({view: this.view},function(view_options){
			log.debug("View received, parse it ...")
			// Create Widgets
			//Parse Column
			log.debug(items)
			//items = new Array(items['items']);
			var items = view_options['items'];
			log.debug(items)
			nb_item = 0;
			for(var i= 0; i < items.length; i++) {
				log.debug("- Column "+i)
				//Parse Row
				for(var j= 0; j < items[i]['items'].length; j++) {
					log.debug("  - Row "+j)
					widget = 'canopsis.view.'+items[i]['items'][j]['widget']
					log.debug("     + Add: " + widget)
					
					var config = Ext.clone(items[i]['items'][j])
					
					//TODO !!!, find best height or store in view...
					//config['height'] = 300
					
					//log.debug(config)
					config['title'] = undefined
					
					items[i]['items'][j]['items'] = Ext.create(widget, config)
					
					//items[i]['items'][j]['items']['style'] = {borderWidth:'0px'},
					//items[i]['items'][j]['html'] = "<div id='HC'>Loading ...</div>"
					nb_item++;
				}
			}
			log.debug(nb_item + " items added, now show it")
			if (nb_item > 1){
				me.add({  items: Ext.create('canopsis.view.Dashboard.PortalPanel', {items: items}) });
			}else if(nb_item == 1){
				log.debug("Only one item, show it in full mode")
				me.add({  items: items[0]['items'][0]['items'] });
				this.fullmode == true
				//me.add({  items: Ext.create('Ext.panel.Panel', {items: items[0]['items'][0]['items'], style: {borderWidth:'0px'}}) });
			}
		});
		//this.nb_item = nb_item;
		this.callParent(arguments);
    },
    
    beforeDestroy : function() {
		//log.debug("Destroy tab '"+this.id+"' ...")
		//Ext.getCmp(id+'-tab').destroy();
		
		log.debug("Destroy items ...")
		this.removeAll(true)
		//log.debug(this.items)
		/*if (this.fullmode == true){
			log.debug("  Destroy ...")
			delete this.items[0]['items'][0]['items'];
		}else{
			for(var i= 0; i < this.items.length; i++) {
				log.debug("- Column "+i)
				
				for(var j= 0; j < this.items[i]['items'].length; j++) {
						log.debug("  - Row "+j)				
				}
			}
		}*/
		canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
        log.debug("Destroy container")
    }
});
