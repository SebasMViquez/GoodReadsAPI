using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();
var clientDistPath = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "..", "goodreadsapi.client", "dist"));
var hasClientDist = Directory.Exists(clientDistPath);
PhysicalFileProvider? clientDistProvider = hasClientDist ? new PhysicalFileProvider(clientDistPath) : null;

if (clientDistProvider is not null)
{
    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = clientDistProvider,
    });
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = clientDistProvider,
    });
}
else
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

if (clientDistProvider is not null)
{
    app.MapFallbackToFile("{*path:nonfile}", "index.html", new StaticFileOptions
    {
        FileProvider = clientDistProvider,
    });
}
else
{
    app.MapFallbackToFile("index.html");
}

app.Run();
