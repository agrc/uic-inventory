using System;
using System.Collections.Generic;
using System.Linq;

namespace api.Features;
public struct NaicsModel(double code, string value) {
    public int Code { get; set; } = Convert.ToInt32(code);
    public string Value { get; set; } = value.Trim();

    public static IEnumerable<NaicsModel> CreateNaicsFromRange(string range, string value) {
        if (!range.Contains('-')) {
            return Enumerable.Empty<NaicsModel>();
        }

        var ranges = range.Split('-');
        var low = Convert.ToInt32(ranges[0]);
        var high = Convert.ToInt32(ranges[1]);

        return Enumerable.Range(low, high - low + 1).Select(x => new NaicsModel(x, value));
    }
}
