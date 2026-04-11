using GoodReadsAPI.Server.Application.Interfaces;
using GoodReadsAPI.Server.Application.Services;
using GoodReadsAPI.Server.Configuration;
using GoodReadsAPI.Server.Infrastructure.Repositories;
using GoodReadsAPI.Server.Infrastructure.Supabase;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

const string FrontendDevCorsPolicy = "FrontendDevCors";

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendDevCorsPolicy, policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            policy.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
            return;
        }

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.Configure<SupabaseOptions>(
    builder.Configuration.GetSection(SupabaseOptions.SectionName));
builder.Services.AddHttpClient<ISupabaseRestClient, SupabaseRestClient>((serviceProvider, client) =>
{
    var options = serviceProvider
        .GetRequiredService<IOptions<SupabaseOptions>>()
        .Value;

    if (!string.IsNullOrWhiteSpace(options.Url))
    {
        client.BaseAddress = new Uri($"{options.Url.TrimEnd('/')}/rest/v1/");
    }
});
builder.Services.AddScoped<IBookRepository, SupabaseBookRepository>();
builder.Services.AddScoped<IBookService, BookService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapGet("/", () => Results.Redirect("/swagger"));
}
else
{
    app.MapGet("/", () => Results.Ok("GoodReads API is running."));
}

app.UseHttpsRedirection();
app.UseCors(FrontendDevCorsPolicy);
app.UseAuthorization();

app.MapControllers();

app.Run();
