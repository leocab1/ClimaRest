using climaREST.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace climaREST.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly Helper _helper;

        public HomeController(ILogger<HomeController> logger, Helper helper)
        {
            _logger = logger;
            _helper = helper;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }     

        public async Task<List<DatosRequeridosGeo>> AlmacenaDatosGeo(string Ciudad,string countrycode)
        {
            List<DatosRequeridosGeo> ListaGeo = new List<DatosRequeridosGeo>();
            ListaGeo = await _helper.ComsumeAPIDatosGeolocalizacion(Ciudad, countrycode);
            return ListaGeo;
        }
        public async Task<List<DatosRequeridos>> AlmacenaDatosClima(string latitud, string longitud)
        {
            List<DatosRequeridos> Lista = new List<DatosRequeridos>();
            Lista = await _helper.ComsumeAPIDatosClima(latitud, longitud);
            return Lista;
        }

        public string AlmacenaDatosGoogleMaps(string latitud, string longitud)
        {
            string url = _helper.ConsumeGoogleMapsAPI(latitud, longitud);
            return url;
        }

        public string AlmacenaDatosGasolinas(string ciudad)
        {
            string url = _helper.ConsumePrecioGas(ciudad);
            return url;
        }

        public async Task<IActionResult> AlmacenaDatosConversor(string bases, string target,double cantidad)
        {
            double res;
            res = await _helper.ComsumeAPIDatosConversor(bases, target, cantidad);
            return Json(new { res });
        }


    }
}
