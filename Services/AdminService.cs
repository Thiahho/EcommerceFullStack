using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.Extensions.Logging;
using EcommerceFullStack.Data;
using EcommerceFullStack.Services.Interfaces;

namespace EcommerceFullStack.Services
{

    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly ILogger<AdminService> _logger;

        public AdminService(
            ApplicationDbContext applicationDbContext,
            IConfiguration configuration,
            ILogger<AdminService> logger)
        {
            _context = applicationDbContext;
        }

    }
}