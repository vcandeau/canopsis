Ext.define('canopsis.view.Widgets.HCPieAvailServices' ,{
	extend: 'Ext.panel.Panel',
    chart: false,
    layout: "fit",
    nb_layout: 0,
    task: undefined,
    colors: {
		up: '#50b432',
		down: '#ed241b',
		unreachable: '#f0f0ff',
		ok : '#50b432',
		warning: '#ed941b',
		critical: '#ed241b',
		unknown: '#f0f0ff' 
	},
        
	initComponent: function() {
		Ext.apply(this, {
			html: "<center><div id='html-"+this.id+"'>Loading ...</div></center>",
		});
		
		if (! Ext.isDefined(this.showInLegend)){
			this.showInLegend = true
		}

		this.callParent(arguments);
	},
	
	afterLayout: function() {
	var me = this
	this.nb_layout++
	if (this.nb_layout == 2) {

		this.chart_options = {
                                        chart: {
                                                renderTo: "html-"+this.id,
                                                height: this.height - 30,
                                                width: this.width,
                                                plotBackgroundColor: null,
                                                plotBorderWidth: null,
                                                plotShadow: false,
                                        },
										title: {
                                                text: null
                                        },
                                        tooltip: {
                                                formatter: function() {
                                                        return '<b>'+ this.point.name +'</b>: '+ this.y +' %';
                                                }
                                        },
                                        plotOptions: {
                                                pie: {
                                                        allowPointSelect: true,
                                                        cursor: 'pointer',
														dataLabels: {
																enabled: false
														},
														showInLegend: this.showInLegend
                                                },
                                                color: '#FF0000',
                                        },
                                    series: [{
                                                type: 'pie',
                                                name: 'Browser share',
                                                data: [],
                                                /*data: [
                                                        ['Firefox',   45.0],
                                                        ['IE',       26.8],
                                                        {
                                                                name: 'Chrome',    
                                                                y: 12.8,
                                                                sliced: true,
                                                              selected: true
                                                        },
                                                        ['Safari',    8.5],
                                                        ['Opera',     6.2],
                                                        ['Others',   0.7]
                                                ]*/
                                        }]
                                };
		}
		
		if (this.nb_layout == 2){
			this.chart = new Highcharts.Chart(this.chart_options)
			//this.refreshStore()
			if (this.refreshInterval !=0) {
				this.task = {
					run: me.refreshStore,
					scope: me,
					interval: me.refreshInterval * 1000
				}
				log.debug("Start auto refresh task")
				Ext.TaskManager.start(this.task);
			}
		}
		
		return this.callParent(arguments);
	},
	
	refreshStore: function() {
		log.debug("Refresh store")
		var me = this
		Ext.Ajax.request({
				url: '/webservices/availability/'+me.selector,
				/*params: {
					id: 1
				},*/
				success: function(response){
					//log.debug(response.responseText);
					data = Ext.JSON.decode(response.responseText)
					var hcdata = []
					for(var i= 0; i < data[1].length; i++) {
						var part = data[1][i]

						hcdata.push({name: part[0], y: part[1], color: me.colors[part[0]]})
					};
					me.chart.series[0].setData(hcdata)
				}
			});
	},
	
	beforeDestroy : function() {
		log.debug("Destroy 'canopsis.view.Widgets.HCPieAvailServices'")
		if (this.task) {
			log.debug("Stop auto refresh task")
			Ext.TaskManager.stop(this.task);
		}
		canopsis.view.Widgets.HCPieAvailServices.superclass.beforeDestroy.call(this);
    }
	
});
