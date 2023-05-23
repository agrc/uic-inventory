using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace api.Features;
public static class CreateWell {
    public class Command : IRequest<Well> {
        public Command(WellInput input) {
            Input = input;
        }

        public WellInput Input { get; }
    }
    public class Handler : IRequestHandler<Command, Well> {
        private readonly IAppDbContext _context;
        private readonly IPublisher _publisher;
        private readonly ILogger _log;
        private readonly HasRequestMetadata _metadata;

        public Handler(
          IAppDbContext context,
          IPublisher publisher,
          HasRequestMetadata metadata,
          ILogger log) {
            _context = context;
            _publisher = publisher;
            _log = log;
            _metadata = metadata;
        }
        public async Task<Well> Handle(Command message, CancellationToken cancellationToken) {
            _log.ForContext("input", message)
              .Debug("Creating well");

            var well = new Well {
                AccountFk = message.Input.AccountId,
                SiteFk = message.Input.SiteId,
                InventoryFk = message.Input.InventoryId,
                WellName = message.Input.Construction,
                Status = message.Input.Status,
                Description = message.Input.Description,
                Quantity = message.Input.Quantity,
                Geometry = message.Input.Geometry,
                SubClass = _metadata.Inventory.SubClass,
                RemediationType = message.Input.RemediationType,
                RemediationDescription = message.Input.RemediationDescription,
                RemediationProjectId = message.Input.RemediationProjectId,
            };

            var result = await _context.Wells.AddAsync(well, cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);

            well.Id = result.Entity.Id;

            Task.WaitAll(new Task[] {
                _publisher.Publish(new WellNotifications.WellCreationNotification(well), cancellationToken),
                _publisher.Publish(new InventoryNotifications.EditNotification(message.Input.InventoryId), cancellationToken)
            }, cancellationToken: cancellationToken);

            return well;
        }
    }
}

public static class UpdateWell {
    public class Command : IRequest<Well> {
        public Command(WellOperatingStatusInput input) {
            AccountId = input.AccountId;
            SiteId = input.SiteId;
            InventoryId = input.InventoryId;
            WellId = input.WellId;
            Status = input.Status;
            Description = input.Description;
        }

        public int AccountId { get; init; }
        public int SiteId { get; init; }
        public int InventoryId { get; init; }
        public int WellId { get; init; }
        public string Status { get; init; }
        public string? Description { get; init; }
    }

    public class Handler : IRequestHandler<Command, Well> {
        private readonly IAppDbContext _context;
        private readonly IPublisher _publisher;
        private readonly ILogger _log;
        public Handler(
          IAppDbContext context,
          IPublisher publisher,
          ILogger log) {
            _context = context;
            _publisher = publisher;
            _log = log;
        }
        public async Task<Well> Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Updating well");

            var well = await _context.Wells
                .Include(x => x.Account)
                .Include(x => x.Inventory)
                .FirstAsync(w => w.Id == request.WellId, cancellationToken);

            var oldStatus = well.Status ?? string.Empty;

            well.Status = request.Status;
            if (request.Description is not null) {
                well.Description = request.Description;
            }

            await _context.SaveChangesAsync(cancellationToken);

            await _publisher.Publish(new WellNotifications.WellStatusEditNotification(well, oldStatus), cancellationToken);

            return well;
        }
    }
}

public static class UpdateWellDetails {
    public class Command : IRequest<Well> {
        public Command(WellDetailInput input) {
            Wells = input;
        }

        public WellDetailInput Wells { get; }
    }

    public class Handler : IRequestHandler<Command, Well> {
        private readonly string[] _acceptableFileTypes = new[] { "pdf", "png", "doc", "docx", "jpg", "jpeg" };
        private readonly IAppDbContext _context;
        private readonly IPublisher _publisher;
        private readonly ILogger _log;
        private readonly string _bucket;
        private readonly ICloudFileNamer _fileNamerService;
        private readonly CloudStorageService _client;

        public Handler(
          IAppDbContext context,
          IPublisher publisher,
          IConfiguration configuration,
          ICloudFileNamer fileNamer,
          CloudStorageService cloudService,
          ILogger log) {
            _context = context;
            _publisher = publisher;
            _log = log;
            _fileNamerService = fileNamer;
            _client = cloudService;
            _bucket = configuration.GetValue<string>("UPLOAD_BUCKET") ?? string.Empty;
        }
        public async Task<Well> Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Updating well details");

            var errors = new List<string>(2);

            var wells = await _context.Wells
              .Where(x => request.Wells.SelectedWells.Contains(x.Id))
              .ToListAsync(cancellationToken);

            var site = request.Wells.SiteId;
            var inventory = request.Wells.InventoryId;
            var uploader = request.Wells.AccountId;

