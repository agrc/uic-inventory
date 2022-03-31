using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Features {
  public class WaterSystemContacts {
    public int Id { get; set; }
    public int SiteFk { get; set; }
    public int InventoryFk { get; set; }
    public int WellFk { get; set; }
    public int AccountFk { get; set; }
    [MaxLength(128)] public string Name { get; set; } = default!;
    [MaxLength(128)] public string System { get; set; } = default!;
    [MaxLength(128)] public string Email { get; set; } = default!;

    [ForeignKey("WellFk")] public Well Well { get; set; } = default!;
    [ForeignKey("InventoryFk")] public Inventory Inventory { get; set; } = default!;
  }
  public record WaterSystemContact(string Name, string Email, string System);
}
