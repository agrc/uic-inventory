using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Home {

  [ApiController]
  [Route("[controller]")]
  public class HomeController : ControllerBase {
    [HttpGet("/")]
    public string Home() => "Hello World";

    [Authorize]
    [HttpGet("/claims")]
    public Dictionary<string, string> Roles() => HttpContext.User.Claims.ToDictionary(key => key.Type, x => x.Value);

    [Authorize]
    [HttpGet("/logout")]
    public async Task<string> Logout() {
      await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

      return "bye";
    }
  }
}
