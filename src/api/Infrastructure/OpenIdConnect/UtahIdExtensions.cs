using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.Extensions.DependencyInjection;

namespace api.Infrastructure {
  public static class UtahIdExtensions {
    public static AuthenticationBuilder AddUtahIdAuthentication(this IServiceCollection services, OAuthOptions utahId, string claims = "openid profile email") =>
    services.AddAuthentication(options => {
      options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
      options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddOpenIdConnect(options => {
      options.Authority = utahId.Authority;
      options.GetClaimsFromUserInfoEndpoint = true;
      options.RequireHttpsMetadata = true;

      options.ClientId = utahId.ClientId;
      options.ClientSecret = utahId.ClientSecret;

      options.ResponseType = "code";
      options.UsePkce = true;

      options.Scope.Clear();
      options.Scope.Add(claims);
    });
  }
}
