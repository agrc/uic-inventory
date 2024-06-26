using System;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using SendGrid.Helpers.Mail;
using Serilog;

namespace api.Features;
public static class SendEmail {
    public class Command(string to, string message) : IRequest<EmailPayload> {
        public string Message { get; } = message;
        public string To { get; } = to;

        public class Handler(EmailService client, HasRequestMetadata metadata, ILogger log) : IRequestHandler<Command, EmailPayload> {
            private readonly ILogger _log = log;
            private readonly HasRequestMetadata _metadata = metadata;
            private readonly EmailService _client = client;

            public async Task<EmailPayload> Handle(Command request, CancellationToken token) {
                _log.ForContext("content", request)
                  .Debug("Sending email");

                if (string.IsNullOrEmpty(request.Message)) {
                    throw new ArgumentNullException(nameof(request));
                }

                if (string.IsNullOrEmpty(request.To)) {
                    throw new ArgumentNullException(nameof(request));
                }

                var htmlContent = $@"<h1>UIC Inventory Application feedback</h1>
            <h2>From: {_metadata.Account.FirstName} {_metadata.Account.LastName}</h2>
            <p>{request.Message}</p>";

                var msg = new SendGridMessage {
                    From = new EmailAddress("noreply@utah.gov", "UIC Inventory App"),
                    Subject = $"UIC Inventory App: Feedback from {_metadata.Account.FirstName} {_metadata.Account.LastName}",
                    HtmlContent = htmlContent,
                    ReplyTo = new EmailAddress(_metadata.Account.Email, $"{_metadata.Account.FirstName} {_metadata.Account.LastName}"),
                };

                msg.AddTo(new EmailAddress(request.To, "UIC Administrators"));

                var response = await _client.SendEmailAsync(msg, token);

                if (!response.IsSuccessStatusCode) {
                    _log.ForContext("message", msg.PlainTextContent)
                       .ForContext("response", await response.Body.ReadAsStringAsync(token))
                      .Error("Contact staff email not sent");

                    throw new Exception(response.StatusCode.ToString());
                } else {
                    _log.ForContext("message", msg.PlainTextContent)
                      .Information("Sent contact staff email");
                }

                return new EmailPayload();
            }
        }
    }
}
