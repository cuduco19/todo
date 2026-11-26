using Microsoft.EntityFrameworkCore;
using TodoApi.Models;

namespace TodoApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<TodoItem> Tasks => Set<TodoItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TodoItem>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.HasIndex(t => new { t.UserId, t.SortOrder });
            entity.Property(t => t.Title).IsRequired().HasMaxLength(500);
            entity.Property(t => t.UserId).IsRequired().HasMaxLength(100);
        });
    }
}