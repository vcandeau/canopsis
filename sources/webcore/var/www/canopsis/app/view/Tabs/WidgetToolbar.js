Ext.define('canopsis.view.Tabs.WidgetToolbar' ,{
	extend: 'canopsis.lib.view.ctoolbar',
	
	title : 'View edition toolbar',
	width:500,
	
	initComponent: function() {
		this.callParent(arguments);

		if(this.jqgridable){
			this.jqgridable.pause_widgets()
			this.jqgridable._toggle_grid()
			this.jqgridable._toggle_draggable_mode()
			this.jqgridable._toggle_resizable_mode()
			this.jqgridable._toggle_selectable_mode()
		}
		
		//------------------------------Building toolbar----------------------------
		var addRowButton = Ext.create('Ext.button.Button',{text:'addRow'})
		addRowButton.on('click',function(){this.jqgridable.add_row()},this)
		
		var addColumnButton = Ext.create('Ext.button.Button',{text:'addColumn'})
		addColumnButton.on('click',function(){this.jqgridable.add_column()},this)


		var saveButton = Ext.create('Ext.button.Button',{text:'save'})
		saveButton.on('click', function(){
			this.saveView()
		},this)
		
		this.nameArea = Ext.create('Ext.form.TextField',{fieldLabel : _("View's name"), name: 'viewName',forceSelection : true})
		if(this.view_name){
			this.nameArea.setValue(this.view_name)
			this.nameArea.setDisabled(true)
		}
		
		
		this.add([saveButton,addRowButton,addColumnButton,'|',this.nameArea])
	
		this.show()
		
		//---------------------------Binding events--------------------------------
		this.jqgridable.on('widgetAdd',function(id){this.openWidgetWizard(id)},this)
		this.jqgridable.on('widgetDblclick',function(widget){this.editWidgetWizard(widget)},this)
	},
	
	openWidgetWizard :function(id){
		this.widgetWizard = Ext.create('canopsis.view.ViewBuilder.wizard')
		this.widgetWizard.show()
		//log.debug('widget id : ' + id)
		this.bindFinishButton(this.widgetWizard, id)
	},
	
	editWidgetWizard : function(widget){
		var id = $(widget).attr('id')
		var data = this.jqgridable.get_data(id)
		
		this.widgetWizard = Ext.create('canopsis.view.ViewBuilder.wizard',{edit: true,widgetData : data})
		this.widgetWizard.show()

		this.bindFinishButton(this.widgetWizard, id)
	},
	
	bindFinishButton : function(window, id){
		var finishButton = window.down('[action=finish]')
		finishButton.on('click', function(){
				var new_data = window.get_variables()
				this.jqgridable.set_data(id,new_data)
				window.destroy()
			},this)
	},
	
	saveView : function(){
		//--------------------------fetch data-------------------------------------
		var dump = this.jqgridable._dump()
		var store = Ext.data.StoreManager.lookup('View')
		var record = Ext.create('canopsis.model.view', data);
		var viewName = this.nameArea.getValue()
		var widget_list = []
		
		//----------------------------cleaning widgets-----------------------------
		for(var i in dump){
			var widget= {}
			var widgetData = dump[i].data
			
			//load widget skel
			var widgetAttrTpl = this._get_widget_attribute(dump[i].data.xtype)
			widgetAttrTpl.push('title','xtype','refreshInterval','nodeId')
			
			//delete jquery junk information
			for(var j in widgetData){
				if(widgetAttrTpl.indexOf(j) == -1){
					delete widgetData[j]
				}
			}
			
			//rebuild widget
			widget.position = dump[i].position
			widget.id = dump[i].id
			widget.data = widgetData
			widget_list.push(widget)
		}
		
		//--------------------------record building------------------------
		record.set('items',widget_list)
		record.set('crecord_name',viewName); ////!!!!!!!!!!!!REMIND , MANAGE WHEN ROOT EDIT NON ROOT VIEW!!!!!!!!!!
		record.set('id','view.'+ global.account.user + '.' + viewName.replace(/ /g,"_"))


		//------------------------------add put----------------------------
		store.add(record)
		this.close();
		this.fireEvent('viewSaved')
	},
	
	_get_widget_attribute : function(widget){
		var widgetStore = Ext.data.StoreManager.lookup('Widget')
		var output = []

		var _index = widgetStore.findBy(
		function(record, id){
			if(record.get('xtype') == widget){
				return true
			}
		}, this)
		log.debug(_index)
		log.debug(widget)
		//if(_index != -1){
		var attr_list = widgetStore.getAt(_index).get('options')
		
		for(var i in attr_list){
			if(attr_list[i].name){
				output.push(attr_list[i].name)
			}
		}
		return output		
	},

})
