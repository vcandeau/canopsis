#ifndef _neb2amqp_h_
#define _neb2amqp_h_

void amqp_main (const char *hostname,
                int port,
                const char *exchange,
                const char *routingkey,
                const char *message);

#endif
