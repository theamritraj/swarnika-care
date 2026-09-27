package com.swarnikacare.appointment.scheduler;

import com.swarnikacare.appointment.outbox.OutboxEvent;
import com.swarnikacare.appointment.outbox.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Configuration
@EnableScheduling
public class OutboxPublisher {

    private static final Logger log = LoggerFactory.getLogger(OutboxPublisher.class);

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OutboxPublisher(OutboxEventRepository outboxEventRepository, KafkaTemplate<String, Object> kafkaTemplate) {
        this.outboxEventRepository = outboxEventRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedDelay = 5000)
    public void processOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findByStatusAndNextAttemptAtLessThanEqual("PENDING", LocalDateTime.now());

        if (pendingEvents.isEmpty()) {
            return;
        }

        log.info("Found {} pending outbox events", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            try {
                // Send raw JSON string or rely on Kafka template to send string
                kafkaTemplate.send(event.getTopic(), event.getAggregateId(), event.getPayload()).get(); // Synchronous send to ensure it works before updating DB
                
                event.setStatus("PUBLISHED");
                event.setPublishedAt(LocalDateTime.now());
                outboxEventRepository.save(event);
                log.info("Successfully published eventId: {}", event.getEventId());

            } catch (Exception e) {
                log.error("Failed to publish eventId: {}", event.getEventId(), e);
                
                int retryCount = event.getRetryCount() + 1;
                event.setRetryCount(retryCount);
                event.setLastError(e.getMessage());
                
                if (retryCount >= 5) { // Max retries
                    event.setStatus("FAILED");
                } else {
                    event.setNextAttemptAt(LocalDateTime.now().plusSeconds((long) Math.pow(2, retryCount) * 10)); // Exponential backoff
                }
                
                outboxEventRepository.save(event);
            }
        }
    }
}
