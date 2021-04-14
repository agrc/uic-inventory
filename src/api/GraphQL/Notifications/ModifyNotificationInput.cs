namespace api.GraphQL {
  public class NotificationInput {
    public int Id { get; set; }
    public bool? Read { get; set; }
    public bool? Deleted { get; set; }
  }
}
