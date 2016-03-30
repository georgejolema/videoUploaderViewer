(function ($)
{
    $.fn.upload = upload;
    //objects-------------------------------
    var statusList = {
        inserted: 0,
        uploading: 1,
        uploaded: 2,
        paused: 3,
        stopped: 4,
        error: -1
    };
    function upload(options, params)
    {
        var self = this;
        if (typeof options == "string") {
            var fileUploadModel = this[0].fileUploadModel;
            if (typeof fileUploadModel[options] == 'function')
                return fileUploadModel[options](params);
        }
        else {
            var fileUploadModel = this[0].fileUploadModel = new fileUploadModelObject(this, options);
        }
        return this;
    }

    function fileUploadModelObject(fileUploader, options)
    {
        this.files = [];

        var self = this;
        validateOptions(options);
        fileUploader.on('change', function (e)
        {
            var files = e.target.files;
            var selectedFiles = [];
            for (var i = 0; i < files.length; i++) {
                if (options.maxNumFiles != 0 && options.maxNumFiles <= self.files.length) break;
                if (!validateFile(files[i])) continue;
                buildFileChunkUploader(files[i]);
                selectedFiles.push(files[i]);
            }
            options.onfilesSelected(selectedFiles);
        });
        this.config = function (data)
        {
            for (var i in data) {
                options[i] = data[i];
            }
        }
        this.status = function ()
        {
            return statusList;
        }
        this.stop = function (fileName)
        {
            find(fileName, function (i) { self.files[i].stop(); });
        };
        this.pause = function (fileName)
        {
            find(fileName, function (i) { self.files[i].pause(); });
        };
        this.resume = function (fileName)
        {
            find(fileName, function (i) { self.files[i].resume(); });
        };
        this.retry = function (fileName)
        {
            find(fileName, function (i) { self.files[i].retry(); });
        };
        this.deleteFile = function (fileName)
        {
            find(fileName, function (i) { self.files.splice(i, 1); });
            return self.getFilesList();
        };

        this.getFilesList = function ()
        {
            var arr = [];
            for (var i = 0; i < self.files.length; i++) {
                arr.push(self.getFile(i));
            }
            return arr;
        };
        this.getFile = function (index)
        {
            if (index >= self.files.length) {
                alert('Error, index file does not exist');
                return null;
            }
            else {
                var file = self.files[index].file;
                var uploaded = self.files[index].chunkNo * 1024 * options.chunkSize;
                var status = self.files[index].status;
                if (uploaded > file.size) uploaded = file.size;
                return {
                    fileName: file.name,
                    size: file.size,
                    uploaded: uploaded,
                    dataFile: file,
                    status: status
                }
            }
        };

        this.upload = function ()
        {
            for (var i = 0; i < self.files.length; i++) {
                if (self.files[i].status == statusList.inserted)
                    self.files[i].upload();
            }
        }

        function find(name, fn)
        {
            for (var i = 0; i < self.files.length; i++) {
                if (self.files[i].file.name == name) {
                    fn(i);
                    break;
                }
            }
        }

        function validateFile(file)
        {
            if (options.maxFileSize != 0 && options.maxFileSize < file.size)
                return false;

            if (options.allowedExtensions.length > 0) {
                var extension = extractExtensions(file.name);
                for (var i = 0; i < options.allowedExtensions.length; i++) {
                    if (extension == options.allowedExtensions[i])
                        break;
                }
                if (i == options.allowedExtensions.length) return false;
            }
            else if (options.disallowedExtensions.length > 0) {
                var extension = extractExtensions(file.name);
                for (var i = 0; i < options.disallowedExtensions.length; i++) {
                    if (extension == options.disallowedExtensions[i])
                        return false;
                }
            }
            return true;
        }

        function validateOptions(options)
        {
            if (isNull(options.chunkSize)) options.chunkSize = 50;
            if (isNull(options.disallowedExtensions)) options.disallowedExtensions = [];
            if (isNull(options.allowedExtensions)) options.allowedExtensions = [];
            if (isNull(options.maxNumFiles)) options.maxNumFiles = 0;
            if (isNull(options.maxFileSize)) options.maxFileSize = 0;
            if (isNull(options.modestring64)) options.modestring64 = false;
            if (isNull(options.serializeJson)) options.serializeJson = false;
            if (isNull(options.autoUpload)) options.autoUpload = false;
            if (isNull(options.onStartedUploading)) options.onStartedUploading = function () { };
            if (isNull(options.onFinishedUploadingFile)) options.onFinishedUploadingFile = function () { };
            if (isNull(options.onFinishedUploadingFiles)) options.onFinishedUploadingFiles = function () { };
            if (isNull(options.onError)) options.onError = function () { };
            if (isNull(options.onChunkUploaded)) options.onChunkUploaded = function () { };
            if (isNull(options.onfilesSelected)) options.onfilesSelected = function () { };
            if (isNull(options.additional)) options.additional = {};
        }


        function buildFileChunkUploader(file)
        {
            var uploader = new fileChunks(file, options.chunkSize, options.modestring64);
            uploader
				.on('upload', function (blob, chunkNo, isLast)
				{
				    if (!options.modestring64) {
				        blob.append('isLast', isLast);
				        blob.append('additional', JSON.stringify(options.additional));
				    }
				    var def = $.Deferred();
				    $.ajax({
				        url: options.url,
				        method: 'POST',
				        data: options.modestring64 ? {
				            fileData: blob,
				            fileName: file.name,
				            chunk: chunkNo,
				            isLast: isLast,
				            additional: options.additional
				        } : blob,
				        processData: options.modestring64,
				        contentType: options.modestring64 ? 'application/x-www-form-urlencoded; charset=UTF-8' : options.modestring64,
				        success: function ()
				        {
				            def.resolve();
				        },
				        error: function (data)
				        {
				            def.reject(data);
				        }
				    });
				    return def.promise();
				})
				.on('filestartuploading', options.onStartedUploading)
				.on('fileuploaded', function (file)
				{
				    options.onFinishedUploadingFile(file);
				    var errorList = [];
				    var successfulList = [];
				    for (var i = 0; i < self.files.length; i++) {
				        var item = self.files[i];
				        if (item.status == statusList.uploading || item.status == statusList.inserted || item.status == statusList.paused)
				            return;
				        if (item.status == statusList.error)
				            errorList.push(file);
				        else
				            successfulList.push(file);
				    }
				    options.onFinishedUploadingFiles(successfulList, errorList);
				})
				.on('fileerror', options.onError)
				.on('chunkuploaded', options.onChunkUploaded)
				.on('deletefile', function (file)
				{
				    $.ajax({
				        url: options.url,
				        method: 'DELETE',
				        data: {
				            fileName: file.name,
				            additional: options.additional
				        }
				    });
				});
            self.files.push(uploader);
            if (options.autoUpload)
                uploader.upload();
            return uploader;
        }
    }

    function fileChunks(file, chunksize, mode64)
    {
        var fileChunkSize = chunksize * 1024, events = [],
			startChunk = -1, endChunk = 0, slice_method, endOfFile = false,
			pstart = -1, pend = 0;
        this.file = file;
        this.chunkNo = 0;
        if ('mozSlice' in file) slice_method = 'mozSlice';
        else if ('webkitSlice' in file) slice_method = 'webkitSlice';
        else slice_method = 'slice';
        this.status = statusList.inserted;
        this.on = function (name, fn)
        {
            events[name] = fn;
            return this;
        }

        var self = this;

        this.upload = function ()
        {
            if (self.status == statusList.stopped)
                events['deletefile'](self.file);
            if (self.status != statusList.inserted && self.status != statusList.uploading) return;
            if (self.chunkNo == statusList.inserted) {
                self.status = statusList.uploading;
                events['filestartuploading'](self.file);
            }
            if (moveNext())
                setTimeout(_upload, 200);
            else {
                self.status = statusList.uploaded;
                events['fileuploaded'](self.file);
            }
        }

        this.pause = function ()
        {
            self.status = statusList.paused;
        }

        this.resume = function ()
        {
            if (self.status != statusList.paused) return;
            self.status = statusList.uploading;
            self.upload();
        }

        this.retry = function ()
        {
            startChunk = pstart;
            endChunk = pend;
            if (self.status != statusList.error) return;
            self.status = statusList.uploading;
            self.upload();
        }

        this.stop = function ()
        {
            if (self.status == statusList.paused)
                events['deletefile'](self.file);
            self.status = statusList.stopped;
            events['fileuploaded'](self.file);
        }

        function _upload()
        {
            var chunk = self.file[slice_method](startChunk, endChunk);
            if (mode64) {
                var reader = new window.FileReader();
                reader.readAsDataURL(chunk);
                reader.onloadend = function ()
                {
                    var base64data = reader.result;
                    excecutePromise(base64data);
                }
            }
            else {
                var data = new FormData();
                data.append("file", chunk, "file");
                data.append("fileName", self.file.name);
                data.append("chunkNo", self.chunkNo + 1);
                excecutePromise(data);
            }

        }
        function excecutePromise(data)
        {
            events['upload'](data, ++self.chunkNo, endOfFile).then(function ()
            {
                var uploaded = self.chunkNo * fileChunkSize;
                events['chunkuploaded'](file, self.chunkNo, uploaded > file.size ? file.size : uploaded);
                self.upload();
            }, function (error)
            {
                self.status = statusList.error;
                events['fileerror']({ file: self.file, error: data });
            });
        }

        function moveNext()
        {
            pstart = startChunk;
            pend = endChunk;
            if (endChunk == file.size)
                return false;
            if (startChunk == -1) startChunk = 0
            else startChunk = endChunk;
            endChunk = endChunk + fileChunkSize;
            if (endChunk > file.size) endChunk = file.size;
            endOfFile = endChunk == file.size;
            return true;
        }

    }

    //methods---------------------------------
    function isNull(value)
    {
        return typeof value == "undefined";
    }

    function extractExtensions(name)
    {
        var regex = /\.[a-zA-Z0-9]+/g, cond = null, result = null;
        do {
            result = cond;
            cond = regex.exec(name);
        } while (cond != null);
        return result != null ? result[0].substring(1) : null;
    }
})(jQuery);