using System;
using MediatR.Behaviors.Authorization.Exceptions;

namespace api.Features {
  public class EmailInput {
    public string Message { get; set; } = "";
  }

  public class EmailPayload : ResponseContract {
    public EmailPayload(UnauthorizedException error) : base(error.Message) {
    }
    public EmailPayload(Exception _) : base("EM01:Something went terribly wrong that we did not expect.") {
    }

    public EmailPayload() { }
  }
}
