using EcommerceFullStack.Data.Dtos;
using EcommerceFullStack.Data.Modelos;

namespace EcommerceFullStack.Services.Interfaces
{
    public interface IUsuarioService
    {
        Task<Usuarios?> ValidarCredencialesAsync(string email, string password);
        string GenerarToken(Usuarios usuario);
        Task<Usuarios?> ObtenerUsuarioPorEmailAsync(string email);
        Task<Usuarios> CrearUsuarioAsync(Usuarios usuario);
    }
}