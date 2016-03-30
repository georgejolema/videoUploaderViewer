using Microsoft.AspNet.Mvc;
using System.IO;
using System.Threading.Tasks;


namespace projectTest.Models
{
    public class FileResultFromStream : ActionResult
    {
        public FileResultFromStream(string fileDownloadName, Stream fileStream, string contentType)
        {
            FileDownloadName = fileDownloadName;
            FileStream = fileStream;
            ContentType = contentType;
        }

        public string ContentType { get; private set; }
        public string FileDownloadName { get; private set; }
        public Stream FileStream { get; private set; }

        public async override Task ExecuteResultAsync(ActionContext context)
        {
            var response = context.HttpContext.Response;
            response.ContentType = ContentType;
            context.HttpContext.Response.Headers.Add("Content-Disposition", new[] { "attachment; filename=" + FileDownloadName });
            await FileStream.CopyToAsync(context.HttpContext.Response.Body);
        }
    }
}
