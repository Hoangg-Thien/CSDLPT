package com.rideapp.routing;

public record SystemStatus(
        Region region,
        String mode,
        String activeNode) {
}
