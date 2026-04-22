package controller;

import entity.Ride;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import routing.Region;
import service.RideService;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    @PostMapping("/book")
    public ResponseEntity<Ride> bookRide(
            @RequestBody Ride ride,
            @RequestParam(name = "province", required = false) String province,
            @RequestParam(name = "latitude", required = false) Double latitude,
            @RequestParam(name = "longitude", required = false) Double longitude,
            @RequestParam(name = "isReadOnly", defaultValue = "false") boolean isReadOnly) {
        Ride createdRide = rideService.bookRide(ride, isReadOnly, province, latitude, longitude);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRide);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Ride>> getHistory(
            @PathVariable Long userId,
            @RequestParam(name = "region", required = false) Region region,
            @RequestParam(name = "province", required = false) String province,
            @RequestParam(name = "latitude", required = false) Double latitude,
            @RequestParam(name = "longitude", required = false) Double longitude,
            @RequestParam(name = "isReadOnly", defaultValue = "true") boolean isReadOnly) {
        List<Ride> rideHistory = rideService.getHistory(userId, region, province, latitude, longitude, isReadOnly);
        return ResponseEntity.ok(rideHistory);
    }
}
