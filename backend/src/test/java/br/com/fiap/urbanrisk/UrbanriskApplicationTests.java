package br.com.fiap.urbanrisk;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import br.com.fiap.urbanrisk.model.RiskEvent;
import br.com.fiap.urbanrisk.repository.RiskEventRepository;
import br.com.fiap.urbanrisk.service.RiskAnalysisService;

class UrbanriskApplicationTests {

    @Test
    void devePriorizarSensorDeAlagamentoSeveroComoCritico() {
        RiskEventRepository mockRepo = Mockito.mock(RiskEventRepository.class);
        RiskAnalysisService service = new RiskAnalysisService(mockRepo);

        RiskEvent sensorFlood = new RiskEvent(
                "ALAGAMENTO",
                "Ipiranga",
                "Nível crítico no córrego",
                "SENSOR",
                "IOT-01",
                90.0
        );

        RiskEvent result = service.evaluateRiskMetrics(sensorFlood, 1L);

        Assertions.assertTrue(result.getConfidenceLevel() >= 0.94);
        Assertions.assertTrue(result.getPriorityScore() >= 80);
        Assertions.assertEquals("CRITICO", result.getPriorityLevel());
    }

    @Test
    void deveAumentarConfiancaDeRelatoComunitarioComCorroboracaoCruzada() {
        RiskEventRepository mockRepo = Mockito.mock(RiskEventRepository.class);
        RiskAnalysisService service = new RiskAnalysisService(mockRepo);

        RiskEvent singleReport = new RiskEvent(
                "INTERRUPCAO_SERVICO", "Mooca", "Sem luz", "COMUNIDADE", "ANON-1", 7.0
        );
        RiskEvent corroboratedReport = new RiskEvent(
                "INTERRUPCAO_SERVICO", "Mooca", "Sem luz na rua toda", "COMUNIDADE", "ANON-2", 7.0
        );

        service.evaluateRiskMetrics(singleReport, 0L);
        service.evaluateRiskMetrics(corroboratedReport, 2L);

        Assertions.assertTrue(corroboratedReport.getConfidenceLevel() > singleReport.getConfidenceLevel());
    }
}