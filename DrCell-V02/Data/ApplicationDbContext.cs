using DrCell_V02.Data.Modelos;
using DrCell_V02.Data.Vistas;
using Microsoft.EntityFrameworkCore;

namespace DrCell_V02.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
             : base(options) { }

        public DbSet<Celular> Celulares { get; set; }
        public DbSet<Modulos> Modulos { get; set; }
        public DbSet<Baterias> Baterias { get; set; }
        public DbSet<Pines> Pines { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Productos> Productos { get; set; }
        public DbSet<Categorias> Categorias { get; set; }
        public DbSet<ProductosVariantes> ProductosVariantes { get; set; }

        /// VISTAS
        public DbSet<vCelularesMBP> vCelularesMBP => Set<vCelularesMBP>();
        public DbSet<vCelularM> vCelularM => Set<vCelularM>();
        public DbSet<vCelularB> vCelularB => Set<vCelularB>();
        public DbSet<vCelularP> vCelularP => Set<vCelularP>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Usuario>()
                .ToTable("usuarios")
                .HasKey(x => x.Id);

            modelBuilder.Entity<Celular>()
                .ToTable("celulares")
                .HasKey(e => e.id);

            modelBuilder.Entity<Modulos>()
                .ToTable("modulos")
                .HasKey(m => m.id);

            modelBuilder.Entity<Baterias>()
                .ToTable("baterias")
                .HasKey(b => b.id);
            modelBuilder.Entity<Categorias>()
                .ToTable("categorias")
                .HasKey(b => b.Id);

            modelBuilder.Entity<Pines>()
                .ToTable("pines")
                .HasKey(p => p.id);

            modelBuilder.Entity<Productos>()
                .ToTable("productos")
                .HasKey(p => p.Id);

            modelBuilder.Entity<Productos>()
                .HasMany(p => p.Variantes)
                .WithOne(v => v.Producto)
                .HasForeignKey(v => v.ProductoId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<ProductosVariantes>()
                .ToTable("productos_variantes")
                .HasKey(v => v.Id);
        
            // Configuración de las vistas
            modelBuilder.Entity<vCelularesMBP>()
                .HasNoKey()
                .ToView("vcelularmbp");

            modelBuilder.Entity<vCelularM>()
                .HasNoKey()
                .ToView("vcelularm");

            modelBuilder.Entity<vCelularB>()
                .HasNoKey()
                .ToView("vcelularb");

            modelBuilder.Entity<vCelularP>()
                .HasNoKey()
                .ToView("vcelularp");
        }
    }
}
