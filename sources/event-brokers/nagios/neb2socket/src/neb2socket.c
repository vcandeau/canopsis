/*****************************************************************************
 *
 * neb2socket.c - NEB Module to export data to Unix socket stream
 *
 * Copyright (c) 2011 Capensis
 *
 *****************************************************************************/

#include <sys/select.h>
#include <time.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/time.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/un.h>
#include <sys/socket.h>
#include <unistd.h>
#include <sys/select.h>
#include <pthread.h>
#include <stdarg.h>
#include <errno.h>
#include <signal.h>
#include <fcntl.h>

#include "nagios.h"
#include "logger.h"

NEB_API_VERSION(CURRENT_NEB_API_VERSION)
extern int event_broker_options;

int g_debug_level = 2;
char * g_socket_path = "/tmp/neb2socket";


int verify_event_broker_options()
{
    int errors = 0;
    if (!(event_broker_options & BROKER_PROGRAM_STATE)) {
        logger( LG_CRIT, "need BROKER_PROGRAM_STATE (%i) event_broker_option enabled to work.", BROKER_PROGRAM_STATE );
        errors++;
    }
    if (!(event_broker_options & BROKER_TIMED_EVENTS)) {
        logger( LG_CRIT, "need BROKER_TIMED_EVENTS (%i) event_broker_option enabled to work.", BROKER_TIMED_EVENTS );
        errors++;
    }
    if (!(event_broker_options & BROKER_SERVICE_CHECKS)) {
        logger( LG_CRIT, "need BROKER_SERVICE_CHECKS (%i) event_broker_option enabled to work.", BROKER_SERVICE_CHECKS );
        errors++;
    }
    if (!(event_broker_options & BROKER_HOST_CHECKS)) {
        logger( LG_CRIT, "need BROKER_HOST_CHECKS (%i) event_broker_option enabled to work.", BROKER_HOST_CHECKS );
        errors++;
    }
    if (!(event_broker_options & BROKER_LOGGED_DATA)) {
        logger( LG_CRIT, "need BROKER_LOGGED_DATA (%i) event_broker_option enabled to work.", BROKER_LOGGED_DATA );
        errors++;
    }
    if (!(event_broker_options & BROKER_COMMENT_DATA)) {
        logger( LG_CRIT, "need BROKER_COMMENT_DATA (%i) event_broker_option enabled to work.", BROKER_COMMENT_DATA );
        errors++;
    }
    if (!(event_broker_options & BROKER_DOWNTIME_DATA)) {
        logger( LG_CRIT, "need BROKER_DOWNTIME_DATA (%i) event_broker_option enabled to work.", BROKER_DOWNTIME_DATA );
        errors++;
    }
    if (!(event_broker_options & BROKER_STATUS_DATA)) {
        logger( LG_CRIT, "need BROKER_STATUS_DATA (%i) event_broker_option enabled to work.", BROKER_STATUS_DATA );
        errors++;
    }
    if (!(event_broker_options & BROKER_ADAPTIVE_DATA)) {
        logger( LG_CRIT, "need BROKER_ADAPTIVE_DATA (%i) event_broker_option enabled to work.", BROKER_ADAPTIVE_DATA );
        errors++;
    }
    if (!(event_broker_options & BROKER_EXTERNALCOMMAND_DATA)) {
        logger( LG_CRIT, "need BROKER_EXTERNALCOMMAND_DATA (%i) event_broker_option enabled to work.", BROKER_EXTERNALCOMMAND_DATA );
        errors++;
    }
    if (!(event_broker_options & BROKER_STATECHANGE_DATA)) {
        logger( LG_CRIT, "need BROKER_STATECHANGE_DATA (%i) event_broker_option enabled to work.", BROKER_STATECHANGE_DATA );
        errors++;
    }

    return errors == 0;
}



