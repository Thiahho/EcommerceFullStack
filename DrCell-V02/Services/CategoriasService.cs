﻿using AutoMapper;
using DrCell_V02.Data;
using DrCell_V02.Data.Dtos;
using DrCell_V02.Data.Modelos;
using DrCell_V02.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace DrCell_V02.Services
{
    public class CategoriasService : ICategoriaService
    {
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _dbContext;

        public CategoriasService(IMapper mapper, ApplicationDbContext applicationDbContext)
        {
            _dbContext = applicationDbContext;
            _mapper = mapper;
        }

        public async Task<CategoriaDto> AddCategoriaAsync(CategoriaDto categoriaDto)
        {
            var categoria = _mapper.Map<Categorias>(categoriaDto);
            await _dbContext.Categorias.AddAsync(categoria);
            await _dbContext.SaveChangesAsync();
            return _mapper.Map<CategoriaDto>(categoria);
        }

        public async Task DeleteCategoriaAsync(int id)
        {
            var categoria = await _dbContext.Categorias.FindAsync(id);
            if (categoria != null)
            {
                _dbContext.Categorias.Remove(categoria);
                await _dbContext.SaveChangesAsync();
            }
            else
            {
                throw new KeyNotFoundException($"Categoria with id {id} not found.");
            }
        }

        public async Task<IEnumerable<CategoriaDto>> GetAllCategoriasAsync()
        {
            var cate = await _dbContext.Categorias.AsNoTracking().ToListAsync();
            return _mapper.Map<List<CategoriaDto>>(cate);
        }

        public async Task<CategoriaDto> GetCategoriaByIdAsync(int id)
        {
            var cate = await _dbContext.Categorias.FirstOrDefaultAsync(c => c.Id == id);

            if (cate == null) return null;

            return new CategoriaDto
            {
                Id = cate.Id,
                Nombre = cate.Nombre
            };

        }


        public async Task UpdateCategoriaAsync(CategoriaDto categoriaDto)
        {
            var categorias = await _dbContext.Categorias.FirstOrDefaultAsync(c => c.Id == categoriaDto.Id);

            if (categorias != null)
            {
                categorias.Nombre = categoriaDto.Nombre;
                _dbContext.Categorias.Update(categorias);
                await _dbContext.SaveChangesAsync();

            }

        }
    }
}
