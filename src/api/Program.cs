using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Serilog;

namespace api;
public class Program {
    public static void Main(string[] args)
      => CreateHostBuilder(args).Build().Run();
    public static IHostBuilder CreateHostBuilder(string[] args) => Host.CreateDefaultBuilder(args)
      .UseSerilog((context, config) => config.ReadFrom.Configuration(context.Configuration))
      .ConfigureAppConfiguration((hostingContext, config) => {
          var path = Path.DirectorySeparatorChar.ToString();
          var env = hostingContext.HostingEnvironment.EnvironmentName;

          if (env != "Development") {
              config.AddJsonFile(Path.Combine(path, "secrets", "dotnet", $"appsettings.{env}.json"), optional: false, reloadOnChange: true);
          }
      })
      .ConfigureWebHostDefaults(webBuilder => webBuilder.UseStartup<Startup>().UseWebRoot("uic-inventory/dist"));
}
