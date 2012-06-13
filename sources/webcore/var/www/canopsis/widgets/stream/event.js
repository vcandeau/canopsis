/*
#--------------------------------
# Copyright (c) 2011 "Capensis" [http://www.capensis.com]
#
# This file is part of Canopsis.
#
# Canopsis is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Canopsis is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Canopsis.  If not, see <http://www.gnu.org/licenses/>.
# ---------------------------------
*/

widget_stream_event_template =  Ext.create('Ext.XTemplate',
		'<tpl if="referer">',
			"<div class='separator-top'></div>",
		'</tpl>',
		'<tpl if="referer == undefined">',
			"<div class='separator'></div>",
		'</tpl>',
		"<table class='table'>",
		"<tr>",
			"<td class='state' style='background-color: ", '<tpl if="state==0">green</tpl>', '<tpl if="state==1">orange</tpl>', '<tpl if="state==2">red</tpl>', ";'/>",
			"<td class='picture ",'<tpl if="referer">comment</tpl>',"' >",
				'<tpl if="authorId">',
					//"<img src='/files/avatar-{authorId}'/></img>",
					"<img src='widgets/stream/logo/ui.png'></img>",
				'</tpl>',
				'<tpl if="authorId == undefined">',
					"<img src='widgets/stream/logo/{connector}.png'></img>",
				'</tpl>',
			"</td>",
			"<td class='",'<tpl if="referer">comment</tpl>',"'>",
				"<div class='content'>",
					"<header>",
						'<tpl if="author">',
							"<h1 class='title'>{author}</h1>",
						'</tpl>',
						'<tpl if="author == undefined">',
							"<h1 class='title'>{component} - {resource}</h1>",
						'</tpl>',						
						"<span id='{event_Component_id}-time' class='timestamp'>{event_date}</span>",
					"</header>",
					"<span class='output'>{output}</span><br> <span class='long_output'>{long_output}</span>",
					'<tpl if="referer == undefined">',
						"<div class='afooter'>",
								"<span id='{event_Component_id}-expend-comments' class='icon icon-plus' />",
						"</div>",
					'</tpl>',
				"</div>",
			"</td>",
		"</tr>",
		"<tr class='tr-comments'>",
			"<td/><td/>",
			"<td id='{event_Component_id}-comments-td' class='comments' style='display: none;' colspan=2>",
				"<div id='{event_Component_id}-comments'></div>",
			"</td>",
		"</tr>",
		"</table>",
		{ compiled: true }
	);


//// Obj

