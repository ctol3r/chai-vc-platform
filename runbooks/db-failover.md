# DB Failover

This runbook explains how to fail over to a standby database instance.

1. **Assess the primary DB**
   - Confirm that the primary database is unavailable or degraded.
   - Check replication status and timestamps on the standby.
2. **Promote the standby**
   - Use the database tooling to promote the replica.
     Example for PostgreSQL with Patroni:
     ```bash
     patronictl switchover --master <failed-node> --candidate <standby-node>
     ```
   - Update any load balancer or connection strings to point to the new primary.
3. **Restart dependent services**
   - Restart application pods or services that maintain persistent DB connections.
4. **Monitor and verify**
   - Ensure new writes succeed on the promoted node.
   - Plan to rebuild or re-sync the original primary before reintroducing it.
