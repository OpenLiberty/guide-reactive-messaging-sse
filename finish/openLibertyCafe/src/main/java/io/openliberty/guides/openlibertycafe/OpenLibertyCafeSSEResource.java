package io.openliberty.guides.openlibertycafe;

import io.openliberty.guides.models.Order;
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
import java.util.concurrent.atomic.AtomicLong;
import java.util.logging.Logger;

@ApplicationScoped
@Path("/sse")
public class OpenLibertyCafeSSEResource {

    private final long RECONNECT_DELAY = 5 * 1000;

    private Logger logger = Logger.getLogger(OpenLibertyCafeSSEResource.class.getName());
    private AtomicLong counter = new AtomicLong();

    // tag::sse[]
    private Sse sse;
    // end::sse[]
    // tag::broadcaster[]
    private SseBroadcaster broadcaster;
    // end::broadcaster[]

    // tag::subscribeToOrders[]
    // tag::path[]
    @GET
    @Path("/")
    // end::path[]
    // tag::sseMimeType[]
    @Produces(MediaType.SERVER_SENT_EVENTS)
    // end::sseMimeType[]
    public void subscribeToOrders(
        // tag::sseEventSinkParam[]
        @Context SseEventSink sink, 
        // end::sseEventSinkParam[]
        // tag::sseParam[]
        @Context Sse sse
        // end::sseParam[]
        ) {

        // tag::sseAndBroadcaster[]
        this.sse = Optional.ofNullable(this.sse).orElse(sse);
        this.broadcaster = Optional.ofNullable(this.broadcaster)
                                    // tag::getBroadcaster[]
                                    .orElse(sse.newBroadcaster());
                                    // end::getBroadcaster[]
        // end::sseAndBroadcaster[]

        // tag::registerSink[]
        this.broadcaster.register(sink);
        // end::registerSink[]

        logger.info("New sink registered to broadcaster");
    }
    // end::subscribeToOrders[]

    // tag::reactiveMessagingStream[]
    // tag::incoming[]
    @Incoming("order")
    // end::incoming[]
    public void receiveOrder(Order order)  {
        logger.info("New order received from Kafka " + order.toString());

        if (Optional.ofNullable(broadcaster).isPresent()) {
            // tag::createEvent[]
           OutboundSseEvent event = 
                        // tag::newEventBuilder[]
                        sse.newEventBuilder()
                        // end::newEventBuilder[]
                        // tag::setEventValues[]
                       .id(String.valueOf(counter.incrementAndGet()))
                       // tag::data[]
                       .data(Order.class, order)
                       // end::data[]
                       // tag::name[]
                       .name("order")
                       // end::name[]
                       .reconnectDelay(RECONNECT_DELAY)
                       .comment("Order " + order.getOrderId() 
                                + " has a status of " + order.getStatus())
                       .mediaType(MediaType.APPLICATION_JSON_TYPE)
                       // end::setEventValues[]
                       // tag::build[]
                       .build();
                       // end::build[]
            // end::createEvent[]

            logger.info("Broadcast new SSE - type: order - data: " + order.toString());

            // tag::broadcastEvent[]
            broadcaster.broadcast(event);
            // end::broadcastEvent[]
        } else {
            logger.info("Unable to send SSE. Broadcaster context is not set up");
        }
    }
    // end::reactiveMessagingStream[]
}
