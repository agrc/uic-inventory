using System.Collections.Generic;

namespace api.Features;
public abstract class ResponseContract {
    protected ResponseContract(IReadOnlyList<ApiError>? errors = null) {
        Errors = errors;
    }
    protected ResponseContract(string message) {
        var parts = message.Split(':');

        Errors = [new(parts[1], parts[0])];
    }

    public IReadOnlyList<ApiError>? Errors { get; }
}

public class ApiError(string message, string code) {
    public string Message { get; } = message;
    public string Code { get; } = code;
}
