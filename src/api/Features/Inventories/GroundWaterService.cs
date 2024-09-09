using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Extensions;
using Serilog;

namespace api.Features;
public class GroundWaterService(IHttpClientFactory clientFactory, IWaterSystemContactService service, ILogger log) {
    public record ProtectionResult(int WellId, string Service, bool Intersects, IReadOnlyList<ArcGisRestFeatureWell> Features);
    public record ProtectionQuery(int WellId, string Service, string Url);
    public record Protections(bool Aquifers, bool GroundWater);
    public record GroundWaterInput(int Id, string? Geometry);
    public record WaterSystemContact(string Name, string Email, string System);
    public record WellWaterSystemContacts(string SurfaceWaterProtection, List<WaterSystemContact> Contacts);

    private const string AquiferRechargeDischargeAreas = "https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/Aquifer_RechargeDischargeAreas/FeatureServer/0";
    private const string GroundWaterFeatureServiceUrl = "https://services2.arcgis.com/NnxP4LZ3zX8wWmP9/ArcGIS/rest/services/Utah_DDW_Groundwater_Source_Protection_Zones/FeatureServer/4";
    private readonly HttpClient _client = clientFactory.CreateClient("esri");
    private readonly IWaterSystemContactService _service = service;
    private readonly ILogger _log = log;
    private readonly List<ProtectionQuery> _urls = [];
    private readonly Dictionary<int, List<ProtectionResult>> _queryResults = [];
    private readonly Dictionary<int, WellWaterSystemContacts> _result = [];
    private readonly string[] _groundWaterCodes = ["Y+", "Y-"];

    public async Task<Dictionary<int, WellWaterSystemContacts>> GetWaterSystemContactsAsync(IEnumerable<GroundWaterInput> wells, CancellationToken cancellationToken) {
        _log.Debug("Handling well ground water protection intersections");

        foreach (var well in wells) {
            if (well.Geometry is null) {
                continue;
            }

            var queryString = new QueryBuilder {
                    { "where", string.Empty },
                    { "geometry", well.Geometry },
                    { "geometryType", "esriGeometryPoint" },
                    { "spatialRel", "esriSpatialRelIntersects" },
                    { "returnCountOnly", true.ToString() },
                    { "f", "json" }
                };

            var gwzQueryString = new QueryBuilder {
                    { "where", string.Empty },
                    { "geometry", well.Geometry },
                    { "geometryType", "esriGeometryPoint" },
                    { "spatialRel", "esriSpatialRelIntersects" },
                    { "returnGeometry", false.ToString() },
                    { "outFields", "SYSNUMBER" },
                    { "f", "json" }
                };

            _urls.Add(new ProtectionQuery(
              well.Id,
              "Aquifer Recharge/Discharge Areas",
              $"{AquiferRechargeDischargeAreas}/query?{queryString}")
            );

            _urls.Add(new ProtectionQuery(
              well.Id,
              "Ground Water",
              $"{GroundWaterFeatureServiceUrl}/query?{gwzQueryString}")
            );

            _queryResults[well.Id] = [];
        }

        var options = new JsonSerializerOptions {
            PropertyNameCaseInsensitive = true
        };

        await Task.WhenAll(_urls.Select(async item => {
            using var response = await _client.GetAsync(item.Url, cancellationToken);
            using var content = await response.Content.ReadAsStreamAsync(cancellationToken);

            var queryResult = await JsonSerializer.DeserializeAsync<WellEsriQueryResponse>(content, options, cancellationToken: cancellationToken);

            if (queryResult is null || queryResult?.IsSuccessful != true) {
                _log.ForContext("queryResult", queryResult?.Error)
                  .Error("Failed to query well {id} for water protection intersections {@error}", item.WellId, queryResult?.Error);

                return;
            }

            _log.Debug("Got {@queryResult} result for {wellId}", queryResult, item.WellId);

            var success = queryResult.Count > 0 || queryResult.Features.Count > 0;

            _queryResults[item.WellId].Add(new ProtectionResult(item.WellId, item.Service, success, queryResult.Features));
        }));

        foreach (var item in _queryResults) {
            _log.Debug("Choosing code for {@item}", item);

            var has = new Protections(
              item.Value.Any(x => x.Service == "Aquifer Recharge/Discharge Areas" && x.Intersects),
              item.Value.Any(x => x.Service == "Ground Water" && x.Intersects)
            );

            var wellId = item.Key;
            var surfaceWaterProtection = DetermineCode(has);

            var contactsForWell = new List<WaterSystemContact>();

            if (_groundWaterCodes.Contains(surfaceWaterProtection)) {
                _log.Debug("Intersects GWZ, fetching contacts");

                var systemNumbers = item.Value.
                  SelectMany(x => x.Features.Select(x => x.Attributes.SysNumber))
                  .Distinct() ?? [];

                var pwdIds = systemNumbers.Select(x => $"UTAH{x}").ToList();

                var contacts = await _service.GetContactsAsync(pwdIds, cancellationToken);

                foreach (var contact in contacts) {
                    var name = contact.Name;

                    if (name.Contains(',')) {
                        var parts = name.Split(',');

                        name = $"{parts[1].Trim()} {parts[0].Trim()}";
                    }

                    contactsForWell.Add(new(name, contact.Email, contact.System));
                }
            }

            _result[wellId] = new(surfaceWaterProtection, contactsForWell);
        }

        return _result;
    }

    public static string DetermineCode(Protections has) => has switch {
        (Aquifers: true, GroundWater: true) => "Y+",
        (Aquifers: false, GroundWater: true) => "Y-",
        (Aquifers: true, GroundWater: false) => "S",
        (Aquifers: false, GroundWater: false) => "N",
        _ => "U",
    };
}
