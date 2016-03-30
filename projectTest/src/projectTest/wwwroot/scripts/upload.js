(function (iden)
{
    if (iden != 11) return;
    $(document).ready(function ()
    {
        var fileIndicator = $(".file-indicator");
        $('.file-list').empty();
        $("#txtFile").upload({
            chunkSize: 10,
            url: "/Upload/UploadChunk",
            maxFileSize: 10 * 1024 * 1024,
            maxNumFiles: 5,
            autoUpload: false,
            serializeJson: true,
            modestring64: false,
            //disallowedExtensions: ["exe", "js", "msi", "css"],//if allowed extensions is defined this will be ignored
            allowedExtensions: ["mp4"],
            additional: { param1: 1, param2: "hello" }, //you can add additional information to send to the server
            onfilesSelected: function (files)
            {
                for (var i = 0; i < files.length; i++) {
                    addFile(files[i]);
                }
                $('#btnUpload').attr("disabled", false);
            },
            onFinishedUploadingFiles: function (successful, error)
            {
                if (error.length == 0)
                    alert('files uploaded');
            },
            onFinishedUploadingFile: function (file)
            {
                $('.file-list').find('a[data-name="' + file.name + '"]').remove();
            },
            onChunkUploaded: function (file, chunkNo, uploaded)
            {
                $('li[data-name	="' + file.name + '"] .item-upload .progress-bar')
					.css("width", Math.floor((uploaded / file.size) * 100) + "%")
					.html(Math.floor((uploaded / file.size) * 100) + "%");
            },
            onStartedUploading: function (file)
            {
                $('#btnUpload').attr("disabled", true);
            }
        });
        $('#txtFile').upload('config', {
            onError: function (data)
            {
                $('li[data-name	="' + data.file.name + '"] .item-upload .progress-bar')
					.css("width", "100%")
                    .html('')
                    .addClass('progress-bar-danger');
                $('li[data-name	="' + data.file.name + '"]').find('.retry-button').removeClass('hidden');
                $('li[data-name	="' + data.file.name + '"]').find('.stop-button').addClass('hidden');
                $('li[data-name	="' + data.file.name + '"]').find('.pause-button').addClass('hidden');
                //it is possible to get the error as follow:
                //console.log(data.error);
            }
        })
        $('.add-files').click(function (ev)
        {
            ev.preventDefault();
            $('#txtFile').click();
        });
        $('#btnUpload').click(function (ev)
        {
            ev.preventDefault();
            var files = $('#txtFile').upload('getFilesList');
            var statusList = $('#txtFile').upload('status');
            for (var i = 0; i < files.length; i++)
                if (files[i].status == statusList.inserted) {
                    $('#txtFile').upload('upload');
                    var item = $('li[data-name]');
                    item.find('.delete-button').addClass('hidden');
                    item.find('.stop-button').removeClass('hidden');
                    item.find('.pause-button').removeClass('hidden');
                    return;
                }
            alert('There are no files to upload');
        }).attr("disabled", true);
        function addFile(file, index)
        {
            var newItem = fileIndicator.clone();
            newItem.attr('data-name', file.name);
            newItem.find('.name-container').html(file.name);
            newItem.find('a[data-name]').attr("data-name", file.name);
            newItem.find(".delete-button").click(function (ev)
            {
                ev.preventDefault();
                $('#txtFile').upload('deleteFile', file.name);
                $('.file-list').find('li[data-name="' + file.name + '"]').remove();
                var items = $('#txtFile').upload('getFilesList');
                var statusList = $('#txtFile').upload('status');
                $('#btnUpload').attr("disabled", true);
                for (var i = 0; i < items.length; i++) {
                    if (items[i].status == statusList.inserted) {
                        $('#btnUpload').attr("disabled", false);
                        break;
                    }
                }
            });
            newItem.find('.stop-button').click(function (ev)
            {
                ev.preventDefault();
                $('#txtFile').upload('stop', $(this).attr('data-name'));
                newItem.find('.progress-bar')
                    .css('width', '100%')
                    .html('')
                    .addClass('progress-bar-warning');
                newItem.find('a[data-name]').remove();

            });
            newItem.find('.pause-button').click(function (ev)
            {
                ev.preventDefault();
                $('#txtFile').upload('pause', $(this).attr('data-name'));
                $(this).addClass('hidden');
                newItem.find('.play-button').removeClass('hidden');
            });
            newItem.find('.play-button').click(function (ev)
            {
                ev.preventDefault();
                $('#txtFile').upload('resume', $(this).attr('data-name'));
                $(this).addClass('hidden');
                newItem.find('.pause-button').removeClass('hidden');
            });
            newItem.find('.retry-button').click(function (ev)
            {
                ev.preventDefault();
                var name = $(this).attr('data-name');
                $('#txtFile').upload('retry', name);
                $(this).addClass('hidden');
                newItem.find('.stop-button').removeClass('hidden');
                newItem.find('.pause-button').removeClass('hidden');
                newItem.find('.item-upload .progress-bar')
                    .removeClass('progress-bar-danger');
            });
            $('.file-list').append(newItem);
        }
    });
})(typeof iden == 'undefined' ? -1 : iden);