            if (request.Wells.ConstructionDetailsFile != null || request.Wells.InjectateCharacterizationFile != null) {
                if (request.Wells.ConstructionDetailsFile != null) {
                    var fileType = request.Wells.ConstructionDetailsFile.FileName.Split('.').Last().ToLower();

                    if (_acceptableFileTypes.Contains(fileType)) {
                        try {
                            var wellRange = _fileNamerService.CreateRangeFromArray(request.Wells.SelectedWells);

                            var constructionFile = $"site_{site}/inventory_{inventory}/well_{wellRange}/construction_{uploader}.{fileType}";

                            await _client.AddObjectAsync(_bucket,
                              constructionFile,
                              request.Wells.ConstructionDetailsFile.ContentType,
                              request.Wells.ConstructionDetailsFile.OpenReadStream(),
                              cancellationToken
                            );

                            request.Wells.ConstructionDetails = $"file::{wellRange}_construction.{fileType}";
                        } catch (Exception e) {
                            const string message = "Error uploading construction file";

                            _log.ForContext("site", request.Wells.SiteId)
                                .ForContext("inventory", request.Wells.InventoryId)
                                .ForContext("account", request.Wells.AccountId)
                                .ForContext("fileType", fileType)
                                .Error(e, message);

                            errors.Add(message);
                        }
                    } else {
                        errors.Add($"The file type must be one of `{string.Join(", ", _acceptableFileTypes)}`");
                    }
                }

                if (request.Wells.InjectateCharacterizationFile != null) {
                    var fileType = request.Wells.InjectateCharacterizationFile.FileName.Split('.').Last().ToLower();

                    if (_acceptableFileTypes.Contains(fileType)) {
                        try {
                            var wellRange = _fileNamerService.CreateRangeFromArray(request.Wells.SelectedWells);

                            var injectateFile = $"site_{site}/inventory_{inventory}/well_{wellRange}/injectate_{uploader}.{fileType}";

                            await _client.AddObjectAsync(_bucket,
                              injectateFile,
                              request.Wells.InjectateCharacterizationFile.ContentType,
                              request.Wells.InjectateCharacterizationFile.OpenReadStream(),
                              cancellationToken
                            );

                            request.Wells.InjectateCharacterization = $"file::{wellRange}_injectate.{fileType}";
                        } catch (Exception e) {
                            const string message = "Error uploading injectate file";

                            _log.ForContext("site", request.Wells.SiteId)
                                .ForContext("inventory", request.Wells.InventoryId)
                                .ForContext("account", request.Wells.AccountId)
                                .ForContext("fileType", fileType)
                                .Error(e, message);

                            errors.Add(message);
                        }
                    } else {
                        errors.Add($"The file type must be one of `{string.Join(", ", _acceptableFileTypes)}`");
                    }
                }
            }

            foreach (var well in wells) {
                request.Wells.Update(well);
            }

            await _context.SaveChangesAsync(cancellationToken);

            await _publisher.Publish(new InventoryNotifications.EditNotification(request.Wells.InventoryId), cancellationToken);

            if (errors.Count > 0) {
                throw new InvalidOperationException(string.Join("\n", errors));
            }

            return new Well();
        }
    }
}

public static class DeleteWell {
    public class Command : IRequest {
        public Command(WellInput input) {
            AccountId = input.AccountId;
            SiteId = input.SiteId;
            InventoryId = input.InventoryId;
            WellId = input.WellId;
        }

        public int AccountId { get; set; }
        public int SiteId { get; set; }
        public int InventoryId { get; }
        public int WellId { get; set; }
    }

    public class Handler : IRequestHandler<Command> {
        private readonly IAppDbContext _context;
        private readonly IPublisher _publisher;
        private readonly ILogger _log;

        public Handler(IAppDbContext context, IPublisher publisher, ILogger log) {
            _context = context;
            _publisher = publisher;
            _log = log;
        }
        async Task IRequestHandler<Command>.Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Deleting well");

            var well = await _context.Wells
              .FirstAsync(s => s.Id == request.WellId, cancellationToken);

            _context.Wells.Remove(well);

            //! TODO: create requirement that well cannot be deleted when authorized status

            await _context.SaveChangesAsync(cancellationToken);

            await _publisher.Publish(new InventoryNotifications.EditNotification(request.InventoryId), cancellationToken);

            return;
        }
    }
}

public static class GetWellFiles {
    public class Command : IRequest<Stream> {
        public Command(WellFileInput input) {
            SiteId = input.SiteId;
            InventoryId = input.InventoryId;
            WellIdRange = input.WellIdRange;
            File = input.File;
        }

        public string? File { get; set; }
        public int SiteId { get; set; }
        public int InventoryId { get; }
        public string? WellIdRange { get; set; }
    }

    public class Handler : IRequestHandler<Command, Stream> {
        private readonly string _bucket;
        private readonly ILogger _log;
        private readonly CloudStorageService _client;

        public Handler(IConfiguration configuration, CloudStorageService service, ILogger log) {
            _log = log;
            _bucket = configuration.GetValue<string>("STORAGE_BUCKET") ?? string.Empty;
            _client = service;
        }
        async Task<Stream> IRequestHandler<Command, Stream>.Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Fetching well files");

            if (string.IsNullOrEmpty(request.File)) {
                throw new ArgumentNullException(request.File, "Invalid url");
            }

            var prefix = $"site_{request.SiteId}/inventory_{request.InventoryId}/well_{request.WellIdRange}";
            var parts = request.File.Split('.');
            var type = parts[0].ToLower();
            var match = $"{prefix}/{type}";

            var stream = await _client.DownloadObjectAsync(_bucket, prefix, match, cancellationToken);
            if (stream == null) {
                throw new FileNotFoundException("If this file was just uploaded it is being scanned for malware. " +
                  "Please try again in a few moments. Otherwise, the upload was either flagged as malware and removed " +
                  "or something went terribly wrong.");
            }

            return stream;
        }
    }
}
