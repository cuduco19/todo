using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models;

public class TodoItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}