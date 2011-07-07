    var generateData = function(n, floor){
        var data = [],
            p = (Math.random() *  11) + 1,
            i;
            
        floor = (!floor && floor !== 0)? 20 : floor;
        
        for (i = 0; i < (n || 12); i++) {
            data.push({
                name: Ext.Date.monthNames[i % 12],
                data1: Math.floor(Math.max((Math.random() * 100), floor)),
                data2: Math.floor(Math.max((Math.random() * 100), floor)),
                data3: Math.floor(Math.max((Math.random() * 100), floor)),
                data4: Math.floor(Math.max((Math.random() * 100), floor)),
                data5: Math.floor(Math.max((Math.random() * 100), floor)),
                data6: Math.floor(Math.max((Math.random() * 100), floor)),
                data7: Math.floor(Math.max((Math.random() * 100), floor)),
                data8: Math.floor(Math.max((Math.random() * 100), floor)),
                data9: Math.floor(Math.max((Math.random() * 100), floor))
            });
        }
        return data;
    };

    var store1 = Ext.create('Ext.data.JsonStore', {
        fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5', 'data6', 'data7', 'data9', 'data9'],
        data: generateData()
    });

store1.loadData(generateData(6, 20));

Ext.define('canopsis.view.Widgets.PieAvailServices' ,{
	extend: 'Ext.panel.Panel',
	
 //items: Ext.create('widget.panel', {
        width: '100%',
        height: '100%',
        //title: 'Semester Trends',
        //renderTo: Ext.getBody(),
        layout: 'fit',
        tbar: [{
            text: 'Reload Data',
            handler: function() {
                store1.loadData(generateData(6, 20));
            }
        }, {
            enableToggle: true,
            pressed: false,
            text: 'Donut',
            toggleHandler: function(btn, pressed) {
                var chart = Ext.getCmp('chartCmp');
                chart.series.first().donut = pressed ? 35 : false;
                chart.refresh();
            }
        }],
        items: {
            xtype: 'chart',
            id: 'chartCmp',
            animate: false,
            store: store1,
            shadow: true,
            legend: {
                position: 'right'
            },
            insetPadding: 30,
            theme: 'Base:gradients',
            series: [{
                type: 'pie',
                field: 'data1',
                showInLegend: true,
                donut: false,
                tips: {
                  trackMouse: true,
                  width: 140,
                  height: 28,
                  renderer: function(storeItem, item) {
                    //calculate percentage.
                    var total = 0;
                    store1.each(function(rec) {
                        total += rec.get('data1');
                    });
                    this.setTitle(storeItem.get('name') + ': ' + Math.round(storeItem.get('data1') / total * 100) + '%');
                  }
                },
                highlight: {
                  segment: {
                    margin: 20
                  }
                },
                label: {
                    field: 'name',
                    display: 'rotate',
                    contrast: true,
                    font: '12px Arial'
                }
            }]
        },
	//}),
                      
	initComponent: function() {
	
		this.callParent(arguments);
	}
});
