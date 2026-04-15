using api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 🔹 ПІДКЛЮЧЕННЯ ДО MySQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    ));

// 🔹 КОНТРОЛЕРИ
builder.Services.AddControllers();

// 🔹 CORS (щоб фронт працював)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// 🔹 SWAGGER (для тестування)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 🔹 ВКЛЮЧАЄМО SWAGGER
app.UseSwagger();
app.UseSwaggerUI();

// 🔹 CORS
app.UseCors("AllowAll");

// 🔹 РОУТИ
app.UseAuthorization();
app.MapControllers();

app.Run();