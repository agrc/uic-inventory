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
    public class Command(WellInput input) : IRequest<Well> {
        public WellInput Input { get; } = input;
    }
    public class Handler(
      IAppDbContext context,
      IPublisher publisher,
      HasRequestMetadata metadata,
      ILogger log) : IRequestHandler<Command, Well> {
        private readonly IAppDbContext _context = context;
        private readonly IPublisher _publisher = publisher;
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;

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
    public class Command(WellOperatingStatusInput input) : IRequest<Well> {
        public int AccountId { get; init; } = input.AccountId;
        public int SiteId { get; init; } = input.SiteId;
        public int InventoryId { get; init; } = input.InventoryId;
        public int WellId { get; init; } = input.WellId;
        public string Status { get; init; } = input.Status;
        public string? Description { get; init; } = input.Description;
    }

    public class Handler(
      IAppDbContext context,
      IPublisher publisher,
      ILogger log) : IRequestHandler<Command, Well> {
        private readonly IAppDbContext _context = context;
        private readonly IPublisher _publisher = publisher;
        private readonly ILogger _log = log;

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
    public class Command(WellDetailInput input) : IRequest<Well> {
        public WellDetailInput Wells { get; } = input;
    }

    public class Handler(
      IAppDbContext context,
      IPublisher publisher,
      IConfiguration configuration,
      ICloudFileNamer fileNamer,
      CloudStorageService cloudService,
      ILogger log) : IRequestHandler<Command, Well> {
        private readonly string[] _acceptableFileTypes = new[] { "pdf", "png", "doc", "docx", "jpg", "jpeg" };
        private readonly IAppDbContext _context = context;
        private readonly IPublisher _publisher = publisher;
        private readonly ILogger _log = log;
        private readonly string _bucket = configuration.GetValue<string>("UPLOAD_BUCKET") ?? string.Empty;
        private readonly ICloudFileNamer _fileNamerService = fileNamer;
        private readonly CloudStorageService _client = cloudService;

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
    public class Command(WellInput input) : IRequest {
        public int AccountId { get; set; } = input.AccountId;
        public int SiteId { get; set; } = input.SiteId;
        public int InventoryId { get; } = input.InventoryId;
        public int WellId { get; set; } = input.WellId;
    }

    public class Handler(IAppDbContext context, IPublisher publisher, ILogger log) : IRequestHandler<Command> {
        private readonly IAppDbContext _context = context;
        private readonly IPublisher _publisher = publisher;
        private readonly ILogger _log = log;

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
    public class Command(WellFileInput input) : IRequest<Stream> {
        public string? File { get; set; } = input.File;
        public int SiteId { get; set; } = input.SiteId;
        public int InventoryId { get; } = input.InventoryId;
        public string? WellIdRange { get; set; } = input.WellIdRange;
    }

    public class Handler(IConfiguration configuration, CloudStorageService service, ILogger log) : IRequestHandler<Command, Stream> {
        private readonly string _bucket = configuration.GetValue<string>("STORAGE_BUCKET") ?? string.Empty;
        private readonly ILogger _log = log;
        private readonly CloudStorageService _client = service;

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
