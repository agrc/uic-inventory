using System.Collections.Generic;

namespace api.Features {
  public abstract class ResponseContract {
    protected ResponseContract(IReadOnlyList<ApiError>? errors = null) {
      Errors = errors;
    }
    protected ResponseContract(string message) {
      var parts = message.Split(':');

      Errors = new List<ApiError> { new ApiError(parts[1], parts[0]) };
    }

    public IReadOnlyList<ApiError>? Errors { get; }
  }

  public class ApiError {
    public ApiError(string message, string code) {
      Message = message;
      Code = code;
    }

    public string Message { get; }
    public string Code { get; }
  }
}
