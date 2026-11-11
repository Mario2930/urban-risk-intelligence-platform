package br.com.fiap.urbanrisk.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.fiap.urbanrisk.model.RiskEvent;
import br.com.fiap.urbanrisk.service.RiskAnalysisService;

@RestController
@RequestMapping("/api/risks")
@CrossOrigin(origins = "*")
public class RiskEventController {

    private final RiskAnalysisService service;

    public RiskEventController(RiskAnalysisService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<RiskEvent>> getAllPrioritized() {
        return ResponseEntity.ok(service.listPrioritizedEvents());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardSummary() {
        return ResponseEntity.ok(service.getDashboardIndicators());
    }

    @PostMapping
    public ResponseEntity<RiskEvent> createEvent(@RequestBody RiskEvent event) {
        RiskEvent saved = service.createAndAnalyzeEvent(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/simulate")
    public ResponseEntity<RiskEvent> simulateSensorEvent() {
        RiskEvent simulated = service.simulateRealtimeSensorReading();
        return ResponseEntity.status(HttpStatus.CREATED).body(simulated);
    }
}