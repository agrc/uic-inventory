using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using api.Features;
using MediatR;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace api.Infrastructure {
  public static class DistributedCacheExtensions {
    public static IServiceCollection AddDistributedAuthentication(this IServiceCollection services, RedisOptions redisOptions) {
      var redis = ConnectionMultiplexer.Connect(redisOptions.Configuration);

      services.AddStackExchangeRedisCache(options => options.Configuration = redisOptions.Configuration);

      services.AddSingleton<ITicketStore, RedisTicketStore>();
      services.AddSingleton<IConnectionMultiplexer>(redis);

      services.AddDataProtection().PersistKeysToStackExchangeRedis(redis, "data-protection-key");

      services.AddOptions<CookieAuthenticationOptions>(CookieAuthenticationDefaults.AuthenticationScheme)
        .Configure<ITicketStore>((options, store) => {
          options.Cookie.Name = ".auth-ticket.auth";
          options.SessionStore = store;
          options.ExpireTimeSpan = TimeSpan.FromHours(1);

          options.ForwardChallenge = null; //OpenIdConnectDefaults.AuthenticationScheme;
          options.LoginPath = "/authentication/login";
          options.AccessDeniedPath = "/authentication/access-denied";
          options.LogoutPath = "/";
        }).PostConfigure<IServiceProvider>((options, provider) => {
          options.Events.OnRedirectToAccessDenied = context => {
            context.Response.Headers["Location"] = context.RedirectUri;
            context.Response.StatusCode = 401;

            return Task.CompletedTask;
          };
          options.Events.OnSignedIn = async (context) => {
            var claims = context.Principal?.Claims ?? Enumerable.Empty<Claim>();

            var computation = new AccountProvisioning.Computation(claims);

            var mediator = provider.CreateScope().ServiceProvider.GetRequiredService<IMediator>();

            var sendNotification = await mediator.Send(computation, default);

            if (sendNotification) {
              await mediator.Publish(new AccountNotifications.AccountNotification {
                Account = computation.Account,
                Type = NotificationTypes.new_user_account_registration
              });
            }
          };
        });

      return services;
    }
  }
}
