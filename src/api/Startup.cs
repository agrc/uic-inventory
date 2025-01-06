using System;
using System.Net.Http;
using System.Reflection;
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
using Npgsql;
using Polly;
using SendGrid.Extensions.DependencyInjection;

namespace api;
public class Startup(IConfiguration configuration) {
    public IConfiguration Configuration { get; } = configuration;

    public void ConfigureServices(IServiceCollection services) {
        services.AddCors()
          .AddHttpContextAccessor();

        services.AddMediatR(config => config.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        services.AddMediatorAuthorization(typeof(Startup).Assembly);
        services.AddAuthorizersFromAssembly(typeof(Startup).Assembly);

        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(PerformanceLogger<,>));
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));

        services.AddScoped<HasRequestMetadata>();
        services.AddScoped<IWaterSystemContactService, WaterSystemContactService>();
        services.AddScoped<CloudStorageService>();
        services.AddScoped<GroundWaterService>();

        services.AddSingleton(new Lazy<NaicsProvider>(() => new NaicsProvider()));
        services.AddSingleton<EmailService>();
        services.AddSingleton<ICloudFileNamer, FileNamingService>();

        var database = Configuration.GetSection("CloudSql").Get<DatabaseOptions>();

        var dataSourceBuilder = new NpgsqlDataSourceBuilder(database?.ConnectionString ?? throw new ArgumentNullException(nameof(database)));
        dataSourceBuilder.MapEnum<AccessLevels>();
        dataSourceBuilder.MapEnum<NotificationTypes>();
        dataSourceBuilder.MapEnum<ContactTypes>();
        dataSourceBuilder.MapEnum<SiteStatus>();
        dataSourceBuilder.MapEnum<InventoryStatus>();
        dataSourceBuilder.EnableDynamicJson();
        var dataSource = dataSourceBuilder.Build();

        services.AddDbContext<AppDbContext>(options => options
            .UseNpgsql(dataSource, o => {
                o.MapEnum<AccessLevels>("access_levels");
                o.MapEnum<NotificationTypes>("notification_types");
                o.MapEnum<ContactTypes>("contact_types");
                o.MapEnum<SiteStatus>("site_status");
                o.MapEnum<InventoryStatus>("inventory_status");
            })
            .UseSnakeCaseNamingConvention());

        var redis = Configuration.GetSection("Redis").Get<RedisOptions>();

        ArgumentException.ThrowIfNullOrEmpty(redis?.Configuration, "UtahId:Redis:Configuration");

        services.AddDistributedAuthentication(redis);

        var utahId = Configuration.GetSection("UtahId").Get<OAuthOptions>();

        ArgumentException.ThrowIfNullOrEmpty(utahId?.ClientSecret, "UtahId:ClientSecret");
        ArgumentException.ThrowIfNullOrEmpty(utahId?.ClientId, "UtahId:ClientId");

        services.AddUtahIdAuthentication(utahId, ["openid", "profile", "email"]);

        services.AddAuthorization(options => {
            options.AddPolicy(CookieAuthenticationDefaults.AuthenticationScheme,
              policy => {
                  policy.RequireAuthenticatedUser();
                  policy.RequireClaim(ClaimTypes.NameIdentifier);
              });
        });

        var quickTimeoutPolicy = Policy.TimeoutAsync<HttpResponseMessage>(10);
        var longTimeoutPolicy = Policy.TimeoutAsync<HttpResponseMessage>(180);

        services.AddHttpClient("esri")
          .AddPolicyHandler(quickTimeoutPolicy)
          .AddTransientHttpErrorPolicy(policyBuilder =>
            policyBuilder.WaitAndRetryAsync(3, _ => TimeSpan.FromMilliseconds(600)));

        services.AddHttpClient("google")
          .AddPolicyHandler(longTimeoutPolicy)
          .AddTransientHttpErrorPolicy(policyBuilder =>
            policyBuilder.WaitAndRetryAsync(3, _ => TimeSpan.FromMilliseconds(600)));

        services.AddSendGrid(options => options.ApiKey = Configuration["Sendgrid:Key"]);

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
            redirectUrl = "http://localhost:5173/signin-oidc";
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
                context.Response.Redirect("/");
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
