using System;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using api.Features.Naics;
using api.Infrastructure;
using Autofac;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
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
      services.AddCors()
        .AddHttpContextAccessor();

      if (Env.IsDevelopment()) {
        services.AddHostedService<SpaProxyLaunchManager>();
      }

      var redis = Configuration.GetSection("Redis").Get<RedisOptions>();
      services.AddDistributedAuthentication(redis);

      var utahId = Configuration.GetSection("UtahId").Get<OAuthOptions>();
      services.AddUtahIdAuthentication(utahId);

      var database = Configuration.GetSection("CloudSql").Get<DatabaseOptions>();
      // add context for graphql
      services.AddPooledDbContextFactory<AppDbContext>(options => {
        options.UseNpgsql(database.ConnectionString)
               .UseSnakeCaseNamingConvention();

        // if (Env.IsDevelopment()) {
        //   options.LogTo(Console.WriteLine);
        // }
      });

      // add context for computations
      services.AddDbContext<AppDbContext>(
        options => options.UseNpgsql(database.ConnectionString));

      services.AddAuthorization(options => {
        options.AddPolicy(CookieAuthenticationDefaults.AuthenticationScheme,
          policy => policy.RequireAuthenticatedUser());
      });

      services.AddControllers().AddJsonOptions(options => {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
      });

      services.AddSingleton(new Lazy<NaicsProvider>(() => new NaicsProvider()));

      services.Configure<ForwardedHeadersOptions>(options => {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        options.KnownNetworks.Clear();
        options.KnownProxies.Clear();
      });
    }

    public void ConfigureContainer(ContainerBuilder builder) {
      builder.RegisterType<OwnershipResolver>().As<IHasOwnership>();
      builder.AddComputationMediator();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
      var redirectUrl = "/";
      if (env.IsDevelopment()) {
        app.UseDeveloperExceptionPage();
        redirectUrl = "http://localhost:3000";
      }

      app.UseForwardedHeaders();

      app.UseStaticFiles(new StaticFileOptions {
        OnPrepareResponse = ctx => {
          ctx.Context.Response.Headers.Append(
               "Cache-Control", $"public, max-age={604800}");
        }
      });

      app.UseRouting();

      app.UseAuthentication();
      app.UseAuthorization();

      app.UseEndpoints(endpoints => {
        endpoints.MapGet("/api/logout", async context => {
          await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
          context.Response.Redirect(redirectUrl);
        }).RequireAuthorization();

        endpoints.MapGet("/api/login", context => {
          context.Response.Redirect(redirectUrl);
          return Task.CompletedTask;
        }).RequireAuthorization();

        endpoints.MapGet("/api/naics/{naicsCode}", async (context) => {
          var naicsProvider = endpoints.ServiceProvider.GetService<Lazy<NaicsProvider>>();
          var naicsCode = context.Request.RouteValues["naicsCode"]?.ToString() ?? string.Empty;

          if (naicsProvider?.Value is null) {
            await context.Response.WriteAsync("di fail");

            return;
          }

          context.Response.Headers["Cache-Control"] = new("max-age=2592000");
          await context.Response.WriteAsJsonAsync(naicsProvider.Value.GetCodesFor(naicsCode));
        });

        endpoints.MapControllers();

        endpoints.MapFallbackToFile("index.html");
      });
    }
  }
}
