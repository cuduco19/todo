using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using TodoApi.Controllers;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Models;

namespace TodoApi.Tests;

public class TasksControllerTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;
    private readonly TasksController _controller;

    public TasksControllerTests()
    {
        // Open an in-memory SQLite connection that stays alive for the duration of each test
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        _db = new AppDbContext(options);
        _db.Database.EnsureCreated();

        _controller = new TasksController(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task CreateTask_PrependsNewTaskAtSortOrderZero_AndShiftsExistingTasks()
    {
        // Act
        await _controller.CreateTask(new CreateTaskRequest("First Task"));
        await _controller.CreateTask(new CreateTaskRequest("Second Task"));

        // Assert
        var result = await _controller.GetTasks("all");
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<TaskResponse>>(okResult.Value).ToList();

        Assert.Equal(2, tasks.Count);
        Assert.Equal("Second Task", tasks[0].Text);
        Assert.Equal(0, tasks[0].SortOrder);
        Assert.Equal("First Task", tasks[1].Text);
        Assert.Equal(1, tasks[1].SortOrder);
    }

    [Fact]
    public async Task CreateTask_WithWhitespaceOnly_ReturnsBadRequest()
    {
        var result = await _controller.CreateTask(new CreateTaskRequest("   "));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetTasks_FiltersByActiveAndCompleted()
    {
        // Arrange
        _db.Tasks.AddRange(
            new TodoItem { Title = "Active Task", IsCompleted = false, SortOrder = 0 },
            new TodoItem { Title = "Completed Task", IsCompleted = true, SortOrder = 1 }
        );
        await _db.SaveChangesAsync();

        // Act
        var activeResult = await _controller.GetTasks("active");
        var completedResult = await _controller.GetTasks("completed");

        // Assert
        var activeTasks = Assert.IsAssignableFrom<IEnumerable<TaskResponse>>(
            Assert.IsType<OkObjectResult>(activeResult.Result).Value).ToList();
        var completedTasks = Assert.IsAssignableFrom<IEnumerable<TaskResponse>>(
            Assert.IsType<OkObjectResult>(completedResult.Result).Value).ToList();

        Assert.Single(activeTasks);
        Assert.Equal("Active Task", activeTasks[0].Text);

        Assert.Single(completedTasks);
        Assert.Equal("Completed Task", completedTasks[0].Text);
    }

    [Fact]
    public async Task UpdateTask_UpdatesTitleAndCompletionStatus()
    {
        // Arrange
        var task = new TodoItem { Title = "Original Title", IsCompleted = false, SortOrder = 0 };
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        // Act
        var result = await _controller.UpdateTask(task.Id, new UpdateTaskRequest("Updated Title", true));

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var updated = Assert.IsType<TaskResponse>(okResult.Value);
        Assert.Equal("Updated Title", updated.Text);
        Assert.True(updated.Completed);
    }

    [Fact]
    public async Task ReorderTasks_UpdatesSortOrderAtomically()
    {
        // Arrange
        var t1 = new TodoItem { Title = "Task 1", SortOrder = 0 };
        var t2 = new TodoItem { Title = "Task 2", SortOrder = 1 };
        var t3 = new TodoItem { Title = "Task 3", SortOrder = 2 };
        _db.Tasks.AddRange(t1, t2, t3);
        await _db.SaveChangesAsync();

        // Act: Reverse the order
        var response = await _controller.ReorderTasks(new ReorderTasksRequest([t3.Id, t1.Id, t2.Id]));

        // Assert
        Assert.IsType<NoContentResult>(response);

        var ordered = await _db.Tasks.OrderBy(t => t.SortOrder).ToListAsync();
        Assert.Equal(t3.Id, ordered[0].Id);
        Assert.Equal(t1.Id, ordered[1].Id);
        Assert.Equal(t2.Id, ordered[2].Id);
    }

    [Fact]
    public async Task DeleteTask_RemovesSingleTask_AndReturnsNotFoundIfMissing()
    {
        // Arrange
        var task = new TodoItem { Title = "Delete Me", SortOrder = 0 };
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        // Act
        var deleteResult = await _controller.DeleteTask(task.Id);
        var secondDeleteResult = await _controller.DeleteTask(task.Id);

        // Assert
        Assert.IsType<NoContentResult>(deleteResult);
        Assert.IsType<NotFoundResult>(secondDeleteResult);
    }

    [Fact]
    public async Task BulkDelete_CompletedOnly_DeletesOnlyCompletedTasks()
    {
        // Arrange
        _db.Tasks.AddRange(
            new TodoItem { Title = "Keep Me", IsCompleted = false, SortOrder = 0 },
            new TodoItem { Title = "Remove Me 1", IsCompleted = true, SortOrder = 1 },
            new TodoItem { Title = "Remove Me 2", IsCompleted = true, SortOrder = 2 }
        );
        await _db.SaveChangesAsync();

        // Act
        var result = await _controller.BulkDelete(completedOnly: true);

        // Assert
        Assert.IsType<NoContentResult>(result);
        var remaining = await _db.Tasks.ToListAsync();
        Assert.Single(remaining);
        Assert.Equal("Keep Me", remaining[0].Title);
    }
}