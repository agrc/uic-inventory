using System.Collections.Generic;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace api.Infrastructure {
  public static class UtahIdExtensions {
    public static AuthenticationBuilder AddUtahIdAuthentication(this IServiceCollection services, OAuthOptions utahId, IEnumerable<string> claims) =>
    services.AddAuthentication(options => {
      options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
      options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
    })
    .AddCookie(options => {
      options.Cookie.SameSite = SameSiteMode.Lax;
      options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    })
    .AddOpenIdConnect(options => {
      options.NonceCookie.SecurePolicy = CookieSecurePolicy.Always;
      options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.Always;

      options.Authority = utahId.Authority;
      options.GetClaimsFromUserInfoEndpoint = true;
      options.RequireHttpsMetadata = true;

      options.ClientId = utahId.ClientId;
      options.ClientSecret = utahId.ClientSecret;

      options.ResponseType = "code";
      options.UsePkce = true;

      options.Scope.Clear();

      foreach (var claim in claims) {
        options.Scope.Add(claim);
      }
    });
  }
}
