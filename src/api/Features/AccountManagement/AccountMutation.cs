using System;
using System.Linq;
using System.Threading.Tasks;
using api.Entities;
using api.Exceptions;
using api.Features.UserRegistration;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.Data;

namespace api.Features.Mutations {
  public class AccountMutation {
    [UseDbContext(typeof(AppDbContext))]
    public async Task<Account> UpdateProfileAsync([ScopedService]AppDbContext context, ProfileInput input) {
      Account account;
      try {
        account = context.Accounts.Single(account => account.UtahId == input.UtahId);
      } catch (ArgumentNullException ex) {
        throw new AccountNotFoundException(input.UtahId, ex);
      }

      account = input.UpdateProfile(account);

      try {
        await context.SaveChangesAsync();
      } catch (Exception ex) {
        throw new AccountNotFoundException(input.UtahId, ex);
      }

      return account;
    }
  }

  public class ProfileInput {
    public string UtahId { get; set; }
    public string Organization { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string MailingAddress { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string ZipCode { get; set; }
  }

  public static class ProfileInputExtension {
    public static Account UpdateProfile(this ProfileInput input, Account account) {
      account.Organization = input.Organization;
      account.PhoneNumber = input.PhoneNumber;
      account.MailingAddress = input.MailingAddress;
      account.City = input.City;
      account.State = input.State;
      account.ZipCode = input.ZipCode;

      return account;
    }
  }
}
