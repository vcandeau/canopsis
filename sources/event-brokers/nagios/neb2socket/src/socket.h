#ifndef socket_h
#define socket_h

#define UNIX_SOCKET_MAX_CLIENT 10
#define UNIX_SOCKET_MSG_SIZE_MAX 8192

int g_unix_socket_nbClient;
int g_unix_socket;
int g_unix_sockets[UNIX_SOCKET_MAX_CLIENT];
int g_unix_socket_SCursor;
int g_max_cached_messages;
char * g_socket_path;

int open_unix_socket();
void close_unix_socket();
void listen_unix_socket();
void write_unix_socket(char * data);

#endif
