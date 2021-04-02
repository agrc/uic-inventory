using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace api.Infrastructure {
  public static class DatabaseExtensions {
    public static IServiceCollection AddPersistantStorage(this IServiceCollection services, DatabaseOptions options) {
      services.AddScoped<NpgsqlConnection>(_ => new NpgsqlConnection(options.ConnectionString));

      return services;
    }
  }
}
