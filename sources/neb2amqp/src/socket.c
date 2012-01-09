#include <pthread.h>
#include <sys/socket.h>

#include "nagios.h"
#include "module.h"
#include "logger.h"

#include "socket.h"

pthread_mutex_t lock;

// This code is part of Check_MK (GPL v2).
// The official homepage is at http://mathias-kettner.de/check_mk.
int open_unix_socket()
{
    struct stat st;
    if (0 == stat(g_socket_path, &st)) {
	if (0 == unlink(g_socket_path)) {
	    logger(LG_DEBUG , "Removed old left over socket file %s", g_socket_path);
	}
	else {
	    logger(LG_ALERT, "Cannot remove in the way file %s: %s",
		    g_socket_path, strerror(errno));
	    return false;
	}
    }

    g_unix_socket = socket(PF_LOCAL, SOCK_STREAM, 0);
    g_max_fd_ever = g_unix_socket;
    if (g_unix_socket < 0)
    {
	logger(LG_CRIT , "Unable to create UNIX socket: %s", strerror(errno));
	return false;
    }

    // Imortant: close on exec -> check plugins must not inherit it!
    if (0 < fcntl(g_unix_socket, F_SETFD, FD_CLOEXEC))
	logger(LG_INFO, "Cannot set FD_CLOEXEC on socket: %s", strerror(errno));

    // Bind it to its address. This creates the file with the name g_socket_path
    struct sockaddr_un sockaddr;
    sockaddr.sun_family = AF_LOCAL;
    strncpy(sockaddr.sun_path, g_socket_path, sizeof(sockaddr.sun_path));
    if (bind(g_unix_socket, (struct sockaddr *) &sockaddr, SUN_LEN(&sockaddr)) < 0)
    {
	logger(LG_ERR , "Unable to bind adress %s to UNIX socket: %s",
		g_socket_path, strerror(errno));
	close(g_unix_socket);
	return false;
    }

    // Make writable group members (fchmod didn't do nothing for me. Don't know why!)
    if (0 != chmod(g_socket_path, 0660)) {
	logger(LG_ERR , "Cannot chown unix socket at %s to 0660: %s", g_socket_path, strerror(errno));
	close(g_unix_socket);
	return false;
    }

    if (0 != listen(g_unix_socket, 3 /* backlog */)) {
	logger(LG_ERR , "Cannot listen to unix socket at %s: %s", g_socket_path, strerror(errno));
	close(g_unix_socket);
	return false;
    }

    if (g_debug_level > 0)
        logger(LG_INFO, "Opened UNIX socket %s\n", g_socket_path);

    // Initialisation
    pthread_mutex_init(&lock, NULL);
    g_unix_socket_SCursor = 0;
    g_unix_socket_nbClient = 0;
    return true;

}

// This code is part of Check_MK (GPL v2).
// The official homepage is at http://mathias-kettner.de/check_mk.
void close_unix_socket()
{
    int i;
    for(i=0; i < g_unix_socket_nbClient; i++){
	logger(LG_INFO, "Socket: Close Client's socket %i", g_unix_sockets[i]);
	close(g_unix_sockets[i]);
    }

    logger(LG_INFO, "Socket: Unlink main socket");
    unlink(g_socket_path);
    if (g_unix_socket >= 0) {
	close(g_unix_socket);
	g_unix_socket = -1;
    }
}

