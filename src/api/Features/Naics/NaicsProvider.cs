using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using ExcelDataReader;
using Serilog;

namespace api.Features;
public class NaicsProvider {
    public List<NaicsModel> NaicsCodes { get; set; } = [];
    public List<NaicsModel> AllNaicsCodes { get; set; } = [];
    private readonly string _allNaicsPath;
    private readonly string _twoDigitCodesPath;
    private readonly int _codeColumn = 1;
    private readonly int _titleColumn = 2;
    private readonly int _skipRows = 2;
    private readonly int _currentRow = 0;

    private Dictionary<string, int[]> Exceptions { get; } = new Dictionary<string, int[]> {
    { "31-33", new[] {31, 33}},
    { "44-45",  new[] { 44, 45 }},
    { "48-49",  new[] { 48, 49 }},
  };

    public NaicsProvider() {
        _twoDigitCodesPath = Path.Combine(Directory.GetCurrentDirectory(), "Features", "Naics", "data", "2-6.digit_2022_Codes.xlsx");
        _allNaicsPath = Path.Combine(Directory.GetCurrentDirectory(), "Features", "Naics", "data", "2022_NAICS_Index_File.xlsx");

        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

        using var stream = File.Open(_twoDigitCodesPath, FileMode.Open, FileAccess.Read);
        using var reader = ExcelReaderFactory.CreateReader(stream);

        do {
            while (reader.Read()) {
                _currentRow++;

                if (_currentRow <= _skipRows) {
                    continue;
                }

                try {
                    NaicsCodes.Add(new NaicsModel(reader.GetDouble(_codeColumn),
                                                  reader.GetString(_titleColumn)));
                } catch (InvalidCastException) {
                    NaicsCodes.AddRange(NaicsModel.CreateNaicsFromRange(reader.GetString(_codeColumn),
                                                                        reader.GetString(_titleColumn)));
                }
            }
        } while (reader.NextResult());

        _currentRow = 0;
        _skipRows = 1;
        _codeColumn = 0;
        _titleColumn = 1;

        using var stream2 = File.Open(_allNaicsPath, FileMode.Open, FileAccess.Read);
        using var reader2 = ExcelReaderFactory.CreateReader(stream2);
        do {
            while (reader2.Read()) {
                _currentRow++;

                if (_currentRow <= _skipRows) {
                    continue;
                }
                var code = 0D;
                try {
                    code = reader2.GetDouble(_codeColumn);
                } catch (InvalidCastException) {
                    continue;
                    // TODO: log
                }

                AllNaicsCodes.Add(new NaicsModel(code, reader2.GetString(_titleColumn)));
            }
        } while (reader2.NextResult());
    }

    public IEnumerable<NaicsModel> GetCodesFor(string naicsCode) {
        var start = 0D;
        var end = 0D;
        var depth = naicsCode.Length;

        if (int.TryParse(naicsCode, out var code)) {
            start = code * 10;
            end = start + 9;
        } else {
            depth = 2;

            if (Exceptions.TryGetValue(naicsCode, out var value)) {
                start = value[0] * Math.Pow(10, depth - 1);
                end = (Exceptions[naicsCode][^1] * Math.Pow(10, depth - 1)) + 9;
            }
        }

        Log.Information("Finding codes between {start} and {end}", start, end);

        if (depth == 6) {
            if (code == -1) {
                return Enumerable.Empty<NaicsModel>();
            }

            return AllNaicsCodes.Where(x => x.Code == code);
        } else {
            return NaicsCodes.Where(x => x.Code >= start && x.Code <= end);
        }
    }
}
