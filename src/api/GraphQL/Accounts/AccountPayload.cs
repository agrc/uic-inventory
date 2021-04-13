namespace api.GraphQL {
  public class AccountPayload {
    public AccountPayload(Account account) {
      Account = account;
    }

    public Account Account { get; }
  }
}
