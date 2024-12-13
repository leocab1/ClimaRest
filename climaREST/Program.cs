using climaREST.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Inyector de dependencias (registrando Helper como un servicio transitorio)
builder.Services.AddTransient<Helper>(); // Aquí agregas Helper correctamente

var app = builder.Build(); // Solo se debe llamar una vez

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}

app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
