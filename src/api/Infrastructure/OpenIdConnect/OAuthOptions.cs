namespace api.Infrastructure {
  public class OAuthOptions {
    public string ClientId { get; set; } = default!;
    public string ClientSecret { get; set; } = default!;
    public string Authority { get; set; } = default!;
  }
}
