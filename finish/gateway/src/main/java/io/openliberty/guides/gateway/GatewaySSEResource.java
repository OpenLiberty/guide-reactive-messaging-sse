package io.openliberty.guides.gateway;

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
// tag::path2[]
@Path("/sse")
// end::path2[]
public class GatewaySSEResource {

    private Logger logger = Logger.getLogger(GatewaySSEResource.class.getName());

    // tag::sse[]
    private Sse sse;
    // end::sse[]
    // tag::broadcaster[]
    private SseBroadcaster broadcaster;
    // end::broadcaster[]

    // tag::subscribeToSystems[]
    @GET
    // tag::path3[]
    @Path("/")
    // end::path3[]
    // tag::sseMimeType[]
    @Produces(MediaType.SERVER_SENT_EVENTS)
    // end::sseMimeType[]
    public void subscribeToSystem(
        // tag::sseEventSinkParam[]
        @Context SseEventSink sink,
        // end::sseEventSinkParam[]
        // tag::sseParam[]
        @Context Sse sse
        // end::sseParam[]
        ) {

        if (this.sse == null || this.broadcaster == null) { 
            this.sse = sse;
            // tag::newBroadcaster
            this.broadcaster = sse.newBroadcaster();
            // end::newBroadcaster[]
        }
        
        // tag::registerSink[]
        this.broadcaster.register(sink);
        // end::registerSink[]     
        logger.info("New sink registered to broadcaster.");
    }
    // end::subscribeToSystems[]

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

    // tag::getSystemLoadMessage[]
    // tag::incoming1
    @Incoming("systemLoad")
    // end::incoming1
    public void getSystemLoadMessage(SystemLoad sl)  {
        logger.info("Message received from systemLoadTopic. " + sl.toString());
        broadcastData("systemLoad", sl);
    }
    // end::getSystemLoadMessage[]

    // tag::getPropertyMessage[]
    // tag::incoming2
    @Incoming("propertyMessage")
    // tag::incoming2
    public void getPropertyMessage(PropertyMessage pm)  {
        logger.info("Message received from propertyMessageTopic. " + pm.toString());
        broadcastData("propertyMessage", pm);
    }
    // end::getPropertyMessage[]
}