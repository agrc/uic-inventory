using api.Features;

namespace api.Infrastructure {
  public record HasRequestMetadata {
    public Account Account { get; set; } = new();
    public Site Site { get; set; } = new();
    public NotificationReceipt NotificationReceipt { get; set; } = new();
  }
}
