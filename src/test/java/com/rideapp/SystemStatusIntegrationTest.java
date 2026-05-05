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
class SystemStatusIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnSystemStatusForResolvedRegion() throws Exception {
        mockMvc.perform(get("/api/system/status")
                        .param("province", "ho chi minh"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.region").value("SOUTH"))
                .andExpect(jsonPath("$.mode").exists())
                .andExpect(jsonPath("$.activeNode").exists());
    }
}