void register_callbacks()
{
    /*neb_register_callback(NEBCALLBACK_HOST_STATUS_DATA,      g_nagios_handle, 0, broker_host); // Needed to start threads
    neb_register_callback(NEBCALLBACK_COMMENT_DATA,          g_nagios_handle, 0, broker_comment); // dynamic data
    neb_register_callback(NEBCALLBACK_DOWNTIME_DATA,         g_nagios_handle, 0, broker_downtime); // dynamic data
    neb_register_callback(NEBCALLBACK_SERVICE_CHECK_DATA,    g_nagios_handle, 0, broker_check); // only for statistics
    neb_register_callback(NEBCALLBACK_HOST_CHECK_DATA,       g_nagios_handle, 0, broker_check); // only for statistics
    neb_register_callback(NEBCALLBACK_LOG_DATA,              g_nagios_handle, 0, broker_log); // only for trigger 'log'
    neb_register_callback(NEBCALLBACK_EXTERNAL_COMMAND_DATA, g_nagios_handle, 0, broker_command); // only for trigger 'command'
    neb_register_callback(NEBCALLBACK_STATE_CHANGE_DATA,     g_nagios_handle, 0, broker_state); // only for trigger 'state'
    neb_register_callback(NEBCALLBACK_ADAPTIVE_PROGRAM_DATA, g_nagios_handle, 0, broker_program); // only for trigger 'program'
    neb_register_callback(NEBCALLBACK_PROCESS_DATA,          g_nagios_handle, 0, broker_process); // used for starting threads
    neb_register_callback(NEBCALLBACK_TIMED_EVENT_DATA,      g_nagios_handle, 0, broker_event); // used for timeperiods cache*/
}

void deregister_callbacks()
{
    /*neb_deregister_callback(NEBCALLBACK_HOST_STATUS_DATA,      broker_host);
    neb_deregister_callback(NEBCALLBACK_COMMENT_DATA,          broker_comment);
    neb_deregister_callback(NEBCALLBACK_DOWNTIME_DATA,         broker_downtime);
    neb_deregister_callback(NEBCALLBACK_SERVICE_CHECK_DATA,    broker_check);
    neb_deregister_callback(NEBCALLBACK_HOST_CHECK_DATA,       broker_check);
    neb_deregister_callback(NEBCALLBACK_LOG_DATA,              broker_log);
    neb_deregister_callback(NEBCALLBACK_EXTERNAL_COMMAND_DATA, broker_command);
    neb_deregister_callback(NEBCALLBACK_STATE_CHANGE_DATA,     broker_state);
    neb_deregister_callback(NEBCALLBACK_ADAPTIVE_PROGRAM_DATA, broker_program);
    neb_deregister_callback(NEBCALLBACK_PROCESS_DATA,          broker_program);
    neb_deregister_callback(NEBCALLBACK_TIMED_EVENT_DATA,      broker_event);*/
}



/* this function gets called when the module is loaded by the event broker */
int nebmodule_init(int flags __attribute__ ((__unused__)), char *args, void *handle) 
{
    //g_nagios_handle = handle;
    //livestatus_parse_arguments(args);

    logger(LG_INFO, "NEB2Socket %s by Capensis. Socket: '%s'", VERSION, g_socket_path);
    //logger(LG_INFO, "Please visit us at http://mathias-kettner.de/");

    //omd_advertize();
    /*
    if (!open_unix_socket())
	return 1;

    if (!verify_event_broker_options()) {
        logger(LG_CRIT, "Fatal: bailing out. Please fix event_broker_options.");
        logger(LG_CRIT, "Hint: your event_broker_options are set to %d. Try setting it to -1.", event_broker_options);
	return 1;
    }
    else if (g_debug_level > 0)
        logger(LG_INFO, "Your event_broker_options are sufficient for livestatus.");

    store_init();*/
    //register_callbacks();

    /* Unfortunately, we cannot start our socket thread right now.
       Nagios demonizes *after* having loaded the NEB modules. When
       demonizing we are losing our thread. Therefore, we create the
       thread the first time one of our callbacks is called. Before
       that happens, we haven't got any data anyway... */

    //if (g_debug_level > 0)
        //logger(LG_INFO, "successfully finished initialization");
    return 0;
}


int nebmodule_deinit(int flags __attribute__ ((__unused__)), int reason __attribute__ ((__unused__)))
{
    //logger(LG_INFO, "deinitializing");
    //terminate_threads();
    //close_unix_socket();
    //store_deinit();
    deregister_callbacks();
    return 0;
}
