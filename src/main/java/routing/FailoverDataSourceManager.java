package routing;

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
            Connection connection = primary.getConnection();
            connection.setReadOnly(isReadOnly);
            return connection;
        } catch (SQLException primaryException) {
            Connection fallbackConnection = replica.getConnection();
            fallbackConnection.setReadOnly(isReadOnly);
            return fallbackConnection;
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