Ext.define('canopsis.lib.requestManager' ,{
	extend: 'Ext.util.TaskRunner',
	
	logAuthor : '[requestManager]',

	baseUri: '/rest/events/event/',
	
	use_liveEventStore: true,
	
	
	//constructor, because it's not a component
	constructor : function(){
		this.callParent(arguments);
		
		this.nb_widgets_registred = 0;
		
		this.node_widgets = {};
		this.intervals_nodes = {};
		this.intervals = [];
		this.interval_max = 0;
		
		this.node_list = [];
		this.taskList = [];
		
		if (this.use_liveEventStore){
			this.liveEventStore = Ext.getStore('LiveEvents')
			//bind to notification
			this.liveEventStore.on('add', function(){this.RefreshFromLiveEvent()},this)
		}
	
	},
	
	RefreshFromLiveEvent: function(){
		var newEventNode = this.liveEventStore.getAt(0).get('id');
		for(i in this.node_list){
			//log.debug(this.node_list[i] + ' and ' + newEventNode);
			if(this.node_list[i] == newEventNode){
				//if a widget have subscribed this node, refresh
				log.debug('state change, force widget refresh', this.logAuthor);
				this.sendRequest(newEventNode)
			}
		}
	},
	
	register : function(widget,nodeId,interval){
		log.debug('Widget added to requestManager list', this.logAuthor);
		interval = Math.round(interval/10) * 10

		//search if interval already exist
		if (this.intervals.indexOf(interval) < 0){
			this.intervals.push(interval)
		}

		//add node id to interval
		if(this.intervals_nodes[interval]){
			//check if node already push in the interval
			if (this.intervals_nodes[interval].indexOf(nodeId) < 0){
				this.intervals_nodes[interval].push(nodeId);
			}
		}else{
			this.intervals_nodes[interval] = [nodeId];
		}
		
		//add nodeId to nodeList
		if (this.node_list.indexOf(nodeId) < 0){
			this.node_list.push(nodeId);
		}
		
		//add widget to node list
		if(this.node_widgets[nodeId]){
			this.node_widgets[nodeId].push(widget);
		} else {
			this.node_widgets[nodeId] = [widget];
		}
		
		this.nb_widgets_registred++
	},
	
	
	//return 1 if task, 0 if no task
	startTask : function(){
		this.i = 1;
		var gcd_values = [];
		
		if(this.nb_widgets_registred != 0){
			//get max value
			for(i in this.intervals){
				gcd_values.push(this.intervals[i]);
				if(this.intervals[i] > this.interval_max){
					this.interval_max = this.intervals[i]
				}
			}			
			//find the greatest common divisor
			this.step = find_gcd(gcd_values)
			
			//building the task
			this.task = {
				run: this.ExecuteTask,
				interval: this.step * 1000,
				scope: this
			}
			
			//set first value of widget
			//this.initializeWidgets();

			log.debug("Refresh "+this.nb_widgets_registred+" widget(s) with step of "+this.step+" seconds", this.logAuthor)
			//log.dump(this.intervals)
			//log.dump(this.intervals_nodes)
			//log.dump(this.node_list)
			//log.dump(this.node_widgets)
			
			//if no registred widget, no task
			this.start(this.task);
			
			return true
		}else{
			return false
		}
	},
	
	//send ajax request and update widgets subscribed to this node
	sendRequest: function(nodeId){
		//log.debug('sendRequest for '+nodeId, this.logAuthor);
		Ext.Ajax.request({
			url: this.baseUri + nodeId,
			scope: this,
			success: function(response){
				var data = Ext.JSON.decode(response.responseText)
				data = data.data[0]
				var nodeId = data._id

				//give data to widgets
				for(index in this.node_widgets[nodeId]){
					var widget = this.node_widgets[nodeId][index]
					log.debug('     + refreshData ->' + widget.id, this.logAuthor);
					widget.refreshData(data)
				}
			},
		});
	},
	
	ExecuteTask : function(){
		var time = this.i * this.step
		log.debug('ajax task woke up ' + time, this.logAuthor);

		for(j in this.intervals_nodes){
			//if there's something to do at this time
			///// TODO BUGGG
			if((time % j) == 0){
				//for every nodes to refresh
				for (y in this.intervals_nodes[j]){
					nodeId = this.intervals_nodes[j][y]
					log.debug('   + ['+j+'] Refresh ' + nodeId, this.logAuthor);
					this.sendRequest(nodeId)
				}
			}
		}
		
		if( time >= this.interval_max){
			this.i = 1
		}else{
			this.i++;
		}
	},
	
	//fetch first values for widgets, called right after widget creation
	initializeWidgets: function(){
		for(i in this.node_list){
			this.sendRequest(this.node_list[i])
		}
	},
	
	stopTask : function(){
		if(this.nb_widgets_registred != 0){
			log.debug('stop task', this.logAuthor)
			this.stop(this.task);
			this.i = 0;
		}
	},
	
	pauseTask : function(){
		if(this.nb_widgets_registred != 0){
			//log.debug('pause task', this.logAuthor)
			this.stop(this.task);
		}
	},
	
	resumeTask : function(){
		if(this.nb_widgets_registred != 0){
			//log.debug('resume task', this.logAuthor)
			this.start(this.task);
		}
	},
	
});
