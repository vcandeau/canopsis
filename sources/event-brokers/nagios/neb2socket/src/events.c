#include "nagios.h"
#include "module.h"
#include "logger.h"
#include "json.h"
#include "socket.h"

#include "events.h"

int g_last_event_program_status = 0;

int event_void(int event_type __attribute__ ((__unused__)), void *data){
	return;
}

int event_process(int event_type __attribute__ ((__unused__)), void *data)
{
	struct nebstruct_process_struct *ps = (struct nebstruct_process_struct *)data;
	if (ps->type == NEBTYPE_PROCESS_EVENTLOOPSTART) {
		//logger(LG_DEBUG, "PROCESS_EVENTLOOPSTART");
		start_threads();		
	}

	return 0;
}

int event_program_status(int event_type __attribute__ ((__unused__)), void *data)
{
	nebstruct_program_status_data *ps = (nebstruct_program_status_data *)data;
	//logger(LG_DEBUG, "Event: event_program_status (type: %i)", ps->type);
	
	//Send program_status every 10sec min
	if ((int)ps->timestamp.tv_sec >= (g_last_event_program_status+10)){
		char buffer[UNIX_SOCKET_MSG_SIZE_MAX];
		nebstruct_program_status_data_to_json(buffer, ps);
		write_unix_socket(buffer);
		g_last_event_program_status = (int)ps->timestamp.tv_sec;
	}
	
	return 0;
}

int event_service_check(int event_type __attribute__ ((__unused__)), void *data)
{
	//logger(LG_DEBUG, "Event: event_host_check");
	nebstruct_service_check_data *c = (nebstruct_service_check_data *)data;
	
	if (c->type == NEBTYPE_SERVICECHECK_PROCESSED) {
		//logger(LG_DEBUG, "SERVICECHECK_PROCESSED: %s->%s", c->host_name, c->service_description);

    	char buffer[UNIX_SOCKET_MSG_SIZE_MAX];
		nebstruct_service_check_data_to_json(buffer, c);
		write_unix_socket(buffer);
	}

	return 0;
}

int event_host_check(int event_type __attribute__ ((__unused__)), void *data)
{
	//logger(LG_DEBUG, "Event: event_service_check");
	nebstruct_host_check_data *c = (nebstruct_host_check_data *)data;

	if (c->type == NEBTYPE_HOSTCHECK_PROCESSED) {
		//logger(LG_DEBUG, "HOSTCHECK_PROCESSED: %s", c->host_name);

    	char buffer[UNIX_SOCKET_MSG_SIZE_MAX];
		nebstruct_host_check_data_to_json(buffer, c);
		write_unix_socket(buffer);
	}

	return 0;
}

int event_acknowledgement(int event_type __attribute__ ((__unused__)), void *data)
{
	//logger(LG_DEBUG, "Event: event_acknowledgement");
	nebstruct_acknowledgement_data *c = (nebstruct_acknowledgement_data *)data;
	
	if (c->type == NEBTYPE_ACKNOWLEDGEMENT_ADD) {
		//logger(LG_DEBUG, "Event: event_acknowledgement ADD");
		
		char buffer[UNIX_SOCKET_MSG_SIZE_MAX];
		nebstruct_acknowledgement_data_to_json(buffer, c);
		write_unix_socket(buffer);
		
	}else if (c->type == NEBTYPE_ACKNOWLEDGEMENT_REMOVE){			/* NOT IMPLEMENTED IN NAGIOS :( */
		//logger(LG_DEBUG, "Event: event_acknowledgement REMOVE");
	}

	return 0;
}

int event_downtime(int event_type __attribute__ ((__unused__)), void *data)
{
	//logger(LG_DEBUG, "Event: event_downtime");
	nebstruct_downtime_data *c = (nebstruct_downtime_data *)data;

	if (c->type == NEBTYPE_DOWNTIME_START) {
		//logger(LG_DEBUG, "Event: event_downtime START");
	}else if (c->type == NEBTYPE_DOWNTIME_STOP){
		//logger(LG_DEBUG, "Event: event_downtime STOP");
	}
	
	if (c->type == NEBTYPE_DOWNTIME_START || c->type == NEBTYPE_DOWNTIME_STOP){
		char buffer[UNIX_SOCKET_MSG_SIZE_MAX];
		nebstruct_downtime_data_to_json(buffer, c);
		write_unix_socket(buffer);	
	}

	return 0;
}

int event_comment(int event_type __attribute__ ((__unused__)), void *data)
{
	//logger(LG_DEBUG, "Event: event_comment");
	nebstruct_comment_data *c = (nebstruct_comment_data *)data;

	if (c->type == NEBTYPE_COMMENT_ADD) {
		//logger(LG_DEBUG, "Event: event_comment ADD");
	}else if (c->type == NEBTYPE_COMMENT_DELETE){
		//logger(LG_DEBUG, "Event: event_comment DELETE");
	}
	
	if (c->type == NEBTYPE_COMMENT_ADD || c->type == NEBTYPE_COMMENT_DELETE){
		char buffer[UNIX_SOCKET_MSG_SIZE_MAX];
		nebstruct_comment_data_to_json(buffer, c);
		write_unix_socket(buffer);	
	}

	return 0;
}
