using System.Security.Claims;
using GoodReadsAPI.Server.Application.Interfaces;
using GoodReadsAPI.Server.Application.Services;
using GoodReadsAPI.Server.Configuration;
using GoodReadsAPI.Server.Infrastructure.Auth;
using GoodReadsAPI.Server.Infrastructure.Repositories;
using GoodReadsAPI.Server.Infrastructure.Supabase;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

const string FrontendDevCorsPolicy = "FrontendDevCors";
const string HybridAuthScheme = "HybridAuth";

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
builder.Services.Configure<SupabaseAuthOptions>(
    builder.Configuration.GetSection(SupabaseAuthOptions.SectionName));

var supabaseAuthOptions = builder.Configuration
    .GetSection(SupabaseAuthOptions.SectionName)
    .Get<SupabaseAuthOptions>() ?? new SupabaseAuthOptions();

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = HybridAuthScheme;
        options.DefaultChallengeScheme = HybridAuthScheme;
    })
    .AddPolicyScheme(HybridAuthScheme, HybridAuthScheme, options =>
    {
        options.ForwardDefaultSelector = context =>
        {
            var hasBearerToken = context.Request.Headers.Authorization
                .ToString()
                .StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase);

            if (hasBearerToken && supabaseAuthOptions.IsConfigured)
            {
                return JwtBearerDefaults.AuthenticationScheme;
            }

            if (supabaseAuthOptions.IsConfigured && !supabaseAuthOptions.AllowLegacyUserIdFallback)
            {
                return JwtBearerDefaults.AuthenticationScheme;
            }

            return LegacyUserIdAuthenticationHandler.SchemeName;
        };
    })
    .AddScheme<AuthenticationSchemeOptions, LegacyUserIdAuthenticationHandler>(
        LegacyUserIdAuthenticationHandler.SchemeName,
        _ => { });

if (supabaseAuthOptions.IsConfigured)
{
    builder.Services
        .AddAuthentication()
        .AddJwtBearer(options =>
        {
            options.Authority = supabaseAuthOptions.Authority;
            options.Audience = supabaseAuthOptions.Audience;
            options.RequireHttpsMetadata = supabaseAuthOptions.RequireHttpsMetadata;
            options.MapInboundClaims = false;
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = async context =>
                {
                    try
                    {
                        var authUserId = context.Principal?.FindFirstValue("sub");
                        if (string.IsNullOrWhiteSpace(authUserId))
                        {
                            return;
                        }

                        var userRepository = context.HttpContext.RequestServices
                            .GetRequiredService<IUserRepository>();
                        var appUser = await userRepository.GetByAuthUserIdAsync(
                            authUserId,
                            context.HttpContext.RequestAborted);

                        if (appUser is null)
                        {
                            return;
                        }

                        if (context.Principal?.Identity is ClaimsIdentity identity &&
                            !identity.HasClaim(claim => claim.Type == "app_user_id"))
                        {
                            identity.AddClaim(new Claim("app_user_id", appUser.Id));
                        }
                    }
                    catch
                    {
                        // Keep auth resilient while migrations are rolling out.
                    }
                },
            };
        });
}

builder.Services.AddAuthorization();

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
builder.Services.AddScoped<IUserRepository, SupabaseUserRepository>();
builder.Services.AddScoped<IUserRelationshipRepository, SupabaseUserRelationshipRepository>();
builder.Services.AddScoped<IUserLibraryRepository, SupabaseUserLibraryRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ISocialGraphService, SocialGraphService>();
builder.Services.AddScoped<IUserLibraryService, UserLibraryService>();

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
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

