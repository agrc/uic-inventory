using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace api.Features.UserRegistration {
  public class AccountProvisioning {
    public class Computation : IComputation<Task> {
      public NpgsqlParameter[] Parameters { get; } = new NpgsqlParameter[5];

      private readonly string[] _keys = new string[] { "nameidentifier", "givenname", "surname", "username", "emailaddress" };
      private readonly string[] _columnNames = new string[] { "utah_id", "first_name", "last_name", "username", "email" };

      public Computation(IEnumerable<Claim> claims) {
        // _claims = claims.ToDictionary<string, string>(key => key.Type, value => value.Value);
        var i = 0;
        foreach (var claim in claims) {
          var shortName = claim.Type.Split('/').Last();
          var index = Array.IndexOf(_keys, shortName);

          if (index < 0) {
            continue;
          }

          Parameters[i] = new() {
            ParameterName = _columnNames[index],
            Value = claim.Value,
            DbType = DbType.String
          };

          i++;
        }
      }
    }

    public class Handler : IComputationHandler<Computation, Task> {
      private readonly AppDbContext _context;

      private const string _upsert = @"
      insert
        into
        public.accounts (utah_id,
        first_name,
        last_name,
        email)
      values (@utah_id,
      @first_name,
      @last_name,
      @email) on
      conflict (utah_id) do
      update
      set
        last_name = excluded.last_name,
        email = excluded.email,
        first_name = excluded.first_name;";

      public Handler(AppDbContext context) {
        _context = context;
      }

      public async Task<Task> Handle(Computation computation, CancellationToken cancellationToken) {
        using var command = _context.Database.GetDbConnection().CreateCommand();

        await command.Connection.OpenAsync();
        command.CommandText = _upsert;
        command.Parameters.AddRange(computation.Parameters);

        await command.PrepareAsync(cancellationToken);

        using var reader = await command.ExecuteReaderAsync(cancellationToken);

        await command.Connection.CloseAsync();

        return Task.FromResult(Task.CompletedTask);
      }
    }
  }
}
