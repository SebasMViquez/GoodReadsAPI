using GoodReadsAPI.Server.Application.Interfaces;
using GoodReadsAPI.Server.Contracts;
using GoodReadsAPI.Server.Infrastructure.Supabase;
using Microsoft.AspNetCore.Mvc;

namespace GoodReadsAPI.Server.Controllers;

[ApiController]
[Route("api/books")]
public sealed class BooksController(IBookService bookService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<BookResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IReadOnlyCollection<BookResponse>>> GetAll(CancellationToken cancellationToken)
    {
        try
        {
            var books = await bookService.GetAllAsync(cancellationToken);
            return Ok(books.Select(BookResponse.FromDomain).ToArray());
        }
        catch (Exception ex)
        {
            return Problem(title: "Failed to load books", detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookResponse>> GetById(string id, CancellationToken cancellationToken)
    {
        var book = await bookService.GetByIdAsync(id, cancellationToken);

        if (book is null)
        {
            return NotFound();
        }

        return Ok(BookResponse.FromDomain(book));
    }

    [HttpGet("slug/{slug}")]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookResponse>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var book = await bookService.GetBySlugAsync(slug, cancellationToken);

        if (book is null)
        {
            return NotFound();
        }

        return Ok(BookResponse.FromDomain(book));
    }

    [HttpPost]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BookResponse>> Create([FromBody] SaveBookRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await bookService.CreateAsync(request.ToDomain(), cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, BookResponse.FromDomain(created));
        }
        catch (SupabaseRequestException ex)
        {
            return Problem(title: "Supabase insert failed", detail: ex.Details ?? ex.Message, statusCode: StatusCodes.Status400BadRequest);
        }
        catch (Exception ex)
        {
            return Problem(title: "Unexpected error", detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BookResponse>> Update(string id, [FromBody] SaveBookRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await bookService.UpdateAsync(id, request.ToDomain(), cancellationToken);

            if (updated is null)
            {
                return NotFound();
            }

            return Ok(BookResponse.FromDomain(updated));
        }
        catch (Exception ex)
        {
            return Problem(title: "Failed to update book", detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        try
        {
            var deleted = await bookService.DeleteAsync(id, cancellationToken);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return Problem(title: "Failed to delete book", detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
