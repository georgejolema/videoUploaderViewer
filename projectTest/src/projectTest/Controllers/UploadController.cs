using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Authorization;
using Microsoft.AspNet.Http;
using System.IO;
using System.Net.Http.Headers;
using projectTest.Models;
using System.Security.Claims;
using Newtonsoft.Json.Linq;
using Microsoft.AspNet.Http.Internal;
using System.Text;
using System.Globalization;
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace projectTest.Controllers
{
    [Authorize]
    public class UploadController : Controller
    {
        private BlobUtility blob;
        ApplicationDbContext _context;
        public UploadController(ApplicationDbContext context)
        {
            _context = context;
            blob = new BlobUtility("container azure", "add your public key for your blob azure");
        }
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> UploadVideo(IFormFile file)
        {
            using (var reader = new StreamReader(file.OpenReadStream()))
            {
                var parsedContentDisposition = ContentDispositionHeaderValue.Parse(file.ContentDisposition);
                var name = parsedContentDisposition.FileName.Replace("\"", "");
                
                var result = await Task.Factory.StartNew(() => blob.UploadBlob(string.Format("{0}_{1}", User.GetUserName(), name), "testvideos", reader.BaseStream));
                if (result != null)
                {
                    var video = new Video
                    {
                        Name = name,
                        UserName = User.GetUserName()
                    };
                    _context.Add(video);
                    _context.SaveChanges();
                }

            }
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        public object UploadChunk(IFormFile file)
        {
            try {
                using (var reader = new StreamReader(file.OpenReadStream()))
                {
                    var parameters = HttpContext.Request.Form.ToArray();
                    var fileName = parameters[0].Value.ToString();
                    var chunkNo = parameters[1].Value.ToString().PadLeft(15,'0');
                    var isLast = Convert.ToBoolean(parameters[2].Value.ToString());
                    var blockIdBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(chunkNo.ToString(CultureInfo.InvariantCulture)));
                    var uploadBlob = blob.UploadBlob(string.Format("{0}_{1}", User.GetUserName(), fileName).ToLower(), "testvideos");
                    uploadBlob.PutBlock(blockIdBase64, reader.BaseStream, null);
                    if (isLast)
                    {
                        var blockList = new List<string>();
                        for (var i = 0; i < Convert.ToInt32(chunkNo); i++,blockList.Add(Convert.ToBase64String(Encoding.UTF8.GetBytes(i.ToString().PadLeft(15,'0').ToString(CultureInfo.InvariantCulture))))) ;
                        uploadBlob.PutBlockList(blockList);
                        var video = new Video
                        {
                            Name = fileName.ToLower(),
                            UserName = User.GetUserName()
                        };
                        _context.Add(video);
                        _context.SaveChanges();
                    }
                }
                return new { successful = true };
            }catch(Exception ex)
            {
                HttpContext.Response.StatusCode = 500;
                HttpContext.Response.Headers.Clear();
                return new { successful = false, stackTrace = ex.StackTrace };
            }
        }
      
    }
}
