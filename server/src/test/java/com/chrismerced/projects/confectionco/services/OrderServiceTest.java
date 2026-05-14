package com.chrismerced.projects.confectionco.services;

import com.chrismerced.projects.confectionco.exceptions.ResourceNotFoundException;
import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.model.OrderStatus;
import com.chrismerced.projects.confectionco.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Event;
import com.stripe.model.Refund;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock StripeService stripeService;
    @Mock EmailService emailService;
    @Mock TextingService textingService;
    @Mock S3Service s3Service;

    // Use a real ObjectMapper — no need to mock JSON parsing
    private final ObjectMapper objectMapper = new ObjectMapper();

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, stripeService, objectMapper,
                emailService, textingService, s3Service);
        ReflectionTestUtils.setField(orderService, "inspoBucket", "test-bucket");
    }

    // --- updateOrderStatus ---

    @Test
    void updateOrderStatus_savesNewStatus() {
        Order order = new Order();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        orderService.updateOrderStatus(1L, OrderStatus.REJECTED);

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(captor.capture());
        assertEquals(OrderStatus.REJECTED, captor.getValue().getStatus());
    }

    @Test
    void updateOrderStatus_throwsWhenOrderNotFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> orderService.updateOrderStatus(99L, OrderStatus.REJECTED));
    }

    // --- refundOrder ---

    @Test
    void refundOrder_throwsWhenNoStripeSession() {
        Order order = new Order();
        order.setStripeSessionId(null);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class,
                () -> orderService.refundOrder(1L, BigDecimal.TEN));
    }

    @Test
    void refundOrder_throwsWhenAmountIsNull() {
        Order order = new Order();
        order.setStripeSessionId("sess_123");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class,
                () -> orderService.refundOrder(1L, null));
    }

    @Test
    void refundOrder_throwsWhenAmountIsZero() {
        Order order = new Order();
        order.setStripeSessionId("sess_123");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class,
                () -> orderService.refundOrder(1L, BigDecimal.ZERO));
    }

    @Test
    void refundOrder_throwsWhenAmountIsNegative() {
        Order order = new Order();
        order.setStripeSessionId("sess_123");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class,
                () -> orderService.refundOrder(1L, new BigDecimal("-10.00")));
    }

    @Test
    void refundOrder_throwsWhenAmountExceedsFinalPayment() {
        Order order = new Order();
        order.setStripeSessionId("sess_123");
        order.setFinalPaymentAmount(new BigDecimal("50.00"));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> orderService.refundOrder(1L, new BigDecimal("75.00")));
        assertEquals("Refund amount cannot exceed the final payment amount.", ex.getMessage());
    }

    @Test
    void refundOrder_setsRefundPendingAndStoresRefundId() throws Exception {
        Order order = new Order();
        order.setStripeSessionId("sess_123");
        order.setFinalPaymentAmount(new BigDecimal("70.00"));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        Refund mockRefund = mock(Refund.class);
        when(mockRefund.getId()).thenReturn("re_test123");
        when(stripeService.createRefund("sess_123", 5000L)).thenReturn(mockRefund);

        orderService.refundOrder(1L, new BigDecimal("50.00"));

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(captor.capture());
        assertEquals(OrderStatus.REFUND_PENDING, captor.getValue().getStatus());
        assertEquals("re_test123", captor.getValue().getStripeRefundId());
    }

    @Test
    void refundOrder_allowsRefundEqualToFinalPayment() throws Exception {
        Order order = new Order();
        order.setStripeSessionId("sess_123");
        order.setFinalPaymentAmount(new BigDecimal("70.00"));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        Refund mockRefund = mock(Refund.class);
        when(mockRefund.getId()).thenReturn("re_test123");
        when(stripeService.createRefund(anyString(), anyLong())).thenReturn(mockRefund);

        assertDoesNotThrow(() -> orderService.refundOrder(1L, new BigDecimal("70.00")));
    }

    // --- handleStripeEvent: charge.refund.updated ---

    @Test
    void handleStripeEvent_refundSucceeded_setsRefundedAndDeletesPhotos() throws Exception {
        Order order = new Order();
        order.getPhotoUrls().add("photo-key-1");
        when(orderRepository.findByStripeRefundId("re_test123")).thenReturn(Optional.of(order));

        Event event = mock(Event.class);
        when(event.getType()).thenReturn("charge.refund.updated");
        when(event.getId()).thenReturn("evt_test");

        String payload = """
                {"data":{"object":{"id":"re_test123","status":"succeeded"}}}
                """;

        orderService.handleStripeEvent(event, payload);

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(captor.capture());
        assertEquals(OrderStatus.REFUNDED, captor.getValue().getStatus());
        verify(s3Service).deleteFile("photo-key-1", "test-bucket");
        verify(emailService).sendRefundConfirmation(any());
        verify(textingService).sendText(any(), any());
    }

    @Test
    void handleStripeEvent_refundFailed_revertsToPayInFull() throws Exception {
        Order order = new Order();
        order.setStripeRefundId("re_test123");
        when(orderRepository.findByStripeRefundId("re_test123")).thenReturn(Optional.of(order));

        Event event = mock(Event.class);
        when(event.getType()).thenReturn("charge.refund.updated");
        when(event.getId()).thenReturn("evt_test");

        String payload = """
                {"data":{"object":{"id":"re_test123","status":"failed"}}}
                """;

        orderService.handleStripeEvent(event, payload);

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(captor.capture());
        assertEquals(OrderStatus.PAID_IN_FULL, captor.getValue().getStatus());
        assertNull(captor.getValue().getStripeRefundId());
        verifyNoInteractions(s3Service, emailService, textingService);
    }

    @Test
    void handleStripeEvent_refundUpdated_unknownRefundId_doesNotSave() throws Exception {
        when(orderRepository.findByStripeRefundId("re_unknown")).thenReturn(Optional.empty());

        Event event = mock(Event.class);
        when(event.getType()).thenReturn("charge.refund.updated");
        when(event.getId()).thenReturn("evt_test");

        String payload = """
                {"data":{"object":{"id":"re_unknown","status":"succeeded"}}}
                """;

        orderService.handleStripeEvent(event, payload);

        verify(orderRepository, never()).save(any());
    }

    // --- handleStripeEvent: checkout.session.completed ---

    @Test
    void handleStripeEvent_checkoutCompleted_depositTransitionsToInProgress() throws Exception {
        Order order = new Order();
        order.setStatus(OrderStatus.AWAITING_DEPOSIT);
        order.setPhoneNumber("5555555555");
        order.setEmail("test@example.com");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        Event event = mock(Event.class);
        when(event.getType()).thenReturn("checkout.session.completed");
        when(event.getId()).thenReturn("evt_test");

        String payload = """
                {"data":{"object":{"client_reference_id":"1"}}}
                """;

        orderService.handleStripeEvent(event, payload);

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(captor.capture());
        assertEquals(OrderStatus.IN_PROGRESS, captor.getValue().getStatus());
        assertTrue(captor.getValue().isDepositPaid());
    }

    @Test
    void handleStripeEvent_checkoutCompleted_finalPaymentTransitionsToPaidInFull() throws Exception {
        Order order = new Order();
        order.setStatus(OrderStatus.AWAITING_FINAL_PAYMENT);
        order.setPhoneNumber("5555555555");
        order.setEmail("test@example.com");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        Event event = mock(Event.class);
        when(event.getType()).thenReturn("checkout.session.completed");
        when(event.getId()).thenReturn("evt_test");

        String payload = """
                {"data":{"object":{"client_reference_id":"1"}}}
                """;

        orderService.handleStripeEvent(event, payload);

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(captor.capture());
        assertEquals(OrderStatus.PAID_IN_FULL, captor.getValue().getStatus());
        assertTrue(captor.getValue().isFullPaymentPaid());
    }
}
