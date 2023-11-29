namespace api.Infrastructure;
public class DatabaseOptions {
    public string Host { get; set; } = "localhost";
    public string Port { get; set; } = "5432";
    public string Db { get; set; } = "app";
    public string Username { get; set; } = "postgres";
    public string Password { get; set; } = "what password";

    public string ConnectionString =>
        $"Host={Host};Port={Port};Username={Username};Password={Password};Database={Db};Enlist=false";

    public string SqlServerConnectionString =>
        $"Data Source={Host},{Port};Initial Catalog={Db};User Id={Username};Password={Password};Encrypt=false";
}
