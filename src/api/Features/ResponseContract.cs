using System.Collections.Generic;

namespace api.Features {
  public abstract class ResponseContract {
    protected ResponseContract(IReadOnlyList<ApiError>? errors = null) {
      Errors = errors;
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
