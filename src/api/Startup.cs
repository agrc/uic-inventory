using System;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using api.Features;
using api.Infrastructure;
using MediatR;
using MediatR.Behaviors.Authorization.Extensions.DependencyInjection;
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

      services.AddMediatR(typeof(Startup));
      services.AddMediatorAuthorization(typeof(Startup).Assembly);
      services.AddAuthorizersFromAssembly(typeof(Startup).Assembly);

      services.AddScoped(typeof(IPipelineBehavior<,>), typeof(PerformanceLogger<,>));
      services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));

      services.AddSingleton(new Lazy<NaicsProvider>(() => new NaicsProvider()));
      services.AddScoped<HasRequestMetadata>();

      var database = Configuration.GetSection("CloudSql").Get<DatabaseOptions>();

      services.AddEntityFrameworkNpgsql()
        .AddDbContext<AppDbContext>(options => options
          .UseNpgsql(database.ConnectionString)
          .UseSnakeCaseNamingConvention());

      services.AddScoped<IAppDbContext, AppDbContext>();

      var redis = Configuration.GetSection("Redis").Get<RedisOptions>();
      services.AddDistributedAuthentication(redis);

      var utahId = Configuration.GetSection("UtahId").Get<OAuthOptions>();
      services.AddUtahIdAuthentication(utahId);

      services.AddAuthorization(options => {
        options.AddPolicy(CookieAuthenticationDefaults.AuthenticationScheme,
          policy => {
            policy.RequireAuthenticatedUser();
            policy.RequireClaim(ClaimTypes.NameIdentifier);
          });
      });

      services.AddControllers().AddJsonOptions(options => {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
      });

      services.Configure<ForwardedHeadersOptions>(options => {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        options.KnownNetworks.Clear();
        options.KnownProxies.Clear();
      });
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

        endpoints.MapControllers();

        endpoints.MapFallbackToFile("index.html");
      });
    }
  }
}
