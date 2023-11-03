using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Serilog;

namespace api.Infrastructure;
public class LoggingBehavior<TRequest, TResponse>(ILogger logger) : IPipelineBehavior<TRequest, TResponse>
  where TRequest : IRequest<TResponse> {
    private readonly ILogger _logger = logger;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken) {
        var requestType = typeof(TRequest);

        _logger.Information("Handling {request}", requestType);
        var response = await next();
        _logger
          .ForContext("response", typeof(TResponse))
          .Information("Handled {request}", requestType);

        return response;
    }
}
