using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Google.Cloud.Storage.V1;
using Serilog;

namespace api.Features;
public class CloudStorageService {
    private readonly ILogger _log;
    private readonly StorageClient _client;
    public CloudStorageService(ILogger log) {
        _log = log;
        _client = StorageClient.Create();
    }

    public async Task RemoveObjectsAsync(string bucket, string matchPattern, CancellationToken token) {
        var success = true;
        try {
            await foreach (var item in _client.ListObjectsAsync(bucket, matchPattern)) {
                _log.Debug("Deleting {item}", item.Name);

                try {
                    await _client.DeleteObjectAsync(item, cancellationToken: token);
                } catch (Exception ex) {
                    _log.ForContext("bucket", bucket)
                      .ForContext("pattern", matchPattern)
                      .ForContext("exception", ex)
                      .Error("Failed to remove {item}", item.Name);
                    success = false;
                }
            }
        } catch (Exception ex) {
            _log.ForContext("bucket", bucket)
              .ForContext("pattern", matchPattern)
              .ForContext("exception", ex)
              .Error("Failed to list cloud storage files");
        }

        if (success) {
            _log.ForContext("bucket", bucket)
              .ForContext("pattern", matchPattern)
              .Debug("Removed cloud storage files");
        }
    }
    public async Task AddObjectAsync(string bucket, string objectName, string contentType, Stream content, CancellationToken token) {
        var success = true;
        try {
            await _client.UploadObjectAsync(bucket, objectName, contentType, content, cancellationToken: token);
        } catch (Exception ex) {
            _log.ForContext("bucket", bucket)
              .ForContext("objectName", objectName)
              .ForContext("contentType", contentType)
              .ForContext("exception", ex)
              .Error("Failed to add {objectName}", objectName);
            success = false;
        }

        if (success) {
            _log.ForContext("bucket", bucket)
              .ForContext("objectName", objectName)
              .Debug("Added cloud storage file");
        }
    }
    public async Task<Stream?> DownloadObjectAsync(string bucket, string prefix, string match, CancellationToken token) {
        await foreach (var file in _client.ListObjectsAsync(bucket, prefix)) {
            if (!file.Name.Contains(match)) {
                continue;
            }

            var stream = new MemoryStream();

            await _client.DownloadObjectAsync(bucket, file.Name, stream, cancellationToken: token);

            await stream.FlushAsync(token);
            stream.Seek(0, SeekOrigin.Begin);

            return stream;
        }

        return Stream.Null;
    }
}
