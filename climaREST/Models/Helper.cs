using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System.Runtime.InteropServices;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace climaREST.Models
{
    public class Helper
    {
        HttpMessageHandler HandlerClima;
        HttpMessageHandler HandlerGeo;
        HttpMessageHandler HandlerConv;

        public string Error { get; set; }
        string DirBase;
        string DirGeo;
        string DirConv;

        string StatusCode = "";
        Clima DatosClima;
        Root datosConversor;
        List<DatosGeolocalizacion> DatosGeo;
        List<DatosRequeridos> Lista = new List<DatosRequeridos>();
        List<DatosRequeridosGeo> ListaGeo = new List<DatosRequeridosGeo>();



        public async Task<List<DatosRequeridos>> ComsumeAPIDatosClima(string latitud, string longitud)
        {
            HandlerClima = new HttpClientHandler();
            DirBase = "https://api.openweathermap.org/data/2.5/weather";

            string SolicitudClienteURI = "?lat="+ latitud+ "&lon="+ longitud + "&appid=869ce7f75a3ac6d2082cff5147bf2442&units=metric&lang=es";
            try
            {
                using (var Cliente = new HttpClient(HandlerClima))
                {
                    Cliente.BaseAddress = new Uri(DirBase);
                    Cliente.DefaultRequestHeaders.Accept.Clear();
                    Cliente.DefaultRequestHeaders.Accept.Add(
                        new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue
                        ("application/Json"));

                    HttpResponseMessage respuesta = await Cliente.GetAsync($"{SolicitudClienteURI}");
                    StatusCode = respuesta.StatusCode.ToString();
                    respuesta.EnsureSuccessStatusCode();

                    if (respuesta.IsSuccessStatusCode)
                    {
                        var jsoncadena = await respuesta.Content.ReadAsStringAsync();
                        DatosClima = JsonConvert.DeserializeObject<Clima>(jsoncadena);

                        //Llenamos la lista, un solo elemento en la Lista
                        DatosRequeridos Dr = new DatosRequeridos
                        {
                            ClimaCiudad = DatosClima.name,
                            ClimaDescripcion = DatosClima.weather[0].description,
                            Temperatura = DatosClima.main.temp.ToString(),
                            Viento = DatosClima.wind.speed.ToString(),
                            PorcentajeNubes = DatosClima.clouds.all.ToString(),
                            PorcentajeHumedad = DatosClima.main.humidity.ToString(),
                            Imagen = "https://openweathermap.org/img/wn/" + DatosClima.weather[0].icon + "@2x.png",
                            Amanecer = DatosClima.sys.sunrise.ToString(),
                            Ocaso = DatosClima.sys.sunset.ToString()
                        };
                        Lista.Add(Dr);
                    }
                    else
                    {
                        Error = "Se ha producido un error al solicitar el Servicio Web";
                        throw new Exception();
                    }
                }
            }
            catch (Exception)
            {
                Error = StatusCode;
            }

            return (Lista);
        }


        public async Task<List<DatosRequeridosGeo>> ComsumeAPIDatosGeolocalizacion(string Ciudad,string countryCode)
        {
            HandlerGeo = new HttpClientHandler();
            DirGeo = $"https://nominatim.openstreetmap.org/search?q={Ciudad}&countrycodes={countryCode}&featureType=city&format=json";

            try
            {
                using (var Cliente = new HttpClient(HandlerGeo))
                {
                    Cliente.DefaultRequestHeaders.Accept.Clear();
                    Cliente.DefaultRequestHeaders.Accept.Add(
                        new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                    Cliente.DefaultRequestHeaders.Add("User-Agent", "MiAplicacion/1.0 (miemail@example.com)");

                    HttpResponseMessage respuesta = await Cliente.GetAsync(DirGeo);
                    respuesta.EnsureSuccessStatusCode();

                    if (respuesta.IsSuccessStatusCode)
                    {
                        var jsoncadena = await respuesta.Content.ReadAsStringAsync();
                        DatosGeo = JsonConvert.DeserializeObject<List<DatosGeolocalizacion>>(jsoncadena);

                        foreach (var item in DatosGeo)
                        {
                            DatosRequeridosGeo Dr = new DatosRequeridosGeo
                            {
                                name = item.name,
                                lat = item.lat,
                                lon = item.lon
                            };
                            ListaGeo.Add(Dr);
                        }
                    }
                    else
                    {
                        Error = "Se ha producido un error al solicitar el Servicio Web";
                        throw new Exception();
                    }
                }
            }
            catch (Exception)
            {
                Error = StatusCode;
            }

            return (ListaGeo);
        }

        public async Task<double> ComsumeAPIDatosConversor(string bases, string target, double cantidad)
        {
            double resultado = 0.0;
            HandlerConv = new HttpClientHandler();
            DirConv = $"https://exchange-rates.abstractapi.com/v1/live/?api_key=af1d0c64e67a48f1964c552319c28501&base={bases}&target={target}";

            try
            {
                using (var Cliente = new HttpClient(HandlerConv))
                {
                    Cliente.DefaultRequestHeaders.Accept.Clear();
                    Cliente.DefaultRequestHeaders.Accept.Add(
                        new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

                    HttpResponseMessage respuesta = await Cliente.GetAsync(DirConv);
                    respuesta.EnsureSuccessStatusCode();

                    if (respuesta.IsSuccessStatusCode)
                    {
                        var jsoncadena = await respuesta.Content.ReadAsStringAsync();
                        Console.WriteLine(jsoncadena);  // Para depurar la respuesta

                        var datosConversor = JsonConvert.DeserializeObject<Root>(jsoncadena);

                        // Verificar si exchange_rates contiene la clave target (moneda destino)
                        if (datosConversor?.exchange_rates != null && datosConversor.exchange_rates.ContainsKey(target))
                        {
                            var tasaDeCambio = datosConversor.exchange_rates[target];
                            resultado = tasaDeCambio * cantidad;
                        }
                        else
                        {
                            Error = "No se encontraron datos de tasas de cambio para la moneda especificada.";
                            throw new Exception("Datos no disponibles para la moneda de destino.");
                        }
                    }
                    else
                    {
                        Error = "Se ha producido un error al solicitar el Servicio Web";
                        throw new Exception("Error en la respuesta de la API.");
                    }
                }
            }
            catch (Exception ex)
            {
                Error = ex.Message;
                Console.WriteLine(ex.Message);  // Para depurar el error
            }

            return resultado;
        }


        public string ConsumeGoogleMapsAPI(string latitud, string longitud)
        {
             string datosUrlGoogle = $"https://maps.google.com/?ll={latitud},{longitud}&z=8&t=m&output=embed";
            return datosUrlGoogle;  
        }

        public string ConsumePrecioGas(string ciudad)
        {
            string ciudadFormat= ObtenerAbreviaturaEstado(ciudad);
            string datosUrlGasolinas = $"https://petrointelligence.com/api/api_precios.html?consulta=estado&estado={ciudadFormat}";
            return datosUrlGasolinas;
        }


        public string ObtenerAbreviaturaEstado(string estadoCompleto)
        {
            if (string.IsNullOrWhiteSpace(estadoCompleto))
            {
                return null; 
            }

            estadoCompleto = estadoCompleto.Trim();

            switch (estadoCompleto.ToLower())
            {
                case "aguascalientes":
                    return "AGS";
                case "baja california":
                    return "BC";
                case "baja california sur":
                    return "BCS";
                case "campeche":
                    return "CAMP";
                case "cdmx":
                case "ciudad de méxico":
                case "mexico city":
                    return "MX";
                case "chiapas":
                    return "CHIS";
                case "chihuahua":
                    return "CHIH";
                case "coahuila":
                case "coahuila de zaragoza":
                    return "COAH";
                case "colima":
                    return "COL";
                case "durango":
                    return "DGO";
                case "guanajuato":
                    return "GTO";
                case "guerrero":
                    return "GRO";
                case "hidalgo":
                    return "HGO";
                case "jalisco":
                    return "JAL";
                case "méxico":
                case "estado de méxico":
                    return "MEX";
                case "michoacán":
                case "michoacán de ocampo":
                    return "MICH";
                case "morelos":
                    return "MOR";
                case "nayarit":
                    return "NAY";
                case "nuevo leon":
                    return "NL";
                case "oaxaca":
                    return "OAX";
                case "puebla":
                    return "PUE";
                case "querétaro":
                    return "QRO";
                case "quintana roo":
                    return "QROO";
                case "san luis potosí":
                case "san luis potosi":
                    return "SLP";
                case "sinaloa":
                    return "SIN";
                case "sonora":
                    return "SON";
                case "tabasco":
                    return "TAB";
                case "tamaulipas":
                    return "TAMPS";
                case "tlaxcala":
                    return "TLAX";
                case "veracruz":
                case "veracruz de ignacio de la llave":
                    return "VER";
                case "yucatán":
                case "yucatan":
                    return "YUC";
                case "zacatecas":
                    return "ZAC";
                default:
                    return null; // Si no hay coincidencia
            }
        }

    }


}
