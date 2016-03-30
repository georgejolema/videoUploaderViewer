using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace projectTest.Models
{
    public class Video
    {
        [Key]
        public int VideoId { get; set; }
        public string Name { get; set; }
        public string UserName { get; set; }
    }
}
