package com.rideapp;

import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class FailoverIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @AfterAll
    void ensurePrimaryIsStarted() throws Exception {
        if (isDockerAvailable()) {
            runDockerCommand("start", "pg-south-primary");
            waitForSouthPrimaryReady(Duration.ofSeconds(40));
        }
    }

    @Test
    void tc3_shouldReadHistoryFromReplicaWhenPrimaryIsDown() throws Exception {
        Assumptions.assumeTrue(isDockerAvailable(), "Docker is required for failover integration tests");

        stopSouthPrimary();
        try {
            mockMvc.perform(get("/api/rides/history/{userId}", 1L)
                            .param("province", "ho chi minh")
                            .param("isReadOnly", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(greaterThan(0)));
        } finally {
            startSouthPrimaryAndWait();
        }
    }

    @Test
    void tc4_shouldBlockWriteWhenPrimaryIsDown() throws Exception {
        Assumptions.assumeTrue(isDockerAvailable(), "Docker is required for failover integration tests");

        stopSouthPrimary();
        try {
            String requestBody = """
                    {
                      "userId": 1,
                      "driverId": 1,
                      "pickup": "TC4 Pickup",
                      "dropoff": "TC4 Dropoff"
                    }
                    """;

            mockMvc.perform(post("/api/rides/book")
                            .param("province", "ho chi minh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isServiceUnavailable())
                    .andExpect(jsonPath("$.mode").value("READ_ONLY"));
        } finally {
            startSouthPrimaryAndWait();
        }
    }

    @Test
    void tc5_shouldAllowWriteAfterPrimaryRecovery() throws Exception {
        Assumptions.assumeTrue(isDockerAvailable(), "Docker is required for failover integration tests");

        stopSouthPrimary();
        startSouthPrimaryAndWait();

        String requestBody = """
                {
                  "userId": 1,
                  "driverId": 1,
                  "pickup": "TC5 Pickup Recovery",
                  "dropoff": "TC5 Dropoff Recovery"
                }
                """;

        mockMvc.perform(post("/api/rides/book")
                        .param("province", "ho chi minh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.region").value("SOUTH"));
    }

    private void stopSouthPrimary() throws Exception {
        runDockerCommand("stop", "pg-south-primary");
        waitForSouthPrimaryStopped(Duration.ofSeconds(30));
    }

    private void startSouthPrimaryAndWait() throws Exception {
        runDockerCommand("start", "pg-south-primary");
        waitForSouthPrimaryReady(Duration.ofSeconds(40));
    }

    private boolean isDockerAvailable() {
        try {
            CommandResult result = runCommand("docker", "version");
            return result.exitCode == 0;
        } catch (Exception ex) {
            return false;
        }
    }

    private void waitForSouthPrimaryStopped(Duration timeout) throws Exception {
        Instant deadline = Instant.now().plus(timeout);
        while (Instant.now().isBefore(deadline)) {
            CommandResult result = runCommand("docker", "inspect", "-f", "{{.State.Running}}", "pg-south-primary");
            if (result.exitCode == 0 && result.output.trim().equalsIgnoreCase("false")) {
                return;
            }
            Thread.sleep(1000);
        }
        throw new IllegalStateException("Timed out waiting for pg-south-primary to stop");
    }

    private void waitForSouthPrimaryReady(Duration timeout) throws Exception {
        Instant deadline = Instant.now().plus(timeout);
        while (Instant.now().isBefore(deadline)) {
            CommandResult runningCheck = runCommand("docker", "inspect", "-f", "{{.State.Running}}", "pg-south-primary");
            if (runningCheck.exitCode == 0 && runningCheck.output.trim().equalsIgnoreCase("true")) {
                CommandResult readyCheck = runCommand("docker", "exec", "pg-south-primary", "pg_isready", "-U", "admin", "-d", "rideapp");
                if (readyCheck.exitCode == 0) {
                    return;
                }
            }
            Thread.sleep(1000);
        }
        throw new IllegalStateException("Timed out waiting for pg-south-primary to become ready");
    }

    private void runDockerCommand(String... args) throws Exception {
        String[] command = new String[args.length + 1];
        command[0] = "docker";
        System.arraycopy(args, 0, command, 1, args.length);
        CommandResult result = runCommand(command);
        if (result.exitCode != 0) {
            throw new IllegalStateException("Docker command failed: " + String.join(" ", command) + "\n" + result.output);
        }
    }

    private CommandResult runCommand(String... command) throws IOException, InterruptedException {
        Process process = new ProcessBuilder(command).redirectErrorStream(true).start();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        process.getInputStream().transferTo(baos);
        int exitCode = process.waitFor();
        String output = baos.toString(StandardCharsets.UTF_8);
        return new CommandResult(exitCode, output);
    }

    private record CommandResult(int exitCode, String output) {
    }
}
