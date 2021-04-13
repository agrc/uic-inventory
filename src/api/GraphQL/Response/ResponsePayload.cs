using System.Collections.Generic;

namespace api.GraphQL {
  public abstract class Payload {
    protected Payload(IReadOnlyList<UserError>? errors = null) {
      Errors = errors;
    }

    public IReadOnlyList<UserError>? Errors { get; }
  }

  public class UserError {
    public UserError(string message, string code) {
      Message = message;
      Code = code;
    }

    public string Message { get; }
    public string Code { get; }
  }

}
