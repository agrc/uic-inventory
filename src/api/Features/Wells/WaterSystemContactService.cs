using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using Serilog;

namespace api.Features;
public interface IWaterSystemContactService {
    Task<IEnumerable<WaterSystemContact>> GetContactsAsync(IReadOnlyList<string> items, CancellationToken cancellationToken);
}

public class WaterSystemContactService(IConfiguration config, ILogger log) : IWaterSystemContactService {
    private readonly ILogger _log = log;
    private readonly string _connectionString = config.GetSection("GroundWaterContacts")["Connection"] ?? throw new ArgumentNullException(nameof(config));

    public async Task<IEnumerable<WaterSystemContact>> GetContactsAsync(IReadOnlyList<string> items, CancellationToken cancellationToken) {
        using var conn = new OracleConnection(_connectionString);

        try {
            await conn.OpenAsync(cancellationToken);
            using var cmd = conn.CreateCommand();
            cmd.CommandTimeout = 30;

            cmd.CommandText = "SELECT AC_NAME AS name, AC_EMAIL AS email, SYSTEM_NAME as system " +
                              "FROM UTAHDDW.VW_WATER_SYSTEM_ADMIN_CONTACTS " +
                              "WHERE " + string.Join(" OR ", Enumerable.Repeat("PWD_ID=:waterSystem", items.Count));

            foreach (var item in items) {
                cmd.Parameters.Add(new OracleParameter("waterSystem", OracleDbType.Char, item, ParameterDirection.Input));
            }

            var contacts = new Collection<WaterSystemContact>();
            var reader = await cmd.ExecuteReaderAsync(cancellationToken);

            while (await reader.ReadAsync(cancellationToken)) {
                _log.Debug("reading rows {fields}", reader.HasRows);
                var contact = new WaterSystemContact(
                  await reader.IsDBNullAsync(0, cancellationToken) ? string.Empty : reader.GetString(0),
                  await reader.IsDBNullAsync(1, cancellationToken) ? string.Empty : reader.GetString(1),
                  await reader.IsDBNullAsync(1, cancellationToken) ? string.Empty : reader.GetString(2)
                );

                contacts.Add(contact);
            }
            await reader.DisposeAsync();

            return contacts;
        } catch (OracleException e) {
            _log.Fatal("Error querying oracle {message}", e.Message);
        }

        return [];
    }
}
