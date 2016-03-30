(function (iden)
{
    if (iden != 10) return;
    $(document).ready(function ()
    {
        var userName = $(".userName").val();
        var fileName = $(".fileName").val();

        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhr.open('GET', "/api/apiVideo?userName=" + userName + "&fileName=" + fileName, true);
        xhr.responseType = 'blob';

        xhr.onload = function (e)
        {
            if (this.status == 200) {
                // get binary data as a response
                var blob = this.response;
                readFile(blob);
            }
        };


        xhr.send();

        $("#myvideo").on("canplay", function ()
        {
            $(this).removeClass("hidden");
            $("#wait").addClass("hidden");
        });
    })

    function readFile(blob)
    {
        var reader = new FileReader();
        reader.onloadend = function (evt)
        {
            if (evt.target.readyState == FileReader.DONE) {                
                var player = document.getElementById('myvideo');
                player.src = "data:video/mp4;base64," + btoa(evt.target.result);
                player.load();
                player.play();
            }
        }
        reader.readAsBinaryString(blob);
    }
})(typeof iden=='undefined'?-1:iden);