using ChatHubs;
using EasyCaching.Core.Configurations;
using MessagePack.Resolvers;
using Microsoft.Extensions.Options;

public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors();
        services.AddControllers();
        services.AddSignalR();
        services.AddMemoryCache();
        services.AddEasyCaching(options =>
        {
            var messagePackName = "mymsgpack";
            options.UseRedis(config =>
            {
                config.SerializerName = messagePackName;
                config.DBConfig.AllowAdmin = true;
                config.DBConfig.Endpoints.Add(new ServerEndPoint("192.168.100.127", 6379));
            }, "Redis")
            .UseRedisLock(); //with distributed lock       

            options.WithMessagePack(x =>
            {
                x.EnableCustomResolver = true;
                x.CustomResolvers = CompositeResolver.Create(new MessagePack.IFormatterResolver[]
                {
                    NativeDateTimeResolver.Instance,
                    ContractlessStandardResolver.Instance
                });
            }, messagePackName);
        });
        services.AddAuthentication().AddJwtBearer("Bearer", c =>
        {
            c.Authority = Configuration["JWT:Issuer"];
            c.Audience = Configuration["JWT:Audience"];
            c.RequireHttpsMetadata = bool.Parse(Configuration["JWT:RequireHttpsMetadata"]);
            c.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        app.UseMiddleware<ExceptionHandlerMiddleware>();
        app.UseRouting();
        app.UseStaticFiles();
        app.UseAuthorization();
       app.UseCors(x =>   x.SetIsOriginAllowed(hostName => true).AllowAnyMethod().AllowAnyHeader().AllowAnyMethod().AllowCredentials()
                  );
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            endpoints.MapHub<ChatHub>("/chathub");
        });
    }
}

