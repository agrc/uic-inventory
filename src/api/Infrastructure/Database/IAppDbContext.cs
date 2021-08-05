using System.Threading;
using System.Threading.Tasks;
using api.Features;
using Microsoft.EntityFrameworkCore;

namespace api.Infrastructure {
  public interface IAppDbContext {
    DbSet<Account> Accounts { get; set; }
    DbSet<Site> Sites { get; set; }
    DbSet<Contact> Contacts { get; set; }
    DbSet<Notification> Notifications { get; set; }
    DbSet<NotificationReceipt> NotificationReceipts { get; set; }
    Task<int> SaveChangesAsync(CancellationToken token);
  }
}
