var log = {
	/* 0: none, 1: error, 2: error + warning, 3:  error + warning + debug*/
	level: 3,
	debug: function (msg) {
		if (this.level >= 3){
			msg = "DEBUG "+msg
			this.writeMsg(msg)
		}
	},
	warning: function (msg) {
		if (this.level >= 2){
			msg = "WARNING "+msg
			this.writeMsg(msg)
		}
	},
	error: function (msg) {
		if (this.level >= 1){
			msg = "ERROR "+msg
			this.writeMsg(msg)
		}
	},
	writeMsg: function (msg) {
		if (Ext.isDefined(console.log)){
				console.log(msg)
		}
	}
}