Ext.define('widgets.stream.event' ,{
	extend: 'Ext.Component',
	alias : 'widget.stream.event',
	
	logAuthor: '[widget][stream][event]',
	
	cls: 'event',
	
	raw: {},
	event_id: undefined,
	timestamp: 0,
	
	stream: undefined,
		
	comments: [],
	
	el_comments: undefined,
	el_btn_exp_comments: undefined,
	el_time: undefined,
	
	initComponent: function() {
		
		this.event_id = this.id;
		this.id = this.stream.id + "." + this.id
		
		//log.debug("Create event: "+this.id, this.logAuthor)
		
		
		this.timestamp = parseInt(this.raw.timestamp);
				
		this.html = this.build();
		
		this.callParent(arguments);
	},
	
	build: function(raw){
		if (! raw)
			raw = this.raw
		
		if (! raw['referer'])
			raw['referer'] = undefined

		if (! raw['authorId'])
			raw['authorId'] = undefined
			
		if (! raw['author'])
			raw['author'] = undefined
			
		raw['event_date'] = this.time()
		raw['event_Component_id'] = this.id
		
		return widget_stream_event_template.applyTemplate(raw)
	},
	
	afterRender: function(){
		this.callParent(arguments);
		
		var el = this.getEl()
		
		//Get elements
		this.el_comments = el.getById(this.id + '-comments-td')
		this.el_btn_exp_comments = el.getById(this.id + '-expend-comments')
		this.el_time = el.getById(this.id + '-time')
		
		this.bindEvents();
	},

	bindEvents: function(){
		if (this.el_btn_exp_comments)
			this.el_btn_exp_comments.on('click', this.toggle_comments, this)
	},
	
	create_comments_container: function(){
		if (! this.comments_container){
			log.debug("Create comment's container", this.logAuthor)
			this.comment_form = Ext.create('Ext.form.Panel', {
					layout: 'fit',
					border: false,
					margin: 3,
					items: [{
						xtype: 'textfield',
						emptyText: 'Leave a comment ?',
						name: 'message',
						listeners: {
							specialkey: {
								fn: function(field, e){
									if (e.getKey() == e.ENTER)
										this.submit_comment()
								},
								scope: this
							}

						},
					}]
			});
				
			this.comments_container = Ext.create('Ext.container.Container', {
				layout: "anchor",
				items: [ this.comment_form ],
			});
				
			this.comments_container.on('afterRender', function(){	
				var me = this
				now.stream_getComments(this.event_id, this.stream.max_comment, function(records){
					log.debug(records.length+" comments for '"+me.event_id+"'", me.logAuthor)
					if (records.length > 0)
						for (var i in records)
								records[i] = Ext.create('widgets.stream.event', {raw: records[i], stream: me});
								
						me.comments_container.insert(0, records)
				});
			}, this);
			
			this.comments_container.render(this.id+"-comments");
				
		}
	},
	
	submit_comment: function(){
		log.debug("Submit comment", this.logAuthor)
		
		var message = this.comment_form.getForm().getValues().message
		this.comment_form.getForm().findField('message').reset()
		
		if (this.event_id)
			this.stream.publish_comment(this.event_id, this.raw, message, this)
		else
			log.error("Invalid event_id: '"+this.event_id+"'", this.logAuthor)
	},
	
	comment: function(event){
		if (! this.comments_container){
			this.show_comments();
		}else{			
			log.debug("Insert comment", this.logAuthor)
			var nb = this.comments_container.items.length
			this.comments_container.insert(nb-1, event)
			
			//Clean before
			if (this.comments_container.items.length > (this.stream.max_comment+1)){
				log.debug(" + Remove first comment", this.logAuthor)
				var item = this.comments_container.getComponent(0)
				this.comments_container.remove(item.id, true)
			}
			
		}
	},
	
	time: function(timestamp){
		
		if (! timestamp)
			timestamp = this.timestamp
		else
			timestamp = parseInt(timestamp)
			
		var elapsed = parseInt(new Date().getTime() / 1000) - timestamp
			
		var elapsed_text = elapsed+" seconds ago"
			
		if (elapsed < 3)
			elapsed_text = "just now"
		if (elapsed > 60)
			elapsed_text = parseInt(elapsed/60) +" mins ago"
		if (elapsed > 3600)
			elapsed_text = parseInt(elapsed/3600) +" hours ago"
		if (elapsed > 86400)
			elapsed_text = parseInt(elapsed/86400) +" days ago"
			
		return elapsed_text
	},
	
	update_time: function(){
		if (this.el_time)
			this.el_time.update(this.time())
		
		if (this.comments_container)
			for (var i=0; i<this.comments_container.items.length; i++){
				var event = this.comments_container.getComponent(i)
				if (event.event_id) //check if not a form
					event.update_time()
			}
	},
	
	toggle_comments: function(){	
		if (this.el_comments.isVisible())
			this.hide_comments()
		else
			this.show_comments()
			
	},
	
	show_comments: function(){
		log.debug("Show comments", this.logAuthor)
		this.el_comments.show()
		
		this.el_btn_exp_comments.removeCls('icon-plus')
		this.el_btn_exp_comments.addCls('icon-minus')
	
		this.create_comments_container();
		
		this.comment_form.getForm().findField('message').focus()
	},
	
	hide_comments: function(){
		this.el_comments.setVisibilityMode(Ext.Element.DISPLAY);
		
		log.debug("Hide comments", this.logAuthor)
		this.el_comments.hide()
		
		this.el_btn_exp_comments.addCls('icon-plus')
		this.el_btn_exp_comments.removeCls('icon-minus')
	},
	
 	beforeDestroy: function() {
		if (this.comments_container)
			this.comments_container.destroy()
			
		this.callParent(arguments);
 	},
});
