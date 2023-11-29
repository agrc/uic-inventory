using System;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace api.Features;
public static class Transfer {
    public class Command(): IRequest<string> {
        public class Handler(IConfiguration configuration, ILogger log) : IRequestHandler<Command, string> {
            private readonly ILogger _log = log;
            private readonly IConfiguration _configuration = configuration;

            public async Task<string> Handle(Command request, CancellationToken token) {
                _log.ForContext("input", request)
                 .Debug("testing database connection");

                var database = _configuration.GetSection("InternalDatabase").Get<DatabaseOptions>();

                using var session = new SqlConnection(database?.SqlServerConnectionString);

                try {
                    await session.OpenAsync(token);
                } catch (SqlException ex) {
                    _log.Fatal(ex, "Sql Exception connecting to the database");

                    return ex.Message;
                }

                return "Pass";
            }
        }
    }
}
