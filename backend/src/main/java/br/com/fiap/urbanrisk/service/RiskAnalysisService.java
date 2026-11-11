package br.com.fiap.urbanrisk.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Service;

import br.com.fiap.urbanrisk.model.RiskEvent;
import br.com.fiap.urbanrisk.repository.RiskEventRepository;
import jakarta.annotation.PostConstruct;

@Service
public class RiskAnalysisService {

    private final RiskEventRepository repository;
    private final Random random = new Random();

    public RiskAnalysisService(RiskEventRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void seedInitialData() {
        if (repository.count() == 0) {
            createAndAnalyzeEvent(new RiskEvent(
                    "ALAGAMENTO",
                    "Ipiranga",
                    "Sensor ultrassônico detectou elevação rápida de lâmina d'água (82 cm) próximo ao córrego.",
                    "SENSOR",
                    "IOT-HIDRO-SP09",
                    82.0
            ));
            createAndAnalyzeEvent(new RiskEvent(
                    "ILHA_DE_CALOR",
                    "Bela Vista",
                    "Inmet/Defesa Civil: Temperatura de superfície atingiu 41.5°C com umidade abaixo de 18%.",
                    "BASE_PUBLICA",
                    "DEFESA-CIVIL-SP",
                    41.5
            ));
            createAndAnalyzeEvent(new RiskEvent(
                    "INTERRUPCAO_SERVICO",
                    "Vila Mariana",
                    "Relato comunitário: Queda de energia elétrica em 3 quarteirões afetando semáforos.",
                    "COMUNIDADE",
                    "MORADOR-HASH-8F2A",
                    7.5
            ));
        }
    }

    public void resetDatabase() {
        repository.deleteAll();
        seedInitialData();
    }

    public RiskEvent evaluateRiskMetrics(RiskEvent event, long corroboratingEventsCount) {
        double baseConfidence;
        String source = event.getSourceType() != null ? event.getSourceType().toUpperCase() : "COMUNIDADE";

        switch (source) {
            case "SENSOR":
                baseConfidence = 0.94;
                break;
            case "BASE_PUBLICA":
                baseConfidence = 0.88;
                break;
            default:
                baseConfidence = 0.65;
                break;
        }

        if (corroboratingEventsCount > 0) {
            baseConfidence = Math.min(0.98, baseConfidence + (0.12 * corroboratingEventsCount));
        }
        event.setConfidenceLevel(Math.round(baseConfidence * 100.0) / 100.0);

        double riskWeight;
        double normalizedReading;
        String type = event.getRiskType() != null ? event.getRiskType().toUpperCase() : "ALAGAMENTO";
        double val = event.getReadingValue() != null ? event.getReadingValue() : 5.0;

        if ("ALAGAMENTO".equals(type)) {
            riskWeight = 1.25;
            normalizedReading = Math.min(100.0, (val / 100.0) * 100.0);
        } else if ("INTERRUPCAO_SERVICO".equals(type)) {
            riskWeight = 1.10;
            normalizedReading = Math.min(100.0, val * 10.0);
        } else {
            riskWeight = 1.05;
            normalizedReading = Math.min(100.0, Math.max(0.0, (val - 25.0) * 5.0));
        }

        int rawScore = (int) Math.round(normalizedReading * riskWeight * event.getConfidenceLevel());
        int finalScore = Math.max(10, Math.min(100, rawScore));
        event.setPriorityScore(finalScore);

        if (finalScore >= 80) {
            event.setPriorityLevel("CRITICO");
        } else if (finalScore >= 60) {
            event.setPriorityLevel("ALTO");
        } else if (finalScore >= 40) {
            event.setPriorityLevel("MEDIO");
        } else {
            event.setPriorityLevel("BAIXO");
        }

        if (event.getStatus() == null) {
            event.setStatus("ATIVO");
        }
        if (event.getCreatedAt() == null) {
            event.setCreatedAt(LocalDateTime.now());
        }
        if (event.getReporterAnonId() == null || event.getReporterAnonId().isBlank()) {
            event.setReporterAnonId("ANON-" + System.currentTimeMillis() % 10000);
        }

        return event;
    }

    public RiskEvent createAndAnalyzeEvent(RiskEvent event) {
        long existingInArea = repository.countByNeighborhoodIgnoreCaseAndRiskTypeIgnoreCaseAndStatus(
                event.getNeighborhood(), event.getRiskType(), "ATIVO"
        );
        RiskEvent analyzed = evaluateRiskMetrics(event, existingInArea);
        return repository.save(analyzed);
    }

    public List<RiskEvent> listPrioritizedEvents() {
        return repository.findAllByOrderByPriorityScoreDescCreatedAtDesc();
    }

    public Map<String, Object> getDashboardIndicators() {
        List<RiskEvent> all = listPrioritizedEvents();
        long criticalCount = all.stream().filter(e -> "CRITICO".equals(e.getPriorityLevel())).count();
        long highCount = all.stream().filter(e -> "ALTO".equals(e.getPriorityLevel())).count();
        double avgConfidence = all.stream()
                .mapToDouble(RiskEvent::getConfidenceLevel)
                .average()
                .orElse(0.0);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalEvents", all.size());
        dashboard.put("criticalAlerts", criticalCount);
        dashboard.put("highAlerts", highCount);
        dashboard.put("averageConfidence", Math.round(avgConfidence * 100));
        dashboard.put("aiEngineStatus", "ONLINE - Cross-Source Heuristic v1.0");
        dashboard.put("lastServerUpdate", LocalDateTime.now().toString());
        return dashboard;
    }

    public RiskEvent simulateRealtimeSensorReading() {
        String[] types = {"ALAGAMENTO", "ILHA_DE_CALOR", "INTERRUPCAO_SERVICO"};
        String[] neighborhoods = {"Ipiranga", "Mooca", "Pinheiros", "Tatuapé", "Lins de Vasconcelos"};
        String[] sources = {"SENSOR", "BASE_PUBLICA", "COMUNIDADE"};

        String type = types[random.nextInt(types.length)];
        String neighborhood = neighborhoods[random.nextInt(neighborhoods.length)];
        String source = sources[random.nextInt(sources.length)];

        double reading;
        String desc;
        if ("ALAGAMENTO".equals(type)) {
            reading = 45 + random.nextInt(55);
            desc = "Acumulado crítico de chuva detectado (" + (int) reading + " cm na via).";
        } else if ("ILHA_DE_CALOR".equals(type)) {
            reading = 36 + random.nextInt(8);
            desc = "Anomalia térmica urbana registrada (" + reading + " °C em área densa).";
        } else {
            reading = 6 + random.nextInt(5);
            desc = "Interrupção de abastecimento/rede elétrica com severidade " + (int) reading + "/10.";
        }

        RiskEvent simulated = new RiskEvent(
                type,
                neighborhood,
                desc,
                source,
                source + "-SIM-" + (100 + random.nextInt(900)),
                reading
        );
        return createAndAnalyzeEvent(simulated);
    }
}