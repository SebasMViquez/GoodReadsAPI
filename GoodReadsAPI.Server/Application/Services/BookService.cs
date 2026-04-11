using GoodReadsAPI.Server.Application.Interfaces;
using GoodReadsAPI.Server.Domain.Entities;
using GoodReadsAPI.Server.Infrastructure.Repositories;

namespace GoodReadsAPI.Server.Application.Services;

public sealed class BookService(IBookRepository repository) : IBookService
{
    public Task<IReadOnlyCollection<Book>> GetAllAsync(CancellationToken cancellationToken) =>
        repository.GetAllAsync(cancellationToken);

    public Task<Book?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        repository.GetByIdAsync(id, cancellationToken);

    public Task<Book?> GetBySlugAsync(string slug, CancellationToken cancellationToken) =>
        repository.GetBySlugAsync(slug, cancellationToken);

    public Task<Book> CreateAsync(Book book, CancellationToken cancellationToken) =>
        repository.CreateAsync(book, cancellationToken);

    public Task<Book?> UpdateAsync(string id, Book book, CancellationToken cancellationToken) =>
        repository.UpdateAsync(id, book, cancellationToken);

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken) =>
        repository.DeleteAsync(id, cancellationToken);
}
