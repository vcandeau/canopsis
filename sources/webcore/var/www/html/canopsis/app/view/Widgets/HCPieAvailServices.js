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
		//alert('tit')
	this.nb_layout++
	if (this.nb_layout == 2) {

	this.chart = new Highcharts.Chart({
                                        chart: {
                                                renderTo: 'HC',
                                                height: '290',
                                                plotBackgroundColor: null,
                                                plotBorderWidth: null,
                                                plotShadow: false
                                        },
                                        title: {
                                                text: 'Browser market shares at a specific website, 2010'
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
                                                                enabled: true,
                                                                color: '#000000',
                                                                connectorColor: '#000000',
                                                                formatter: function() {
                                                                        return '<b>'+ this.point.name +'</b>: '+ this.y +' %';
                                                                }
                                                        }
                                                }
                                        },
                                    series: [{
                                                type: 'pie',
                                                name: 'Browser share',
                                                data: [
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
                                                ]
                                        }]
                                });
		}

		return this.callParent(arguments);
	}
});
