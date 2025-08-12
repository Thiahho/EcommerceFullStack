using EcommerceFullStack.Data.Modelos;
using Microsoft.EntityFrameworkCore;

namespace EcommerceFullStack.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Productos> Productos { get; set; }
        public DbSet<ProductosVariantes> ProductosVariantes { get; set; }
        public DbSet<Usuarios> Usuarios { get; set; }
        public DbSet<Categorias> Categorias { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de Usuarios
            modelBuilder.Entity<Usuarios>()
                .ToTable("Usuarios")
                .HasKey(x => x.Id);

            // Configuración de Categorias
            modelBuilder.Entity<Categorias>()
                .ToTable("Categorias")
                .HasKey(x => x.Id);

            // Configuración de Productos
            modelBuilder.Entity<Productos>()
                .ToTable("Productos")
                .HasKey(x => x.Id);

            modelBuilder.Entity<Productos>()
                .HasOne(p => p.Categoria)
                .WithMany()
                .HasForeignKey(p => p.CategoriaId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Productos>()
                .HasMany(p => p.Variantes)
                .WithOne(v => v.Producto)
                .HasForeignKey(v => v.ProductoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuración de ProductosVariantes
            modelBuilder.Entity<ProductosVariantes>()
                .ToTable("Producto_Variantes")
                .HasKey(x => x.Id);

            modelBuilder.Entity<ProductosVariantes>()
                .HasOne(v => v.Producto)
                .WithMany(p => p.Variantes)
                .HasForeignKey(v => v.ProductoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuraciones adicionales para optimización
            modelBuilder.Entity<Productos>()
                .Property(p => p.Nombre)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Productos>()
                .Property(p => p.Marca)
                .IsRequired()
                .HasMaxLength(50);

            modelBuilder.Entity<Productos>()
                .Property(p => p.Descripcion)
                .IsRequired()
                .HasMaxLength(1000);

            modelBuilder.Entity<ProductosVariantes>()
                .Property(v => v.Stock)
                .IsRequired();

            modelBuilder.Entity<ProductosVariantes>()
                .Property(v => v.Precio)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<ProductosVariantes>()
                .Property(v => v.Descuento)
                .HasColumnType("decimal(5,2)");

            // Índices para mejorar el rendimiento
            modelBuilder.Entity<Productos>()
                .HasIndex(p => new { p.Marca, p.Nombre })
                .IsUnique();

            modelBuilder.Entity<ProductosVariantes>()
                .HasIndex(v => new { v.ProductoId, v.Ram, v.Almacenamiento, v.Color })
                .IsUnique();
        }
    }
}
