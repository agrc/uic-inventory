using System;
using api.Features.UserRegistration;
using api.Infrastructure;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace api.Features.DistributedAuth {
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

          options.ForwardChallenge = OpenIdConnectDefaults.AuthenticationScheme;
          options.LoginPath = "/authentication/login";
          options.AccessDeniedPath = "/authentication/access-denied";
          options.LogoutPath = "/";
        }).PostConfigure<IComputeMediator>((options, mediator) => {
          options.Events.OnSignedIn = context => {
            var computation = new AccountProvisioning.Computation(context.Principal.Claims);

            return mediator.Handle(computation, default);
          };
        });

      return services;
    }
  }
}
