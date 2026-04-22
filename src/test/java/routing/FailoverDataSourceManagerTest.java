package routing;

import exception.ServiceUnavailableException;
import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FailoverDataSourceManagerTest {

    @Test
    void shouldFallbackToReplicaForReadOnlyWhenPrimaryIsDown() throws SQLException {
        DataSource southPrimary = mock(DataSource.class);
        DataSource southReplica = mock(DataSource.class);
        DataSource northPrimary = mock(DataSource.class);
        DataSource northReplica = mock(DataSource.class);

        Connection replicaConnection = mock(Connection.class);
        when(southPrimary.getConnection()).thenThrow(new SQLException("primary down"));
        when(southReplica.getConnection()).thenReturn(replicaConnection);
        when(replicaConnection.isValid(2)).thenReturn(true);

        FailoverDataSourceManager manager = new FailoverDataSourceManager(
                southPrimary, southReplica, northPrimary, northReplica);

        Connection connection = manager.getConnection(Region.SOUTH, true);

        assertSame(replicaConnection, connection);
        verify(replicaConnection).setReadOnly(true);
    }

    @Test
    void shouldThrowServiceUnavailableForWriteWhenPrimaryIsDown() throws SQLException {
        DataSource southPrimary = mock(DataSource.class);
        DataSource southReplica = mock(DataSource.class);
        DataSource northPrimary = mock(DataSource.class);
        DataSource northReplica = mock(DataSource.class);

        when(southPrimary.getConnection()).thenThrow(new SQLException("primary down"));

        FailoverDataSourceManager manager = new FailoverDataSourceManager(
                southPrimary, southReplica, northPrimary, northReplica);

        assertThrows(ServiceUnavailableException.class, () -> manager.getConnection(Region.SOUTH, false));
        verify(southReplica, never()).getConnection();
    }
}
