using System;
using System.Collections.Generic;
using System.Linq;

namespace api.Features.Naics {
  public struct NaicsModel {
    public NaicsModel(double code, string value) {
      Code = Convert.ToInt32(code);
      Value = value;
    }

    public int Code { get; set; }
    public string Value { get; set; }

    public static IEnumerable<NaicsModel> CreateNaicsFromRange(string range, string value) {
      if (!range.Contains("-")) {
        return Enumerable.Empty<NaicsModel>();
      }

      var ranges = range.Split('-');
      var low = Convert.ToInt32(ranges[0]);
      var high = Convert.ToInt32(ranges[1]);

      return Enumerable.Range(low, high - low + 1).Select(x => new NaicsModel(x, value));
    }
  }
}
