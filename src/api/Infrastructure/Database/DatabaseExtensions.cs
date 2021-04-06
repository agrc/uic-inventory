using api.Features.Mutations;
using api.Features.Queries;
using HotChocolate.Execution.Configuration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace api.Infrastructure {
  public static class DatabaseExtensions {
    public static IRequestExecutorBuilder AddGraphQL(this IServiceCollection services, IWebHostEnvironment env) {
      var gqlBuilder = services.AddGraphQLServer()
        .AddQueryType<AccountQuery>()
        .AddMutationType<AccountMutation>()
        .AddProjections();

      if (!env.IsDevelopment()) {
        gqlBuilder.AddAuthorization();
      }

      return gqlBuilder;
    }
  }
}
