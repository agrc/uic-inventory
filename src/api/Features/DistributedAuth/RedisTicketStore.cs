using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Caching.Distributed;

namespace api.Features.DistributedAuth {
  public class RedisTicketStore : ITicketStore {
    private const string _keyPrefix = "authentication-ticket-";
    private readonly IDistributedCache _cache;
    public RedisTicketStore(IDistributedCache cache) {
      _cache = cache;
    }

    public async Task<string> StoreAsync(AuthenticationTicket ticket) {
      var key = $"{_keyPrefix}{Guid.NewGuid()}";

      await RenewAsync(key, ticket);

      return key;
    }

    public Task RenewAsync(string key, AuthenticationTicket ticket) {
      var options = new DistributedCacheEntryOptions();
      var expiresUtc = ticket.Properties.ExpiresUtc;

      if (expiresUtc.HasValue) {
        options.SetAbsoluteExpiration(expiresUtc.Value);
      }

      if (!ticket.Properties.Items.ContainsKey("key")) {
        ticket.Properties.Items.Add("key", key);
      }

      var val = SerializeToBytes(ticket);
      _cache.Set(key, val, options);

      return Task.FromResult(0);
    }

    public Task<AuthenticationTicket> RetrieveAsync(string key) {
      AuthenticationTicket ticket;
      var bytes = _cache.Get(key);
      ticket = DeserializeFromBytes(bytes);

      return Task.FromResult(ticket);
    }

    public Task RemoveAsync(string key) {
      _cache.Remove(key);

      return Task.FromResult(0);
    }

    private static byte[] SerializeToBytes(AuthenticationTicket source) => TicketSerializer.Default.Serialize(source);

    private static AuthenticationTicket DeserializeFromBytes(byte[] source)
      => source == null ? null : TicketSerializer.Default.Deserialize(source);
  }
}
