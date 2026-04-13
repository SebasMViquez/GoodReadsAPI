using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using GoodReadsAPI.Server.Configuration;
using Microsoft.Extensions.Options;

namespace GoodReadsAPI.Server.Infrastructure.Supabase;

public sealed class SupabaseRequestException(string message, HttpStatusCode statusCode, string? details = null)
    : Exception(message)
{
    public HttpStatusCode StatusCode { get; } = statusCode;

    public string? Details { get; } = details;
}

public interface ISupabaseRestClient
{
    Task<IReadOnlyCollection<T>> GetManyAsync<T>(
        string table,
        string query,
        CancellationToken cancellationToken)
        where T : class;

    Task<T?> GetSingleAsync<T>(
        string table,
        string query,
        CancellationToken cancellationToken)
        where T : class;

    Task<T> InsertAsync<T>(
        string table,
        object payload,
        CancellationToken cancellationToken)
        where T : class;

    Task<T?> UpdateSingleAsync<T>(
        string table,
        string query,
        object payload,
        CancellationToken cancellationToken)
        where T : class;

    Task<bool> DeleteAsync(
        string table,
        string query,
        CancellationToken cancellationToken);
}

public sealed class SupabaseRestClient(HttpClient httpClient, IOptions<SupabaseOptions> options)
    : ISupabaseRestClient
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly SupabaseOptions _options = options.Value;

    public async Task<IReadOnlyCollection<T>> GetManyAsync<T>(
        string table,
        string query,
        CancellationToken cancellationToken)
        where T : class
    {
        using var request = CreateRequest(HttpMethod.Get, BuildPath(table, query));
        using var response = await httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        var payload = await response.Content.ReadFromJsonAsync<List<T>>(JsonOptions, cancellationToken);
        return payload ?? [];
    }

    public async Task<T?> GetSingleAsync<T>(
        string table,
        string query,
        CancellationToken cancellationToken)
        where T : class
    {
        var items = await GetManyAsync<T>(table, query, cancellationToken);
        return items.FirstOrDefault();
    }

    public async Task<T> InsertAsync<T>(
        string table,
        object payload,
        CancellationToken cancellationToken)
        where T : class
    {
        using var request = CreateRequest(HttpMethod.Post, BuildPath(table, string.Empty));
        request.Headers.Add("Prefer", "return=representation");
        request.Content = JsonContent.Create(payload);

        using var response = await httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        var items = await response.Content.ReadFromJsonAsync<List<T>>(JsonOptions, cancellationToken);

        if (items is null || items.Count == 0)
        {
            throw new SupabaseRequestException(
                "Supabase did not return inserted entity.",
                response.StatusCode);
        }

        return items[0];
    }

    public async Task<T?> UpdateSingleAsync<T>(
        string table,
        string query,
        object payload,
        CancellationToken cancellationToken)
        where T : class
    {
        using var request = CreateRequest(HttpMethod.Patch, BuildPath(table, query));
        request.Headers.Add("Prefer", "return=representation");
        request.Content = JsonContent.Create(payload);

        using var response = await httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        var items = await response.Content.ReadFromJsonAsync<List<T>>(JsonOptions, cancellationToken);

        if (items is null || items.Count == 0)
        {
            return null;
        }

        return items[0];
    }

    public async Task<bool> DeleteAsync(
        string table,
        string query,
        CancellationToken cancellationToken)
    {
        using var request = CreateRequest(HttpMethod.Delete, BuildPath(table, query));
        request.Headers.Add("Prefer", "return=minimal");

        using var response = await httpClient.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return false;
        }

        await EnsureSuccessAsync(response, cancellationToken);
        return true;
    }

    private HttpRequestMessage CreateRequest(HttpMethod method, string requestUri)
    {
        EnsureConfigured();

        var request = new HttpRequestMessage(method, requestUri);
        request.Headers.Add("apikey", _options.ServiceRoleKey);
        request.Headers.Authorization = new("Bearer", _options.ServiceRoleKey);
        request.Headers.Add("Accept-Profile", _options.Schema);

        if (method == HttpMethod.Post || method == HttpMethod.Patch || method == HttpMethod.Delete)
        {
            request.Headers.Add("Content-Profile", _options.Schema);
        }

        return request;
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var details = await response.Content.ReadAsStringAsync(cancellationToken);
        throw new SupabaseRequestException(
            "Supabase request failed.",
            response.StatusCode,
            details);
    }

    private static string BuildPath(string table, string query)
    {
        var builder = new StringBuilder($"{table}?select=*");

        if (!string.IsNullOrWhiteSpace(query))
        {
            builder.Append('&').Append(query);
        }

        return builder.ToString();
    }

    private void EnsureConfigured()
    {
        if (_options.IsConfigured)
        {
            return;
        }

        throw new InvalidOperationException(
            "Supabase is not configured. Set Supabase:Url and Supabase:ServiceRoleKey.");
    }
}
