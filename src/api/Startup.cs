using System;
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
    public Startup(IConfiguration configuration, IWebHostEnvironment env) {
      Configuration = configuration;
      Env = env;
    }

    public IConfiguration Configuration { get; }
    public IWebHostEnvironment Env;

    public void ConfigureServices(IServiceCollection services) {
      services.AddCors();

      var redis = Configuration.GetSection("Redis").Get<RedisOptions>();
      services.AddDistributedAuthentication(redis);

      var utahId = Configuration.GetSection("UtahId").Get<OAuthOptions>();
      services.AddUtahIdAuthentication(utahId);

      var database = Configuration.GetSection("CloudSql").Get<DatabaseOptions>();
      // add context for graphql
      services.AddPooledDbContextFactory<AppDbContext>(
        options => options
          .UseNpgsql(database.ConnectionString)
          .LogTo(Console.WriteLine));

      // add context for computations
      services.AddDbContext<AppDbContext>(
        options => options.UseNpgsql(database.ConnectionString));

      services.AddAuthorization(options => {
        options.AddPolicy(CookieAuthenticationDefaults.AuthenticationScheme,
          policy => policy.RequireAuthenticatedUser());
      });

      services.AddControllers();

      services.AddGraphQL(Env);

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
      app.UseCors(options => options.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());

      app.UseAuthentication();
      app.UseAuthorization();

      app.UseEndpoints(endpoints => {
        endpoints.MapControllers();
        endpoints.MapGraphQL();
      });
    }
  }
}
