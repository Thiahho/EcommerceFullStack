using EcommerceFullStack.Data.Modelos;
using Microsoft.EntityFrameworkCore;
namespace EcommerceFullStack.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options):
            base(options){}

        public DbSet<Productos> Productos { get; set; }
        public DbSet<ProductosVariantes> ProductosVariantes { get; set; }
        public DbSet<Usuarios> Usuarios { get; set; }
        public DbSet<Categorias> Categorias { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Usuarios>()
                .ToTable("usuarios")
                .HasKey(x => x.Id);
            modelBuilder.Entity<Productos>()
                .ToTable("productos")
                .HasKey(x => x.Id);
            modelBuilder.Entity<ProductosVariantes>()
                .ToTable("productos_variantes")
                .HasKey(x => x.Id);
            modelBuilder.Entity<Categorias>()
                .ToTable("categorias")
                .HasKey(x => x.Id);


        }
    }
}
