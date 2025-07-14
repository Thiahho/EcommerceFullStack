using AutoMapper;
using DrCell_V01.Data.Modelos;
using DrCell_V01.Data.Dtos;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Entidad -> DTO
        CreateMap<Productos, ProductoDto>().ReverseMap();
        CreateMap<ProductosVariantes, ProductosVariantesDto>().ReverseMap();
        // Agrega aquí todos los mapeos que necesites
        CreateMap<ProductoDto, Productos>()
            .ForMember(dest => dest.Img, opt => opt.MapFrom(src =>
                string.IsNullOrEmpty(src.Img) ? null : Convert.FromBase64String(src.Img)));

        CreateMap<Productos, ProductoDto>()
            .ForMember(dest => dest.Img, opt => opt.MapFrom(src =>
                src.Img != null ? Convert.ToBase64String(src.Img) : null));

    }
}
