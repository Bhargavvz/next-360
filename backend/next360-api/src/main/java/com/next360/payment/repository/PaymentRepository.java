package com.next360.payment.repository;

import com.next360.payment.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {

    List<PaymentEntity> findByOrderId(UUID orderId);

    Optional<PaymentEntity> findByGatewayPaymentId(String gatewayPaymentId);

    Optional<PaymentEntity> findByGatewayOrderId(String gatewayOrderId);
}
