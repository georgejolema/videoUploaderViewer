# videoUploaderViewer
This project uses the latest technology that Microsoft is still developing. Below I detail the features that the project has:

* Uses ASP.Net.core and MVC 6 for the server-side Code.
* It is implementing Entity Framework 7 with Identity for the user authentication.
* It can easly be connected to an Azure database (which it is actually the first place I implemented it)
* It accesses a blob storage from Azure to store videos and it uploads them without caching data in the web server.
* It sends telemetry to application insights of Azure.
* It uses HTML5 for the video rendering and uses javascript to feed the video control.

This project was created only for development and research purposes and you are free to use, copy and produce with this project.

## How to implement
* Clone the repository to your local environment.
* Localize the controllers apiVideoController.cs and UploadController.cs and you will find some placeholders where you can specify a blob storage from an azure account.

```
 blob = new BlobUtility("container azure", "add your public key for your blob azure");
```
* Build the application and run the configuration tools of Entity Framework with the following commands:
```
dnu restore
dnvm use 1.0.0-rc1-final -p
dnx ef migrations add Initial
dnx ef database update
```
