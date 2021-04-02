using api.Features.DistributedAuth;
using api.Features.OpenIdConnect;
using api.Features.Queries;
using api.Infrastructure;
using Autofac;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace api {
  public class Startup {
    public Startup(IConfiguration configuration) {
      Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services) {
      var redis = Configuration.GetSection("Redis").Get<RedisOptions>();
      services.AddDistributedAuthentication(redis);

      var utahId = Configuration.GetSection("UtahId").Get<OAuthOptions>();
      services.AddUtahIdAuthentication(utahId);

      var database = Configuration.GetSection("CloudSql").Get<DatabaseOptions>();
      services.AddPooledDbContextFactory<AppDbContext>(
        options => options.UseNpgsql(database.ConnectionString));

      // services.AddPooledDbContextFactory<SomeDbContext>(b => b /*your configuration */)
      services.AddPersistantStorage(database);

      services.AddAuthorization(options => {
        options.AddPolicy(CookieAuthenticationDefaults.AuthenticationScheme,
          policy => policy.RequireAuthenticatedUser());
      });

      services.AddControllers();

      services.AddGraphQLServer()
        .AddQueryType<AccountQuery>()
        .AddProjections();

      services.Configure<ForwardedHeadersOptions>(options => {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        options.KnownNetworks.Clear();
        options.KnownProxies.Clear();
      });
    }

    public void ConfigureContainer(ContainerBuilder builder) => builder.AddComputationMediator();

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
      if (env.IsDevelopment()) {
        app.UseDeveloperExceptionPage();
      }

      app.UseForwardedHeaders();

      app.UseRouting();

      app.UseAuthentication();
      app.UseAuthorization();

      app.UseEndpoints(endpoints => {
        endpoints.MapControllers();
        endpoints.MapGraphQL();
      });
    }
  }
}
