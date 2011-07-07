import tornado.web
import tornado.escape

from pymongo import Connection


class Handler(tornado.web.RequestHandler):
	mconn = Connection('localhost', 27017)
	mdb = mconn['canopsis']
	mviews = mdb['views']

	def get(self, action):
		raise tornado.web.HTTPError(404)

	def post(self, action):
		try:
			args = tornado.escape.json_decode(self.request.body)
			self.request_type = args['type']
			tid = args['tid']
			action = args['action']
			method = args['method']
			method_args = args["data"]
			print "[%i] RPC: %s.%s(%s)" % (tid, action, method, method_args)


			self.content_type = 'application/json' 	

			view = method_args['view']
			
			output = self.mviews.find_one({'_id': str(view)})
			if not output:
				print "View '%s' not found ..." % view
				raise tornado.web.HTTPError(404)		
			
			#output=''
			#if view == "dashboard":
			#	output = self.view_dashboard()
			#elif view == "id-view-hosts":
			#	output = self.view_hosts()
			#elif view == "id-view-services":
			#	output = self.view_services()
			#elif view == "id-config-selectors":
			# 	output = self.view_selectors()
			#else:
			#	raise tornado.web.HTTPError(404)

			output = {'type': self.request_type, 'tid': tid, 'action': action, 'method': method, 'result': output}
			print "Output:\n", output
			self.write(tornado.escape.json_encode(output))

		except Exception, err:
			print err
			raise tornado.web.HTTPError(404)

	def view_dashboard(self):
		def create_column(items):
			column = {'items': items}
			return column
			
		def create_item(title, widget, height=300, id=None):
			item = {'id': title, 'title': title, 'height': height, 'widget': widget}
			return item

		item1 = create_item(title='Highcharts Pie', widget='Widgets.HCPieAvailServices')
		item2 = create_item(title='col1', widget='Widgets.PieAvailServices')
		item3 = create_item(title='col2', widget='Widgets.GridHosts')
		item4 = create_item(title='Highcharts Line', widget='Widgets.HCLine')
		
		#col1 = create_column([item1, item2])
		col1 = create_column([item1])
		col2 = create_column([item3, item4])
		#col2 = create_column([item4])
 
		view = [col1, col2]
		#view = []

		return view

	def view_hosts(self):
		return [{'items': [{'widget': 'Widgets.GridHosts'}]}]

	def view_services(self):
		return [{'items': [{'widget': 'Widgets.GridServices'}]}]

	def view_selectors(self):
		return [{'items': [{'widget': 'Selectors.List'}]}]
