using System;

namespace api.Features {
  public class EmailInput {
    public string Message { get; set; } = "";
  }

  public class EmailPayload : ResponseContract {
    public EmailPayload(UnauthorizedAccessException error) : base(error.Message) {
    }
    public EmailPayload(Exception error) : base("EM01:Something went terribly wrong that we did not expect.") {
    }

    public EmailPayload() { }
  }
}
