using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Serilog;

namespace api {
  public class Program {
    public static void Main(string[] args)
      => CreateHostBuilder(args).Build().Run();
    public static IHostBuilder CreateHostBuilder(string[] args)
      => Host.CreateDefaultBuilder(args)
          .UseSerilog((context, config) => config.ReadFrom.Configuration(context.Configuration))
          .ConfigureWebHostDefaults(webBuilder => webBuilder.UseStartup<Startup>().UseWebRoot("uic-inventory/dist"));
  }
}
