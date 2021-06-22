using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using api.Exceptions;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.Types;

namespace api.GraphQL {
  [ExtendObjectType("Mutation")]
  public class ContactMutations {
    [UseApplicationDbContext]
    public async Task<ContactPayload> CreateContactAsync([ScopedService] AppDbContext context,
      ContactInput input) {
      var contact = await context.Contacts.AddAsync(input.Update(new()));

      try {
        await context.SaveChangesAsync();
      } catch (Exception ex) {
        throw new AccountNotFoundException(input.Id.ToString(), ex);
      }

      return new ContactPayload(contact.Entity);
    }
  }
}
