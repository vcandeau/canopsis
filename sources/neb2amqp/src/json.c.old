#include "nagios.h"
#include "module.h"
#include "logger.h"

char * charnull(char * data){
	if (data == NULL){
		data = "";
	}
	return data;
}

void nebstruct_program_status_data_to_json(char * buffer, nebstruct_program_status_data *c){
		
		sprintf (buffer, "{\
\"type\": \"program_status\", \
\"source_name\": \"%s\", \
\"source_type\": \"daemon\", \
\"timestamp\": %i, \
\"program_start\": %i, \
\"pid\": %i}\n",
		g_eventsource_name,
		(int)c->timestamp.tv_sec,
		(int)c->program_start,
		c->pid
		);
}

void nebstruct_service_check_data_to_json(char * buffer, nebstruct_service_check_data *c){
	
	sprintf (buffer, "{\
\"type\": \"check\", \
\"source_name\": \"%s\", \
\"source_type\": \"service\", \
\"timestamp\": %i, \
\"host_name\": \"%s\", \
\"service_description\": \"%s\", \
\"check_type\": %i, \
\"current_attempt\": %i, \
\"max_attempts\": %i, \
\"state_type\": %i, \
\"state\": %i, \
\"execution_time\": %.3lf, \
\"latency\": %.3lf, \
\"command_name\": \"%s\", \
\"output\": \"%s\", \
\"long_output\": \"%s\", \
\"perf_data\": \"%s\"}\n",
		g_eventsource_name,
		(int)c->timestamp.tv_sec,
		c->host_name,
		c->service_description,
		c->check_type,
		c->current_attempt,
		c->max_attempts,
		c->state_type,
		c->state,
		c->execution_time,
		c->latency,
		charnull(c->command_name),
		charnull(c->output),
		charnull(c->long_output),
		charnull(c->perf_data));
}

void nebstruct_host_check_data_to_json(char * buffer, nebstruct_host_check_data *c){
	sprintf (buffer, "{\
\"type\": \"check\", \
\"source_name\": \"%s\", \
\"source_type\": \"host\", \
\"timestamp\": %i, \
\"host_name\": \"%s\", \
\"check_type\": %i, \
\"current_attempt\": %i, \
\"max_attempts\": %i, \
\"state_type\": %i, \
\"state\": %i, \
\"execution_time\": %.3lf, \
\"latency\": %.3lf, \
\"command_name\": \"%s\", \
\"output\": \"%s\", \
\"long_output\": \"%s\", \
\"perf_data\": \"%s\"}\n",
		g_eventsource_name,
		(int)c->timestamp.tv_sec,
		c->host_name,
		c->check_type,
		c->current_attempt,
		c->max_attempts,
		c->state_type,
		c->state,
		c->execution_time,
		c->latency,
		charnull(c->command_name),
		charnull(c->output),
		charnull(c->long_output),
		charnull(c->perf_data));
}

void nebstruct_acknowledgement_data_to_json(char * buffer, nebstruct_acknowledgement_data *c){
	char * source_type;

	if (c->service_description == NULL){
		source_type = "host";
	}else{
		source_type = "service";
	}

	sprintf (buffer, "{\
\"type\": \"ack\", \
\"source_name\": \"%s\", \
\"source_type\": \"%s\", \
\"timestamp\": %i, \
\"host_name\": \"%s\", \
\"service_description\": \"%s\", \
\"author_name\": \"%s\", \
\"comment_data\": \"%s\", \
\"state\": %i, \
\"is_sticky\": %i, \
\"persistent_comment\": %i, \
\"notify_contacts\": %i}\n",
		g_eventsource_name,
		source_type,
		(int)c->timestamp.tv_sec,
		c->host_name,
		charnull(c->service_description),
		c->author_name,
		charnull(c->comment_data),
		c->state,
		c->is_sticky,
		c->persistent_comment,
		c->notify_contacts);
}


void nebstruct_downtime_data_to_json(char * buffer, nebstruct_downtime_data *c){
	char * source_type;
	char * state;
	
	if (c->service_description == NULL){
		source_type = "host";
	}else{
		source_type = "service";
	}
	
	if (c->type == NEBTYPE_DOWNTIME_START) {
		state = "start";
	}else if (c->type == NEBTYPE_DOWNTIME_STOP){
		state = "stop";
	}

	sprintf (buffer, "{\
\"type\": \"downtime\", \
\"source_name\": \"%s\", \
\"source_type\": \"%s\", \
\"timestamp\": %i, \
\"host_name\": \"%s\", \
\"service_description\": \"%s\", \
\"author_name\": \"%s\", \
\"comment_data\": \"%s\", \
\"state\": \"%s\", \
\"downtime_type\": %i, \
\"entry_time\": %i, \
\"start_time\": %i, \
\"end_time\": %i, \
\"fixed\": %i, \
\"duration\": %ld, \
\"triggered_by\": %ld, \
\"downtime_id\": %ld \
}\n",
		g_eventsource_name,
		source_type,
		(int)c->timestamp.tv_sec,
		c->host_name,
		charnull(c->service_description),
		c->author_name,
		charnull(c->comment_data),
		state,
		c->downtime_type,
		(int)c->entry_time,
		(int)c->start_time,
		(int)c->end_time,
		c->fixed,
		c->duration,
		c->triggered_by,
		c->downtime_id
		);
}

void nebstruct_comment_data_to_json(char * buffer, nebstruct_comment_data *c){
	char * source_type;
	char * state;
	
	if (c->service_description == NULL){
		source_type = "host";
	}else{
		source_type = "service";
	}
	
	if (c->type == NEBTYPE_COMMENT_ADD) {
		state = "add";
	}else if (c->type == NEBTYPE_COMMENT_DELETE){
		state = "delete";
	}

	sprintf (buffer, "{\
\"type\": \"comment\", \
\"source_name\": \"%s\", \
\"source_type\": \"%s\", \
\"timestamp\": %i, \
\"host_name\": \"%s\", \
\"service_description\": \"%s\", \
\"author_name\": \"%s\", \
\"comment_data\": \"%s\", \
\"state\": \"%s\", \
\"comment_type\": %i, \
\"persistent\": %i, \
\"entry_time\": %i, \
\"entry_type\": %i, \
\"expires\": %i, \
\"expire_time\": %i, \
\"source\": %i, \
\"comment_id\": %ld \
}\n",
		g_eventsource_name,
		source_type,
		(int)c->timestamp.tv_sec,
		c->host_name,
		charnull(c->service_description),
		c->author_name,
		charnull(c->comment_data),
		state,
		c->comment_type,
		c->persistent,
		(int)c->entry_time,
		c->entry_type,
		c->expires,
		(int)c->expire_time,
		c->source,
		c->comment_id
		);
		
}


