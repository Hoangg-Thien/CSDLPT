package routing;

public record SystemStatus(
        Region region,
        String mode,
        String activeNode) {
}
