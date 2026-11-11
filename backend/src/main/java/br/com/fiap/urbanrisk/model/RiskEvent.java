package br.com.fiap.urbanrisk.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_risk_events")
public class RiskEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String riskType;

    @Column(nullable = false)
    private String neighborhood;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false)
    private String sourceType;

    @Column(nullable = false)
    private String reporterAnonId;

    @Column(nullable = false)
    private Double readingValue;

    @Column(nullable = false)
    private Double confidenceLevel;

    @Column(nullable = false)
    private Integer priorityScore;

    @Column(nullable = false)
    private String priorityLevel;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public RiskEvent() {
    }

    public RiskEvent(String riskType, String neighborhood, String description,
                     String sourceType, String reporterAnonId, Double readingValue) {
        this.riskType = riskType;
        this.neighborhood = neighborhood;
        this.description = description;
        this.sourceType = sourceType;
        this.reporterAnonId = reporterAnonId;
        this.readingValue = readingValue;
        this.status = "ATIVO";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRiskType() { return riskType; }
    public void setRiskType(String riskType) { this.riskType = riskType; }

    public String getNeighborhood() { return neighborhood; }
    public void setNeighborhood(String neighborhood) { this.neighborhood = neighborhood; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }

    public String getReporterAnonId() { return reporterAnonId; }
    public void setReporterAnonId(String reporterAnonId) { this.reporterAnonId = reporterAnonId; }

    public Double getReadingValue() { return readingValue; }
    public void setReadingValue(Double readingValue) { this.readingValue = readingValue; }

    public Double getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(Double confidenceLevel) { this.confidenceLevel = confidenceLevel; }

    public Integer getPriorityScore() { return priorityScore; }
    public void setPriorityScore(Integer priorityScore) { this.priorityScore = priorityScore; }

    public String getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(String priorityLevel) { this.priorityLevel = priorityLevel; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}