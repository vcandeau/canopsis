Ext.define('canopsis.view.Widgets.HCPieAvailServices' ,{
	extend: 'Ext.panel.Panel',
    chart: false,
    layout: "fit",
    nb_layout: 0,
        
	initComponent: function() {
		Ext.apply(this, {
			html: "<div id='HC'>Loading ...</div>",
		});
		
		this.callParent(arguments);
	},
	
	afterLayout: function() {
	var me = this
	this.nb_layout++
	if (this.nb_layout == 2) {

		this.chart_options = {
                                        chart: {
                                                renderTo: 'HC',
                                                height: this.height - 30,
                                                plotBackgroundColor: null,
                                                plotBorderWidth: null,
                                                plotShadow: false
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
														showInLegend: true
                                                }
                                        },
                                    series: [{
                                                type: 'pie',
                                                name: 'Browser share',
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
			Ext.Ajax.request({
				url: '/webservices/availability/'+me.selector,
				/*params: {
					id: 1
				},*/
				success: function(response){
					//console.log(response.responseText);
				
					me.data = Ext.JSON.decode(response.responseText)
					me.chart_options.series[0].data = me.data[1]
					me.chart = new Highcharts.Chart(me.chart_options)
				}
			});
		}
		
		return this.callParent(arguments);
	}
});
