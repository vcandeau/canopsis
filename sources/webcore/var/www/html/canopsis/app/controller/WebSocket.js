Ext.define('canopsis.controller.WebSocket', {
    extend: 'Ext.app.Controller',

    views: [],
    stores: [],

    autoconnect: true,
    ws_enable: true,
    ws_url: 'ws://192.168.3.56:8090/',
    open: false,
    ws: false,

    init: function() {
	if (!window.WebSocket) {
		if (window.MozWebSocket) {
			window.WebSocket = window.MozWebSocket;
		} else {
			ws_enable = false;
		}
	}

	if (this.autoconnect){
		this.connect();
	}
    },

    connect: function() {
	if (this.ws_enable) {
		log.debug("Connect to websocket ...")
		this.ws = new WebSocket(this.ws_url);
		this.ws.extctrl = this
		this.ws.onopen = this.ws_onopen;
		this.ws.onclose = this.ws_onclose;
		this.ws.onmessage = this.ws_onmessage;
	}
    },

    ws_onopen: function(evt) {
	log.debug("Websocket Connected.")
	this.open = true;
	this.extctrl.fireEvent('onopen', this, evt);
    },
    ws_onclose: function(evt) {
	log.debug("Websocket Closed.")
	this.open = false;
	this.extctrl.fireEvent('onclose', this, evt);
    },
    ws_onmessage: function(evt) {
	//log.debug("New message from Websocket ...")
	this.extctrl.fireEvent('onmessage', this, evt);
    },

});
