using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using Serilog;

namespace api.Features {
  public static class SendEmail {
    public class Command : IRequest<EmailPayload> {
      public Command(string to, string message) {
        Message = message;
        To = to;
      }

      public string Message { get; }
      public string To { get; }

      public class Handler : IRequestHandler<Command, EmailPayload> {
        private readonly ILogger _log;
        private readonly HasRequestMetadata _metadata;
        private readonly string _apiKey;
        public Handler(IConfiguration configuration, HasRequestMetadata metadata, ILogger log) {
          _log = log;
          _metadata = metadata;
          _apiKey = configuration["sendgrid-key"];
        }

        public async Task<EmailPayload> Handle(Command request, CancellationToken token) {
          _log.ForContext("content", request)
            .Debug("sending email");

          if (string.IsNullOrEmpty(request.Message)) {
            throw new ArgumentNullException(nameof(request));
          }

          if (string.IsNullOrEmpty(request.To)) {
            throw new ArgumentNullException(nameof(request));
          }

          var client = new SendGridClient(_apiKey);

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

          var response = await client.SendEmailAsync(msg, token);

          if (!response.IsSuccessStatusCode) {
            _log.ForContext("content", htmlContent)
              .ForContext("from", _metadata.Account.Email)
              .Error("email not sent");

            throw new Exception(response.StatusCode.ToString());
          }

          return new EmailPayload();
        }
      }
    }
  }
}
