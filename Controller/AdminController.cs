using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using EcommerceFullStack.Data;
using EcommerceFullStack.Services.Interfaces;
using EcommerceFullStack.Data.Modelos;
using EcommerceFullStack.Data.Dtos;
namespace EcommerceFullStack.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    //[EnableRateLimiting("AuthPolicy")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IProductoService _productoService;
        private readonly ICategoriaService _categoriaService;
        private readonly ILogger<AdminController> _logger;
        public AdminController(ApplicationDbContext context, IConfiguration config, IProductoService productoService, ICategoriaService categoriaService, ILogger<AdminController> logger)
        {
            _context = context;
            _configuration = config;
            _productoService = productoService;
            _categoriaService = categoriaService;
            _logger = logger;
        }


    }
}
