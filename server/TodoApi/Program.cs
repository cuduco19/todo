using Microsoft.EntityFrameworkCore;
using TodoApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins("http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000, https://evancru-todo-list.netlify.app")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Automatically apply pending EF Core migrations on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("FrontendPolicy");
//app.UseAuthentication(); // Uncomment once you configure AddAuthentication().AddJwtBearer()
//app.UseAuthorization();
app.MapControllers();

app.Run();