    public class ExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
    

        public ExceptionHandlerMiddleware(RequestDelegate next )
        {
            _next = next;
        }

        public async Task Invoke(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception exception)
            {
                System.IO.File.WriteAllText("Log.txt", exception.Message);
            }
    

           
        }
    }
