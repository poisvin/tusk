# spec/models/task_note_linking_spec.rb
require 'rails_helper'

RSpec.describe 'Task-Note Linking', type: :model do
  describe 'Task' do
    it 'can have many linked notes' do
      task = create(:task)
      note1 = create(:note)
      note2 = create(:note)

      task.notes << note1
      task.notes << note2

      expect(task.notes).to contain_exactly(note1, note2)
    end
  end

  describe 'Note' do
    it 'can have many linked tasks' do
      note = create(:note)
      task1 = create(:task)
      task2 = create(:task)

      note.tasks << task1
      note.tasks << task2

      expect(note.tasks).to contain_exactly(task1, task2)
    end
  end

  describe 'bidirectional linking' do
    it 'reflects link from both sides' do
      task = create(:task)
      note = create(:note)

      task.notes << note

      expect(note.tasks).to include(task)
      expect(task.notes).to include(note)
    end
  end
end
