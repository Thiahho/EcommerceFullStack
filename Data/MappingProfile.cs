using AutoMapper;
using EcommerceFS.Data.Dtos;
using EcommerceFS.Data.Modelos;

namespace EcommerceFS.Data
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Mapeo de Productos
            CreateMap<Productos, ProductoDto>()
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src => 
                    src.Images != null ? Convert.ToBase64String(src.Images) : null))
                .ForMember(dest => dest.Variantes, opt => opt.MapFrom(src => src.Variantes));

            CreateMap<ProductoDto, Productos>()
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src => 
                    !string.IsNullOrEmpty(src.Images) ? Convert.FromBase64String(src.Images) : null))
                .ForMember(dest => dest.Variantes, opt => opt.Ignore());

            // Mapeo de ProductosVariantes
            CreateMap<ProductosVariantes, ProductosVariantesDto>();
            CreateMap<ProductosVariantesDto, ProductosVariantes>();

            // Mapeo de Categorias
            CreateMap<Categorias, CategoriaDto>();
            CreateMap<CategoriaDto, Categorias>();
        }
    }
}
