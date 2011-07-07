import tornado.web
import tornado.escape

class Handler(tornado.web.RequestHandler):
        def get(self, action):
		if action == "list":
			self.list()
		else:
			raise tornado.web.HTTPError(404)

	def list(self):
		menu = [{'text': 'Views', 'expanded': True, 'leaf': False, 'id': 'id-views', 'children':
					[
						{'text': 'Hosts', 'leaf': True, 'id': 'id-view-all-hosts', 'view': 'hosts'},
						{'text': 'Services', 'leaf': True, 'id': 'id-view-all-services', 'view': 'services'}
					]
				},
				{'text': 'Configuration', 'expanded': True,'leaf': False, 'id': 'id-config', 'children':
					[
						{'text': 'Views', 'leaf': True, 'id': 'id-config-views', 'view': 'config-views'},
						{'text': 'Selectors', 'leaf': True, 'id': 'id-config-selectors', 'view': 'config-selectors'}
					]
				}
				]
		#menu = {'expanded': True, 'children': [menu]}
		output = tornado.escape.json_encode(menu)
		self.write(output)
