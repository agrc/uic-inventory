using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace api.Features;
public static class SiteNotifications {
    public record EditNotification : INotification {
        public EditNotification(int siteId) {
            SiteId = siteId;
        }

        public int SiteId { get; }
    }
    public record DeleteNotification : INotification {
        public DeleteNotification(int siteId) {
            SiteId = siteId;
        }

        public int SiteId { get; }
    }

    public class UpdateSiteStatusHandler(IAppDbContext context, ILogger log) : INotificationHandler<EditNotification> {
        private readonly IAppDbContext _context = context;
        private readonly ILogger _log = log;

        private static void UpdateAllSerInventoryContactStatus(Site entity) {
            var inventories = entity.Inventories
              .Where(x => x.SubClass == 5002)
              .ToList();

            var hasSerContact = entity.Contacts.Any(x => x.SerContact);

            foreach (var inventory in inventories) {
                inventory.ContactStatus = hasSerContact;
            }
        }
        private static bool GetContactStatus(ICollection<Contact> contacts) =>
          contacts.Any(x => RequiredContactTypes.Types.Contains(x.ContactType));
        private static bool GetLocationStatus(Site site) => site.Address is not null && site.Geometry is not null;
        private static bool GetDetailStatus(Site site) =>
          site.Name is not null &&
          site.Ownership is not null &&
          site.NaicsPrimary is not null &&
          site.NaicsTitle is not null;
        private static SiteStatus GetSiteStatus(Site site) =>
          site.ContactStatus && site.DetailStatus && site.LocationStatus ?
            SiteStatus.Complete :
            SiteStatus.Incomplete;
        public async Task Handle(EditNotification notification, CancellationToken token) {
            _log.ForContext("notification", notification)
              .Debug("Handling site status update");

            var site = await _context.Sites
              .Include(x => x.Contacts)
              .Include(x => x.Inventories)
              .SingleOrDefaultAsync(s => s.Id == notification.SiteId, token);

            if (site is null) {
                _log.ForContext("siteId", notification.SiteId)
                  .Warning("Site not found");

                return;
            }

            site.LocationStatus = GetLocationStatus(site);
            site.DetailStatus = GetDetailStatus(site);
            site.ContactStatus = GetContactStatus(site.Contacts);

            if (site.Inventories.Count > 0 && site.Inventories.Any(x => x.SubClass == 5002)) {
                UpdateAllSerInventoryContactStatus(site);
            }

            site.Status = GetSiteStatus(site);

            await _context.SaveChangesAsync(token);
        }
    }
    public class RemoveCloudStorageHandler(CloudStorageService cloud, IConfiguration configuration, ILogger log) : INotificationHandler<DeleteNotification> {
        private readonly ILogger _log = log;
        private readonly CloudStorageService _client = cloud;
        private readonly string _bucket = configuration.GetValue<string>("STORAGE_BUCKET") ?? string.Empty;

        public async Task Handle(DeleteNotification notification, CancellationToken token) {
            _log.ForContext("notification", notification)
              .Debug("Handling site deletion cloud storage removal");

            await _client.RemoveObjectsAsync(_bucket, $"site_{notification.SiteId}/", token);
        }
    }
}
