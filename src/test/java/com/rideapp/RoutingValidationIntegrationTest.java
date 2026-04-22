package com.rideapp;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class RoutingValidationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnBadRequestForUnknownProvince() throws Exception {
        mockMvc.perform(get("/api/rides/history/{userId}", 1L)
                        .param("province", "unknown-province")
                        .param("isReadOnly", "true"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unsupported province: unknown-province"));
    }

    @Test
    void shouldReturnBadRequestForConflictingRegionAndProvince() throws Exception {
        mockMvc.perform(get("/api/rides/history/{userId}", 1L)
                        .param("region", "NORTH")
                        .param("province", "ho chi minh")
                        .param("isReadOnly", "true"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Conflicting routing inputs: region=NORTH, province=SOUTH"));
    }
}
