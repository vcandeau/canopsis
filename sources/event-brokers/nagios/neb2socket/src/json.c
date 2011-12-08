#include "nagios.h"
#include "module.h"
#include "logger.h"

char * charnull(char * data){
	if (data == NULL){
		data = "";
	}
	return data;
}

void nebstruct_service_check_data_to_json(char * buffer, nebstruct_service_check_data *c){

	sprintf (buffer, "{\
\"connector\":		 \"nagios\",\
\"connector_name\":	 \"%s\",\
\"event_type\":		 \"check\",\
\"source_type\":	 \"ressource\",\
\"component\":		 \"%s\",\
\"ressource\":		 \"%s\",\
\"timestamp\":		 %i,\
\"state\":		 %i,\
\"state_type\":		 %i,\
\"output\":		 \"%s\",\
\"long_output\":	 \"%s\",\
\"perf_data\":		 \"%s\",\
\"check_type\":		 %i,\
\"current_attempt\":	%i, \
\"max_attempts\":	%i, \
\"execution_time\":	%.3lf, \
\"latency\":		%.3lf, \
\"command_name\":	\"%s\" \
}\n",
		g_eventsource_name,
		c->host_name,
		c->service_description,
		(int)c->timestamp.tv_sec,
		c->state,
		c->state_type,
		charnull(c->output),
		charnull(c->long_output),
		charnull(c->perf_data),

		c->check_type,
		c->current_attempt,
		c->max_attempts,
		c->execution_time,
		c->latency,
		charnull(c->command_name));
}

void nebstruct_host_check_data_to_json(char * buffer, nebstruct_host_check_data *c){
/*	sprintf (buffer, "{\
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
}*/

	sprintf (buffer, "{\
\"connector\":		 \"nagios\",\
\"connector_name\":	 \"%s\",\
\"event_type\":		 \"check\",\
\"source_type\":	 \"component\",\
\"component\":		 \"%s\",\
\"ressource\":		 \"\",\
\"timestamp\":		 %i,\
\"state\":		 %i,\
\"state_type\":		 %i,\
\"output\":		 \"%s\",\
\"long_output\":	 \"%s\",\
\"perf_data\":		 \"%s\",\
\"check_type\":		 %i,\
\"current_attempt\":	%i, \
\"max_attempts\":	%i, \
\"execution_time\":	%.3lf, \
\"latency\":		%.3lf, \
\"command_name\":	\"%s\" \
}\n",
		g_eventsource_name,
		c->host_name,
		(int)c->timestamp.tv_sec,
		c->state,
		c->state_type,
		charnull(c->output),
		charnull(c->long_output),
		charnull(c->perf_data),

		c->check_type,
		c->current_attempt,
		c->max_attempts,
		c->execution_time,
		c->latency,
		charnull(c->command_name));
}

