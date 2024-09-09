using api.Features;

using Xunit;

namespace api.tests;

public class GroundWaterArdaCheckTests {
    [Theory]
    [InlineData(true, true, "Y+")]
    [InlineData(false, true, "Y-")]
    [InlineData(true, false, "S")]
    [InlineData(false, false, "N")]
    public void Test1(bool aquifer, bool groundWater, string expected) {
        var has = new GroundWaterService.Protections(aquifer, groundWater);
        var code = GroundWaterService.DetermineCode(has);

        Assert.Equal(code, expected);
    }
}
