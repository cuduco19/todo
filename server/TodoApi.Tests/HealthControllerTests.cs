using Microsoft.AspNetCore.Mvc;
using TodoApi.Controllers;

namespace TodoApi.Tests;

public class HealthControllerTests
{
    [Fact]
    public void Ping_ReturnsOkWithHealthyStatus()
    {
        // Arrange
        var controller = new HealthController();

        // Act
        var result = controller.Ping();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
        Assert.Contains("status = ok", okResult.Value.ToString());
    }
}