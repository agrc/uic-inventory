using HotChocolate.AspNetCore.Authorization;

namespace api.Entities {
  [Authorize]
  public class Account {
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public Access Access { get; set; }
    public string UtahId { get; set; }
    public string Email { get; set; }
    public int Id { get; set; }
  }

  public enum Access {
    standard,
    elevated
  }
}
