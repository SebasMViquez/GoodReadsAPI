using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Application.Interfaces;

public interface IBookService
{
    Task<IReadOnlyCollection<Book>> GetAllAsync(CancellationToken cancellationToken);

    Task<Book?> GetByIdAsync(string id, CancellationToken cancellationToken);

    Task<Book?> GetBySlugAsync(string slug, CancellationToken cancellationToken);

    Task<Book> CreateAsync(Book book, CancellationToken cancellationToken);

    Task<Book?> UpdateAsync(string id, Book book, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken);
}
