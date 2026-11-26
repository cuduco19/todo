using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Models;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController(AppDbContext db) : ControllerBase
{
    private string GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "demo-user";

    private static TaskResponse ToResponse(TodoItem item) =>
        new(item.Id, item.Title, item.IsCompleted, item.SortOrder, item.CreatedAt);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetTasks([FromQuery] string filter = "all")
    {
        var userId = GetCurrentUserId();
        var query = db.Tasks.Where(t => t.UserId == userId);

        query = filter.ToLowerInvariant() switch
        {
            "active" => query.Where(t => !t.IsCompleted),
            "completed" => query.Where(t => t.IsCompleted),
            _ => query
        };

        var items = await query
            .OrderBy(t => t.SortOrder)
            .ThenByDescending(t => t.CreatedAt)
            .Select(t => ToResponse(t))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponse>> CreateTask([FromBody] CreateTaskRequest request)
    {
        var userId = GetCurrentUserId();
        var trimmed = request.Title.Trim();
        if (string.IsNullOrEmpty(trimmed))
            return BadRequest("Task title cannot be empty.");

        // Shift existing tasks down so the new task sits at index 0 (matching unshift)
        await db.Tasks
            .Where(t => t.UserId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.SortOrder, t => t.SortOrder + 1));

        var item = new TodoItem
        {
            UserId = userId,
            Title = trimmed,
            IsCompleted = false,
            SortOrder = 0
        };

        db.Tasks.Add(item);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTasks), new { id = item.Id }, ToResponse(item));
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> UpdateTask(Guid id, [FromBody] UpdateTaskRequest request)
    {
        var userId = GetCurrentUserId();
        var item = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (item is null)
            return NotFound();

        if (request.Title is not null)
        {
            var trimmed = request.Title.Trim();
            if (string.IsNullOrEmpty(trimmed))
                return BadRequest("Task title cannot be empty.");
            item.Title = trimmed;
        }

        if (request.IsCompleted.HasValue)
            item.IsCompleted = request.IsCompleted.Value;

        await db.SaveChangesAsync();
        return Ok(ToResponse(item));
    }

    [HttpPatch("reorder")]
    public async Task<IActionResult> ReorderTasks([FromBody] ReorderTasksRequest request)
    {
        var userId = GetCurrentUserId();
        var userTasks = await db.Tasks
            .Where(t => t.UserId == userId && request.OrderedIds.Contains(t.Id))
            .ToListAsync();

        var taskMap = userTasks.ToDictionary(t => t.Id);

        for (int i = 0; i < request.OrderedIds.Count; i++)
        {
            if (taskMap.TryGetValue(request.OrderedIds[i], out var task))
            {
                task.SortOrder = i;
            }
        }

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var userId = GetCurrentUserId();
        var deleted = await db.Tasks
            .Where(t => t.Id == id && t.UserId == userId)
            .ExecuteDeleteAsync();

        return deleted > 0 ? NoContent() : NotFound();
    }

    [HttpDelete]
    public async Task<IActionResult> BulkDelete([FromQuery] bool completedOnly = false)
    {
        var userId = GetCurrentUserId();
        var query = db.Tasks.Where(t => t.UserId == userId);

        if (completedOnly)
            query = query.Where(t => t.IsCompleted);

        await query.ExecuteDeleteAsync();
        return NoContent();
    }
}