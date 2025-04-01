using Microsoft.EntityFrameworkCore;
using tag_api.Data;

namespace tag_api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            /*builder.WebHost.ConfigureKestrel(options =>
            {
                options.ListenAnyIP(8080);
            });*/
            // Add services to the container.
            builder.Services.AddControllers();

            // Register the DataContext with a connection string.
            builder.Services.AddDbContext<DataContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Add CORS policy that allows any origin, method, and header.
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            //app.UseHttpsRedirection();

            // Apply CORS policy globally
            app.UseCors("AllowAll");

            app.UseAuthorization();

            app.MapControllers();

            // Apply any pending migrations at startup.
            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<DataContext>();
                try
                {
                    dbContext.Database.Migrate();
                }
                catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number == 1801) // 1801 = "database already exists"
                {
                    // Log the exception and continue, or handle accordingly.
                }
            }


            app.Run();
        }
    }
}

//Server=docker_sqlserver, 1433; Database=product_db; User Id=sa; Password=myPassword1!; TrustServerCertificate=True;
//Server=localhost;Database=tagDb;Trusted_Connection=true;TrustServerCertificate=true;