package routing;

import exception.ServiceUnavailableException;
import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class FailoverDataSourceManager {

    private final DataSource southPrimaryDS;
    private final DataSource southReplicaDS;
    private final DataSource northPrimaryDS;
    private final DataSource northReplicaDS;

    public FailoverDataSourceManager(
            @Qualifier("southPrimaryDS") DataSource southPrimaryDS,
            @Qualifier("southReplicaDS") DataSource southReplicaDS,
            @Qualifier("northPrimaryDS") DataSource northPrimaryDS,
            @Qualifier("northReplicaDS") DataSource northReplicaDS) {
        this.southPrimaryDS = southPrimaryDS;
        this.southReplicaDS = southReplicaDS;
        this.northPrimaryDS = northPrimaryDS;
        this.northReplicaDS = northReplicaDS;
    }

    public Connection getConnection(Region region, boolean isReadOnly) throws SQLException {
        DataSource primary = getPrimary(region);
        DataSource replica = getReplica(region);

        try {
            return getValidatedConnection(primary, isReadOnly, true);
        } catch (SQLException primaryException) {
            if (!isReadOnly) {
                throw new ServiceUnavailableException(
                        "Primary database is down. System switched to READ_ONLY mode.",
                        primaryException);
            }
            return getValidatedConnection(replica, isReadOnly, false);
        }
    }

    public SystemStatus getSystemStatus(Region region) {
        DataSource primary = getPrimary(region);
        DataSource replica = getReplica(region);

        try (Connection ignored = getValidatedConnection(primary, true, true)) {
            return new SystemStatus(region, "PRIMARY", "PRIMARY");
        } catch (SQLException primaryException) {
            try (Connection replicaConnection = getValidatedConnection(replica, true, false)) {
                return new SystemStatus(region, "READ_ONLY", "REPLICA");
            } catch (SQLException replicaException) {
                throw new ServiceUnavailableException(
                        "Both primary and replica databases are unavailable",
                        replicaException);
            }
        }
    }

    private Connection getValidatedConnection(DataSource dataSource, boolean isReadOnly, boolean primary)
            throws SQLException {
        Connection connection = dataSource.getConnection();
        try {
            connection.setReadOnly(isReadOnly);
            if (!connection.isValid(2)) {
                throw new SQLException((primary ? "Primary" : "Replica") + " connection is not valid");
            }
            return connection;
        } catch (SQLException ex) {
            try {
                connection.close();
            } catch (SQLException ignored) {
                // Best-effort cleanup.
            }
            throw ex;
        }
    }

    private DataSource getPrimary(Region region) {
        if (region == Region.NORTH) {
            return northPrimaryDS;
        }
        return southPrimaryDS;
    }

    private DataSource getReplica(Region region) {
        if (region == Region.NORTH) {
            return northReplicaDS;
        }
        return southReplicaDS;
    }
}
