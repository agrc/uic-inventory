using System.Threading;
using System.Threading.Tasks;
using SendGrid;
using SendGrid.Helpers.Mail;
using Serilog;

namespace api.Features;
public class EmailService(ISendGridClient client, ILogger log) {
    private readonly ISendGridClient _client = client;
    private readonly ILogger _log = log;

    public async Task<Response> SendEmailAsync(SendGridMessage message, CancellationToken cancellationToken) {
        _log.ForContext("message", message)
           .Information("Sending email");

        return await _client.SendEmailAsync(message, cancellationToken);
    }
}
