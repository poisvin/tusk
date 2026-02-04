# Note Attachments Design

**Date:** 2026-02-04
**Status:** Approved

## Overview

Add file attachment capability to Notes using Active Storage with local disk storage (easily migrated to cloud later).

## Requirements

- Any file type allowed
- Multiple files per note
- Local disk storage (migration path to S3/GCS)
- Drag & drop UI with browse button fallback

## Storage

**Active Storage with local disk service:**

```ruby
# config/storage.yml
local:
  service: Disk
  root: <%= Rails.root.join("storage") %>
```

**Note model:**
```ruby
class Note < ApplicationRecord
  has_many_attached :attachments
  # ... existing code
end
```

**Migration to cloud (future):**
```yaml
# config/storage.yml
amazon:
  service: S3
  bucket: your-bucket
  region: us-east-1
  access_key_id: <%= ENV['AWS_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['AWS_SECRET_ACCESS_KEY'] %>
```

Then change `config.active_storage.service = :amazon` in environment config.

## API Endpoints

### Existing endpoints enhanced

- `POST /api/v1/notes` - Create note with attachments (multipart form)
- `PATCH /api/v1/notes/:id` - Add more attachments
- `GET /api/v1/notes/:id` - Response includes attachments array

### New endpoint

- `DELETE /api/v1/notes/:id/attachments/:attachment_id` - Remove single attachment

### Note response format

```json
{
  "id": 1,
  "title": "Meeting notes",
  "content": "<p>Discussion points...</p>",
  "category": "work",
  "attachments": [
    {
      "id": 123,
      "filename": "screenshot.png",
      "content_type": "image/png",
      "byte_size": 45000,
      "url": "/rails/active_storage/blobs/..."
    }
  ],
  "linked_tasks": [],
  "tags": []
}
```

## UI Design

### Attachments Section in NoteModal

Location: After Content editor, before Linked Tasks section

```
┌─────────────────────────────────────────┐
│ Attachments                             │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │     📁 Drop files here          │    │
│  │     or click to browse          │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│  📄 report.pdf (2.3 MB)         [x]     │
│  🖼️ screenshot.png (450 KB)     [x]     │
│  📎 data.csv (12 KB)            [x]     │
└─────────────────────────────────────────┘
```

**Behavior:**
- Dashed border drop zone
- Click anywhere in zone to open file picker
- File icon based on type (image, PDF, generic)
- Display filename + human-readable size
- [x] button to remove attachment
- Images show small thumbnail preview (optional enhancement)

### File Icons

| Type | Icon |
|------|------|
| Images (png, jpg, gif, webp) | `image` |
| PDF | `picture_as_pdf` |
| Other | `attach_file` |

## Out of Scope

- File type restrictions
- File size limits
- Image editing/cropping
- Attachment previews in note list view
- Attachment search
