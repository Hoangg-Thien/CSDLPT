package controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import routing.FailoverDataSourceManager;
import routing.Region;
import routing.RegionResolver;
import routing.SystemStatus;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    private final RegionResolver regionResolver;
    private final FailoverDataSourceManager failoverDataSourceManager;

    public SystemController(
            RegionResolver regionResolver,
            FailoverDataSourceManager failoverDataSourceManager) {
        this.regionResolver = regionResolver;
        this.failoverDataSourceManager = failoverDataSourceManager;
    }

    @GetMapping("/status")
    public ResponseEntity<SystemStatus> getStatus(
            @RequestParam(name = "region", required = false) Region region,
            @RequestParam(name = "province", required = false) String province,
            @RequestParam(name = "latitude", required = false) Double latitude,
            @RequestParam(name = "longitude", required = false) Double longitude) {
        Region resolvedRegion = regionResolver.resolve(
                region == null ? null : region.name(),
                province,
                latitude,
                longitude);
        return ResponseEntity.ok(failoverDataSourceManager.getSystemStatus(resolvedRegion));
    }
}
