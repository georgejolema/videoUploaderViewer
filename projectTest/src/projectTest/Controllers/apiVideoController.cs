using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using projectTest.Models;
using Microsoft.Net.Http.Headers;
using System.Net.Http;
using Microsoft.AspNet.Http;
using System.IO;
using System.Net;
using System.Collections.Concurrent;
using Microsoft.ApplicationInsights;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace projectTest.Controllers
{
    [Route("api/[controller]")]
    public class apiVideoController : Controller
    {
        public BlobUtility blob;
        private static readonly ConcurrentQueue<StreamWriter> s_streamWriter = new ConcurrentQueue<StreamWriter>();
        private readonly TelemetryClient _telemetryClient;
        public apiVideoController(TelemetryClient telemetryClient)
        {
            _telemetryClient = telemetryClient;
            blob = new BlobUtility("container azure", "add your public key for your blob azure");

        }

        public async void Get(string fileName, string userName, bool ranges = false, int chunk = 0)
        {
            try {
                HttpContext.Response.ContentType = "video/mp4";
               // const string requestName = "api/apiVideoController";


                using (MemoryStream video = new MemoryStream())
                {
                    int chunksize = 1024;
                   
                    var blobData = blob.DownloadBlob(string.Format("{0}_{1}", userName, fileName), "testvideos");
                    _telemetryClient.TrackEvent("Retrieving video");
                    if (ranges)
                    {
                        blobData.DownloadRangeToStream(video, chunk * chunksize, chunksize);
                    }
                    else
                    {
                        blobData.DownloadToStream(video);
                    }

                    video.Seek(0, SeekOrigin.Begin);

                    await video.CopyToAsync(HttpContext.Response.Body);
                }
            }
            catch(Exception ex)
            {
                _telemetryClient.TrackEvent("Error");
            }

        }
        /* public async Task<IActionResult> Get(string fileName, string userName)
         {
             MemoryStream video = new MemoryStream();
             var blobData = blob.DownloadBlob(string.Format("{0}_{1}", userName, fileName), "testvideos");
             await blobData.DownloadToStreamAsync(video);
             video.Seek(0, SeekOrigin.Begin);
             return new FileResultFromStream(fileName, video, "video/mp4");
         }*/

    }

}
