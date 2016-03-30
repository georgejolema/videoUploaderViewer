using System;
using System.Collections.Generic;
using System.Linq;

using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using projectTest.Models;
using Microsoft.AspNet.Authorization;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace projectTest.Controllers
{
    public class VideosController : Controller
    {
        ApplicationDbContext _context;
        
        public VideosController(ApplicationDbContext context)
        {
            _context = context;
        }
        // GET: /<controller>/
        [HttpGet]
        [AllowAnonymous]
        public IActionResult Index()
        {
            IEnumerable<Video> videos = _context.Video.ToArray();
            return View(videos);
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Watch(int videoId)
        {
            var video = _context.Video.FirstOrDefault(x => x.VideoId == videoId);
            return View(video);
        }
        
    }
}
