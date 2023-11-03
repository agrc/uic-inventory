using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features;
[ApiController]
public class NaicsController(Lazy<NaicsProvider> naicsProvider) : ControllerBase {
    private readonly Lazy<NaicsProvider> _naicsProvider = naicsProvider;

    [HttpGet("/api/naics/{naicsCode}")]
    [ResponseCache(Duration = 2592000)]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public ActionResult<IEnumerable<NaicsModel>> GetNaicsCodePairs(string naicsCode) =>
      Ok(_naicsProvider.Value.GetCodesFor(naicsCode));

    [HttpGet("/api/naics/{naicsCode}/single")]
    [ResponseCache(Duration = 2592000)]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public ActionResult<NaicsModel> GetSingleNaicsCodePairs(string naicsCode) =>
      Ok(_naicsProvider.Value.NaicsCodes.Find(x => x.Code.ToString() == naicsCode).Value);

    [HttpGet("/api/naics/codes")]
    [ResponseCache(Duration = 2592000)]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public ActionResult<IEnumerable<int>> NaicsCodes() => Ok(_naicsProvider.Value.AllNaicsCodes
        .Where(x => x.Code.ToString().Length == 6)
        .Select(x => x.Code)
        .Distinct());
}
