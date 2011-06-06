#ifndef module_h
#define module_h

#define false 0
#define true 1

int g_debug_level;
int g_max_fd_ever;

void *g_nagios_handle;
char * g_eventsource_name;

int nebmodule_init(int flags __attribute__ ((__unused__)), char *args, void *handle);
void terminate_threads();
void start_threads();
int nebmodule_deinit(int flags __attribute__ ((__unused__)), int reason __attribute__ ((__unused__)));
void *main_thread(void *data __attribute__ ((__unused__)));

#endif
