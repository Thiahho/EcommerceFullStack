namespace EcommerceFullStack.Data.Modelos
{
    public class Productos
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Marca { get; set; }
        public decimal Precio { get; set; }
        public decimal Descuento { get; set; }
        public string Descripcion { get; set; }
        public required byte[] Images { get; set; }
        public int CategoriaId { get; set; }
        public Categorias Categoria { get; set; }

        public required ICollection<ProductosVariantes> Variantes { get; set; }
    }
}
