using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Serilog;

namespace api {
  public class Program {
    public static void Main(string[] args)
      => CreateHostBuilder(args).Build().Run();
    public static IHostBuilder CreateHostBuilder(string[] args) => Host.CreateDefaultBuilder(args)
      .UseSerilog((context, config) => config.ReadFrom.Configuration(context.Configuration))
      .ConfigureAppConfiguration((_, config) => {
        foreach (var secret in new[] { "storage", "email" }) {
          config.AddKeyPerFile(Path.Combine(Path.DirectorySeparatorChar.ToString(), "secrets", secret), false, true);
        }
      })
      .ConfigureWebHostDefaults(webBuilder => webBuilder.UseStartup<Startup>().UseWebRoot("uic-inventory/dist"));
  }
}
