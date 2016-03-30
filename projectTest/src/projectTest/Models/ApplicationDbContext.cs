using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Data.Entity;


namespace projectTest.Models
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public DbSet<Video> Video { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            // Customize the ASP.NET Identity model and override the defaults if needed.
            // For example, you can rename the ASP.NET Identity table names and more.
            // Add your customizations after calling base.OnModelCreating(builder);
            //builder.UseSqlServer(@"Server=(localdb)\v11.0;Database=TodoItems;Trusted_Connection=True;");
        }

    }
}
