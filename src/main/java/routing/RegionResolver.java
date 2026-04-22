package routing;

import org.springframework.stereotype.Component;

@Component
public class RegionResolver {

    private final LocationRouter locationRouter;

    public RegionResolver(LocationRouter locationRouter) {
        this.locationRouter = locationRouter;
    }

    public Region resolve(
            String explicitRegion,
            String province,
            Double latitude,
            Double longitude) {
        Region regionFromExplicit = parseExplicitRegion(explicitRegion);
        Region regionFromProvince = resolveByProvince(province);
        Region regionFromGps = resolveByGps(latitude, longitude);

        validateConsistency(regionFromExplicit, regionFromProvince, "region", "province");
        validateConsistency(regionFromExplicit, regionFromGps, "region", "gps");
        validateConsistency(regionFromProvince, regionFromGps, "province", "gps");

        if (regionFromExplicit != null) {
            return regionFromExplicit;
        }
        if (regionFromProvince != null) {
            return regionFromProvince;
        }
        if (regionFromGps != null) {
            return regionFromGps;
        }

        throw new IllegalArgumentException(
                "Region is required. Provide region or province or latitude/longitude");
    }

    private Region parseExplicitRegion(String explicitRegion) {
        if (explicitRegion == null || explicitRegion.isBlank()) {
            return null;
        }
        try {
            return Region.valueOf(explicitRegion.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Unsupported region: " + explicitRegion, ex);
        }
    }

    private Region resolveByProvince(String province) {
        if (province == null || province.isBlank()) {
            return null;
        }
        return locationRouter.routeByProvince(province);
    }

    private Region resolveByGps(Double latitude, Double longitude) {
        if (latitude == null && longitude == null) {
            return null;
        }
        if (latitude == null || longitude == null) {
            throw new IllegalArgumentException("Both latitude and longitude are required when using GPS routing");
        }
        return locationRouter.routeByGPS(latitude, longitude);
    }

    private void validateConsistency(
            Region left,
            Region right,
            String leftSource,
            String rightSource) {
        if (left != null && right != null && left != right) {
            throw new IllegalArgumentException(
                    "Conflicting routing inputs: " + leftSource + "=" + left + ", " + rightSource + "=" + right);
        }
    }
}
