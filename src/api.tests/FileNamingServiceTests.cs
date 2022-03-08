using api.Features;

using Xunit;

namespace api.tests;

public class FileNamingServiceTests {
  private readonly ICloudFileNamer _fileNamer = new FileNamingService();

  [Fact]
  public void Single_id_returns_single_id() =>
    Assert.Equal("1", _fileNamer.CreateRangeFromArray(new[] { 1 }));

  [Fact]
  public void Two_items_return_two_comma_separated_items() =>
    Assert.Equal("1,2", _fileNamer.CreateRangeFromArray(new[] { 1, 2 }));

  [Fact]
  public void Three_sequential_items_return_a_range() =>
    Assert.Equal("1-3", _fileNamer.CreateRangeFromArray(new[] { 1, 2, 3 }));

  [Fact]
  public void Multiple_sequential_items_return_a_range() =>
    Assert.Equal("1-11", _fileNamer.CreateRangeFromArray(new[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 }));

  [Fact]
  public void Split_sequential_items_return_a_comma_separated_range() =>
    Assert.Equal("1-3,5-11", _fileNamer.CreateRangeFromArray(new[] { 1, 2, 3, 5, 6, 7, 8, 9, 10, 11 }));

  [Fact]
  public void Varied_sequential_items_return_a_comma_separated_range() =>
    Assert.Equal("1,3,5,7-11", _fileNamer.CreateRangeFromArray(new[] { 1, 3, 5, 7, 8, 9, 10, 11 }));

  [Theory]
  [InlineData(new[] { 1, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15, 20 }, "1,3-5,7,8,10-15,20")]
  [InlineData(new[] { 1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13, 14, 15 }, "1-5,7,9-15")]
  [InlineData(new[] { 1, 3, 5, 7, 9, 15 }, "1,3,5,7,9,15")]
  public void Test(int[] input, string expected) {
    var actual = _fileNamer.CreateRangeFromArray(input);

    Assert.Equal(expected, actual);
  }
}
