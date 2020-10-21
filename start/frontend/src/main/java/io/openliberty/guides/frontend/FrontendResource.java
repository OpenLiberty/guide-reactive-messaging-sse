package io.openliberty.guides.frontend;

import io.openliberty.guides.models.*;

import org.eclipse.microprofile.reactive.messaging.Incoming;

import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.sse.OutboundSseEvent;
import javax.ws.rs.sse.Sse;
import javax.ws.rs.sse.SseBroadcaster;
import javax.ws.rs.sse.SseEventSink;
import java.util.Optional;
import java.util.logging.Logger;

@ApplicationScoped
@Path("/sse")
public class FrontendResource {

    private Logger logger = Logger.getLogger(FrontendResource.class.getName());

    private Sse sse;
    private SseBroadcaster broadcaster;

    @GET
    @Path("/")
    @Produces(MediaType.SERVER_SENT_EVENTS)
    public void subscribeToSystem(
        @Context SseEventSink sink,
        @Context Sse sse
        ) {

        if (this.sse == null || this.broadcaster == null) {
            this.sse = sse;
            this.broadcaster = sse.newBroadcaster();
        }

        this.broadcaster.register(sink);
        logger.info("New sink registered to broadcaster.");
    }

    private void broadcastData(String name, Object data) {
        if (broadcaster != null) {
            OutboundSseEvent event = sse.newEventBuilder()
                                        .name(name)
                                        .data(data.getClass(), data)
                                        .mediaType(MediaType.APPLICATION_JSON_TYPE)
                                        .build();
            broadcaster.broadcast(event);
        } else {
            logger.info("Unable to send SSE. Broadcaster context is not set up.");
        }
    }

    @Incoming("systemLoad")
    public void getSystemLoadMessage(SystemLoad sl)  {
        logger.info("Message received from systemLoadTopic. " + sl.toString());
        broadcastData("systemLoad", sl);
    }
}