// This code is part of Check_MK (GPL v2).
// The official homepage is at http://mathias-kettner.de/check_mk.
void listen_unix_socket(){
	struct timeval tv;
	tv.tv_sec  = 2;
	tv.tv_usec = 500 * 1000;

	fd_set fds;
	FD_ZERO(&fds);
	FD_SET(g_unix_socket, &fds);
	int retval = select(g_unix_socket + 1, &fds, NULL, NULL, &tv);
	if (retval > 0 && FD_ISSET(g_unix_socket, &fds)) {
	    int cc = accept(g_unix_socket, NULL, NULL);
	    if (cc > g_max_fd_ever)
		g_max_fd_ever = cc;
	    if (0 < fcntl(cc, F_SETFD, FD_CLOEXEC))
		logger(LG_INFO, "Socket: Cannot set FD_CLOEXEC on client socket: %s", strerror(errno));

	    if (g_unix_socket_nbClient >= UNIX_SOCKET_MAX_CLIENT){
		char * error = "Connection refused, Socket's limit reached ...";
		logger(LG_ERR, "Socket: %s", error);
		int retval = write(cc, error, strlen(error));
		sleep(1);
		close(cc);
	    }else{
		    g_unix_sockets[g_unix_socket_nbClient] = cc;
		    g_unix_socket_nbClient++;
		    logger(LG_INFO, "Socket: Accepted client connection on fd %d (%i/%i)", cc, g_unix_socket_nbClient, UNIX_SOCKET_MAX_CLIENT);
	    }
	}
}

void del_unix_client_socket(int cursor){
	pthread_mutex_lock (&lock);
	logger(LG_INFO, "Socket: Close socket %i (%i)", g_unix_sockets[cursor], cursor);
	int g_unix_sockets_tmp[UNIX_SOCKET_MAX_CLIENT];

	int i;
	int new_cursor=0;
	int nbSocket = g_unix_socket_nbClient;
	for(i=0; i < nbSocket; i++){
		//logger(LG_INFO, "Socket: Check Cursor: %i/%i", i, nbSocket);
		g_unix_sockets_tmp[i]=-1;
		if (i != cursor){
			//logger(LG_INFO, "Socket: %i Ok, g_unix_sockets_tmp[%i] = g_unix_sockets[%i]", i, new_cursor, i);
			g_unix_sockets_tmp[new_cursor] = g_unix_sockets[i];
			new_cursor++;
		}else{
			//logger(LG_INFO, "Socket: %i Fail ! Delete it ...", i);
			close(g_unix_sockets[cursor]);
			g_unix_socket_nbClient--;
			logger(LG_INFO, "Socket: Connected Client(s): %i/%i", g_unix_socket_nbClient, UNIX_SOCKET_MAX_CLIENT);
		}
	}
	
	memcpy(g_unix_sockets, g_unix_sockets_tmp, sizeof(g_unix_sockets_tmp));

	pthread_mutex_unlock (&lock);
}

void write_unix_socket(char * data){
	pthread_mutex_lock (&lock);
	int sended = 0;
	if (g_unix_socket_nbClient > 0){
	
		int retval = -1;
		do{
			int socket = g_unix_sockets[g_unix_socket_SCursor];
			retval = write(socket, data, strlen(data));
			//logger(LG_INFO, "Socket: Try to write %i Bytes, %i writed.", strlen(data),  retval);
			if (retval < 0){
				logger(LG_INFO, "Socket: Impossible to write on socket %i (%i).", socket, g_unix_socket_SCursor);
				pthread_mutex_unlock (&lock);
				del_unix_client_socket(g_unix_socket_SCursor);
				pthread_mutex_lock (&lock);
			}else{
				//logger(LG_INFO, "Socket: Write %i Bytes on socket %i.", retval, socket);
				sended = 1;
			}			
		
			// Next Socket selection
			// Round Robin
			//logger(LG_INFO, "Socket: Choose next socket, Cursor: %i nbClient: %i.", g_unix_socket_SCursor, g_unix_socket_nbClient);
			g_unix_socket_SCursor++;
			if (g_unix_socket_SCursor >= g_unix_socket_nbClient){
				g_unix_socket_SCursor = 0;
			}

		}while(retval < 0 && g_unix_socket_nbClient > 0);
		if (! sended){
			logger(LG_WARN, "Socket: No available socket, lose event ...");	
		}
	}
	pthread_mutex_unlock (&lock);
}

