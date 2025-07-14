using DrCell_V01.Data;
using DrCell_V01.Data.Modelos;
using DrCell_V01.Data.Vistas;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace DrCell_V01.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext applicationDb)
        {
            _context = applicationDb;
        }

        public IActionResult Index()
        {
            var Marcas = _context.Celulares.Select(c => c.marca).Where(m => !string.IsNullOrEmpty(m)).Distinct().ToList();
            ViewBag.marca = Marcas;
            var viewModel = new PresupuestoConsultaViewModel();
            return View(viewModel);
        }

        [HttpPost]
        public IActionResult Buscar(PresupuestoConsultaViewModel modelo)
        {
            // Buscar módulos
            var modulos = _context.Modulos
                .Where(x => x.marca == modelo.Marca && x.modelo == modelo.Modelo)
                .Select(m => new ModuloOpcionViewModel
                {
                    Color = m.color ?? "",
                    Tipo = m.tipo ?? "",
                    ConMarco = m.marco,
                    Arreglo = m.arreglo
                }).ToList();

            modelo.ModuloOpciones = modulos;

            if (modulos.Count == 1)
            {
                modelo.ArregloModuloSeleccionado = modulos[0].Arreglo;
            }

            // Buscar batería
            var bateria = _context.Baterias
                .FirstOrDefault(x => x.marca == modelo.Marca && x.modelo == modelo.Modelo);
            modelo.ArregloBateria = bateria?.arreglo;

            // Buscar pin
            var pin = _context.Pines
                .FirstOrDefault(x => x.marca == modelo.Marca && x.modelo == modelo.Modelo);
            modelo.ArregloPin = pin?.arreglo;

            // Guardar presupuesto completo en sesión
            var jsonString = JsonSerializer.Serialize(modelo);
            HttpContext.Session.SetString("Presupuesto", jsonString);

            ViewBag.Marcas = _context.Celulares.Select(c => c.marca).Where(m => !string.IsNullOrEmpty(m)).Distinct().ToList();
            return View("Index", modelo);
        }

        // Nueva acción para mostrar el resumen desde sesión
        [HttpGet]
        public IActionResult Resumen()
        {
            var jsonString = HttpContext.Session.GetString("Presupuesto");
            if (string.IsNullOrEmpty(jsonString))
            {
                return RedirectToAction("Index");
            }

            var modelo = JsonSerializer.Deserialize<PresupuestoConsultaViewModel>(jsonString);
            if (modelo == null)
            {
                return RedirectToAction("Index");
            }

            return View(modelo);
        }

        [HttpGet]
        public JsonResult ObtenerModelos(string Marca)
        {
            var modelos = _context.Celulares
                .Where(c => c.marca == Marca)
                .Select(c => c.modelo)
                .Where(m => !string.IsNullOrEmpty(m))
                .Distinct()
                .ToList();

            return Json(modelos);
        }
    }
}
