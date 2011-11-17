Ext.define('canopsis.controller.Notify', {
    extend: 'Ext.app.Controller',

    opacity: 0.8,
    history: false,
    views: [],

    init: function() {
	this.getController('WebSocket').on('message', function(ws, evt, data) {
		
		var type = undefined;
		var icon = undefined;
		var title = data['source_name'] + " > " + data['source_type']  + " > " +  data['host_name'];
		var message = data['output'];

		if (data['service_description']) {
			title = title + " > " + data['service_description']
		}

		if (data['state'] == 0){
			icon = 'ui-icon ui-icon-check'
		}else if (data['state'] == 1) {
			icon = 'ui-icon ui-icon-alert'
		}else if (data['state'] == 2){
			type = 'error'
		}

		this.notify(title, message, type, icon);
	}, this);

    },

    notify: function(title, text, type, icon){
	$.pnotify({
		pnotify_title: title,
		pnotify_text: text,
		pnotify_type: type,
		pnotify_history: this.history,
		pnotify_notice_icon: icon,
		pnotify_opacity: this.opacity,
	});
   }
});
