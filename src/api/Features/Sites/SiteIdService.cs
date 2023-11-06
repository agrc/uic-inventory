using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.IdentityModel.Tokens;
using Serilog;

namespace api.Features;
public interface ISiteIdService {
    Task<string> GetSiteId(Site site, CancellationToken cancellationToken);
}

public class SiteIdService(IHttpClientFactory clientFactory, ILogger log) : ISiteIdService {
    private readonly ILogger _log = log;
    private readonly HttpClient _client = clientFactory.CreateClient("esri");
    private const string CountyBoundaryUrl = "https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahCountyBoundaries/FeatureServer/0/query";
    public async Task<string> GetSiteId(Site site, CancellationToken token) {
        if (site.SiteId is not null && !site.SiteId.Trim().IsNullOrEmpty()) {
            _log.ForContext("site", site)
            .Debug("Site already has a site id {siteId}. skipping.", site.SiteId);

            return site.SiteId;
        }

        if (site.Geometry is null || site.Geometry.Trim().IsNullOrEmpty()) {
            _log.ForContext("site", site)
            .Debug("Site does not have a geometry. Cannot generate site id.");

            return string.Empty;
        }

        using var formContent = new FormUrlEncodedContent(new Dictionary<string, string> {
                    { "where", string.Empty },
                    { "geometry", site.Geometry },
                    { "geometryType", "esriGeometryPolygon" },
                    { "spatialRel", "esriSpatialRelIntersects" },
                    { "returnGeometry", false.ToString() },
                    { "outFields", "FIPS" },
                    { "f", "json" }
                });
        using var response = await _client.PostAsync(CountyBoundaryUrl, formContent, token);

        var options = new JsonSerializerOptions {
            PropertyNameCaseInsensitive = true
        };

        using var content = await response.Content.ReadAsStreamAsync(token);

        var queryResult = await JsonSerializer.DeserializeAsync<SiteEsriQueryResponse>(content, options, cancellationToken: token);

        if (queryResult is null || queryResult?.IsSuccessful != true) {
            _log.ForContext("queryResult", queryResult)
              .Error("Failed to query {id} for fips code", site.Id);

            return string.Empty;
        }

        _log.Debug("Fips query result {@queryResult} for {siteId}", queryResult, site.Id);

        var success = queryResult.Count > 0 || queryResult.Features.Count > 0;

        if (!success) {
            _log.ForContext("queryResult", queryResult)
              .Error("Failed to query {id} for fips code", site.Id);

            return string.Empty;
        }

        var fipsResults = queryResult.Features.Select(x => x.Attributes.Fips)
                      .Distinct() ?? Enumerable.Empty<int>();

        _log.Debug("Fips: {@fips}", fipsResults);

        var fips = fipsResults.First();

        return $"UTU{fips:00}S{Guid.NewGuid().ToString()[..8].ToUpperInvariant()}";
    }
}
