package routing;

import java.text.Normalizer;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class LocationRouter {

    private static final double NORTH_SOUTH_LATITUDE_BOUNDARY = 16.0;

    private static final Set<String> NORTH_PROVINCES = Set.of(
            "ha noi",
            "hai phong",
            "quang ninh",
            "bac ninh",
            "hai duong",
            "hung yen",
            "nam dinh",
            "ninh binh",
            "thai binh",
            "vinh phuc",
            "phu tho",
            "thai nguyen",
            "bac giang",
            "lao cai",
            "yen bai",
            "ha giang",
            "cao bang",
            "lang son",
            "tuyen quang",
            "son la",
            "lai chau",
            "dien bien",
            "hoa binh",
            "nghe an",
            "ha tinh",
            "thanh hoa",
            "quang binh",
            "quang tri",
            "thua thien hue");

    private static final Set<String> SOUTH_PROVINCES = Set.of(
            "ho chi minh",
            "tp ho chi minh",
            "can tho",
            "dong nai",
            "binh duong",
            "ba ria vung tau",
            "tay ninh",
            "binh phuoc",
            "long an",
            "tien giang",
            "ben tre",
            "tra vinh",
            "vinh long",
            "dong thap",
            "an giang",
            "kien giang",
            "hau giang",
            "soc trang",
            "bac lieu",
            "ca mau",
            "lam dong",
            "dak lak",
            "dak nong",
            "gia lai",
            "kon tum",
            "binh thuan",
            "ninh thuan",
            "khanh hoa",
            "phu yen",
            "binh dinh",
            "quang ngai",
            "quang nam",
            "da nang");

    public Region routeByProvince(String province) {
        if (province == null || province.isBlank()) {
            throw new IllegalArgumentException("Province must not be blank");
        }

        String normalized = normalizeText(province);

        if (NORTH_PROVINCES.contains(normalized)) {
            return Region.NORTH;
        }

        if (SOUTH_PROVINCES.contains(normalized)) {
            return Region.SOUTH;
        }

        // For unknown names, fall back to NORTH to avoid writing to southern shard by
        // mistake.
        return Region.NORTH;
    }

    public Region routeByGPS(double latitude, double longitude) {
        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("Latitude out of range: " + latitude);
        }
        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("Longitude out of range: " + longitude);
        }

        return latitude >= NORTH_SOUTH_LATITUDE_BOUNDARY ? Region.NORTH : Region.SOUTH;
    }

    private String normalizeText(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase()
                .trim();
        return normalized.replaceAll("\\s+", " ");
    }
}