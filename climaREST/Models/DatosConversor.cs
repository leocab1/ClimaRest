namespace climaREST.Models
{
    public class DatosConversor
    {
        public Dictionary<string, double> exchange_rates { get; set; }

    }

    public class Root
    {
        public string @base { get; set; }
        public int last_updated { get; set; }
        public Dictionary<string, double> exchange_rates { get; set; }
    }
}
