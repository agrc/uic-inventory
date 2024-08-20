using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using api.Features;
using Moq;
using Moq.Protected;
using Serilog;
using Xunit;

namespace api.tests;

public class SiteIdServiceTests {

    [Theory]
    [InlineData("", "")]
    [InlineData("  ", " ")]
    [InlineData(null, null)]
    [InlineData(null, " ")]
    [InlineData(" ", null)]
    public async Task Should_return_empty_when_site_has_no_geometry_or_site_id(string? siteId, string? geometry) {
        var mockFactory = new Mock<IHttpClientFactory>();

        mockFactory.Setup(_ => _.CreateClient("esri"));

        var service = new SiteIdService(mockFactory.Object, new Mock<ILogger>() { DefaultValue = DefaultValue.Mock }.Object);

        var site = new Site {
            SiteId = siteId,
            Geometry = geometry
        };

        Assert.Equal(string.Empty, await service.GetSiteId(site, CancellationToken.None));
    }

    [Theory]
    [InlineData("Not empty", "")]
    [InlineData("Not empty", " ")]
    [InlineData("Not empty", null)]
    [InlineData("Not empty", "a polygon in utah")]
    public async Task Should_return_site_value_if_it_has_a_value(string siteId, string? geometry) {
        var mockFactory = new Mock<IHttpClientFactory>();

        mockFactory.Setup(_ => _.CreateClient("esri"));

        var service = new SiteIdService(mockFactory.Object, new Mock<ILogger>() { DefaultValue = DefaultValue.Mock }.Object);

        var site = new Site {
            SiteId = siteId,
            Geometry = geometry
        };

        Assert.Equal("Not empty", await service.GetSiteId(site, CancellationToken.None));
    }

    [Fact]
    public async Task Should_return_fips_value_formatted_as_a_site_id() {
        var responseJson = """{"objectIdFieldName":"OBJECTID","uniqueIdField":{"name":"OBJECTID","isSystemMaintained":true},"globalIdFieldName":"GlobalID","geometryType":"esriGeometryPolygon","spatialReference":{"wkid":102100,"latestWkid":3857},"fields":[{"name":"FIPS","type":"esriFieldTypeDouble","alias":"FIPS","sqlType":"sqlTypeOther","domain":null,"defaultValue":null}],"features":[{"attributes":{"FIPS":5}}]}""";

        var httpMessageHandler = new Mock<HttpMessageHandler>(MockBehavior.Strict);
        httpMessageHandler.Protected()

            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(new HttpResponseMessage() {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(responseJson),
            });

        var client = new HttpClient(httpMessageHandler.Object);
        var mockFactory = new Mock<IHttpClientFactory>();

        mockFactory.Setup(_ => _.CreateClient("esri"))
                   .Returns(client);

        var service = new SiteIdService(mockFactory.Object, new Mock<ILogger>() { DefaultValue = DefaultValue.Mock }.Object);

        var site = new Site {
            SiteId = string.Empty,
            Geometry = "a polygon in cache county"
        };

        var siteId = await service.GetSiteId(site, CancellationToken.None);

        Assert.Equal(14, siteId.Length);
        Assert.StartsWith("UTU05S", siteId);
    }
    [Fact]
    public async Task Should_return_fips_with_multiple_values_formatted_as_a_site_id() {
        var responseJson = """{"objectIdFieldName":"OBJECTID","uniqueIdField":{"name":"OBJECTID","isSystemMaintained":true},"globalIdFieldName":"GlobalID","geometryType":"esriGeometryPolygon","spatialReference":{"wkid":102100,"latestWkid":3857},"fields":[{"name":"FIPS","type":"esriFieldTypeDouble","alias":"FIPS","sqlType":"sqlTypeOther","domain":null,"defaultValue":null}],"features":[{"attributes":{"FIPS":5}},{"attributes":{"FIPS":9}}]}""";

        var httpMessageHandler = new Mock<HttpMessageHandler>(MockBehavior.Strict);
        httpMessageHandler.Protected()

            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(new HttpResponseMessage() {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(responseJson),
            });

        var client = new HttpClient(httpMessageHandler.Object);
        var mockFactory = new Mock<IHttpClientFactory>();

        mockFactory.Setup(_ => _.CreateClient("esri"))
                   .Returns(client);

        var service = new SiteIdService(mockFactory.Object, new Mock<ILogger>() { DefaultValue = DefaultValue.Mock }.Object);

        var site = new Site {
            SiteId = string.Empty,
            Geometry = "a polygon in multiple counties"
        };

        var siteId = await service.GetSiteId(site, CancellationToken.None);

        Assert.Equal(14, siteId.Length);
        Assert.StartsWith("UTU05S", siteId);
    }
    [Fact]
    public async Task Should_return_empty_when_no_fips_is_returned() {
        var responseJson = """{"objectIdFieldName":"OBJECTID","uniqueIdField":{"name":"OBJECTID","isSystemMaintained":true},"globalIdFieldName":"GlobalID","geometryType":"esriGeometryPolygon","spatialReference":{"wkid":102100,"latestWkid":3857},"fields":[{"name":"FIPS","type":"esriFieldTypeDouble","alias":"FIPS","sqlType":"sqlTypeOther","domain":null,"defaultValue":null}],"features":[]}""";

        var httpMessageHandler = new Mock<HttpMessageHandler>(MockBehavior.Strict);
        httpMessageHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(new HttpResponseMessage() {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(responseJson),
            });

        var client = new HttpClient(httpMessageHandler.Object);
        var mockFactory = new Mock<IHttpClientFactory>();

        mockFactory.Setup(_ => _.CreateClient("esri"))
                   .Returns(client);

        var service = new SiteIdService(mockFactory.Object, new Mock<ILogger>() { DefaultValue = DefaultValue.Mock }.Object);

        var site = new Site {
            SiteId = string.Empty,
            Geometry = "a polygon outside utah counties?"
        };

        var siteId = await service.GetSiteId(site, CancellationToken.None);

        Assert.StartsWith(string.Empty, siteId);
    }
}
