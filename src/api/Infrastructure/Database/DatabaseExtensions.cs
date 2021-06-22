using System.Reflection;
using api.GraphQL;
using HotChocolate.Execution.Configuration;
using HotChocolate.Types;
using HotChocolate.Types.Descriptors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace api.Infrastructure {
  public static class DatabaseExtensions {
    public static IRequestExecutorBuilder AddGraphQL(this IServiceCollection services, IWebHostEnvironment env) {
      var gqlBuilder = services.AddGraphQLServer()
        .AddQueryType(x => x.Name("Query"))
        .AddType<AccountQueries>()
        .AddDataLoader<AccountByIdDataLoader>()
        .AddType<NotificationQueries>()
        .AddDataLoader<NotificationByIdDataLoader>()
        .AddType<SiteQueries>()
        .AddDataLoader<SiteByIdDataLoader>()
        .AddType<ContactQueries>()
        .AddMutationType(x => x.Name("Mutation"))
        .AddType<AccountMutations>()
        .AddType<AccountType>()
        .AddType<NotificationMutations>()
        .AddType<SiteMutations>()
        .AddType<SiteType>()
        .AddType<ContactMutations>()
        .AddType<ContactTypes>()
        .AddProjections();

      if (!env.IsDevelopment()) {
        gqlBuilder.AddAuthorization();
      }

      return gqlBuilder;
    }
  }

  public class UseApplicationDbContextAttribute : ObjectFieldDescriptorAttribute {
    public override void OnConfigure(
        IDescriptorContext context,
        IObjectFieldDescriptor descriptor,
        MemberInfo member) => descriptor.UseDbContext<AppDbContext>();
  }
}
