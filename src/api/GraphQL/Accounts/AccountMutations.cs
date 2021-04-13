using System;
using System.Linq;
using System.Threading.Tasks;
using api.Exceptions;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.Types;

namespace api.GraphQL {
  [ExtendObjectType("Mutation")]
  public class AccountMutations {
    [UseApplicationDbContext]
    public async Task<AccountPayload> UpdateAccountAsync([ScopedService]AppDbContext context, AccountInput input) {
      Account account;
      try {
        account = context.Accounts.Single(account => account.Id == input.Id);
      } catch (ArgumentNullException ex) {
        throw new AccountNotFoundException(input.Id.ToString(), ex);
      }

      account = input.UpdateAccount(account);

      try {
        await context.SaveChangesAsync();
      } catch (Exception ex) {
        throw new AccountNotFoundException(input.Id.ToString(), ex);
      }

      return new AccountPayload(account);
    }
  }
}
