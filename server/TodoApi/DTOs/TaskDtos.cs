using System.ComponentModel.DataAnnotations;

namespace TodoApi.DTOs;

public record CreateTaskRequest(
    [Required, MinLength(1), MaxLength(500)] string Title
);

public record UpdateTaskRequest(
    [MinLength(1), MaxLength(500)] string? Title,
    bool? IsCompleted
);

public record ReorderTasksRequest(
    [Required, MinLength(1)] List<Guid> OrderedIds
);

public record TaskResponse(
    Guid Id,
    string Text,
    bool Completed,
    int SortOrder,
    DateTime CreatedAt
);