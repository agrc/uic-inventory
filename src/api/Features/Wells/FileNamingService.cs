using System;
using System.Text;

namespace api.Features {
  public interface ICloudFileNamer {
    string GenerateFileName(WellDetailInput wells);
    string CreateRangeFromArray(int[] items);
  }
  public class FileNamingService : ICloudFileNamer {
    public string GenerateFileName(WellDetailInput wells) {
      var site = wells.SiteId;
      var inventory = wells.InventoryId;
      var uploader = wells.AccountId;

      var wellIds = CreateRangeFromArray(wells.SelectedWells);

      return $"site({site})_inventory({inventory})_wells({wellIds})_uploadedBy({uploader})";
    }

    public string CreateRangeFromArray(int[] items) {
      var length = items.Length;

      if (length == 0) {
        return string.Empty;
      }

      if (length == 1) {
        return items[0].ToString();
      }

      Array.Sort(items);

      if (length == 2) {
        return string.Join(',', items);
      }

      var idBuilder = new StringBuilder();

      // build a string of ids. 1,3-5,7
      for (var i = 0; i < length; i++) {
        var startRange = items[i];
        var endRange = items[i];

        while (i + 1 < length && items[i] + 1 == items[i + 1]) {
          endRange = items[i + 1];
          i++;
        }

        if (idBuilder.Length > 0) {
          idBuilder.Append(',');
        }

        if (startRange == endRange) {
          idBuilder.Append(startRange);
        } else if (startRange + 1 == endRange) {
          idBuilder.Append(startRange).Append(',').Append(endRange);
        } else {
          idBuilder.Append(startRange).Append('-').Append(endRange);
        }
      }

      return idBuilder.ToString();
    }
  }
}
