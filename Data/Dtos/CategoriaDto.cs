using System.ComponentModel.DataAnnotations;

namespace EcommerceFullStack.Data.Dtos
{
    public class CategoriaDto
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public required string Nombre{ get; set; }
        
    }
}
