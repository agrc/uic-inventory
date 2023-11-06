using System;
using System.Collections.Generic;

namespace api.Infrastructure;
public class RestEndpointError {
    public int Code { get; set; }
    public string? Message { get; set; }
    public IReadOnlyCollection<object> Details { get; set; } = Array.Empty<object>();
}
public abstract class RestErrorable {
    public virtual RestEndpointError Error { get; set; } = default!;
    public virtual bool IsSuccessful => Error == null;
}

public class EsriPoint(double x, double y) {
    public double X { get; } = x;
    public double Y { get; } = y;
}
