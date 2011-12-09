Ext.define('canopsis.lib.requestManager' ,{
	extend: 'Ext.util.TaskRunner',
	
	logAuthor : '[requestManager]',
	
	//constructor, because it's not a component
	constructor : function(){
		this.callParent(arguments);
		
		this.i = 0;
		this.step = 10;
		
		this.node_widgets = {};
		this.intervals_nodes = [];
		this.intervals = [];
		this.interval_max = 0;
		
		this.node_list = [];
		this.taskList = [];
	},
	
	register : function(widget,nodeId,interval){
		interval = Math.round(interval/10) * 10
		//log.debug('new interval : ' + interval, this.logAuthor)
		
		//search if interval already exist
		for (i in this.intervals){
			//log.debug('values in array', this.logAuthor)
			//log.dump(this.intervals[i])
			//log.dump(interval)
			//var exist = false
			if(this.intervals[i] == interval){
				var exist = true;
			}
		}
		if(!exist){
			this.intervals.push(interval)
			//this.intervals.sort()
			//log.debug('added new interval', this.logAuthor)
			//log.dump(this.intervals)
		}
		
		//add node id to interval
		if(this.intervals_nodes[interval]){
			//check if node already push in the interval
			var already_pushed = false;
			for (i in this.intervals_nodes[interval]){
				if(this.intervals_nodes[interval][i] == nodeId){
					already_pushed = true
				}
			}
			
			if(!already_pushed){
				this.intervals_nodes[interval].push(nodeId);
			}
		}else{
			this.intervals_nodes[interval] = [nodeId];
		}
		
		//add nodeId to nodeList
		this.node_list.push(nodeId);
		
		//log.debug('the intervals node', this.logAuthor);
		//log.dump(this.intervals_nodes);
		
		//add widget to node list
		if(this.node_widgets[nodeId]){
			this.node_widgets[nodeId].push(widget);
		} else {
			this.node_widgets[nodeId] = [widget];
		}
		//log.debug('the widget list', this.logAuthor);
		//log.dump(this.node_widgets)
		
		//log.debug('------------dump variables-----------', this.logAuthor)
		//log.dump(this.node_widgets)
		//log.dump(this.intervals_nodes)
		//log.dump(this.intervals)
		//log.debug('-------------end dump ---------------', this.logAuthor)

	},
	
	startTask : function(){
		this.i = 0;
		var gcd_values = [];
		
		//get max value
		for(i in this.intervals){
			gcd_values.push(this.intervals[i]);
			if(this.intervals[i] > this.interval_max){
				this.interval_max = this.intervals[i]
			}
		}
		//log.debug('--------StartTask max value----------', this.logAuthor)
		//log.dump(this.interval_max)
		
		//find the greatest common divisor
		this.step = find_gcd(gcd_values)
		//log.debug('the gcd is : ' + gcd)
		
		
		//building the task
		this.task = {
			run: this.do,
			interval: this.step * 1000,
			scope: this
		}
		
		//set first value of widget
		this.initializeWidgets();
		
		//if no registred widget, no task
		if (this.intervals.length != 0){
			this.start(this.task);
		}
	},
	
	//send ajax request and update widgets subscribed to this node
	sendRequest: function(nodeId){
		Ext.Ajax.request({
			url: '/rest/events/event/' + nodeId,
			scope: this,
			success: function(response){
				var data = Ext.JSON.decode(response.responseText)
				data = data.data[0]
				
				//give data to widgets
				for(index in this.node_widgets[data._id]){
					this.node_widgets[data._id][index].refreshData(data)
				}
			},
		});
	},
	
	do : function(){
		log.debug('ajax task woke up', this.logAuthor);
		var time = this.i * this.step
		//log.debug('refresh time is : ' + time);
		for(j in this.intervals_nodes){
			//log.debug('interval' + j)
			//log.dump(time % j)
			//if there's something to do at this time
			if((time % j) == 0){
				//for every nodes to refresh
				//log.debug('nodes to refresh are')
				//log.dump(this.intervals_nodes[j])
				for (y in this.intervals_nodes[j]){
					nodeId = this.intervals_nodes[j][y]
					//log.debug('node to refresh : ' + nodeId, this.logAuthor)

					this.sendRequest(nodeId)

					//log.debug('every nodeId');
					//log.dump(this.node_widgets)
					//log.dump(this.node_widgets[nodeId])
				}
			}
		}
		this.i++;
		if( time > this.interval_max){
			this.i = 0
		}
	},
	
	//fetch first values for widgets, called right after widget creation
	initializeWidgets: function(){
		for(i in this.node_list){
			this.sendRequest(this.node_list[i])
		}
	},
	
	stopTask : function(){
		log.debug('stop task', this.logAuthor)
		this.stop(this.task);
		this.i = 0;
	},
	
	pauseTask : function(){
		//log.debug('pause task', this.logAuthor)
		this.stop(this.task);
	},
	
	resumeTask : function(){
		//log.debug('resume task', this.logAuthor)
		this.start(this.task);
	},
	
});
