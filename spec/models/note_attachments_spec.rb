require 'rails_helper'

RSpec.describe 'Note Attachments', type: :model do
  describe 'attachments' do
    it 'can have multiple attachments' do
      note = create(:note)

      note.attachments.attach(
        io: StringIO.new("file content"),
        filename: "test.txt",
        content_type: "text/plain"
      )
      note.attachments.attach(
        io: StringIO.new("another file"),
        filename: "test2.txt",
        content_type: "text/plain"
      )

      expect(note.attachments.count).to eq(2)
    end

    it 'destroys attachments when note is destroyed' do
      note = create(:note)
      note.attachments.attach(
        io: StringIO.new("file content"),
        filename: "test.txt",
        content_type: "text/plain"
      )

      attachment_id = note.attachments.first.id
      note.destroy

      expect(ActiveStorage::Attachment.exists?(attachment_id)).to be false
    end
  end
end
