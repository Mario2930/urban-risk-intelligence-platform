package br.com.fiap.urbanrisk.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.fiap.urbanrisk.model.RiskEvent;

@Repository
public interface RiskEventRepository extends JpaRepository<RiskEvent, Long> {

    List<RiskEvent> findAllByOrderByPriorityScoreDescCreatedAtDesc();

    long countByNeighborhoodIgnoreCaseAndRiskTypeIgnoreCaseAndStatus(
            String neighborhood, String riskType, String status
    );
}